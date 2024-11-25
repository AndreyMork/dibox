import { expect } from '@japa/expect';
import { expectTypeOf } from '@japa/expect-type';
import * as Japa from '@japa/runner';

Japa.processCLIArgs(process.argv.slice(2));

Japa.configure({
	files: ['tests/**/*.test.(ts|js)'],
	plugins: [
		//
		expect(),
		expectTypeOf(),
	],
});

Japa.run();
