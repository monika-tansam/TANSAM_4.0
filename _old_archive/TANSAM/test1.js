const bluetooth = require('bluetooth-serial-port');
const ExcelJS = require('exceljs');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const Jimp = require('jimp');
const sharp = require('sharp');


const address = '98:D3:71:FE:7D:CC'; // Replace with the Bluetooth address of your ESP32
const channel = 1; // Replace with the channel your ESP32 is advertising on

const serial = new bluetooth.BluetoothSerialPort();

let workbook, worksheet;

workbook = new ExcelJS.Workbook();

fs.access('output_data.xlsx', fs.constants.F_OK, (err) => {
    if (err) {
        workbook = new ExcelJS.Workbook();
        worksheet = workbook.addWorksheet('Data');
        worksheet.addRow(['Timestamp', 'Moisture', 'Distance', 'Sack Height', 'Snapshot']);
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

// Define constant RGB values
const constantRGB_A = { r: 255, g: 0, b: 0 }; // Red // Image 1
const constantRGB_B = { r: 0, g: 255, b: 0 }; // Green // Image 2
const constantRGB_C = { r: 0, g: 0, b: 255 }; // Blue // Image 3

// Function to compare RGB values
function compareRGB(rgb1, rgb2) {
    return rgb1.r === rgb2.r && rgb1.g === rgb2.g && rgb1.b === rgb2.b;
}

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
                        .then(async (filepath) => {
                            console.log('Image received at :', filepath);

                            // Load the image
                            const image = await Jimp.read(filepath);

                            // Get the RGB values of a specific pixel in the image
                            const pixelColor = Jimp.intToRGBA(image.getPixelColor(10, 10));

                            // Compare with constant RGB values
                            if (compareRGB(pixelColor, constantRGB_A)) {
                                console.log('Image matches constant A');
                                // Update Excel sheet or any other action you want to take
                            } else if (compareRGB(pixelColor, constantRGB_B)) {
                                console.log('Image matches constant B');
                                // Update Excel sheet or any other action you want to take
                            } else if (compareRGB(pixelColor, constantRGB_C)) {
                                console.log('Image matches constant C');
                                // Update Excel sheet or any other action you want to take
                            } else {
                                console.log('Image does not match any constant');
                            }

                            const imageId = workbook.addImage({
                                filename: filepath,
                                extension: 'jpg',
                            });
                            worksheet.addRow(dataRow);
                            const lastRow = worksheet.lastRow;
                            lastRow.getCell('E').value = {
                                hyperlink: filepath,
                                text: 'Snapshot'
                            };
                            workbook.xlsx.writeFile('output_data.xlsx').then(() => {
                                console.log('Excel file saved successfully');
                            }).catch(err => {
                                console.error('Error saving Excel file:', err);
                            });
                            data_buffer = '';
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

///////////////////////////////////////////////

// async function identifyRGB(imagePath) {
//     try {
//         // Read the image
//         const image = sharp(imagePath);

//         // Get image metadata
//         const metadata = await image.metadata();

//         // Get RGB values of three different points in the image
//         // For simplicity, we'll choose the top-left, top-right, and bottom-left corners
//         const points = [
//             { x: 0, y: 0 },
//             { x: metadata.width - 1, y: 0 },
//             { x: 0, y: metadata.height - 1 }
//         ];

//         const rgbValues = [];

//         // Extract RGB values
//         for (const point of points) {
//             const rgba = await image.ensureAlpha().raw().toBuffer({
//                 resolveWithObject: true,
//                 raw: {
//                     width: 1,
//                     height: 1,
//                     left: point.x,
//                     top: point.y,
//                     channels: 4
//                 }
//             });

//             const [r, g, b] = [rgba.data[0], rgba.data[1], rgba.data[2]];
//             rgbValues.push({ r, g, b });
//         }

//         return rgbValues;
//     } catch (error) {
//         console.error('Error:', error);
//     }
// }

// // Usage
// const imagePath = ['C:/Users/TANSAM/Desktop/timestamp/TANSAM/A_Grade_Leaf.jpeg',
//                     'C:/Users/TANSAM/Desktop/timestamp/TANSAM/B_Grade.webp',
//                     'C:/Users/TANSAM/Desktop/timestamp/TANSAM/c_Grade.webp',]

//                     identifyRGB(imagePaths).then(rgbValuesArray => {
//                         console.log('RGB Values for Different Images:');
//                         rgbValuesArray.forEach((rgbValues, index) => {
//                             console.log(`Image ${index + 1}:`);
//                             rgbValues.forEach((rgb, i) => {
//                                 console.log(`Point ${i + 1}: RGB (${rgb.r}, ${rgb.g}, ${rgb.b})`);
//                             });
//                             // Here you can compare RGB values to determine the type of each image
//                             // For example, you can use your existing compareRGB function
//                         });
//                     });
///////////////////////////////////////////////////////// Result ]\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
async function identifyRGB(imagePaths) {
    try {
        const rgbValuesArray = [];

        for (const imagePath of imagePaths) {
            // Read the image
            const image = sharp(imagePath);

            // Get image metadata
            const metadata = await image.metadata();

            // Get RGB values of three different points in the image
            // For simplicity, we'll choose the top-left, top-right, and bottom-left corners
            const points = [
                { x: 0, y: 0 },
                { x: metadata.width - 1, y: 0 },
                { x: 0, y: metadata.height - 1 }
            ];

            const rgbValues = [];

            // Extract RGB values
            for (const point of points) {
                const rgba = await image.ensureAlpha().raw().toBuffer({
                    resolveWithObject: true,
                    raw: {
                        width: 1,
                        height: 1,
                        left: point.x,
                        top: point.y,
                        channels: 4
                    }
                });

                const [r, g, b] = [rgba.data[0], rgba.data[1], rgba.data[2]];
                rgbValues.push({ r, g, b });
            }

            rgbValuesArray.push(rgbValues);
        }

        return rgbValuesArray;
    } catch (error) {
        console.error('Error:', error);
    }
}

// Usage
const imagePaths = [
    'C:/Users/TANSAM/Desktop/timestamp/TANSAM/A_Grade_Leaf.jpeg',
    'C:/Users/TANSAM/Desktop/timestamp/TANSAM/B_Grade.webp',
    'C:/Users/TANSAM/Desktop/timestamp/TANSAM/c_Grade.webp',
];

identifyRGB(imagePaths).then(rgbValuesArray => {
    console.log('RGB Values for Different Images:');
    rgbValuesArray.forEach((rgbValues, index) => {
        console.log(`Image ${index + 1}:`);
        rgbValues.forEach((rgb, i) => {
            console.log(`Point ${i + 1}: RGB (${rgb.r}, ${rgb.g}, ${rgb.b})`);
        });
        // Here you can compare RGB values to determine the type of each image
        // For example, you can use your existing compareRGB function
    });
});

