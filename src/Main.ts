export * as Box from './Box.ts';
export {
	makeBox,
	Box as box,
	DependencyNotFoundError,
	CircularDependencyError,
} from './Box.ts';
export type { patch, loadFn, boxShape, shapeOf, viewOf } from './Box.ts';
