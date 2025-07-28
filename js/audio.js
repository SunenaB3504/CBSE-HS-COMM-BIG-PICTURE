// Audio playback logic using Web Speech API
let synth = window.speechSynthesis;
let utterance = null;


window.playAudio = function(text) {
  if (synth.paused) {
    synth.resume();
    return;
  }
  if (synth.speaking) {
    synth.cancel();
  }
  utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  synth.speak(utterance);
};

window.pauseAudio = function() {
  if (synth.speaking && !synth.paused) {
    synth.pause();
  }
};

window.stopAudio = function() {
  if (synth.speaking) {
    synth.cancel();
  }
};

window.resumeAudio = function() {
  if (synth.paused) {
    synth.resume();
  }
};
