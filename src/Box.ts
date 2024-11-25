export type boxShape = Record<boxKey, unknown>;

/**
 * Extracts the shape type from a Box instance.
 *
 * @example
 * ```ts
 * const box = makeBox({
 *   foo: () => 'bar',
 *   count: () => 42
 * });
 *
 * type BoxShape = shapeOf<typeof box>;
 * // BoxShape = { foo: string; count: number }
 * ```
 *
 * @typeParam t - The Box type to extract the shape from
 * @returns The shape type of the Box instance
 */

export type shapeOf<t extends Box<any>> =
	t extends Box<infer shape> ? shape : never;

/**
 * Creates a type representing a view of a Box with only the specified keys.
 *
 * @example
 * ```ts
 * const box = makeBox({
 *   name: () => 'Alice',
 *   age: () => 30,
 *   email: () => 'alice@example.com'
 * });
 *
 * type UserView = viewOf<typeof box, 'name' | 'age'>;
 * // UserView = Box<{ name: string; age: number }>
 * ```
 *
 * @typeParam box - The Box type to create a view from
 * @typeParam keys - The keys to include in the view
 * @returns A Box type containing only the specified keys from the original Box
 */
export type viewOf<box extends Box<any>, keys extends keyof shapeOf<box>> = Box<
	Pick<shapeOf<box>, keys>
>;

export type boxKey = string | symbol;

/**
 * A function that loads a value for a Box dependency.
 *
 * @remarks
 * Load functions have access to the Box instance through their first parameter,
 * allowing them to retrieve other dependencies using `box.get()`.
 *
 * @example
 * ```ts
 * const box = makeBox({
 *   name: () => 'Alice',
 *   greeting: (box) => `Hello ${box.get('name')}!`
 * });
 * ```
 *
 * @typeParam shape - The shape of the Box instance
 * @typeParam value - The type of value returned by this loader
 * @param box - The Box instance containing dependencies
 * @returns The loaded value
 */
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

export type registry<shape extends boxShape> = {
	[key in keyof shape]?: loadFn<shape, shape[key]>;
};

export type cache<shape extends boxShape> = {
	[key in keyof shape]?: shape[key];
};

export type params<shape extends boxShape> = {
	registry?: registry<shape>;
	cache?: cache<shape>;
};

export { Box, Box as t };

/**
 * A dependency injection container that manages lazy-loaded values.
 *
 * Box provides a type-safe way to define, access, and manage dependencies. Dependencies are
 * defined as factory functions that can access other dependencies through the box instance.
 * Values are lazily evaluated and cached on first access.
 *
 * @typeParam shape - The shape of dependencies contained in this box, mapping keys to their value types
 *
 * @example
 * ```ts
 * const box = makeBox({
 *   config: () => ({ apiUrl: 'https://api.example.com' }),
 *   api: box => new ApiClient(box.get('config').apiUrl),
 *   users: box => box.get('api').getUsers()
 * });
 *
 * // Values are lazily loaded and cached
 * const users = box.get('users'); // API call happens here
 * const sameUsers = box.get('users'); // Returns cached value
 * ```
 *
 * @remarks
 * Box instances are immutable - methods that modify dependencies like `patch()`, `set()`, and `merge()`
 * return new Box instances rather than modifying the original.
 */
class Box<shape extends boxShape> {
	readonly #registry: registry<shape>;
	#cache: cache<shape>;

	constructor(params: params<shape>) {
		this.#registry = params.registry ?? {};
		this.#cache = params.cache ?? {};
	}

	#register<shape2 extends boxShape>(patch: patch<shape2, shape>) {
		type newShape = shapeUpdate<shape, shape2>;
		type newRegistry = registry<newShape>;

		const registry = {
			...this.#registry,
		} as unknown as newRegistry;

		for (const key in patch) {
			registry[key] = patch[key] as any;
		}

		for (const symKey of Object.getOwnPropertySymbols(patch)) {
			registry[symKey as keyof newShape] = patch[symKey] as any;
		}

		return registry;
	}

	/**
	 * Adds a new dependency to the box and returns a new box instance.
	 *
	 * Creates a new box containing all existing dependencies plus the new one defined by the key and load function.
	 * The new box also includes a shallow copy of the current box's cache.
	 *
	 * @remarks
	 * When dependencies need to access each other within the same patch, split into multiple patch/set calls:
	 * ```ts
	 * box.set('config', () => ({env: 'dev'}))
	 *    .set('env', box => box.get('config').env);
	 * ```
	 *
	 * @example
	 * Adding a new dependency:
	 * ```ts
	 * const box = makeBox({ foo: () => 'bar' })
	 *   .set('baz', () => 123);
	 * ```
	 *
	 * @example
	 * Overriding an existing dependency:
	 * ```ts
	 * const box = makeBox({
	 *   value: () => 'string'
	 * }).set('value', () => true); // string -> boolean
	 * ```
	 *
	 * @param key - The key for the new dependency
	 * @param loadFn - The factory function to create the new dependency
	 * @template key - The type of the key for the new dependency
	 * @template value - The type of the value for the new dependency
	 * @returns A new Box instance with the added dependency
	 * @see {@link patch} For adding multiple dependencies at once
	 */
	set<key extends boxKey, value>(key: key, loadFn: loadFn<shape, value>) {
		type shape2 = { [prop in key]: value };
		type newPatch = patch<shape2, shape>;
		const patch = { [key]: loadFn } as newPatch;

		return this.patch(patch);
	}

	/**
	 * Updates the box with new dependencies and creates a new box instance.
	 *
	 * Creates a new box containing all existing dependencies plus new/overridden ones from the patch.
	 * The new box also includes a shallow copy of the current box's cache.
	 *
	 * @remarks
	 * When dependencies need to access each other within the same patch, split into multiple patch/set calls:
	 * ```ts
	 * box.patch({ config: () => ({env: 'dev'}) })
	 *    .patch({ env: box => box.get('config').env })
	 * ```
	 *
	 * @example
	 * Adding new dependencies:
	 * ```ts
	 * const box = makeBox({ foo: () => 'bar' })
	 *   .patch({
	 *     baz: () => 123,
	 *     qux: box => `${box.get('foo')}!` // Access parent values
	 *   });
	 * ```
	 *
	 * @example
	 * Overriding existing dependencies:
	 * ```ts
	 * const box = makeBox({
	 *   value: () => 'string',
	 *   count: () => 0
	 * }).patch({
	 *   value: () => true,    // string -> boolean
	 *   count: () => 'zero'   // number -> string
	 * });
	 * ```
	 *
	 * @param patch - New dependency definitions to add/override
	 * @template shape2 - Type of dependencies being added/overridden
	 * @returns A new Box instance with updated dependencies
	 * @see {@link clone} For creating a new box with same dependencies but empty cache
	 */
	patch<shape2 extends boxShape>(patch: patch<shape2, shape>) {
		type newShape = shapeUpdate<shape, shape2>;

		const registry: registry<newShape> = this.#register<shape2>(patch);
		const cache = { ...this.#cache } as cache<newShape>;

		const newBox = new Box<newShape>({
			registry,
			cache,
		});

		for (const key of getKeys(patch)) {
			newBox.clearCache(key);
		}

		return newBox;
	}

	/**
	 * Merges two boxes into a new box, combining their dependencies.
	 *
	 * Dependencies from the second box override any matching dependencies from the first box.
	 * The resulting box has an empty cache - all values will be recomputed on first access.
	 *
	 * @example
	 * ```ts
	 * const box1 = makeBox({ foo: () => 'bar' });
	 * const box2 = makeBox({ baz: () => 123 });
	 *
	 * const merged = box1.merge(box2);
	 * console.log(merged.get('foo')); // 'bar'
	 * console.log(merged.get('baz')); // 123
	 * ```
	 *
	 * @example
	 * Overriding dependencies:
	 * ```ts
	 * const box1 = makeBox({ value: () => 42 });
	 * const box2 = makeBox({ value: () => 'override' });
	 *
	 * const merged = box1.merge(box2);
	 * console.log(merged.get('value')); // 'override'
	 * ```
	 *
	 * @param box - The box to merge with this box
	 * @template shape2 - Type of dependencies in the second box
	 * @returns A new Box instance containing dependencies from both boxes
	 */
	merge<shape2 extends boxShape>(box: Box<shape2>) {
		const registry = {
			...this.#registry,
			...box.#registry,
		} as registry<shapeUpdate<shape, shape2>>;

		return new Box({
			registry,
		});
	}

	/**
	 * Creates a new Box instance with the same dependencies but an empty cache.
	 *
	 * This method is useful when you want to reuse the same dependency structure
	 * but need a fresh instance where all values will be recomputed on first access.
	 * Unlike `set` or `patch` which can modify dependencies, `clone` creates an
	 * exact copy of the dependency structure.
	 *
	 * @example
	 * ```ts
	 * const box1 = makeBox({
	 *   random: () => Math.random()
	 * });
	 *
	 * const value1 = box1.get('random'); // Caches first random value
	 * const box2 = box1.clone();
	 * const value2 = box2.get('random'); // New random value, different from box1
	 * ```
	 *
	 * @returns A new Box instance with identical dependencies but empty cache
	 * @see {@link patch} For creating a new box with modified dependencies
	 * @see {@link set} For creating a new box with a single modified dependency
	 */
	clone() {
		return new Box<shape>({
			registry: this.#registry,
		});
	}

	/**
	 * Checks if a key exists in the box's registry.
	 *
	 * @example
	 * ```ts
	 * const box = makeBox({ foo: () => 'bar' });
	 *
	 * box.has('foo');  // true
	 * box.has('baz');  // false
	 * ```
	 *
	 * @param key - Key to check for existence
	 * @returns Boolean indicating if key exists. Also acts as type predicate narrowing the key type to keyof shape if true
	 */
	has(key: keyof shape | boxKey): key is keyof shape {
		return key in this.#registry;
	}

	/**
	 * Checks if a key exists in the box's cache.
	 *
	 * @example
	 * ```ts
	 * const box = makeBox({ foo: () => 'bar' });
	 *
	 * // Initially, 'foo' is not cached
	 * console.log(box.cached('foo'));  // false
	 *
	 * // Accessing 'foo' will cache its value
	 * const fooValue = box.get('foo'); // 'bar'
	 *
	 * // Now, 'foo' is cached
	 * console.log(box.cached('foo'));  // true
	 * ```
	 *
	 * @param key - Key to check for existence in the cache
	 * @returns Boolean indicating if key exists in the cache
	 */
	cached(key: keyof shape): boolean {
		return key in this.#cache;
	}

	/**
	 * Retrieves the value of a dependency by its key, utilizing the cache if available.
	 *
	 * Returns a dependency value from the box. The value is cached after the first access,
	 * so subsequent calls return the same instance.
	 *
	 * @remarks
	 * For non-cached access, use {@link Box.load} instead.
	 *
	 * @example
	 * ```ts
	 * const box = makeBox({ random: () => Math.random() });
	 *
	 * // Initially, 'random' is not cached
	 * console.log(box.cached('random'));  // false
	 *
	 * // Accessing 'random' will cache its value
	 * const randomValue = box.get('random');
	 * console.log(randomValue);  // e.g., 0.123456789
	 *
	 * // Now, 'random' is cached
	 * console.log(box.cached('random'));  // true
	 *
	 * // Accessing 'random' again will return the cached value
	 * console.log(box.get('random'));  // e.g., 0.123456789 (same as before)
	 * ```
	 *
	 * @param key - The key of the dependency to retrieve
	 * @returns The value of the retrieved dependency
	 * @throws {DependencyNotFoundError} If the key does not exist in the registry
	 * @see {@link Box.load} For loading the value without using the cache
	 */
	get<key extends keyof shape>(key: key): shape[key] {
		if (this.cached(key)) {
			return this.#getCache(key)!;
		}

		const value = this.load(key);
		this.#setCache(key, value);

		return value;
	}

	/**
	 * Retrieves the value of a dependency by its key.
	 *
	 * The value is evaluated each time this method is called. Throws an error if the key is not found.
	 *
	 * @remarks
	 * This method is equivalent to transient dependencies in Awilix in NestJS.
	 *
	 * @example
	 * ```ts
	 * const box = makeBox({ foo: () => 'bar', random: () => Math.random() });
	 *
	 * console.log(box.load('foo'));  // 'bar'
	 * console.log(box.load('random'));  // e.g., 0.123456789
	 * console.log(box.load('random'));  // e.g., 0.987654321 (different value)
	 * ```
	 *
	 * @param key - The key of the dependency to load
	 * @returns The value of the loaded dependency
	 * @throws {DependencyNotFoundError} If the key does not exist in the registry
	 * @throws {CircularDependencyError} If a circular dependency is detected during loading
	 */
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
			throw new DependencyNotFoundError(key as boxKey, this);
		}

		this.#keysInProgress.add(key);

		try {
			const value = loadFn(this);
			return value;
		} finally {
			this.#keysInProgress.delete(key);
		}
	}

	#keysInProgress: Set<keyof shape> = new Set();

	/**
	 * Clears the cached value for a specific key and immediately reloads it.
	 * This is equivalent to calling `clearCache(key)` followed by `get(key)`.
	 *
	 * @example
	 * ```ts
	 * const box = makeBox({ random: () => Math.random() });
	 *
	 * const value1 = box.get('random'); // e.g., 0.123456789
	 * const value2 = box.get('random'); // Same value: 0.123456789 (cached)
	 *
	 * const value3 = box.reload('random'); // New value: e.g., 0.987654321
	 * ```
	 *
	 * @param key - The key whose value should be reloaded
	 * @returns The newly loaded value for the given key
	 */
	reload<key extends keyof shape>(key: key) {
		return this.clearCache(key).get(key);
	}

	#getCache<key extends keyof shape>(key: key): shape[key] | undefined {
		return this.#cache[key];
	}

	#setCache<key extends keyof shape>(key: key, value: shape[key]) {
		this.#cache[key] = value;
		return this;
	}

	/**
	 * Clears all cached values from the box, forcing them to be reloaded on next access.
	 *
	 * @example
	 * ```ts
	 * const box = makeBox({ random: () => Math.random() });
	 *
	 * const value1 = box.get('random'); // e.g., 0.123456789
	 * const value2 = box.get('random'); // Same value: 0.123456789 (cached)
	 *
	 * box.resetCache();
	 *
	 * const value3 = box.get('random'); // New value: e.g., 0.987654321
	 * ```
	 *
	 * @returns The box instance for method chaining
	 */
	resetCache() {
		this.#cache = {};
		return this;
	}

	/**
	 * Clears the cached value for a specific key, forcing it to be reloaded on next access.
	 *
	 * @example
	 * ```ts
	 * const box = makeBox({ random: () => Math.random() });
	 *
	 * const value1 = box.get('random'); // e.g., 0.123456789
	 * const value2 = box.get('random'); // Same value: 0.123456789 (cached)
	 *
	 * box.clearCache('random');
	 *
	 * const value3 = box.get('random'); // New value: e.g., 0.987654321
	 * ```
	 *
	 * @param key - The key whose cached value should be cleared
	 * @returns The box instance for method chaining
	 */
	clearCache(key: keyof shape) {
		delete this.#cache[key];
		return this;
	}

	/**
	 * Returns an array of keys present in the box's registry, preserving their types.
	 *
	 * @example
	 * ```ts
	 * const box = makeBox({ foo: () => 'bar', baz: () => 123 });
	 * console.log(box.keys());  // ['foo', 'baz']
	 * ```
	 *
	 * @returns An array of keys of type `keyof shape`
	 */
	keys() {
		return getKeys(this.#registry);
	}

	/**
	 * Returns an array of values present in the box, preserving their types.
	 *
	 * @remarks
	 * Values are preloaded before being returned.
	 *
	 * @example
	 * ```ts
	 * const box = makeBox({ foo: () => 'bar', baz: () => 123 });
	 * console.log(box.values());  // ['bar', 123]
	 * ```
	 *
	 * @returns An array of values of type `shape[keyof shape][]`
	 */
	values() {
		return this.entries().map(([, value]) => value);
	}

	/**
	 * Returns an array of [key, value] pairs present in the box's cache, preserving their types.
	 *
	 * @remarks
	 * Values are preloaded before being returned.
	 *
	 * @example
	 * ```ts
	 * const box = makeBox({ foo: () => 'bar', baz: () => 123 });
	 * console.log(box.entries());  // [['foo', 'bar'], ['baz', 123]]
	 * ```
	 *
	 * @returns An array of [key, value] pairs of type `[keyof shape, shape[keyof shape]][]`
	 */
	entries() {
		return this.keys().map(
			(key) => [key, this.get(key)] as [keyof shape, shape[keyof shape]],
		);
	}

	/**
	 * Returns an iterator for the box, allowing iteration over [key, value] pairs.
	 *
	 * @remarks
	 * This method enables the use of `for...of` loops directly on the box instance.
	 *
	 * @example
	 * ```ts
	 * const box = makeBox({ foo: () => 'bar', baz: () => 123 });
	 * for (const [key, value] of box) {
	 *   console.log(key, value);  // Outputs: 'foo', 'bar' and 'baz', 123
	 * }
	 * ```
	 *
	 * @returns An iterator of type `IterableIterator<[keyof shape, shape[keyof shape]]>`
	 */
	[Symbol.iterator]() {
		return this.entries()[Symbol.iterator]();
	}

	/**
	 * Eagerly loads and caches specified dependencies.
	 *
	 * When called with a boolean, true preloads all dependencies while false is a no-op.
	 * When called with an array of keys, preloads only those specific dependencies.
	 *
	 * @remarks
	 * This is useful when you want to ensure certain dependencies are loaded upfront
	 * rather than lazily on first access.
	 *
	 * @example
	 * ```ts
	 * const box = makeBox({
	 *   config: () => loadConfig(),
	 *   db: box => initDatabase(box.get('config'))
	 * });
	 *
	 * // Preload specific dependencies
	 * box.preload(['config', 'db']);
	 *
	 * // Preload everything
	 * box.preload(true);
	 * ```
	 *
	 * @param keys - Array of dependency keys to preload, or boolean to preload all/none
	 * @returns The box instance for chaining
	 */
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

	/**
	 * Returns statistics about the box's dependency cache state.
	 *
	 * Provides information about:
	 * - Total number of dependencies
	 * - Number of cached dependencies
	 * - Array of cached dependency keys
	 * - Array of not yet cached dependency keys
	 *
	 * @example
	 * ```ts
	 * const box = makeBox({
	 *   name: () => 'Alice',
	 *   age: () => 30
	 * });
	 *
	 * box.get('name');
	 *
	 * console.log(box.stats());
	 * // {
	 * //   size: 2,
	 * //   cached: 1,
	 * //   cachedKeys: ['name'],
	 * //   notCachedKeys: ['age']
	 * // }
	 * ```
	 *
	 * @returns An object containing cache statistics
	 */
	stats() {
		const cachedKeys = Object.keys(this.#cache) as (keyof shape)[];
		const notCachedKeys = this.keys().filter(
			(key) => !this.cached(key),
		) as (keyof shape)[];

		return {
			size: this.keys().length,
			cached: cachedKeys.length,
			cachedKeys,
			notCachedKeys,
		};
	}

	/**
	 * Returns a proxy object that automatically retrieves box values through property access.
	 *
	 * The proxy allows accessing box dependencies using dot notation instead of `.get()`.
	 * Values are still lazily loaded and cached on first access.
	 *
	 * @example
	 * ```ts
	 * const box = makeBox({
	 *   name: () => 'Alice',
	 *   age: () => 30
	 * });
	 *
	 * // Instead of box.get('name')
	 * console.log(box.proxy.name); // 'Alice'
	 * ```
	 *
	 * @returns A proxy object with the same shape as the box's dependencies
	 */
	get proxy(): shape {
		const handler: ProxyHandler<shape> = {
			get: (_target, prop) => {
				return this.get(prop as keyof shape);
			},
		};

		return new Proxy({} as shape, handler);
	}

	/**
	 * Converts the box's dependencies into a plain JavaScript object.
	 *
	 * Forces evaluation of all dependencies and returns them in a standard object format.
	 * The returned object will have the same keys as the box, with the resolved values.
	 *
	 * @example
	 * ```ts
	 * const box = makeBox({
	 *   name: () => 'Alice',
	 *   age: () => 30
	 * });
	 *
	 * const obj = box.toJS();
	 * // { name: 'Alice', age: 30 }
	 * ```
	 *
	 * @returns A plain object containing all resolved box dependencies
	 */
	toJS(): shape {
		return Object.fromEntries(this.entries()) as shape;
	}
}

/**
 * Creates a new Box instance with optional initial values.
 *
 * @example
 * ```ts
 * // Empty box
 * const box = makeBox();
 *
 * // Box with initial values
 * const box = makeBox({
 *   foo: () => 'bar'
 * });
 * ```
 *
 * @param patch - Optional object containing factory functions to initialize box values
 * @returns A new Box instance
 */

// biome-ignore lint/complexity/noBannedTypes: <explanation>
export function makeBox(): Box<{}>;
export function makeBox<shape extends boxShape>(
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	patch?: patch<shape, {}>,
): Box<shape>;
// biome-ignore lint/complexity/noBannedTypes: <explanation>
export function makeBox<shape extends boxShape>(patch?: patch<shape, {}>) {
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	const box = new Box<{}>({});

	if (patch == null) {
		return box;
	}

	return box.patch(patch);
}

export const getKeys = <shape extends boxShape>(
	registry: registry<shape> | patch<shape, any>,
) => {
	const keys = Object.keys(registry) as (keyof shape)[];
	const symKeys = Object.getOwnPropertySymbols(registry).map(
		(sym) => sym as keyof shape,
	);
	return [...keys, ...symKeys];
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
