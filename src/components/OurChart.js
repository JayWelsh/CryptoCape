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

const options = {
  chart: {
    events: {

    },
    type: 'area'
  },
  title: {
    text: 'Ethereum Portfolio Performance'
  },
  series: [{
    data: testData
  }],
  colors: [
    '#3f51b5'
  ],
  tooltip: {
    animation: false
  },
  xAxis: {
    type: 'datetime'
  },
  plotOptions: {
    series: {
      animation: 500,
      events: {
        afterAnimate: function(e){
          isAnimating = false;
        }
      }
    }
  }
}

let pageRerenderPreventDoubleFire;
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
    if (isAnimating == false) {
      let thisPersist = this;
      if (pageRerenderPreventDoubleFire) {
        clearTimeout(pageRerenderPreventDoubleFire);
      }

      pageRerenderPreventDoubleFire = setTimeout(function () {
        isAnimating = true;
        thisPersist.setState({ key: Math.random() });
      }, 250);
    }else{
      this.reRenderCharts
    }
  }

  render() {
    //TODO Props
    const { classes, theme } = this.props;
    return (
      <div key={this.state.key} className={classes.cardPositioning}>
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
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
