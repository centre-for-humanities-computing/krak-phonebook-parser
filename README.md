# Krak phonebook parser
[Description]

Uses the npm package `pdf-text-extract` to extract text from PDFs that already contain searchable text.

## CLI installation

- Install Node.js (version?)
- Requires `pdftotext` in the path
- Clone this repository
- Navigate to the root of the repository and run

`npm install`

## CLI usage

- Navigate to the root of the repository and run

`node parse`

- Note: All files must have their year in the filename in the YYYY format. The script will take the first valid year in the filename as the basis for the output.

## CLI options

- `-s, -source <path>` [required]: A path to the file or folder containing the PDFs to be read and parsed. If the path resolves to a file, the `-f, --file` argument must be supplied. 
- `-d, destination <directory>` [required]: A path to the folder where data should be saved.
- `-f, --file` [optional]: Flag. If not supplied, all files of type `.pdf` in the source folder will be parsed. Will throw error if the flag is set but the source path resolves to a folder. (not implemented yet)

## Terminal output

When the parser has run, an estimate of success will be printed to the terminal in the form 

```
Total lines: X

Intentionally ignored lines (by rule): Y
Unresolved lines: Z
Successful lines: Æ

Success rate: 0.8 ((X-Y) / Æ)
```