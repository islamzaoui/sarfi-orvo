import 'reflect-metadata';
import type { Handle } from '@sveltejs/kit';
import type { InjectionToken } from 'tsyringe';

import { getRequestEvent } from '$app/server';
import { container, injectable, Lifecycle } from 'tsyringe';

export type Constructor = new (...args: any[]) => any;

// Service identifier - just a symbol wrapper
export function createServiceIdentifier<T>(_key: string): InjectionToken<T> {
	return Symbol.for(_key) as InjectionToken<T>;
}

// Service definition types with explicit key as generic parameter
type ServiceLifecycle = 'singleton' | 'scoped' | 'transient';

export interface ServiceDefinition<T = any, K extends string = string> {
	key: K;
	token: InjectionToken<T>;
	class: Constructor;
	lifecycle: ServiceLifecycle;
}

// Helper functions that capture the key as a type parameter
export function singleton<K extends string, T>(
	key: K,
	token: InjectionToken<T>,
	cls: Constructor
): ServiceDefinition<T, K> {
	return { key, token, class: cls, lifecycle: 'singleton' };
}

export function scoped<K extends string, T>(
	key: K,
	token: InjectionToken<T>,
	cls: Constructor
): ServiceDefinition<T, K> {
	return { key, token, class: cls, lifecycle: 'scoped' };
}

export function transient<K extends string, T>(
	key: K,
	token: InjectionToken<T>,
	cls: Constructor
): ServiceDefinition<T, K> {
	return { key, token, class: cls, lifecycle: 'transient' };
}

// Type extraction
type ExtractServiceType<T> = T extends ServiceDefinition<infer U, any> ? U : never;
type ExtractServiceKey<T> = T extends ServiceDefinition<any, infer K> ? K : never;

// Build record from service array
type ServicesToRecord<T extends readonly ServiceDefinition[]> = {
	[S in T[number] as ExtractServiceKey<S>]: ExtractServiceType<S>;
};

export type AllServices<T extends readonly ServiceDefinition[]> = ServicesToRecord<T>;

export interface ServiceScope extends AsyncDisposable {
	resolve: <T>(token: InjectionToken<T>) => T;
}

// Build the DI container from a service array
export function buildContainer<T extends readonly ServiceDefinition[]>(services: T) {
	const root = container;

	// Create lookup maps
	const tokenByKey = new Map<string, InjectionToken<unknown>>();

	// Separate services by lifecycle
	const singletonServices = services.filter((s) => s.lifecycle === 'singleton');
	const scopedServices = services.filter((s) => s.lifecycle === 'scoped');
	const transientServices = services.filter((s) => s.lifecycle === 'transient');

	// Register singletons
	for (const service of singletonServices) {
		injectable()(service.class);
		root.registerSingleton(service.token, service.class);
		tokenByKey.set(service.key, service.token);
	}

	const scopedMap = new Map<InjectionToken<unknown>, Constructor>();
	const transientMap = new Map<InjectionToken<unknown>, Constructor>();

	// Prepare scoped services
	for (const service of scopedServices) {
		injectable()(service.class);
		scopedMap.set(service.token, service.class);
		tokenByKey.set(service.key, service.token);
	}

	// Prepare transient services
	for (const service of transientServices) {
		injectable()(service.class);
		transientMap.set(service.token, service.class);
		tokenByKey.set(service.key, service.token);
	}

	function createScope(): ServiceScope {
		const child = root.createChildContainer();

		for (const [token, impl] of scopedMap) {
			child.registerSingleton(token, impl);
		}

		for (const [token, impl] of transientMap) {
			child.register(token, impl, {
				lifecycle: Lifecycle.Transient,
			});
		}

		return new (class implements ServiceScope {
			resolve<T>(token: InjectionToken<T>): T {
				return child.resolve(token);
			}
			async [Symbol.asyncDispose]() {
				await child.dispose();
			}
		})();
	}

	return { createScope, tokenByKey, services };
}

// Type-safe useService factory
export function createUseService<T extends readonly ServiceDefinition[]>(
	containerInstance: ReturnType<typeof buildContainer<T>>
) {
	return function useService<K extends keyof AllServices<T>>(serviceKey: K): AllServices<T>[K] {
		const ev = getRequestEvent();
		if (!ev?.locals?.useService) {
			throw new Error('useService() can only be called inside a SvelteKit request context.');
		}

		const token = containerInstance.tokenByKey.get(serviceKey as string);

		if (!token) {
			throw new Error(`Service "${String(serviceKey)}" not found in service map.`);
		}

		return ev.locals.useService(
			token as InjectionToken<AllServices<T>[K]>
		) as AllServices<T>[K];
	};
}

// Handle factory
export function createServiceContainerHandle<T extends readonly ServiceDefinition[]>(
	containerInstance: ReturnType<typeof buildContainer<T>>
): Handle {
	return async ({ event, resolve }) => {
		const scope = containerInstance.createScope();
		event.locals.useService = <T>(token: InjectionToken<T>): T => scope.resolve(token);

		try {
			return await resolve(event);
		} finally {
			await scope[Symbol.asyncDispose]();
		}
	};
}

export { inject, injectable } from 'tsyringe';
