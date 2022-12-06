# Krak phonebook parser

A tool for extracting names, addresses and phone numbers from PDFs and parsing them according to a set of rules.

Created to extract demographic information from Krak's residency registry, published between X and 2008.

The OCR scanned PDFs can be located at https://bibliotek.kk.dk/temaer/krak/1990-2007/08 


## CLI installation

- Install Node.js (version?)
- Requires `pdftotext` in the path (https://www.xpdfreader.com/pdftotext-man.html)
- Clone this repository
- Navigate to the root of the repository and run

`npm install`

## CLI usage

- Navigate to the root of the repository and run

`node ./cli.js -s [input directory or file] -d [output directory]`

- The input must be a valid PDF file or folder. If provided a folder, the extracter will read all PDFs in that folder (not yet implemented to look in subfolders) and extract text from them.
- As an intermediate step, the script creates a temporary folder in the output directory (/temp/) with the raw text extracts. They are deleted after the parsing, unless flag `--keep` is given.
- If the output folder does not exist, it will be created.
- Note: All files must have their year in the filename in the format: YYYY. The script will take the first valid year in the filename as the basis for the output.

## CLI options

- `-s, -source <path>` [required]: A path to the file or folder containing the PDFs to be read and parsed. If the source path resolves to a file, extracts and parses only text from that file.
- `-d, destination <directory>` [required]: A path to the folder where data should be saved.
- `-f, --file` [optional]: Outputs parser statistics to file in the destination folder (stats/stats.txt). Otherwise prints to terminal.
- `-t, --threshold <integer>` [optional]: Defines a minimum line length (= number of characters) to consider when parsing. Disregards anything below this threshold. Default is `5`.
- `-p, --parse` [optional]: Parse only (skips the extraction of text from PDF). Useful when experimenting with different rules and thresholds.
- `-k, --keep` [optional]: Keeps the temporary folder and the raw text extracted from the PDFs. Must be used at least once before using the `-p, --parse` argument.
- `-d, --debug` [optional]: Debug mode. Prints a lot of things in the terminal while running.

## Terminal output

When the parser has run, an estimate of success will be printed to the terminal (or to a file if flag `--file` is set).

# Notes

Currently runs synchronously. Needs refactoring to extract text from multiple files simultaneously.

---

# Finding unique names

`unique.js` is a simple script that finds all unique names in either a given year or for all years.

## Arguments

- `<path>` [required]: An absolute path to the directory that contains the output from the main CLI program. The data must be in the form produced by the CLI program (`YYYY.ndjson`).
- `<integer>` [optional]: A year in the format YYYY. If specified, generates a list of unique names only for that year provided the data for that year exists.

## Usage

`node ./unique.js [required: path to directory] [optional: year]`

Example:

`node ./unique.js /Users/me/data 2004`