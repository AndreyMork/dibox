[**@ayka/dibox**](../../../README.md) • **Docs**

***

[@ayka/dibox](../../../globals.md) / [Box](../README.md) / patch

# Type Alias: patch\<shape, parentShape\>

> **patch**\<`shape`, `parentShape`\>: `{ [key in keyof shape]: loadFn<parentShape, shape[key]> }`

## Type Parameters

• **shape** *extends* [`boxShape`](boxShape.md)

• **parentShape** *extends* [`boxShape`](boxShape.md)

## Defined in

[src/Box.ts:79](https://github.com/AndreyMork/dibox/blob/32667f725c68d64dc5c8fc9751dde5370b7962d5/src/Box.ts#L79)
