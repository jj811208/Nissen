import React, { useMemo, useState, useRef } from "react";
import mapPitch from "./mapPitch.js";
import Amdf from "./amdfDetector.js";
import * as util from "./pitch.util";
import Tone from "tone";
// import MIDI from "@tonejs/midi";
let allVoice = {};
let allVoiceArray = [];

const requestAnimationFrame =
  window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame;

const cancelAnimationFrame =
  window.cancelAnimationFrame || window.mozCancelAnimationFrame;

window.AudioContext = window.AudioContext || window.webkitAudioContext;

const synth = new Tone.Sampler(mapPitch, function() {
  console.log("ok");
}).toMaster();

const PitchDetector = props => {
  const [pitch, setPitch] = useState("-");
  const [note, setNote] = useState("-");
  const [isRecord, setIsRecord] = useState(false);
  const isCatchVoice = useRef(false);
  const rafID = useRef(null);
  const audioContext = useRef(new AudioContext());
  const analyser = useRef(null);
  const buf = useRef(new Float32Array(1024));
  const AMDFDetector = useMemo(Amdf, []);

  const toggleLiveInput = () => {
    if (rafID.current !== null) {
      if (isRecord) {
        cancelAnimationFrame(rafID.current);
        setIsRecord(false);
      } else {
        updatePitch();
        setIsRecord(true);
      }
    } else {
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
        const mediaStreamSource = audioContext.current.createMediaStreamSource(
          stream
        );
        analyser.current = audioContext.current.createAnalyser();
        mediaStreamSource.connect(analyser.current);
        setIsRecord(true);
        updatePitch();
      };
      const handleError = () => {
        alert("getUserMedia失敗");
      };
      util.getUserMedia(dictionarySetting, gotStream, handleError);
    }
  };

  const toggleCatchVoice = () => {
    if (isCatchVoice.current) {
      playTheCatchVoice(allVoiceArray);
      allVoice = {};
      allVoiceArray = [];
      isCatchVoice.current = false;
      setNote(",");
    } else {
      isCatchVoice.current = true;
      setNote(".");
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
      synth.triggerAttackRelease(v.pitch, v.sec, 0.5 + (allTime + 0.001) + now);
      allTime += v.sec + 0.001;
    });
  };

  const updatePitch = () => {
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

  const openMicStyle = useMemo(
    () => ({
      display: "inline-block",
      cursor: "pointer",
      border: "solid 2px #eee",
      borderRadius: "4px",
      padding: "4px 8px"
    }),
    []
  );

  const openCatchStyle = useMemo(
    () => ({
      display: "inline-block",
      cursor: "pointer",
      border: "solid 2px #eee",
      borderRadius: "4px",
      padding: "4px 8px",
      marginTop: "8px"
    }),
    []
  );
  return (
    <>
      <div onClick={toggleLiveInput} style={openMicStyle}>
        {isRecord?"關閉麥克風":"開啟麥克風"}
      </div>
      <div onClick={toggleCatchVoice} style={openCatchStyle}>
        {isCatchVoice.current ? "  演奏  " : "人聲轉樂器錄製"}
      </div>
      <div>isRecord:{isRecord ? "TRUE" : "FALSE"}</div>
      <div>isCatchVoice:{isCatchVoice.current ? "TRUE" : "FALSE"}</div>
      <div>note:{note}</div>
      <div>pitch:{pitch}</div>
    </>
  );
};

export default PitchDetector;
