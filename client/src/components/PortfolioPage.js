import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import OurChart from './OurChart';
import OurPieChart from './OurPieChart';
import Grid from '@material-ui/core/Grid';
import ChartMenuMiniCard from './ChartMenuMiniCard';
import { withRouter } from 'react-router-dom';
import gql from "graphql-tag";
import axios from 'axios';
import {priceFormat, numberFormat, isValidAddress} from '../utils';
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
          publicKey: this.props.publicKey ? this.props.publicKey.toLowerCase() : "",
          coins: {},
          ethPriceUSD: 0,
          totalPortfolioValueUSD: 0,
          totalPortfolioValueETH: 0,
          etherMarketCap: 0,
          isChartLoading: true,
          baseCurrencyToUSD: [],
          historicalBaseCurrency: 'ETH',
          publicKeyError: false,
          enableFiatConversion: false
        };
        let publicKeyLocalStorage = window.localStorage.getItem("publicKey");
        if(this.state.publicKey === "" && isValidAddress(publicKeyLocalStorage)) {
          this.props.history.push("/portfolio/" + publicKeyLocalStorage);
        }
    }
    
  toggleFiatConversion = () => {
    this.setState({ enableFiatConversion: !this.state.enableFiatConversion });
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

    handleChangeBaseCurrency = name => event => {
      axios.all([this.getBaseCurrencyHistoricalUSD(event.target.value)]).then((res) => {
        this.setState({
          [name]: event.target.value,
          baseCurrencyToUSD: res[0].data.Data
        });
      });
    };

    handleChangeIndex = index => {
        this.setState({ value: index });
    };

    getTokenTransactionHistory(publicKey) {
      let getTokenTransactionHistoryURL = 'https://api.etherscan.io/api?module=account&action=tokentx&address=' + publicKey + '&startblock=0&endblock=999999999&sort=asc&apikey=YourApiKeyToken';
      return axios.get(getTokenTransactionHistoryURL);
    }

    getEtherTransactionHistory(publicKey) {
      let getEthTransactionHistoryURL = 'https://api.etherscan.io/api?module=account&action=txlist&address=' + publicKey + '&startblock=0&endblock=99999999&sort=asc&apikey=YourApiKeyToken';
      return axios.get(getEthTransactionHistoryURL);
    }

    getBaseCurrencyHistoricalUSD(historicalBaseCurrency){
      let getHistoricalBaseCurrency = "https://min-api.cryptocompare.com/data/histoday?fsym=" + historicalBaseCurrency + "&tsym=USD&allData=true&aggregate=1&e=CCCAGG";
      return axios.get(getHistoricalBaseCurrency);
    }

  getClosestTimestamp = (arr, goal, prop) => {
    var indexArr = arr.map(function (k) { return Math.abs(k[prop] - goal) })
    var min = Math.min.apply(Math, indexArr)
    return arr[indexArr.indexOf(min)]
  }

    fetchAddressTransactionHistory() {
      let thisPersist = this;
      let publicKey = this.state.publicKey;
      let restrictCoins = this.state.coins;
      let historicalBaseCurrency = this.state.historicalBaseCurrency;
      let restrictCoinsKeys = Object.keys(restrictCoins);
      axios.all([this.getEtherTransactionHistory(publicKey), this.getTokenTransactionHistory(publicKey),this.getBaseCurrencyHistoricalUSD(historicalBaseCurrency)]).then(res => {
        if (res && res[1].data && res[1].data.result && (res[1].data.result.constructor === Array)) {
          let transactionDataEther = res[0].data.result.map((item) => {
            item.tokenSymbol = "ETH";
            return item;
          });

          let transactionDataTokens = res[1].data.result.filter((item) => {
            return (restrictCoinsKeys.indexOf(item.tokenSymbol) >= 0)
          })

          let transactionData = transactionDataEther.concat(transactionDataTokens);

          restrictCoinsKeys.forEach((coin) => {
            let coinTransactionGroup = transactionData.filter((item) => {
              return item.tokenSymbol === coin;
            })
            let latestTimestamp;
            let earliestTimestamp;
            coinTransactionGroup.forEach((transaction, index) => {

              if (index === 0) {
                latestTimestamp = transaction.timeStamp;
                earliestTimestamp = transaction.timeStamp;
              }
              
              if (transaction.timeStamp > latestTimestamp) {
                latestTimestamp = transaction.timeStamp;
              } else if (transaction.timeStamp < earliestTimestamp){
                earliestTimestamp = transaction.timeStamp;
              }

              let balanceAfterPriorTransactions = 0;

              if (restrictCoins[transaction.tokenSymbol].timeseries && index !== 0) {
                balanceAfterPriorTransactions += restrictCoins[transaction.tokenSymbol].timeseries[index - 1].price;
              }

              let setBalance;
              if (transaction.to.toLowerCase() === publicKey.toLowerCase()) {
                setBalance = balanceAfterPriorTransactions + ((transaction.value - (transaction.gasUsed * transaction.gasPrice)) / 1000000000000000000);
              } else {
                setBalance = balanceAfterPriorTransactions - ((transaction.value - (transaction.gasUsed * transaction.gasPrice)) / 1000000000000000000);
              }

              let transactionTimeseriesSingle = {
                date: moment.unix(transaction.timeStamp),
                price: setBalance
              }
              if (restrictCoins[transaction.tokenSymbol].timeseries) {
                restrictCoins[transaction.tokenSymbol].timeseries.push(transactionTimeseriesSingle);
              } else {
                restrictCoins[transaction.tokenSymbol].timeseries = [];
                restrictCoins[transaction.tokenSymbol].timeseries.push(transactionTimeseriesSingle);
              }
              restrictCoins[transaction.tokenSymbol].latestTimestamp = latestTimestamp;
              restrictCoins[transaction.tokenSymbol].earliestTimestamp = earliestTimestamp;
              
            });
          })
          thisPersist.setState({ coins: restrictCoins, isChartLoading: false, baseCurrencyToUSD: res[2].data.Data });
        }
      });
    }

    bufferTimeseries(timeseries, range) {
      
      let returnArray = [];
      if (timeseries.length > 0) {
        let firstDate = timeseries[0].date;
        let lastDate = timeseries[timeseries.length - 1].date;

        let daysToGenerate = lastDate.diff(firstDate, "days");

        let lastConsumedIndex = 0;
        //console.log("timeseries",timeseries);
        timeseries.forEach((item, index) => {
          let thisDate = item.date;
          let thisPrice = item.price;
          let bufferPeriod = 7;
          if (index === 0) {
            for (let i = 0; i < bufferPeriod; i++) {
              returnArray.push({ date: moment(thisDate).subtract((bufferPeriod - i), 'days'), price: 0 });
            }
          }
          if (timeseries[index + 1]) {
            let nextDate = timeseries[index + 1].date;
            let daysUntilNextDatapoint = nextDate.diff(thisDate, "days");
            //console.log('daysUntilNextDatapoint', daysUntilNextDatapoint);
            returnArray.push({ date: thisDate, price: thisPrice });
            if (daysUntilNextDatapoint > 1) {
              for (let i = 1; i < daysUntilNextDatapoint; i++) {
                returnArray.push({ date: moment(thisDate).add(i, 'days'), price: thisPrice });
              }
            }
          } else if (index === (timeseries.length - 1)) {
            let currentDate = moment();
            let daysSinceLastTransaction = currentDate.diff(thisDate, "days");
            returnArray.push({ date: thisDate, price: thisPrice });
            for (let i = 1; i < daysSinceLastTransaction; i++) {
              returnArray.push({ date: moment(thisDate).add(i, 'days'), price: thisPrice });
            }
            returnArray.push({ date: currentDate, price: thisPrice });
          }
        });
      }
      return returnArray;
    }

  fetchPriceValues() {
    let thisPersist = this;
    let currency = "$";
    let getAgainstETH = [];
    let coinListLocal = {};
    let getETHUSD = "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH&tsyms=USD";
    axios.get(getETHUSD).then(res => {
      let etherToUSD = res.data.RAW.ETH.USD.PRICE;
      let etherMarketCap = res.data.RAW.ETH.USD.MKTCAP;
      this.setState({ ethPriceUSD: etherToUSD, etherMarketCap: etherMarketCap });
      let getTokenBalances = 'https://api.ethplorer.io/getAddressInfo/' + thisPersist.state.publicKey + '?apiKey=freekey';
      axios.get(getTokenBalances).then(res => {
        let balanceOfETH = res.data.ETH.balance;
          getAgainstETH.push("ETH");
          coinListLocal["ETH"] = { balance: balanceOfETH }
        res.data.tokens.forEach((item, index) => {
          let balance = item.balance / 1000000000000000000;
          let rateUSD = item.tokenInfo.price.rate;
          let marketCapUSD = item.tokenInfo.price.marketCapUsd;
          let balanceUSD = balance * rateUSD;
          if (balanceUSD >= 5) {
            let symbol = item.tokenInfo.symbol.toUpperCase();
            getAgainstETH.push(symbol);
            coinListLocal[symbol] = { balance, balanceUSD, marketCapUSD };
          }
        });
        thisPersist.setState({ coins: coinListLocal });
        let getTokenPrices = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=' + getAgainstETH.join(',') + '&tsyms=ETH';
        axios.get(getTokenPrices).then(res => {
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
          thisPersist.setState({ coins: coinListLocal, totalPortfolioValueUSD: totalValueCountUSD, totalPortfolioValueETH: totalValueCountETH });
          this.fetchAddressTransactionHistory();
        })
        thisPersist.setState({ coins: coinListLocal });
      })
    });
  }

  handleFocus(event) {
    event.target.select();
  }

  componentDidMount() {
    if (this.state.publicKey) {
      //this.intervalFetchPrices = setInterval(() => this.fetchPriceValues(), 60000);
      if ((this.state.publicKey.length > 0) && isValidAddress(this.state.publicKey)) {
        window.localStorage.setItem("publicKey", this.state.publicKey);
      };
      this.fetchPriceValues(); // also load one immediately
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.publicKey && this.state.publicKey !== nextProps.publicKey) {
      this.setState({ publicKey: nextProps.publicKey, isChartLoading: true, coins: {}, historicalBaseCurrency: 'ETH' });
      if ((nextProps.publicKey.length > 0) && isValidAddress(nextProps.publicKey)) {
        window.localStorage.setItem("publicKey", nextProps.publicKey);
        this.fetchPriceValues();
      }
    }
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

  convertBaseBalances = (timeseriesData) => {
    if (this.state.baseCurrencyToUSD) {
      let timeseriesDataMap = [...timeseriesData];
      timeseriesDataMap.map((transaction) => {
        let closestBasePriceToUSD = this.getClosestTimestamp(this.state.baseCurrencyToUSD, moment(transaction.date).unix(), 'time');
        transaction.price = transaction.price * closestBasePriceToUSD.close;
        return transaction;
      })
      return timeseriesDataMap;
    }
  }

  render() {
    const { classes, theme, match, location, history, isConsideredMobile } = this.props;
    const { value, publicKey, disableChart, coins, totalPortfolioValueUSD, totalPortfolioValueETH, isChartLoading, historicalBaseCurrency, baseCurrencyToUSD, enableFiatConversion } = this.state;
    let displayTotalUSD = priceFormat(totalPortfolioValueUSD);
    let displayTotalETH = "~ " + numberFormat(totalPortfolioValueETH) +  " ETH"

    let ethAddressError = false;
    if((publicKey.length > 0) && !isValidAddress(publicKey)){
      ethAddressError = true;
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
        timeseriesData =  this.bufferTimeseries(coins[historicalBaseCurrency].timeseries, 'daily');
        if(enableFiatConversion){
          timeseriesData = this.convertBaseBalances(timeseriesData);
        }        
      }
    // [
    //     ['Ether', 5.004, false],
    //     ['District0x', 0.977, false],
    //     ['0xProject', 0.728, false],
    //     ['OmiseGO', 0.500, false],
    //     ['Aragon', 0.430, false],
    //     ['Basic Attention Token', 0.256, false],
    // ]

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
    let margin = {
      top: 15,
      bottom: 40,
      left: 0,
      right: 0
    }

    const GET_CHART_DATA = gql`
    query 
      Cryptocurrency($chartLink: String!) {
        cryptocurrencies(name: $chartLink) {
          id
          abbreviation
          name
          externalLink
          historicalDaily {
            close
            time
          }
        }
      }
    `
    let chartLink = "ether";
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
                        margin="normal"
                        variant="outlined"
                      />
                    </form>
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
                <Grid container spacing={24}>
                  <Grid item xs={12} sm={1} md={1} lg={1} className={"disable-padding"}>
                  </Grid>
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
                        autoFocus={true}
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
                        value={this.state.historicalBaseCurrency}
                        onChange={this.handleChangeBaseCurrency('historicalBaseCurrency')}
                        SelectProps={{
                          MenuProps: {
                            className: classes.menu,
                          },
                        }}
                        margin="normal"
                        variant="outlined"
                      >
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
                          checked={this.state.enableFiatConversion}
                          onChange={this.toggleFiatConversion}
                          value="checkedB"
                          color="primary"
                        />
                      }
                      label="USD Value"
                    />
                  </Grid>
                  <Grid item xs={12} sm={1} md={1} lg={1} className={"disable-padding"}>
                  </Grid>
                </Grid>
              </div>
            </Grid>
            <Grid item xs={12} sm={1} md={1} lg={1} className={"disable-padding"}>
            </Grid>
            <Grid item xs={12} sm={1} md={1} lg={1} className={"disable-padding"}>
            </Grid>
            <Grid item style={{ "textAlign": "center" }} xs={12} sm={10} md={10} lg={10}>
              <OurChart isChartLoading={isChartLoading} isConsideredMobile={isConsideredMobile} chartTitle={chartData.name} chartSubtitle={chartData.abbreviation} chartData={timeseriesData} chartCurrency={chartCurrency} />
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
            <Grid item xs={12} sm={12} md={12} lg={12}>
              <div style={{ height: '25px' }} />
            </Grid>
            {/* <Grid item xs={12} sm={1} md={1} lg={1} className={"disable-padding"}>
                </Grid>
                <Grid item style={{ "textAlign": "center" }} xs={12} sm={10} md={10} lg={10}>
                   <EnhancedTable/>
                </Grid>
                <Grid item xs={12} sm={1} md={1} lg={1} className={"disable-padding"}>
                </Grid> */}
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