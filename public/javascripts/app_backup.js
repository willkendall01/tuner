const Application = function() {
  this.tuner = new Tuner()

  this.prev_peaks = []
  this.final_peaks = []
  self.frequencyData

  //use get_pitch_count to get pitch!
  this.get_pitch_count = function () { return this.tuner.counter; }
  }
  
Application.prototype.start = function() {
  this.tuner.init()
  this.frequencyData = new Float32Array(this.tuner.analyser.frequencyBinCount)
  this.tuner.audioContext.resume()
  this.detect()
}

Application.prototype.detect = function() {
  console.log(this.tuner.analyser)
  const self = this
  var ricker = d3_peaks.ricker;

  var findPeaks = d3_peaks.findPeaks()
    .kernel(ricker)
    .gapThreshold(1)
    .minLineLength(2)
    .minSNR(2.0)
    .widths([1,2,3]);
  var convolve = d3_peaks.convolve()
                        .kernel(ricker);
  console.log(self.tuner.analyser.frequencyBinCount)

  self.tuner.analyser.getFloatFrequencyData(self.frequencyData)
  console.log(self.frequencyData)
  var peaks = findPeaks(self.frequencyData);
  self.final_peaks = []
  for (var i = 0; i < Object.keys(peaks).length; i++) {
      if (peaks[i].index < 500 && peaks[i].snr > 1 && self.frequencyData[peaks[i].index] > -40) {
        self.final_peaks.push(peaks[i].index)
      }
  }
  //debugging:
 // console.log("------------")
 // console.log("Prev: " + self.prev_peaks)
 // console.log("Fin: " + self.final_peaks)
 // console.log("------------")



  if ((self.final_peaks.length !== 0) &&
  ((Math.abs(self.prev_peaks[0] - self.final_peaks[0]) >= 1) ||  (self.prev_peaks.length === 0))) {
    self.tuner.counter++
  }

  self.prev_peaks = self.final_peaks
  document.getElementById('counter').innerHTML = self.get_pitch_count();

  var data = [{
  y: self.frequencyData,
    type: 'scatter',
    }];

  Plotly.newPlot('myDiv', data, {}, {showSendToCloud:true});
  window.requestAnimationFrame(function(){self.detect()})
}

const app = new Application();

function resume() {
  app.start()
}
// module.exports = app
// function stop() {
//   count = app.tuner.counter
//   delete window.app
//   return count
// }