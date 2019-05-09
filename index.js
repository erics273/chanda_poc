const fastcsv = require('fast-csv');
const fs = require('fs');
const path = require('path');

//make sure we have a filename passed in from the command line
if (process.argv.length <= 2) {
    console.log("Usage: node " + path.basename(__filename) + " CSV_FILE");
    process.exit(1);
}

//set the filename from the command line
const file = process.argv[2];

//make sure file exists
if (!fs.existsSync(file)) {
    console.error(`${file} does not exist`);
    process.exit(1);
}

//define method to process the csv
//filePath (String): path to csv file
//returns a promise that is resolved when all rows are processed
const readCSV = (filePath) => {

    return new Promise(function (resolve, reject) {

        //array to store rows as they are read from the csv
        let records = [];

        fastcsv.fromPath(filePath, { headers: false, ignoreEmpty: false })
            .on("data", data => {

                //we don't want to continue if the file has more than 2 columns
                if (data.length > 2) {
                    throw (`${filePath} has more than two columns of data`);
                }

                //if we have 2 columns then we need to see if the second is blank.
                //sometimes the file has the comman but no data for the second column
                if (data.length === 2) {
                    //if we have valid data in the second column, abort
                    if (data[1] !== "") {
                        throw (`${filePath} already has 2 valid colums of data`);
                    }

                    //remove the empty column and continue.
                    data.length = 1;
                }

                //create a new record in our records with the duplicated column
                records.push([data[0], data[0]])
            })
            .on("error", (err) => {
                //reject the promise if linbrary fails to proccess csv
                reject(err)
            })
            .on("end", () => {
                //write the new records to their own csv
                resolve(records)
            });

    })
}

//create csv
//returns promise
const writeCSV = (data) => {

    return new Promise(function (resolve, reject) {

        const ws = fs.createWriteStream(`updated_${file}`);
        fastcsv
            .write(data, { headers: false })
            .pipe(ws)
            .on("error", function () {
                reject("Error writing CSV file");
            })
            .on("finish", function () {
                resolve();
            });
    })
}

//read in the csv file and when finished write the records to a new csv
console.log('Started: Reading CSV Data');
readCSV(file)
    .then((data) => {

        console.log(`Completed: Reading CSV Data (${data.length.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')} rows)`);
        console.log('Started: Writing CSV Data');

        writeCSV(data)
            .then(() => {
                console.log('Completed: Writing CSV Data')
            })
            .catch((err) => {
                console.error(err)
                process.exit(1);
            })

    })
    .catch((err) => {
        console.error(err)
        process.exit(1);
    })

