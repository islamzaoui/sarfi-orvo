import type { Handle, Invalid } from '@sveltejs/kit';

import { sha1 } from '@oslojs/crypto/sha1';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { dev } from '$app/environment';
import { getRequestEvent } from '$app/server';
import { JWT_SECRET } from '$env/static/private';
import { jwtVerify, SignJWT } from 'jose';
import { redirect } from 'sveltekit-flash-message/server';

import type { LoginBody, RegisterBody } from '@/schemas/auth.schema';
import type { ISessionRepo } from '@/server/repos/session.repo';
import type { IUserRepo } from '@/server/repos/user.repo';
import type { ISessionWithUser, Session } from '@/server/types/session.types';

import { createServiceIdentifier, inject, Scoped, useService } from '@/server/di';
import { SessionRepoId } from '@/server/repos/session.repo';
import { UserRepoId } from '@/server/repos/user.repo';
import { tryCatch } from '@/utils/trycatch';

export interface IAuthService {
	readonly session: ISessionWithUser | null;
	register: (body: RegisterBody, invalid: Invalid<RegisterBody>) => Promise<void>;
	login: (body: LoginBody, invalid: Invalid<LoginBody>) => Promise<void>;
	verifySession: () => Promise<void>;
	getClientSession: () => Session | null;
	logout: () => Promise<void>;
}

export const AuthServiceId = createServiceIdentifier<IAuthService>();

type SessionName = 'session-token' | 'session-jwt';

@Scoped(AuthServiceId)
export class AuthService implements IAuthService {
	private _session: ISessionWithUser | null = null;

	private readonly JWT_EXPIRES_IN_SECONDS = 60 * 5; // 5 minutes
	private readonly SECRET = new TextEncoder().encode(JWT_SECRET);

	constructor(
		@inject(UserRepoId) private readonly userRepo: IUserRepo,
		@inject(SessionRepoId) private readonly sessionRepo: ISessionRepo
	) {}

	public static handle: Handle = async ({ event, resolve }) => {
		await useService(AuthServiceId).verifySession();
		return resolve(event);
	};

	private readonly cookie = {
		get: (name: SessionName): string | null => getRequestEvent().cookies.get(name) ?? null,
		set: (name: SessionName, value: string) =>
			getRequestEvent().cookies.set(name, value, {
				path: '/',
				sameSite: 'strict',
				httpOnly: true,
				secure: !dev,
				maxAge:
					name === 'session-token'
						? this.sessionRepo.INACTIVE_TIMEOUT_IN_SECONDS
						: this.JWT_EXPIRES_IN_SECONDS,
			}),
		delete: (name: SessionName) => getRequestEvent().cookies.delete(name, { path: '/' }),
	};

	private readonly jwt = {
		sign: (session: ISessionWithUser) => {
			const now = Date.now();
			return new SignJWT({ session })
				.setProtectedHeader({ alg: 'HS256' })
				.setExpirationTime(now + this.JWT_EXPIRES_IN_SECONDS * 1000)
				.setNotBefore(now)
				.sign(this.SECRET);
		},
		verify: async (token: string): Promise<ISessionWithUser | null> => {
			const result = await tryCatch(jwtVerify(token, this.SECRET));
			if (result.error) {
				return null;
			}

			return result.data.payload.session as ISessionWithUser;
		},
	};

	private readonly password = {
		async hash(password: string): Promise<string> {
			const encoder = new TextEncoder();
			const passwordBytes = encoder.encode(password);
			const salt = crypto.getRandomValues(new Uint8Array(16));

			const key = await crypto.subtle.importKey('raw', passwordBytes, 'PBKDF2', false, [
				'deriveBits',
			]);

			const hash = await crypto.subtle.deriveBits(
				{
					name: 'PBKDF2',
					salt,
					iterations: 100000,
					hash: 'SHA-256',
				},
				key,
				256
			);

			const combined = new Uint8Array(salt.length + hash.byteLength);
			combined.set(salt);
			combined.set(new Uint8Array(hash), salt.length);
			return btoa(String.fromCharCode(...combined));
		},

		async verify(storedHash: string, password: string): Promise<boolean> {
			try {
				const encoder = new TextEncoder();
				const passwordBytes = encoder.encode(password);
				const combined = Uint8Array.from(atob(storedHash), (c) => c.charCodeAt(0));
				const salt = combined.slice(0, 16);
				const originalHash = combined.slice(16);

				const key = await crypto.subtle.importKey('raw', passwordBytes, 'PBKDF2', false, [
					'deriveBits',
				]);

				const computedHash = await crypto.subtle.deriveBits(
					{
						name: 'PBKDF2',
						salt,
						iterations: 100000,
						hash: 'SHA-256',
					},
					key,
					256
				);

				const computedHashArray = new Uint8Array(computedHash);

				if (computedHashArray.length !== originalHash.length) {
					return false;
				}

				let diff = 0;
				for (let i = 0; i < computedHashArray.length; i++) {
					diff |= computedHashArray[i] ^ originalHash[i];
				}
				return diff === 0;
			} catch {
				return false;
			}
		},
	};

	private async isEmailTaken(email: string): Promise<boolean> {
		const user = await this.userRepo.getUserByEmail(email);
		if (user) {
			return true;
		} else {
			return false;
		}
	}

	private async isPasswordWeak(password: string): Promise<boolean> {
		if (password.length < 8 || password.length > 255) {
			return true;
		}
		const hash = encodeHexLowerCase(sha1(new TextEncoder().encode(password)));
		const hashPrefix = hash.slice(0, 5);
		const response = await fetch(`https://api.pwnedpasswords.com/range/${hashPrefix}`);
		const data = await response.text();
		const items = data.split('\n');
		for (const item of items) {
			const hashSuffix = item.slice(0, 35).toLowerCase();
			if (hash === hashPrefix + hashSuffix) {
				return true;
			}
		}
		return false;
	}

	async register(body: RegisterBody, invalid: Invalid<RegisterBody>): Promise<void> {
		const event = getRequestEvent();
		if (this.session) {
			redirect(
				'/',
				{
					type: 'error',
					message: 'You are already logged in.',
				},
				event
			);
		}

		if (await this.isEmailTaken(body.email)) {
			invalid(invalid.email('Email is already taken.'));
		}

		if (await this.isPasswordWeak(body.password)) {
			invalid(invalid.password('Password is too weak.'));
		}

		const existingUser = await this.userRepo.getUserByEmail(body.email);
		if (existingUser) {
			invalid(invalid.email('Email is already taken.'));
		}

		const passwordHash = await this.password.hash(body.password);
		const newUser = await this.userRepo.createUser({
			email: body.email,
			passwordHash,
		});

		const { token, ...session } = await this.sessionRepo.createSession(newUser.id);
		this.cookie.set('session-token', token);

		const jwt = await this.jwt.sign({
			...session,
			user: newUser,
		});
		this.cookie.set('session-jwt', jwt);

		redirect(
			'/',
			{
				type: 'success',
				message: 'You have successfully Registered.',
				description: `Welcome to Sarfi, ${newUser.email}!`,
			},
			event
		);
	}

	async login(body: LoginBody, invalid: Invalid<LoginBody>): Promise<void> {
		const event = getRequestEvent();
		if (this.session) {
			redirect(
				'/',
				{
					type: 'error',
					message: 'You are already logged in.',
				},
				event
			);
		}

		const existingUser = await this.userRepo.getUserByEmail(body.email);
		if (!existingUser) {
			invalid(invalid.email('Invalid credentials.'));
		}

		const isPasswordValid = await this.password.verify(
			existingUser.passwordHash,
			body.password
		);
		if (!isPasswordValid) {
			invalid(invalid.password('Invalid credentials.'));
		}

		const { token, ...session } = await this.sessionRepo.createSession(existingUser.id);
		this.cookie.set('session-token', token);

		const jwt = await this.jwt.sign({
			...session,
			user: existingUser,
		});
		this.cookie.set('session-jwt', jwt);

		redirect(
			'/',
			{
				type: 'success',
				message: 'You have successfully logged in.',
				description: `Welcome back, ${existingUser.email}!`,
			},
			event
		);
	}

	async verifySession(): Promise<void> {
		const sessionJWT = this.cookie.get('session-jwt');
		let session: ISessionWithUser | null = null;

		if (sessionJWT) {
			session = await this.jwt.verify(sessionJWT);
		}

		if (!session) {
			const sessionToken = this.cookie.get('session-token');
			if (sessionToken) {
				session = await this.sessionRepo.validateSessionToken(sessionToken);
			}
		}

		this._session = session;
	}

	get session(): ISessionWithUser | null {
		return this._session;
	}

	getClientSession(): Session | null {
		if (!this._session) {
			return null;
		}

		return {
			id: this._session.id,
			user: {
				id: this._session.user.id,
				email: this._session.user.email,
				createdAt: this._session.user.createdAt,
				updatedAt: this._session.user.updatedAt,
			},
			createdAt: this._session.createdAt,
			lastVerifiedAt: this._session.lastVerifiedAt,
		};
	}

	async logout(): Promise<void> {
		const event = getRequestEvent();
		if (!this.session) {
			return;
		}

		await this.sessionRepo.deleteSessionById(this.session.id);

		this.cookie.delete('session-token');
		this.cookie.delete('session-jwt');

		redirect(
			'/',
			{
				type: 'success',
				message: 'You have successfully logged out.',
			},
			event
		);
	}
}
