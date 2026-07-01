const bluetooth = require('bluetooth-serial-port');
const ExcelJS = require('exceljs');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const Jimp = require('jimp');

const address = '98:D3:71:FE:7D:CC'; // Replace with the Bluetooth address of your ESP32
const channel = 1; // Replace with the channel your ESP32 is advertising on

const serial = new bluetooth.BluetoothSerialPort();

let workbook, worksheet;

workbook = new ExcelJS.Workbook();

fs.access('output_data.xlsx', fs.constants.F_OK, (err) => {
    if (err) {
        workbook = new ExcelJS.Workbook();
        worksheet = workbook.addWorksheet('Data');
        worksheet.addRow(['Timestamp', 'Moisture', 'Distance', 'Sack Height', 'Output Image']);
        workbook.xlsx.writeFile('output_data.xlsx').then(() => {
            console.log('Excel file saved successfully');
        }).catch(err => {
            console.error('Error saving Excel file:', err);
        });
    } else {
        workbook.xlsx.readFile('output_data.xlsx').then(() => {
            worksheet = workbook.getWorksheet('Data');
        }).catch(err => {
            console.error('Error reading Excel file:', err);
        })
    }
});


let receivedData = '';
let data_buffer = '';

serial.connect(address, channel, () => {
    console.log('Connected to ESP32');

    serial.on('data', (buffer) => {
        const packet = buffer.toString();
        receivedData += packet;
        if (receivedData.includes('\n')) {
            let messages = receivedData.split('\n');

            for (let i = 0; i < messages.length - 1; i++) {
                let message = messages[i].trim();

                console.log(message);

                data_buffer += message.split(':')[1] + '$'
                if (message.includes('Sack Height')) {
                    let dataRow = [new Date().toLocaleString()].concat(data_buffer.split('$').slice(0, -1));

                    // Receiving image
                    const imageReceiver = new ImageReceiver('http://192.168.203.1');
                    imageReceiver.receive()
                        .then(filepath => {
                            console.log('Image received at:', filepath);

                            // Process the received image
                            processImage(filepath)
                                .then(outputFile => {
                                    console.log('Processed image saved at:', outputFile);

                                    // Add image hyperlink to the Excel sheet
                                    worksheet.addRow(dataRow).getCell('E').value = { hyperlink: outputFile, text: 'Snapshot' };

                                    // Save the Excel file
                                    workbook.xlsx.writeFile('output_data.xlsx')
                                        .then(() => {
                                            console.log('Excel file saved successfully');
                                        })
                                        .catch(err => {
                                            console.error('Error saving Excel file:', err);
                                        });

                                    data_buffer = ''; // Clear data buffer
                                })
                                .catch(err => {
                                    console.error('Error processing image:', err);
                                });
                        })
                        .catch(err => {
                            console.error('Error downloading image:', err);
                        });
                }
            }
            receivedData = messages[messages.length - 1];
        }
    });

    serial.write(Buffer.from('Hello from Node.js'), (err, bytesWritten) => {
        if (err) {
            console.error('Error writing data:', err);
        } else {
            console.log('Data written successfully');
        }
    });
});

serial.on('error', (err) => {
    console.error('Error:', err);
});

class ImageReceiver {
    constructor(url) {
        this.url = url;
    }

    async receive() {
        try {
            const response = await axios.get(this.url, { responseType: 'arraybuffer' });
            const filepath = await saveImage(response.data);
            return filepath;
        } catch (error) {
            console.error('Error fetching HTTP stream:', error);
            throw error;
        }
    }
}

// Function to save the received image
function saveImage(data) {
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

        Jimp.read(data, (err, image) => {
            if (err) {
                console.error('Error reading image buffer:', err);
                reject(err);
                return;
            }

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
    });
}

// Function to process the image
function processImage(filepath) {

    
    return new Promise((resolve, reject) => {
        Jimp.read(filepath, (err, image) => {
            if (err) {
                console.error('Error reading image:', err);
                reject(err);
                return;
            }

            // Calculate the center coordinates and the size of the cropped area
            const centerX = image.bitmap.width / 2;
            const centerY = image.bitmap.height / 2;
            const cropSize = Math.min(image.bitmap.width, image.bitmap.height) / 2;

            // Crop the center portion of the image
            const croppedImage = image.clone().crop(centerX - cropSize / 2, centerY - cropSize / 2, cropSize, cropSize);

            // Process the cropped image
            const pixelData = [];
            croppedImage.scan(0, 0, croppedImage.bitmap.width, croppedImage.bitmap.height, function (x, y, idx) {
                const r = this.bitmap.data[idx];
                const g = this.bitmap.data[idx + 1];
                const b = this.bitmap.data[idx + 2];
                const brightness = (r + g + b) / 3; // Simple brightness calculation
                const pixel = { x, y, r, g, b, brightness };
                pixelData.push(pixel);
            });

            // Resolve with the processed data
            resolve(pixelData);
        });
    });
}



// Helper function to get the average brightness of neighboring pixels
function getNeighborBrightness(image, x, y) {
    const neighbors = [
        { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 },
        { dx: -1, dy: 0 },                      { dx: 1, dy: 0 },
        { dx: -1, dy: 1 },  { dx: 0, dy: 1 },  { dx: 1, dy: 1 }
    ];

    let sumBrightness = 0;
    let count = 0;

    for (const neighbor of neighbors) {
        const nx = x + neighbor.dx;
        const ny = y + neighbor.dy;
        if (nx >= 0 && nx < image.bitmap.width && ny >= 0 && ny < image.bitmap.height) {
            const idx = image.getPixelIndex(nx, ny);
            const r = image.bitmap.data[idx];
            const g = image.bitmap.data[idx + 1];
            const b = image.bitmap.data[idx + 2];
            sumBrightness += (r + g + b) / 3;
            count++;
        }
    }

    return sumBrightness / count;
}
