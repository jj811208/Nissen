import React, { useMemo, useState, useRef } from "react";
import mapPitch from "./mapPitch.js";
import Amdf from "./amdfDetector.js";
import * as util from "./pitch.util";
import Tone from "tone";
import ml5 from "ml5";
// import MIDI from "@tonejs/midi";

const model_url =
  "https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/";

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
  const pitch2 = useRef(null);
  const tempPitch2 = useRef("-");
  const [, forceUpdate] = useState(null);
  const [note, setNote] = useState("-");
  const [isRecord, setIsRecord] = useState(false);
  const isCatchVoice = useRef(false);
  const allVoice = useRef({});
  const allVoiceArray = useRef([]);
  const audioContext = useRef(new AudioContext());
  const analyser = useRef(null);
  const rafID = useRef(null);
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

        /////第二種方法測試
        pitch2.current = ml5.pitchDetection(
          model_url,
          audioContext.current,
          stream,
          () => {
            console.log("okkk");
          }
        );

        analyser.current = audioContext.current.createAnalyser();
        mediaStreamSource.connect(analyser.current);
        setIsRecord(true);
        updatePitch();
        console.log(123);
      };
      const handleError = () => {
        alert("getUserMedia失敗");
      };
      util.getUserMedia(dictionarySetting, gotStream, handleError);
    }
  };

  const toggleCatchVoice = () => {
    if (isCatchVoice.current) {
      playTheCatchVoice(allVoiceArray.current);
      allVoice.current = {};
      allVoiceArray.current = [];
      isCatchVoice.current = false;
      setNote(",");
    } else {
      isCatchVoice.current = true;
      setNote(".");
    }
  };

  const playTheCatchVoice = catchedVoice => {
    let voiceCat = [];
    let allowWrongLimit = 6;

    for (var i = 0; i < catchedVoice.length; i++) {
      let diffPitchCount = 0;
      for (var j = i + 1; j < catchedVoice.length; j++) {
        if (catchedVoice[i].pitch !== catchedVoice[j].pitch) {
          diffPitchCount++;
        }
        if (diffPitchCount >= allowWrongLimit) break;
      }

      let targetPitchNumber =
        j - diffPitchCount <= catchedVoice.length - 1
          ? j - diffPitchCount
          : catchedVoice.length - 1;

      //一個音持續了多久
      let PitchKeepSecond =
        (catchedVoice[targetPitchNumber].time - catchedVoice[i].time) / 1000;

      voiceCat.push({
        pitch: catchedVoice[i].pitch,
        sec: PitchKeepSecond,
        count: targetPitchNumber - i
      });

      i = targetPitchNumber;
    }
    const newCat = [];
    let prevCount = 0;
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

    let allTime = 0;
    const now = Tone.now() + 1;
    newCat.forEach((v, i) => {
      synth.triggerAttackRelease(v.pitch, v.sec, allTime + now);
      allTime += v.sec;
    });
  };

  const updatePitch = () => {
    analyser.current.getFloatTimeDomainData(buf.current);
    const ac = AMDFDetector(buf.current);
    const myNote = util.noteFromPitch(ac) + 12; //13;
    const myPitch = util.keyFromNote(myNote);
    const isPersonVoice = myNote < 36 || myNote > 95; //假設人聲發不出高高高 低低低的聲音 如有感測到 就過濾掉

    if (isPersonVoice) {
      setNote("-");
      setPitch("-");
    } else {
      setNote(myNote);
      setPitch(myPitch);

      if (isCatchVoice.current) {
        allVoiceArray.current.push({
          pitch: myPitch,
          time: new Date().getTime()
        });
        allVoice.current[myPitch] = !!allVoice.current[myPitch]
          ? allVoice.current[myPitch] + 1
          : 1;
      }
    }

    rafID.current = requestAnimationFrame(updatePitch);

    pitch2.current.getPitch((error, frequency) => {
      if (error) {
        console.error(error);
      } else {
        // const ac = AMDFDetector(buf.current);
        // const myNote = util.noteFromPitch(ac);// + 13;
        // const myPitch = util.keyFromNote(myNote);
        const myNote2 = util.noteFromPitch(frequency) + 12; // + 13;
        const myPitch2 = util.keyFromNote(myNote2);
        if (myPitch2 !== null) {
          tempPitch2.current = myPitch2;
        } else {
          tempPitch2.current = "-";
        }
      }
      forceUpdate();
    });
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
        {isRecord ? "關閉麥克風" : "開啟麥克風"}
      </div>
      <div onClick={toggleCatchVoice} style={openCatchStyle}>
        {isCatchVoice.current ? "  演奏  " : "人聲轉樂器錄製"}
      </div>
      <div>isRecord:{isRecord ? "TRUE" : "FALSE"}</div>
      <div>isCatchVoice:{isCatchVoice.current ? "TRUE" : "FALSE"}</div>
      <div>note:{note}</div>
      <div>硬用算式算的pitch:{pitch}</div>
      <div>人工智慧算的pitch:{tempPitch2.current}</div>
    </>
  );
};

export default PitchDetector;
