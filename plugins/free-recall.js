jsPsych.plugins['free-recall'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'free-recall',
    description: '',
    parameters: {
      preamble: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: '',
        no_function: false,
        description: ''
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'The maximum duration to wait for a response.',
        required: true,
      },
      timeout: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Response timeout',
        default: null,
        description:'Inter response time after which recall ends'
      },
      show_countdown: {
        type: jsPsych.plugins.parameterType.BOOLEAN,
        pretty_name: 'Show countdown',
        default: false,
        description: "switch to toggle visibility of visual countdown above recall box"
      },
      countdown_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: ' Countdown duration',
        default: null,
        description: "The milliseconds before trial end at which to start countdown"
      },
      step: {
          type: jsPysch.plugins.parameterType.INT,
          pretty_name: 'Timestep to update progress bar',
          default: 5,
          description: 'The frequency at which the progress bar is updated with a new value.'
        }
    }
  }

  plugin.trial = function(display_element, trial) {

    trial.preamble = typeof trial.preamble == 'undefined' ? "" : trial.preamble;

    var startTime         = jsPsych.totalTime(); 
    var absoluteTaskEnd   = jsPsych.totalTime() + trial.trial_duration;
    var taskEnd           = (trial.timeout == null ? trial.trial_duration : trial.timeout);

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    // trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // show preamble text
    display_element.innerHTML += '<div id="jspsych-free-recall-preamble" class="jspsych-free-recall-preamble">'+trial.preamble+'</div>';

    if(trial.countdown_duration == null) {
      trial.countdown_duration = trial.trial_duration;
    }

    if(trial.show_countdown) {
      display_element.innerHTML += '<progress id="progressbar" value="0" max="100"></progress>';
    }

    // add question and textbox for answer
    display_element.innerHTML += '<div id="jspsych-free-recall" class="jspsych-free-recall-question" style="margin: 2em 0em;">'+
      '<input name="jspsych-free-recall-response" id="recall_box" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">'+
      '</div>';

    // set up response collection
    var rts = [];
    var recalled_words = [];
    var key_presses = [];
    var key_times = [];

    // automatically place cursor in textarea when page loads
    $(function(){
      $('input').focus();
    });

    var set_response_timeout= function() {
      if(trial.timeout != null) {
        clearTimeout(response_timeout);
        response_timeout = jsPsych.pluginAPI.setTimeout(end_trial);

        taskEnd = min(jsPsych.totalTime() + trial.timeout, absoluteTaskEnd);
      }
    }

    var keyboard_listener = function(info) {
       // set up response collection
      key_presses.push(info.key)
      key_times.push(info.rt)

      set_response_timeout();

      if (info.key=== ',' | info.key==='Enter' | info.key===';' | info.key===' ') {

        // get response time (when participant presses enter)
        rts.push(info.rt);
        // get recalled word

        word = document.querySelector('#recall_box').value;
        recalled_words.push(word);

        // empty the contents of the textarea
        document.querySelector('#recall_box').value = '';

        return false;
      }

      return true;
    }

    var end_trial = function() {
      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // clear the display
      display_element.innerHTML = '';

      // gather the data to store for the trial
      var trial_data = {
        "rt": rts,
        "recwords": recalled_words,
        "key_presses": key_presses,
        "key_times": key_times,
        "start_time": startTime,
        "propagate": true
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // set progressbar timeout
    var updateProgress = function() {
      var elapsed = jsPsych.totalTime() - (startTime + taskEnd);
      var length = trial.countdown_duration == null ? trial.trial_duration : trial.countdown_duration;
      var val = (elapsed / length) * 100;

      display_element.querySelector('#progressbar').style.visibility = val > 0 ? 'visible' : 'hidden';
      display_element.querySelector('#progressbar').value = val;

      jsPsych.pluginAPI.setTimeout(updateProgress, trial.step);
    }

    // set initial progress bar state and timeout
    updateProgress();

    var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
              callback_function: keyboard_listener,
              rt_method: "performance",
              allow_held_key: false,
              persist: true,
              propagate: true
        })

    if(trial.timeout != null) {
      var response_timeout = jsPsych.pluginAPI.setTimeout(end_trial);
    }

    if (trial.trial_duration > 0) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }
  };

  return plugin;
})();
