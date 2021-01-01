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
import Card from '@material-ui/core/Card';
import Timeline from '@material-ui/icons/Timeline';
import PortfolioDonut from '@material-ui/icons/DonutSmall';
import CardActionArea from '@material-ui/core/CardActionArea';
import {Link, withRouter} from 'react-router-dom';

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.default,
    width: '100%'
  },
  pageMinHeight: {
    minHeight: 'calc(100vh - 64px)'
  },
});

class HomePage extends React.Component {
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
    const { classes, theme, history, isDarkMode } = this.props;
    return (
      <div className={classes.root + " " + classes.pageMinHeight}>
        <Grid container spacing={24} style={{paddingTop: '15px'}}>
          <Grid item xs={12} sm={1} md={1} lg={1} className={"disable-padding"}>
          </Grid>
          <Grid item style={{ "textAlign": "center" }} xs={12} sm={10} md={10} lg={10}>
            <Typography variant={"display3"} component="h1">
              Dashboard
            </Typography>
            <Grid container style={{ "textAlign": "center", 'padding': '15px' }} spacing={24}>
              <Grid item xs={12} sm={4} md={4} lg={4} className={"disable-padding"}>
              </Grid>
              <Grid item xs={12} sm={4} md={4} lg={4}>
                <Card>
                  <CardActionArea className={'hoverOpacity'} onClick={() => { history.push(`/portfolio`) }} style={{width: '100%'}}>
                      <PortfolioDonut style={{ fontSize: 150 }} />
                      <br/>
                      <Typography variant="headline" component="h2" gutterBottom>
                      My Portfolio
                      </Typography>
                  </CardActionArea>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4} md={4} lg={4} className={"disable-padding"}>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={1} md={1} lg={1} className={"disable-padding"}>
          </Grid>
        </Grid>
      </div>
    );
  }
}

HomePage.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles, { withTheme: true })(HomePage));