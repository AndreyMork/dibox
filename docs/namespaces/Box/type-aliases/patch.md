[**@ayka/dibox**](../../../README.md) • **Docs**

***

[@ayka/dibox](../../../globals.md) / [Box](../README.md) / patch

# Type Alias: patch\<shape, parentShape\>

> **patch**\<`shape`, `parentShape`\>: `{ [key in keyof shape]: loadFn<parentShape, shape[key]> }`

## Type Parameters

• **shape** *extends* [`boxShape`](boxShape.md)

• **parentShape** *extends* [`boxShape`](boxShape.md)

## Defined in

[src/Box.ts:79](https://github.com/AndreyMork/dibox/blob/a4051a8bb2daf3e4608cc74f5ffa76c67223e300/src/Box.ts#L79)
