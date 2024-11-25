[**@ayka/dibox**](../../../README.md) • **Docs**

***

[@ayka/dibox](../../../globals.md) / [Box](../README.md) / Box

# Class: Box\<shape\>

A dependency injection container that manages lazy-loaded values.

Box provides a type-safe way to define, access, and manage dependencies. Dependencies are
defined as factory functions that can access other dependencies through the box instance.
Values are lazily evaluated and cached on first access.

## Example

```ts
const box = makeBox({
  config: () => ({ apiUrl: 'https://api.example.com' }),
  api: box => new ApiClient(box.get('config').apiUrl),
  users: box => box.get('api').getUsers()
});

// Values are lazily loaded and cached
const users = box.get('users'); // API call happens here
const sameUsers = box.get('users'); // Returns cached value
```

## Remarks

Box instances are immutable - methods that modify dependencies like `patch()`, `set()`, and `merge()`
return new Box instances rather than modifying the original.

## Type Parameters

• **shape** *extends* [`boxShape`](../type-aliases/boxShape.md)

The shape of dependencies contained in this box, mapping keys to their value types

## Constructors

### new Box()

> **new Box**\<`shape`\>(`params`): [`Box`](Box.md)\<`shape`\>

#### Parameters

• **params**: [`params`](../type-aliases/params.md)\<`shape`\>

#### Returns

[`Box`](Box.md)\<`shape`\>

#### Defined in

[src/Box.ts:128](https://github.com/AndreyMork/dibox/blob/a0c5779a3595f9dce73587b31054bdf92e8a3ef1/src/Box.ts#L128)

## Accessors

### proxy

#### Get Signature

> **get** **proxy**(): `shape`

Returns a proxy object that automatically retrieves box values through property access.

The proxy allows accessing box dependencies using dot notation instead of `.get()`.
Values are still lazily loaded and cached on first access.

##### Example

```ts
const box = makeBox({
  name: () => 'Alice',
  age: () => 30
});

// Instead of box.get('name')
console.log(box.proxy.name); // 'Alice'
```

##### Returns

`shape`

A proxy object with the same shape as the box's dependencies

#### Defined in

[src/Box.ts:704](https://github.com/AndreyMork/dibox/blob/a0c5779a3595f9dce73587b31054bdf92e8a3ef1/src/Box.ts#L704)

## Methods

### \[iterator\]()

> **\[iterator\]**(): `ArrayIterator`\<[keyof `shape`, `shape`\[keyof `shape`\]]\>

Returns an iterator for the box, allowing iteration over [key, value] pairs.

#### Returns

`ArrayIterator`\<[keyof `shape`, `shape`\[keyof `shape`\]]\>

An iterator of type `IterableIterator<[keyof shape, shape[keyof shape]]>`

#### Remarks

This method enables the use of `for...of` loops directly on the box instance.

#### Example

```ts
const box = makeBox({ foo: () => 'bar', baz: () => 123 });
for (const [key, value] of box) {
  console.log(key, value);  // Outputs: 'foo', 'bar' and 'baz', 123
}
```

#### Defined in

[src/Box.ts:597](https://github.com/AndreyMork/dibox/blob/a0c5779a3595f9dce73587b31054bdf92e8a3ef1/src/Box.ts#L597)

***

### cached()

> **cached**(`key`): `boolean`

Checks if a key exists in the box's cache.

#### Parameters

• **key**: keyof `shape`

Key to check for existence in the cache

#### Returns

`boolean`

Boolean indicating if key exists in the cache

#### Example

```ts
const box = makeBox({ foo: () => 'bar' });

// Initially, 'foo' is not cached
console.log(box.cached('foo'));  // false

// Accessing 'foo' will cache its value
const fooValue = box.get('foo'); // 'bar'

// Now, 'foo' is cached
console.log(box.cached('foo'));  // true
```

#### Defined in

[src/Box.ts:357](https://github.com/AndreyMork/dibox/blob/a0c5779a3595f9dce73587b31054bdf92e8a3ef1/src/Box.ts#L357)

***

### clearCache()

> **clearCache**(`key`): [`Box`](Box.md)\<`shape`\>

Clears the cached value for a specific key, forcing it to be reloaded on next access.

#### Parameters

• **key**: keyof `shape`

The key whose cached value should be cleared

#### Returns

[`Box`](Box.md)\<`shape`\>

The box instance for method chaining

#### Example

```ts
const box = makeBox({ random: () => Math.random() });

const value1 = box.get('random'); // e.g., 0.123456789
const value2 = box.get('random'); // Same value: 0.123456789 (cached)

box.clearCache('random');

const value3 = box.get('random'); // New value: e.g., 0.987654321
```

#### Defined in

[src/Box.ts:523](https://github.com/AndreyMork/dibox/blob/a0c5779a3595f9dce73587b31054bdf92e8a3ef1/src/Box.ts#L523)

***

### clone()

> **clone**(): [`Box`](Box.md)\<`shape`\>

Creates a new Box instance with the same dependencies but an empty cache.

This method is useful when you want to reuse the same dependency structure
but need a fresh instance where all values will be recomputed on first access.
Unlike `set` or `patch` which can modify dependencies, `clone` creates an
exact copy of the dependency structure.

#### Returns

[`Box`](Box.md)\<`shape`\>

A new Box instance with identical dependencies but empty cache

#### Example

```ts
const box1 = makeBox({
  random: () => Math.random()
});

const value1 = box1.get('random'); // Caches first random value
const box2 = box1.clone();
const value2 = box2.get('random'); // New random value, different from box1
```

#### See

 - [patch](../type-aliases/patch.md) For creating a new box with modified dependencies
 - [set](Box.md#set) For creating a new box with a single modified dependency

#### Defined in

[src/Box.ts:313](https://github.com/AndreyMork/dibox/blob/a0c5779a3595f9dce73587b31054bdf92e8a3ef1/src/Box.ts#L313)

***

### entries()

> **entries**(): [keyof `shape`, `shape`\[keyof `shape`\]][]

Returns an array of [key, value] pairs present in the box's cache, preserving their types.

#### Returns

[keyof `shape`, `shape`\[keyof `shape`\]][]

An array of [key, value] pairs of type `[keyof shape, shape[keyof shape]][]`

#### Remarks

Values are preloaded before being returned.

#### Example

```ts
const box = makeBox({ foo: () => 'bar', baz: () => 123 });
console.log(box.entries());  // [['foo', 'bar'], ['baz', 123]]
```

#### Defined in

[src/Box.ts:576](https://github.com/AndreyMork/dibox/blob/a0c5779a3595f9dce73587b31054bdf92e8a3ef1/src/Box.ts#L576)

***

### get()

> **get**\<`key`\>(`key`): `shape`\[`key`\]

Retrieves the value of a dependency by its key, utilizing the cache if available.

Returns a dependency value from the box. The value is cached after the first access,
so subsequent calls return the same instance.

#### Type Parameters

• **key** *extends* `string` \| `number` \| `symbol`

The key of the dependency to retrieve

#### Parameters

• **key**: `key`

#### Returns

`shape`\[`key`\]

The value of the retrieved dependency

#### Remarks

For non-cached access, use [Box.load](Box.md#load) instead.

#### Example

```ts
const box = makeBox({ random: () => Math.random() });

// Initially, 'random' is not cached
console.log(box.cached('random'));  // false

// Accessing 'random' will cache its value
const randomValue = box.get('random');
console.log(randomValue);  // e.g., 0.123456789

// Now, 'random' is cached
console.log(box.cached('random'));  // true

// Accessing 'random' again will return the cached value
console.log(box.get('random'));  // e.g., 0.123456789 (same as before)
```

#### Throws

If the key does not exist in the registry

#### See

[Box.load](Box.md#load) For loading the value without using the cache

#### Defined in

[src/Box.ts:393](https://github.com/AndreyMork/dibox/blob/a0c5779a3595f9dce73587b31054bdf92e8a3ef1/src/Box.ts#L393)

***

### has()

> **has**(`key`): `key is keyof shape`

Checks if a key exists in the box's registry.

#### Parameters

• **key**: [`boxKey`](../type-aliases/boxKey.md) \| keyof `shape`

Key to check for existence

#### Returns

`key is keyof shape`

Boolean indicating if key exists. Also acts as type predicate narrowing the key type to keyof shape if true

#### Example

```ts
const box = makeBox({ foo: () => 'bar' });

box.has('foo');  // true
box.has('baz');  // false
```

#### Defined in

[src/Box.ts:333](https://github.com/AndreyMork/dibox/blob/a0c5779a3595f9dce73587b31054bdf92e8a3ef1/src/Box.ts#L333)

***

### keys()

> **keys**(): keyof `shape`[]

Returns an array of keys present in the box's registry, preserving their types.

#### Returns

keyof `shape`[]

An array of keys of type `keyof shape`

#### Example

```ts
const box = makeBox({ foo: () => 'bar', baz: () => 123 });
console.log(box.keys());  // ['foo', 'baz']
```

#### Defined in

[src/Box.ts:539](https://github.com/AndreyMork/dibox/blob/a0c5779a3595f9dce73587b31054bdf92e8a3ef1/src/Box.ts#L539)

***

### load()

> **load**\<`key`\>(`key`): `shape`\[`key`\]

Retrieves the value of a dependency by its key.

The value is evaluated each time this method is called. Throws an error if the key is not found.

#### Type Parameters

• **key** *extends* `string` \| `number` \| `symbol`

The key of the dependency to load

#### Parameters

• **key**: `key`

#### Returns

`shape`\[`key`\]

The value of the loaded dependency

#### Remarks

This method is equivalent to transient dependencies in Awilix in NestJS.

#### Example

```ts
const box = makeBox({ foo: () => 'bar', random: () => Math.random() });

console.log(box.load('foo'));  // 'bar'
console.log(box.load('random'));  // e.g., 0.123456789
console.log(box.load('random'));  // e.g., 0.987654321 (different value)
```

#### Throws

If the key does not exist in the registry

#### Throws

If a circular dependency is detected during loading

#### Defined in

[src/Box.ts:426](https://github.com/AndreyMork/dibox/blob/a0c5779a3595f9dce73587b31054bdf92e8a3ef1/src/Box.ts#L426)

***

### merge()

> **merge**\<`shape2`\>(`box`): [`Box`](Box.md)\<[`shapeUpdate`](../type-aliases/shapeUpdate.md)\<`shape`, `shape2`\>\>

Merges two boxes into a new box, combining their dependencies.

Dependencies from the second box override any matching dependencies from the first box.
The resulting box has an empty cache - all values will be recomputed on first access.

#### Type Parameters

• **shape2** *extends* [`boxShape`](../type-aliases/boxShape.md)

Type of dependencies in the second box

#### Parameters

• **box**: [`Box`](Box.md)\<`shape2`\>

The box to merge with this box

#### Returns

[`Box`](Box.md)\<[`shapeUpdate`](../type-aliases/shapeUpdate.md)\<`shape`, `shape2`\>\>

A new Box instance containing dependencies from both boxes

#### Examples

```ts
const box1 = makeBox({ foo: () => 'bar' });
const box2 = makeBox({ baz: () => 123 });

const merged = box1.merge(box2);
console.log(merged.get('foo')); // 'bar'
console.log(merged.get('baz')); // 123
```

Overriding dependencies:
```ts
const box1 = makeBox({ value: () => 42 });
const box2 = makeBox({ value: () => 'override' });

const merged = box1.merge(box2);
console.log(merged.get('value')); // 'override'
```

#### Defined in

[src/Box.ts:279](https://github.com/AndreyMork/dibox/blob/a0c5779a3595f9dce73587b31054bdf92e8a3ef1/src/Box.ts#L279)

***

### patch()

> **patch**\<`shape2`\>(`patch`): [`Box`](Box.md)\<[`shapeUpdate`](../type-aliases/shapeUpdate.md)\<`shape`, `shape2`\>\>

Updates the box with new dependencies and creates a new box instance.

Creates a new box containing all existing dependencies plus new/overridden ones from the patch.
The new box also includes a shallow copy of the current box's cache.

#### Type Parameters

• **shape2** *extends* [`boxShape`](../type-aliases/boxShape.md)

Type of dependencies being added/overridden

#### Parameters

• **patch**: [`patch`](../type-aliases/patch.md)\<`shape2`, `shape`\>

New dependency definitions to add/override

#### Returns

[`Box`](Box.md)\<[`shapeUpdate`](../type-aliases/shapeUpdate.md)\<`shape`, `shape2`\>\>

A new Box instance with updated dependencies

#### Remarks

When dependencies need to access each other within the same patch, split into multiple patch/set calls:
```ts
box.patch({ config: () => ({env: 'dev'}) })
   .patch({ env: box => box.get('config').env })
```

#### Examples

Adding new dependencies:
```ts
const box = makeBox({ foo: () => 'bar' })
  .patch({
    baz: () => 123,
    qux: box => `${box.get('foo')}!` // Access parent values
  });
```

Overriding existing dependencies:
```ts
const box = makeBox({
  value: () => 'string',
  count: () => 0
}).patch({
  value: () => true,    // string -> boolean
  count: () => 'zero'   // number -> string
});
```

#### See

[clone](Box.md#clone) For creating a new box with same dependencies but empty cache

#### Defined in

[src/Box.ts:235](https://github.com/AndreyMork/dibox/blob/a0c5779a3595f9dce73587b31054bdf92e8a3ef1/src/Box.ts#L235)

***

### preload()

#### preload(flag)

> **preload**(`flag`): `this`

Eagerly loads and caches specified dependencies.

When called with a boolean, true preloads all dependencies while false is a no-op.
When called with an array of keys, preloads only those specific dependencies.

##### Parameters

• **flag**: `boolean`

##### Returns

`this`

The box instance for chaining

##### Remarks

This is useful when you want to ensure certain dependencies are loaded upfront
rather than lazily on first access.

##### Example

```ts
const box = makeBox({
  config: () => loadConfig(),
  db: box => initDatabase(box.get('config'))
});

// Preload specific dependencies
box.preload(['config', 'db']);

// Preload everything
box.preload(true);
```

##### Defined in

[src/Box.ts:628](https://github.com/AndreyMork/dibox/blob/a0c5779a3595f9dce73587b31054bdf92e8a3ef1/src/Box.ts#L628)

#### preload(keys)

> **preload**(`keys`): `this`

##### Parameters

• **keys**: keyof `shape`[]

##### Returns

`this`

##### Defined in

[src/Box.ts:629](https://github.com/AndreyMork/dibox/blob/a0c5779a3595f9dce73587b31054bdf92e8a3ef1/src/Box.ts#L629)

***

### reload()

> **reload**\<`key`\>(`key`): `shape`\[`key`\]

Clears the cached value for a specific key and immediately reloads it.
This is equivalent to calling `clearCache(key)` followed by `get(key)`.

#### Type Parameters

• **key** *extends* `string` \| `number` \| `symbol`

The key whose value should be reloaded

#### Parameters

• **key**: `key`

#### Returns

`shape`\[`key`\]

The newly loaded value for the given key

#### Example

```ts
const box = makeBox({ random: () => Math.random() });

const value1 = box.get('random'); // e.g., 0.123456789
const value2 = box.get('random'); // Same value: 0.123456789 (cached)

const value3 = box.reload('random'); // New value: e.g., 0.987654321
```

#### Defined in

[src/Box.ts:470](https://github.com/AndreyMork/dibox/blob/a0c5779a3595f9dce73587b31054bdf92e8a3ef1/src/Box.ts#L470)

***

### resetCache()

> **resetCache**(): [`Box`](Box.md)\<`shape`\>

Clears all cached values from the box, forcing them to be reloaded on next access.

#### Returns

[`Box`](Box.md)\<`shape`\>

The box instance for method chaining

#### Example

```ts
const box = makeBox({ random: () => Math.random() });

const value1 = box.get('random'); // e.g., 0.123456789
const value2 = box.get('random'); // Same value: 0.123456789 (cached)

box.resetCache();

const value3 = box.get('random'); // New value: e.g., 0.987654321
```

#### Defined in

[src/Box.ts:500](https://github.com/AndreyMork/dibox/blob/a0c5779a3595f9dce73587b31054bdf92e8a3ef1/src/Box.ts#L500)

***

### set()

> **set**\<`key`, `value`\>(`key`, `loadFn`): [`Box`](Box.md)\<[`shapeUpdate`](../type-aliases/shapeUpdate.md)\<`shape`, `shape2`\>\>

Adds a new dependency to the box and returns a new box instance.

Creates a new box containing all existing dependencies plus the new one defined by the key and load function.
The new box also includes a shallow copy of the current box's cache.

#### Type Parameters

• **key** *extends* [`boxKey`](../type-aliases/boxKey.md)

The type of the key for the new dependency

• **value**

The type of the value for the new dependency

#### Parameters

• **key**: `key`

The key for the new dependency

• **loadFn**: [`loadFn`](../type-aliases/loadFn.md)\<`shape`, `value`\>

The factory function to create the new dependency

#### Returns

[`Box`](Box.md)\<[`shapeUpdate`](../type-aliases/shapeUpdate.md)\<`shape`, `shape2`\>\>

A new Box instance with the added dependency

#### Remarks

When dependencies need to access each other within the same patch, split into multiple patch/set calls:
```ts
box.set('config', () => ({env: 'dev'}))
   .set('env', box => box.get('config').env);
```

#### Examples

Adding a new dependency:
```ts
const box = makeBox({ foo: () => 'bar' })
  .set('baz', () => 123);
```

Overriding an existing dependency:
```ts
const box = makeBox({
  value: () => 'string'
}).set('value', () => true); // string -> boolean
```

#### See

[patch](../type-aliases/patch.md) For adding multiple dependencies at once

#### Defined in

[src/Box.ts:187](https://github.com/AndreyMork/dibox/blob/a0c5779a3595f9dce73587b31054bdf92e8a3ef1/src/Box.ts#L187)

***

### stats()

> **stats**(): `object`

Returns statistics about the box's dependency cache state.

Provides information about:
- Total number of dependencies
- Number of cached dependencies
- Array of cached dependency keys
- Array of not yet cached dependency keys

#### Returns

`object`

An object containing cache statistics

##### cached

> **cached**: `number` = `cachedKeys.length`

##### cachedKeys

> **cachedKeys**: keyof `shape`[]

##### notCachedKeys

> **notCachedKeys**: keyof `shape`[]

##### size

> **size**: `number`

#### Example

```ts
const box = makeBox({
  name: () => 'Alice',
  age: () => 30
});

box.get('name');

console.log(box.stats());
// {
//   size: 2,
//   cached: 1,
//   cachedKeys: ['name'],
//   notCachedKeys: ['age']
// }
```

#### Defined in

[src/Box.ts:671](https://github.com/AndreyMork/dibox/blob/a0c5779a3595f9dce73587b31054bdf92e8a3ef1/src/Box.ts#L671)

***

### toJS()

> **toJS**(): `shape`

Converts the box's dependencies into a plain JavaScript object.

Forces evaluation of all dependencies and returns them in a standard object format.
The returned object will have the same keys as the box, with the resolved values.

#### Returns

`shape`

A plain object containing all resolved box dependencies

#### Example

```ts
const box = makeBox({
  name: () => 'Alice',
  age: () => 30
});

const obj = box.toJS();
// { name: 'Alice', age: 30 }
```

#### Defined in

[src/Box.ts:733](https://github.com/AndreyMork/dibox/blob/a0c5779a3595f9dce73587b31054bdf92e8a3ef1/src/Box.ts#L733)

***

### values()

> **values**(): `shape`\[keyof `shape`\][]

Returns an array of values present in the box, preserving their types.

#### Returns

`shape`\[keyof `shape`\][]

An array of values of type `shape[keyof shape][]`

#### Remarks

Values are preloaded before being returned.

#### Example

```ts
const box = makeBox({ foo: () => 'bar', baz: () => 123 });
console.log(box.values());  // ['bar', 123]
```

#### Defined in

[src/Box.ts:557](https://github.com/AndreyMork/dibox/blob/a0c5779a3595f9dce73587b31054bdf92e8a3ef1/src/Box.ts#L557)
