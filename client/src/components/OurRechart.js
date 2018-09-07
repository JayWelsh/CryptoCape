import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import moment from 'moment';
import {
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const testData = require("../demo-data/ethereumHistoryRecharts.json");

const data = [
    {name: 'Page A', uv: 4000, pv: 2400, amt: 2400},
    {name: 'Page B', uv: 3000, pv: 1398, amt: 2210},
    {name: 'Page C', uv: 2000, pv: 9800, amt: 2290},
    {name: 'Page D', uv: 2780, pv: 3908, amt: 2000},
    {name: 'Page E', uv: 1890, pv: 4800, amt: 2181},
    {name: 'Page F', uv: 2390, pv: 3800, amt: 2500},
    {name: 'Page G', uv: 3490, pv: 4300, amt: 2100},
];

const testEthData = [{
    "time": 1438905600000,
    "value": 3.00
},
{
    "time": 1438992000000,
    "value": 1.20
},
{
    "time": 1439078400000,
    "value": 1.20
}];

const styles = {
  cardPositioning: {
    display: 'inline-block',
    left: '50%',
    position: 'relative',
    transform: 'translateX(-50%)',
    width: '100%'
  }
};

class OurRechart extends React.Component {
state = {
  //TODO
};

componentDidMount() {
  
}

render() {
  //TODO Props
  const { classes, theme, chartData } = this.props;

  return (
          <ResponsiveContainer width='100%' height={500} >
              <AreaChart width={600} height={400} data={testData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area type='monotone' dataKey='value' stroke='#8884d8' fill='#8884d8' />
              </AreaChart>
          </ResponsiveContainer>
  );
}
}

OurRechart.propTypes = {
    chartData: PropTypes.arrayOf(
        PropTypes.shape({
          time: PropTypes.number,
          value: PropTypes.number
        })
      ).isRequired,
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(OurRechart);
