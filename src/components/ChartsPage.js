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
import MiniMediaCard from './MiniMediaCard';
import EthereumLogo from '../img/coins/ethereum.svg';
import AragonLogo from '../img/coins/aragon.svg';
import District0x from '../img/coins/district0x.svg'
import svg0x from '../img/coins/0x.svg';
import BATsvg from '../img/coins/basic-attention-token.svg';
import GolemLogo from '../img/coins/golem.svg';
import AugurLogo from '../img/coins/augur.svg';
import StatusLogo from '../img/coins/status.svg';

function TabContainer({ children, dir }) {
  return (
    <Typography component="div" dir={dir} className="mobile-friendly-padding" style={{ justifyContent:'space-between', height:'calc(100%)' }}>
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
  state = {
    value: 0,
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  handleChangeIndex = index => {
    this.setState({ value: index });
  };

  render() {
    const { classes, theme } = this.props;
    const { value } = this.state;

    return (
      <div className={classes.root}>
        <AppBar position="static" color="default">
        <Tabs
            value={value}
            onChange={this.handleChange}
            indicatorColor="primary"
            textColor="primary"
            scrollable
            scrollButtons="no"
            fullWidth
          >
            <Tab label="Menu" />
            <Tab label="Chart" />
          </Tabs>
        </AppBar>
          {value === 0 &&
          <TabContainer dir={theme.direction}>
          <Grid container spacing={24}>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <MiniMediaCard headline={"ETH"} subHeadline={"Ethereum"} image={EthereumLogo} />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <MiniMediaCard headline={"ANT"} subHeadline={"Aragon"} image={AragonLogo} />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <MiniMediaCard headline={"DNT"} subHeadline={"District0x"} image={District0x} />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <MiniMediaCard headline={"ZRX"} subHeadline={"0x"} image={svg0x} />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <MiniMediaCard headline={"BAT"} subHeadline={"Basic Attention Token"} image={BATsvg} />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <MiniMediaCard headline={"GNT"} subHeadline={"Golem"} image={GolemLogo} />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <MiniMediaCard headline={"REP"} subHeadline={"Augur"} image={AugurLogo} />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <MiniMediaCard headline={"SNT"} subHeadline={"Status"} image={StatusLogo} />
              </Grid>
            </Grid>
          </TabContainer>
          }
          {value === 1 &&
          <TabContainer dir={theme.direction}>
            <div style={{ maxHeight: '500px' }}>
              <OurChart />
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

export default withStyles(styles, { withTheme: true })(ChartsPage);