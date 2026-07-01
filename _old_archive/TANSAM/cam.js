const axios = require('axios');
const path = require('path');
const fs = require('fs');
const Jimp = require('jimp');

const pipeStream = async function (data) {
    return new Promise((resolve, reject) => {
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

        Jimp.loadFont(Jimp.FONT_SANS_32_BLACK).then(font => {
            Jimp.read(data, (err, image) => {
                if (err) {
                    console.error('Error reading image buffer:', err);
                    reject(err);
                    return;
                }

                image.print(
                    font,
                    10,
                    10,
                    "TANSAM"
                );

                image.write(outputFile, (err) => {
                    if (err) {
                        console.error('Error writing image file:', err);
                        reject(err);
                        return;
                    }
                    console.log('Image data saved successfully:', outputFile);
                    resolve(outputFile);
                });
            });
        }).catch(err => {
            console.error('Error loading font:', err);
            reject(err);
        });
    });
};

class ImageReceiver {
    constructor(url) {
        this.url = url;
    }

    async receive() {
        try {
            const response = await axios.get(this.url, { responseType: 'arraybuffer' });
            const filePath = await pipeStream(response.data);
            return filePath;
        } catch (error) {
            console.error('Error fetching HTTP stream:', error);
            throw error;
        }
    }
}

// Example usage
// const url = 'http://192.168.203.1'; // Replace with your image URL
// const imageReceiver = new ImageReceiver(url);
// imageReceiver.receive()
//     .then(filePath => {
//         console.log('Image received and saved at:', filePath);
//     })
//     .catch(error => {
//         console.error('Error receiving image:', error);
//     });


module.exports = ImageReceiver;
