const Tuner = function() {
  this.middleA = 440
  this.semitone = 69
  this.bufferSize = 4096
  this.noteStrings = [
    'C',
    'C♯',
    'D',
    'D♯',
    'E',
    'F',
    'F♯',
    'G',
    'G♯',
    'A',
    'A♯',
    'B'
  ]
  this.counter = 0
  this.prev_peaks = []
  this.final_peaks = []
  this.frequencyData;
  this.findPeaks = this.initD3Peaks()
  this.initGetUserMedia()
  
}


Tuner.prototype.initD3Peaks = function () {
  var ricker = d3_peaks.ricker;

  var findPeaks = d3_peaks.findPeaks()
    .kernel(ricker)
    .gapThreshold(1)
    .minLineLength(2)
    .minSNR(2.0)
    .widths([1,2,3]);
  return findPeaks
}

Tuner.prototype.initGetUserMedia = function() {
  window.AudioContext = window.AudioContext || window.webkitAudioContext
  if (!window.AudioContext) {
    return alert('AudioContext not supported')
  }

  // Older browsers might not implement mediaDevices at all, so we set an empty object first
  if (navigator.mediaDevices === undefined) {
    navigator.mediaDevices = {}
  }

  // Some browsers partially implement mediaDevices. We can't just assign an object
  // with getUserMedia as it would overwrite existing properties.
  // Here, we will just add the getUserMedia property if it's missing.
  if (navigator.mediaDevices.getUserMedia === undefined) {
    navigator.mediaDevices.getUserMedia = function(constraints) {
      // First get ahold of the legacy getUserMedia, if present
      const getUserMedia =
        navigator.webkitGetUserMedia || navigator.mozGetUserMedia

      // Some browsers just don't implement it - return a rejected promise with an error
      // to keep a consistent interface
      if (!getUserMedia) {
        alert('getUserMedia is not implemented in this browser')
      }

      // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
      return new Promise(function(resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject)
      })
    }
  }
}

Tuner.prototype.startRecord = function () {
  const self = this

  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then(function(stream) {
      self.audioContext.createMediaStreamSource(stream).connect(self.analyser)
      self.analyser.connect(self.biquad)
      self.biquad.connect(self.scriptProcessor)
      self.scriptProcessor.connect(self.audioContext.destination)
      self.scriptProcessor.addEventListener('audioprocess', function(event) {
          // const frequency = self.pitchDetector.do(
          //   event.inputBuffer.getChannelData(0)
          // )
          // if (frequency && self.onNoteDetected) {
          //   const note = self.getNote(frequency)
          //   self.onNoteDetected({
          //     name: self.noteStrings[note % 12],
          //     value: note,
          //     cents: self.getCents(frequency, note),
          //     octave: parseInt(note / 12) - 1,
          //     frequency: frequency
          //   })
          // }
          self.detect()
      })
    })
    .catch(function(error) {
      alert(error.name + ': ' + error.message)
    })
}

Tuner.prototype.stop = function() {
 this.audioContext.close()
 this.audioContext = null
}

Tuner.prototype.changeState = function() {
if(this.audioContext.state === 'running') {
    this.audioContext.suspend();
  } else if(this.audioContext.state === 'suspended') {
    this.audioContext.resume();  
  }
}


Tuner.prototype.init = function() {
  this.audioContext = new window.AudioContext()
  this.analyser = this.audioContext.createAnalyser()
  // this.analyser.fftSize = 4096;
  this.biquad = this.audioContext.createBiquadFilter()
        this.biquad.Q.value = 8.30;
        this.biquad.frequency.value = 440;
        this.biquad.gain.value = 1000;
        this.biquad.type = 'bandpass';

  this.scriptProcessor = this.audioContext.createScriptProcessor(
    this.bufferSize,
    1,
    1
  )
    this.startRecord()
  }

Tuner.prototype.test_output = function () {
  

  var data = [{
  y: this.frequencyData,
    type: 'scatter',
    }];

  Plotly.newPlot('myDiv', data, {}, {showSendToCloud:true});
}

/**
 * get musical note from frequency
 *
 * @param {number} frequency
 * @returns {number}
 */
Tuner.prototype.getNote = function(frequency) {
  const note = 12 * (Math.log(frequency / this.middleA) / Math.log(2))
  return Math.round(note) + this.semitone
}

/**
 * get the musical note's standard frequency
 *
 * @param note
 * @returns {number}
 */
Tuner.prototype.getStandardFrequency = function(note) {
  return this.middleA * Math.pow(2, (note - this.semitone) / 12)
}

/**
 * get cents difference between given frequency and musical note's standard frequency
 *
 * @param {number} frequency
 * @param {number} note
 * @returns {number}
 */
Tuner.prototype.getCents = function(frequency, note) {
  return Math.floor(
    (1200 * Math.log(frequency / this.getStandardFrequency(note))) / Math.log(2)
  )
}


// const tuner = new Tuner()
// module.exports = tuner