**@ayka/dibox** • [**Docs**](globals.md)

***

# @ayka/dibox

<!-- Package -->

[npm-url]: https://www.npmjs.com/package/@ayka/dibox
[npm-next-url]: https://www.npmjs.com/package/@ayka/dibox/v/next
[npm-version-badge]: https://img.shields.io/npm/v/%40ayka%2Fdibox/latest
[npm-version-next-badge]: https://img.shields.io/npm/v/%40ayka%2Fdibox/next
[npm-downloads-badge]: https://img.shields.io/npm/dm/%40ayka%2Fdibox
[npm-unpacked-size-badge]: https://img.shields.io/npm/unpacked-size/%40ayka%2Fdibox
[bundle-js-url]: https://bundlejs.com/?q=%40ayka%2Fdibox
[bundle-js-badge]: https://img.shields.io/bundlejs/size/%40ayka%2Fdibox

<!-- GitHub Actions -->

[actions-ci]: https://github.com/AndreyMork/dibox/actions/workflows/ci.yaml
[actions-codeql]: https://github.com/AndreyMork/dibox/actions/workflows/github-code-scanning/codeql
[actions-ci-badge]: https://github.com/AndreyMork/dibox/actions/workflows/ci.yaml/badge.svg
[actions-codeql-badge]: https://github.com/AndreyMork/dibox/actions/workflows/github-code-scanning/codeql/badge.svg

<!-- Code Climate -->

[codeclimate-url]: https://codeclimate.com/github/AndreyMork/dibox
[codeclimate-maintainability-badge]: https://api.codeclimate.com/v1/badges/6b269725db17b3e72636/maintainability
[codeclimate-test-coverage-badge]: https://api.codeclimate.com/v1/badges/6b269725db17b3e72636/test_coverage

<!-- Misc -->

[license-url]: https://opensource.org/license/MIT
[license-badge]: https://img.shields.io/npm/l/%40ayka%2Fdibox
[mutation-testing-badge]: https://img.shields.io/endpoint?url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2FAndreyMork%2Fdibox%2Fmain
[mutation-testing-url]: https://dashboard.stryker-mutator.io/reports/github.com/AndreyMork/dibox/main

<!-- Badges -->

<!-- [![NPM Version][npm-version-next-badge]][npm-next-url] -->

[![NPM Version][npm-version-badge]][npm-url]
[![NPM License][license-badge]][license-url]
[![NPM Downloads][npm-downloads-badge]][npm-url]

[![npm package minimized gzipped size][bundle-js-badge]][bundle-js-url]
[![NPM Unpacked Size][npm-unpacked-size-badge]][npm-url]

[![CI][actions-ci-badge]][actions-ci]
[![CodeQL][actions-codeql-badge]][actions-codeql]

[![Maintainability][codeclimate-maintainability-badge]][codeclimate-url]
[![Test Coverage][codeclimate-test-coverage-badge]][codeclimate-url]
[![Mutation testing badge][mutation-testing-badge]][mutation-testing-url]

## Overview

`dibox` is a lightweight, **type-safe dependency injection container** for TypeScript/JavaScript applications. It provides a simple yet powerful way to manage dependencies with features like lazy loading, immutable API, and **automatic circular dependency detection**.

### Key Features

- 🎯 **Type Safety**: Full TypeScript support with automatic type inference
- 🦥 **Lazy Loading**: Dependencies are only initialized when needed
- 🔄 **Immutable API**: Prevents side effects and makes state management predictable
- 🪶 **Zero Dependencies**: Lightweight and focused on core DI functionality
- 🎮 **Easy API**: Simple and intuitive API for managing dependencies
- 🔍 **Circular Dependency Detection**: Automatically detects and reports circular dependencies
- 🔌 **Framework Agnostic**: Works with any JavaScript/TypeScript project

### Perfect For

- **Modular Applications**: Organize and manage complex dependency graphs
- **Testing**: Easily mock dependencies for unit and integration tests

## Table of Contents

- [Overview](#overview)
  - [Key Features](#key-features)
- [API Reference](#api-reference)
- [Usage](#usage)
  - [Basic Usage](#basic-usage)
  - [Adding Dependencies](#adding-dependencies)
  - [Accessing Dependencies](#accessing-dependencies)
  - [Type Safety](#type-safety)
  - [Circular Dependency Detection](#circular-dependency-detection)
    - [Common Patterns to Resolve Circular Dependencies](#common-patterns-to-resolve-circular-dependencies)
  - [Advanced Features](#advanced-features)
    - [Merging Containers](#merging-containers)
    - [Cache Control](#cache-control)
    - [Preloading Dependencies](#preloading-dependencies)
  - [Proxy Access](#proxy-access)
  - [Mutating Dependencies](#mutating-dependencies)
- [Receipts](#receipts)
  - [Overriding Dependencies for Testing](#overriding-dependencies-for-testing)
  - [Async Dependency](#async-dependency)
- [Contributing](#contributing)
- [License](#license)

## API Reference

For detailed API documentation, see:

- [API Documentation](_media/globals.md) - Complete API reference with types and examples
- [Box Class](_media/Box.md) - Core container class documentation
- [Test Examples](_media/Box.test.ts) - Comprehensive examples of all features in test form

## Usage

### Basic Usage

Create a dependency container using `makeBox()` and define your dependencies:

```typescript
import * as DI from '@ayka/dibox';

// Create a box with dependencies
const box = DI.makeBox()
  .set('config', () => ({ apiUrl: 'https://api.example.com' }))
  .set('api', (box) => new ApiClient(box.get('config').apiUrl))
  .set('users', (box) => box.get('api').getUsers());

// Access dependencies - they are lazily loaded and cached
const users = box.get('users'); // API call happens here
const sameUsers = box.get('users'); // Returns cached value
```

### Adding Dependencies

You can add new dependencies using `set()` or `patch()`:

```typescript
import * as DI from '@ayka/dibox';

// Add a single dependency
const boxWithLogger = box.set('logger', () => new Logger());

// Add multiple dependencies
const boxWithMore = box.patch({
  cache: () => new Cache(),
  db: (box) => new Database(box.get('config')),
});
```

### Accessing Dependencies

There are multiple ways to access dependencies:

```typescript
// Using get() - cached access
const api = box.get('api');

// Using load() - always creates fresh instance (like transient in NestJS or Awilix)
const freshApi = box.load('api');

// Using proxy - convenient property access
const { config, api } = box.proxy;

// Convert entire box to plain object
const allDeps = box.toJS();
```

### Type Safety

The container is fully type-safe:

```typescript
const box = makeBox({
  name: () => 'Alice',
  age: () => 30,
});

// Types are inferred automatically
const name = box.get('name'); // type: string
const age = box.get('age'); // type: number

// TypeScript errors on invalid keys
box.get('invalid'); // Error: Argument of type '"invalid"' is not assignable...
```

### Circular Dependency Detection

dibox automatically detects and reports circular dependencies at runtime. A circular dependency occurs when two or more dependencies depend on each other in a cycle.

```typescript
import * as DI from '@ayka/dibox';

// This will throw CircularDependencyError
const box = DI.makeBox()
  .set('chicken', (box) => box.get('egg'))
  .set('egg', (box) => box.get('chicken'));

// Error: Circular dependency detected for key: 'chicken'.
// Unresolved keys: chicken, egg
```

#### Common Patterns to Resolve Circular Dependencies

##### 1. **Use a Shared Configuration**

```typescript
import * as DI from '@ayka/dibox';

// ❌ Circular dependency
const badBox = DI.makeBox()
  .set('userService', (box) => new UserService(box.get('authService')))
  .set('authService', (box) => new AuthService(box.get('userService')));

// ✅ Share configuration instead
const goodBox = DI.makeBox()
  .set('config', () => ({
    userApi: 'https://api.example.com/users',
    authApi: 'https://api.example.com/auth',
  }))
  .set('userService', (box) => new UserService(box.get('config')))
  .set('authService', (box) => new AuthService(box.get('config')));
```

##### 2. **Use Interface Segregation**

```typescript
import * as DI from '@ayka/dibox';

// ❌ Circular dependency
const badBox = DI.makeBox()
  .set('orderProcessor', (box) => new OrderProcessor(box.get('inventory')))
  .set('inventory', (box) => new Inventory(box.get('orderProcessor')));

// ✅ Split into smaller, focused interfaces
const goodBox = DI.makeBox()
  .set('inventoryReader', () => new InventoryReader())
  .set(
    'orderProcessor',
    (box) => new OrderProcessor(box.get('inventoryReader')),
  )
  .set(
    'inventoryWriter',
    (box) => new InventoryWriter(box.get('orderProcessor')),
  );
```

The `CircularDependencyError` includes helpful information to debug the cycle:

- The key that triggered the error
- The list of unresolved keys in the dependency chain
- A clear error message explaining the issue

```typescript
try {
  box.get('chicken');
} catch (error) {
  if (error instanceof DI.CircularDependencyError) {
    console.log(error.message); // Circular dependency detected...
    console.log(error.key); // 'chicken'
    console.log(error.unresolvedKeys); // Set { 'chicken', 'egg' }
  }
}
```

### Advanced Features

#### Merging Containers

```typescript
const box1 = makeBox({ foo: () => 'bar' });
const box2 = makeBox({ baz: () => 123 });

const merged = box1.merge(box2);
```

#### Cache Control

```typescript
// Clear specific cached value
box.clearCache('users');

// Clear all cached values
box.resetCache();

// Create new instance with empty cache
const fresh = box.clone();
```

#### Preloading Dependencies

```typescript
// Preload specific dependencies
box.preload(['config', 'api']);

// Preload all dependencies
box.preload(true);
```

For more examples and detailed API documentation, see the [API Documentation](_media/globals.md).

### Proxy Access

The box provides a convenient proxy interface that allows you to access dependencies using property syntax:

```typescript
import * as DI from '@ayka/dibox';

const box = DI.makeBox({
  config: () => ({ apiUrl: 'https://api.example.com' }),
  api: (box) => new ApiClient(box.get('config').apiUrl),
  users: (box) => box.get('api').getUsers(),
});

// Instead of box.get('config')
const { config, api, users } = box.proxy;

// Types are preserved
const apiUrl = config.apiUrl; // type: string
```

The proxy maintains all the same behaviors as using `get()`:

- Lazy loading: Values are only initialized when accessed
- Caching: Values are cached after first access
- Type safety: Full TypeScript type inference

You can mix and match proxy access with regular methods:

```typescript
// These are equivalent:
const api1 = box.get('api');
const api2 = box.proxy.api;

// Proxy access works with cache clearing too
box.clearCache('api');
const freshApi = box.proxy.api; // Creates new instance
```

Note that while proxy access is convenient, it doesn't support all box features:

- Can't use `load()` through proxy (always uses cached values)
- Can't check if a key exists
- Can't clear cache through proxy

For these operations, you'll need to use the regular box methods.

### Mutating Dependencies

The `mutate` method allows you to modify a single dependency in the current box instance. Unlike `patch()` or `set()`, which create a new box, `mutate()` directly alters the existing box.

```typescript
import * as DI from '@ayka/dibox';

// Create a box with initial dependencies
const box = DI.makeBox({
  count: () => 0,
  name: () => 'Alice',
});

// Mutate the 'count' dependency to always return 1
box.mutate('count', () => 1);

// Access the mutated dependency
console.log(box.get('count')); // Outputs: 1

// Mutate 'name' to include a greeting
box.mutate('name', (box) => `Hello, ${box.get('name')}!`);

// Access the mutated 'name' dependency
console.log(box.get('name')); // Outputs: Hello, Alice!
```

## Recipes

### Overriding Dependencies for Testing

```typescript
const box = makeBox({
  config: () => ({ apiUrl: 'https://api.example.com' }),
  api: () => new ApiClient(),
});

const fn = (box: typeof box) => {};

class TestApiClient extends ApiClient {}

const testBox = box.set('api', () => {
  const url = box.get('config').apiUrl;
  return new TestApiClient(url);
});

fn(testBox);
```

### Async Dependency

```typescript
const prebox = makeBox({
  config: () => ({ postgresUrl: 'postgres://localhost:5432' }),
});

const postgres = await postgresClient(prebox.get('config'));

const box = prebox.set('postgres', () => postgres);
```

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
