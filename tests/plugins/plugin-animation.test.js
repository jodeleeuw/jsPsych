// const root = '../../';

import jsPsych from '../../jspsych.js';
import jspsychAnimation from '../../plugins/jspsych-animation';

jest.useFakeTimers();

describe('animation plugin', function(){

	// beforeEach(function(){
	// 	require(root + 'jspsych.js');
	// 	require(root + 'plugins/jspsych-animation.js');
	// });

	test('loads correctly', function(){
		expect(typeof jspsychAnimation).not.toBe('undefined');
	});

	// SKIP FOR NOW
	test.skip('displays stimuli', function(){

		var animation_sequence = ['img/face_1.jpg', 'img/face_2.jpg'];

		var trial = {
			type: jspsychAnimation,
			stimuli: animation_sequence
		}

		jsPsych.init({
			timeline: [trial],
			auto_preload: false
		});

		expect(jsPsych.getDisplayElement().innerHTML).toMatch('<img src="img/face_1.jpg" id="jspsych-animation-image"></img>');
	});

});
