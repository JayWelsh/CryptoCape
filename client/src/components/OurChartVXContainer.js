import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import { ParentSize } from "@vx/responsive";
import { LinearGradient } from '@vx/gradient';
import OurChartVX from './OurChartVX';
import { priceFormat } from '../utils';

const styles = theme => ({
    outerContainer: {
        display: 'flex',
        position: 'relative',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        width: '100%'
    },
    center: {
        flexDirection: 'column',
        display: 'flex',
        position: 'relative',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
    },
    innerContainer: {
        flex: 1,
        display:'flex'
    },
    chart: {
        flexDirection: 'column',
        display:'flex',
        backgroundColor: '#000628',
        color: 'white',
        borderRadius: '8px',
        width: '100%'
    },
    vxChartTitle: {
        color: 'white'
    },
    disclaimer: {
        color: 'black',
        opacity: 0.6
    },
    spacer: {
        flex: 1
    },
    titleBar: {
        display: 'flex',
        flexDirection:'row',
        alignItems: 'center',
        padding: '15px',
    },
    leftTitles: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
    },
    rightTitles: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end'
    },
    vxPriceIncrease: {
        color: 'limegreen'
    },
    vxPriceDecrease: {
        color: 'red'
    }
});

function Background({width, height}) {
    return (
        <svg width={width} height={height}>
            <LinearGradient id="fill" vertical={false}>
                <stop stopColor="#2d0056" offset="0%" />
                <stop stopColor="#3f51b5" offset="100%" />
            </LinearGradient>
            <rect
                width={width}
                height={height}
                fill="url(#fill)"
            />
        </svg>
    );
}

class OurChartVXContainer extends React.Component {
    constructor(props) {
        super(props);
    }

    state = {
        //TODO
    };

    render() {
        const { classes, theme, margin, chartTitle, chartSubtitle, isConsideredMobile, chartData } = this.props;
        let currentPrice = 0;
        let diffPrice = 0;
        let hasIncreased = true;
        let prices = [];
        
        if (chartData && chartData.length  > 0) {
            prices = Object.keys(chartData).map(key => {
                return {
                    date: chartData[key].date,
                    price: chartData[key].price
                };
            })
            let firstPrice = prices[0].price;
            currentPrice = prices[prices.length - 1].price;
            diffPrice = currentPrice - firstPrice;
            hasIncreased = diffPrice > 0;
        }
        return (
            <div className={classes.outerContainer}>
                <div className={classes.center}>
                    <div className={classes.chart + " elevation-shadow-two"} style={{ width: '100%', height: '500px' }}>
                        <div className={classes.titleBar}>
                            <div className={classes.leftTitles}>
                                <div>
                                    <Typography className={classes.vxChartTitle + " no-padding-bottom"} variant="headline" component="h2">
                                        {chartTitle}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography className={classes.vxChartTitle + " no-padding-top"} component="p">
                                        {chartSubtitle}
                                    </Typography>
                                </div>
                            </div>
                            <div className={classes.spacer}/>
                            <div className={classes.rightTitles}>
                                <div>
                                    <Typography className={classes.vxChartTitle + " no-padding-bottom"} variant="headline" component="h2">
                                        {priceFormat(currentPrice)}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography className={classes.vxChartTitle + " no-padding-top " + (hasIncreased ? classes.vxPriceIncrease : classes.vxPriceDecrease)} component="p">
                                        {hasIncreased ? ("+ " + priceFormat(diffPrice)) : ("- " + priceFormat((diffPrice * -1)))}
                                    </Typography>
                                </div>
                            </div>
                        </div>
                        <div className={classes.innerContainer}>
                            <OurChartVX isConsideredMobile={isConsideredMobile} margin={margin} data={prices} />
                        </div>
                    </div>
                </div>
                {/* <Typography className={classes.disclaimer} gutterBottom component="p">
                    {chartData.disclaimer}
                </Typography> */}
            </div>
        )
    }
}

OurChartVXContainer.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
    margin: PropTypes.object.isRequired
};
    
export default withStyles(styles, { withTheme: true })(OurChartVXContainer);