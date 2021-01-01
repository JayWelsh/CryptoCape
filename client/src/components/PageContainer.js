import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import SwipeableViews from 'react-swipeable-views';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import HomePage from './HomePage';
import PortfolioPage from './PortfolioPage';
import ChartsPage from './ChartsPage';
import {Route, withRouter} from 'react-router-dom';

//TODO Functions

const styles = theme => ({
    pageContainer: {
        //padding: theme.spacing.unit * 3,
        minHeight:'calc(100vh - 112px)',
        boxShadow:'0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12)'
    }
});

class PageContainer extends React.Component {
  constructor(props){
    super(props);
  }

  static propTypes = {
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    isConsideredMobile: PropTypes.bool.isRequired
  }

  state = {
    history:  this.props.history
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  handleChangeIndex = index => {
    this.setState({ value: index });
  };

  componentDidUpdate(prevProps){
    window.dispatchEvent(new Event('resize'));
  }

  render() {
    //TODO Props
    const { classes, theme, history, isConsideredMobile, setLoading, isLoading, isDarkMode } = this.props;
    return (
      <div className={classes.pageContainer}>
          <Route exact={true} path="/" render={(props) => HomePageRoute(props, isConsideredMobile, isDarkMode)}/>
          <Route exact={true} path="/charts/:chartLink" render={(props) => ChartsPageRoute(props, isConsideredMobile, isDarkMode)}/>
          <Route exact={true} path="/charts" render={(props) => ChartsPageRoute(props, isConsideredMobile, isDarkMode)}/>
          <Route exact={true} path="/portfolio" render={(props) => PortfolioPageRoute(props, isConsideredMobile, isDarkMode)}/>
          <Route exact={true} path="/portfolio/:publicKey" render={(props) => PortfolioPageRoute(props, isConsideredMobile, setLoading, isLoading, isDarkMode)}/>
      </div>
    );
  }
}

const HomePageRoute = ({ match, history }, isConsideredMobile, isDarkMode) => {
  return <HomePage isDarkMode={isDarkMode}/>
}

const ChartsPageRoute = ({ match }, isConsideredMobile, isDarkMode) => {
  if(match.params && match.params.chartLink){
    return <ChartsPage isConsideredMobile={isConsideredMobile} renderChart={match.params.chartLink} isDarkMode={isDarkMode}/>
  }else{
    return <ChartsPage isConsideredMobile={isConsideredMobile} isDarkMode={isDarkMode}/>
  }
}

const PortfolioPageRoute = ({ match }, isConsideredMobile, setLoading, isLoading, isDarkMode) => {
  if(match.params && match.params.publicKey){
    return <PortfolioPage isConsideredMobile={isConsideredMobile} publicKey={match.params.publicKey} setLoading={setLoading} isLoading={isLoading} isDarkMode={isDarkMode}/>
  }else{
    return <PortfolioPage isConsideredMobile={isConsideredMobile} isDarkMode={isDarkMode}/>
  }
}

PageContainer.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles, { withTheme: true })(PageContainer));