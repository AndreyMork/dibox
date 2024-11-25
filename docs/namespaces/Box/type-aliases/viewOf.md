[**@ayka/dibox**](../../../README.md) • **Docs**

***

[@ayka/dibox](../../../globals.md) / [Box](../README.md) / viewOf

# Type Alias: viewOf\<box, keys\>

> **viewOf**\<`box`, `keys`\>: [`Box`](../classes/Box.md)\<`Pick`\<[`shapeOf`](shapeOf.md)\<`box`\>, `keys`\>\>

Creates a type representing a view of a Box with only the specified keys.

## Type Parameters

• **box** *extends* [`Box`](../classes/Box.md)\<`any`\>

The Box type to create a view from

• **keys** *extends* keyof [`shapeOf`](shapeOf.md)\<`box`\>

The keys to include in the view

## Example

```ts
const box = makeBox({
  name: () => 'Alice',
  age: () => 30,
  email: () => 'alice@example.com'
});

type UserView = viewOf<typeof box, 'name' | 'age'>;
// UserView = Box<{ name: string; age: number }>
```

## Returns

A Box type containing only the specified keys from the original Box

## Defined in

[src/Box.ts:43](https://github.com/AndreyMork/dibox/blob/2bd8e5086bed82676b3941b99bf52af4c69b030c/src/Box.ts#L43)
