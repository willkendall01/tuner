const Application = function() {
  this.tuner = new Tuner()
  //use get_pitch_count to get pitch!
  this.get_pitch_count = function () { return this.tuner.counter; }
  }

Application.prototype.start = function() {
  this.tuner.init()
  this.tuner.frequencyData = new Float32Array(this.tuner.analyser.frequencyBinCount)
  this.tuner.audioContext.resume()
}

Application.prototype.stop = function() {
  this.tuner.stop()
  this.tuner.counter = 0
}

Application.prototype.change_state = function() {
  this.tuner.changeState()
  return this.get_pitch_count()
}

function eval_rmse(fPeaks, pPeaks) {
  var rmse = 0
  var f_len = fPeaks.length
  var p_len = pPeaks.length
  if (f_len === 0 || p_len === 0 || f_len !== p_len) {
    return -1
  }
  for (var i = 0; i < Object.keys(fPeaks).length; i++) {
    rmse += Math.pow(fPeaks[i] - pPeaks[i], 2)
  }
  rmse /= fPeaks.length
  rmse = Math.pow(rmse, 1/2)
  return rmse
}

Tuner.prototype.detect = function() {
  this.analyser.getFloatFrequencyData(this.frequencyData)
  // console.log(this.frequencyData)
  var peaks = this.findPeaks(this.frequencyData);
  this.final_peaks = []
  for (var i = 0; i < Object.keys(peaks).length; i++) {
      if (peaks[i].index < 500 && peaks[i].snr > 1 && this.frequencyData[peaks[i].index] > -40) {

        this.final_peaks.push(peaks[i].index)
      }
  }
  // debugging:
 // console.log("------------")
 // console.log("Prev: " + this.prev_peaks)
 // console.log("Fin: " + this.final_peaks)
 // console.log("------------")
  var rmse = eval_rmse(this.final_peaks, this.prev_peaks) 
  console.log("rmse: " + rmse)
  // if ((this.final_peaks.length !== 0) &&
  // ((Math.abs(this.prev_peaks[0] - this.final_peaks[0]) >= 1) ||  (this.prev_peaks.length === 0))) 
  if (rmse > .5) {
    document.getElementById('counter').innerHTML = this.counter
    this.counter++  
  }

  this.prev_peaks = this.final_peaks
  // this.test_output()
}



  const app = new Application();

function Begin() {

  app.start()
}

function Stop() {
  app.stop()
}

function ChangeState() {
  app.change_state()
}

// module.exports = app
