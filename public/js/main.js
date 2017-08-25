var constraints = {
    "audio": true
};
var inputStream;
var recorder;
var recordedChunks = [];
var audioContext = new AudioContext();
var audioInput = null,
    realAudioInput = null,
    inputPoint = null;
var rafID = null;
var analyserContext = null;
var canvasWidth, canvasHeight;
var recIndex = 0;

function start() {
    navigator.mediaDevices.getUserMedia(constraints)
        .then(record)
        .catch(e => {
            console.error('getUserMedia() failed: ' + e);
        });
}

function record(stream) {
    inputStream = stream;
    try {
        var context = new AudioContext();
        var mediaStreamSource = context.createMediaStreamSource(stream);
        recorder = new Recorder(mediaStreamSource, {sampleRate: 16000, numChannels: 1});
    } catch (e) {
        console.error("Exception while creating MediaRecorder: " + e);
        return;
    } finally {
        console.log("Finished creating recorder.");
    }
    recorder.record();
}

function stop() {
    recorder.stop();
    recorder.exportWAV(function(b) {
        recordedChunks.push(b);
        recorder.clear();
        var fd = new FormData();
        fd.append('audio', recordedChunks[0]);
        fd.append('fname', 'voice-input.wav');
        console.log("sending...");
        // var client = BinaryClient('wss://SYNLPTPF1805G.int.asurion.com:3000');
        var client = BinaryClient('wss://' + window.location.host);
        client.on('open', function() {
            stream = client.createStream({
                data: 'audio',
                name: 'myvoice'
            });
            stream.write(recordedChunks[0]);
            stream.end();

            stream.on('data', function(data) {
                console.log('Received response');
                var d = JSON.parse(data);
                console.log('data: ' + d);
                $('#filename').val(d.filename);
            });
        });
    });
    console.log("Recording stopped.");
}

function play() {
    console.log("Playing...");
    var audio = document.querySelector('#source');
    try {
        var url = URL.createObjectURL(recordedChunks[0]);
        audio.src = url;
    } catch (e) {
        console.error("Error during playing: " + e);
    } finally {
        console.log("Finished playing");
    }
}

function send() {
    // $.ajax({
    //     type: 'POST',
    //     url: '/enroll',
    //     data: recordedChunks[0],
    //     contentType: false,
    //     processData: false,
    //     crossDomain: true,
    //     success: function(d) {
    //         console.log('Send successfull...');
    //     },
    //     error: function(err) {
    //         console.error(err);
    //     }
    // });
}

function toggleRecording(e) {
    if (e.classList.contains("recording")) {
        // stop recording
        e.classList.remove("recording");
        stop();
        recorder.getBuffer(gotBuffers);
    } else {
        // start recording
        // if (!recorder)
        //     return;
        e.classList.add("recording");
        start();
    }
}

function gotBuffers(buffers) {
    var canvas = document.getElementById("analyser");
    drawBuffer(canvas.width, canvas.height, canvas.getContext('2d'), buffers[0]);
}
