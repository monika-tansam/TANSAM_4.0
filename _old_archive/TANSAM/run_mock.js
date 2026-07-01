const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

// ==========================================
// 1. MOCK BLUETOOTH SERIAL PORT (Bypasses macOS restriction)
// ==========================================
class MockBluetoothSerialPort {
    constructor() {
        this.dataCallback = null;
    }

    connect(address, channel, connectCallback) {
        console.log(`\x1b[36m[Mock Bluetooth] Attempting connection to device: ${address} on channel: ${channel}...\x1b[0m`);
        setTimeout(() => {
            console.log('\x1b[32m[Mock Bluetooth] Connected to ESP32 successfully!\x1b[0m');
            connectCallback();

            // Simulate sensor data output from ESP32 every 6 seconds
            let cycleCount = 0;
            const interval = setInterval(() => {
                cycleCount++;
                console.log(`\n\x1b[33m--- Starting Data Transmission Cycle #${cycleCount} ---\x1b[0m`);
                
                // Simulated serial payload format: "Label: Value\n"
                const packets = [
                    "Moisture: 38%\n",
                    "Distance: 15cm\n",
                    "Sack Height: 85cm\n"
                ];

                packets.forEach((packet, index) => {
                    setTimeout(() => {
                        if (this.dataCallback) {
                            this.dataCallback(Buffer.from(packet));
                        }
                    }, index * 500); // Send packets with minor latency
                });
            }, 6000);
        }, 1000);
    }

    on(event, callback) {
        if (event === 'data') {
            this.dataCallback = callback;
        }
    }

    write(buffer, callback) {
        console.log(`\x1b[34m[Mock Bluetooth] Data written to ESP32: "${buffer.toString()}"\x1b[0m`);
        if (callback) callback(null, buffer.length);
    }
}

const address = '98:D3:71:FE:7D:CC';
const channel = 1;
const serial = new MockBluetoothSerialPort();

// ==========================================
// 2. EXCEL LOGGING INITIALIZATION
// ==========================================
let workbook, worksheet;
workbook = new ExcelJS.Workbook();

fs.access('output_data.xlsx', fs.constants.F_OK, (err) => {
    if (err) {
        workbook = new ExcelJS.Workbook();
        worksheet = workbook.addWorksheet('Data');
        worksheet.addRow(['Timestamp', 'Moisture', 'Distance', 'Sack Height', 'RGB Value', 'Output Image']);
        workbook.xlsx.writeFile('output_data.xlsx').then(() => {
            console.log('Excel file created successfully (output_data.xlsx)');
        }).catch(err => {
            console.error('Error saving Excel file:', err);
        });
    } else {
        workbook.xlsx.readFile('output_data.xlsx').then(() => {
            worksheet = workbook.getWorksheet('Data');
            console.log('Excel file loaded successfully (output_data.xlsx)');
        }).catch(err => {
            console.error('Error reading Excel file:', err);
        });
    }
});

// ==========================================
// 3. CORE LOGIC PIPELINE
// ==========================================
let receivedData = '';
let data_buffer = '';

serial.connect(address, channel, () => {
    serial.on('data', (buffer) => {
        const packet = buffer.toString();
        receivedData += packet;
        if (receivedData.includes('\n')) {
            let messages = receivedData.split('\n');

            for (let i = 0; i < messages.length - 1; i++) {
                let message = messages[i].trim();
                console.log(`Received message: "${message}"`);

                data_buffer += message.split(':')[1] + '$';
                if (message.includes('Sack Height')) {
                    let dataRow = [new Date().toLocaleString()].concat(data_buffer.split('$').slice(0, -1));

                    // Use Mock Image Receiver instead of fetching from ESP32 camera URL
                    const imageReceiver = new MockImageReceiver();
                    imageReceiver.receive()
                        .then(filepath => {
                            console.log('\x1b[32m[Mock Camera] Image saved locally at:\x1b[0m', filepath);

                            // Calculate average RGB value
                            calculateRGB(filepath)
                                .then(rgbValues => {
                                    const rgbString = `R: ${rgbValues[0]}, G: ${rgbValues[1]}, B: ${rgbValues[2]}`;
                                    console.log('Calculated RGB values:', rgbString);

                                    // Add RGB values to the Excel sheet
                                    worksheet.addRow(dataRow);
                                    worksheet.lastRow.getCell('E').value = rgbString;

                                    // Add image hyperlink to the Excel sheet
                                    worksheet.lastRow.getCell('F').value = { hyperlink: filepath, text: 'Snapshot' };

                                    // Save the Excel file
                                    workbook.xlsx.writeFile('output_data.xlsx')
                                        .then(() => {
                                            console.log('Excel file saved successfully (output_data.xlsx)');
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
                            console.log('Error copying mock image:', err);
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
            console.log('Init message sent to ESP32');
        }
    });
});

// ==========================================
// 4. MOCK IMAGE RECEIVER & PROCESSORS
// ==========================================
const pipeStream = async function (sampleImagePath) {
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

        // Copy our sample image into the output folder to simulate ESP32 camera streaming
        fs.copyFile(sampleImagePath, outputFile, (err) => {
            if (err) {
                return reject(err);
            }

            // Load Font and stamp "TANSAM MOCK" on the image
            Jimp.loadFont(Jimp.FONT_SANS_32_BLACK).then(font => {
                Jimp.read(outputFile, (err, image) => {
                    if (err) {
                        console.error('Error reading image:', err);
                        reject(err);
                        return;
                    }

                    image.print(
                        font,
                        20,
                        20,
                        "TANSAM MOCK"
                    );

                    image.write(outputFile, (err) => {
                        if (err) {
                            console.error('Error stamping text:', err);
                            reject(err);
                            return;
                        }
                        resolve(outputFile);
                    });
                });
            }).catch(err => {
                console.error('Error loading Jimp font:', err);
                // Fallback to normal saved image if font loading fails
                resolve(outputFile);
            });
        });
    });
};

class MockImageReceiver {
    async receive() {
        // Resolve using the A_Grade_Leaf.jpeg file available in TANSAM directory as a mock stream source
        const sampleImagePath = path.join(__dirname, 'A_Grade_Leaf.jpeg');
        if (!fs.existsSync(sampleImagePath)) {
            throw new Error(`Sample image not found at ${sampleImagePath}`);
        }
        return await pipeStream(sampleImagePath);
    }
}

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
