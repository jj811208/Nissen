import React from "react";
import logo from "./logo.svg";
// import Tone from "tone";
// import ReactMediaRecorder from "react-media-recorder";
import "./App.css";
import { ReactMic } from "react-mic";
// function abc() {
//   var synth = new Tone.Synth().toMaster();
//   synth.triggerAttackRelease("G4", 0.5, 2);
//   synth.triggerAttackRelease("B4", 0.5, 3);

//   var motu = new Tone.UserMedia({
//     volume: 50,
//     mute: false
//   });
//   motu.open().then(function(x) {
//     console.log(x);
//   });
// }
var audioContext = null;
var isPlaying = false;
var sourceNode = null;
var analyser = null;
var theBuffer = null;
var DEBUGCANVAS = null;
var mediaStreamSource = null;

var rafID = null;
var tracks = null;
var buflen = 1024;
var buf = new Float32Array(buflen);
var MIN_SAMPLES = 0; // will be initialized when AudioContext is created.
var GOOD_ENOUGH_CORRELATION = 0.9; // this is the "bar" for how close a correlation needs to be

var noteStrings = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B"
];

function noteFromPitch(frequency) {
  var noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
  return Math.round(noteNum) + 69;
}

function frequencyFromNoteNumber(note) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

function centsOffFromPitch(frequency, note) {
  return Math.floor(
    (1200 * Math.log(frequency / frequencyFromNoteNumber(note))) / Math.log(2)
  );
}

function autoCorrelate(buf, sampleRate) {
  var SIZE = buf.length;
  var MAX_SAMPLES = Math.floor(SIZE / 2);
  var best_offset = -1;
  var best_correlation = 0;
  var rms = 0;
  var foundGoodCorrelation = false;
  var correlations = new Array(MAX_SAMPLES);

  for (var i = 0; i < SIZE; i++) {
    var val = buf[i];
    rms += val * val;
  }

  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01)
    // not enough signal
    return -1;

  var lastCorrelation = 1;
  for (var offset = MIN_SAMPLES; offset < MAX_SAMPLES; offset++) {
    var correlation = 0;

    for (var i = 0; i < MAX_SAMPLES; i++) {
      correlation += Math.abs(buf[i] - buf[i + offset]);
    }
    correlation = 1 - correlation / MAX_SAMPLES;
    correlations[offset] = correlation; // store it, for the tweaking we need to do below.
    if (
      correlation > GOOD_ENOUGH_CORRELATION &&
      correlation > lastCorrelation
    ) {
      foundGoodCorrelation = true;
      if (correlation > best_correlation) {
        best_correlation = correlation;
        best_offset = offset;
      }
    } else if (foundGoodCorrelation) {
      // short-circuit - we found a good correlation, then a bad one, so we'd just be seeing copies from here.
      // Now we need to tweak the offset - by interpolating between the values to the left and right of the
      // best offset, and shifting it a bit.  This is complex, and HACKY in this code (happy to take PRs!) -
      // we need to do a curve fit on correlations[] around best_offset in order to better determine precise
      // (anti-aliased) offset.

      // we know best_offset >=1,
      // since foundGoodCorrelation cannot go to true until the second pass (offset=1), and
      // we can't drop into this clause until the following pass (else if).
      var shift =
        (correlations[best_offset + 1] - correlations[best_offset - 1]) /
        correlations[best_offset];
      return sampleRate / (best_offset + 8 * shift);
    }
    lastCorrelation = correlation;
  }
  if (best_correlation > 0.01) {
    // console.log("f = " + sampleRate/best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")")
    return sampleRate / best_offset;
  }
  return -1;
  //	var best_frequency = sampleRate/best_offset;
}

function updatePitch(analyser, audioContext) {
  analyser.getFloatTimeDomainData(buf);
  console.log(audioContext.sampleRate);
  var ac = autoCorrelate(buf, audioContext.sampleRate);
  // TODO: Paint confidence meter on canvasElem here.
  console.log(ac);
  if (ac == -1) {
  } else {
    let pitch = ac;
    console.log(Math.round(pitch));
    var note = noteFromPitch(pitch);
    console.log(Math.round(noteStrings[note % 12]));
    var detune = centsOffFromPitch(pitch, note);
    if (detune == 0) {
    } else {
      // if (detune < 0) detuneElem.className = "flat";
      // else detuneElem.className = "sharp";
      // detuneAmount.innerHTML = Math.abs(detune);
      console.log(Math.abs(detune));
    }
  }

  // if (!window.requestAnimationFrame)
  //   window.requestAnimationFrame = window.webkitRequestAnimationFrame;
  // rafID = window.requestAnimationFrame(updatePitch);
}

function App() {
  const [record, setRecord] = React.useState(false);
  const [music, setMusic] = React.useState(undefined);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <audio id="player" controls src={music} />
        {/** todo: change ReactMic */}
        <ReactMic
          record={record} // defaults -> false.  Set to true to begin recording
          pause={false} // defaults -> false.  Available in React-Mic-Plus upgrade only
          className="sound-wave" // provide css class name
          onStop={function(recordedBlob) {
            console.log("chunk of real-time data is: ", recordedBlob);
            setMusic(recordedBlob.blobURL);
          }}
          onData={function(recordedBlob) {
            console.log("recordedBlob is: ", recordedBlob);

            // audioContext = new AudioContext();
            // console.log(audioContext);
            
            // mediaStreamSource = audioContext.createMediaStreamSource(
            //   recordedBlob
            // );
            // console.log(mediaStreamSource);

            // analyser = audioContext.createAnalyser();
            // console.log(analyser);
            // analyser.fftSize = 2048;
            // mediaStreamSource.connect(analyser);
            // updatePitch(analyser, audioContext);
            // }
          }}
          strokeColor="#123123"
          backgroundColor="#cccccc"
        />
        <button onClick={() => setRecord(true)} type="button">
          Start
        </button>
        <button onClick={() => setRecord(false)} type="button">
          Stop
        </button>
      </header>
    </div>
  );
}

export default App;
