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

[src/Box.ts:21](https://github.com/AndreyMork/dibox/blob/32667f725c68d64dc5c8fc9751dde5370b7962d5/src/Box.ts#L21)
