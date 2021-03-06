import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import moment from 'moment';
import OurChartVXContainer from './OurChartVXContainer';
import gql from "graphql-tag";

const styles = {
  cardPositioning: {
    display: 'inline-block',
    left: '50%',
    position: 'relative',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '1920px'
  }
};

let pageRerenderPreventDoubleFire;
let chartRedispatchEventRerenderDelay;
let isAnimating = false;

class OurChart extends React.Component {

  constructor(props) {
    super(props);
    this.state = {isChartLoading: this.props.isChartLoading}
  }

  refactorTimeseriesData = (cryptocurreny) => {
    let returnPricingData = {};
    let cryptocurrenyName = cryptocurreny.name;
    let cryptocurrenyAbbreviation = cryptocurreny.abbreviation;
    returnPricingData = Object.keys(cryptocurreny.historicalDaily).map(key => {
      return {
          date: moment.unix(cryptocurreny.historicalDaily[key].time).format("YYYY-MM-DD"),
          price: cryptocurreny.historicalDaily[key].close
      };
    });
    return {name: cryptocurrenyName, abbreviation: cryptocurrenyAbbreviation, data: returnPricingData};
  }

  render() {
    const {
      classes,
      theme,
      chartLink,
      isConsideredMobile,
      chartTitle,
      chartSubtitle,
      chartData,
      isChartLoading,
      chartCurrency,
      enableCurveStepAfter,
      children,
      timebox,
      timeboxTimestamp,
      genesisProgress,
      isEth2DepositContract,
      isLoading,
      handleFromDateChange,
      handleToDateChange,
      earliestDate,
      isDarkMode,
    } = this.props;

    let margin = {
      top: 15,
      bottom: 55,
      left: 0,
      right: 0
    }

    if (chartData && !isLoading) {
      return (
        <div>
          <OurChartVXContainer isLoading={isLoading} isDarkMode={isDarkMode} earliestDate={earliestDate} handleFromDateChange={handleFromDateChange} handleToDateChange={handleToDateChange} isEth2DepositContract={isEth2DepositContract} genesisProgress={genesisProgress} timebox={timebox} timeboxTimestamp={timeboxTimestamp} enableCurveStepAfter={enableCurveStepAfter} isChartLoading={isChartLoading} chartCurrency={chartCurrency} isConsideredMobile={isConsideredMobile} margin={margin} chartData={chartData} chartTitle={chartTitle} chartSubtitle={chartSubtitle}>
            {children}
          </OurChartVXContainer>
        </div>
      );
    }else{
      return <div>
        <OurChartVXContainer isLoading={isLoading} isDarkMode={isDarkMode} enableCurveStepAfter={enableCurveStepAfter} isChartLoading={isChartLoading} chartCurrency={chartCurrency} isConsideredMobile={isConsideredMobile} margin={margin}>
          {children}
        </OurChartVXContainer>
      </div>
    }
  }
}

OurChart.propTypes = {
classes: PropTypes.object.isRequired,
theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(OurChart);
