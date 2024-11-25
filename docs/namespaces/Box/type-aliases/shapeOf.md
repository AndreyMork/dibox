[**@ayka/dibox**](../../../README.md) • **Docs**

***

[@ayka/dibox](../../../globals.md) / [Box](../README.md) / shapeOf

# Type Alias: shapeOf\<t\>

> **shapeOf**\<`t`\>: `t` *extends* [`Box`](../classes/Box.md)\<infer shape\> ? `shape` : `never`

Extracts the shape type from a Box instance.

## Type Parameters

• **t** *extends* [`Box`](../classes/Box.md)\<`any`\>

The Box type to extract the shape from

## Example

```ts
const box = makeBox({
  foo: () => 'bar',
  count: () => 42
});

type BoxShape = shapeOf<typeof box>;
// BoxShape = { foo: string; count: number }
```

## Returns

The shape type of the Box instance

## Defined in

[src/Box.ts:21](https://github.com/AndreyMork/dibox/blob/a0c5779a3595f9dce73587b31054bdf92e8a3ef1/src/Box.ts#L21)
