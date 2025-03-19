export type boxKey = string | symbol | number;
export type boxShape = Record<boxKey, unknown>;

export type shapeOf<t extends Box<any>> =
	t extends Box<infer shape> ? shape : never;

export type viewOf<box extends Box<any>, keys extends keyof shapeOf<box>> = Box<
	Pick<shapeOf<box>, keys>
>;

export type shapeViewOf<
	box extends Box<any>,
	keys extends keyof shapeOf<box>,
> = shapeOf<viewOf<box, keys>>;

export { Box as t, Box };

export type params = {
	registry?: registry;
	cache?: cache;
};

export type cloneParams<shape extends boxShape> = {
	keepCache?: boolean | (keyof shape)[];
};

class Box<shape extends boxShape> {
	readonly #registry: registry;
	#cache: cache;

	constructor(params: params) {
		this.#registry = params.registry ?? {};
		this.#cache = params.cache ?? {};
	}

	#proxy?: Readonly<shape>;
	get proxy() {
		this.#proxy ??= (() => {
			const handler: ProxyHandler<shape> = {
				get: (_target, prop) => {
					return this.get(prop as keyof shape);
				},
			};

			return new Proxy({} as shape, handler);
		})();

		return this.#proxy;
	}

	get $() {
		return this.proxy;
	}

	toJS(): shape {
		return Object.fromEntries(this.entries()) as shape;
	}

	#register<shape2 extends boxShape>(patch: patch<shape2, shape>) {
		type newShape = shapeUpdate<shape, shape2>;

		const registry = {
			...this.#registry,
		};

		for (const key in patch) {
			registry[key] = patch[key] as any;
		}

		for (const symKey of Object.getOwnPropertySymbols(patch)) {
			registry[symKey as keyof newShape] = patch[symKey] as any;
		}

		return registry;
	}

	// Setters

	patch<shape2 extends boxShape>(patch: patch<shape2, shape>) {
		type newShape = shapeUpdate<shape, shape2>;

		const registry = this.#register<shape2>(patch);
		const cache = { ...this.#cache };

		const newBox = new Box<newShape>({
			registry,
			cache,
		});

		for (const key of getKeys(patch)) {
			newBox.clearCache(key);
		}

		return newBox;
	}

	set<key extends boxKey, value>(key: key, loadFn: loadFn<shape, value>) {
		type shape2 = { [prop in key]: value };
		type newPatch = patch<shape2, shape>;
		const patch = { [key]: loadFn } as newPatch;

		return this.patch(patch);
	}

	declare<key extends boxKey, value>(key: key) {
		return this.set(key, (self) => declareFn<value>({ key, box: self }));
	}

	mutate<key extends keyof shape>(key: key, loadFn: loadFn<shape, shape[key]>) {
		this.clearCache(key);
		this.#registry[key] = loadFn as any;
		return this;
	}

	// Getters

	has(key: boxKey): boolean {
		return key in this.#registry;
	}

	get<key extends keyof shape>(key: key): shape[key] {
		if (this.cached(key)) {
			return this.#getCache(key)!;
		}

		const value = this.load(key);
		this.#setCache(key, value);

		return value;
	}

	#keysInProgress: Set<boxKey> = new Set();
	load<key extends keyof shape>(key: key): shape[key] {
		if (this.#keysInProgress.has(key)) {
			throw new CircularDependencyError({
				key: key as boxKey,
				unresolvedKeys: this.#keysInProgress as Set<boxKey>,
				box: this,
			});
		}

		const loadFn = this.#registry[key];

		if (loadFn == null) {
			throw new DependencyNotFoundError(key, this);
		}

		this.#keysInProgress.add(key);

		try {
			const value = loadFn(this) as shape[key];
			return value;
		} finally {
			this.#keysInProgress.delete(key);
		}
	}

	transient<key extends keyof shape>(key: key) {
		return this.load(key);
	}

	fullTransient<key extends keyof shape>(key: key) {
		return this.clone().transient(key);
	}

	reload<key extends keyof shape>(key: key) {
		return this.clearCache(key).get(key);
	}

	//

	clone(params?: cloneParams<shape>) {
		const registry = { ...this.#registry };
		const cache = this.#copyCache(params?.keepCache);

		return new Box<shape>({
			registry,
			cache,
		});
	}

	merge<shape2 extends boxShape>(
		box: Box<shape2>,
	): Box<shapeUpdate<shape, shape2>> {
		const registry = {
			...this.#registry,
			...box.#registry,
		};

		return new Box({
			registry,
		});
	}

	map<newShape extends boxShape>(
		updater: (box: this) => Box<newShape>,
	): Box<newShape> {
		return updater(this);
	}

	extend<newShape extends boxShape>(
		updater: (box: this) => Box<shapeUpdate<shape, newShape>>,
	): Box<shapeUpdate<shape, newShape>> {
		return this.map(updater);
	}

	// Cache

	#getCache<key extends keyof shape>(key: key): shape[key] | undefined {
		return this.#cache[key] as shape[key] | undefined;
	}

	#setCache<key extends keyof shape>(key: key, value: shape[key]) {
		this.#cache[key] = value;
		return this;
	}

	#copyCache(keepCache?: boolean | (keyof shape)[]) {
		if (keepCache == null || keepCache === false) {
			return {};
		}

		if (keepCache === true) {
			return { ...this.#cache };
		}

		const cache: cache = {};

		for (const key of keepCache) {
			cache[key] = this.#getCache(key);
		}

		return cache;
	}

	cached(key: keyof shape) {
		return key in this.#cache;
	}

	clearCache(key: keyof shape) {
		delete this.#cache[key];
		return this;
	}

	resetCache() {
		this.#cache = {};
		return this;
	}

	preload(flag: boolean): this;
	preload(keys: (keyof shape)[]): this;
	preload(keys: (keyof shape)[] | boolean): this {
		if (typeof keys === 'boolean') {
			return keys ? this.preload(this.keys()) : this;
		}

		for (const key of keys) {
			this.get(key);
		}

		return this;
	}

	// Iteration

	keys() {
		return getKeys(this.#registry);
	}

	[Symbol.iterator]() {
		return this.entries()[Symbol.iterator]();
	}

	entries() {
		return this.keys().map((key) => [key, this.get(key)] as [boxKey, unknown]);
	}

	values() {
		return this.entries().map(([, value]) => value);
	}

	// Misc

	stats() {
		const cachedKeys = getKeys(this.#cache);
		const notCachedKeys = this.keys().filter((key) => !this.cached(key));

		return {
			size: this.keys().length,
			cached: cachedKeys.length,
			cachedKeys,
			notCachedKeys,
		};
	}
}

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export function makeBox(): Box<{}>;
export function makeBox<shape extends boxShape>(
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	def: patch<shape, {}>,
): Box<shape>;
// biome-ignore lint/complexity/noBannedTypes: <explanation>
export function makeBox<shape extends boxShape>(def?: patch<shape, {}>) {
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	const box = new Box<{}>({});

	if (def == null) {
		return box;
	}

	return box.patch(def);
}

const getKeys = (registry: Record<boxKey, unknown>) => {
	const keys = Object.keys(registry) as (keyof boxShape)[];
	const symKeys = Object.getOwnPropertySymbols(registry).map(
		(sym) => sym as keyof boxShape,
	);
	return [...keys, ...symKeys];
};

const declareFn = <value>(params: { key: boxKey; box: Box<any> }): value => {
	throw new UnsetDeclaredKeyError({
		key: params.key,
		box: params.box,
	});
};

export const keys = <shape extends boxShape>(box: Box<shape>) => {
	return box.keys() as (keyof shape)[];
};

export const hasKey = <shape extends boxShape>(
	box: Box<shape>,
	key: unknown,
): key is keyof shape => {
	return box.has(key as boxKey);
};

export const entries = <shape extends boxShape>(
	box: Box<shape>,
): [keyof shape, shape[keyof shape]][] => {
	return box.entries() as [keyof shape, shape[keyof shape]][];
};

export const values = <shape extends boxShape>(
	box: Box<shape>,
): shape[keyof shape][] => {
	return box.values() as shape[keyof shape][];
};

export type loadFn<shape extends boxShape, value> = (box: Box<shape>) => value;

export type shapeUpdate<shape extends boxShape, shape2 extends boxShape> = {
	[prop in keyof shape | keyof shape2]: prop extends keyof shape2
		? shape2[prop]
		: prop extends keyof shape
			? shape[prop]
			: never;
};

export type patch<shape extends boxShape, parentShape extends boxShape> = {
	[key in keyof shape]: loadFn<parentShape, shape[key]>;
};

export type extension<shape extends boxShape, box extends Box<any>> = Box<
	shapeUpdate<shape, shapeOf<box>>
>;

export type registry = {
	[key: boxKey]: loadFn<boxShape, unknown>;
};

export type cache = {
	[key: boxKey]: unknown;
};

export class DependencyNotFoundError extends Error {
	readonly key: boxKey;
	readonly box: Box<any>;
	constructor(key: boxKey, box: Box<any>) {
		const knownKeys = box
			.keys()
			.map((key) => key.toString())
			.join(', ');
		const message = `Dependency ${key.toString()} not found. Known keys: ${knownKeys}`;

		super(message);
		this.key = key;
		this.box = box;
		this.name = this.constructor.name;
	}

	get knownKeys() {
		return this.box.keys();
	}
}

export class CircularDependencyError extends Error {
	readonly key: boxKey;
	readonly box: Box<any>;
	readonly unresolvedKeys: Set<boxKey>;

	constructor(params: {
		key: boxKey;
		unresolvedKeys: Set<boxKey>;
		box: Box<any>;
	}) {
		const unresolvedKeys = Array.from(params.unresolvedKeys)
			.map((key) => key.toString())
			.join(', ');

		super(
			`Circular dependency detected for key: ${params.key.toString()}. Unresolved keys: ${unresolvedKeys}`,
		);
		this.key = params.key;
		this.box = params.box;
		this.unresolvedKeys = params.unresolvedKeys;
	}
}

export class UnsetDeclaredKeyError extends Error {
	readonly key: boxKey;
	readonly box: Box<any>;

	constructor(params: { key: boxKey; box: Box<any> }) {
		super(
			`Tried to get declared key: ${params.key.toString()}. Declared keys must be set before they can be accessed.`,
		);
		this.key = params.key;
		this.box = params.box;
	}
}
