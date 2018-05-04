/**
 * @jest-environment jsdom
 */
const root = '../../';
var jsPsych = require(root + 'jspsych.js');
window.jsPsych = jsPsych
const utils = require('../testing-utils.js');
jest.useFakeTimers();

describe('serial-reaction-time-mouse plugin', function(){

	beforeEach(function(){
		require(root + 'plugins/jspsych-serial-reaction-time-mouse.js');
	});

	test('loads correctly', function(){
		expect(typeof window.jsPsych.plugins['serial-reaction-time-mouse']).not.toBe('undefined');
	});

	test('default behavior', function(){
		var trial = {
			type: 'serial-reaction-time-mouse',
			target: [0,0],
		}

		jsPsych.init({
			timeline: [trial]
		});

		expect(document.querySelector('#jspsych-serial-reaction-time-stimulus-cell-0-0').style.backgroundColor).toBe('rgb(153, 153, 153)');
		expect(document.querySelector('#jspsych-serial-reaction-time-stimulus-cell-0-1').style.backgroundColor).toBe('');
		expect(document.querySelector('#jspsych-serial-reaction-time-stimulus-cell-0-2').style.backgroundColor).toBe('');
		expect(document.querySelector('#jspsych-serial-reaction-time-stimulus-cell-0-3').style.backgroundColor).toBe('');

		utils.mouseDownMouseUpTarget(document.querySelector('#jspsych-serial-reaction-time-stimulus-cell-0-1'));

		expect(jsPsych.getDisplayElement().innerHTML).not.toBe('');

		utils.mouseDownMouseUpTarget(document.querySelector('#jspsych-serial-reaction-time-stimulus-cell-0-0'));

		expect(jsPsych.getDisplayElement().innerHTML).toBe('');

	})

});
