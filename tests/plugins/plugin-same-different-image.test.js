// const root = '../../';
const utils = require('../testing-utils.js');

import jsPsych from '../../jspsych.js';
import sameDifferentImage from '../../plugins/jspsych-same-different-image.js';

jest.useFakeTimers();

describe('same-different-image plugin', function(){

	// beforeEach(function(){
	// 	require(root + 'jspsych.js');
	// 	require(root + 'plugins/jspsych-same-different-image.js');
	// });

	test('loads correctly', function(){
		expect(typeof sameDifferentImage).not.toBe('undefined');
	});

});
