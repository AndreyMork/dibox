[**@ayka/dibox**](../../../README.md) • **Docs**

***

[@ayka/dibox](../../../globals.md) / [Box](../README.md) / patch

# Type Alias: patch\<shape, parentShape\>

> **patch**\<`shape`, `parentShape`\>: `{ [key in keyof shape]: loadFn<parentShape, shape[key]> }`

## Type Parameters

• **shape** *extends* [`boxShape`](boxShape.md)

• **parentShape** *extends* [`boxShape`](boxShape.md)

## Defined in

[src/Box.ts:79](https://github.com/AndreyMork/dibox/blob/2bd8e5086bed82676b3941b99bf52af4c69b030c/src/Box.ts#L79)
