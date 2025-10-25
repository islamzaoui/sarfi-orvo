import type { Handle } from '@sveltejs/kit';

import type { Constructor } from './types';

import { ServiceCollection } from './container';

export const DIHandle: Handle = async ({ event, resolve }) => {
	const scope = ServiceCollection.createScope();

	event.locals.useService = <T>(token: Constructor<T>): T => {
		return scope.resolve(token);
	};

	const response = await resolve(event);
	await scope.dispose();
	return response;
};
