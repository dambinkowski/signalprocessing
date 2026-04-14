var mySound;
var canvas;

var analyzer;
var rms = 1;
var kurtosis = 1;
var zcr = 1; 
var r = 1; // rotation


function preload(){
    soundFormats('mp3');
    mySound = loadSound('assets/Kalte_Ohren_(_Remix_).mp3');
}


function setup(){
    canvas = createCanvas(windowWidth, windowHeight);
    background(0);
    textSize(52);
    fill(255);
    text('Press anywhere to start',width/5, height/2);
    canvas.mouseClicked(playSound);

    rectMode(CENTER);

    if(typeof Meyda === 'undefined'){
        console.log(' - - Mayda Library Not Found - - ');
    } else {
        analyzer = Meyda.createMeydaAnalyzer({
            "audioContext": getAudioContext(),
            "source": mySound,
            "bufferSize": 512,
            "featureExtractors": ["rms", "spectralKurtosis", "zcr"],
            "callback": features => {
                rms = features.rms * 850; // show the beat with loudness of the signal
                kurtosis = features.spectralKurtosis; // pitchy 
                zcr = features.zcr*6; // shows percusion in the background when percussion beat comes in 
            } 
        });
    }
}

function draw(){
    if(mySound.isPlaying()) // to show text from set up clear the background only when sound is playing
    {
        background(rms, rms/10, rms/20);
    }
    // rms 
    push();
        if(rms>100){
            fill(30,30,255);
            rect(width*2/8,height/4, rms);
            rect(width* 6/8,height/4, rms);
            rect(width*2/8,height* 3/4, rms);
            rect(width* 6/8,height*3/4, rms);
        }
    pop();

    // kurtosis
    push();
        if(kurtosis>100){
            fill(255,30,30);
            rect(width/2,height/4, kurtosis *7, kurtosis);
            rect(width* 2/8,height/2, kurtosis, kurtosis*7);
            rect(width* 6/8,height/2, kurtosis, kurtosis*7);
            rect(width/2, height*3/4, kurtosis*7, kurtosis);
        }
    pop();

    // zcr
    push();
        fill(255);
        translate(width/2, height/2); // go to the middle 
        rotate(radians(frameCount/2)); // rotate in center 
        rect(0,0, zcr);
        r+=10; // rotation 
    pop();
}

// resize canvas when browser window changes 
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// play sound
function playSound(){
    if(!mySound.isPlaying()) {
        mySound.play();
        analyzer.start();
    } 
}