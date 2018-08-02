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
    maxWidth: '1500px'
  }
};

const stockOptions = {
  chart: {
    type: 'area',
    height: '500px'
  },
  legend: {
    enabled: true
  },
  title: {
    text: 'Ethereum Performance'
  },
  series: [{
    data: testData,
    name: "Ethereum / USD"
  }],
  colors: [
    '#3f51b5'
  ],
  tooltip: {
    animation: false,
    pointFormat: '{series.name}: <b>{point.y:.2f} USD</b>',
  },
  title: {
    text: 'Ethereum Portfolio Performance'
  },
  plotOptions: {
    series: {
      animation: 500,
      events: {
        afterAnimate: function (e) {
          isAnimating = false;
        }
      },
    }
  }
}

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

  render() {
    const { classes, theme } = this.props;
    return (
      <div key={this.state.key} className={classes.cardPositioning}>
        <HighchartsReact
          highcharts={Highcharts}
          constructorType={'stockChart'}
          options={stockOptions}
        />
      </div>
    );
  }
}

OurChart.propTypes = {
classes: PropTypes.object.isRequired,
theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(OurChart);
