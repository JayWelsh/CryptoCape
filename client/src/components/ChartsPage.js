import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import SwipeableViews from 'react-swipeable-views';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import SimpleMediaCard from './SimpleMediaCard';
import OurChart from './OurChart';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import ChartMenuMiniCard from './ChartMenuMiniCard';
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
import gql from "graphql-tag";
import axios from 'axios';
import { Query, withApollo } from "react-apollo";
import moment from 'moment';
import { priceFormat } from '../utils';

const coinList = {
  'ETH': {
    'image': EthereumLogo,
    'symbol': 'ETH'
  },
  'ANT': {
    'image': AragonLogo,
    'symbol': 'ANT'
  },
  'DNT': {
    'image': District0x,
    'symbol': 'DNT'
  },
  'ZRX': {
    'image': svg0x,
    'symbol': 'ZRX'
  },
  'BAT': {
    'image': BATsvg,
    'symbol': 'BAT'
  },
  'GNT': {
    'image': GolemLogo,
    'symbol': 'GNT'
  },
  'REP': {
    'image': AugurLogo,
    'symbol': 'REP'
  },
  'SNT': {
    'image': StatusLogo,
    'symbol': 'SNT'
  },
  'OMG': {
    'image': OmisegoLogo,
    'symbol': 'OMG'
  },
  'BLT': {
    'image': BloomLogo,
    'symbol': 'BLT'
  },
  'RDN': {
    'image': RaidenLogo,
    'symbol': 'RDN'
  }
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
    width: '100%'
  },
  button: {
    margin: theme.spacing.unit,
  }
});

class ChartsPage extends React.Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      value: this.props.renderChart ? 1 : 0,
      chartLink: this.props.renderChart ? this.props.renderChart : false,
      disableChart: this.props.renderChart ? false : true,
      coins: coinList,
      chartData: {
        timeseries: null,
        name: null,
        abbreviation: null
      },
      timeseriesRange: '1M',
      isChartLoading: true
    };
  }

  handleChange = (event, value) => {
    this.setState({ value });
  };

  handleChangeIndex = index => {
    this.setState({ value: index });
  };

  getDataURL(fsym, tsym, range) {
    switch(range){
      case '1HR': {
        let limit = moment().diff(moment().subtract(1, 'hours'), 'minutes');
        return "https://min-api.cryptocompare.com/data/histominute?fsym=" + fsym + "&tsym=USD&limit=" + limit + "&aggregate=1&e=CCCAGG";
        break;
      }
      case '24HR': {
        let limit = moment().diff(moment().subtract(1, 'days'), 'minutes');
        return "https://min-api.cryptocompare.com/data/histominute?fsym=" + fsym + "&tsym=USD&limit=" + limit + "&aggregate=1&e=CCCAGG";
        break;
      }
      case '1W': {
        let limit = moment().diff(moment().subtract(1, 'weeks'), 'hours');
        return "https://min-api.cryptocompare.com/data/histohour?fsym=" + fsym + "&tsym=USD&limit=" + limit + "&aggregate=1&e=CCCAGG";
        break;
      }
      case '1M': {
        let limit = moment().diff(moment().subtract(1, 'months'), 'hours');
        return "https://min-api.cryptocompare.com/data/histohour?fsym=" + fsym + "&tsym=USD&limit=" + limit + "&aggregate=1&e=CCCAGG";
        break;
      }
      case '6M': {
        let limit = moment().diff(moment().subtract(6, 'months'), 'days');
        return "https://min-api.cryptocompare.com/data/histoday?fsym=" + fsym + "&tsym=USD&limit=" + limit + "&aggregate=1&e=CCCAGG";
        break;
      }
      case '1Y': {
        let limit = moment().diff(moment().subtract(1, 'years'), 'days');
        return "https://min-api.cryptocompare.com/data/histoday?fsym=" + fsym + "&tsym=USD&limit=" + limit + "&aggregate=1&e=CCCAGG";
        break;
      }
      case 'ALL': {
        return "https://min-api.cryptocompare.com/data/histoday?fsym=" + fsym + "&tsym=USD&allData=true&aggregate=1&e=CCCAGG";
        break;
      }
    }
  }

  fetchPriceDataSpecific(chartLink) {
    if (this.state.isChartLoading === false) {
      this.setState({ isChartLoading: true });
    }
    let client = this.props.client;
    client.query({
      query: GET_CHART_DATA,
      variables: { chartLink }
    }).then((res) => {
      let cryptoSymbol = res.data.cryptocurrencies[0].abbreviation;
      let cryptoName = res.data.cryptocurrencies[0].name;
      let getETHUSD = this.getDataURL(cryptoSymbol, 'USD', this.state.timeseriesRange);
      axios.get(getETHUSD).then(res => {
        let timeSeries = res.data.Data
        let returnPricingData = {};
        returnPricingData = res.data.Data.map(item => {
          return {
            date: moment.unix(item.time),
            price: item.close
          };
        });
        if (returnPricingData.length > 0) {
          let chartData = {
            timeseries: returnPricingData,
            name: cryptoName,
            abbreviation: cryptoSymbol
          }
          this.setState({ chartData: chartData, isChartLoading: false });
        }
      })
    });
  }

  getSelectedTimeseriesRange(timeseriesRange) {
    if(this.state.timeseriesRange === timeseriesRange) {
      return {
        "fontWeight": "bold",
        "color": "white",
        "background-color": "#000628"
      }
    }
  }

  fetchPriceValuesAll() {
    let thisPersist = this;
    let coinListKeys = Object.keys(coinList);
    let currency = "$";
    let requestURL = 'https://min-api.cryptocompare.com/data/pricemulti?fsyms=' + coinListKeys.join(',') + '&tsyms=USD';
    axios.get(requestURL).then(res => {
      coinListKeys.forEach((item, index) => {
        let coinPrice = res.data[item].USD;
        coinList[item].price = (currency + coinPrice);
      });
      thisPersist.setState({coins: coinList});
    })
  }

  setTimeseriesRange(range) {
    if(range !== this.state.timeseriesRange){
      this.setState({timeseriesRange: range, isChartLoading: true});
      this.fetchPriceDataSpecific(this.state.chartLink);
    }
  }

  componentDidMount() {
    if (!this.state.chartLink) {
      this.intervalFetchPrices = setInterval(() => this.fetchPriceValuesAll(), 10000);
      this.fetchPriceValuesAll(); // also load one immediately
    } else {
      this.fetchPriceDataSpecific(this.state.chartLink);
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
          chartLink={"Loading..."}
          isPlaceholding={true}
          image={null} />
      </Grid>)
    }
    return placeholderComponents;
  }

  render() {
    const { classes, theme, match, location, history, isConsideredMobile } = this.props;
    const { value, chartLink, disableChart, coins, chartData, isChartLoading } = this.state;

    let currentPrice = 0;
    let diffPrice = 0;
    let hasIncreased;

    if(chartData.timeseries && chartData.timeseries.length > 0) {
        let prices = Object.keys(chartData.timeseries).map(key => {
            return {
                date: chartData.timeseries[key].date,
                price: chartData.timeseries[key].price
            };
        })
        let firstPrice = prices[0].price;
        currentPrice = prices[prices.length - 1].price;
        diffPrice = priceFormat(currentPrice - firstPrice);
        //Format now that $ can be attached (run calcs before this)
        currentPrice = priceFormat(currentPrice);
        hasIncreased = diffPrice > 0;
    }

    let disableChartStyle = {};
    if (disableChart) {
      disableChartStyle = { opacity: '0' }
    }

    return (
      <div className={classes.root}>
        <AppBar position="static" color="default">
          <Tabs
            value={value}
            onChange={this.handleChange}
            indicatorColor="primary"
            textColor="primary"
            scrollable
            scrollButtons="off"
            fullWidth
          >
            <Tab label="Menu" onClick={() => { history.push('/charts') }} />
            <Tab label="Chart" disabled={disableChart} style={disableChartStyle} />
          </Tabs>
        </AppBar>
        {value === 0 &&
          <TabContainer dir={theme.direction}>
            <Grid container spacing={24}>
              <Query
                query={gql`
                {
                  cryptocurrencies {
                    id
                    abbreviation
                    name
                    externalLink
                  }
                }
              `}
              >
                {({ loading, error, data }) => {
                  if (loading) return this.getPlaceholders();
                  if (error) return <Grid item xs={12} sm={6} md={4} lg={3}><p>Error :(</p></Grid>;
                  return data.cryptocurrencies.map(({ id, abbreviation, name, externalLink }) => (
                    <Grid item key={id} xs={12} sm={6} md={4} lg={3}>
                      <ChartMenuMiniCard
                        externalLink={externalLink}
                        headline={abbreviation}
                        subHeadline={name}
                        chartLink={name.toLowerCase().replace(/" "/g, "-")}
                        realtimeValue={coins[abbreviation] ? coins[abbreviation].price : ''}
                        image={coinList[abbreviation].image} />
                    </Grid>
                  ));
                }}
              </Query>
            </Grid>
          </TabContainer>
        }
        {value === 1 &&
          <TabContainer dir={theme.direction}>
            <Grid container spacing={24} style={{marginTop: "-35px"}}>
                <Grid item xs={12} sm={1} md={1} lg={1} className={"disable-padding"}>
                </Grid>
                <Grid item style={{ "textAlign": "center" }} xs={12} sm={10} md={10} lg={10}>
                  <Button className={classes.button} onClick={() => this.setTimeseriesRange("1HR")} style={this.getSelectedTimeseriesRange("1HR")}>
                    1HR
                  </Button>
                  <Button className={classes.button} onClick={() => this.setTimeseriesRange("24HR")} style={this.getSelectedTimeseriesRange("24HR")}>
                    24HR
                  </Button>
                  <Button className={classes.button} onClick={() => this.setTimeseriesRange("1W")} style={this.getSelectedTimeseriesRange("1W")}>
                    1W
                  </Button>
                  <Button className={classes.button} onClick={() => this.setTimeseriesRange("1M")} style={this.getSelectedTimeseriesRange("1M")}>
                    1M
                  </Button>
                  <Button className={classes.button} onClick={() => this.setTimeseriesRange("6M")} style={this.getSelectedTimeseriesRange("6M")}>
                    6M
                  </Button>
                  <Button className={classes.button} onClick={() => this.setTimeseriesRange("1Y")} style={this.getSelectedTimeseriesRange("1Y")}>
                    1Y
                  </Button>
                  <Button className={classes.button} onClick={() => this.setTimeseriesRange("ALL")} style={this.getSelectedTimeseriesRange("ALL")}>
                    ALL
                  </Button>
                  <OurChart isChartLoading={isChartLoading} isConsideredMobile={isConsideredMobile} chartTitle={chartData.name} chartSubtitle={chartData.abbreviation} chartData={chartData.timeseries}  />
                </Grid>
                <Grid item xs={12} sm={1} md={1} lg={1} className={"disable-padding"}>
                </Grid>
                <Grid item xs={12} sm={1} md={1} lg={1} className={"disable-padding"}>
                </Grid>
                <Grid item style={{ "textAlign": "center" }} xs={12} sm={10} md={10} lg={10}>
                <Paper className={classes.root} elevation={2}>
                    <Typography variant={isConsideredMobile ? "display3" : "display4"}>
                      {currentPrice}
                    </Typography>
                    <Typography variant={isConsideredMobile ? "display2" : "display3"} gutterBottom={true}>
                      {diffPrice}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={1} md={1} lg={1} className={"disable-padding"}>
                </Grid>
            </Grid>
          </TabContainer>
        }
      </div>
    );
  }
}

ChartsPage.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withApollo(withRouter(withStyles(styles, { withTheme: true })(ChartsPage)));