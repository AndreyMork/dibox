[**@ayka/dibox**](../../../README.md) • **Docs**

***

[@ayka/dibox](../../../globals.md) / [Box](../README.md) / makeBox

# Function: makeBox()

## makeBox()

> **makeBox**(): [`Box`](../classes/Box.md)\<`object`\>

Creates a new Box instance with optional initial values.

### Returns

[`Box`](../classes/Box.md)\<`object`\>

A new Box instance

### Example

```ts
// Empty box
const box = makeBox();

// Box with initial values
const box = makeBox({
  foo: () => 'bar'
});
```

### Defined in

[src/Box.ts:794](https://github.com/AndreyMork/dibox/blob/32667f725c68d64dc5c8fc9751dde5370b7962d5/src/Box.ts#L794)

## makeBox(patch)

> **makeBox**\<`shape`\>(`patch`?): [`Box`](../classes/Box.md)\<`shape`\>

### Type Parameters

• **shape** *extends* [`boxShape`](../type-aliases/boxShape.md)

### Parameters

• **patch?**: [`patch`](../type-aliases/patch.md)\<`shape`, `object`\>

### Returns

[`Box`](../classes/Box.md)\<`shape`\>

### Defined in

[src/Box.ts:795](https://github.com/AndreyMork/dibox/blob/32667f725c68d64dc5c8fc9751dde5370b7962d5/src/Box.ts#L795)
