const express = require('express');
const app = express();
const server = require('http').Server(app);
const rtsp = require('rtsp-ffmpeg');
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');
const ffmpeg = require('fluent-ffmpeg');

server.listen(6147);

const uri = 'rtsp://192.168.1.219:8080/h264.sdp';                  //  http://192.168.203.123:81/stream
const stream = new rtsp.FFMpeg({ input: uri });

// const RTSP_URL = 'rtsp://192.168.1.219:8080/h264.sdp'; // Replace with your RTSP stream URL
// const HTTP_PORT = 8000; // Port for HTTP streaming


const pipeStream = async function (data) {
    console.log(data);
    try {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
        const day = ('0' + currentDate.getDate()).slice(-2);
        const hours = ('0' + currentDate.getHours()).slice(-2);
        const minutes = ('0' + currentDate.getMinutes()).slice(-2);
        const seconds = ('0' + currentDate.getSeconds()).slice(-2);
        const milliseconds = ('00' + currentDate.getMilliseconds()).slice(-3);
        const timestamp = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}-${milliseconds}`;
        const outputFolderPath = path.join(__dirname, `output/${year}/${month}/${day}`);
        const outputFile = path.join(outputFolderPath, `${timestamp}.jpg`);

        fs.mkdirSync(outputFolderPath, { recursive: true });
        
        await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE).then(font => {
            Jimp.read(data, (err, image) => {
                if (err) {
                    console.error('Error reading image buffer:', err);
                    return;
                }



                image.print(
                    font,
                    10,
                    10,
                    "TANSAM",
                    
                );

                image.write(outputFile);
                console.log('Image data saved successfully:', outputFile);
            });
        }).catch(err => {
            console.error('Error loading font:', err);
        });



    } catch (error) {
        console.error('Error processing image data:', error);
    }
};

setInterval(() => { stream.once('data', pipeStream) }, 2000);




