# CSV Column Duplicator 
This application takes a csv file with one column and outputs a new csv with 2 columns. The second column is a duplicate of the first column. It was created to because the CSV files being parsed have over a million rows in them. Doing this with standard tools was taking ~30-60 minutes. This script is to serve as a proof of concept. It accomplishes the task in a ~5 seconds for a file with over 1 million rows.

## Installation

* Clone this repo
* cd into to repo and run `npm -i`

## Usage
You have been provided two sample csv files. **data_hundred.csv** contains 100 rows of data. **data_million.csv** contains over 1,000,000 rows of data.

**Example Usage:**

```bash
$ node index CSV_FILE
```

**Proccess sample data:**

Outputs updates_data_million.csv with added column
```bash
$ node index data_million.csv
```