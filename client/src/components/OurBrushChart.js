import React, { useState, useMemo, useEffect } from 'react';
import { scaleTime, scaleLinear } from '@vx/scale';
import appleStock from '@vx/mock-data/lib/mocks/appleStock';
import { withParentSize } from '@vx/responsive';
import { Brush } from '@vx/brush';
import { Bounds } from '@vx/brush/lib/types';
import { PatternLines } from '@vx/pattern';
import { LinearGradient } from '@vx/gradient';
import { max, extent } from 'd3-array';
import { curveStepAfter, curveLinear } from '@vx/curve';
import { LinePath, AreaClosed } from '@vx/shape';
import moment from 'moment';

import { debounce } from '../utils';
import AreaChart from './OurAreaChart';

const x = dataObject => new Date(dataObject.date);
const y = dataObject => dataObject.price;

// Initialize some variables
const stock = appleStock.slice(1000);
const brushMargin = { top: 0, bottom: 0, left: 10, right: 10 };
const chartSeparation = 0;
const PATTERN_ID = 'brush_pattern';
const GRADIENT_ID = 'brush_gradient';
export const accentColor = '#4682b452';
export const background = '#3f51b5';
export const background2 = '#3f51b5';
const selectedBrushStyle = {
  fill: `#4682b42e`,
  stroke: 'white',
  strokeWidth: 1,
};

// accessors
const getDate = (d) => new Date(d.date);
const getStockValue = (d) => d.price * 1;

const BrushChart = ({
  compact = false,
  parentWidth,
  height,
  margin = {
    top: 0,
    left: 50,
    bottom: 0,
    right: 20,
  },
  chartData,
  setPrices,
  enableCurveStepAfter,
  setHideTooltipTimestamp,
  timebox = JSON.stringify({
    fromDate: moment().startOf('day').subtract(1, 'month'),
    toDate: moment().format('YYYY-MM-DD')
  }),
  timeboxTimestamp,
  handleFromDateChange,
  handleToDateChange,
  setToDate,
  setFromDate,
  setFromDateInputFieldValue,
  setToDateInputFieldValue,
  setUseTimebox,
  isConsideredMobile,
}) => {
  const [lastTimeboxTimestamp, setLastTimeboxTimestamp] = useState();
  
  const onBrushChange = (domain) => {
    if (!domain) return;
    const { x0, x1, y0, y1 } = domain;
    let stockCopy = chartData.filter((s, index) => {
      const x = s.date.unix() * 1000;
      const y = s.price * 1;
      return x > x0 && x < x1 && y > y0 && y < y1;
    });
    if(stockCopy && stockCopy.length > 0) {
      setUseTimebox(JSON.stringify({
        fromDate: moment(new Date(stockCopy[0].date)).format("YYYY-MM-DD"),
        toDate: moment(new Date(stockCopy[stockCopy.length - 1].date)).format("YYYY-MM-DD")
      }));
      setFromDate(moment(new Date(stockCopy[0].date)).format("YYYY-MM-DD"));
      setToDate(moment(new Date(stockCopy[stockCopy.length - 1].date)).format("YYYY-MM-DD"));
    }
    stockCopy = stockCopy.filter((item, index) => {
      if(stockCopy.length < 2000 || ((index % 20 === 0) || (index === stockCopy.length - 1))) {
        return true
      }
      return false;
    })
    setPrices(stockCopy);
    setHideTooltipTimestamp(new Date().getTime());
  };

  const innerHeight = height - margin.top - margin.bottom;
  const topChartBottomMargin = 0;
  const topChartHeight = 0;
  const bottomChartHeight = height;

  // bounds
  const xMax = Math.max(parentWidth - margin.left - margin.right, 0);
  const yMax = Math.max(topChartHeight, 0);
  const xBrushMax = Math.max(parentWidth - brushMargin.left - brushMargin.right, 0);
  const yBrushMax = Math.max(bottomChartHeight - brushMargin.top - brushMargin.bottom, 0);

  // scales
  const brushDateScale = useMemo(
    () =>
      scaleTime({
        range: [0, xBrushMax],
        domain: extent(chartData, getDate),
      }),
    [xBrushMax, chartData],
  );
  const brushStockScale = useMemo(
    () =>
      scaleLinear({
        range: [yBrushMax, 0],
        domain: [0, max(chartData, getStockValue) || 0],
        nice: true,
      }),
    [yBrushMax, chartData],
  );

  const initialBrushPosition = useMemo(
    () => {
      let useChartData = chartData;
      if(timebox && (timeboxTimestamp !== lastTimeboxTimestamp)) {
        let parsedTimebox = JSON.parse(timebox);
        useChartData = useChartData.filter((item, index) => {
          return moment(item.date).isSameOrAfter(moment(parsedTimebox.fromDate).startOf('day')) && moment(item.date).isSameOrBefore(moment(parsedTimebox.toDate).endOf('day'));
        });
        setLastTimeboxTimestamp(timeboxTimestamp);
      }
      useChartData = useChartData.filter((item, index) => {
        if(useChartData.length < 2000 || ((index % 20 === 0) || (index === useChartData.length - 1))) {
          return true
        }
        return false;
      })
      setHideTooltipTimestamp(new Date().getTime());
      setPrices(useChartData);
      return {
        start: { x: brushDateScale(getDate(useChartData[0])) },
        end: { x: brushDateScale(getDate(useChartData[useChartData.length - 1])) },
      }
    },
    [brushDateScale, chartData, timebox, timeboxTimestamp],
  );
  
  return (
    <div>
      <svg width={parentWidth} height={height}>
        <rect x={0} y={0} width={parentWidth} height={height} fill={`url(#${GRADIENT_ID})`} rx={14} />
        <PatternLines
            id="dLines"
            height={6}
            width={6}
            stroke="#010a28"
            strokeWidth={1}
            orientation={['diagonal']}
            fromOpacity={1}
            toOpacity={0}
        />
        <AreaChart
          hideBottomAxis
          hideLeftAxis
          data={chartData}
          width={parentWidth}
          yMax={yBrushMax}
          xScale={brushDateScale}
          yScale={brushStockScale}
          margin={brushMargin}
          top={topChartHeight + topChartBottomMargin + margin.top}
          gradientColor={background2}
          enableCurveStepAfter={enableCurveStepAfter}
        >
          <LinePath
            curve={enableCurveStepAfter ? curveStepAfter : curveLinear}
            strokeWidth={1}
            stroke={"#4682b4"}
            data={chartData}
            x={d => brushDateScale(x(d))}
            y={d => brushStockScale(y(d))}
          />
          <PatternLines
            id={PATTERN_ID}
            height={6}
            width={6}
            stroke={accentColor}
            strokeWidth={1}
            orientation={['diagonal']}
            fromOpacity={1}
            toOpacity={0}
          />
          <Brush
            key={timeboxTimestamp}
            xScale={brushDateScale}
            yScale={brushStockScale}
            width={xBrushMax}
            height={yBrushMax}
            margin={brushMargin}
            handleSize={32}
            resizeTriggerAreas={['left', 'right']}
            brushDirection="horizontal"
            initialBrushPosition={initialBrushPosition}
            onChange={(chartData && chartData.length > 5000) ? debounce(onBrushChange, 150) : onBrushChange}
            selectedBoxStyle={selectedBrushStyle}
          />
        </AreaChart>
      </svg>
    </div>
  );
}

export default withParentSize(BrushChart);
