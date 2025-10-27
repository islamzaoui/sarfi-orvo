interface IServiceErrorMap {
	[key: string]: string;
}

export const ServiceErrorMap = {
	INTERNAL_SERVER_ERROR: 'Internal Server Error',
} as const satisfies IServiceErrorMap;

export type ServiceErrorCode = keyof typeof ServiceErrorMap;
export type ServiceErrorInfo = (typeof ServiceErrorMap)[ServiceErrorCode];

export class ServiceError<T extends ServiceErrorCode> extends Error {
	readonly code: T;

	constructor(code: T, details?: string, cause?: unknown) {
		const base = ServiceErrorMap[code];
		super(details ? `${base}: ${details}` : base);
		this.name = 'ServiceError';
		this.code = code;
		if (cause) this.cause = cause;
	}
}
