interface IServiceErrorMap {
	[key: string]: {
		statusCode: number;
		message: string;
	};
}

export const ServiceErrorMap = {
	INTERNAL_SERVER_ERROR: {
		statusCode: 500,
		message: 'Something went wrong.',
	},
	UNAUTHORIZED: {
		statusCode: 401,
		message: 'Unauthorized.',
	},
} as const satisfies IServiceErrorMap;

export type ServiceErrorCode = keyof typeof ServiceErrorMap;
export type ServiceErrorInfo = (typeof ServiceErrorMap)[ServiceErrorCode];

export class ServiceError<T extends ServiceErrorCode> extends Error {
	readonly code: T;
	readonly statusCode: number;

	constructor(code: T, details?: string, cause?: unknown) {
		const base = ServiceErrorMap[code];
		super(`[${base.statusCode}] ${base.message}${details ? `: ${details}` : ''}`);
		this.name = 'ServiceError';
		this.code = code;
		this.statusCode = base.statusCode;
		if (cause) this.cause = cause;
	}
}
