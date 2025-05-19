export type boxKey = string | symbol | number;
export type boxShape = Record<boxKey, any>;

export type anyBox = Box<any>;

export type shapeOf<box extends Box<any>> =
	box extends Box<infer shape> ? shape : never;

export type keysOf<box extends Box<any>> = keyof shapeOf<box>;

export type view<box extends Box<any>, key extends keysOf<box>> = Box<
	Pick<shapeOf<box>, key>
>;

export type hide<box extends Box<any>, key extends keysOf<box> | boxKey> = Box<
	Omit<shapeOf<box>, key>
>;

export type withShape<box extends Box<any>, shape extends boxShape> = Box<
	shapeUpdate<shapeOf<box>, shape>
>;

export type shapeUpdate<shape extends boxShape, shape2 extends boxShape> = {
	[prop in keyof shape | keyof shape2]: prop extends keyof shape2
		? shape2[prop]
		: prop extends keyof shape
			? shape[prop]
			: never;
};

export interface readable<shape extends boxShape> {
	proxy: Readonly<shape>;
	$: Readonly<shape>;
	toJS(): shape;

	has(key: boxKey): boolean;
	get<key extends keyof shape>(key: key): shape[key];
	load<key extends keyof shape>(key: key): shape[key];
	transient<key extends keyof shape>(key: key): shape[key];
	loadDeep<key extends keyof shape>(key: key): shape[key];
	reload<key extends keyof shape>(key: key): shape[key];

	cached(key: keyof shape): boolean;

	preload(keys: (keyof shape)[] | boolean): this;
}

export { Box as t, Box };
class Box<shape extends boxShape> implements readable<shape> {
	#registry: registry = new Map();
	#cache: cache = new Map();

	// Accessors

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

	get size() {
		return this.#registry.size;
	}

	// Iteration

	keys() {
		return this.#registry.keys().toArray();
	}

	values() {
		return this.#registry.values().toArray() as unknown[];
	}

	entries() {
		return this.keys().map(
			(key) => [key as boxKey, this.get(key) as unknown] as [boxKey, unknown],
		);
	}

	[Symbol.iterator]() {
		return this.entries()[Symbol.iterator]();
	}

	// Getters

	has(key: boxKey) {
		return this.#registry.has(key);
	}

	#keysInProgress: Set<boxKey> = new Set();
	load<key extends keyof shape>(key: key): shape[key] {
		if (this.#keysInProgress.has(key)) {
			throw new CircularDependencyError({
				key: key,
				unresolvedKeys: this.#keysInProgress,
				box: this,
			});
		}

		const loadFn = this.#registry.get(key);

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

	loadDeep<key extends keyof shape>(key: key) {
		return this.clone().load(key);
	}

	reload<key extends keyof shape>(key: key) {
		return this.clearCacheFor(key).get(key);
	}

	get<key extends keyof shape>(key: key) {
		if (this.cached(key)) {
			return this.#fromCache(key)!;
		}

		const value = this.load(key);
		this.#setCache(key, value);

		return value;
	}

	//  Setters

	setUnsafe<key extends boxKey, value>(
		key: key,
		loadFn: loadFn<shape, value>,
	): boxSet<this, key, value> {
		if (this.#registry.has(key)) {
			throw new UnexpectedKeyResetError({
				key,
				knownKeys: this.keys(),
				box: this,
			});
		}

		this.#registry.set(key, loadFn);

		return this as anyBox;
	}

	set<key extends boxKey, value>(
		key: key extends keyof shape ? never : key,
		loadFn: loadFn<shape, value>,
	): boxSet<this, key, value> {
		return this.setUnsafe(key, loadFn) as anyBox;
	}

	setManyUnsafe<shape2 extends boxShape>(
		patch: patch<shape, shape2>,
	): Box<shapeUpdate<shape, shape2>> {
		for (const key of getKeys(patch)) {
			this.setUnsafe(key, patch[key] as any);
		}

		return this;
	}

	setMany<shape2 extends boxShape>(
		patch: shapesOverlap<shape, shape2> extends true
			? never
			: patch<shape, shape2>,
	): Box<shapeUpdate<shape, shape2>> {
		return this.setManyUnsafe(patch) as anyBox;
	}

	reset<key extends keyof shape, value extends shape[key]>(
		key: key,
		loadFn: loadFn<shape, value>,
	) {
		this.clearCacheFor(key);
		this.#registry.set(key, loadFn);

		return this;
	}

	resetStatic<key extends keyof shape, value extends shape[key]>(
		key: key,
		value: value,
	) {
		return this.reset(key, () => value);
	}

	declare<key extends boxKey, value>(
		key: key extends keyof shape ? never : key,
	) {
		return this.set(key, (self) => declareFn<value>({ key, box: self }));
	}

	alias<key extends keyof shape, aliasKey extends boxKey>(
		key: key,
		aliasKey: aliasKey extends keyof shape ? never : aliasKey,
	) {
		return this.set(aliasKey, (self) => self.get(key));
	}

	updateLoader<key extends keyof shape>(
		key: key,
		updater: (value: shape[key]) => shape[key],
	) {
		const oldLoadFn = this.#registry.get(key);

		if (oldLoadFn == null) {
			throw new DependencyNotFoundError(key, this);
		}

		const newLoadFn: loadFn<shape, shape[key]> = (self) =>
			updater(oldLoadFn(self) as shape[key]);

		return this.reset(key, newLoadFn);
	}

	static<key extends boxKey, value>(
		key: key extends keyof shape ? never : key,
		value: value,
	) {
		return this.set(key, () => value).#setCache(key, value);
	}

	// Cache

	cached(key: boxKey) {
		return this.#cache.has(key);
	}

	#setCache(key: boxKey, value: unknown) {
		this.#cache.set(key, value);
		return this;
	}

	#fromCache<key extends keyof shape>(key: key) {
		return this.#cache.get(key) as shape[key] | undefined;
	}

	resetCache() {
		this.#cache.clear();
		return this;
	}

	clearCacheFor(...keys: (keyof shape)[]) {
		for (const key of keys) {
			this.#cache.delete(key);
		}

		return this;
	}

	preload(keys: (keyof shape)[] | boolean): this {
		if (typeof keys === 'boolean') {
			return keys ? this.preload(this.keys()) : this;
		}

		for (const key of keys) {
			this.get(key);
		}

		return this;
	}

	// Transformation

	view<key extends keyof shape>(): Box<Pick<shape, key>> {
		return this as anyBox;
	}

	hide<key extends keyof shape>(): Box<Omit<shape, key>> {
		return this as anyBox;
	}

	clone(): Box<shape> {
		const newBox = new Box<shape>();
		newBox.#registry = new Map(this.#registry);

		return newBox;
	}

	copy<keys extends keyof shape>(...keys: keys[]): Box<shape> {
		const newBox = this.clone();

		for (const key of keys) {
			newBox.resetStatic(key, this.get(key));
		}

		return newBox;
	}

	merge<shape2 extends boxShape>(
		box2: Box<shape2>,
	): Box<shapeUpdate<shape, shape2>> {
		const newBox = this.clone();

		for (const key of box2.keys()) {
			newBox.#registry.set(key, box2.#registry.get(key)!);
		}

		return newBox;
	}

	plugin<pluginShape extends boxShape>(
		updater: (box: this) => Box<pluginShape>,
	) {
		return this.merge(updater(this));
	}

	// Misc

	stats() {
		const cachedKeys = this.#cache.keys().toArray();
		const notCachedKeys = this.keys().filter((key) => !this.cached(key));

		return {
			size: this.size,
			cached: cachedKeys.length,
			cachedKeys,
			notCachedKeys,
		};
	}
}

// Factories

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export function create(): Box<{}>;
export function create<shape extends boxShape>(
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	patch: patch<{}, shape>,
): Box<shape>;

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export function create(patch?: patch<{}, boxShape>): Box<boxShape> {
	const box = new Box();

	if (patch != null) {
		box.setMany(patch as never);
	}

	return box;
}

// Utils

const getKeys = (patch: Record<boxKey, any>): boxKey[] => {
	const keys = Object.keys(patch);

	const symKeys = Object.getOwnPropertySymbols(patch).map((sym) => sym);

	return [...keys, ...symKeys];
};

const declareFn = <value>(params: { key: boxKey; box: Box<any> }): value => {
	throw new UnsetDeclaredKeyError({
		key: params.key,
		box: params.box,
	});
};

// Auxiliary types

export type loadFn<shape extends boxShape, value> = (box: Box<shape>) => value;

export type cache = Map<boxKey, unknown>;
export type registry = Map<boxKey, loadFn<boxShape, unknown>>;

export type patch<parentShape extends boxShape, patchShape extends boxShape> = {
	[key in keyof patchShape]: loadFn<parentShape, patchShape[key]>;
};

export type boxSet<box extends Box<any>, key extends boxKey, value> = Box<
	shapeUpdate<shapeOf<box>, { [prop in key]: value }>
>;

type shapesOverlap<shape1 extends boxShape, shape2 extends boxShape> = [
	keyof shape1 & keyof shape2,
] extends [never]
	? false
	: true;

// Errors

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

		this.name = this.constructor.name;

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

export class UnexpectedKeyResetError extends Error {
	readonly key: boxKey;
	readonly knownKeys: boxKey[];
	readonly box: Box<any>;

	constructor(params: { key: boxKey; knownKeys: boxKey[]; box: Box<any> }) {
		super(
			`Tried to reset key: ${params.key.toString()}. Please use the \`reset\` method to reset keys. Known keys: ${params.knownKeys.join(', ')}.`,
		);

		this.name = this.constructor.name;

		this.key = params.key;
		this.knownKeys = params.knownKeys;
		this.box = params.box;
	}
}
