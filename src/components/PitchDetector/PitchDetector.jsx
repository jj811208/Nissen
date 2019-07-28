import React, {
  useMemo,
  useCallback,
  useEffect,
  useState,
  useRef
} from "react";
import mapPitch from "./mapPitch.js";
import Amdf from "./amdfDetector.js";
import * as util from "./pitch.util";
import Tone from "tone";
// import MIDI from "@tonejs/midi";
var allVoice = {};
var allVoiceArray = [];

const requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

const cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;


const synth = new Tone.Sampler(mapPitch, function() {
  console.log("ok");
}).toMaster();

const PitchDetector = props => {
  const [pitch, setPitch] = useState("-");
  const [note, setNote] = useState("-");
  const isCatchVoice = useRef(false);
  const rafID = useRef(null);
  const audioContext = useRef(new AudioContext());
  const analyser = useRef(audioContext.current.createAnalyser());
  const buf = useRef(new Float32Array(1024));
  const sourceNode = useRef(audioContext.current.createBufferSource());
  const [theBuffer, setTheBuffer] = useState(null);

  //看看原始檔案這個在衝啥
  // const max_size = useMemo(
  //   () => Math.max(4, Math.floor(audioContext.current.sampleRate / 5000)),
  //   []
  // );

  const AMDFDetector = useMemo(Amdf, []);

  const updatePitch = () => {
    console.log(isCatchVoice.current,'為什麼是false');
    analyser.current.getFloatTimeDomainData(buf.current);
    const ac = AMDFDetector(buf.current);
    const myNote = util.noteFromPitch(ac) + 13;
    const myPitch = util.keyFromNote(myNote);
    const isPersonVoice = myNote < 36 || myNote > 95; //假設人聲發不出高高高 低低低的聲音 如有感測到 就過濾掉

    if (isPersonVoice) {
      setNote("-");
      setPitch("-");
    } else {
      setNote(myNote);
      setPitch(myPitch);

      if (isCatchVoice.current) {
        allVoiceArray.push({ pitch: myPitch, time: new Date().getTime() });
        allVoice[myPitch] = !!allVoice[myPitch] ? allVoice[myPitch] + 1 : 1;
      }
    }

    rafID.current = requestAnimationFrame(updatePitch);
  };

  const toggleLiveInput = () => {
    // sourceNode.current.buffer = theBuffer;
    // sourceNode.current.loop = true;
    // analyser.current.fftSize = 2048;
    // sourceNode.current.connect(analyser.current);
    analyser.current.connect(audioContext.current.destination);
    sourceNode.current.start(0);
    sourceNode.current.stop(0);
    const dictionarySetting = {
      audio: {
        mandatory: {
          // googEchoCancellation: "false",
          // googAutoGainControl: "false",
          // googNoiseSuppression: "false",
          // googHighpassFilter: "false"
          googEchoCancellation: true,
          googAutoGainControl: true,
          googNoiseSuppression: true,
          googHighpassFilter: true,
          googNoiseSuppression2: true,
          googEchoCancellation2: true,
          googAutoGainControl2: true
        },
        optional: []
      }
    };
    const gotStream = stream => {
      audioContext.current
        .createMediaStreamSource(stream)
        .connect(analyser.current);
      updatePitch();
    };
    const handleError = () => {
      alert("getUserMedia失敗");
    };
    util.getUserMedia(dictionarySetting, gotStream, handleError);
  };

  const toggleCatchVoice = () => {
    if (isCatchVoice.current) {
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
      // playTheCatchVoice(testVoice);
      playTheCatchVoice(allVoiceArray);

      allVoice = {};
      allVoiceArray = [];
      isCatchVoice.current=false;
      console.log('setIsCatchVoice(false);')
      setTimeout(() => {
        cancelAnimationFrame(rafID.current);
        rafID.current=requestAnimationFrame(updatePitch);
      }, 200);
    } else {
      isCatchVoice.current=true;
      console.log('setIsCatchVoice(true);')
      setTimeout(() => {
        cancelAnimationFrame(rafID.current);
        rafID.current=requestAnimationFrame(updatePitch);
      }, 200);
    }
  };

  const playTheCatchVoice = catchedVoice => {
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
    }
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
    const now = Tone.now() + 1;
    newCat.forEach((v, i) => {
      synth.triggerAttackRelease(v.pitch, v.sec, 0.5 + (allTime + 0.001)+now);
      allTime += v.sec + 0.001;
    });
  };

  return (
    <>
      <div
        onClick={toggleLiveInput}
        style={{
          display: "inline-block",
          cursor: "pointer",
          border: "solid 2px #eee",
          borderRadius: "4px",
          padding: "4px 8px"
        }}
      >
        開啟麥克風
      </div>
      <div
        onClick={toggleCatchVoice}
        style={{
          display: "inline-block",
          cursor: "pointer",
          border: "solid 2px #eee",
          borderRadius: "4px",
          padding: "4px 8px",
          marginTop: "8px"
        }}
      >
        {isCatchVoice.current ? "  演奏  " : "人聲轉樂器錄製"}
      </div>
      <div>isCatchVoice:{isCatchVoice.current ? "TRUE" : "FALSE"}</div>
      <div>note:{note}</div>
      <div>pitch:{pitch}</div>
    </>
  );
};

export default PitchDetector;
