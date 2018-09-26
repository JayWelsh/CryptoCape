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
import Highcharts from 'highcharts/highstock'; //Actually highstock but following standards from their demo
import HighchartsReact from 'highcharts-react-official';
import { Query } from "react-apollo";
import moment from 'moment';
import OurChartVXContainer from './OurChartVXContainer';
import gql from "graphql-tag";

// Load Highcharts modules
require('highcharts/indicators/indicators')(Highcharts)
require('highcharts/indicators/pivot-points')(Highcharts)
require('highcharts/indicators/macd')(Highcharts)
require('highcharts/modules/exporting')(Highcharts)
require('highcharts/modules/map')(Highcharts)

const testData = require("../demo-data/ethereumHistoryHighcharts.json");

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
  state = {

  };

  componentDidMount() {
    window.addEventListener("reRenderCharts", this.reRenderCharts);
  }

  componentWillUnmount() {
    window.removeEventListener("reRenderCharts", this.reRenderCharts);
  }


  reRenderCharts = (event) => {
    let thisPersist = this;
    thisPersist.setState({ key: Math.random() });
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
    const { classes, theme, chartLink, isConsideredMobile } = this.props;
    console.log("chartLink",chartLink);
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
    return (
      <div key={this.state.key} className={classes.cardPositioning}>
        <Query
                variables={{chartLink}}
                query={GET_CHART_DATA}
              >
                {({ loading, error, data }) => {
                  console.log("data", data);
                  if (loading) return <p>Loading...</p>;
                  if (error) return <p>Error :(</p>;
                  let cryptocurrenyName = 'Currency ';
                  if(data.cryptocurrencies && data.cryptocurrencies.length == 1){
                    cryptocurrenyName = data.cryptocurrencies[0].name;
                  }
                  let seriesData = data.cryptocurrencies.map(this.refactorTimeseriesData);

                  return <OurChartVXContainer isConsideredMobile={isConsideredMobile} margin={margin} chartData={seriesData[0].data} chartTitle={seriesData[0].name} chartSubtitle={seriesData[0].abbreviation}/>

                }}
              </Query>
      </div>
    );
  }
}

OurChart.propTypes = {
classes: PropTypes.object.isRequired,
theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(OurChart);
