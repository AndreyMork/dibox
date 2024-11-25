[**@ayka/dibox**](../../../README.md) • **Docs**

***

[@ayka/dibox](../../../globals.md) / [Box](../README.md) / shapeUpdate

# Type Alias: shapeUpdate\<shape, shape2\>

> **shapeUpdate**\<`shape`, `shape2`\>: \{ \[prop in keyof shape \| keyof shape2\]: prop extends keyof shape2 ? shape2\[prop\] : prop extends keyof shape ? shape\[prop\] : never \}

## Type Parameters

• **shape** *extends* [`boxShape`](boxShape.md)

• **shape2** *extends* [`boxShape`](boxShape.md)

## Defined in

[src/Box.ts:71](https://github.com/AndreyMork/dibox/blob/2bd8e5086bed82676b3941b99bf52af4c69b030c/src/Box.ts#L71)
