import { command, form, query } from '$app/server';

import { loginSchema, registerSchema } from '@/schemas/auth.schema';
import { useService } from '@/server/di';
import { AuthServiceId } from '@/server/services/auth.service';

export const registerForm = form(
	registerSchema,
	async (data, invalid) => await useService(AuthServiceId).register(data, invalid)
);

export const loginForm = form(
	loginSchema,
	async (data, invalid) => await useService(AuthServiceId).login(data, invalid)
);

export const getSession = query(async () => useService(AuthServiceId).session);

export const logoutCommand = command(async () => await useService(AuthServiceId).logout());
