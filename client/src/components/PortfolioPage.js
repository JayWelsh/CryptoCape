import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import moment from 'moment';
import { withRouter } from 'react-router-dom';
import OurChart from './OurChart';
import OurPieChart from './OurPieChart';
import ChartMenuMiniCard from './ChartMenuMiniCard';
import SortableTable from './SortableTable';
import {
  priceFormat,
  numberFormat,
  isValidAddress,
  rangeToTimebox,
  weiToEther,
  subtractNumbers,
  addNumbers,
  multiplyNumbers,
  divideNumbers,
  tokenBalanceFromDecimals,
  tokenInflatedBalanceFromDecimals,
} from '../utils';

const eth2DepositContract = "0x00000000219ab540356cbb839cbe05303d7705fa";
const timeseriesBufferPeriod = 7;

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
    width: '100%',
    padding: '10px',
    paddingTop: '20px'
  },
  darkBackground: {
    backgroundColor: '#00020e',
  },
  lightBackground: {
    backgroundColor: theme.palette.background.default,
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
  },
  etherscanLink: {
    fontWeight: 'bold',
    fontSize: '13px',
    marginBottom: '0px'
  },
  compositeSwitchBottomPadding: {
    marginBottom: theme.spacing.unit
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
          timeboxTimestamp: new Date().getTime(),
          includeInCompositePricingQueries: [],
          genesisProgress: 0,
          isEth2DepositContract: this.props.publicKey && eth2DepositContract === this.props.publicKey.toLowerCase(),
          lastPriceFetchTime: new Date().getTime(),
          fromDate: moment().format('YYYY-MM-DD'),
          toDate: moment().format('YYYY-MM-DD'),
          isDarkMode: this.props.isDarkMode,
          loadingProgress: 0,
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
        this.setState({
          isEth2DepositContract: event.target.value.toLowerCase() === eth2DepositContract,
          enableFiatConversion: false,
          enableCompositeGraph: false,
          isCompositeReady: false,
          coins: {}
        });
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

    getEtherTransactionHistory = async (publicKey, cumulation = [], startBlock = 0) => {
      let getEthTransactionHistoryURL = 'https://api.etherscan.io/api?module=account&action=txlist&address=' + publicKey + '&startblock=' + startBlock + '&endblock=99999999&sort=asc&apikey=4H7XW7VUYZD2A63GPIJ4YWEMIMTU6M9PGE';
      let etherTransactionData = await axios.get(getEthTransactionHistoryURL);
      let latestBlock = 0;
      if(etherTransactionData.data && etherTransactionData.data.result && etherTransactionData.data.result.length > 0) {
        latestBlock = (etherTransactionData.data.result[etherTransactionData.data.result.length - 1].blockNumber * 1);
        let useCumulation = [...cumulation, ...etherTransactionData.data.result];
        if(latestBlock > startBlock) {
          useCumulation = useCumulation.filter(item => item.blockNumber < latestBlock);
          return this.getEtherTransactionHistory(publicKey, useCumulation, latestBlock);
        } else {
          return useCumulation;
        }
      }else{
        return cumulation;
      }
    }

    getInternalEtherTransactionHistory(publicKey) {
      let getInternalEthTransactionHistoryURL = 'https://api.etherscan.io/api?module=account&action=txlistinternal&address=' + publicKey + '&startblock=0&endblock=99999999&sort=asc&apikey=4H7XW7VUYZD2A63GPIJ4YWEMIMTU6M9PGE';
      return axios.get(getInternalEthTransactionHistoryURL);
    }

    getEtherscanBalanceData(publicKey) {
      let getEtherscanBalanceDataURL = 'https://api.etherscan.io/api?module=account&action=balance&address=' + publicKey + '&apikey=4H7XW7VUYZD2A63GPIJ4YWEMIMTU6M9PGE';
      return axios.get(getEtherscanBalanceDataURL);
    }

    getBaseCurrencyHistoricalUSD = async (historicalBaseCurrency) => {
      let { coins } = this.state;
      // Use CoinGecko Fallback
      let useLink;
      if(coins[historicalBaseCurrency].tokenAddress && historicalBaseCurrency.toLowerCase() !== "eth") {
        useLink = `https://api.coingecko.com/api/v3/coins/ethereum/contract/${coins[historicalBaseCurrency].tokenAddress}/market_chart?vs_currency=usd&days=max`;
      }else if(historicalBaseCurrency.toLowerCase() === "eth") {
        useLink = `https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=max`;
      } else if(coins[historicalBaseCurrency].isManualEntry) {
        useLink = `https://api.coingecko.com/api/v3/coins/${coins[historicalBaseCurrency].coinGeckoId}/market_chart?vs_currency=usd&days=max`;
      }
      let fallbackResult = await axios.get(useLink);
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
    this.setState({timeseriesRange: range, timeboxTimestamp: new Date().getTime()});
  }

  getSelectedTimeseriesRange(timeseriesRange) {
    const {isDarkMode} = this.state;
    if(this.state.timeseriesRange === timeseriesRange) {
      return {
        "fontWeight": "bold",
        "color": "white",
        "backgroundColor": isDarkMode ? "#273783" : "#000628"
      }
    }
  }

  buildCompositeTimeseries = async (coins, progressAcrossFetchAddressTransactionHistory = false, currentProgress = false) => {
    const {timeseriesRange, lastPriceFetchTime} = this.state;
    const { setLoading = false } = this.props;
    let timeseriesData = [];
    let fullHistoryLinks = [];
    let fullHistoricalCurrencies = [];
    let consolidatedTimeseries = {};
    let progressPerFetch;
    if(progressAcrossFetchAddressTransactionHistory && currentProgress && setLoading) {
      progressPerFetch = Object.keys(coins) && Object.keys(coins).length > 0 ? progressAcrossFetchAddressTransactionHistory / Object.keys(coins).length : progressAcrossFetchAddressTransactionHistory;
    }
    for(let historicalBaseCurrency of Object.keys(coins)){
        if(coins[historicalBaseCurrency].tokenAddress && historicalBaseCurrency.toLowerCase() !== "eth") {
          fullHistoryLinks[historicalBaseCurrency] = `https://api.coingecko.com/api/v3/coins/ethereum/contract/${coins[historicalBaseCurrency].tokenAddress}/market_chart?vs_currency=usd&days=max`;
        }else if(historicalBaseCurrency.toLowerCase() === "eth") {
          fullHistoryLinks[historicalBaseCurrency] = `https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=max`;
        } else if (coins[historicalBaseCurrency].isManualEntry) {
          fullHistoryLinks[historicalBaseCurrency] = `https://api.coingecko.com/api/v3/coins/${coins[historicalBaseCurrency].coinGeckoId}/market_chart?vs_currency=usd&days=max`;
        }
    }
    await this.delayApiCalls(fullHistoryLinks, setLoading, currentProgress, progressPerFetch).then(data => {
      let index = 0;
      for(let symbol of Object.keys(fullHistoryLinks)){
        let useDataAtIndex = data[index];
        let fallbackLinkTimeseries = [];
        if(useDataAtIndex && useDataAtIndex.data) {
          for(let timeseriesEntry of useDataAtIndex.data.prices) {
            fallbackLinkTimeseries.push({
              time: Math.floor(timeseriesEntry[0] / 1000),
              close: timeseriesEntry[1],
              open: timeseriesEntry[1]
            })
          }
        }
        fullHistoricalCurrencies[symbol] = fallbackLinkTimeseries;
        index++;
      }
    });
    for(let historicalBaseCurrency of Object.keys(coins)){
      if(coins &&  coins[historicalBaseCurrency] && coins[historicalBaseCurrency].timeseries) {
        let bufferTimeseries = this.bufferTimeseries(coins[historicalBaseCurrency].timeseries, 'daily', true, lastPriceFetchTime);
        timeseriesData = this.convertBaseBalances(bufferTimeseries, fullHistoricalCurrencies[historicalBaseCurrency], true);
        // if(timeseriesRange && (timeseriesData.length > 0)) {
        //   let rangeInHours = rangeToHours(timeseriesRange);
        //   if (rangeInHours) {
        //     let startTime = moment().subtract(rangeInHours, 'hours');
        //     timeseriesData = timeseriesData.filter((item) => {
        //       return moment(item.date).isAfter(startTime);
        //     });
        //   }
        // }
			} else {
				timeseriesData = [];
			}
      let timeseriesKeys = Object.keys(timeseriesData);
      let timeseriesIndex = 0;
      for(let timestamp of timeseriesKeys) {
        let usePrice = timeseriesData[timestamp].price;
        if(timeseriesIndex === timeseriesKeys.length - 1) {
          usePrice = coins[historicalBaseCurrency].value_usd;
        }
        if(consolidatedTimeseries[timestamp]) {
          consolidatedTimeseries[timestamp] += usePrice;
        }else{
          consolidatedTimeseries[timestamp] = usePrice;
        }
        timeseriesIndex++;
      }
    }
    if(progressAcrossFetchAddressTransactionHistory && currentProgress && setLoading) {
      setLoading(100);
    }
    let compositeTimeseries = [];
    for(let [index, item] of Object.entries(consolidatedTimeseries)){
      if(!moment.unix(index * 1).isSame(moment().startOf('day'))){
        compositeTimeseries.push(Object.assign({date: moment.unix(index * 1), price: item}));
      }
    }
    return compositeTimeseries;
  }

  fetchAddressEtherBalance = async (coins) => {
    let publicKey = this.state.publicKey;
    await axios.all([this.getEtherscanBalanceData(publicKey)]).then(async(res) => {
      if(res[0] && res[0].data && res[0].data.result) {
        // Override ETH balance with what is provided by Etherscan, as Ethplorer isn't always reliable
        coins["ETH"].balance = weiToEther(res[0].data.result) * 1;
      }
    })
    return coins;
  }

  fetchAddressTransactionHistory = async (restrictCoins, progressBeforeFetchAddressTransactionHistory) => {
      let thisPersist = this;
      let { isEth2DepositContract } = this.state;
      let { setLoading } = this.props;
      let publicKey = this.state.publicKey;
      let includeInCompositePricingQueries = this.state.includeInCompositePricingQueries || [];
      let historicalBaseCurrency = this.state.historicalBaseCurrency;
      let progressAcrossFetchAddressTransactionHistory = 45;
      let progressAcrossInitialFetches = 5;
      await axios.all([
        this.getEtherTransactionHistory(publicKey),
        this.getTokenTransactionHistory(publicKey),
        this.getBaseCurrencyHistoricalUSD(historicalBaseCurrency),
        this.getInternalEtherTransactionHistory(publicKey),
      ]).then(async (res) => {
        let currentProgress = progressBeforeFetchAddressTransactionHistory + progressAcrossInitialFetches;
        if(setLoading) {
          setLoading(currentProgress);
        }
        if (res && res[1].data && res[1].data.result && (res[1].data.result.constructor === Array)) {
          let transactionDataEther = [];

          if(res[0] && res[0].length > 0) {
            transactionDataEther = res[0].map((item) => {
              item.tokenSymbol = "ETH";
              if(item.isError === "0") {
                return item;
              } else {
                return null;
              }
            }).filter(item => item !== null);
          }

          if(res[3].data.result) {
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

            let manualTransactionData = [];
            for(let coin of Object.keys(restrictCoins)) {
              if(restrictCoins[coin].timeseries && restrictCoins[coin].timeseries.length > 0) {
                for(let transaction of restrictCoins[coin].timeseries) {
                  manualTransactionData.push({...transaction, value: tokenInflatedBalanceFromDecimals(transaction.price, restrictCoins[coin].decimals), tokenSymbol: coin, timeStamp: new Date(transaction.date).getTime() / 1000});
                }
                restrictCoins[coin].timeseries = [];
              }
              if(transactionDataTokens.filter(item => item.tokenSymbol === coin).length > 0) {
                restrictCoins[coin].timeseries = [];
              }
            }

            let transactionData = transactionDataEther.concat(transactionDataEtherInternal).concat(transactionDataTokens).concat(manualTransactionData).sort((a, b) => a.blockNumber && b.blockNumber ? (a.blockNumber * 1) - (b.blockNumber * 1) : 0).sort((a, b) => (a.timeStamp * 1) - (b.timeStamp * 1));

            // restrictCoinsKeys.forEach((coin) => {
              let coinTransactionGroup = transactionData;
              let latestTimestamp;
              let earliestTimestamp;
              let earliestOverallTimestamp;
              let tokenTimeseriesIndex = {};
              coinTransactionGroup.forEach((transaction) => {
                let coin = transaction.tokenSymbol.toUpperCase();
                if(restrictCoins[coin] && restrictCoins[coin].decimals){
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

                  if (restrictCoins[coin] && restrictCoins[coin].timeseries && restrictCoins[coin].timeseries && restrictCoins[coin].timeseries.length > 0 && tokenTimeseriesIndex[coin] > 0) {
                    balanceAfterPriorTransactions = addNumbers(balanceAfterPriorTransactions, restrictCoins[coin].timeseries[tokenTimeseriesIndex[coin] - 1].price);
                  }

                  let setBalance;
                  let createGasTx;
                  let totalEtherUsedAsGasTx = weiToEther(multiplyNumbers(transaction.gasUsed ? transaction.gasUsed : 0, transaction.gasPrice ? transaction.gasPrice : 0));
                  if (!transaction.to || transaction.to.toLowerCase() === publicKey.toLowerCase()) {
                    let balance = tokenBalanceFromDecimals(transaction.value, restrictCoins[coin].decimals) * 1;
                    setBalance = addNumbers(balanceAfterPriorTransactions, balance);
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
                      let balance = tokenBalanceFromDecimals(transaction.value, restrictCoins[coin].decimals) * 1;
                      setBalance = subtractNumbers(balanceAfterPriorTransactions, balance);
                    }
                  }

                  let transactionTimeseriesSingle = {
                    date: moment.unix(transaction.timeStamp),
                    price: setBalance
                  }
                  if (restrictCoins[coin] && restrictCoins[coin].timeseries) {
                    restrictCoins[coin].timeseries.push(transactionTimeseriesSingle);
                  } else {
                    if(!restrictCoins[coin]){
                      restrictCoins[coin] = {};
                    }
                    restrictCoins[coin].timeseries = [];
                    restrictCoins[coin].timeseries.push(transactionTimeseriesSingle);
                  }
                  if(createGasTx) {
                    if (restrictCoins["ETH"].timeseries) {
                      restrictCoins["ETH"].timeseries.push(createGasTx);
                    } else {
                      restrictCoins["ETH"].timeseries = [];
                      restrictCoins["ETH"].timeseries.push(createGasTx);
                    }
                  }
                  restrictCoins[coin].latestTimestamp = latestTimestamp;
                  restrictCoins[coin].earliestTimestamp = earliestTimestamp;
                  if(!earliestOverallTimestamp) {
                    earliestOverallTimestamp = earliestTimestamp;
                  }else if(earliestTimestamp < earliestOverallTimestamp) {
                    earliestOverallTimestamp = earliestTimestamp;
                  }
                }
              });
            // })
            let earliestOverallDate = moment.unix(earliestOverallTimestamp).subtract(timeseriesBufferPeriod, 'days').format('YYYY-MM-DD');
            thisPersist.setState({ coins: restrictCoins, baseCurrencyToUSD: res[2], fromDate: earliestOverallDate, earliestDate: isEth2DepositContract ? "2020-11-03" : earliestOverallDate });
            // Calculate composite value chart
            let compositeCoins = Object.keys(restrictCoins)
            .filter(key => includeInCompositePricingQueries.includes(key))
            .reduce((obj, key) => {
              obj[key] = restrictCoins[key];
              return obj;
            }, {});
            let consolidatedTimeseries = await thisPersist.buildCompositeTimeseries(compositeCoins, progressAcrossFetchAddressTransactionHistory, currentProgress);
            thisPersist.setState({ compositeTimeseriesUSD: consolidatedTimeseries, isCompositeReady: true, isChartLoading: false});
            return Object.keys(restrictCoins);
          }
        }
      });
      return restrictCoins;
    }

    bufferTimeseries(timeseries, fillRange = false, isCompositeTimeseries = false, forceCurrentTime = false) {
      let { isEth2DepositContract } = this.state;
      let returnArray = [];
      let currentDate = moment();
      if (timeseries.length > 0) {
        timeseries.forEach((item, index) => {
          let thisDate = item.date;
          let thisPrice = item.price;
          if (index === 0) {
            for (let i = 0; i <= timeseriesBufferPeriod; i++) {
              returnArray.push({ date: moment(thisDate).startOf('day').subtract((timeseriesBufferPeriod - i), 'days'), price: 0 });
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
              returnArray.push({ date: moment.unix(forceCurrentTime / 1000), price: thisPrice });
            } else {
              returnArray.push({ date: moment(currentDate), price: thisPrice });
            }
          }
        });
      }
      if(isEth2DepositContract) {
        returnArray = returnArray.filter(item => moment(item.date).isSameOrAfter(moment(new Date("2020-11-03"))))
      }
      return returnArray;
    }

    delayApiCalls = async (config, setLoading = false, currentProgress = false, progressPerRequest = false) => {
        let configEntries = Object.entries(config);
        let delayInMilliseconds = 150;
        let callCollection = await this.delayedApiCall(configEntries, 0, delayInMilliseconds, [], setLoading, currentProgress, progressPerRequest);
        if(setLoading && currentProgress && progressPerRequest){
          setLoading(currentProgress + (configEntries.length * progressPerRequest));
        }
        return callCollection;
    }

    delayedApiCall = async (links = [], index = 0, delayInMilliseconds, values = [], setLoading, currentProgress, progressPerRequest) => {
      if(links && links[index] && links[index][1]){
        let axiosResponse;
        try {
          axiosResponse = await axios.get(links[index][1]);
        } catch (error) {
          console.log({error});
        } finally {
          return new Promise(resolve => {
            if(setLoading) {
              setLoading(currentProgress + progressPerRequest);
            }
            setTimeout(() => {
              let finalIndex = links.length - 1;
              if(index === finalIndex){
                resolve([...values, axiosResponse]);
              } else {
                resolve(this.delayedApiCall(links, index + 1, delayInMilliseconds, [...values, axiosResponse], setLoading, currentProgress + progressPerRequest, progressPerRequest));
              }
            }, delayInMilliseconds);
          })
        }
      }
    }

  fetchPriceValues = async () => {
    this.setState({ lastPriceFetchTime: new Date().getTime() });
    let { setLoading } = this.props;
    if(setLoading) {
      setLoading(0);
    }
    let { historicalBaseCurrency } = this.state;
    let thisPersist = this;
    let currency = "$";
    let getAgainstETH = [];
    let coinListLocal = {};
		let getETHUSD = "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH&tsyms=USD&api_key=2f4e46520951f25ee11bc69becb7e5b4a86df0261bb08e95e51815ceaca8ac5b";
		let shimTokens = {
			"DAI": {
				tokenAddress: "0x6b175474e89094c44da98b954eedeac495271d0f",
				decimals: 18,
			},
			"USDT": {
				tokenAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
				decimals: 6,
      },
      "SEED": {
				tokenAddress: "0x30cf203b48edaa42c3b4918e955fed26cd012a3f",
				decimals: 18,
      },
      "R34P": {
        tokenAddress: "0xcaeaf8381d4b20b43afa42061d6f80319a8881f6",
        decimals: 8,
      },
      "UNL": {
        tokenAddress: "0x04ab43d32d0172c76f5287b6619f0aa50af89303",
        decimals: 18,
      },
      "GRT": {
        tokenAddress: "0xc944e90c64b2c07662a292be6244bdf05cda44a7",
        decimals: 18,
      },
      "PROS": {
        tokenAddress: "0x8642A849D0dcb7a15a974794668ADcfbe4794B56",
        decimals: 18,
      },
      "ARTH": {
        tokenAddress: "0x0e3cc2c4fb9252d17d07c67135e48536071735d9",
        decimals: 18,
      },
      "MASQ": {
        tokenAddress: "0x06f3c323f0238c72bf35011071f2b5b7f43a054c",
        decimals: 18,
      },
      "CVR": {
        tokenAddress: "0x3c03b4ec9477809072ff9cc9292c9b25d4a8e6c6",
        decimals: 18,
      },
      "PBR": {
        tokenAddress: "0x0d6ae2a429df13e44a07cd2969e085e4833f64a0",
        decimals: 18,
      },
      "ALCX": {
        tokenAddress: "0xdbdb4d16eda451d0503b854cf79d55697f90c8df",
        decimals: 18,
      },
      "ROCKS": {
        tokenAddress: "0x0829d2d5cc09d3d341e813c821b0cfae272d9fb2",
        decimals: 18
      },
		}
    axios.get(getETHUSD).then(res => {
      if(setLoading) {
        setLoading(1);
      }
      let etherToUSD = res.data.RAW.ETH.USD.PRICE;
      let etherMarketCap = res.data.RAW.ETH.USD.MKTCAP;
      this.setState({ ethPriceUSD: etherToUSD, etherMarketCap: etherMarketCap });
      let getTokenBalances = 'https://api.ethplorer.io/getAddressInfo/' + thisPersist.state.publicKey + '?apiKey=freekey';
      axios.get(getTokenBalances).then(res => {
        if(setLoading) {
          setLoading(2);
        }
        let genesisProgress = thisPersist.state.genesisProgress;
        let publicKeyLowerCase = thisPersist.state.publicKey.toLowerCase();
        let balanceOfETH = res.data.ETH.balance;
        getAgainstETH.push("ETH");
        coinListLocal["ETH"] = { balance: balanceOfETH }
        coinListLocal["ETH"].decimals = 18;
        if(publicKeyLowerCase === eth2DepositContract) {
          genesisProgress = divideNumbers(multiplyNumbers(coinListLocal["ETH"].balance, 100), 524288);
        }
        let coinCalculationsBlacklist = [];
        let tokenAddressBlacklist = ["0x47a7fe6e18a01c367a8ef32ee1943c923f3438e5"];
        if(res.data.tokens){
          res.data.tokens.forEach((item, index) => {
            if(item.tokenInfo.symbol){
              let symbol = item.tokenInfo.symbol.toUpperCase();
              if(publicKeyLowerCase !== eth2DepositContract || ((publicKeyLowerCase === eth2DepositContract) && (symbol === "ETH"))){
                let decimals = item.tokenInfo.decimals;
                let balance = tokenBalanceFromDecimals(item.balance, decimals) * 1;
                let rateUSD = item.tokenInfo.price ? item.tokenInfo.price.rate : 0;
                let marketCapUSD = item.tokenInfo.price ? item.tokenInfo.price.marketCapUsd : 0;
                let balanceUSD = balance * rateUSD;
                let tokenAddress = item.tokenInfo.address;
                if((["MNE", "KICK", "UNO"].indexOf(symbol) === -1) && (tokenAddressBlacklist.indexOf(tokenAddress.toLowerCase()) === -1)){ // Blacklist
                  getAgainstETH.push(symbol);
                  coinListLocal[symbol] = { balance, balanceUSD, marketCapUSD, tokenAddress, decimals };
                  if (balanceUSD >= 0 && (item.tokenInfo.price !== false)) {
                    coinListLocal[symbol] = { balance, balanceUSD, marketCapUSD, tokenAddress, decimals };
                  }else{
                    coinCalculationsBlacklist.push(symbol);
                  }
                }
              }
            }
          });
        }
        let currentManualEntries = localStorage.getItem("manualAccountEntries") ? JSON.parse(localStorage.getItem("manualAccountEntries")) : {};
        if(currentManualEntries[publicKeyLowerCase]) {
          for(let manualEntryId of Object.keys(currentManualEntries[publicKeyLowerCase])) {
            let manualEntry = currentManualEntries[publicKeyLowerCase][manualEntryId];
            if(manualEntry.id && manualEntry.symbol) {
              let symbol = manualEntry.symbol.toUpperCase()
              getAgainstETH.push(symbol);
              coinListLocal[symbol] = { 
                balance: manualEntry.tokenQuantity * 1,
                isManualEntry: true,
                decimals: (
                  coinListLocal[symbol] && coinListLocal[symbol].decimals
                      ? coinListLocal[symbol].decimals
                      : 2
                ),
                coinGeckoId: manualEntry.id,
                timeseries: manualEntry.timeseries,
                manualRecordCount: manualEntry.timeseries.length
              };
            }
          }
        }
				for(let shim of Object.keys(shimTokens)) {
					if(!coinListLocal[shim]) {
						coinListLocal[shim] = { balance: 0, balanceUSD: 0, tokenAddress: shimTokens[shim].tokenAddress, decimals: shimTokens[shim].decimals };
						getAgainstETH.push(shim);
					}
        }
        if(setLoading) {
          setLoading(3);
        }
        thisPersist.setState({ coins: coinListLocal, coinCalculationsBlacklist, genesisProgress });
        let getTokenPrices = 'https://min-api.cryptocompare.com/data/pricemultifull?fsyms=' + getAgainstETH.join(',') + '&tsyms=ETH&api_key=2f4e46520951f25ee11bc69becb7e5b4a86df0261bb08e95e51815ceaca8ac5b';
        axios.get(getTokenPrices).then(async (res) => {
          let totalValueCountUSD = 0;
          let totalValueCountETH = 0;
          if(setLoading) {
            setLoading(4);
          }
          Object.keys(coinListLocal).forEach((item, index) => {
            if (item === "ETH") {
              coinListLocal[item].value_usd = coinListLocal[item].balance * etherToUSD;
              coinListLocal[item].marketCapUSD = etherMarketCap;
            } else {
              let backupPrice = res.data.RAW[item] && res.data.RAW[item].ETH && res.data.RAW[item].ETH.PRICE ? res.data.RAW[item].ETH.PRICE * etherToUSD * coinListLocal[item].balance : 0;
              coinListLocal[item].value_usd = coinListLocal[item].balanceUSD ? coinListLocal[item].balanceUSD : backupPrice;
              if(!coinListLocal[item].balanceUSD && coinListLocal[item].value_usd) {
                coinListLocal[item].balanceUSD = coinListLocal[item].value_usd * coinListLocal[item].balance;
              }
              if(!shimTokens[item] && (!coinListLocal[item].value_usd || coinListLocal[item].value_usd < 5) && !coinListLocal[item].isManualEntry) {
                delete coinListLocal[item];
              }
            }
            if(coinListLocal[item]){
              if (coinListLocal[item].value_usd > 0) {
                totalValueCountUSD += coinListLocal[item].value_usd
              }
              if (res.data.RAW[item] && res.data.RAW[item].ETH) {
                coinListLocal[item].value_eth_per_token = res.data.RAW[item].ETH.PRICE;
                coinListLocal[item].value_eth = coinListLocal[item].balance * res.data.RAW[item].ETH.PRICE;
              }
            }
          });
          if(setLoading) {
            setLoading(5);
          }
          totalValueCountETH = totalValueCountUSD / etherToUSD;
          let dailyChangeLinks = [];
          let tableData = this.buildTableData(coinListLocal, totalValueCountUSD);
          thisPersist.setState({ coins: coinListLocal, tableData, totalPortfolioValueUSD: totalValueCountUSD, totalPortfolioValueETH: totalValueCountETH });
          let coins = coinListLocal;
          let index = 0;
          let includeInCompositePricingQueries = [];
          for(let symbol of getAgainstETH){
            if(coinListLocal[symbol]){
              if(coins[symbol].tokenAddress && symbol.toLowerCase() !== "eth") {
                dailyChangeLinks[symbol] = `https://api.coingecko.com/api/v3/coins/ethereum/contract/${coins[symbol].tokenAddress}/market_chart?vs_currency=usd&days=1`;
              }else if(symbol.toLowerCase() === "eth") {
                dailyChangeLinks[symbol] = `https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=1`;
              } else if (coins[symbol].isManualEntry) {
                dailyChangeLinks[symbol] = `https://api.coingecko.com/api/v3/coins/${coins[symbol].coinGeckoId}/market_chart?vs_currency=usd&days=1`;
              }
              index++;
            }
          }
          coins = await this.fetchAddressEtherBalance(coins);
          let tableDataWithChanges = this.buildTableData(coins, totalValueCountUSD);
          thisPersist.setState({coins, tableData: tableDataWithChanges, includeInCompositePricingQueries});
          let progressBeforeDailyChangeLinks = 5;
          let progressAcrossDailyChangeLinks = 45;
          let progressPerDailyChangeLink = progressAcrossDailyChangeLinks / Object.entries(dailyChangeLinks).length;
          await this.delayApiCalls(dailyChangeLinks, setLoading, progressBeforeDailyChangeLinks, progressPerDailyChangeLink).then(async data => {
            let {coins, includeInCompositePricingQueries} = this.state;
            let index = 0;
            for(let [symbol] of Object.entries(dailyChangeLinks)) {
              if(data && data[index] && data[index].data && data[index].data.prices && data[index].data.prices.constructor === Array && data[index].data.prices.length > 0 && coins[symbol]){
                coins[symbol].open = this.getClosestTimestamp(data[index].data.prices, moment().startOf('day').unix() * 1000, 0)[1];
                coins[symbol].close = data[index].data.prices[data[index].data.prices.length - 1][1];
                coins[symbol].balanceUSD = coins[symbol].close * coins[symbol].balance;
                coins[symbol].value_usd = coins[symbol].balanceUSD;
                if(data[index].data.market_caps && data[index].data.market_caps.length > 0) {
                  // Always overwrite market cap with coingecko market cap (if it exists and is over zero)
                  if(data[index].data.market_caps[data[index].data.market_caps.length - 1][1] > 0) {
                    coins[symbol].marketCapUSD = data[index].data.market_caps[data[index].data.market_caps.length - 1][1];
                  }
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
          if(setLoading) {
            setLoading(progressBeforeDailyChangeLinks + progressAcrossDailyChangeLinks);
          }
          let findNewSelectedHistoricalBaseCurrency = false;
          let newSelectedHistoricalBaseCurrency = false;
          if(!coinListLocal[historicalBaseCurrency] || coinListLocal[historicalBaseCurrency].balance <= 0) {
            findNewSelectedHistoricalBaseCurrency = true;
          }
          totalValueCountUSD = 0;
          totalValueCountETH = 0;
          Object.keys(coinListLocal).forEach((item, index) => {
            if (coinListLocal[item].value_usd > 0) {
              totalValueCountUSD += coinListLocal[item].value_usd
              if(!newSelectedHistoricalBaseCurrency) {
                newSelectedHistoricalBaseCurrency = item;
              }
            }
          });
          
          totalValueCountETH = totalValueCountUSD / etherToUSD;
          thisPersist.setState({ 
            totalPortfolioValueUSD: totalValueCountUSD,
            totalPortfolioValueETH: totalValueCountETH,
            ...(
              findNewSelectedHistoricalBaseCurrency &&
              newSelectedHistoricalBaseCurrency &&
              { historicalBaseCurrency: newSelectedHistoricalBaseCurrency }
            ),
          });
          let progressBeforeFetchAddressTransactionHistory = progressBeforeDailyChangeLinks + progressAcrossDailyChangeLinks;
          coins = await this.fetchAddressTransactionHistory(coins, progressBeforeFetchAddressTransactionHistory);
          if(setLoading) {
            setLoading(100);
            setLoading(0);
          }
          await this.fetchCoinGeckoLinks(coins, totalValueCountUSD);
        })
      })
    });
  }

  fetchCoinGeckoLinks = async (coins, totalValueCountUSD) => {
    let thisPersist = this;
    let getCoinGeckoLinks = [];
    let coinGeckoLinkCache = localStorage.getItem("coinGeckoLinkCache") ? JSON.parse(localStorage.getItem("coinGeckoLinkCache")) : {};
    for(let symbol of Object.keys(coins)) {
      if(coins[symbol].tokenAddress && !coinGeckoLinkCache[coins[symbol].tokenAddress]){
        getCoinGeckoLinks[symbol] = `https://api.coingecko.com/api/v3/coins/ethereum/contract/${coins[symbol].tokenAddress}`
      }else if(symbol.toLowerCase() === "eth"){
        coins[symbol].coinGeckoLink = "https://www.coingecko.com/en/coins/ethereum";
      } else if(coins[symbol].isManualEntry) {
        coins[symbol].coinGeckoLink = `https://www.coingecko.com/en/coins/${coins[symbol].coinGeckoId}`;
      }
    }
    let tableDataWithChanges = this.buildTableData(coins, totalValueCountUSD);
    thisPersist.setState({coins, tableData: tableDataWithChanges});
    await this.delayApiCalls(getCoinGeckoLinks).then(async data => {
      if(data) {
        for(let item of data) {
          if(item && item.data){
            let useSymbol = item.data.symbol.toUpperCase();
            if(useSymbol === "GNY") {
              useSymbol = "GNYERC20";
            }
            if(item && coins[useSymbol]){
              coins[useSymbol].coinGeckoLink = `https://www.coingecko.com/en/coins/${item.data.id}`;
            }
          }
        }
        let tableDataWithChanges = this.buildTableData(coins, totalValueCountUSD);
        thisPersist.setState({coins, tableData: tableDataWithChanges});
      }
    });
  }

  handleFocus(event) {
    event.target.select();
  }

  refetchData = async (callback) => {
    await this.fetchPriceValues();
    if(callback){
      callback();
    }
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
      this.setState({
        publicKey: nextProps.publicKey,
        isChartLoading: true,
        coins: {},
        historicalBaseCurrency: 'ETH',
        isEth2DepositContract: nextProps.publicKey.toLowerCase() === eth2DepositContract,
        enableFiatConversion: false,
        enableCompositeGraph: false,
        isCompositeReady: false,
        isDarkMode: nextProps.isDarkMode
      });
      if ((nextProps.publicKey.length > 0) && isValidAddress(nextProps.publicKey)) {
        this.setPublicKeyStorage(nextProps.publicKey);
        await this.fetchPriceValues();
      }
    } else if(nextProps.isDarkMode !== this.props.isDarkMode) {
      this.setState({isDarkMode: nextProps.isDarkMode});
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
    let totalManualRecordCount = 0;
    let coinGeckoLinkCache = localStorage.getItem("coinGeckoLinkCache") ? JSON.parse(localStorage.getItem("coinGeckoLinkCache")) : {};
    for(let [key, data] of sortedByPortfolioPortion){
      let portfolioPortion = (data.value_usd * 100 / totalValue) * 1;
      let marketCapUSD = data.marketCapUSD ? data.marketCapUSD * 1 : "N/A";
      let changePercent = ((data.close * 100 / data.open) - 100) * 1;
      let relativeImpact = (portfolioPortion / 100 * changePercent) > 0.1 ? (portfolioPortion / 100 * changePercent).toFixed(2) * 1 : (portfolioPortion / 100 * changePercent).toFixed(3) * 1;
      let balance = data.balance ? data.balance * 1 : "N/A";
      let close = data.close ? data.close * 1 : "N/A";
      let usdValue = data.value_usd ? data.value_usd * 1 : "N/A";
      if(portfolioPortion > 0){
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
        let useCoinGeckoLink = data.coinGeckoLink ? data.coinGeckoLink : false;
        if(coinGeckoLinkCache[key] || coinGeckoLinkCache[data.tokenAddress]) {
          useCoinGeckoLink = data.tokenAddress && coinGeckoLinkCache[data.tokenAddress] ? coinGeckoLinkCache[data.tokenAddress] : coinGeckoLinkCache[key];
        }
        totalManualRecordCount = data.manualRecordCount ? data.manualRecordCount : 0;
        tableData.push({
          id: tableData.length + 1,
          symbol: key,
          balance: balance,
          value_usd: usdValue,
          manual_record_count: totalManualRecordCount,
          coingecko_id: data.coinGeckoId ? data.coinGeckoId : false,
          market_cap: marketCapUSD,
          portfolio_portion: portfolioPortion,
          change_today: changePercent,
          relative_portfolio_impact_today: relativeImpact,
          token_value_usd: close,
          coingecko_link: useCoinGeckoLink
        })
      }
    }
    
    // Cache CoinGecko Links Below
    for(let row of tableData) {
      let tokenData = coinData[row.symbol];
      if(tokenData) {
        let tokenAddress = tokenData.tokenAddress ? tokenData.tokenAddress: false;
        let tokenCoinGeckoLink = tokenData.coinGeckoLink ? tokenData.coinGeckoLink : false;
        let useTokenKey = tokenAddress ? tokenAddress : row.symbol;
        if(useTokenKey && useTokenKey.length > 0 && tokenCoinGeckoLink && tokenCoinGeckoLink.length > 0) {
          coinGeckoLinkCache[useTokenKey] = tokenCoinGeckoLink;
        }
      }
    }
    localStorage.setItem("coinGeckoLinkCache", JSON.stringify(coinGeckoLinkCache));
    // Cache CoinGecko Links Above

    tableData.push({
      id: tableData.length + 1,
      symbol: 'Total',
      balance: isNaN(tokenBalanceTotal) ? tokenBalanceTotal : tokenBalanceTotal * 1,
      market_cap: isNaN(marketCapTotal) ? marketCapTotal : marketCapTotal * 1,
      token_value_usd: isNaN(usdTokenValueTotal) ? usdTokenValueTotal : usdTokenValueTotal * 1,
      value_usd: isNaN(usdValueTotal) ? usdValueTotal : usdValueTotal * 1,
      manual_record_count: totalManualRecordCount,
      portfolio_portion: 100,
      change_today: isNaN(changeTodayTotal) ? changeTodayTotal : changeTodayTotal * 1,
      relative_portfolio_impact_today: isNaN(relativePortfolioImpactTotal) ? relativePortfolioImpactTotal : relativePortfolioImpactTotal * 1,
    })
    return tableData;
  }

  componentWillUnmount() {
    clearInterval(this.intervalFetchPrices);
  }

  convertBaseBalances = (timeseriesData, useBaseCurrencyToUSD, returnTimestampKeyedObject = false, forceLatestPrice) => {
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
          if(forceLatestPrice) {
            transaction.price = forceLatestPrice;
          } else {
            transaction.price = closestBasePriceToUSD ? transaction.price * closestBasePriceToUSD.close : 0;
          }
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

  handleFromDateChange = date => {
    this.setState({
      fromDate: moment(date).format('YYYY-MM-DD'),
    });
  }

  handleToDateChange = date => {
    this.setState({
      toDate: moment(date).format('YYYY-MM-DD'),
    });
  }

  render() {
    const { classes, history, isConsideredMobile, isLoading } = this.props;
    const { 
      publicKey,
      tableData,
      compositeTimeseriesUSD,
      isCompositeReady,
      coins,
      totalPortfolioValueUSD,
      totalPortfolioValueETH,
      isChartLoading,
      historicalBaseCurrency,
      baseCurrencyToUSD,
      enableFiatConversion,
      enableCompositeGraph,
      timeseriesRange,
      timeboxTimestamp,
      genesisProgress,
      isEth2DepositContract,
      lastPriceFetchTime,
      earliestDate,
      isDarkMode,
    } = this.state;
    let displayTotalUSD = priceFormat(totalPortfolioValueUSD);
    let displayTotalETH = isEth2DepositContract && coins["ETH"] && coins["ETH"].balance ? numberFormat(coins["ETH"].balance) +  " ETH" : "~ " + numberFormat(totalPortfolioValueETH) +  " ETH"
    let ethAddressError = false;
    let allowFiatConversion = false;
    if((publicKey.length > 0) && !isValidAddress(publicKey)){
      ethAddressError = true;
    }
    if(baseCurrencyToUSD && (baseCurrencyToUSD.constructor === Array) && (baseCurrencyToUSD.length > 0)){
      allowFiatConversion = true;
    }
    let timebox = rangeToTimebox(timeseriesRange, earliestDate);

    let pieChartDataUSD = [];
    let pieChartDataMarketCaps = [];
		let coinsKeys = Object.keys(coins);
      if (coinsKeys.length > 0) {
            coinsKeys.forEach((item, index) => {
							if(coins[item].value_usd > 1){
								let localArrayUSD = [];
								localArrayUSD.push(coinsKeys[index]);
								localArrayUSD.push(coins[item].value_usd);
								localArrayUSD.push(false);
								pieChartDataUSD.push(localArrayUSD);
                let localArrayMarketCaps = [];
                if((coins[item].marketCapUSD * 1) > 0) {
                  localArrayMarketCaps.push(coinsKeys[index]);
                  localArrayMarketCaps.push(coins[item].marketCapUSD * 1);
                  localArrayMarketCaps.push(false);
                  pieChartDataMarketCaps.push(localArrayMarketCaps);
                }
							}
          })
      }

      let timeseriesData = [];
      let timeseriesDataFull = [];
      if(coins &&  coins[historicalBaseCurrency] && coins[historicalBaseCurrency].timeseries) {
        //TODO: These buffers should run outside of the render, similarly to composite chart data
        timeseriesData =  enableCompositeGraph ? compositeTimeseriesUSD : this.bufferTimeseries(coins[historicalBaseCurrency].timeseries, 'daily', false, lastPriceFetchTime);
        if(enableFiatConversion && !enableCompositeGraph){
          timeseriesData = this.convertBaseBalances(this.bufferTimeseries(coins[historicalBaseCurrency].timeseries, 'daily', false, lastPriceFetchTime), false, false, coins[historicalBaseCurrency].balanceUSD);
        }
        timeseriesDataFull = [...timeseriesData];
      }

    let themeOptions = {
      plotOptions: {
          series: {
            animation: false,
            dataLabels: {
              enabled: true,
              color: isDarkMode ? '#FFFFFF' : '#000000de',
              style: {
                fontSize: '14px'
              }
            }
          },
          pie: {
            borderColor: isDarkMode ? '#1d1d1d' : '#FFFFFF',
          }
      },
      tooltip: {
          animation: false,
          pointFormat: '<span style="color:{point.color}">\u25CF</span><b> ${point.y:,.2f}</b><br/>',
          shared: true,
          useHTML: true,
          headerFormat: '<span style="font-size: 14px;font-weight: bold">{point.key}</span><br/>',
          style: {
            color: '#FFFFFF',
            fontSize: '14px',
          }
      },
      labels: {
        style: {
          color: isDarkMode ? '#FFFFFF' : '#000000de',
          fontSize: '14px',
        }
      },
      chart: {
        backgroundColor: isDarkMode ? '#1d1d1d' : '#FFFFFF',
        style: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif;'
        }
      },
      navigation: {
        buttonOptions: {
            symbolStroke: isDarkMode ? '#DDDDDD' : '#0000008a',
            theme: {
                fill: isDarkMode ? '#1d1d1d' : "#FFFFFF"
            }
        }
      },
    }

    let stockOptionsUSD = {
        title: {
            text: 'Value Distribution (USD)',
            style: {
              color: isDarkMode ? '#FFFFFF' : '#000000de',
            }
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
        ...themeOptions
      }

      let stockOptionsETH = {
        title: {
          text: 'Market Cap Distribution (USD)',
          style: {
            color: isDarkMode ? '#FFFFFF' : '#000000de',
          }
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
        ...themeOptions
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
      <div className={[classes.root, classes.pageMinHeight, isDarkMode ? classes.darkBackground : classes.lightBackground].join(" ")}>
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
                        disabled={isLoading}
                      />
                    </form>
                    <a className={classes.etherscanLink} target="_blank" href={`https://etherscan.io/address/${publicKey}`} rel="noopener noreferrer">View on Etherscan.io</a>
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
                        disabled={enableCompositeGraph || isLoading}
                      >
                        {
                          enableCompositeGraph &&
                          <MenuItem key={"ALL"} value={"ALL"}>
                            ALL
                          </MenuItem>
                        }
                        {Object.keys(coins).filter(item => coins[item].balance > 0).map(key => (
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
                          disabled={!allowFiatConversion || isLoading}
                        />
                      }
                      label="USD Value"
                    />
                  </Grid>
                  {!isEth2DepositContract && 
                    <Grid item xs={6} sm={2} md={2} lg={2} className={isConsideredMobile ? classes.compositeSwitchBottomPadding : null}>
                      <FormControlLabel
                        className={classes.fiatSwitch}
                        control={
                          <Switch
                            checked={enableCompositeGraph}
                            onChange={this.toggleCompositeGraph}
                            value="checkedB"
                            color="primary"
                            disabled={!isCompositeReady || isLoading}
                          />
                        }
                        label="Composite Graph"
                      />
                    </Grid>
                  }
                </Grid>
              </div>
            </Grid>
            <Grid item xs={12} sm={1} md={1} lg={1} className={"disable-padding"}>
            </Grid>
            <Grid item xs={12} sm={1} md={1} lg={1} className={"disable-padding"}>
            </Grid>
            <Grid item style={{ "textAlign": "center" }} xs={12} sm={10} md={10} lg={10}>
                  <Button disabled={isLoading || (!timeseriesDataFull || !timeseriesDataFull[0] || !timeseriesDataFull[0].date) || moment().diff(moment(timeseriesDataFull[0].date), 'weeks') < 1} className={classes.button} onClick={() => this.setTimeseriesRange("1W")} style={this.getSelectedTimeseriesRange("1W")}>
                    1W
                  </Button>
                  <Button disabled={isLoading || (!timeseriesDataFull || !timeseriesDataFull[0] || !timeseriesDataFull[0].date) || moment().diff(moment(timeseriesDataFull[0].date), 'months') < 1} className={classes.button} onClick={() => this.setTimeseriesRange("1M")} style={this.getSelectedTimeseriesRange("1M")}>
                    1M
                  </Button>
                  <Button disabled={isLoading || (!timeseriesDataFull || !timeseriesDataFull[0] || !timeseriesDataFull[0].date) || moment().diff(moment(timeseriesDataFull[0].date), 'months') < 3} className={classes.button} onClick={() => this.setTimeseriesRange("3M")} style={this.getSelectedTimeseriesRange("3M")}>
                    3M
                  </Button>
                  <Button disabled={isLoading || (!timeseriesDataFull || !timeseriesDataFull[0] || !timeseriesDataFull[0].date) || moment().diff(moment(timeseriesDataFull[0].date), 'months') < 6} className={classes.button} onClick={() => this.setTimeseriesRange("6M")} style={this.getSelectedTimeseriesRange("6M")}>
                    6M
                  </Button>
                  <Button disabled={isLoading || (!timeseriesDataFull || !timeseriesDataFull[0] || !timeseriesDataFull[0].date) || moment().diff(moment(timeseriesDataFull[0].date), 'months') < 12} className={classes.button} onClick={() => this.setTimeseriesRange("1Y")} style={this.getSelectedTimeseriesRange("1Y")}>
                    1Y
                  </Button>
                  <Button disabled={isLoading} className={classes.button} onClick={() => this.setTimeseriesRange("ALL")} style={this.getSelectedTimeseriesRange("ALL")}>
                    ALL
                  </Button>
            </Grid>
            <Grid item xs={12} sm={1} md={1} lg={1} className={"disable-padding"}>
            </Grid>
            <Grid item xs={12} sm={1} md={1} lg={1} className={"disable-padding"}>
            </Grid>
            <Grid item style={{ "textAlign": "center" }} xs={12} sm={10} md={10} lg={10}>
              <OurChart isDarkMode={isDarkMode} earliestDate={earliestDate} handleFromDateChange={this.handleFromDateChange} handleToDateChange={this.handleToDateChange} isEth2DepositContract={isEth2DepositContract} genesisProgress={genesisProgress} timebox={timebox} timeboxTimestamp={timeboxTimestamp} enableCurveStepAfter={enableFiatConversion ? false : true} isChartLoading={isChartLoading} isConsideredMobile={isConsideredMobile} chartTitle={chartData.name} chartSubtitle={chartData.abbreviation} chartData={timeseriesData} chartCurrency={chartCurrency} isLoading={isLoading} />
            </Grid>
            <Grid item xs={12} sm={1} md={1} lg={1} className={"disable-padding"}>
            </Grid>
            <Grid item xs={12} sm={1} md={1} lg={1} className={"disable-padding"}>
            </Grid>
            <Grid item style={{ "textAlign": "center" }} xs={12} sm={10} md={10} lg={10}>
              <Paper className={classes.root} elevation={2}>
                <Typography
                  variant={
                    isConsideredMobile
                      ? totalPortfolioValueUSD < 1000000 
                        ? "display3"
                        : "h4"
                      : "display4"
                  }
                  color="textSecondary"
                  style={isDarkMode ? { color: 'white' } : {}}
                >
                  {displayTotalUSD}
                </Typography>
                <Typography
                  variant={
                  isConsideredMobile
                    ? totalPortfolioValueUSD < 1000000 
                      ? "display2"
                      : "h5"
                    : "display3"
                  }
                  color="textSecondary"
                  gutterBottom={true}
                  style={isDarkMode ? { color: 'white' } : {}}
                >
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
                <SortableTable isDarkMode={isDarkMode} isEth2DepositContract={isEth2DepositContract} isLoading={isLoading} refetchData={this.refetchData} publicKey={publicKey} isConsideredMobile={isConsideredMobile} tableData={tableData} />
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