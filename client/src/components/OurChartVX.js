import React from 'react';
import { withParentSize } from '@vx/responsive'
import { scaleTime, scaleLinear } from '@vx/scale';
import { LinePath, AreaClosed, Bar, Line } from '@vx/shape';
import { LinearGradient } from '@vx/gradient';
import { PatternLines } from '@vx/pattern';
import { withTooltip, Tooltip } from '@vx/tooltip';
import {localPoint} from '@vx/event';
import OurMaxPriceVX from './OurMaxPriceVX';
import OurMinPriceVX from './OurMinPriceVX';
import { AxisBottom } from '@vx/axis';
import { bisector } from 'd3-array';
import { timeFormat } from 'd3-time-format';
import { priceFormat } from '../utils';

const bisectDate = bisector(d => x(d)).left
const x = dataObject => new Date(dataObject.date);
const y = dataObject => dataObject.price;
class OurChartVX extends React.Component {
    constructor(props) {
        super(props);
        this.handleTooltip = this.handleTooltip.bind(this);
        this.state = {
            shiftTooltipLeft: false,
            shiftTooltipRight: false
        }
    }
    handleTooltip({ event, data, x, xScale, yScale }) {
        const { showTooltip } = this.props;
        const { x: xPoint } = localPoint(this.svg, event);
        const x0 = xScale.invert(xPoint);
        const index = bisectDate(data, x0, 1);
        const d0 = data[index - 1];
        const d1 = data[index];
        const d = x0 - xScale(x(d0)) > xScale(x(d1)) - x0 ? d1 : d0;
        const totalGraphWidth = xScale(x(data[data.length - 1]));
        let tooltipLeft = xScale(x(d));
        if((totalGraphWidth - tooltipLeft) < 100){
            this.setState({shiftTooltipLeft: true});
        }else{
            this.setState({shiftTooltipLeft: false});
        }
        if(tooltipLeft < 100){
            this.setState({shiftTooltipRight: true});
        }else{
            this.setState({shiftTooltipRight: false});
        }
        showTooltip({
            tooltipLeft: tooltipLeft,
            tooltipTop: yScale(y(d)),
            tooltipData: d
        });
      }
    render() {
        const { data, parentWidth, parentHeight, margin, tooltipLeft, tooltipTop, tooltipData, showTooltip, hideTooltip, isConsideredMobile, chartCurrency} = this.props;
        const {shiftTooltipLeft, shiftTooltipRight} = this.state;

        const width = parentWidth - margin.left - margin.right;
        const height = parentHeight - margin.top - margin.bottom;
        const tooltipAnimation = 'transform 0.4s ease';

        let tooltipPriceTranslate = 'translateX(0%)';
        let tooltipDateTranslate = 'translateX(-50%)';
        
        if(shiftTooltipLeft) {
            tooltipPriceTranslate = 'translateX(calc(-100% - 25px))';
            tooltipDateTranslate = 'translateX(-100%)';
        } else if (shiftTooltipRight) {
            tooltipDateTranslate = 'translateX(0%)';
        }

    
        if (data.length > 0) {
        
            const xAxisTickFunction = (val, i) => ({ fontSize: 14, fill: 'white' })

            const xAxisTickFormat = (val, i) => formatDateTimeTicker(val);

            const firstPointX = data[0];
            const currentPointX = data[data.length - 1];

            const maxPrice = Math.max(...data.map(y));
            const minPrice = Math.min(...data.map(y));

            const maxTime = Math.max(...data.map(x));
            const minTime = Math.min(...data.map(x));

            let formatDateTimeTooltip = timeFormat("%d %b %Y")
            
            let formatDateTimeTicker = timeFormat("%b %Y")

            const numTicks = isConsideredMobile ? 3 : null

            const maxPricesData = [
                {
                    date: x(firstPointX),
                    price: maxPrice
                }, {
                    date: x(currentPointX),
                    price: maxPrice
                }
            ]

            const minPricesData = [
                {
                    date: x(firstPointX),
                    price: minPrice
                }, {
                    date: x(currentPointX),
                    price: minPrice
                }
            ]

            const xScale = scaleTime({
                range: [0, width],
                domain: [minTime, maxTime]
            });

            const yScale = scaleLinear({
                range: [height, 0],
                domain: [minPrice, maxPrice]
            });

            const maxTooltipTop = yScale(minPrice)
            const setTooltipLabelTop = ((maxTooltipTop - tooltipTop) > 20) ? tooltipTop - 12 : maxTooltipTop - 32;

            return (
                <div>
                    <svg ref={s => (this.svg = s)} width={width} height={height + 30}>
                        <AxisBottom
                            tickLabelProps={xAxisTickFunction}
                            tickFormat={xAxisTickFormat}
                            top={yScale(minPrice)}
                            data={data}
                            scale={xScale}
                            x={x}
                            hideAxisLine
                            hideTicks
                            numTicks={numTicks}
                        />
                        <LinearGradient id='area-fill' from="#3f51b5" to="#3f51b5" fromOpacity={1} toOpacity={0} />
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
                        
                        <AreaClosed
                            data={data}
                            yScale={yScale}
                            xScale={xScale}
                            x={x}
                            y={y}
                            fill="url(#area-fill)"
                            stroke="transparent" />
                        <AreaClosed
                            stroke="transparent"
                            data={data}
                            yScale={yScale}
                            xScale={xScale}
                            x={x}
                            y={y}
                            fill="url(#dLines)"
                        />
                        <LinePath data={data} yScale={yScale} xScale={xScale} x={x} y={y} />
                        <OurMaxPriceVX
                            data={maxPricesData}
                            yScale={yScale}
                            xScale={xScale}
                            x={x}
                            y={y}
                            label={priceFormat(maxPrice , 2, chartCurrency)}
                            yText={yScale(maxPrice)}
                        />
                        <OurMinPriceVX
                            data={minPricesData}
                            yScale={yScale}
                            xScale={xScale}
                            x={x}
                            y={y}
                            label={priceFormat(minPrice, 2, chartCurrency)}
                            yText={yScale(minPrice)}
                        />
                        <Bar
                            data={data}
                            width={width}
                            height={height}
                            fill="transparent"
                            onMouseMove={data => event => {
                                this.handleTooltip({
                                    event,
                                    data,
                                    x,
                                    xScale,
                                    yScale,
                                  })
                            }}
                            onTouchStart={data => event =>
                                this.handleTooltip({
                                  event,
                                  data,
                                  x,
                                  xScale,
                                  yScale,
                                })}
                              onTouchMove={data => event =>
                                this.handleTooltip({
                                  event,
                                  data,
                                  x,
                                  xScale,
                                  yScale,
                                })}
                            onMouseLeave={data => event => hideTooltip()}
                            onTouchEnd={data => event => hideTooltip()}
                        />
                        {tooltipData && <g>
                            <Line
                                from={{x: tooltipLeft, y: yScale(y(maxPricesData[0]))}}
                                to={{x: tooltipLeft, y: yScale(y(minPricesData[0]))}}
                                stroke="steelblue"
                                strokeDasharray="3,3"
                                style={{pointerEvents: 'none'}}
                            />
                            <circle
                                r="8"
                                cx={tooltipLeft}
                                cy={tooltipTop}
                                fill="#c6ffbc"
                                fillOpacity={0.4}
                                style={{pointerEvents: 'none'}}
                            />
                            <circle
                                r="4"
                                cx={tooltipLeft}
                                cy={tooltipTop}
                                fill="#c6ffbc"
                                style={{pointerEvents: 'none'}}
                            />
                        </g>}
                    </svg>
                    {tooltipData &&
                            <div>
                            <Tooltip top={setTooltipLabelTop} left={tooltipLeft + 12} style={{backgroundColor: '#2d0056', color: '#FFFFFF', pointerEvents: 'none', transform: tooltipPriceTranslate, transition: tooltipAnimation, whiteSpace: 'pre'}}>
                                <b>{priceFormat(y(tooltipData), 2, chartCurrency)}</b>
                            </Tooltip>
                            <Tooltip top={yScale(minPrice)} left={tooltipLeft} style={{backgroundColor: '#2d0056', color: '#FFFFFF', transform: tooltipDateTranslate, pointerEvents: 'none', display: 'table', transition: tooltipAnimation, whiteSpace: 'pre'}}>
                                <b>{formatDateTimeTooltip(x(tooltipData))}</b>
                            </Tooltip>
                            </div>
                        }
                </div>
            );
        } else {
            return (
                <div width={width} height={parentHeight}>

                </div>
            )
        }
    }
}

export default withParentSize(withTooltip(OurChartVX));