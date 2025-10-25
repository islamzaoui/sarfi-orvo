declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			useService: <T>(token: new (...args: any[]) => T) => T;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
