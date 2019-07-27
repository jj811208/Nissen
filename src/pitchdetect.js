
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

function updatePitch() {
  analyser.getFloatTimeDomainData(buf);

  var ac = AMDFDetector(buf);

  var myNoteForCanvas = noteFromPitchForCanvas(ac) + 13;
  var myNote = Math.round(myNoteForCanvas);

  //假設人聲發不出高高高 低低低的聲音 如有感測到 就過濾掉
  if (myNote < 36 || myNote > 95) ac = null;

  if (ac === null) {
    noteElem.innerText = "-";
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
  }

  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = window.webkitRequestAnimationFrame;
  rafID = window.requestAnimationFrame(updatePitch);
}
