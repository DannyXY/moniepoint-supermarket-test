# TRANSACTION ANALYSIS PROGRAM

### HOW TO USE

Ensure you have NodeJS Installed on your system, if not, you can download it from their official website

Run the following bash command to check if you have node installed

```bash
node -v
```

The CMD tool has 2 optional parameters namely _dirname_ and _file_index_
The dirname points to the location where the transaction folders are located
The file index points to the common index of the folders containing the transactions to ensure that the right folders are selected

By default the program is set to look into it's current directory and check for any file containing an index "test-case" which requires you to have the folder at the root of the project

### RUNNING THE PROGRAM

- Without parameters

```bash
node index.js
```

- With parameters

```bash
node index.js ./ test-case
```
