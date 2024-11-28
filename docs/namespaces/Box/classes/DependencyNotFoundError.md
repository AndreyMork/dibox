[**@ayka/dibox**](../../../README.md) • **Docs**

***

[@ayka/dibox](../../../globals.md) / [Box](../README.md) / DependencyNotFoundError

# Class: DependencyNotFoundError

## Extends

- `Error`

## Constructors

### new DependencyNotFoundError()

> **new DependencyNotFoundError**(`key`, `box`): [`DependencyNotFoundError`](DependencyNotFoundError.md)

#### Parameters

• **key**: [`boxKey`](../type-aliases/boxKey.md)

• **box**: [`Box`](Box.md)\<`any`\>

#### Returns

[`DependencyNotFoundError`](DependencyNotFoundError.md)

#### Overrides

`Error.constructor`

#### Defined in

[src/Box.ts:824](https://github.com/AndreyMork/dibox/blob/32667f725c68d64dc5c8fc9751dde5370b7962d5/src/Box.ts#L824)

## Properties

### box

> `readonly` **box**: [`Box`](Box.md)\<`any`\>

#### Defined in

[src/Box.ts:823](https://github.com/AndreyMork/dibox/blob/32667f725c68d64dc5c8fc9751dde5370b7962d5/src/Box.ts#L823)

***

### cause?

> `optional` **cause**: `unknown`

#### Inherited from

`Error.cause`

#### Defined in

node\_modules/.pnpm/typescript@5.7.2/node\_modules/typescript/lib/lib.es2022.error.d.ts:26

***

### key

> `readonly` **key**: [`boxKey`](../type-aliases/boxKey.md)

#### Defined in

[src/Box.ts:822](https://github.com/AndreyMork/dibox/blob/32667f725c68d64dc5c8fc9751dde5370b7962d5/src/Box.ts#L822)

***

### message

> **message**: `string`

#### Inherited from

`Error.message`

#### Defined in

node\_modules/.pnpm/typescript@5.7.2/node\_modules/typescript/lib/lib.es5.d.ts:1077

***

### name

> **name**: `string`

#### Inherited from

`Error.name`

#### Defined in

node\_modules/.pnpm/typescript@5.7.2/node\_modules/typescript/lib/lib.es5.d.ts:1076

***

### stack?

> `optional` **stack**: `string`

#### Inherited from

`Error.stack`

#### Defined in

node\_modules/.pnpm/typescript@5.7.2/node\_modules/typescript/lib/lib.es5.d.ts:1078

***

### prepareStackTrace()?

> `static` `optional` **prepareStackTrace**: (`err`, `stackTraces`) => `any`

Optional override for formatting stack traces

#### Parameters

• **err**: `Error`

• **stackTraces**: `CallSite`[]

#### Returns

`any`

#### See

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

#### Inherited from

`Error.prepareStackTrace`

#### Defined in

node\_modules/.pnpm/@types+node@22.9.3/node\_modules/@types/node/globals.d.ts:143

***

### stackTraceLimit

> `static` **stackTraceLimit**: `number`

#### Inherited from

`Error.stackTraceLimit`

#### Defined in

node\_modules/.pnpm/@types+node@22.9.3/node\_modules/@types/node/globals.d.ts:145

## Accessors

### knownKeys

#### Get Signature

> **get** **knownKeys**(): (`string` \| `number` \| `symbol`)[]

##### Returns

(`string` \| `number` \| `symbol`)[]

#### Defined in

[src/Box.ts:837](https://github.com/AndreyMork/dibox/blob/32667f725c68d64dc5c8fc9751dde5370b7962d5/src/Box.ts#L837)

## Methods

### captureStackTrace()

> `static` **captureStackTrace**(`targetObject`, `constructorOpt`?): `void`

Create .stack property on a target object

#### Parameters

• **targetObject**: `object`

• **constructorOpt?**: `Function`

#### Returns

`void`

#### Inherited from

`Error.captureStackTrace`

#### Defined in

node\_modules/.pnpm/@types+node@22.9.3/node\_modules/@types/node/globals.d.ts:136
