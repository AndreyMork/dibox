[**@ayka/dibox**](../../../README.md) • **Docs**

***

[@ayka/dibox](../../../globals.md) / [Box](../README.md) / loadFn

# Type Alias: loadFn()\<shape, value\>

> **loadFn**\<`shape`, `value`\>: (`box`) => `value`

A function that loads a value for a Box dependency.

## Type Parameters

• **shape** *extends* [`boxShape`](boxShape.md)

The shape of the Box instance

• **value**

The type of value returned by this loader

## Parameters

• **box**: [`Box`](../classes/Box.md)\<`shape`\>

The Box instance containing dependencies

## Returns

`value`

The loaded value

## Remarks

Load functions have access to the Box instance through their first parameter,
allowing them to retrieve other dependencies using `box.get()`.

## Example

```ts
const box = makeBox({
  name: () => 'Alice',
  greeting: (box) => `Hello ${box.get('name')}!`
});
```

## Defined in

[src/Box.ts:69](https://github.com/AndreyMork/dibox/blob/32667f725c68d64dc5c8fc9751dde5370b7962d5/src/Box.ts#L69)
