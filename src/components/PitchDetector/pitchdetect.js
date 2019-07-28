/*
The MIT License (MIT)

Copyright (c) 2014 Chris Wilson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
var synth = new Tone.Synth().toMaster();
window.AudioContext = window.AudioContext || window.webkitAudioContext;

var pitchTimes = 0;
var voiceHeight = null;

var allVoice = {};
var allVoiceArray = [];
var isCatchVoice = false;

var audioContext = null;
var isPlaying = false;
var sourceNode = null;
var analyser = null;
var theBuffer = null;
var DEBUGCANVAS = null;
var mediaStreamSource = null;
var detectorElem, waveCanvas, pitchElem, noteElem, detuneElem, detuneAmount;

window.onload = function() {
  audioContext = new AudioContext();
  MAX_SIZE = Math.max(4, Math.floor(audioContext.sampleRate / 5000)); // corresponds to a 5kHz signal

  var request = new XMLHttpRequest();
  request.open("GET", "./sounds/c.aac", true);
  request.responseType = "arraybuffer";
  request.onload = function() {
    audioContext.decodeAudioData(request.response, function(buffer) {
      theBuffer = buffer;
    });
  };
  request.send();

  detectorElem = document.getElementById("detector");
  pitchElem = document.getElementById("pitch");
  noteElem = document.getElementById("note");
  detuneElem = document.getElementById("detune");
  detuneAmount = document.getElementById("detune_amt");
  DEBUGCANVAS = document.getElementById("waveform");
  if (DEBUGCANVAS) {
    waveCanvas = DEBUGCANVAS.getContext("2d");
    waveCanvas.strokeStyle = "black";
    waveCanvas.lineWidth = 1;
  }

  detectorElem.ondragenter = function() {
    this.classList.add("droptarget");
    return false;
  };
  detectorElem.ondragleave = function() {
    this.classList.remove("droptarget");
    return false;
  };
  detectorElem.ondrop = function(e) {
    this.classList.remove("droptarget");
    e.preventDefault();
    theBuffer = null;

    var reader = new FileReader();
    reader.onload = function(event) {
      audioContext.decodeAudioData(
        event.target.result,
        function(buffer) {
          theBuffer = buffer;
        },
        function() {
          alert("error loading!");
        }
      );
    };
    reader.onerror = function(event) {
      alert("Error: " + reader.error);
    };
    reader.readAsArrayBuffer(e.dataTransfer.files[0]);
    return false;
  };
};

function error() {
  alert("Stream generation failed.");
}

function getUserMedia(dictionary, callback) {
  //不知道為啥一定要這樣才可以錄音
  sourceNode = audioContext.createBufferSource();
  sourceNode.buffer = theBuffer;
  sourceNode.loop = true;
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  sourceNode.connect(analyser);
  analyser.connect(audioContext.destination);
  sourceNode.start(0);
  sourceNode.stop(0);

  try {
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;
    navigator.getUserMedia(dictionary, callback, error);
  } catch (e) {
    alert("getUserMedia threw exception :" + e);
  }
}

function gotStream(stream) {
  // Create an AudioNode from the stream.
  mediaStreamSource = audioContext.createMediaStreamSource(stream);
  // Connect it to the destination.
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  mediaStreamSource.connect(analyser);

  updatePitch();
}

function toggleCatchVoice() {
  if (isCatchVoice) {
    console.log(allVoice);
    console.log(allVoiceArray);

    playTheCatchVoice(allVoiceArray);
    // var testVoice = [
    //   { pitch: "D#3", time: 1561816362788 },
    //   { pitch: "D#3", time: 1561816362815 },
    //   { pitch: "D#3", time: 1561816362844 },
    //   { pitch: "D#3", time: 1561816362855 },
    //   { pitch: "D#3", time: 1561816362871 },
    //   { pitch: "D#3", time: 1561816362888 },
    //   { pitch: "D#3", time: 1561816362905 },
    //   { pitch: "D#3", time: 1561816362922 },
    //   { pitch: "D#3", time: 1561816362938 },
    //   { pitch: "D#3", time: 1561816362956 },
    //   { pitch: "D#3", time: 1561816362972 },
    //   { pitch: "D#3", time: 1561816362989 },
    //   { pitch: "D#3", time: 1561816363006 },
    //   { pitch: "D#3", time: 1561816363021 },
    //   { pitch: "D#3", time: 1561816363038 },
    //   { pitch: "F3", time: 1561816363148 },
    //   { pitch: "F3", time: 1561816363165 },
    //   { pitch: "F3", time: 1561816363181 },
    //   { pitch: "F3", time: 1561816363198 },
    //   { pitch: "F3", time: 1561816363215 },
    //   { pitch: "F3", time: 1561816363232 },
    //   { pitch: "F3", time: 1561816363248 },
    //   { pitch: "F3", time: 1561816363265 },
    //   { pitch: "F3", time: 1561816363282 },
    //   { pitch: "F3", time: 1561816363298 },
    //   { pitch: "F3", time: 1561816363315 },
    //   { pitch: "F3", time: 1561816363332 },
    //   { pitch: "F3", time: 1561816363348 },
    //   { pitch: "F3", time: 1561816363366 },
    //   { pitch: "F3", time: 1561816363383 },
    //   { pitch: "F3", time: 1561816363400 },
    //   { pitch: "G#3", time: 1561816363533 },
    //   { pitch: "G#3", time: 1561816363550 },
    //   { pitch: "G#3", time: 1561816363582 },
    //   { pitch: "G#3", time: 1561816363600 },
    //   { pitch: "G#3", time: 1561816363615 },
    //   { pitch: "G3", time: 1561816363634 },
    //   { pitch: "G3", time: 1561816363649 },
    //   { pitch: "G3", time: 1561816363665 },
    //   { pitch: "G3", time: 1561816363683 },
    //   { pitch: "G3", time: 1561816363699 },
    //   { pitch: "G3", time: 1561816363716 },
    //   { pitch: "G3", time: 1561816363733 },
    //   { pitch: "G3", time: 1561816363750 },
    //   { pitch: "G3", time: 1561816363766 },
    //   { pitch: "D3", time: 1561816363899 },
    //   { pitch: "D3", time: 1561816363933 },
    //   { pitch: "D3", time: 1561816363949 },
    //   { pitch: "D3", time: 1561816363966 },
    //   { pitch: "D3", time: 1561816363982 },
    //   { pitch: "D3", time: 1561816364000 },
    //   { pitch: "D3", time: 1561816364016 },
    //   { pitch: "D3", time: 1561816364034 },
    //   { pitch: "D#3", time: 1561816364050 },
    //   { pitch: "D#3", time: 1561816364066 },
    //   { pitch: "D#3", time: 1561816364083 },
    //   { pitch: "D#3", time: 1561816364098 },
    //   { pitch: "D#3", time: 1561816364116 },
    //   { pitch: "D#3", time: 1561816364133 },
    //   { pitch: "D#3", time: 1561816364148 },
    //   { pitch: "D#3", time: 1561816364165 },
    //   { pitch: "A#3", time: 1561816364316 },
    //   { pitch: "A#3", time: 1561816364333 },
    //   { pitch: "A#3", time: 1561816364349 },
    //   { pitch: "A#3", time: 1561816364365 },
    //   { pitch: "A#3", time: 1561816364383 },
    //   { pitch: "A#3", time: 1561816364399 },
    //   { pitch: "A#3", time: 1561816364417 },
    //   { pitch: "A#3", time: 1561816364432 },
    //   { pitch: "A#3", time: 1561816364449 },
    //   { pitch: "A#3", time: 1561816364467 },
    //   { pitch: "A#3", time: 1561816364483 },
    //   { pitch: "A#3", time: 1561816364499 },
    //   { pitch: "A#3", time: 1561816364516 },
    //   { pitch: "A#3", time: 1561816364533 },
    //   { pitch: "A#3", time: 1561816364549 },
    //   { pitch: "A#3", time: 1561816364566 },
    //   { pitch: "A#3", time: 1561816364583 },
    //   { pitch: "A#3", time: 1561816364600 },
    //   { pitch: "A#3", time: 1561816364616 },
    //   { pitch: "A#3", time: 1561816364632 },
    //   { pitch: "A#3", time: 1561816364649 },
    //   { pitch: "A#3", time: 1561816364667 },
    //   { pitch: "A#3", time: 1561816364683 },
    //   { pitch: "A#3", time: 1561816364700 },
    //   { pitch: "A#3", time: 1561816364716 },
    //   { pitch: "A#3", time: 1561816364733 },
    //   { pitch: "A#3", time: 1561816364749 },
    //   { pitch: "A#3", time: 1561816364766 },
    //   { pitch: "A#3", time: 1561816364782 },
    //   { pitch: "A#3", time: 1561816364800 },
    //   { pitch: "A#3", time: 1561816364815 },
    //   { pitch: "A#3", time: 1561816364832 },
    //   { pitch: "A#3", time: 1561816364850 },
    //   { pitch: "A#3", time: 1561816364866 },
    //   { pitch: "A#3", time: 1561816364882 },
    //   { pitch: "A#3", time: 1561816364898 },
    //   { pitch: "A#3", time: 1561816364917 },
    //   { pitch: "A#3", time: 1561816364932 },
    //   { pitch: "A#3", time: 1561816364949 },
    //   { pitch: "A#3", time: 1561816364967 },
    //   { pitch: "A#3", time: 1561816364983 },
    //   { pitch: "A#3", time: 1561816365000 },
    //   { pitch: "A#3", time: 1561816365016 },
    //   { pitch: "A#3", time: 1561816365033 },
    //   { pitch: "A#3", time: 1561816365049 },
    //   { pitch: "A#3", time: 1561816365066 },
    //   { pitch: "A#3", time: 1561816365083 },
    //   { pitch: "A#3", time: 1561816365099 }
    // ];
    // console.log(testVoice);
    // playTheCatchVoice(testVoice);

    // let voicce = getMode(allVoiceArray);
    // document.getElementById("test").innerText = "你唱的是: " + voicce;

    allVoice = {};
    allVoiceArray = [];
    isCatchVoice = false;

    // var synth = new Tone.Synth().toMaster();
    return "測音高";
  } else {
    isCatchVoice = true;
    return "輸出結果";
  }
}
function abc() {
  var a = new Tone.Synth().toMaster();
  console.log(Tone);
  Tone.Transport.schedule(() => {
    a.triggerAttackRelease("c4", 1, 0.4);
  }, 0);

  //set the transport to repeat
  Tone.Transport.loopEnd = "1m";
  Tone.Transport.loop = true;
  // setTimeout(()=>{a.dispose();},1200)
}

function playTheCatchVoice(catchedVoice) {
  var voiceCat = [];
  var allowWrongLimit = 6;

  for (var i = 0; i < catchedVoice.length; i++) {
    let diffPitchCount = 0;
    for (var j = i + 1; j < catchedVoice.length; j++) {
      if (catchedVoice[i].pitch !== catchedVoice[j].pitch) {
        diffPitchCount++;
      }
      if (diffPitchCount >= allowWrongLimit) break;
    }

    var targetPitchNumber =
      j - diffPitchCount <= catchedVoice.length - 1
        ? j - diffPitchCount
        : catchedVoice.length - 1;

    //一個音持續了多久
    var PitchKeepSecond =
      (catchedVoice[targetPitchNumber].time - catchedVoice[i].time) / 1000;

    voiceCat.push({
      pitch: catchedVoice[i].pitch,
      sec: PitchKeepSecond,
      count: targetPitchNumber - i
    });

    i = targetPitchNumber;
    // console.log(i);
    // console.log(
    //   j - diffPitchCount + 1 <= catchedVoice.length
    //     ? j - diffPitchCount + 1
    //     : j - diffPitchCount
    // );
    // console.log("---");
  }
  console.log(voiceCat);
  var newCat = [];
  var prevCount = 0;
  voiceCat.forEach((v, i) => {
    if (v.count < allowWrongLimit) {
      prevCount++;
      if (i - prevCount > 0) {
        newCat[i - prevCount].sec += v.sec;
        newCat[i - prevCount].count += v.count;
      }
    } else {
      newCat.push({ pitch: v.pitch, sec: v.sec, count: v.count });

    }
  });
  console.log(newCat);

  var allTime = 0;
  newCat.forEach((v, i) => {
    synth.triggerAttackRelease(v.pitch, v.sec, 0.5 + (allTime + 0.001));
    allTime += v.sec + 0.001;
  });
}

function toggleLiveInput() {
  if (isPlaying) {
    //stop playing and return
    sourceNode.stop(0);
    sourceNode = null;
    analyser = null;
    isPlaying = false;
    if (!window.cancelAnimationFrame)
      window.cancelAnimationFrame = window.webkitCancelAnimationFrame;
    window.cancelAnimationFrame(rafID);
  }
  getUserMedia(
    {
      audio: {
        mandatory: {
          googEchoCancellation: "false",
          googAutoGainControl: "false",
          googNoiseSuppression: "false",
          googHighpassFilter: "false"
        },
        optional: []
      }
    },
    gotStream
  );
}

function togglePlayback() {
  if (isPlaying) {
    //stop playing and return
    sourceNode.stop(0);
    sourceNode = null;
    analyser = null;
    isPlaying = false;
    if (!window.cancelAnimationFrame)
      window.cancelAnimationFrame = window.webkitCancelAnimationFrame;
    window.cancelAnimationFrame(rafID);
    return "聲音檔";
  }

  sourceNode = audioContext.createBufferSource();
  sourceNode.buffer = theBuffer;
  sourceNode.loop = true;

  analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  sourceNode.connect(analyser);
  analyser.connect(audioContext.destination);
  sourceNode.start(0);
  isPlaying = true;
  isLiveInput = false;
  updatePitch();

  return "停止播放";
}

var rafID = null;
var buflen = 1024;
var buf = new Float32Array(buflen);

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
var scaleStrings = [
  "低低低低低音",
  "低低低低音",
  "低低低音",
  "1",
  "2",
  "3",
  "4",
  "5",
  "高高高音",
  "高高高高音",
  "高高高高高音"
];
// var noteStrings = [
//   "Do",
//   "Do#",
//   "Re",
//   "Re#",
//   "Mi",
//   "Fa",
//   "Fa#",
//   "So",
//   "So#",
//   "La",
//   "La#",
//   "Si"
// ];
// var scaleStrings = [
//   "低低低低低音",
//   "低低低低音",
//   "低低低音",
//   "低低音",
//   "低音",
//   "中央",
//   "高音",
//   "高高音",
//   "高高高音",
//   "高高高高音",
//   "高高高高高音"
// ];

function noteFromPitch(frequency) {
  var noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
  return Math.round(noteNum) + 69;
}
function noteFromPitchForCanvas(frequency) {
  var noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
  return noteNum + 69;
}

function frequencyFromNoteNumber(note) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

function centsOffFromPitch(frequency, note) {
  return Math.floor(
    (1200 * Math.log(frequency / frequencyFromNoteNumber(note))) / Math.log(2)
  );
}

function keyFromNote(note) {
  return noteStrings[note % 12] + scaleStrings[Math.floor(note / 12)];
}

function updatePitch() {
  analyser.getFloatTimeDomainData(buf);

  var ac = AMDFDetector(buf);
  // console.log('amdf',ac);
  // var ac2 = yinDetector(buf);
  // console.log('yin',ac2);
  // var ac3 = dwDetector(buf);
  // console.log('dw',ac3);

  // if (ac !== null) console.log(ac);
  var myNoteForCanvas = noteFromPitchForCanvas(ac) + 13;
  var myNote = Math.round(myNoteForCanvas);
  // console.log(myNote);

  //假設人聲發不出高高高 低低低的聲音 如有感測到 就過濾掉
  if (myNote < 36 || myNote > 95) ac = null;

  if (DEBUGCANVAS) {
    waveCanvas.clearRect(0, 0, 512, 840);
    waveCanvas.strokeStyle = "black";
    waveCanvas.beginPath();
    waveCanvas.lineWidth = 5;
    waveCanvas.moveTo(80, 13.3);
    waveCanvas.lineTo(80, 826.7);
    waveCanvas.stroke();

    waveCanvas.lineWidth = 1;
    waveCanvas.font = "13px Verdana ";
    var space = 6.779661016949152;
    waveCanvas.moveTo(0, 13.3);
    waveCanvas.lineTo(80, 13.3);
    for (var i = 36; i <= 95; i++) {
      waveCanvas.fillStyle = "#666";
      waveCanvas.moveTo(0, 820 - ((i - 36) / 59) * 800 + space);
      waveCanvas.lineTo(80, 820 - ((i - 36) / 59) * 800 + space);
      waveCanvas.fillText(keyFromNote(i), 2, 820 - ((i - 36) / 59) * 800 + 5);
    }

    waveCanvas.stroke();
    waveCanvas.strokeStyle = "red";
    waveCanvas.fillStyle = "red"; //填充顏色,預設是黑色

    waveCanvas.beginPath();
    // var top = 8000;
    // var yp = ac/top*256;     //36~107    107=59   36=0
    // myNote=36
    waveCanvas.arc(
      80,
      820 - ((myNoteForCanvas - 36) / 59) * 800,
      7,
      Math.PI,
      Math.PI * 4
    );

    // for (var i = 1; i < 512; i++) {
    //   waveCanvas.lineTo(i, 128 + buf[i] * 128);
    // }
    // waveCanvas.lineTo(i, 128 + buf[i] * 128);
    waveCanvas.fill(); //畫實心圓
    waveCanvas.stroke();
  }

  if (ac === null) {
    noteElem.innerText = "-";
    // detectorElem.className = "vague";
    // pitchElem.innerText = "--";
    // detuneElem.className = "";
    // detuneAmount.innerText = "--";
  } else {
    detectorElem.className = "confident";
    pitch = ac;
    // pitchElem.innerText = Math.round(pitch);
    var note = myNote; // 72 = 中央do 大概吧
    var theScale = keyFromNote(note);
    noteElem.innerHTML = theScale;

    if (isCatchVoice) {
      allVoiceArray.push({ pitch: theScale, time: new Date().getTime() });
      allVoice[theScale] = !!allVoice[theScale] ? allVoice[theScale] + 1 : 1;
    }

    //上一個演算法 連續六個一樣就echo一次  應該用不到了
    // if (voiceHeight !== theScale) {
    //   voiceHeight = theScale;
    //   pitchTimes = 0;
    // } else if (pitchTimes >= 5) {
    //   console.log(voiceHeight);
    //   pitchTimes = 0;
    //   voiceHeight = null;
    // } else {
    //   pitchTimes += 1;
    // }

    //不知道detune是什麼 先保留
    // var detune = centsOffFromPitch(pitch, note);
    // if (detune == 0) {
    //   detuneElem.className = "";
    //   detuneAmount.innerHTML = "--";
    // } else {
    //   if (detune < 0) detuneElem.className = "flat";
    //   else detuneElem.className = "sharp";
    //   detuneAmount.innerHTML = Math.abs(detune);
    // }
  }

  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = window.webkitRequestAnimationFrame;
  rafID = window.requestAnimationFrame(updatePitch);
}

//取眾數
function getMode(arr) {
  let countList = {};
  for (let value of arr) {
    value = value.toString();
    if (!countList[value]) countList[value] = 0;
    countList[value]++;
  }
  let maxCount = 0;
  let mode = [];
  for (let prop in countList) {
    if (maxCount < countList[prop]) {
      maxCount = countList[prop];
      mode = [prop];
    } else if (maxCount === countList[prop]) {
      mode.push(prop);
    }
  }

  // if (mode.length === Object.keys(countList).length) {
  //   mode = [];
  // }

  return mode[0];
}

//音高演算法
const AMDFDetector = AMDF();
function AMDF(config = {}) {
  const DEFAULT_MIN_FREQUENCY = 82;
  const DEFAULT_MAX_FREQUENCY = 1000;
  const DEFAULT_RATIO = 5;
  const DEFAULT_SENSITIVITY = 0.1;
  const DEFAULT_SAMPLE_RATE = 44100;

  const sampleRate = config.sampleRate || DEFAULT_SAMPLE_RATE;
  const minFrequency = config.minFrequency || DEFAULT_MIN_FREQUENCY;
  const maxFrequency = config.maxFrequency || DEFAULT_MAX_FREQUENCY;
  const sensitivity = config.sensitivity || DEFAULT_SENSITIVITY;
  const ratio = config.ratio || DEFAULT_RATIO;
  const amd = [];

  /* Round in such a way that both exact minPeriod as 
   exact maxPeriod lie inside the rounded span minPeriod-maxPeriod,
   thus ensuring that minFrequency and maxFrequency can be found
   even in edge cases */
  const maxPeriod = Math.ceil(sampleRate / minFrequency);
  const minPeriod = Math.floor(sampleRate / maxFrequency);

  return function AMDFDetector(float32AudioBuffer) {
    "use strict";

    const maxShift = float32AudioBuffer.length;

    let t = 0;
    let minval = Infinity;
    let maxval = -Infinity;
    let frames1, frames2, calcSub, i, j, u, aux1, aux2;

    // Find the average magnitude difference for each possible period offset.
    for (i = 0; i < maxShift; i++) {
      if (minPeriod <= i && i <= maxPeriod) {
        for (
          aux1 = 0, aux2 = i, t = 0, frames1 = [], frames2 = [];
          aux1 < maxShift - i;
          t++, aux2++, aux1++
        ) {
          frames1[t] = float32AudioBuffer[aux1];
          frames2[t] = float32AudioBuffer[aux2];
        }

        // Take the difference between these frames.
        const frameLength = frames1.length;
        calcSub = [];
        for (u = 0; u < frameLength; u++) {
          calcSub[u] = frames1[u] - frames2[u];
        }

        // Sum the differences.
        let summation = 0;
        for (u = 0; u < frameLength; u++) {
          summation += Math.abs(calcSub[u]);
        }
        amd[i] = summation;
      }
    }

    for (j = minPeriod; j < maxPeriod; j++) {
      if (amd[j] < minval) minval = amd[j];
      if (amd[j] > maxval) maxval = amd[j];
    }

    const cutoff = Math.round(sensitivity * (maxval - minval) + minval);
    for (j = minPeriod; j <= maxPeriod && amd[j] > cutoff; j++);

    const search_length = minPeriod / 2;
    minval = amd[j];
    let minpos = j;
    for (i = j - 1; i < j + search_length && i <= maxPeriod; i++) {
      if (amd[i] < minval) {
        minval = amd[i];
        minpos = i;
      }
    }

    if (Math.round(amd[minpos] * ratio) < maxval) {
      return sampleRate / minpos;
    } else {
      return null;
    }
  };
}

const yinDetector = yin();
function yin(config = {}) {
  const DEFAULT_THRESHOLD = 0.1;
  const DEFAULT_SAMPLE_RATE = 44100;
  const DEFAULT_PROBABILITY_THRESHOLD = 0.1;

  const threshold = config.threshold || DEFAULT_THRESHOLD;
  const sampleRate = config.sampleRate || DEFAULT_SAMPLE_RATE;
  const probabilityThreshold =
    config.probabilityThreshold || DEFAULT_PROBABILITY_THRESHOLD;

  return function YINDetector(float32AudioBuffer) {
    "use strict";

    // Set buffer size to the highest power of two below the provided buffer's length.
    let bufferSize;
    for (
      bufferSize = 1;
      bufferSize < float32AudioBuffer.length;
      bufferSize *= 2
    );
    bufferSize /= 2;

    // Set up the yinBuffer as described in step one of the YIN paper.
    const yinBufferLength = bufferSize / 2;
    const yinBuffer = new Float32Array(yinBufferLength);

    let probability, tau;

    // Compute the difference function as described in step 2 of the YIN paper.
    for (let t = 0; t < yinBufferLength; t++) {
      yinBuffer[t] = 0;
    }
    for (let t = 1; t < yinBufferLength; t++) {
      for (let i = 0; i < yinBufferLength; i++) {
        const delta = float32AudioBuffer[i] - float32AudioBuffer[i + t];
        yinBuffer[t] += delta * delta;
      }
    }

    // Compute the cumulative mean normalized difference as described in step 3 of the paper.
    yinBuffer[0] = 1;
    yinBuffer[1] = 1;
    let runningSum = 0;
    for (let t = 1; t < yinBufferLength; t++) {
      runningSum += yinBuffer[t];
      yinBuffer[t] *= t / runningSum;
    }

    // Compute the absolute threshold as described in step 4 of the paper.
    // Since the first two positions in the array are 1,
    // we can start at the third position.
    for (tau = 2; tau < yinBufferLength; tau++) {
      if (yinBuffer[tau] < threshold) {
        while (
          tau + 1 < yinBufferLength &&
          yinBuffer[tau + 1] < yinBuffer[tau]
        ) {
          tau++;
        }
        // found tau, exit loop and return
        // store the probability
        // From the YIN paper: The threshold determines the list of
        // candidates admitted to the set, and can be interpreted as the
        // proportion of aperiodic power tolerated
        // within a periodic signal.
        //
        // Since we want the periodicity and and not aperiodicity:
        // periodicity = 1 - aperiodicity
        probability = 1 - yinBuffer[tau];
        break;
      }
    }

    // if no pitch found, return null.
    if (tau == yinBufferLength || yinBuffer[tau] >= threshold) {
      return null;
    }

    // If probability too low, return -1.
    if (probability < probabilityThreshold) {
      return null;
    }

    /**
     * Implements step 5 of the AUBIO_YIN paper. It refines the estimated tau
     * value using parabolic interpolation. This is needed to detect higher
     * frequencies more precisely. See http://fizyka.umk.pl/nrbook/c10-2.pdf and
     * for more background
     * http://fedc.wiwi.hu-berlin.de/xplore/tutorials/xegbohtmlnode62.html
     */
    let betterTau, x0, x2;
    if (tau < 1) {
      x0 = tau;
    } else {
      x0 = tau - 1;
    }
    if (tau + 1 < yinBufferLength) {
      x2 = tau + 1;
    } else {
      x2 = tau;
    }
    if (x0 === tau) {
      if (yinBuffer[tau] <= yinBuffer[x2]) {
        betterTau = tau;
      } else {
        betterTau = x2;
      }
    } else if (x2 === tau) {
      if (yinBuffer[tau] <= yinBuffer[x0]) {
        betterTau = tau;
      } else {
        betterTau = x0;
      }
    } else {
      const s0 = yinBuffer[x0];
      const s1 = yinBuffer[tau];
      const s2 = yinBuffer[x2];
      // fixed AUBIO implementation, thanks to Karl Helgason:
      // (2.0f * s1 - s2 - s0) was incorrectly multiplied with -1
      betterTau = tau + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
    }

    return sampleRate / betterTau;
  };
}

const dwDetector = dw();

function dw(config = {}) {
  const DEFAULT_SAMPLE_RATE = 44100;
  const MAX_FLWT_LEVELS = 6;
  const MAX_F = 3000;
  const DIFFERENCE_LEVELS_N = 3;
  const MAXIMA_THRESHOLD_RATIO = 0.75;

  const sampleRate = config.sampleRate || DEFAULT_SAMPLE_RATE;

  return function DynamicWaveletDetector(float32AudioBuffer) {
    "use strict";

    const mins = [];
    const maxs = [];
    const bufferLength = float32AudioBuffer.length;

    let freq = null;
    let theDC = 0;
    let minValue = 0;
    let maxValue = 0;

    // Compute max amplitude, amplitude threshold, and the DC.
    for (let i = 0; i < bufferLength; i++) {
      const sample = float32AudioBuffer[i];
      theDC = theDC + sample;
      maxValue = Math.max(maxValue, sample);
      minValue = Math.min(minValue, sample);
    }

    theDC /= bufferLength;
    minValue -= theDC;
    maxValue -= theDC;
    const amplitudeMax = maxValue > -1 * minValue ? maxValue : -1 * minValue;
    const amplitudeThreshold = amplitudeMax * MAXIMA_THRESHOLD_RATIO;

    // levels, start without downsampling...
    let curLevel = 0;
    let curModeDistance = -1;
    let curSamNb = float32AudioBuffer.length;
    let delta, nbMaxs, nbMins;

    // Search:
    while (true) {
      delta = ~~(sampleRate / (Math.pow(2, curLevel) * MAX_F));
      if (curSamNb < 2) break;

      let dv;
      let previousDV = -1000;
      let lastMinIndex = -1000000;
      let lastMaxIndex = -1000000;
      let findMax = false;
      let findMin = false;

      nbMins = 0;
      nbMaxs = 0;

      for (let i = 2; i < curSamNb; i++) {
        const si = float32AudioBuffer[i] - theDC;
        const si1 = float32AudioBuffer[i - 1] - theDC;

        if (si1 <= 0 && si > 0) findMax = true;
        if (si1 >= 0 && si < 0) findMin = true;

        // min or max ?
        dv = si - si1;

        if (previousDV > -1000) {
          if (findMin && previousDV < 0 && dv >= 0) {
            // minimum
            if (Math.abs(si) >= amplitudeThreshold) {
              if (i > lastMinIndex + delta) {
                mins[nbMins++] = i;
                lastMinIndex = i;
                findMin = false;
              }
            }
          }

          if (findMax && previousDV > 0 && dv <= 0) {
            // maximum
            if (Math.abs(si) >= amplitudeThreshold) {
              if (i > lastMaxIndex + delta) {
                maxs[nbMaxs++] = i;
                lastMaxIndex = i;
                findMax = false;
              }
            }
          }
        }
        previousDV = dv;
      }

      if (nbMins === 0 && nbMaxs === 0) {
        // No best distance found!
        break;
      }

      let d;
      const distances = [];

      for (let i = 0; i < curSamNb; i++) {
        distances[i] = 0;
      }

      for (let i = 0; i < nbMins; i++) {
        for (let j = 1; j < DIFFERENCE_LEVELS_N; j++) {
          if (i + j < nbMins) {
            d = Math.abs(mins[i] - mins[i + j]);
            distances[d] += 1;
          }
        }
      }

      let bestDistance = -1;
      let bestValue = -1;

      for (let i = 0; i < curSamNb; i++) {
        let summed = 0;
        for (let j = -1 * delta; j <= delta; j++) {
          if (i + j >= 0 && i + j < curSamNb) {
            summed += distances[i + j];
          }
        }

        if (summed === bestValue) {
          if (i === 2 * bestDistance) {
            bestDistance = i;
          }
        } else if (summed > bestValue) {
          bestValue = summed;
          bestDistance = i;
        }
      }

      // averaging
      let distAvg = 0;
      let nbDists = 0;
      for (let j = -delta; j <= delta; j++) {
        if (bestDistance + j >= 0 && bestDistance + j < bufferLength) {
          const nbDist = distances[bestDistance + j];
          if (nbDist > 0) {
            nbDists += nbDist;
            distAvg += (bestDistance + j) * nbDist;
          }
        }
      }

      // This is our mode distance.
      distAvg /= nbDists;

      // Continue the levels?
      if (curModeDistance > -1) {
        if (Math.abs(distAvg * 2 - curModeDistance) <= 2 * delta) {
          // two consecutive similar mode distances : ok !
          freq = sampleRate / (Math.pow(2, curLevel - 1) * curModeDistance);
          break;
        }
      }

      // not similar, continue next level;
      curModeDistance = distAvg;

      curLevel++;
      if (curLevel >= MAX_FLWT_LEVELS || curSamNb < 2) {
        break;
      }

      //do not modify original audio buffer, make a copy buffer, if
      //downsampling is needed (only once).
      let newFloat32AudioBuffer = float32AudioBuffer.subarray(0);
      if (curSamNb === distances.length) {
        newFloat32AudioBuffer = new Float32Array(curSamNb / 2);
      }
      for (let i = 0; i < curSamNb / 2; i++) {
        newFloat32AudioBuffer[i] =
          (float32AudioBuffer[2 * i] + float32AudioBuffer[2 * i + 1]) / 2;
      }
      float32AudioBuffer = newFloat32AudioBuffer;
      curSamNb /= 2;
    }

    return freq;
  };
}
