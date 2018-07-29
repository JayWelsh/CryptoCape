import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import SwipeableViews from 'react-swipeable-views';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import SimpleMediaCard from './SimpleMediaCard';
import Grid from '@material-ui/core/Grid';

function TabContainer({ children, dir }) {
  return (
    <Typography component="div" dir={dir} style={{ padding: 8 * 3, justifyContent:'space-between', height:'calc(100%)' }}>
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

class FullWidthTabs extends React.Component {
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

    return (
      <div className={classes.root}>
        <AppBar position="static" color="default">
          <Tabs
            value={this.state.value}
            onChange={this.handleChange}
            indicatorColor="primary"
            textColor="primary"
            fullWidth
          >
            <Tab label="Posts" />
            <Tab label="Favourites" />
          </Tabs>
        </AppBar>
        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={this.state.value}
        >
          <TabContainer dir={theme.direction} className={classes.tabContainer}>
            <Grid container spacing={24}>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SimpleMediaCard />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SimpleMediaCard />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SimpleMediaCard />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SimpleMediaCard />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SimpleMediaCard />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SimpleMediaCard />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SimpleMediaCard />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SimpleMediaCard />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SimpleMediaCard />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SimpleMediaCard />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SimpleMediaCard />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SimpleMediaCard />
              </Grid>
            </Grid>
          </TabContainer>
          <TabContainer dir={theme.direction}>
          <Grid container spacing={24}>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SimpleMediaCard />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SimpleMediaCard />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SimpleMediaCard />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SimpleMediaCard />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SimpleMediaCard />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SimpleMediaCard />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SimpleMediaCard />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SimpleMediaCard />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SimpleMediaCard />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SimpleMediaCard />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SimpleMediaCard />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <SimpleMediaCard />
              </Grid>
            </Grid>
          </TabContainer>
        </SwipeableViews>
      </div>
    );
  }
}

FullWidthTabs.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(FullWidthTabs);