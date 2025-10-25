import { injectable } from 'tsyringe';

import type { Constructor } from './types';

import { ServiceCollection } from './container';

type ClassDecorator = <T extends new (...args: unknown[]) => unknown>(target: T) => T | void;

type Lifetime = 'singleton' | 'scoped' | 'transient';

function createDecorator(lifetime: Lifetime): ClassDecorator {
	return (target: new (...args: unknown[]) => unknown) => {
		injectable()(target);
		ServiceCollection.register(target as Constructor, lifetime);
	};
}

/** Register a class as a singleton service */
export const Singleton = () => createDecorator('singleton');

/** Register a class as a scoped service (per request) */
export const Scoped = () => createDecorator('scoped');

/** Register a class as a transient service (new instance per use) */
export const Transient = () => createDecorator('transient');
