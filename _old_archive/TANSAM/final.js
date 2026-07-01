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
        worksheet.addRow(['Timestamp', 'Moisture', 'Distance', 'Sack Height', 'RGB Value', 'Output Image']);
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
                    const imageReceiver = new ImageReceiver('http://192.168.63.1/');
                    imageReceiver.receive()
                        .then(filepath => {
                            console.log('Image received at :', filepath);

                            // Calculate RGB values from the received image
                            calculateRGB(filepath)
                                .then(rgbValues => {
                                    console.log('RGB values:', rgbValues);

                                    // Add RGB values to the Excel sheet
                                    worksheet.lastRow.getCell('E').value = rgbValues;

                                    // Add image hyperlink to the Excel sheet
                                    worksheet.addRow(dataRow).getCell('F').value = { hyperlink: filepath, text: 'Snapshot' };

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
                                    console.error('Error calculating RGB values:', err);
                                });
                        })
                        .catch(err => {
                            console.log('Error downloading image.', err);
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
                    ""
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

// Function to calculate RGB values from the image file
function calculateRGB(filepath) {
    return new Promise((resolve, reject) => {
        Jimp.read(filepath, (err, image) => {
            if (err) {
                reject(err);
            } else {
                let totalR = 0;
                let totalG = 0;
                let totalB = 0;

                image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
                    totalR += this.bitmap.data[idx];
                    totalG += this.bitmap.data[idx + 1];
                    totalB += this.bitmap.data[idx + 2];
                });

                const pixelCount = image.bitmap.width * image.bitmap.height;
                const avgR = Math.round(totalR / pixelCount);
                const avgG = Math.round(totalG / pixelCount);
                const avgB = Math.round(totalB / pixelCount);

                resolve([avgR, avgG, avgB]);
            }
        });
    });
}
