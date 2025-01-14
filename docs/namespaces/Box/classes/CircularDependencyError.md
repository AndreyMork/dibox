[**@ayka/dibox**](../../../README.md) • **Docs**

***

[@ayka/dibox](../../../globals.md) / [Box](../README.md) / CircularDependencyError

# Class: CircularDependencyError

## Extends

- `Error`

## Constructors

### new CircularDependencyError()

> **new CircularDependencyError**(`params`): [`CircularDependencyError`](CircularDependencyError.md)

#### Parameters

• **params**

• **params.box**: [`Box`](Box.md)\<`any`\>

• **params.key**: [`boxKey`](../type-aliases/boxKey.md)

• **params.unresolvedKeys**: `Set`\<[`boxKey`](../type-aliases/boxKey.md)\>

#### Returns

[`CircularDependencyError`](CircularDependencyError.md)

#### Overrides

`Error.constructor`

#### Defined in

[src/Box.ts:847](https://github.com/AndreyMork/dibox/blob/32667f725c68d64dc5c8fc9751dde5370b7962d5/src/Box.ts#L847)

## Properties

### box

> `readonly` **box**: [`Box`](Box.md)\<`any`\>

#### Defined in

[src/Box.ts:844](https://github.com/AndreyMork/dibox/blob/32667f725c68d64dc5c8fc9751dde5370b7962d5/src/Box.ts#L844)

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

[src/Box.ts:843](https://github.com/AndreyMork/dibox/blob/32667f725c68d64dc5c8fc9751dde5370b7962d5/src/Box.ts#L843)

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

### unresolvedKeys

> `readonly` **unresolvedKeys**: `Set`\<[`boxKey`](../type-aliases/boxKey.md)\>

#### Defined in

[src/Box.ts:845](https://github.com/AndreyMork/dibox/blob/32667f725c68d64dc5c8fc9751dde5370b7962d5/src/Box.ts#L845)

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
