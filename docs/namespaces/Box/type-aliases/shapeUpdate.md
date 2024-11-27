[**@ayka/dibox**](../../../README.md) • **Docs**

***

[@ayka/dibox](../../../globals.md) / [Box](../README.md) / shapeUpdate

# Type Alias: shapeUpdate\<shape, shape2\>

> **shapeUpdate**\<`shape`, `shape2`\>: \{ \[prop in keyof shape \| keyof shape2\]: prop extends keyof shape2 ? shape2\[prop\] : prop extends keyof shape ? shape\[prop\] : never \}

## Type Parameters

• **shape** *extends* [`boxShape`](boxShape.md)

• **shape2** *extends* [`boxShape`](boxShape.md)

## Defined in

[src/Box.ts:71](https://github.com/AndreyMork/dibox/blob/a4051a8bb2daf3e4608cc74f5ffa76c67223e300/src/Box.ts#L71)
