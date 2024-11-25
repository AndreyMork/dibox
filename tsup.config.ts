import * as Tsup from 'tsup';
// import * as PackageJSON from '#PackageJSON';

const entry = ['src/Main.ts'];

const outDir = 'dist';
const format = ['esm' as const, 'cjs' as const];
// const external = Object.keys(PackageJSON.devDependencies);

const config = Tsup.defineConfig((opts) => ({
	entry,
	format,
	outDir,
	// external,
	clean: true,
	minify: !opts.watch,
	sourcemap: true,
	keepNames: true,
	shims: true,
	tsconfig: 'tsconfig.build.json',
}));

export default config;
