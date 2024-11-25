[**@ayka/dibox**](../../../README.md) • **Docs**

***

[@ayka/dibox](../../../globals.md) / [Box](../README.md) / patch

# Type Alias: patch\<shape, parentShape\>

> **patch**\<`shape`, `parentShape`\>: `{ [key in keyof shape]: loadFn<parentShape, shape[key]> }`

## Type Parameters

• **shape** *extends* [`boxShape`](boxShape.md)

• **parentShape** *extends* [`boxShape`](boxShape.md)

## Defined in

[src/Box.ts:79](https://github.com/AndreyMork/dibox/blob/a0c5779a3595f9dce73587b31054bdf92e8a3ef1/src/Box.ts#L79)
