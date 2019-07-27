import React from "react";
import logo from "./logo.svg";
import MIDI from "@tonejs/midi";
import Tone from "tone";
import "./App.css";
import kissTheRain from './music/lemon.mid';
import PitchDetector from "./components/PitchDetector/PitchDetector";
import mapPitch from "./components/PitchDetector/mapPitch";

function App() {
  const [myMidi, setMyMidi] = React.useState(null);
  React.useEffect(() => {
    MIDI.fromUrl(kissTheRain).then(x => {
      setMyMidi(x);
      console.log('okk')
    });
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <PitchDetector />
      </header>
      <button
        onClick={() => {
          console.log(myMidi);
          const now = Tone.now() + 1.5;
          console.log(now);
          myMidi.tracks.forEach(track => {
            let synth = null;
            new Promise(solve => {
              synth = new Tone.Sampler(mapPitch, function() {
                solve();
              }).toMaster();
            }).then(() => {
              track.notes.forEach(note => {
                synth.triggerAttackRelease(
                  note.name,
                  note.duration,
                  note.time + now,
                  note.velocity
                );
              });
            });
          });
        }}
        type="button"
      >
        Start
      </button>
    </div>
  );
}

export default App;
