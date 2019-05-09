const fastcsv = require('fast-csv');
const fs = require('fs');
const path = require('path');

//make sure we have a filename passed in from the command line
if (process.argv.length <= 2) {
    console.error("Usage: node " + path.basename(__filename) + " CSV_FILE");
    process.exit(-1);
}

//set the filename from the command line
const file = process.argv[2];

//make sure file exists
if (!fs.existsSync(file)) {
    console.error(`Aborted: ${file} does not exist`);
    process.exit(-1);
}

//define method to process the csv
//filePath (String): path to csv file
//callback (Function): Receives Array of csv rows as its parameter 
const readCSV = (filePath) => {

    return new Promise(function (resolve, reject) {

        console.log('Started: Reading CSV Data');

        //array to store rows as they are read from the csv
        let records = [];

        fastcsv.fromPath(filePath, { headers: false, ignoreEmpty: false })
            .on("data", data => {

                //we don't want to continue if the file has more than 2 columns
                if (data.length > 2) {
                    console.error(`Aborted: ${filePath} has more than two columns of data`);
                    process.exit(-1);
                }

                //if we have 2 columns then we need to see if the second is blank.
                //sometimes the file has the comman but no data for the second column
                if (data.length === 2) {
                    //if we have valid data in the second column, abort
                    if (data[1] !== "") {
                        console.error(`Aborted: ${filePath} already has 2 valid colums of data`);
                        process.exit(-1);
                    }

                    //remove the empty column and continue.
                    data.length = 1;
                }

                //create a new record in our records with the duplicated column
                records.push([data[0], data[0]])
            })
            .on("error", () => {
                //write the new records to their own csv
                reject(`Aborted: ${filePath} failed to process for unknown reason`)
            })
            .on("end", () => {
                console.log(`Completed: Reading CSV Data (${records.length.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')} rows)`);
                //write the new records to their own csv
                resolve(records)
            });

    })
}

const writeCSV = (data) => {
    console.log('Started: Writing CSV Data');
    const ws = fs.createWriteStream(`updated_${file}`);
    fastcsv
        .write(data, { headers: false })
        .pipe(ws)
        .on("finish", function () {
            console.log('Completed: Writing CSV Data');
        });
}

//read in the csv file and when finished write the records to a new csv
readCSV(file).then(writeCSV)