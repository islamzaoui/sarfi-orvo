import 'reflect-metadata';
import type { Handle } from '@sveltejs/kit';
import type { InjectionToken } from 'tsyringe';

import { getRequestEvent } from '$app/server';
import { container, injectable, Lifecycle } from 'tsyringe';

export type Constructor = new (...args: any[]) => any;

let _counter = 0;
export function createServiceIdentifier<T>(description?: string): InjectionToken<T> {
	return Symbol(description ?? `ServiceToken_${_counter++}`);
}

export interface ServiceCollection {
	singleton: <T>(token: InjectionToken<T>, impl: Constructor) => this;
	scoped: <T>(token: InjectionToken<T>, impl: Constructor) => this;
	transient: <T>(token: InjectionToken<T>, impl: Constructor) => this;
	createScope: () => ServiceScope;
}

export interface ServiceScope extends AsyncDisposable {
	resolve: <T>(token: InjectionToken<T>) => T;
}

function buildServiceCollection(): ServiceCollection {
	const root = container;
	const scopedMap = new Map<InjectionToken<unknown>, Constructor>();
	const transientMap = new Map<InjectionToken<unknown>, Constructor>();

	const api: ServiceCollection = {
		singleton<T>(token: InjectionToken<T>, impl: Constructor) {
			injectable()(impl);
			root.registerSingleton(token, impl);
			return api;
		},
		scoped<T>(token: InjectionToken<T>, impl: Constructor) {
			injectable()(impl);
			scopedMap.set(token as InjectionToken<unknown>, impl);
			return api;
		},
		transient<T>(token: InjectionToken<T>, impl: Constructor) {
			injectable()(impl);
			transientMap.set(token as InjectionToken<unknown>, impl);
			return api;
		},
		createScope(): ServiceScope {
			const child = root.createChildContainer();

			for (const [token, impl] of scopedMap) {
				child.registerSingleton(token, impl);
			}
			for (const [token, impl] of transientMap) {
				child.register(token, impl, { lifecycle: Lifecycle.Transient });
			}

			return new (class implements ServiceScope {
				resolve<T>(token: InjectionToken<T>): T {
					return child.resolve(token);
				}
				async [Symbol.asyncDispose]() {
					await child.dispose();
				}
			})();
		},
	};

	return api;
}

export const Services = buildServiceCollection();

type ClassDecorator = (target: Constructor) => void;

export const Singleton = <T>(token?: InjectionToken<T>): ClassDecorator => {
	const tok = token ?? createServiceIdentifier<T>();
	return (target) => {
		injectable()(target);
		Services.singleton(tok, target);
		(target as any).__diToken = tok;
	};
};

export const Scoped = <T>(token?: InjectionToken<T>): ClassDecorator => {
	const tok = token ?? createServiceIdentifier<T>();
	return (target) => {
		injectable()(target);
		Services.scoped(tok, target);
		(target as any).__diToken = tok;
	};
};

export const Transient = <T>(token?: InjectionToken<T>): ClassDecorator => {
	const tok = token ?? createServiceIdentifier<T>();
	return (target) => {
		injectable()(target);
		Services.transient(tok, target);
		(target as any).__diToken = tok;
	};
};

export const ServiceCollectionHandle: Handle = async ({ event, resolve }) => {
	const scope = Services.createScope();
	event.locals.useService = <T>(token: InjectionToken<T>): T => scope.resolve(token);

	try {
		return await resolve(event);
	} finally {
		await scope[Symbol.asyncDispose]();
	}
};

export const useService = <T>(token: InjectionToken<T>): T => {
	const ev = getRequestEvent();
	if (!ev?.locals?.useService) {
		throw new Error('useService() can only be called inside a SvelteKit request context.');
	}
	return ev.locals.useService(token);
};

export { inject } from 'tsyringe';
