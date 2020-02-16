//取眾數
const getMode = arr => {
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
  //如果抓到兩個眾數只回傳第一個
  return mode[0];
};

const noteStrings = [
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
const scaleStrings = [
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
// const noteStrings = [
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

const noteFromPitch = frequency => {
  var noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
  return Math.round(noteNum) + 69;
};
const noteFromPitchForCanvas = frequency => {
  var noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
  return noteNum + 69;
};

const frequencyFromNoteNumber = note => {
  return 440 * Math.pow(2, (note - 69) / 12);
};

const centsOffFromPitch = (frequency, note) => {
  return Math.floor(
    (1200 * Math.log(frequency / frequencyFromNoteNumber(note))) / Math.log(2)
  );
};

const keyFromNote = note => {
  if(note>0 && note<10000)
  return noteStrings[note % 12] + scaleStrings[Math.floor(note / 12)];
  else return null
};

const getUserMedia = (dictionary, callback, handleError) => {
  try {
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;
    navigator.getUserMedia(dictionary, callback, handleError);
  } catch (e) {
    alert("getUserMedia threw exception :" + e);
  }
};

export {
  keyFromNote,
  centsOffFromPitch,
  frequencyFromNoteNumber,
  noteFromPitchForCanvas,
  noteFromPitch,
  getMode,
  getUserMedia
};
