/**
 * jspsych-audio-keyboard-response
 * Josh de Leeuw
 *
 * plugin for playing an audio file and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/

// BMK 23Jan2021 added sound_text param 
//     29Jun2021 moved functions inside setupTrial


jsPsych.plugins["audio-keyboard-response"] = (function () {
  var plugin = {};

  jsPsych.pluginAPI.registerPreload('audio-keyboard-response', 'stimulus', 'audio');

  plugin.info = {
    name: 'audio-keyboard-response',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.AUDIO,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The audio to be played.'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEY,
        pretty_name: 'Choices',
        array: true,
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'The maximum duration to wait for a response.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, the trial will end when user makes a response.'
      },
      trial_ends_after_audio: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Trial ends after audio',
        default: false,
        description: 'If true, then the trial will end as soon as the audio file finishes playing.'
      },
      sound_text: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt during audio presentation',
        default: 'playing sound...',
        description: 'Text to display while audio is presented'
      },
      response_allowed_while_playing: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response allowed while playing',
        default: true,
        description: 'If true, then responses are allowed while the audio is playing. ' +
          'If false, then the audio must finish playing before a response is accepted.'
      },
      click_to_start: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Button to start sound',
        default: false,
        description: 'If true, requires button click for trial to start.'
      }
    }
  }

  plugin.trial = function (display_element, trial) {

    // setup stimulus
    var context = jsPsych.pluginAPI.audioContext();
    var audio;

    // store response
    var response = {
      rt: null,
      key: null
    };

    // record webaudio context start time
    var startTime;

    // load audio file
    jsPsych.pluginAPI.getAudioBuffer(trial.stimulus)
      .then(function (buffer) {
        if (context !== null) {
          audio = context.createBufferSource();
          audio.buffer = buffer;
          audio.connect(context.destination);
        } else {
          audio = buffer;
          audio.currentTime = 0;
        }
        setupTrial();
      })
      .catch(function (err) {
        console.error(`Failed to load audio file "${trial.stimulus}". Try checking the file path. We recommend using the preload plugin to load audio files.`)
        console.error(err)
      });

    function setupTrial() {
      // set up end event if trial needs it
      if (trial.trial_ends_after_audio) {
        audio.addEventListener('ended', end_trial);
      }

      // show prompt if there is one
      if (trial.prompt !== null) {
        display_element.innerHTML = trial.prompt;
      }

      // Either start the trial or wait for the user to click start
      if(!trial.click_to_start || context==null){
        start_audio();
      } else {
        // Register callback for start sound button if we have one
        $('#start_button').on('click', function(ev){
          ev.preventDefault();
          start_audio();
        })
      }

      // start keyboard listener when trial starts or sound ends
      if (trial.response_allowed_while_playing) {
        setup_keyboard_listener();
      } else if (!trial.trial_ends_after_audio) {
        audio.addEventListener('ended', setup_keyboard_listener);
      }
    }

    // function to end trial when it is time
    function end_trial() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // stop the audio file if it is playing
      // remove end event listeners if they exist
      if (context !== null) {
        audio.stop();
      } else {
        audio.pause();
      }

      audio.removeEventListener('ended', end_trial);
      audio.removeEventListener('ended', setup_keyboard_listener);


      // kill keyboard listeners
      jsPsych.pluginAPI.cancelAllKeyboardResponses();

      // gather the data to store for the trial
      var trial_data = {
        rt: response.rt,
        stimulus: trial.stimulus,
        response: response.key
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    }

    // function to handle responses by the subject
    function after_response(info) {
      // only record the first response
      if (response.key == null) {
        response = info;
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    function setup_keyboard_listener() {
      // start the response listener
      if (context !== null) {
        jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_response,
          valid_responses: trial.choices,
          rt_method: 'audio',
          persist: false,
          allow_held_key: false,
          audio_context: context,
          audio_context_start_time: startTime
        });
      } else {
        jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_response,
          valid_responses: trial.choices,
          rt_method: 'performance',
          persist: false,
          allow_held_key: false
        });
      }
    }

    // Embed the rest of the trial into a function so that we can attach to a button if desired
    function start_audio(){
      // start audio
      if (context !== null) {
        startTime = context.currentTime;
        audio.start(startTime);
      } else {
        audio.play();
      }

      // end trial if time limit is set
      if (trial.trial_duration !== null) {
        jsPsych.pluginAPI.setTimeout(function () {
          end_trial();
        }, trial.trial_duration);
      }
      
      // clear the display
      display_element.innerHTML = trial.sound_text;
    }
  };

  return plugin;
})();
