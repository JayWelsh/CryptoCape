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
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsTheme from 'highcharts/themes/dark-unica';
import { Query } from "react-apollo";
import gql from "graphql-tag";

// Load Highcharts modules
require('highcharts/indicators/indicators')(Highcharts)
require('highcharts/indicators/pivot-points')(Highcharts)
require('highcharts/indicators/macd')(Highcharts)
require('highcharts/modules/exporting')(Highcharts)
require('highcharts/modules/map')(Highcharts)
HighchartsTheme(Highcharts)

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

let pageRerenderPreventDoubleFire;
let chartRedispatchEventRerenderDelay;
let isAnimating = false;

class OurPieChart extends React.Component {
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
    const { classes, theme, stockOptions } = this.props;

    return (
        <div key={this.state.key} className={classes.cardPositioning}>
            <HighchartsReact
                highcharts={Highcharts}
                constructorType={'chart'}
                options={stockOptions}
            />
        </div>
    );
  }
}

OurPieChart.propTypes = {
classes: PropTypes.object.isRequired,
theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(OurPieChart);
