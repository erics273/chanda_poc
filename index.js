const fastcsv = require('fast-csv');
const fs = require('fs');
const path = require('path');

//make sure we have a filename passed in from the command line
if (process.argv.length <= 2) {
    console.log("Usage: node " + path.basename(__filename) + " CSV_FILE");
    process.exit(1);
}

//set the filename from the command line
const filePath = process.argv[2];

//make sure file exists
if (!fs.existsSync(filePath)) {
    console.error(`${filePath} does not exist`);
    process.exit(1);
}

//method to process the csv
//returns a promise that resolves the array of rows with added column identical to the first
//filePath (String): path to csv file
const readCSV = (filePath) => {

    return new Promise(function (resolve, reject) {

        //array to store rows as they are read from the csv
        let records = [];

        fastcsv.fromPath(filePath, { headers: false, ignoreEmpty: false })
            .on("data", data => {

                //we don't want to continue if the file has more than 2 columns
                if (data.length > 2) {
                    throw (`${path.basename(filePath)} has more than two columns of data`);
                }

                //if we have 2 columns then we need to see if the second is blank.
                //sometimes the file has the comman but no data for the second column
                if (data.length === 2) {
                    //if we have valid data in the second column, abort
                    if (data[1] !== "") {
                        throw (`${path.basename(filePath)} already has 2 valid colums of data`);
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
//data (Array): array of objects to be written as rows to csv
//filename (String): name of file for new csv
//returns promise
const writeCSV = (data, fileName) => {

    return new Promise(function (resolve, reject) {

        const ws = fs.createWriteStream(`${fileName}`);
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

//main method that orchestrates all the things
const processCSV = (filePath) => {
    return new Promise(function (resolve, reject) {

        //read in the csv file and when finished write the records to a new csv
        console.log('Started: Reading CSV Data');
        readCSV(filePath)
            .then((data) => {

                console.log(`Completed: Reading CSV Data (${data.length.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')} rows)`);
                console.log('Started: Writing CSV Data');

                writeCSV(data, `updated_${path.basename(filePath)}`)
                    .then(() => {
                        console.log('Completed: Writing CSV Data')
                        resolve();
                    })
                    .catch((err) => {
                        reject(err)
                    })

            })
            .catch((err) => {
                reject(err)
            })

    })
}

//call main method that orchestates all the things 
//let us know if it went well or bad
processCSV(filePath)
    .then(()=>console.log("Script Executed Succsfully!"))
    .catch((err)=>{
        console.error(`Error: ${err}`)
        console.log("Script Failed!")
        process.exit(1)
    })


