import 'reflect-metadata';

import type { Handle } from '@sveltejs/kit';
import type { DependencyContainer, InjectionToken } from 'tsyringe';

import { getRequestEvent } from '$app/server';
import { container, inject, injectable } from 'tsyringe';

export type Constructor<T = unknown> = new (...args: any[]) => T;

export function createServiceIdentifier<T>(): InjectionToken<T> {
	return Symbol('token') as InjectionToken<T>;
}

export class ServiceScope {
	constructor(private readonly scope: DependencyContainer) {}

	resolve<T>(token: InjectionToken<T>): T {
		return this.scope.resolve(token);
	}

	async dispose() {
		await this.scope.dispose();
	}
}

class _ServiceCollection {
	private readonly root = container;
	private readonly scoped = new Map<InjectionToken, Constructor>();
	private readonly transients = new Map<InjectionToken, Constructor>();

	registerSingleton<T>(token: InjectionToken<T>, implementation: Constructor<T>) {
		this.root.registerSingleton(token, implementation);
	}

	registerScoped<T>(token: InjectionToken<T>, implementation: Constructor<T>) {
		this.scoped.set(token, implementation);
	}

	registerTransient<T>(token: InjectionToken<T>, implementation: Constructor<T>) {
		this.transients.set(token, implementation);
	}

	createScope(): ServiceScope {
		const scope = this.root.createChildContainer();
		for (const [token, implementation] of this.scoped) {
			scope.registerSingleton(token, implementation);
		}
		for (const [token, implementation] of this.transients) {
			scope.register(token, { useClass: implementation });
		}
		return new ServiceScope(scope);
	}
}

export const ServiceCollection = new _ServiceCollection();

type ClassDecorator = <T extends new (...args: any[]) => any>(target: T) => T | void;

export const Singleton = (token: InjectionToken): ClassDecorator => {
	return (target) => {
		injectable()(target);
		ServiceCollection.registerSingleton(token, target as Constructor);
	};
};

export const Scoped = (token: InjectionToken): ClassDecorator => {
	return (target) => {
		injectable()(target);
		ServiceCollection.registerScoped(token, target as Constructor);
	};
};

export const Transient = (token: InjectionToken): ClassDecorator => {
	return (target) => {
		injectable()(target);
		ServiceCollection.registerTransient(token, target as Constructor);
	};
};

export const ServiceCollectionHandle: Handle = async ({ event, resolve }) => {
	const scope = ServiceCollection.createScope();

	event.locals.useService = <T>(token: InjectionToken<T>): T => {
		return scope.resolve(token);
	};

	const response = await resolve(event);
	await scope.dispose();
	return response;
};

export function useService<T>(token: InjectionToken<T>): T {
	return getRequestEvent().locals.useService(token);
}

export { inject };
