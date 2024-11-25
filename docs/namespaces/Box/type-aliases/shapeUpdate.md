[**@ayka/dibox**](../../../README.md) • **Docs**

***

[@ayka/dibox](../../../globals.md) / [Box](../README.md) / shapeUpdate

# Type Alias: shapeUpdate\<shape, shape2\>

> **shapeUpdate**\<`shape`, `shape2`\>: \{ \[prop in keyof shape \| keyof shape2\]: prop extends keyof shape2 ? shape2\[prop\] : prop extends keyof shape ? shape\[prop\] : never \}

## Type Parameters

• **shape** *extends* [`boxShape`](boxShape.md)

• **shape2** *extends* [`boxShape`](boxShape.md)

## Defined in

[src/Box.ts:71](https://github.com/AndreyMork/dibox/blob/695789d45a4ef94d6e684c565b58e5a5027b964e/src/Box.ts#L71)
