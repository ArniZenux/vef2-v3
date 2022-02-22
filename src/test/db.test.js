import { describe, expect, it } from '@jest/globals';
import { insert } from '../lib/db_psql.js';

describe('db', () => {
	it('innsetja vidburd i dagskra', async() => {
		const input = {
				name : 'profa',
				slug : 'profa_slug',
			};

			const output = await insert(input); 
			expect(output).toBe(true); 
	});
});
