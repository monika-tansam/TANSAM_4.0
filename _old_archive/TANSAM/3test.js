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

serial.connect(address, channel, () => {
    console.log('Connected to ESP32');

    serial.on('data', async (buffer) => {
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
                    try {
                        const imageReceiver = new ImageReceiver('http://192.168.203.1');
                        const filepath = await imageReceiver.receive();
                        console.log('Image received at :', filepath);
                        const quality = await processImage(filepath);
                        console.log('Determined Quality:', quality);
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
                    } catch (error) {
                        console.log('Error processing image.', error);
                    }
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

async function processImage(imageBuffer) {
    const image = await Jimp.read(imageBuffer);
    const quality = determineTeaLeafQuality(image);
    
    console.log('Determined Quality:', quality);
    return quality;
}

function determineTeaLeafQuality(image) {
    // Placeholder for your feature extraction and quality determination logic
    // Replace this with the actual criteria you've developed

    // Example of how you might implement this:
    const feature1 = extractFeature1(image);
    const feature2 = extractFeature2(image);
    const feature3 = extractFeature3(image);

    // Example quality determination based on extracted features
    if (meetsCriteriaA(feature1, feature2, feature3)) {
        return 'A';
    } else if (meetsCriteriaB(feature1, feature2, feature3)) {
        return 'B';
    } else {
        return 'C';
    }
}

// Placeholder functions for feature extraction
function extractFeature1(image) {
    const colorCounts = {}; // Object to store color counts
    let totalPixels = 0;

    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
        const red = this.bitmap.data[idx + 0];
        const green = this.bitmap.data[idx + 1];
        const blue = this.bitmap.data[idx + 2];
        const colorKey = `${red},${green},${blue}`;

        if (!colorCounts[colorKey]) {
            colorCounts[colorKey] = 0;
        }
        colorCounts[colorKey]++;
        totalPixels++;
    });

    // Convert counts to percentages and find dominant colors
    const colorPercentages = {};
    for (const color in colorCounts) {
        colorPercentages[color] = (colorCounts[color] / totalPixels) * 100;
    }

    // Sort colors by their percentage in descending order to find the most dominant colors
    const sortedColors = Object.entries(colorPercentages).sort((a, b) => b[1] - a[1]);

    // Return the top N dominant colors, N can be adjusted as needed
    const topDominantColors = sortedColors.slice(0, 5).map(item => ({ color: item[0], percentage: item[1] }));
    return topDominantColors;
}

function extractFeature2(image) {
    // Convert the image to grayscale
    const grayscaleImage = image.clone().greyscale();

    let histogram = new Array(256).fill(0);
    let totalPixels = 0;

    grayscaleImage.scan(0, 0, grayscaleImage.bitmap.width, grayscaleImage.bitmap.height, function(x, y, idx) {
        const grayValue = this.bitmap.data[idx];
        histogram[grayValue]++;
        totalPixels++;
    });

    // Calculate entropy
    let entropy = 0;
    for (let i = 0; i < histogram.length; i++) {
        if (histogram[i] !== 0) {
            const probability = histogram[i] / totalPixels;
            entropy -= probability * Math.log2(probability);
        }
    }

    return entropy;
}

function extractFeature3(image) {
    // Convert the image to grayscale and apply a threshold
    const binaryImage = image.clone().greyscale().threshold({ max: 128 });

    const regions = 4; // For example, divide the image into 4 regions
    const regionWidth = binaryImage.bitmap.width / regions;
    const regionHeight = binaryImage.bitmap.height / regions;
    const leafDensities = [];

    for (let i = 0; i < regions; i++) {
        for (let j = 0; j < regions; j++) {
            let leafCount = 0;
            let totalPixels = 0;

            binaryImage.scan(i * regionWidth, j * regionHeight, regionWidth, regionHeight, function(x, y, idx) {
                const value = this.bitmap.data[idx];
                if (value > 0) { // Assuming leaf pixels are white
                    leafCount++;
                }
                totalPixels++;
            });

            const density = leafCount / totalPixels;
            leafDensities.push(density);
        }
    }

    // Return the average density of the regions
    const averageDensity = leafDensities.reduce((sum, density) => sum + density, 0) / leafDensities.length;
    return averageDensity;
}

// Placeholder functions for criteria checking
function meetsCriteriaA(feature1, feature2, feature3) {
    // Placeholder logic for determining if the features meet the criteria for quality 'A'
    // This should be replaced with your actual decision-making logic based on the analysis of your tea leaf data

    // Example criteria based on made-up thresholds and conditions
    // Note: The thresholds and conditions here are purely illustrative
    const colorThreshold = 0.5; // Example threshold for a color feature
    const textureThreshold = 15; // Example threshold for a texture feature
    const densityThreshold = 0.3; // Example threshold for a leaf density feature

    // Check if the features meet the criteria for quality 'A'
    if (feature1.averageRed > colorThreshold && feature2 > textureThreshold && feature3 < densityThreshold) {
        return true; // The features meet the criteria for quality 'A'
    } else {
        return false; // The features do not meet the criteria for quality 'A'
    }
}


function meetsCriteriaB(feature1, feature2, feature3) {
    // Placeholder logic for determining if the features meet the criteria for quality 'B'
    // Replace this with your actual decision-making logic based on the analysis of your tea leaf data


    // Example criteria based on made-up thresholds and conditions
    // Note: These thresholds and conditions are illustrative
    const dominantColorThreshold = 0.4; // Example threshold for dominant color percentage
    const textureThreshold = 10; // Example threshold for texture feature
    const densityThreshold = 0.4; // Example threshold for leaf density feature

    // Check if the features meet the criteria for quality 'B'
    // Assuming feature1 is an array of dominant colors with percentages
    const dominantColorPercentage = feature1.find(colorInfo => colorInfo.color === 'desiredColor').percentage;
    
    if (dominantColorPercentage > dominantColorThreshold && feature2 < textureThreshold && feature3 > densityThreshold) {
        return true; // The features meet the criteria for quality 'B'
    } else {
        return false; // The features do not meet the criteria for quality 'B'
    }
}

// Save the last output to Excel when the script exits
process.on('SIGINT', () => {
    console.log('Exiting...');
    workbook.xlsx.writeFile('output_data.xlsx').then(() => {
        console.log('Excel file saved successfully');
        process.exit(0);
    }).catch(err => {
        console.error('Error saving Excel file:', err);
        process.exit(1);
    });
});
