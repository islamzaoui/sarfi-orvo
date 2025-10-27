import type { InjectionToken } from 'tsyringe';

import type { ServiceErrorMap } from '@/server/errors';

declare global {
	namespace App {
		interface Error<T extends keyof typeof ServiceErrorMap = keyof typeof ServiceErrorMap> {
			code: T;
			message: (typeof ServiceErrorMap)[T]['message'];
		}
		interface Locals {
			useService: <T>(token: InjectionToken<T>) => T;
		}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: Env;
			cf: CfProperties;
			ctx: ExecutionContext;
		}
	}
}

export {};
