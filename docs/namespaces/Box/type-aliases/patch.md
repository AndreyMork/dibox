[**@ayka/dibox**](../../../README.md) • **Docs**

***

[@ayka/dibox](../../../globals.md) / [Box](../README.md) / patch

# Type Alias: patch\<shape, parentShape\>

> **patch**\<`shape`, `parentShape`\>: `{ [key in keyof shape]: loadFn<parentShape, shape[key]> }`

## Type Parameters

• **shape** *extends* [`boxShape`](boxShape.md)

• **parentShape** *extends* [`boxShape`](boxShape.md)

## Defined in

[src/Box.ts:79](https://github.com/AndreyMork/dibox/blob/695789d45a4ef94d6e684c565b58e5a5027b964e/src/Box.ts#L79)
