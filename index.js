const { readFileSync, readdirSync } = require('fs');

// allow the provision for this to be provided dynamically

const monthMap = {
  1: 'January',
  2: 'February',
  3: 'March',
  4: 'April',
  5: 'May',
  6: 'June',
  7: 'July',
  8: 'August',
  9: 'September',
  10: 'October',
  11: 'November',
  12: 'December',
};

// Result format
let result = {
  maxDailySalesVolume: 0,
  maxDailySalesValue: 0,
  mostSoldProductId: '',
  mostSoldProductAmount: 0,
  highestStaffSales: {},
  highestHourOfDayByAvgVolume: '',
};

// Staff Document
/**
 * Staff Schema
 * {
 *   [staffId]: [{
 *      month: string,
 *      sales: number
 *   }]
 * }
 */
let staffDocument = {};
// product Document
/**
 * product Schema
 * [productId:string]: volume
 */
let productDocument = {};

let hourlyTransactionVolume = {};

// Function to find value in an array using the key
function findOne(arr, key, value) {
  let index;
  let obj = arr.find((o) => o[key] === value);
  index = arr.indexOf(obj);
  if (!obj) {
    return false;
  }
  return { ...obj, index };
}

// Traverse through files
function formatTransactions(dir) {
  const files = readdirSync(dir);

  for (let i = 0; i < files.length; i++) {
    const singleDayTransaction = readFileSync(`./${dir}/${files[i]}`, 'utf-8');
    const month = monthMap[Number(files[i].split('-')[1])];
    const singleTransactions = singleDayTransaction.split('\n');

    let totalDayTradingVolume = 0;
    let totalDaySalesValue = 0;
    for (let j = 0; j < singleTransactions.length; j++) {
      const singleTransaction = singleTransactions[j];
      const txParams = singleTransaction.split(',');

      if (txParams.length < 4) {
        continue;
      }
      // extract basic transaction data
      let txData = {
        saleStaffId: txParams[0],
        transactionTime: txParams[1],
        saleAmount: Number(txParams[3]),
        productSold: [],
      };
      const d = new Date(txData.transactionTime);
      let hour = d.getHours();

      totalDaySalesValue += txData.saleAmount;
      const staff = staffDocument[txData.saleStaffId];
      if (staff) {
        const staffMonthPerformance = findOne(staff, 'month', month);
        if (staffMonthPerformance) {
          staffDocument[txData.saleStaffId][staffMonthPerformance.index] = {
            month,
            sales: staffMonthPerformance.sales + txData.saleAmount,
          };
        } else {
          staffDocument[txData.saleStaffId].push({
            month,
            sales: txData.saleAmount,
          });
        }
      } else {
        staffDocument[txData.saleStaffId] = [
          {
            month,
            sales: txData.saleAmount,
          },
        ];
      }
      const individualSales = txParams[2].split('|');
      for (let k = 0; k < individualSales.length; k++) {
        // Remove the brackets from the string
        const sale = individualSales[k].replace(/[\][]/g, '');

        const [productId, quantity] = sale.split(':');
        txData.productSold.push({
          productId,
          quantity,
        });
        if (!productDocument[productId]) {
          productDocument[productId] = Number(quantity);
        } else {
          productDocument[productId] =
            productDocument[productId] + Number(quantity);
        }
        if (hourlyTransactionVolume[hour]) {
          hourlyTransactionVolume[hour].count += 1;
          hourlyTransactionVolume[hour].value =
            hourlyTransactionVolume[hour].value + Number(quantity);
          let average =
            hourlyTransactionVolume[hour].value /
            hourlyTransactionVolume[hour].count;

          hourlyTransactionVolume[hour].average = average;
        } else {
          hourlyTransactionVolume[hour] = {
            count: 1,
            value: Number(quantity),
            average: Number(quantity),
          };
        }

        totalDayTradingVolume += Number(quantity);
      }
    }
    result.maxDailySalesVolume = Math.max(
      totalDayTradingVolume,
      result.maxDailySalesVolume
    );
    result.maxDailySalesValue = Math.max(
      totalDaySalesValue,
      result.maxDailySalesValue
    );
  }
}

function checkHighestHourByTradingVolume() {
  let maxAvgTransactions = 0;
  Object.keys(hourlyTransactionVolume).forEach(function (key) {
    if (maxAvgTransactions < hourlyTransactionVolume[key].average) {
      result.highestHourOfDayByAvgVolume = key;
      maxAvgTransactions = hourlyTransactionVolume[key].average;
    }
  });
}

function checkHighestProductIdByVolume() {
  let maxVolume = 0;
  Object.keys(productDocument).forEach(function (key, index) {
    if (maxVolume < productDocument[key]) {
      result.mostSoldProductId = key;
      maxVolume = productDocument[key];
      result.mostSoldProductAmount = maxVolume;
    }
  });
}

function checkHighestStaffPerformancePerMonth() {
  /**
   * i'll be using the index of the array to track for the maximum sales per month
   * From 0 - January to 11 - December
   *  */
  let maxSales = {};
  Object.keys(staffDocument).forEach(function (key) {
    staffDocument[key].map((value) => {
      let monthIndex = Object.keys(monthMap).find(
        (k) => monthMap[k] == value.month
      );
      // offseting the index by 1
      if (!maxSales[monthMap[monthIndex]]) {
        maxSales[monthMap[monthIndex]] = {
          sales: value.sales,
          staffId: key,
        };
      }
      if (maxSales[monthMap[monthIndex]].sales < value.sales) {
        maxSales[monthMap[monthIndex]].sales = value.sales;
        maxSales[monthMap[monthIndex]].staffId = key;
      }
    });
  });
  result.highestStaffSales = maxSales;
}

function cmd(dirname, file_index) {
  let fallbackDirName = './';
  let fallbackFileIndex = 'test-case';
  if (dirname && file_index) {
    fallbackDirName = dirname;
    fallbackFileIndex = file_index;
  }

  const directory = readdirSync(fallbackDirName);
  if (directory.length > 0) {
    const filteredDir = directory.filter((value, index) =>
      value.includes(fallbackFileIndex)
    );
    if (filteredDir.length > 0) {
      for (let i = 0; i < filteredDir.length; i++) {
        formatTransactions(filteredDir[i]);
      }
    } else {
      throw new Error('Directory does not contain required files');
    }
  }
  checkHighestProductIdByVolume();
  checkHighestStaffPerformancePerMonth();
  checkHighestHourByTradingVolume();
  console.log(
    'RAW RESPONSE\n',
    result,
    '\n-------------------------------------------------------------------\n'
  );

  console.log(
    `THE HIGHEST SALES VALUE IN A DAY IS ${result.maxDailySalesValue}\nTHE HIGHEST SALES VOLUME IN A DAY IS ${result.maxDailySalesVolume}\nTHE STAFF WITH THE HIGHEST MONTHLY SALES ARE \n`,
    result.highestStaffSales,
    `\nTHE PRODUCT WITH THE HIGHEST VOLUME IN THE YEAR IS PRODUCT ${result.mostSoldProductId} with ${result.mostSoldProductAmount} sales\nTHE HIGHEST HOUR OF THE DAY BY AVERAGE TRANSACTION VOLUME IS ${result.highestHourOfDayByAvgVolume}\n`
  );
}
const arg = process.argv.slice(2);

try {
  cmd(arg[0], arg[1]);
} catch (err) {
  console.log('ERROR ANALYSING GIVEN DIRECTORY ->', err.message);
}
