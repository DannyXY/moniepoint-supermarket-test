Each file contains daily Transactions
File size is approx. 9MB each

file is saved in csv format but as a txt file
File serialized is

```js
{
    salesStaffId: number,
    transactionTime: DateTime,
    productsSold: {
        [number]: [number],
    }
    saleAmount: number
}
```

Task is to read through a full year of files and report metrics:

[x] Highest Sales Volume in a day
[x] Highest sales value in a day
[ ] Most sold product ID by volume
[ ] Highest sales staffID for each month
[ ] Highest hour og the day by average transaction volume

Sample Line from single transaction: 8,2025-01-01T09:08:29,[640085:8|33261:3|93535:6|876016:8|332209:8|683074:3|493368:9|68863:8],29430.205
Files are named in accordance to days
2025-01-01
YYYY-MM-DD

CODE TASKS
[ ] First task is to traverse through the data, using the \n separator for each transaction line
[ ] Second task is to separate different parameters of the single transactions using the separator ","
[ ] Thied task is to separate the different products sold
[ ] Fourth task is modelling the structure of the data for easy aggregation
[ ] the files also need to be separated by their names

Looking at the test case, the files are sorted in accordance to the dates given, this should help in tracking the months
