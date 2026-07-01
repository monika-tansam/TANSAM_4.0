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

// Initialize workbook and worksheet
async function initializeWorkbook() {
    workbook = new ExcelJS.Workbook();

    try {
        await fs.promises.access('output_data.xlsx', fs.constants.F_OK);
        await workbook.xlsx.readFile('output_data.xlsx');
        worksheet = workbook.getWorksheet('Data');
    } catch (err) {
        workbook = new ExcelJS.Workbook();
        worksheet = workbook.addWorksheet('Data');
        worksheet.addRow(['Timestamp', 'Moisture', 'Distance', 'Sack Height', 'Snapshot']);
        await workbook.xlsx.writeFile('output_data.xlsx');
    }
}

// Call the initialization function
initializeWorkbook().then(() => {
    console.log('Excel file initialized successfully');
}).catch(err => {
    console.error('Error initializing Excel file:', err);
});

// Serial connection
serial.connect(address, channel, async () => {
    console.log('Connected to ESP32');

    serial.on('data', async (buffer) => {
        const packet = buffer.toString();
        let receivedData = '';

        receivedData += packet;
        if (receivedData.includes('\n')) {
            let messages = receivedData.split('\n');

            for (let i = 0; i < messages.length - 1; i++) {
                let message = messages[i].trim();

                console.log(message);

                let data_buffer = '';
                data_buffer += message.split(':')[1] + '$';

                if (message.includes('Sack Height')) {
                    let dataRow = [new Date().toLocaleString()].concat(data_buffer.split('$').slice(0, -1));

                    // Receiving image
                    try {
                        const filepath = await receiveImage();
                        console.log('Image received at:', filepath);

                        // Ensure worksheet is initialized before adding a row
                        if (worksheet) {
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
                            await workbook.xlsx.writeFile('output_data.xlsx');
                            console.log('Excel file updated successfully');
                        } else {
                            console.error('Worksheet not initialized!');
                        }
                    } catch (error) {
                        console.log('Error downloading image.', error);
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

// Function to receive image
async function receiveImage() {
    const imageReceiver = new ImageReceiver('http://192.168.203.1');
    return await imageReceiver.receive();
}

// Function to save image and return file path
async function pipeStream(data) {
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

    try {
        await fs.promises.mkdir(outputFolderPath, { recursive: true });

        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
        const image = await Jimp.read(data);
        image.print(font, 10, 10, "");
        await image.writeAsync(outputFile);

        console.log('Image data saved successfully:', outputFile);
        return outputFile;
    } catch (error) {
        console.error('Error processing image:', error);
        throw error;
    }
}

// Class for image receiver
class ImageReceiver {
    constructor(url) {
        this.url = url;
    }

    async receive() {
        try {
            const response = await axios.get(this.url, { responseType: 'arraybuffer' });
            return await pipeStream(response.data);
        } catch (error) {
            console.error('Error fetching HTTP stream:', error);
            throw error;
        }
    }
}
