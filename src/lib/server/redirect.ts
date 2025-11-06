import { error } from '@sveltejs/kit';
import { getRequestEvent } from '$app/server';
import { redirect as flashRedirect } from 'sveltekit-flash-message/server';

type FlashMessage = App.PageData['flash'];

export function redirect(status: number, location: string, message?: FlashMessage): never;
export function redirect(location: string, message?: FlashMessage): never;
export function redirect(message: FlashMessage): never;
export function redirect(
	arg1: number | string | FlashMessage,
	arg2?: string | FlashMessage,
	arg3?: FlashMessage
): never {
	const event = getRequestEvent();

	if (!event) {
		return error(500, 'Internal server error');
	}

	// 1️⃣ Case: redirect(status, location, message)
	if (typeof arg1 === 'number' && typeof arg2 === 'string') {
		return flashRedirect(arg1, arg2, arg3 as FlashMessage, event);
	}

	// 2️⃣ Case: redirect(location, message)
	if (typeof arg1 === 'string') {
		return flashRedirect(arg1, arg2 as FlashMessage, event);
	}

	// 3️⃣ Case: redirect(message)
	return flashRedirect(arg1 as FlashMessage, event);
}
