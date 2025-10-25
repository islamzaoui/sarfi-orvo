import type { DependencyContainer } from 'tsyringe';

import { container } from 'tsyringe';

import type { Constructor } from './types';

export class ServiceScope {
	constructor(private readonly scope: DependencyContainer) {}

	resolve<T>(token: Constructor<T>): T {
		return this.scope.resolve(token);
	}

	async dispose() {
		await this.scope.dispose();
	}
}

class _ServiceCollection {
	private readonly root = container;
	private readonly singletons = new Set<Constructor>();
	private readonly scoped = new Set<Constructor>();
	private readonly transients = new Set<Constructor>();

	register<T>(token: Constructor<T>, lifetime: 'singleton' | 'scoped' | 'transient') {
		switch (lifetime) {
			case 'singleton':
				this.singletons.add(token);
				this.root.registerSingleton(token);
				break;
			case 'scoped':
				this.scoped.add(token);
				break;
			case 'transient':
				this.transients.add(token);
				this.root.register(token, { useClass: token });
				break;
		}
	}

	registerSingleton<T>(token: Constructor<T>) {
		this.register(token, 'singleton');
	}

	registerScoped<T>(token: Constructor<T>) {
		this.register(token, 'scoped');
	}

	registerTransient<T>(token: Constructor<T>) {
		this.register(token, 'transient');
	}

	createScope(): ServiceScope {
		const scope = this.root.createChildContainer();
		for (const token of this.scoped) {
			scope.registerSingleton(token);
		}
		for (const token of this.transients) {
			scope.register(token, { useClass: token });
		}
		return new ServiceScope(scope);
	}
}

export const ServiceCollection = new _ServiceCollection();
