import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import SwipeableViews from 'react-swipeable-views';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import SimpleMediaCard from './SimpleMediaCard';
import OurChart from './OurChart';
import OurPieChart from './OurPieChart';
import Grid from '@material-ui/core/Grid';
import { ParentSize } from "@vx/responsive";
import ChartMenuMiniCard from './ChartMenuMiniCard';
import OurChartVXContainer from './OurChartVXContainer';
import EthereumLogo from '../img/coins/ethereum.svg';
import AragonLogo from '../img/coins/aragon.svg';
import District0x from '../img/coins/district0x.svg'
import svg0x from '../img/coins/0x.svg';
import BATsvg from '../img/coins/basic-attention-token.svg';
import GolemLogo from '../img/coins/golem.svg';
import AugurLogo from '../img/coins/augur.svg';
import StatusLogo from '../img/coins/status.svg';
import OmisegoLogo from '../img/coins/omisego.svg';
import BloomLogo from '../img/coins/bloom.svg';
import RaidenLogo from '../img/coins/raiden.svg';
import { Link, withRouter } from 'react-router-dom';
import { Query } from "react-apollo";
import gql from "graphql-tag";
import axios from 'axios';

const coinList = {}

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
    }

    state = {
        value: this.props.publicKey ? 1 : 0,
        publicKey: this.props.publicKey ? this.props.publicKey : false,
        coins: coinList,
        ethPriceUSD: 0,
        totalPortfolioValueUSD: 0,
        totalPortfolioValueETH: 0,
        etherMarketCap: 0
    };

    handleChange = (event, value) => {
        this.setState({ value });
    };

    handleChangeIndex = index => {
        this.setState({ value: index });
    };

    fetchPriceValues() {
      let thisPersist = this;
      let currency = "$";
      let getAgainstETH = [];
      let getETHUSD = "https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH&tsyms=USD";
      axios.get(getETHUSD).then(res => {
        let etherToUSD = res.data.RAW.ETH.USD.PRICE;
        let etherMarketCap = res.data.RAW.ETH.USD.MKTCAP;
        this.setState({ethPriceUSD: etherToUSD, etherMarketCap: etherMarketCap});
        let getTokenBalances = 'https://api.ethplorer.io/getAddressInfo/' + thisPersist.state.publicKey + '?apiKey=freekey';
        axios.get(getTokenBalances).then(res => {
          let balanceOfETH = res.data.ETH.balance;
          if (balanceOfETH > 0) {
            getAgainstETH.push("ETH");
            coinList["ETH"] = { balance: balanceOfETH }
          }
          res.data.tokens.forEach((item, index) => {
            let balance = item.balance / 1000000000000000000;
            let rateUSD = item.tokenInfo.price.rate;
            let marketCapUSD = item.tokenInfo.price.marketCapUsd;
            let balanceUSD = balance * rateUSD;
            if (balanceUSD >= 5) {
              let symbol = item.tokenInfo.symbol.toUpperCase();
              getAgainstETH.push(symbol);
              coinList[symbol] = { balance, balanceUSD, marketCapUSD };
            }
          });
          let getTokenPrices = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=' + getAgainstETH.join(',') + '&tsyms=ETH';
          axios.get(getTokenPrices).then(res => {
            let totalValueCountUSD = 0;
            let totalValueCountETH = 0;
            Object.keys(coinList).forEach((item, index) => {
              if (item === "ETH") {
                coinList[item].value_usd = coinList[item].balance * etherToUSD;
                coinList[item].marketCapUSD = etherMarketCap;
              } else {
                coinList[item].value_usd = coinList[item].balanceUSD;
              }
              if(coinList[item].value_usd > 0){
                totalValueCountUSD += coinList[item].value_usd
              }
              if(res.data[item]){
                coinList[item].value_eth_per_token = res.data[item].ETH;
                coinList[item].value_eth = coinList[item].balance * res.data[item].ETH;
              }
              if(coinList[item].value_eth > 0){
                totalValueCountETH += coinList[item].value_eth
              }
            });
            thisPersist.setState({ coins: coinList, totalPortfolioValueUSD: totalValueCountUSD, totalPortfolioValueETH: totalValueCountETH });
          })
          thisPersist.setState({ coins: coinList });
        })
        });
    }

  componentDidMount() {
    if (this.state.publicKey) {
      this.intervalFetchPrices = setInterval(() => this.fetchPriceValues(), 60000);
      this.fetchPriceValues(); // also load one immediately
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

  render() {
    const { classes, theme, match, location, history, isConsideredMobile } = this.props;
    const { value, publicKey, disableChart, coins, totalPortfolioValueUSD, totalPortfolioValueETH } = this.state;

    let displayTotalUSD = "$" + totalPortfolioValueUSD.toFixed(2);
    let displayTotalETH = "~ " + totalPortfolioValueETH.toFixed(2) +  " ETH"

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
      Dog($chartLink: String!) {
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
    return (
      <div className={classes.root}>
        <Query
          variables={{ chartLink }}
          query={GET_CHART_DATA}
        >
          {({ loading, error, data }) => {
            console.log(data);
            return <div>
              <Grid container spacing={24}>
                <Grid item xs={12} sm={1} md={1} lg={1} className={"disable-padding"}>
                </Grid>
                <Grid item style={{ "textAlign": "center" }} xs={12} sm={10} md={10} lg={10}>
                  <OurChart isConsideredMobile={isConsideredMobile} chartLink={chartLink} />
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
              </Grid>
            </div>
          }}
        </Query>
      </div>
    );
  }
}

PortfolioPage.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles, { withTheme: true })(PortfolioPage));