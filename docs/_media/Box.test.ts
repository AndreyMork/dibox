import * as Japa from '@japa/runner';

import * as DI from '#Main';

const test = Japa.test;

test.group('Box: creation', () => {
	test('`makeBox` without arguments creates an empty box', ({
		expect,
		expectTypeOf,
	}) => {
		const myBox = DI.makeBox();
		type shape = DI.shapeOf<typeof myBox>;
		expect(myBox).toBeInstanceOf(DI.box);
		// biome-ignore lint/complexity/noBannedTypes: <explanation>
		expectTypeOf<shape>().toEqualTypeOf<{}>();
		expectTypeOf(myBox.keys).returns.items.toEqualTypeOf<never>();
	});

	test('`makeBox` with arguments creates a box with the given dependencies', ({
		expect,
		expectTypeOf,
	}) => {
		const myBox = DI.makeBox({ foo: () => 'bar' });
		type shape = DI.shapeOf<typeof myBox>;
		expect(myBox.get('foo')).toBe('bar');
		expectTypeOf<shape>().toEqualTypeOf<{ foo: string }>();
		expectTypeOf(myBox.keys).returns.items.toEqualTypeOf<'foo'>();
	});
});

test.group('Box: setting', () => {
	test('`patch` argument cannot access its own keys', ({ expectTypeOf }) => {
		DI.makeBox({
			foo: () => 'bar',
			baz: (box) => {
				expectTypeOf(box.get).parameter(0).toEqualTypeOf<never>();
			},
		});
	});

	test('`patch` adds new dependencies and returns a new box', ({
		expect,
		expectTypeOf,
	}) => {
		const box1 = DI.makeBox({ foo: () => 'bar' });
		const box2 = box1.patch({
			baz: () => 123,
			qux: (box) => `${box.get('foo')}!`,
		});

		type shape = DI.shapeOf<typeof box2>;

		expect(box2).toBeInstanceOf(DI.box);
		expect(box2).not.toBe(box1);

		expect(box2.get('foo')).toBe('bar');
		expect(box2.get('baz')).toBe(123);
		expect(box2.get('qux')).toBe('bar!');

		expectTypeOf<shape>().toEqualTypeOf<{
			foo: string;
			baz: number;
			qux: string;
		}>();

		expectTypeOf(box2.keys).returns.items.toEqualTypeOf<
			'foo' | 'baz' | 'qux'
		>();
	});

	test('`patch` overrides dependencies and types with the same key', ({
		expect,
		expectTypeOf,
	}) => {
		const box1 = DI.makeBox({
			value: () => 'string value',
			other: () => 123,
		});

		const box2 = box1.patch({
			value: () => 42, // Override string with number
			other: () => 'number to string', // Override number with string
		});

		type shape = DI.shapeOf<typeof box2>;

		// Check original box has original types and values
		expect(box1.get('value')).toBe('string value');
		expect(box1.get('other')).toBe(123);
		expectTypeOf(box1.get('value')).toEqualTypeOf<string>();
		expectTypeOf(box1.get('other')).toEqualTypeOf<number>();

		expect(box2.get('value')).toBe(42);
		expect(box2.get('other')).toBe('number to string');
		expectTypeOf(box2.get('value')).toEqualTypeOf<number>();
		expectTypeOf(box2.get('other')).toEqualTypeOf<string>();

		expectTypeOf<shape>().toEqualTypeOf<{
			value: number;
			other: string;
		}>();

		expectTypeOf(box2.keys).returns.items.toEqualTypeOf<'value' | 'other'>();
	});

	test('`patch` loader functions can access parent box values', ({
		expect,
		expectTypeOf,
	}) => {
		const box1 = DI.makeBox({
			value: () => 'initial',
		});

		const box2 = box1.patch({
			upper: (box) => box.get('value').toUpperCase(),
		});

		type shape = DI.shapeOf<typeof box2>;

		expect(box2.get('value')).toBe('initial');
		expect(box2.get('upper')).toBe('INITIAL');

		expectTypeOf<shape>().toEqualTypeOf<{
			upper: string;
			value: string;
		}>();

		expectTypeOf(box2.keys).returns.items.toEqualTypeOf<'value' | 'upper'>();
	});

	test('`patch` loader functions cannot access their own patch values', ({
		expectTypeOf,
	}) => {
		const box1 = DI.makeBox({
			value: () => 'initial',
		});

		box1.patch({
			config: () => ({ env: 'dev' }),
			env: (box) => {
				expectTypeOf(box.get).parameter(0).toEqualTypeOf<'value'>();
				expectTypeOf(box.get)
					.parameter(0)
					.not.toEqualTypeOf<'value' | 'config'>();

				// @ts-expect-error
				return box.get('config').env;
			},
		});

		// This works - dependencies added in separate patches
		const box3 = box1
			.patch({ config: () => ({ env: 'dev' }) })
			.patch({ env: (box) => box.get('config').env });

		type shape = DI.shapeOf<typeof box3>;

		expectTypeOf<shape>().toEqualTypeOf<{
			value: string;
			config: { env: string };
			env: string;
		}>();
	});

	test('`set` adds new dependencies and returns a new box instance', ({
		expectTypeOf,
		expect,
	}) => {
		const box1 = DI.makeBox({
			value: () => 'initial',
		});

		const box2 = box1.set('upper', (box) => box.get('value').toUpperCase());

		type shape = DI.shapeOf<typeof box2>;

		expect(box2.get('value')).toBe('initial');
		expect(box2.get('upper')).toBe('INITIAL');

		expectTypeOf<shape>().toEqualTypeOf<{
			value: string;
			upper: string;
		}>();

		expectTypeOf(box2.keys).returns.items.toEqualTypeOf<'value' | 'upper'>();
	});

	test('`set` overrides dependencies and types with the same key', ({
		expect,
		expectTypeOf,
	}) => {
		const box1 = DI.makeBox({
			value: () => 'string value',
			other: () => 123,
		});

		const box2 = box1
			.set('value', () => 42) // Override string with number
			.set('other', () => 'number to string'); // Override number with string

		type shape = DI.shapeOf<typeof box2>;

		// Check original box has original types and values
		expect(box1.get('value')).toBe('string value');
		expect(box1.get('other')).toBe(123);
		expectTypeOf(box1.get('value')).toEqualTypeOf<string>();
		expectTypeOf(box1.get('other')).toEqualTypeOf<number>();

		expect(box2.get('value')).toBe(42);
		expect(box2.get('other')).toBe('number to string');
		expectTypeOf(box2.get('value')).toEqualTypeOf<number>();
		expectTypeOf(box2.get('other')).toEqualTypeOf<string>();

		expectTypeOf<shape>().toEqualTypeOf<{
			value: number;
			other: string;
		}>();

		expectTypeOf(box2.keys).returns.items.toEqualTypeOf<'value' | 'other'>();
	});

	test('`patch` and `set` handle symbol keys and preserve types', ({
		expect,
		expectTypeOf,
	}) => {
		const symbolKey1 = Symbol('test1');
		const symbolKey2 = Symbol('test2');
		const symbolKey3 = Symbol('test3');

		const box1 = DI.makeBox({
			[symbolKey1]: () => 'symbol value',
		});

		const box2 = box1
			.patch({
				[symbolKey2]: () => 42,
			})
			.set(symbolKey3, () => true);

		type shape = DI.shapeOf<typeof box2>;

		expect(box2.get(symbolKey1)).toBe('symbol value');
		expect(box2.get(symbolKey2)).toBe(42);
		expect(box2.get(symbolKey3)).toBe(true);

		expectTypeOf<shape>().toEqualTypeOf<{
			[symbolKey1]: string;
			[symbolKey2]: number;
			[symbolKey3]: boolean;
		}>();

		expectTypeOf(box2.get(symbolKey1)).toEqualTypeOf<string>();
		expectTypeOf(box2.get(symbolKey2)).toEqualTypeOf<number>();
		expectTypeOf(box2.get(symbolKey3)).toEqualTypeOf<boolean>();
	});

	test('`merge` combines two boxes into a new box with merged dependencies', ({
		expect,
		expectTypeOf,
	}) => {
		const box1 = DI.makeBox({
			foo: () => 'bar',
		});

		const box2 = DI.makeBox({
			baz: () => 123,
		});

		const mergedBox = box1.merge(box2);

		type shape = DI.shapeOf<typeof mergedBox>;

		expect(mergedBox.get('foo')).toBe('bar');
		expect(mergedBox.get('baz')).toBe(123);

		expectTypeOf<shape>().toEqualTypeOf<{
			foo: string;
			baz: number;
		}>();
	});

	test('`merge` overrides properties from the first box with properties from the second box', ({
		expect,
		expectTypeOf,
	}) => {
		const box1 = DI.makeBox({
			foo: () => 'bar',
			value: () => 42,
		});

		const box2 = DI.makeBox({
			value: () => 'overridden',
			baz: () => 123,
		});

		const mergedBox = box1.merge(box2);

		type shape = DI.shapeOf<typeof mergedBox>;

		expect(mergedBox.get('foo')).toBe('bar');
		expect(mergedBox.get('value')).toBe('overridden');
		expect(mergedBox.get('baz')).toBe(123);

		expectTypeOf<shape>().toEqualTypeOf<{
			foo: string;
			value: string;
			baz: number;
		}>();
	});

	test('`merge` creates a new box with empty cache', ({ expect }) => {
		let loadCount = 0;
		const box1 = DI.makeBox({
			value: () => {
				loadCount += 1;
				return 'test';
			},
		});

		// Cache value in first box
		box1.get('value');
		expect(loadCount).toBe(1);

		const box2 = DI.makeBox({
			other: () => 'foo',
		});

		const mergedBox = box1.merge(box2);

		// Value should be reloaded in merged box
		expect(mergedBox.get('value')).toBe('test');
		expect(loadCount).toBe(2);
		expect(mergedBox.cached('value')).toBe(true);

		// Subsequent access uses new cache
		expect(mergedBox.get('value')).toBe('test');
		expect(loadCount).toBe(2);
	});
});

test.group('Box: getting', () => {
	test('`has` narrows key type and accepts unknown keys', ({
		expect,
		expectTypeOf,
	}) => {
		const box = DI.makeBox({
			value: () => 'test',
			count: () => 123,
		});

		expect(box.has('value')).toBe(true);
		expect(box.has('count')).toBe(true);
		expect(box.has('missing')).toBe(false);

		const key = 'unknown' as string;

		if (box.has(key)) {
			expectTypeOf(key).toEqualTypeOf<'value' | 'count'>();
		}
	});

	test('`get` retrieves and caches dependency values', ({ expect }) => {
		let loadCount = 0;
		const box = DI.makeBox({
			value: () => {
				loadCount += 1;
				return 'test';
			},
		});

		// First access loads and caches
		expect(box.get('value')).toBe('test');
		expect(loadCount).toBe(1);
		expect(box.cached('value')).toBe(true);

		// Subsequent access uses cache
		expect(box.get('value')).toBe('test');
		expect(loadCount).toBe(1);
	});

	test('`get` throws `DependencyNotFoundError` for missing keys', ({
		expect,
	}) => {
		const box = DI.makeBox({
			foo: () => 'bar',
		});

		expect(() => box.get('missing' as any)).toThrow(DI.DependencyNotFoundError);
	});

	test('`get` allows dependencies to access other dependencies', ({
		expect,
	}) => {
		const box = DI.makeBox({
			firstName: () => 'John',
			lastName: () => 'Doe',
		}).set(
			'fullName',
			(box) => `${box.get('firstName')} ${box.get('lastName')}`,
		);

		expect(box.get('fullName')).toBe('John Doe');
	});

	test('`get` preserves dependency types', ({ expectTypeOf }) => {
		const box = DI.makeBox({
			str: () => 'string',
			num: () => 42,
			bool: () => true,
		});

		expectTypeOf(box.get('str')).toEqualTypeOf<string>();
		expectTypeOf(box.get('num')).toEqualTypeOf<number>();
		expectTypeOf(box.get('bool')).toEqualTypeOf<boolean>();
	});

	test('`load` retrieves dependency value without caching', ({ expect }) => {
		let loadCount = 0;
		const box = DI.makeBox({
			value: () => {
				loadCount += 1;
				return 'test';
			},
		});

		// First load
		expect(box.load('value')).toBe('test');
		expect(loadCount).toBe(1);
		expect(box.cached('value')).toBe(false);

		// Second load re-evaluates
		expect(box.load('value')).toBe('test');
		expect(loadCount).toBe(2);
		expect(box.cached('value')).toBe(false);
	});

	test('`load` throws `DependencyNotFoundError` for missing keys', ({
		expect,
	}) => {
		const box = DI.makeBox({
			foo: () => 'bar',
		});

		expect(() => box.load('missing' as any)).toThrow(
			DI.DependencyNotFoundError,
		);
	});

	test('`load` allows dependencies to access other dependencies', ({
		expect,
	}) => {
		const box = DI.makeBox({
			firstName: () => 'John',
			lastName: () => 'Doe',
		}).set(
			'fullName',
			(box) => `${box.load('firstName')} ${box.load('lastName')}`,
		);

		expect(box.load('fullName')).toBe('John Doe');
	});

	test('`load` preserves dependency types', ({ expectTypeOf }) => {
		const box = DI.makeBox({
			str: () => 'string',
			num: () => 42,
			bool: () => true,
		});

		expectTypeOf(box.load('str')).toEqualTypeOf<string>();
		expectTypeOf(box.load('num')).toEqualTypeOf<number>();
		expectTypeOf(box.load('bool')).toEqualTypeOf<boolean>();
	});

	test('`load` throws `CircularDependencyError` for self-referencing dependencies', ({
		expect,
	}) => {
		const box = DI.makeBox({
			// @ts-expect-error
			a: (ctx) => ctx.load('a'),
		});

		expect(() => box.load('a')).toThrow(DI.CircularDependencyError);
	});

	test('`load` throws `CircularDependencyError` for circular dependencies', ({
		expect,
	}) => {
		const box = DI.makeBox({
			// @ts-expect-error
			a: (ctx) => ctx.load('b'),
			// @ts-expect-error
			b: (ctx) => ctx.load('a'),
		});

		expect(() => box.load('a')).toThrow(DI.CircularDependencyError);
	});

	test('`load` handles circular dependency when loader function throws', ({
		expect,
	}) => {
		let errorFlag = true;

		const box = DI.makeBox({
			a: () => {
				if (errorFlag) {
					errorFlag = false;
					throw new Error('test error');
				}

				return 'test';
			},
			// @ts-expect-error
			b: (ctx) => ctx.load('a'),
		});

		// First attempt throws the test error
		expect(() => box.load('b')).toThrow('test error');

		// Second attempt succeeds since errorFlag is now false
		expect(box.get('b')).toBe('test');
	});

	test('`reload` clears and reloads a cached value', ({ expect }) => {
		let loadCount = 0;
		const box = DI.makeBox({
			value: () => {
				loadCount += 1;
				return Math.random();
			},
		});

		// First access caches value
		const value1 = box.get('value');
		expect(loadCount).toBe(1);
		expect(box.cached('value')).toBe(true);

		// Second access uses cache
		const value2 = box.get('value');
		expect(loadCount).toBe(1);
		expect(value2).toBe(value1);

		// Reload clears cache and gets new value
		const value3 = box.reload('value');
		expect(loadCount).toBe(2);
		expect(value3).not.toBe(value1);
		expect(box.cached('value')).toBe(true);

		// Next access uses new cached value
		const value4 = box.get('value');
		expect(loadCount).toBe(2);
		expect(value4).toBe(value3);
	});
});

test.group('Box: caching', () => {
	test('`cached` checks if a key exists in the cache', ({ expect }) => {
		const box = DI.makeBox({
			value: () => 'test',
		});

		expect(box.cached('value')).toBe(false);
		box.get('value');
		expect(box.cached('value')).toBe(true);
	});

	test('`resetCache` clears all cached values', ({ expect }) => {
		const box = DI.makeBox({
			random1: () => Math.random(),
			random2: () => Math.random(),
		});

		const value1 = box.get('random1');
		const value2 = box.get('random2');

		expect(box.cached('random1')).toBe(true);
		expect(box.cached('random2')).toBe(true);

		box.resetCache();

		expect(box.cached('random1')).toBe(false);
		expect(box.cached('random2')).toBe(false);

		expect(box.get('random1')).not.toBe(value1);
		expect(box.get('random2')).not.toBe(value2);
	});

	test('`clearCache` clears cached value for specific key', ({ expect }) => {
		const box = DI.makeBox({
			random1: () => Math.random(),
			random2: () => Math.random(),
		});

		const value1 = box.get('random1');
		const value2 = box.get('random2');

		expect(box.cached('random1')).toBe(true);
		expect(box.cached('random2')).toBe(true);

		box.clearCache('random1');

		expect(box.cached('random1')).toBe(false);
		expect(box.cached('random2')).toBe(true);

		expect(box.get('random1')).not.toBe(value1);
		expect(box.get('random2')).toBe(value2);
	});

	test('`clone` creates new box with same dependencies but empty cache', ({
		expect,
	}) => {
		const box1 = DI.makeBox({
			random: () => Math.random(),
			value: () => 'test',
		});

		const value1 = box1.get('random');
		const value2 = box1.get('value');

		expect(box1.cached('random')).toBe(true);
		expect(box1.cached('value')).toBe(true);

		const box2 = box1.clone();

		// New box should have empty cache
		expect(box2.cached('random')).toBe(false);
		expect(box2.cached('value')).toBe(false);

		// Values should be recomputed
		expect(box2.get('random')).not.toBe(value1);
		expect(box2.get('value')).toBe(value2); // Non-random value should be same

		// Original box cache should be unchanged
		expect(box1.get('random')).toBe(value1);
		expect(box1.get('value')).toBe(value2);
	});

	test('`set/patch` resets cache for updated keys in new box', ({ expect }) => {
		const box1 = DI.makeBox({
			foo: () => 'foo',
			bar: () => 'bar',
			baz: () => 'baz',
		});

		// Cache some values in original box
		box1.get('foo');
		box1.get('bar');
		box1.get('baz');

		expect(box1.cached('foo')).toBe(true);
		expect(box1.cached('bar')).toBe(true);
		expect(box1.cached('baz')).toBe(true);

		// Test set()
		const box2 = box1.set('foo', () => 'foo2');
		expect(box2.cached('foo')).toBe(false); // Updated key should not be cached
		expect(box2.cached('bar')).toBe(true); // Other keys should keep cache
		expect(box2.cached('baz')).toBe(true);

		// Test patch()
		const box3 = box1.patch({
			foo: () => 'foo3',
			bar: () => 'bar3',
		});

		expect(box3.cached('foo')).toBe(false); // Updated keys should not be cached
		expect(box3.cached('bar')).toBe(false);
		expect(box3.cached('baz')).toBe(true); // Untouched key should keep cache

		// Original box should be unchanged
		expect(box1.cached('foo')).toBe(true);
		expect(box1.cached('bar')).toBe(true);
		expect(box1.cached('baz')).toBe(true);
	});
});

test.group('Box: iteration', () => {
	test('`entries` returns an array of [key, value] pairs', ({
		expect,
		expectTypeOf,
	}) => {
		const qux = Symbol('qux');
		const box = DI.makeBox({
			foo: () => 'bar',
			baz: () => 123,
			[qux]: () => 'qux',
		});
		expect(box.entries()).toStrictEqual([
			['foo', 'bar'],
			['baz', 123],
			[qux, 'qux'],
		]);
		expectTypeOf(box.entries()).toEqualTypeOf<
			[key: 'foo' | 'baz' | typeof qux, value: string | number][]
		>();
	});

	test('`keys` returns an array of keys', ({ expect, expectTypeOf }) => {
		const qux = Symbol('qux');
		const box = DI.makeBox({
			foo: () => 'bar',
			baz: () => 123,
			[qux]: () => 'qux',
		});
		expect(box.keys()).toStrictEqual(['foo', 'baz', qux]);
		expectTypeOf(box.keys()).toEqualTypeOf<('foo' | 'baz' | typeof qux)[]>();
	});

	test('`values` returns an array of values', ({ expect, expectTypeOf }) => {
		const qux = Symbol('qux');
		const box = DI.makeBox({
			foo: () => 'bar',
			baz: () => 123,
			[qux]: () => 'qux',
		});
		expect(box.values()).toStrictEqual(['bar', 123, 'qux']);
		expectTypeOf(box.values()).toEqualTypeOf<(string | number)[]>();
	});

	test('`Box` implements the `Iterable` protocol', ({
		expect,
		expectTypeOf,
	}) => {
		const box = DI.makeBox({ foo: () => 'bar', baz: () => 123 });
		expect([...box]).toStrictEqual([
			['foo', 'bar'],
			['baz', 123],
		]);

		for (const [key, value] of box) {
			expectTypeOf(key).toEqualTypeOf<'foo' | 'baz'>();
			expectTypeOf(value).toEqualTypeOf<string | number>();
		}
	});

	test('`preload` eagerly loads specified dependencies', ({ expect }) => {
		let nameCallCount = 0;
		let ageCallCount = 0;

		const box = DI.makeBox({
			name: () => {
				nameCallCount += 1;
				return 'Alice';
			},
			age: () => {
				ageCallCount += 1;
				return 30;
			},
		});

		// Initially nothing is loaded
		expect(nameCallCount).toBe(0);
		expect(ageCallCount).toBe(0);

		// Preload specific keys
		box.preload(['name']);
		expect(nameCallCount).toBe(1);
		expect(ageCallCount).toBe(0);

		// Getting preloaded value uses cache
		expect(box.get('name')).toBe('Alice');
		expect(nameCallCount).toBe(1);

		// Preload all remaining keys
		box.preload(true);
		expect(nameCallCount).toBe(1);
		expect(ageCallCount).toBe(1);

		// Getting any value uses cache
		expect(box.get('name')).toBe('Alice');
		expect(box.get('age')).toBe(30);
		expect(nameCallCount).toBe(1);
		expect(ageCallCount).toBe(1);
	});

	test('`preload` with false is a no-op', ({ expect }) => {
		let callCount = 0;
		const box = DI.makeBox({
			value: () => {
				callCount += 1;
				return 'test';
			},
		});

		box.preload(false);
		expect(callCount).toBe(0);
		expect(box.cached('value')).toBe(false);
	});
});

test.group('Box: proxy', () => {
	test('`proxy` allows accessing values through property access', ({
		expect,
		expectTypeOf,
	}) => {
		const box = DI.makeBox({
			name: () => 'Alice',
			age: () => 30,
		});

		expect(box.proxy.name).toBe('Alice');
		expect(box.proxy.age).toBe(30);

		expectTypeOf(box.proxy.name).toEqualTypeOf<string>();
		expectTypeOf(box.proxy.age).toEqualTypeOf<number>();
	});

	test('`proxy` lazily loads values on first access', ({ expect }) => {
		let nameCallCount = 0;
		let ageCallCount = 0;

		const box = DI.makeBox({
			name: () => {
				nameCallCount++;
				return 'Alice';
			},
			age: () => {
				ageCallCount++;
				return 30;
			},
		});

		expect(nameCallCount).toBe(0);
		expect(ageCallCount).toBe(0);

		box.proxy.name;
		expect(nameCallCount).toBe(1);
		expect(ageCallCount).toBe(0);

		box.proxy.age;
		expect(nameCallCount).toBe(1);
		expect(ageCallCount).toBe(1);

		// Values are cached after first access
		box.proxy.name;
		box.proxy.age;
		expect(nameCallCount).toBe(1);
		expect(ageCallCount).toBe(1);
	});
});

test.group('Box: toJS', () => {
	test('`toJS` converts box dependencies to a plain object', ({
		expect,
		expectTypeOf,
	}) => {
		const qux = Symbol('qux');
		const box = DI.makeBox({
			name: () => 'Alice',
			age: () => 30,
			[qux]: () => 'qux',
		});

		const obj = box.toJS();
		expect(obj).toStrictEqual({
			name: 'Alice',
			age: 30,
			[qux]: 'qux',
		});

		expectTypeOf(obj).toEqualTypeOf<{
			name: string;
			age: number;
			[qux]: string;
		}>();
	});

	test('`toJS` forces evaluation of all dependencies', ({ expect }) => {
		let nameCallCount = 0;
		let ageCallCount = 0;

		const box = DI.makeBox({
			name: () => {
				nameCallCount += 1;
				return 'Alice';
			},
			age: () => {
				ageCallCount += 1;
				return 30;
			},
		});

		expect(nameCallCount).toBe(0);
		expect(ageCallCount).toBe(0);

		box.toJS();

		expect(nameCallCount).toBe(1);
		expect(ageCallCount).toBe(1);
	});
});

test.group('Box: misc', () => {
	test('`stats` returns an object with cached and not cached keys', ({
		expect,
		expectTypeOf,
	}) => {
		const box = DI.makeBox({
			foo: () => 'bar',
			baz: () => 123,
			qux: () => 'qux',
		});

		box.get('foo');
		type shape = DI.shapeOf<typeof box>;

		const stats = box.stats();
		expect(stats).toEqual({
			size: 3,
			cached: 1,
			cachedKeys: ['foo'],
			notCachedKeys: ['baz', 'qux'],
		});

		expectTypeOf(stats).toEqualTypeOf<{
			size: number;
			cached: number;
			cachedKeys: (keyof shape)[];
			notCachedKeys: (keyof shape)[];
		}>();
	});

	test('`viewOf` type creates a Box type with only specified keys', ({
		expectTypeOf,
	}) => {
		const box = DI.makeBox({
			name: () => 'Alice',
			age: () => 30,
			email: () => 'alice@example.com',
		});

		type userView = DI.viewOf<typeof box, 'name' | 'age'>;

		expectTypeOf<userView>().toEqualTypeOf<
			DI.box<{
				name: string;
				age: number;
			}>
		>();

		expectTypeOf(box).toEqualTypeOf(box);
		expectTypeOf<userView>().not.toEqualTypeOf(box);
	});
});
