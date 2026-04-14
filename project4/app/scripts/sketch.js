// sound global object 
let sound; 

// controls 
let pauseSoundButton, playSoundButton, stopSoundButton;
let skipToStartButton, skipToEndButton;
let loopButton, recordButton;

// sound record 
let saveMySoundButton; 
let recordedSound; 
let recorder;
let state = 0; // 3 states: record, stop recording, save file

// low-pass
let lowPassFilter;
let lowPassFrequencySlider;
let lowPassResonanceSlider; 
let lowPassDryWetSlider;
let lowPassVolumeSlider;

// waveshaper distortion 
let waveShaper;
let waveShaperDistortionSlider;
let waveShaperOversampleSlider;
let waveShaperDryWetSlider;
let waveShaperVolumeSlider;

// dynamic compressor 
let dynamicCompressor;
let dynamicCompressorAttackSlider;
let dynamicCompressorKneeSlider;
let dynamicCompressorReleaseSlider;
let dynamicCompressorRatioSlider;
let dynamicCompressorThresholdSlider;
let dynamicCompressorDryWetSlider;
let dynamicCompressorVolumeSlider;

// reverb 
let reverb;
let reverbDurationSlider;
let reverbDecayRateSlider;
let reverbReverseSlider;
let reverbDryWetSlider;
let reverbVolumeSlider; 

// master volume controll
let masterVolume;
let masterVolumeSlider;

// spectrum in
let fftIn;

// spectrum out
let fftOut;

function preload() {
  sound = loadSound('assets/poem.wav');
}

function setup() {
  createCanvas(850, 500);
  background(150,0,150);

  // pause
  pauseSoundButton = createButton('pause');
  pauseSoundButton.position(20,20);
  pauseSoundButton.mousePressed(pauseSound);

  // play
  playSoundButton = createButton('play');
  playSoundButton.position(80,20);
  playSoundButton.mousePressed(playSound);

  // stop
  stopSoundButton = createButton('stop');
  stopSoundButton.position(130,20);
  stopSoundButton.mousePressed(stopSound);

  // skip to start 
  skipToStartButton = createButton('skip to start');
  skipToStartButton.position(180,20);
  skipToStartButton.mousePressed(skipToStart);

  // skip to end 
  skipToEndButton = createButton('skip to end');
  skipToEndButton.position(270,20);
  skipToEndButton.mousePressed(skipToEnd);

  // loop turns on or off
  loopButton = createButton('loop On');
  loopButton.position(360,20);
  loopButton.mousePressed(loopSound);
  loopButton.id('loopButton');

  // save sound 
  saveMySoundButton = createButton('Record');
  saveMySoundButton.position(430,20);
  saveMySoundButton.mousePressed(saveMySound);
  saveMySoundButton.id('saveMySoundButton');
  recordedSound = new p5.SoundFile;
  recorder = new p5.SoundRecorder();

  // low-pass filter
  text('Low-pass Filter',70,65);
  lowPassFilter = new p5.LowPass();  
  sound.disconnect();
  sound.connect(lowPassFilter);
  // frequency 
  text('Frequency', 20,90);
  lowPassFrequencySlider = createSlider(10, 22050,22050);
  lowPassFrequencySlider.position(120,80);
  lowPassFrequencySlider.input(lowPassFilterChange);
  // resonance
  text('Resonance', 20, 120);
  lowPassResonanceSlider = createSlider(1,100000,10000); 
  lowPassResonanceSlider.position(120,110);
  lowPassResonanceSlider.input(lowPassFilterChange);
  // dry/wet
  text('Dry/Wet',20,150);
  lowPassDryWetSlider = createSlider(0,100,0);
  lowPassDryWetSlider.position(120,140);
  lowPassDryWetSlider.input(lowPassFilterChange);
  // output volume
  text('Volume',20, 180);
  lowPassVolumeSlider = createSlider(0,100,100);
  lowPassVolumeSlider.position(120,170);
  lowPassVolumeSlider.input(lowPassFilterChange);
   // match values with current sliders
  lowPassFilterChange(); // set it to match sliders

  // waveshaper distortion
  text('Waveshaper Distortion',340,305);
  waveShaper = new p5.Distortion;
  lowPassFilter.disconnect();
  lowPassFilter.connect(waveShaper);
  // distortion amount
  text('Distortion',290,330);
  waveShaperDistortionSlider = createSlider(0,100,60);
  waveShaperDistortionSlider.position(360,320);
  waveShaperDistortionSlider.input(waveShaperChange);
  // oversample
  text('Oversample',290,360);
  waveShaperOversampleSlider = createSlider(1,3,1);
  waveShaperOversampleSlider.position(360, 350);
  waveShaperOversampleSlider.input(waveShaperChange);
  // dry/wet
  text('Dry/Wet',290,390);
  waveShaperDryWetSlider = createSlider(0,100,1);
  waveShaperDryWetSlider.position(360,380);
  waveShaperDryWetSlider.input(waveShaperChange);
  // output volume 
  text('Volume',290,420);
  waveShaperVolumeSlider = createSlider(0,100,100);
  waveShaperVolumeSlider.position(360,410);
  waveShaperVolumeSlider.input(waveShaperChange);
  // match values with current sliders
  waveShaperChange(); // set it to match sliders

  // dynamic compressor
  text('Dynamic Compressor',340,65);
  dynamicCompressor = new p5.Compressor();
  waveShaper.disconnect();
  waveShaper.connect(dynamicCompressor);
  // attack
  text('Attack', 290,90);
  dynamicCompressorAttackSlider = createSlider(0,100,3);
  dynamicCompressorAttackSlider.position(360,80);
  dynamicCompressorAttackSlider.input(dynamicCompressorChange);
  // knee
  text('Knee', 290,120);
  dynamicCompressorKneeSlider = createSlider(0,40,30);
  dynamicCompressorKneeSlider.position(360,110);
  dynamicCompressorKneeSlider.input(dynamicCompressorChange);
  // ratio
  text('Ratio', 290,150);
  dynamicCompressorRatioSlider = createSlider(1,20,12);
  dynamicCompressorRatioSlider.position(360,140);
  dynamicCompressorRatioSlider.input(dynamicCompressorChange);
  // threshold
  text('Threshold', 290,180);
  dynamicCompressorThresholdSlider = createSlider(0,100,76);
  dynamicCompressorThresholdSlider.position(360,170);
  dynamicCompressorThresholdSlider.input(dynamicCompressorChange);
  // release
  text('Release', 290,210);
  dynamicCompressorReleaseSlider = createSlider(0,100,25);
  dynamicCompressorReleaseSlider.position(360,200);
  dynamicCompressorReleaseSlider.input(dynamicCompressorChange);
  // dry/wet
  text('Dry/Wet', 290,240);
  dynamicCompressorDryWetSlider = createSlider(0,100,0);
  dynamicCompressorDryWetSlider.position(360,230);
  dynamicCompressorDryWetSlider.input(dynamicCompressorChange);
  // volume
  text('Volume', 290,270);
  dynamicCompressorVolumeSlider = createSlider(0,100,100);
  dynamicCompressorVolumeSlider.position(360,260);
  dynamicCompressorVolumeSlider.input(dynamicCompressorChange);
   // match values with current sliders
  dynamicCompressorChange(); // set it to match sliders


  // reverb
  text('Reverb',70,230);
  reverb = new p5.Reverb;
  dynamicCompressor.disconnect();
  dynamicCompressor.connect(reverb);
  // duration 
  text('Duration', 20,250);
  reverbDurationSlider = createSlider(0,10,3);
  reverbDurationSlider.position(120,240);
  reverbDurationSlider.input(reverbChange);
  // decay rate
  text('Decay Rate', 20,280);
  reverbDecayRateSlider = createSlider(0,100,2);
  reverbDecayRateSlider.position(120,270);
  reverbDecayRateSlider.input(reverbChange);
  // reverse
  text('Reverse OFF/ON',20,310);
  reverbReverseSlider = createSlider(0,1,0);
  reverbReverseSlider.position(120,300);
  reverbReverseSlider.input(reverbChange);
  // dry/wet
  text('Dry/Wet', 20,340);
  reverbDryWetSlider = createSlider(0,100,0);
  reverbDryWetSlider.position(120,330);
  reverbDryWetSlider.input(reverbChange);
  // volume
  text('Volume', 20,370);
  reverbVolumeSlider = createSlider(0,100,100);
  reverbVolumeSlider.position(120,360);
  reverbVolumeSlider.input(reverbChange);
   // match values with current sliders
  reverbChange(); // set it to match sliders

  // master volume
  text('Master Volume',540,35);
  masterVolumeSlider = createSlider(0,100,100);
  masterVolumeSlider.position(650,20);
  masterVolumeSlider.input(setMasterVolume); 
   // match values with current sliders
  setMasterVolume(); // set it to match sliders

  // spectrum in
  fftIn = new p5.FFT();
  fftIn.setInput(sound);
  text('Spectrum In', 520, 70); 

  // spectrum out
  fftOut = new p5.FFT();
  text('Spectrum Out', 520, 260); 
}

function draw() {
  // spectrum in
  push();
    fill(150,20,150);
    rect(520,80,300,150);
    let spectrumIn = fftIn.analyze();
    noStroke();
    fill(255, 0, 255);
    for (let i = 0; i< spectrumIn.length; i++){
      let x = map(i, 0, spectrumIn.length, 520, 820);
      let h = -230 + map(spectrumIn[i], 0, 255, 230, 80);
      rect(x, 230, 300 / spectrumIn.length, h)
    } //  ref: code addapted from:  https://p5js.org/examples/sound-filter-lowpass.html, accesesd: 05/23
  pop();

  // spectrum out
  push();
    fill(150,20,150);
    rect(520,270,300,150);
    let spectrumOut = fftOut.analyze();
    noStroke();
    fill(255, 0, 255);
    for (let i = 0; i< spectrumOut.length; i++){
      let x = map(i, 0, spectrumOut.length, 520, 820);
      let h = -420 + map(spectrumOut[i], 0, 255, 420, 270);
      rect(x, 420, 300 / spectrumOut.length, h)
    } //  ref: code addapted from:  https://p5js.org/examples/sound-filter-lowpass.html, accesesd: 05/23 
  pop();
}

function pauseSound(){
  sound.pause();
}

function playSound(){
  if(!sound.isPlaying())
    sound.play();
}

function stopSound(){
  sound.stop();
}

function skipToStart(){
  sound.jump();
  if(sound.isPaused()) sound.stop(); // jump does not work when audio paused, this solves it 
}

function skipToEnd(){
  sound.jump(sound.duration);
  if(sound.isPaused()) sound.stop(); // jump does not work when audio paused, this solves it 
}

function loopSound(){
  if (sound.isLooping()){
    select("#loopButton").html("loop On");
    sound.setLoop(!sound.isLooping());
  } else {
    select("#loopButton").html("loop Off");
    sound.setLoop(!sound.isLooping());
  }

}

function saveMySound(){
  if (state === 0 && sound.isPlaying()){
    recorder.record(recordedSound);
    state++;
    select("#saveMySoundButton").html("Stop Recording");
  }else if (state ===1){
    recorder.stop();
    state++;
    select("#saveMySoundButton").html("Download File");
  } else if (state === 2){
    saveSound(recordedSound,'filteredSoundFile');
    state = 0;
    select("#saveMySoundButton").html("Record");
  } else if (state === 0 && !sound.isPlaying()){ 
    sound.play(); // prevent from user recording when nothing is playing 
    recorder.record(recordedSound);
    state++;
    select("#saveMySoundButton").html("Stop Recording");
  }
}

function setMasterVolume(){
  // https://www.dr-lex.be/info-stuff/volumecontrols.html author: Alexander Thomas, title: Programming Volume Controls
  // copyied logarithmic formula for 60db - Table 1 on the page accessed May 17 2023 and addapted it to the code
  outputVolume(exp(6.908 * masterVolumeSlider.value() / 100) / 1000);
  // this will make sure that in order it changes the output amplitude not file imput amplitude
}

function lowPassFilterChange(){
  lowPassFilter.set(
    lowPassFrequencySlider.value(), // range 10 to 22050
    lowPassResonanceSlider.value()/1000); // range 0.001 to 1000
  lowPassFilter.drywet(lowPassDryWetSlider.value()/100); // range 0-1
  lowPassFilter.amp(lowPassVolumeSlider.value()/100); // range 0-1
}

function waveShaperChange(){
  let oversample = {
    1:'none',
    2:'2x',
    3:'4x'
  }
  waveShaper.set(
    waveShaperDistortionSlider.value()/100, // range 0-1
    oversample[waveShaperOversampleSlider.value()]); // range 'none' '2x' '4x'
  waveShaper.drywet(waveShaperDryWetSlider.value()/100); // range 0-1
  waveShaper.amp(waveShaperVolumeSlider.value()/100); // range 0-1
}

function dynamicCompressorChange(){
  dynamicCompressor.set(
    dynamicCompressorAttackSlider.value()/100,// range 0-1
    dynamicCompressorKneeSlider.value(), // range 0-40
    dynamicCompressorRatioSlider.value(), // range 1-20
    dynamicCompressorThresholdSlider.value()-100, // range -100-0
    dynamicCompressorReleaseSlider.value()/100 // range 0-1
  );
  dynamicCompressor.drywet(dynamicCompressorDryWetSlider.value()/100);
  dynamicCompressor.amp(dynamicCompressorVolumeSlider.value()/100);
}

function reverbChange(){
  reverb.set(
    reverbDurationSlider.value(), // range 0-10
    reverbDecayRateSlider.value(), // range 0-100
    0
  );
  reverb.drywet(reverbDryWetSlider.value()/100); // range 0-1
  reverb.amp(reverbVolumeSlider.value()/100); // range 0-1
}