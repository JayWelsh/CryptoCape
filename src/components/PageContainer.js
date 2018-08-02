import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import SwipeableViews from 'react-swipeable-views';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import HomePage from './HomePage';
import ChartsPage from './ChartsPage';
import {Route} from 'react-router-dom';

//TODO Functions

const styles = theme => ({
    pageContainer: {
        //padding: theme.spacing.unit * 3,
        minHeight:'calc(100vh - 112px)',
        boxShadow:'0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12)'
    }
});

class PageContainer extends React.Component {
  constructor(props) {
    super(props);
  }
  state = {
    //TODO
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  handleChangeIndex = index => {
    this.setState({ value: index });
  };

  render() {
    //TODO Props
    const { classes, theme } = this.props;

    return (
      <div className={classes.pageContainer}>
        <Route exact={true} path="/" component={HomePageRoute}/>
        <Route exact={true} path="/charts" component={ChartsPageRoute}/>
      </div>
    );
  }
}

const HomePageRoute = ({ match }) => {
  return <HomePage/>
}

const ChartsPageRoute = ({ match }) => {
  return <ChartsPage/>
}

PageContainer.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(PageContainer);