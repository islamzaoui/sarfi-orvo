interface Success<T> {
	data: T;
	err?: never;
}

interface Failure<E> {
	data?: never;
	err: E;
}

type SafeResult<T, E = Error> = Success<T> | Failure<E>;

export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<SafeResult<T, E>> {
	try {
		const data = await promise;
		return { data };
	} catch (err) {
		return { err: err as E };
	}
}
