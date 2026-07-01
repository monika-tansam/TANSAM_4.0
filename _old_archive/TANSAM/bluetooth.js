const bluetooth = require('bluetooth-serial-port');
const ExcelJS = require('exceljs');
const fs = require('fs');
const ImageReceiver = require('./cam')

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
let data_buffer = ''

serial.connect(address, channel, () => {
    console.log('Connected to ESP32');

    serial.on('data', (buffer) => {
        // console.log(buffer);
        const packet = buffer.toString();
        receivedData += packet;
        if (receivedData.includes('\n')) {
            // Split the concatenated data into individual messages
            let messages = receivedData.split('\n');

            // Loop through each complete message
            for (let i = 0; i < messages.length - 1; i++) {
                let message = messages[i].trim(); // Trim whitespace

                // Process each complete message as needed
                console.log(message);


                data_buffer += message.split(':')[1] + '$'
                if (message.includes('Sack Height')) {
                    let dataRow = [new Date().toLocaleString()].concat(data_buffer.split('$').slice(0, -1));
                    let receiver = new ImageReceiver('http://192.168.203.1').receive();
                    receiver.then(filepath=>{
                        console.log('Image received at :', filepath);
                    }).catch(err=>{
                        console.log('Error downloading image.', err);
                    })

                    // receiver.then(filepath => {
                    //     const imageId = workbook.addImage({
                    //         filename: filepath,
                    //         extension: 'jpg',
                    //     });
                    //     console.log(dataRow);
                        
                    // })

                    worksheet.addRow(dataRow);
                    // worksheet.addImage(imageId, {

                    //     tl: { col: 5, row: worksheet.col }, // Position for image in the sheet

                    // })
                    workbook.xlsx.writeFile('output_data.xlsx').then(() => {
                        console.log('Excel file saved successfully');
                    }).catch(err => {
                        console.error('Error saving Excel file:', err);
                    });
                    data_buffer = ''
                }

            }

            // Save the remaining incomplete message for the next iteration
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
} );