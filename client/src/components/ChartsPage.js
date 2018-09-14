import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import SwipeableViews from 'react-swipeable-views';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import SimpleMediaCard from './SimpleMediaCard';
import OurChart from './OurChart';
import Grid from '@material-ui/core/Grid';
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
import { Query } from "react-apollo";
import gql from "graphql-tag";
import axios from 'axios';

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
  }
});

class ChartsPage extends React.Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);
  }

  state = {
    value: this.props.renderChart ? 1 : 0,
    chartLink: this.props.renderChart ? this.props.renderChart : false,
    disableChart: this.props.renderChart ? false : true,
    coins: coinList
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  handleChangeIndex = index => {
    this.setState({ value: index });
  };

  fetchPriceValues() {
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

  componentDidMount() {
    this.intervalFetchPrices = setInterval(() => this.fetchPriceValues(), 10000);
    this.fetchPriceValues(); // also load one immediately
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
    const { classes, theme, match, location, history } = this.props;
    const { value, chartLink, disableChart, coins } = this.state;

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
            <div style={{ maxHeight: '500px' }}>
              <OurChart chartLink={chartLink} />
            </div>
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

export default withRouter(withStyles(styles, { withTheme: true })(ChartsPage));