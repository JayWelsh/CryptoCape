import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import OurChart from './OurChart';
import OurPieChart from './OurPieChart';
import Grid from '@material-ui/core/Grid';
import ChartMenuMiniCard from './ChartMenuMiniCard';
import SortableTable from './SortableTable';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import {priceFormat, numberFormat, isValidAddress, rangeToHours, weiToEther, subtractNumbers, addNumbers, multiplyNumbers} from '../utils';
import moment from 'moment';

function TabContainer({ children, dir }) {
  return (
    <Typography component="div" dir={dir} className="mobile-friendly-padding" style={{ justifyContent: 'space-between', height: 'calc(100%)' }}>
      {children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
  dir: PropTypes.string.isRequired,
};

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    width: '100%',
    padding: '10px',
    paddingTop: '20px'
  },
  pageMinHeight: {
    minHeight: 'calc(100vh - 64px)'
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
  menu: {
    width: 200,
  },
  fullWidth: {
    width:'100%'
  },
  fiatSwitch: {
    top: '50%',
    position: 'relative',
    transform: 'translateY(-50%)',
    marginTop: '4px',
    marginLeft: '-5px'
  },
  addressOptions: {
    'left': '50%',
    'position': 'relative',
    'transform': 'translateX(-50%)',
    'maxWidth': '850px'
  },
  formContainer: {
    display: 'flex'
  }
});

class PortfolioPage extends React.Component {
    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
        isConsideredMobile: PropTypes.bool.isRequired
    }

    constructor(props) {
        super(props);
        this.state = {
          value: this.props.publicKey ? 1 : 0,
          publicKey: this.props.publicKey ? this.props.publicKey : "",
          coins: {},
          ethPriceUSD: 0,
          totalPortfolioValueUSD: 0,
          totalPortfolioValueETH: 0,
          etherMarketCap: 0,
          isChartLoading: true,
          baseCurrencyToUSD: [],
          historicalBaseCurrency: 'ETH',
          publicKeyError: false,
          enableFiatConversion: false,
          enableCompositeGraph: false,
          isCompositeReady: false,
          timeseriesRange: "ALL",
          includeInCompositePricingQueries: []
        };
    }
    
  toggleFiatConversion = () => {
    const { enableCompositeGraph } = this.state;
    let setEnableCompositeGraph = enableCompositeGraph;
    if(setEnableCompositeGraph){
      setEnableCompositeGraph = false;
    }
    this.setState({ enableFiatConversion: !this.state.enableFiatConversion, enableCompositeGraph: setEnableCompositeGraph });
  }

  toggleCompositeGraph = () => {
    const { enableFiatConversion } = this.state;
    let setEnableFiatConversion = enableFiatConversion;
    if(!setEnableFiatConversion){
      setEnableFiatConversion = true;
    }
    this.setState({ enableCompositeGraph: !this.state.enableCompositeGraph, enableFiatConversion: setEnableFiatConversion });
  }

  handleSetAddress(event, history) {
    if (event.target.value !== this.state.publicKey) {
      if (isValidAddress(event.target.value)) {
        history.push("/portfolio/" + event.target.value);
      }else{
        this.setState({publicKey:event.target.value});
      }
    }
  };

  setAddressInput(address, history) {
    if (isValidAddress(address)) {
      history.push("/portfolio/" + address);
    }
  }

    handleChangeBaseCurrency = name => event => {
      axios.all([this.getBaseCurrencyHistoricalUSD(event.target.value)]).then((res) => {
        let { baseCurrencyToUSD, enableFiatConversion } = this.state;
        if(res[0] && res[0].constructor === Array && res[0].length > 0){
          baseCurrencyToUSD = res[0];
        } else {
          enableFiatConversion = false;
          baseCurrencyToUSD = [];
        }
        this.setState({
          [name]: event.target.value,
          baseCurrencyToUSD,
          enableFiatConversion,
        });
      });
    };

    handleChangeIndex = index => {
        this.setState({ value: index });
    };

    getTokenTransactionHistory(publicKey) {
      let getTokenTransactionHistoryURL = 'https://api.etherscan.io/api?module=account&action=tokentx&address=' + publicKey + '&startblock=0&endblock=999999999&sort=asc&apikey=4H7XW7VUYZD2A63GPIJ4YWEMIMTU6M9PGE';
      return axios.get(getTokenTransactionHistoryURL);
    }

    getEtherTransactionHistory(publicKey) {
      let getEthTransactionHistoryURL = 'https://api.etherscan.io/api?module=account&action=txlist&address=' + publicKey + '&startblock=0&endblock=99999999&sort=asc&apikey=4H7XW7VUYZD2A63GPIJ4YWEMIMTU6M9PGE';
      return axios.get(getEthTransactionHistoryURL);
    }

    getInternalEtherTransactionHistory(publicKey) {
      let getInternalEthTransactionHistoryURL = 'https://api.etherscan.io/api?module=account&action=txlistinternal&address=' + publicKey + '&startblock=0&endblock=99999999&sort=asc&apikey=4H7XW7VUYZD2A63GPIJ4YWEMIMTU6M9PGE';
      return axios.get(getInternalEthTransactionHistoryURL);
    }

    getBaseCurrencyHistoricalUSD = async (historicalBaseCurrency) => {
      let getHistoricalBaseCurrency = "https://min-api.cryptocompare.com/data/histoday?fsym=" + historicalBaseCurrency + "&tsym=USD&allData=true&aggregate=1&e=CCCAGG&api_key=2f4e46520951f25ee11bc69becb7e5b4a86df0261bb08e95e51815ceaca8ac5b";
      let result = await axios.get(getHistoricalBaseCurrency);
      if(result && result.data && result.data.Data && result.data.Data.length > 0) {
        return result.data.Data;
      }else{
        // Use CoinGecko Fallback
        let fallbackResult = await axios.get(`https://api.coingecko.com/api/v3/coins/${historicalBaseCurrency.toLowerCase() !== "eth" ? historicalBaseCurrency.toLowerCase() : "ethereum"}/market_chart?vs_currency=usd&days=max`);
        if(fallbackResult && fallbackResult.data && fallbackResult.data.prices) {
          let fallbackLinkTimeseries = [];
          for(let timeseriesEntry of fallbackResult.data.prices) {
            fallbackLinkTimeseries.push({
              time: Math.floor(timeseriesEntry[0] / 1000),
              close: timeseriesEntry[1],
              open: timeseriesEntry[1]
            })
          }
          return fallbackLinkTimeseries;
        }
      }
    }

  getClosestTimestamp = (arr, goal, prop) => {
    if(arr && arr.constructor === Array){
      var indexArr = arr.map(function (k) { return Math.abs(k[prop] - goal) })
      var min = Math.min.apply(Math, indexArr)
      return arr[indexArr.indexOf(min)]
    }else{
      return false;
    }
  }

  setTimeseriesRange(range) {
    if(range !== this.state.timeseriesRange){
      this.setState({timeseriesRange: range});
    }
  }

  getSelectedTimeseriesRange(timeseriesRange) {
    if(this.state.timeseriesRange === timeseriesRange) {
      return {
        "fontWeight": "bold",
        "color": "white",
        "backgroundColor": "#000628"
      }
    }
  }

  buildCompositeTimeseries = async (coins) => {
    const {timeseriesRange} = this.state;
    let timeseriesData = [];
    let fullHistoryLinks = [];
    let fullHistoryFallbackLinks = [];
    let fullHistoricalCurrencies = [];
    let consolidatedTimeseries = {};
    for(let historicalBaseCurrency of Object.keys(coins)){
        fullHistoryLinks[historicalBaseCurrency] = "https://min-api.cryptocompare.com/data/histoday?fsym=" + historicalBaseCurrency + "&tsym=USD&allData=true&aggregate=1&e=CCCAGG&api_key=2f4e46520951f25ee11bc69becb7e5b4a86df0261bb08e95e51815ceaca8ac5b";
    }
    await this.delayApiCalls(fullHistoryLinks).then(data => {
      let index = 0;
      for(let symbol of Object.keys(fullHistoryLinks)){
        fullHistoricalCurrencies[symbol] = data[index].data.Data;
        if(!data[index].data.Data || data[index].data.Data.length === 0) {
          fullHistoryFallbackLinks[symbol] = `https://api.coingecko.com/api/v3/coins/${symbol.toLowerCase() !== "eth" ? symbol.toLowerCase() : "ethereum"}/market_chart?vs_currency=usd&days=max`;
        }
        index++;
      }
    });
    await this.delayApiCalls(fullHistoryFallbackLinks).then(data => {
      let index = 0;
      for(let symbol of Object.keys(fullHistoryFallbackLinks)){
        let fallbackLinkTimeseries = [];
        for(let timeseriesEntry of data[index].data.prices) {
          fallbackLinkTimeseries.push({
            time: Math.floor(timeseriesEntry[0] / 1000),
            close: timeseriesEntry[1],
            open: timeseriesEntry[1]
          })
        }
        fullHistoricalCurrencies[symbol] = fallbackLinkTimeseries;
        index++;
      }
    });
    let forceCurrentTime = moment();
    for(let historicalBaseCurrency of Object.keys(coins)){
      if(coins &&  coins[historicalBaseCurrency] && coins[historicalBaseCurrency].timeseries) {
        let bufferTimeseries = this.bufferTimeseries(coins[historicalBaseCurrency].timeseries, 'daily', true, forceCurrentTime);
        timeseriesData = this.convertBaseBalances(bufferTimeseries, fullHistoricalCurrencies[historicalBaseCurrency], true);
        if(timeseriesRange && (timeseriesData.length > 0)) {
          let rangeInHours = rangeToHours(timeseriesRange);
          if (rangeInHours) {
            let startTime = moment().subtract(rangeInHours, 'hours');
            timeseriesData = timeseriesData.filter((item) => {
              return moment(item.date).isAfter(startTime);
            });
          }
        }
      }
      for(let timestamp of Object.keys(timeseriesData)) {
        if(consolidatedTimeseries[timestamp]) {
          consolidatedTimeseries[timestamp] += timeseriesData[timestamp].price;
        }else{
          consolidatedTimeseries[timestamp] = timeseriesData[timestamp].price;
        }
      }
    }
    let compositeTimeseries = [];
    for(let [index, item] of Object.entries(consolidatedTimeseries)){
      compositeTimeseries.push(Object.assign({date: moment.unix(index * 1), price: item}));
    }
    return compositeTimeseries;
  }

    fetchAddressTransactionHistory = async () => {
      let thisPersist = this;
      let publicKey = this.state.publicKey;
      let restrictCoins = this.state.coins;
      let includeInCompositePricingQueries = this.state.includeInCompositePricingQueries || [];
      let historicalBaseCurrency = this.state.historicalBaseCurrency;
      axios.all([this.getEtherTransactionHistory(publicKey), this.getTokenTransactionHistory(publicKey),this.getBaseCurrencyHistoricalUSD(historicalBaseCurrency), this.getInternalEtherTransactionHistory(publicKey)]).then(async (res) => {
        if (res && res[1].data && res[1].data.result && (res[1].data.result.constructor === Array)) {
          let transactionDataEther = res[0].data.result.map((item) => {
            item.tokenSymbol = "ETH";
            if(item.isError === "0") {
              return item;
            } else {
              return null;
            }
          }).filter(item => item !== null);

          let transactionDataEtherInternal = res[3].data.result.map((item) => {
            item.tokenSymbol = "ETH";
            item.internalTransaction = true;
            if(item.isError === "0") {
              return item;
            } else {
              return null;
            }
          }).filter(item => item !== null);

          let transactionDataTokens = res[1].data.result.filter((item) => {
            return true;
          })

          let transactionData = transactionDataEther.concat(transactionDataEtherInternal).concat(transactionDataTokens).sort((a, b) => (a.blockNumber * 1) - (b.blockNumber * 1));

          // restrictCoinsKeys.forEach((coin) => {
            let coinTransactionGroup = transactionData;
            let latestTimestamp;
            let earliestTimestamp;
            let tokenTimeseriesIndex = {};
            coinTransactionGroup.forEach((transaction) => {
              let coin = transaction.tokenSymbol;
              if(!tokenTimeseriesIndex[coin] && tokenTimeseriesIndex[coin] !== 0){
                tokenTimeseriesIndex[coin] = 0;
              }else{
                tokenTimeseriesIndex[coin] = tokenTimeseriesIndex[coin] + 1;
              }
              if (tokenTimeseriesIndex[coin] === 0) {
                latestTimestamp = transaction.timeStamp;
                earliestTimestamp = transaction.timeStamp;
              }
              
              if (transaction.timeStamp > latestTimestamp) {
                latestTimestamp = transaction.timeStamp;
              } else if (transaction.timeStamp < earliestTimestamp){
                earliestTimestamp = transaction.timeStamp;
              }

              let balanceAfterPriorTransactions = 0;

              if (restrictCoins[transaction.tokenSymbol] && restrictCoins[transaction.tokenSymbol].timeseries && restrictCoins[transaction.tokenSymbol].timeseries && restrictCoins[transaction.tokenSymbol].timeseries.length > 0) {
                balanceAfterPriorTransactions = addNumbers(balanceAfterPriorTransactions, restrictCoins[transaction.tokenSymbol].timeseries[tokenTimeseriesIndex[coin] - 1].price);
              }

              let setBalance;
              let createGasTx;
              let totalEtherUsedAsGasTx = weiToEther(multiplyNumbers(transaction.gasUsed, transaction.gasPrice));
              if (transaction.to.toLowerCase() === publicKey.toLowerCase()) {
                setBalance = addNumbers(balanceAfterPriorTransactions, weiToEther(transaction.value));
              } else {
                if(coin === "ETH"){
                  setBalance = subtractNumbers(balanceAfterPriorTransactions, weiToEther(addNumbers(transaction.value, totalEtherUsedAsGasTx)));
                } else {
                  let ethBalanceAtTransaction = 0;
                  if (restrictCoins["ETH"].timeseries && restrictCoins["ETH"].timeseries && restrictCoins["ETH"].timeseries.length > 0 && tokenTimeseriesIndex["ETH"]) {
                    ethBalanceAtTransaction = restrictCoins["ETH"].timeseries[tokenTimeseriesIndex["ETH"] - 1].price;
                  }
                  // TODO handle gas transaction impacts on ETH balance
                  // createGasTx = {
                  //   date: moment.unix(transaction.timeStamp),
                  //   price: subtractNumbers(ethBalanceAtTransaction, totalEtherUsedAsGasTx),
                  //   totalEtherUsedAsGasTx,
                  //   ethBalanceAtTransaction
                  // }
                  setBalance = subtractNumbers(balanceAfterPriorTransactions, weiToEther(transaction.value));
                }
              }

              let transactionTimeseriesSingle = {
                date: moment.unix(transaction.timeStamp),
                price: setBalance
              }
              if (restrictCoins[transaction.tokenSymbol] && restrictCoins[transaction.tokenSymbol].timeseries) {
                restrictCoins[transaction.tokenSymbol].timeseries.push(transactionTimeseriesSingle);
              } else {
                if(!restrictCoins[transaction.tokenSymbol]){
                  restrictCoins[transaction.tokenSymbol] = {};
                }
                restrictCoins[transaction.tokenSymbol].timeseries = [];
                restrictCoins[transaction.tokenSymbol].timeseries.push(transactionTimeseriesSingle);
              }
              if(createGasTx) {
                if (restrictCoins["ETH"].timeseries) {
                  restrictCoins["ETH"].timeseries.push(createGasTx);
                } else {
                  restrictCoins["ETH"].timeseries = [];
                  restrictCoins["ETH"].timeseries.push(createGasTx);
                }
              }
              restrictCoins[transaction.tokenSymbol].latestTimestamp = latestTimestamp;
              restrictCoins[transaction.tokenSymbol].earliestTimestamp = earliestTimestamp;
            });
          // })
          thisPersist.setState({ coins: restrictCoins, isChartLoading: false, baseCurrencyToUSD: res[2] });
          // Calculate composite value chart
          let compositeCoins = Object.keys(restrictCoins)
          .filter(key => includeInCompositePricingQueries.includes(key))
          .reduce((obj, key) => {
            obj[key] = restrictCoins[key];
            return obj;
          }, {});
          console.log({compositeCoins});
          let consolidatedTimeseries = await thisPersist.buildCompositeTimeseries(compositeCoins);
          thisPersist.setState({ compositeTimeseriesUSD: consolidatedTimeseries, isCompositeReady: true});
          return Object.keys(restrictCoins);
        }
      });
    }

    bufferTimeseries(timeseries, fillRange = false, isCompositeTimeseries = false, forceCurrentTime = false) {
      let returnArray = [];
      let currentDate = moment();
      if (timeseries.length > 0) {
        timeseries.forEach((item, index) => {
          let thisDate = item.date;
          let thisPrice = item.price;
          let bufferPeriod = 7;
          if (index === 0) {
            for (let i = 0; i <= bufferPeriod; i++) {
              returnArray.push({ date: moment(thisDate).startOf('day').subtract((bufferPeriod - i), 'days'), price: 0 });
            }
          }
          if (timeseries[index + 1]) {
            let nextDate = timeseries[index + 1].date;
            let nextPrice = timeseries[index + 1].price;
            let daysUntilNextDatapoint = moment(nextDate).diff(moment(thisDate), "days");
            if(isCompositeTimeseries){
              if(moment(thisDate).startOf('day').isBefore(moment(currentDate).startOf('day'))){
                returnArray.push({ date: moment(thisDate).startOf('day'), price: thisPrice });
              }
            }else{
              returnArray.push({ date: moment(thisDate), price: thisPrice });
            }
            if ((daysUntilNextDatapoint >= 1) && (fillRange === "daily")) {
              for (let i = 1; i <= daysUntilNextDatapoint; i++) {
                returnArray.push({ date: moment(thisDate).startOf('day').add(i, 'days'), price: thisPrice });
              }
            } else if((daysUntilNextDatapoint === 0) && !isCompositeTimeseries){
              returnArray.push({ date: moment(nextDate), price: nextPrice });
            }
          } else if (index === (timeseries.length - 1)) {
            let daysSinceLastTransaction = currentDate.diff(thisDate, "days");
            for (let i = isCompositeTimeseries ? 0 : 1; i <= daysSinceLastTransaction; i++) {
              if(moment(thisDate).add(i, 'days').startOf('day').isBefore(moment(currentDate).startOf('day'))){
                returnArray.push({ date: moment(thisDate).add(i, 'days').startOf('day'), price: thisPrice });
              }
            }
            if(forceCurrentTime){
              returnArray.push({ date: moment(forceCurrentTime), price: thisPrice });
            } else {
              returnArray.push({ date: moment(currentDate), price: thisPrice });
            }
          }
        });
      }
      return returnArray;
    }

    delayApiCalls = async (config) => {
        let configEntries = Object.entries(config);
        let delayInMilliseconds = 150;
        let callCollection = this.delayedApiCall(configEntries, 0, delayInMilliseconds);
        return callCollection;
    }

    delayedApiCall = (links = [], index = 0, delayInMilliseconds, values = []) => {
      if(links[index] && links[index][1]){
        return axios.get(links[index][1]).then(value => new Promise(resolve => {
                setTimeout(() => {
                  let finalIndex = links.length - 1;
                    if(index === finalIndex){
                      resolve([...values, value]);
                    } else {
                      resolve(this.delayedApiCall(links, index + 1, delayInMilliseconds, [...values, value]));
                    }
                }, delayInMilliseconds);
            })
        );
      }
    }

  fetchPriceValues = async () => {
    let thisPersist = this;
    let currency = "$";
    let getAgainstETH = [];
    let coinListLocal = {};
    let getETHUSD = "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH&tsyms=USD&api_key=2f4e46520951f25ee11bc69becb7e5b4a86df0261bb08e95e51815ceaca8ac5b";
    axios.get(getETHUSD).then(res => {
      let etherToUSD = res.data.RAW.ETH.USD.PRICE;
      let etherMarketCap = res.data.RAW.ETH.USD.MKTCAP;
      this.setState({ ethPriceUSD: etherToUSD, etherMarketCap: etherMarketCap });
      let getTokenBalances = 'https://api.ethplorer.io/getAddressInfo/' + thisPersist.state.publicKey + '?apiKey=freekey';
      axios.get(getTokenBalances).then(res => {
        let balanceOfETH = res.data.ETH.balance;
        getAgainstETH.push("ETH");
        coinListLocal["ETH"] = { balance: balanceOfETH }
        let coinCalculationsBlacklist = [];
        if(res.data.tokens){
          res.data.tokens.forEach((item, index) => {
            let balance = item.balance / 1000000000000000000;
            let rateUSD = item.tokenInfo.price ? item.tokenInfo.price.rate : 0;
            let marketCapUSD = item.tokenInfo.price ? item.tokenInfo.price.marketCapUsd : 0;
            let balanceUSD = balance * rateUSD;
            let symbol = item.tokenInfo.symbol.toUpperCase();
            let tokenAddress = item.tokenInfo.address;
            if (balanceUSD >= 0 && (item.tokenInfo.price !== false)) {
              getAgainstETH.push(symbol);
              coinListLocal[symbol] = { balance, balanceUSD, marketCapUSD, tokenAddress };
            }else{
              coinCalculationsBlacklist.push(symbol);
            }
          });
        }
        thisPersist.setState({ coins: coinListLocal, coinCalculationsBlacklist });
        let getTokenPrices = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=' + getAgainstETH.join(',') + '&tsyms=ETH&api_key=2f4e46520951f25ee11bc69becb7e5b4a86df0261bb08e95e51815ceaca8ac5b';
        axios.get(getTokenPrices).then(async (res) => {
          let totalValueCountUSD = 0;
          let totalValueCountETH = 0;
          Object.keys(coinListLocal).forEach((item, index) => {
            if (item === "ETH") {
              coinListLocal[item].value_usd = coinListLocal[item].balance * etherToUSD;
              coinListLocal[item].marketCapUSD = etherMarketCap;
            } else {
              coinListLocal[item].value_usd = coinListLocal[item].balanceUSD;
            }
            if (coinListLocal[item].value_usd > 0) {
              totalValueCountUSD += coinListLocal[item].value_usd
            }
            if (res.data[item]) {
              coinListLocal[item].value_eth_per_token = res.data[item].ETH;
              coinListLocal[item].value_eth = coinListLocal[item].balance * res.data[item].ETH;
            }
            if (coinListLocal[item].value_eth > 0) {
              totalValueCountETH += coinListLocal[item].value_eth
            }
          });
          let dailyChangeLinks = [];
          let dailyChangeLinksFallback = [];
          for(let symbol of getAgainstETH){
              dailyChangeLinks[symbol] = `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${symbol}&tsym=USD&limit=1&api_key=2f4e46520951f25ee11bc69becb7e5b4a86df0261bb08e95e51815ceaca8ac5b`;
          }
          let tableData = this.buildTableData(coinListLocal, totalValueCountUSD);
          thisPersist.setState({ coins: coinListLocal, tableData, totalPortfolioValueUSD: totalValueCountUSD, totalPortfolioValueETH: totalValueCountETH });
          await this.delayApiCalls(dailyChangeLinks).then(data => {
            let {coins} = this.state;
            let index = 0;
            let includeInCompositePricingQueries = [];
            for(let [symbol] of Object.entries(dailyChangeLinks)) {
              if(data[index].data.Data && data[index].data.Data.Data && data[index].data.Data.Data.constructor === Array && data[index].data.Data.Data.length > 0 && data[index].data.Data.Data[data[index].data.Data.Data.length - 1].open && coins[symbol].marketCapUSD){
                coins[symbol].open = data[index].data.Data.Data[data[index].data.Data.Data.length - 1].open;
                coins[symbol].close = data[index].data.Data.Data[data[index].data.Data.Data.length - 1].close;
                includeInCompositePricingQueries.push(symbol);
              } else if (coins[symbol].value_usd > 1) {
                // Create list of fallback links using CoinGecko as fallback for Cryptocompare data unavailability
                if(coins[symbol].tokenAddress && symbol.toLowerCase() !== "eth") {
                  dailyChangeLinksFallback[symbol] = `https://api.coingecko.com/api/v3/coins/ethereum/contract/${coins[symbol].tokenAddress}/market_chart?vs_currency=usd&days=1`;
                }else if(symbol.toLowerCase() === "eth") {
                  dailyChangeLinksFallback[symbol] = `https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=1`;
                }
              }
              index++;
            }
            let tableDataWithChanges = this.buildTableData(coins, totalValueCountUSD);
            thisPersist.setState({coins, tableData: tableDataWithChanges, includeInCompositePricingQueries});
          });
          await this.delayApiCalls(dailyChangeLinksFallback).then(async data => {
            let {coins, includeInCompositePricingQueries} = this.state;
            let index = 0;
            for(let [symbol] of Object.entries(dailyChangeLinksFallback)) {
              if(data[index].data && data[index].data.prices && data[index].data.prices.constructor === Array && data[index].data.prices.length > 0){
                coins[symbol].open = this.getClosestTimestamp(data[index].data.prices, moment().startOf('day').unix() * 1000, 0)[1];
                coins[symbol].close = data[index].data.prices[data[index].data.prices.length - 1][1];
                if(!coins[symbol].marketCapUSD && data[index].data.market_caps && data[index].data.market_caps.length > 0) {
                  coins[symbol].marketCapUSD = data[index].data.market_caps[data[index].data.market_caps.length - 1][1];
                }
                if(!coins[symbol].value_eth_per_token) {
                  let referenceSymbol = symbol.toLowerCase();
                  let ethValue = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${referenceSymbol}&vs_currencies=eth`);
                  if(ethValue && ethValue.data && ethValue.data[referenceSymbol] && ethValue.data[referenceSymbol].eth){
                    coins[symbol].value_eth_per_token = ethValue.data[referenceSymbol].eth;
                    if(!coins[symbol].value_eth && coins[symbol].balance) {
                      coins[symbol].value_eth = coins[symbol].balance * ethValue.data[referenceSymbol].eth;
                    }
                  }
                }
                includeInCompositePricingQueries.push(symbol);
              }
              index++;
            }
            let tableDataWithChanges = this.buildTableData(coins, totalValueCountUSD);
            thisPersist.setState({coins, tableData: tableDataWithChanges, includeInCompositePricingQueries});
          });
          await this.fetchAddressTransactionHistory();
          await this.fetchCoinGeckoLinks(this.state.coins, totalValueCountUSD);
        })
      })
    });
  }

  fetchCoinGeckoLinks = async (coins, totalValueCountUSD) => {
    let thisPersist = this;
    let getCoinGeckoLinks = [];
    for(let symbol of Object.keys(coins)) {
      if(coins[symbol].tokenAddress){
        getCoinGeckoLinks[symbol] = `https://api.coingecko.com/api/v3/coins/ethereum/contract/${coins[symbol].tokenAddress}`
      }else if(symbol.toLowerCase() === "eth"){
        coins[symbol].coinGeckoLink = "https://www.coingecko.com/en/coins/ethereum";
      }
    }
    await this.delayApiCalls(getCoinGeckoLinks).then(async data => {
      for(let item of data) {
        coins[item.data.symbol.toUpperCase()].coinGeckoLink = `https://www.coingecko.com/en/coins/${item.data.id}`;
      }
      let tableDataWithChanges = this.buildTableData(coins, totalValueCountUSD);
      thisPersist.setState({coins, tableData: tableDataWithChanges});
    });
  }

  handleFocus(event) {
    event.target.select();
  }

  componentDidMount = async () => {
    if (this.state.publicKey) {
      //this.intervalFetchPrices = setInterval(() => this.fetchPriceValues(), 60000);
      if ((this.state.publicKey.length > 0) && isValidAddress(this.state.publicKey)) {
        this.setPublicKeyStorage(this.state.publicKey);
      };
      await this.fetchPriceValues(); // also load one immediately
    }
  }

  componentWillReceiveProps = async (nextProps) => {
    if (nextProps.publicKey && this.state.publicKey !== nextProps.publicKey) {
      this.setState({ publicKey: nextProps.publicKey, isChartLoading: true, coins: {}, historicalBaseCurrency: 'ETH' });
      if ((nextProps.publicKey.length > 0) && isValidAddress(nextProps.publicKey)) {
        this.setPublicKeyStorage(nextProps.publicKey);
        await this.fetchPriceValues();
      }
    }
  }

  setPublicKeyStorage = (publicKey) => {
    if ((publicKey.length > 0) && isValidAddress(publicKey)) {
      let currentLocalStorageSet = window.localStorage.getItem("publicKey") || [];
      if(currentLocalStorageSet.length > 0){
        currentLocalStorageSet = currentLocalStorageSet.split(",");
      }
      if(currentLocalStorageSet.indexOf(publicKey) > -1){
        currentLocalStorageSet.splice(currentLocalStorageSet.indexOf(publicKey), 1);
        window.localStorage.setItem("publicKey", [publicKey, ...currentLocalStorageSet]);
      }else if(currentLocalStorageSet && currentLocalStorageSet.length > 0){
        window.localStorage.setItem("publicKey", [...currentLocalStorageSet, publicKey]);
      }else{
        window.localStorage.setItem("publicKey", [publicKey]);
      }
    }
  }

  buildTableData = (coinData, totalValue) => {
    let sortedByPortfolioPortion = Object.entries(coinData).sort((a, b) => a[1].value_usd - b[1].value_usd).reverse();
    let tableData = [];
    let tokenBalanceTotal = 0;
    let usdValueTotal = 0;
    let usdTokenValueTotal = 0;
    let changeTodayTotal = 0;
    let relativePortfolioImpactTotal = 0;
    let marketCapTotal = 0;
    for(let [key, data] of sortedByPortfolioPortion){
      let portfolioPortion = (data.value_usd * 100 / totalValue).toFixed(2) * 1;
      let marketCapUSD = data.marketCapUSD ? data.marketCapUSD.toFixed(2) * 1 : "N/A";
      let changePercent = ((data.close * 100 / data.open) - 100).toFixed(2) * 1;
      let relativeImpact = (portfolioPortion / 100 * changePercent) > 0.1 ? (portfolioPortion / 100 * changePercent).toFixed(2) * 1 : (portfolioPortion / 100 * changePercent).toFixed(3) * 1;
      let balance = data.balance ? data.balance.toFixed(2) * 1 : "N/A";
      let close = data.close ? data.close.toFixed(2) * 1 : "N/A";
      let usdValue = data.value_usd ? data.value_usd.toFixed(2) * 1 : "N/A";
      if(marketCapUSD !== "N/A" && (portfolioPortion > 0)){
        if(!isNaN(relativeImpact) && relativePortfolioImpactTotal !== "N/A"){
          relativePortfolioImpactTotal += relativeImpact;
        }
        if(!isNaN(changePercent) && changePercent !== "N/A"){
          changeTodayTotal += changePercent;
        }
        if(!isNaN(balance) && balance !== "N/A"){
          tokenBalanceTotal += balance;
        }
        if(!isNaN(usdValue) && usdValue !== "N/A"){
          usdValueTotal += usdValue;
        }
        if(!isNaN(close) && close !== "N/A"){
          usdTokenValueTotal += close;
        }
        if(!isNaN(marketCapUSD) && marketCapUSD !== "N/A"){
          marketCapTotal += marketCapUSD;
        }
        tableData.push({
          id: tableData.length + 1,
          symbol: key,
          balance: balance,
          value_usd: usdValue,
          market_cap: marketCapUSD,
          portfolio_portion: portfolioPortion,
          change_today: changePercent,
          relative_portfolio_impact_today: relativeImpact,
          token_value_usd: close,
          coin_gecko_link: data.coinGeckoLink ? data.coinGeckoLink : false
        })
      }
    }
    tableData.push({
      id: tableData.length + 1,
      symbol: 'Total',
      balance: isNaN(tokenBalanceTotal) ? tokenBalanceTotal : tokenBalanceTotal.toFixed(2) * 1,
      market_cap: isNaN(marketCapTotal) ? marketCapTotal : marketCapTotal.toFixed(2) * 1,
      token_value_usd: isNaN(usdTokenValueTotal) ? usdTokenValueTotal : usdTokenValueTotal.toFixed(2) * 1,
      value_usd: isNaN(usdValueTotal) ? usdValueTotal : usdValueTotal.toFixed(2) * 1,
      portfolio_portion: 100,
      change_today: isNaN(changeTodayTotal) ? changeTodayTotal : changeTodayTotal.toFixed(2) * 1,
      relative_portfolio_impact_today: isNaN(relativePortfolioImpactTotal) ? relativePortfolioImpactTotal : relativePortfolioImpactTotal.toFixed(2) * 1,
    })
    return tableData;
  }

  componentWillUnmount() {
    clearInterval(this.intervalFetchPrices);
  }

  getPlaceholders = () => {
    let placeholderComponents = [];
    let placeholderComponentCount = 9;
    for(let i = 0;i<placeholderComponentCount;i++ ){
      placeholderComponents.push(<Grid item key={i} xs={12} sm={6} md={4} lg={3}>
        <ChartMenuMiniCard
          externalLink={"Loading..."}
          headline={"Loading..."}
          subHeadline={"Loading..."}
          publicKey={"Loading..."}
          isPlaceholding={true}
          image={null} />
      </Grid>)
    }
    return placeholderComponents;
  }

  convertBaseBalances = (timeseriesData, useBaseCurrencyToUSD, returnTimestampKeyedObject = false) => {
    let { baseCurrencyToUSD } = this.state;
    if(useBaseCurrencyToUSD) {
      baseCurrencyToUSD = useBaseCurrencyToUSD;
    }
    if (this.state.baseCurrencyToUSD) {
      let timeseriesDataMap = [...timeseriesData];
      let timeseriesTimestampKeyed = {};
      timeseriesDataMap.map((transaction, index) => {
        let closestBasePriceToUSD = this.getClosestTimestamp(baseCurrencyToUSD, moment(transaction.date).unix(), 'time');
        if(index === (timeseriesDataMap.length - 1)){
          transaction.price = closestBasePriceToUSD ? transaction.price * closestBasePriceToUSD.close : 0;
        }else{
          transaction.price = closestBasePriceToUSD ? transaction.price * closestBasePriceToUSD.open : 0;
        }
        timeseriesTimestampKeyed[transaction.date.unix()] = transaction;
        return transaction;
      });
      if(returnTimestampKeyedObject){
        return timeseriesTimestampKeyed;
      }else{
        return timeseriesDataMap;
      }
    }
  }

  render() {
    const { classes, history, isConsideredMobile } = this.props;
    const { publicKey, tableData, compositeTimeseriesUSD, isCompositeReady, coins, totalPortfolioValueUSD, totalPortfolioValueETH, isChartLoading, historicalBaseCurrency, baseCurrencyToUSD, enableFiatConversion, enableCompositeGraph, timeseriesRange } = this.state;
    let displayTotalUSD = priceFormat(totalPortfolioValueUSD);
    let displayTotalETH = "~ " + numberFormat(totalPortfolioValueETH) +  " ETH"
    let ethAddressError = false;
    let allowFiatConversion = false;
    if((publicKey.length > 0) && !isValidAddress(publicKey)){
      ethAddressError = true;
    }
    if(baseCurrencyToUSD && (baseCurrencyToUSD.constructor === Array) && (baseCurrencyToUSD.length > 0)){
      allowFiatConversion = true;
    }

    let pieChartDataUSD = [];
    let pieChartDataMarketCaps = [];
    let coinsKeys = Object.keys(coins);
      if (coinsKeys.length > 0) {
            coinsKeys.forEach((item, index) => {
              let localArrayUSD = [];
              localArrayUSD.push(coinsKeys[index]);
              localArrayUSD.push(coins[item].value_usd);
              localArrayUSD.push(false);
              pieChartDataUSD.push(localArrayUSD);
              let localArrayMarketCaps = [];
              localArrayMarketCaps.push(coinsKeys[index]);
              localArrayMarketCaps.push(coins[item].marketCapUSD * 1);
              localArrayMarketCaps.push(false);
              pieChartDataMarketCaps.push(localArrayMarketCaps);
          })
      }

      let timeseriesData = [];
      if(coins &&  coins[historicalBaseCurrency] && coins[historicalBaseCurrency].timeseries) {
        timeseriesData =  enableCompositeGraph ? compositeTimeseriesUSD : this.bufferTimeseries(coins[historicalBaseCurrency].timeseries);
        if(enableFiatConversion && !enableCompositeGraph){
          timeseriesData = this.convertBaseBalances(this.bufferTimeseries(coins[historicalBaseCurrency].timeseries, 'daily'));
        }
        if(timeseriesRange && (timeseriesData.length > 0)) {
          let rangeInHours = rangeToHours(timeseriesRange);
          if (rangeInHours) {
            let startTime = moment().subtract(rangeInHours, 'hours');
            timeseriesData = timeseriesData.filter((item) => {
              return moment(item.date).isAfter(startTime);
            });
          }
        }
      }

    let stockOptionsUSD = {
        title: {
            text: 'Value Distribution (USD)'
        },
        lang: {
          thousandsSep: ','
        },
        series: [{
            type: 'pie',
            allowPointSelect: false,
            keys: ['name', 'y', 'selected', 'sliced'],
            data: pieChartDataUSD,
            showInLegend: false
        }],
        plotOptions: {
            series: {
              animation: false
            }
        },
        tooltip: {
            animation: false,
            pointFormat: '<span style="color:{point.color}">\u25CF</span><b> ${point.y:,.2f}</b><br/>',
            shared: true
        }
      }

      let stockOptionsETH = {
        title: {
          text: 'Market Cap Distribution (USD)'
        },
        lang: {
          thousandsSep: ','
        },
        series: [{
          type: 'pie',
          allowPointSelect: false,
          keys: ['name', 'y', 'selected', 'sliced'],
          data: pieChartDataMarketCaps,
          showInLegend: false
        }],
        plotOptions: {
          series: {
            animation: false
          }
        },
        tooltip: {
          animation: false,
          pointFormat: '<span style="color:{point.color}">\u25CF</span><b> ${point.y:,.2f}</b><br/>',
          shared: true
        }
      }

    let chartData = [];
    let chartCurrency = historicalBaseCurrency;
    if(enableFiatConversion){
      chartCurrency = "$";
    }
    let validWallet = false;
    if(!ethAddressError && publicKey){
      validWallet = true;
    }
    return (
      <div className={classes.root + " " + classes.pageMinHeight}>
        <div>
        {!validWallet && 
          <Grid container spacing={24}>
            <Grid item xs={12} sm={1} md={1} lg={1} className={"disable-padding"}>
            </Grid>
            <Grid item style={{ "textAlign": "center" }} xs={12} sm={10} md={10} lg={10}>
              <div className={classes.addressOptions}>
                <Grid container spacing={24}>
                  <Grid item xs={12} sm={1} md={1} lg={1} className={"disable-padding"}>
                  </Grid>
                  <Grid item xs={12} sm={10} md={10} lg={10}>
                    <form className={classes.formContainer} autoComplete="on">
                      <TextField
                        error={ethAddressError}
                        id="outlined-name"
                        label="Wallet Address"
                        name="walletAddress"
                        helperText={`Any Ethereum Wallet's Public Key`}
                        className={classes.textField + " " + classes.fullWidth}
                        value={publicKey}
                        onChange={(event) => this.handleSetAddress(event, history)}
                        onFocus={(event) => this.handleFocus(event)}
                        autoFocus={true}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                      />
                    </form>
                    <div style={{display:'flex', flexDirection: 'column', marginTop: '5px'}}>
                    {window.localStorage.getItem("publicKey") && window.localStorage.getItem("publicKey").split(",").map((item) =>
                      <div style={{marginBottom: '10px'}}>
                        {
                          isValidAddress(item) &&
                          <Button onClick={() => this.setAddressInput(item, history)} color="primary" size="large" variant="outlined" className={classes.textField} style={{textTransform: 'none', width: '100%'}}>
                            {item}
                          </Button>
                        }
                      </div>
                    )}
                    </div>
                  </Grid>
                  <Grid item xs={12} sm={1} md={1} lg={1} className={"disable-padding"}>
                  </Grid>
                </Grid>
              </div>
            </Grid>
          </Grid>
          }
          {validWallet && 
          <Grid container spacing={24}>
            <Grid item xs={12} sm={1} md={1} lg={1} className={"disable-padding"}>
            </Grid>
            <Grid item style={{ "textAlign": "center" }} xs={12} sm={10} md={10} lg={10}>
              <div className={classes.addressOptions}>
                <Grid justify="center" container spacing={24}>
                  <Grid item xs={12} sm={6} md={6} lg={6}>
                    <form className={classes.formContainer} autoComplete="on">
                      <TextField
                        error={ethAddressError}
                        id="outlined-name"
                        label="Wallet Address"
                        name="walletAddress"
                        className={classes.textField + " " + classes.fullWidth}
                        value={publicKey}
                        onChange={(event) => this.handleSetAddress(event, history)}
                        onFocus={(event) => this.handleFocus(event)}
                        margin="normal"
                        variant="outlined"
                      />
                    </form>
                  </Grid>
                  <Grid item xs={6} sm={2} md={2} lg={2}>
                    <form className={classes.formContainer}>
                      <TextField
                        id="outlined-select-currency"
                        select
                        label="Token"
                        className={classes.textField + " " + classes.fullWidth}
                        value={enableCompositeGraph ? "ALL" : this.state.historicalBaseCurrency}
                        onChange={this.handleChangeBaseCurrency('historicalBaseCurrency')}
                        SelectProps={{
                          MenuProps: {
                            className: classes.menu,
                          },
                        }}
                        margin="normal"
                        variant="outlined"
                        disabled={enableCompositeGraph}
                      >
                        {
                          enableCompositeGraph &&
                          <MenuItem key={"ALL"} value={"ALL"}>
                            ALL
                          </MenuItem>
                        }
                        {Object.keys(coins).map(key => (
                          <MenuItem key={key} value={key}>
                            {key}
                          </MenuItem>
                        ))}
                      </TextField>
                    </form>
                  </Grid>
                  <Grid item xs={6} sm={2} md={2} lg={2}>
                    <FormControlLabel
                      className={classes.fiatSwitch}
                      control={
                        <Switch
                          checked={enableFiatConversion}
                          onChange={this.toggleFiatConversion}
                          value="checkedB"
                          color="primary"
                          disabled={!allowFiatConversion}
                        />
                      }
                      label="USD Value"
                    />
                  </Grid>
                  <Grid item xs={6} sm={2} md={2} lg={2}>
                    <FormControlLabel
                      className={classes.fiatSwitch}
                      control={
                        <Switch
                          checked={enableCompositeGraph}
                          onChange={this.toggleCompositeGraph}
                          value="checkedB"
                          color="primary"
                          disabled={!isCompositeReady}
                        />
                      }
                      label="Composite Graph"
                    />
                  </Grid>
                </Grid>
              </div>
            </Grid>
            <Grid item xs={12} sm={1} md={1} lg={1} className={"disable-padding"}>
            </Grid>
            <Grid item xs={12} sm={1} md={1} lg={1} className={"disable-padding"}>
            </Grid>
            <Grid item style={{ "textAlign": "center" }} xs={12} sm={10} md={10} lg={10}>
                  {/* <Button className={classes.button} onClick={() => this.setTimeseriesRange("1M")} style={this.getSelectedTimeseriesRange("1M")}>
                    1M
                  </Button>
                  <Button className={classes.button} onClick={() => this.setTimeseriesRange("3M")} style={this.getSelectedTimeseriesRange("3M")}>
                    3M
                  </Button>
                  <Button className={classes.button} onClick={() => this.setTimeseriesRange("6M")} style={this.getSelectedTimeseriesRange("6M")}>
                    6M
                  </Button>
                  <Button className={classes.button} onClick={() => this.setTimeseriesRange("1Y")} style={this.getSelectedTimeseriesRange("1Y")}>
                    1Y
                  </Button>
                  <Button className={classes.button} onClick={() => this.setTimeseriesRange("ALL")} style={this.getSelectedTimeseriesRange("ALL")}>
                    ALL
                  </Button> */}
              <OurChart enableCurveStepAfter={enableFiatConversion ? false : true} isChartLoading={isChartLoading} isConsideredMobile={isConsideredMobile} chartTitle={chartData.name} chartSubtitle={chartData.abbreviation} chartData={timeseriesData} chartCurrency={chartCurrency} />
            </Grid>
            <Grid item xs={12} sm={1} md={1} lg={1} className={"disable-padding"}>
            </Grid>
            <Grid item xs={12} sm={1} md={1} lg={1} className={"disable-padding"}>
            </Grid>
            <Grid item style={{ "textAlign": "center" }} xs={12} sm={10} md={10} lg={10}>
              <Paper className={classes.root} elevation={2}>
                <Typography variant={isConsideredMobile ? "display3" : "display4"}>
                  {displayTotalUSD}
                </Typography>
                <Typography variant={isConsideredMobile ? "display2" : "display3"} gutterBottom={true}>
                  {displayTotalETH}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={1} md={1} lg={1} className={"disable-padding"}>
            </Grid>
            <Grid item xs={12} sm={1} md={1} lg={1} className={"disable-padding"}>
            </Grid>
            <Grid item xs={12} sm={5} md={5} lg={5}>
              <Paper className={classes.root} elevation={2}>
                <OurPieChart stockOptions={stockOptionsUSD} publicKey={publicKey} />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={5} md={5} lg={5}>
              <Paper className={classes.root} elevation={2}>
                <OurPieChart stockOptions={stockOptionsETH} publicKey={publicKey} />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={1} md={1} lg={1} className={"disable-padding"}>
            </Grid>
            <Grid item xs={12} sm={1} md={1} lg={1} className={"disable-padding"}>
            </Grid>
            <Grid item style={{ "textAlign": "center" }} xs={12} sm={10} md={10} lg={10}>
                <SortableTable isConsideredMobile={isConsideredMobile} tableData={tableData} />
            </Grid>
            <Grid item xs={12} sm={1} md={1} lg={1} className={"disable-padding"}>
            </Grid>
            <Grid item xs={12} sm={12} md={12} lg={12}>
              <div style={{ height: '25px' }} />
            </Grid>
          </Grid>
          }
        </div>
      </div>
    );
  }
}

PortfolioPage.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles, { withTheme: true })(PortfolioPage));