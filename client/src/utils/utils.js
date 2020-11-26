import numeral from 'numeral';
import { createBrowserHistory, createHashHistory } from 'history';
import BigNumber from 'bignumber.js';
import moment from 'moment';

BigNumber.config({ EXPONENTIAL_AT: 100 });

const getDynamicFormat = (currentFormat = '0,0.00', number) => {
    let requestedDecimals;
    let preDecimalFormat;
    let postDecimalFormat;
    if(currentFormat.split(".").length > 0) {
        requestedDecimals = currentFormat.split(".")[1].length;
        postDecimalFormat = currentFormat.split(".")[1];
        preDecimalFormat = currentFormat.split(".")[0];
    }
    let currentFormattedNumber = numeral(number).format(currentFormat).toString();
    let currentFormattedDecimals = '';
    if(currentFormattedNumber.split('.') && currentFormattedNumber.split('.')[1]) {
        currentFormattedDecimals = currentFormattedNumber.split('.')[1];
    }
    let currentUnformattedDecimals = '';
    if(number.toString().split(".").length > 0 && number.toString().split(".")[1]) {
        currentUnformattedDecimals = number.toString().split(".")[1];
    }
    let dynamicFormat = currentFormat;
    if((currentFormattedDecimals.replace(/[^1-9]/g,"").length < requestedDecimals) && (currentUnformattedDecimals.replace(/[^1-9]/g,"").length >= requestedDecimals)) {
        let indexOfSignificantFigureAchievement;
        let significantFiguresEncountered = 0;
        let numberString = number.toString();
        let numberStringPostDecimal = "";
        if(numberString.split(".").length > 0) {
            numberStringPostDecimal = numberString.split(".")[1]
        }
        for(let i = 0; i < numberStringPostDecimal.length; i++) {
            if((numberStringPostDecimal[i] * 1) > 0) {
                significantFiguresEncountered++;
                if(significantFiguresEncountered === requestedDecimals) {
                    indexOfSignificantFigureAchievement = i + 1;
                }
            }
        }
        if(indexOfSignificantFigureAchievement > requestedDecimals) {
            let requestedDecimalsToSignificantFiguresDelta = indexOfSignificantFigureAchievement - requestedDecimals;
            dynamicFormat = preDecimalFormat + ".";
            if(postDecimalFormat) {
                dynamicFormat = preDecimalFormat + "." + postDecimalFormat;
            }
            for(let i = 0; i < requestedDecimalsToSignificantFiguresDelta; i++) {
                dynamicFormat = dynamicFormat + "0";
            }
        }
    }
    return dynamicFormat;
}

export const priceFormat = (number, decimals = 2, currency = "$", prefix = true) => {
    let decimalString = "";
    for(let i = 0; i < decimals; i++){
        decimalString += "0";
    }
    if (currency.length > 1) {
        prefix = false;
    }
    let format = '0,0.' + decimalString;
    if(number < 10) {
        format = getDynamicFormat(format, number);
    }
    if (prefix) {
        return `${currency}${'\u00A0'}`+ numeral(number).format(format);
    } else {
        return numeral(number).format(format) + `${'\u00A0'}${currency}`
    }
}

export const weiToEther = (wei) => {
	if(typeof wei === "string"){
		return BigNumber(wei).dividedBy('1e18').toString();
	}else{
		return BigNumber(wei.toString()).dividedBy('1e18').toString();
	}
}

export const tokenBalanceFromDecimals = (value, decimals = 18) => {
    if(typeof value === "string"){
		return BigNumber(value).dividedBy(`1e${decimals}`).toString();
	}else{
		return BigNumber(value.toString()).dividedBy(`1e${decimals}`).toString();
	}
}

export const tokenInflatedBalanceFromDecimals = (value, decimals = 18) => {
    if(typeof value === "string"){
		return BigNumber(value).multipliedBy(`1e${decimals}`).toString();
	}else{
		return BigNumber(value.toString()).multipliedBy(`1e${decimals}`).toString();
	}
}

export const subtractNumbers = (value1, value2) => BigNumber(value1).minus(BigNumber(value2)).toString();

export const addNumbers = (value1, value2) => BigNumber(value1).plus(BigNumber(value2)).toString();

export const multiplyNumbers = (value1, value2) => BigNumber(value1).multipliedBy(BigNumber(value2)).toString();

export const divideNumbers = (value1, value2) => BigNumber(value1).dividedBy(BigNumber(value2)).toString();

// Credit for percToColour: https://gist.github.com/mlocati/7210513
export const percToColor = (perc) => {
	if(perc > 100){
		perc = 100;
	}
	let r, g, b = 0;
	if(perc < 50) {
		r = 255;
		g = Math.round(5.1 * perc);
	}
	else {
		g = 255;
		r = Math.round(510 - 5.10 * perc);
	}
	let h = r * 0x10000 + g * 0x100 + b * 0x1;
	return '#' + ('000000' + h.toString(16)).slice(-6);
}

export const tokenValueFormat = (value, decimals = 2) => {
	//Rounds down - I think it is better to under represent this value than to over represent it
	return BigNumber(value).toFixed(decimals, 1).toString();
}

export const tokenValueFormatDisplay = (value, decimals = 2, currency = false, prepend = false, adaptiveDecimals = false) => {
    if(adaptiveDecimals) {
        let detectAdaptiveValue = value < 0 ? value * -1 : value * 1;
        if((detectAdaptiveValue < 0.1) && (decimals >= 2)) {
            decimals = 3;
        }
    }
	if(currency) {
        if(prepend){
            return `${currency}${'\u00A0'}` + new BigNumber(tokenValueFormat(value, decimals)).toFormat(decimals);
        }
		return new BigNumber(tokenValueFormat(value, decimals)).toFormat(decimals) + `${'\u00A0'}${currency}`;
	}
	return new BigNumber(tokenValueFormat(value, decimals)).toFormat(decimals);
}

export const isPrefixWWW = () => {
  if(window.location.href.indexOf("www.") > -1) {
    return true
  }else{
    return false;
  }
}

export function rangeToTimebox(range, earliestDate){
    let fromDate;
    switch(range){
        case '24HR': {
            fromDate = moment().startOf('day').subtract(1, 'day').format('YYYY-MM-DD');
            break;
        }
        case '1W': {
            fromDate = moment().startOf('day').subtract(1, 'week').format('YYYY-MM-DD');
            break;
        }
        case '1M': {
            fromDate = moment().startOf('day').subtract(1, 'month').format('YYYY-MM-DD');
            break;
        }
        case '3M': {
            fromDate = moment().startOf('day').subtract(3, 'month').format('YYYY-MM-DD');
            break;
        }
        case '6M': {
            fromDate = moment().startOf('day').subtract(6, 'month').format('YYYY-MM-DD');
            break;
        }
        case '1Y': {
            fromDate = moment().startOf('day').subtract(1, 'year').format('YYYY-MM-DD');
            break;
        }
        default: {
            fromDate = moment(earliestDate).startOf('day').format('YYYY-MM-DD');
            break;
        }
      }
    return JSON.stringify({
        fromDate,
        toDate: moment().format('YYYY-MM-DD')
    })
}

export function configureHistory() {
    return window.matchMedia('(display-mode: standalone)').matches
        ? createHashHistory()
        : createBrowserHistory()
}

export const numberFormat = (number) => {
    let format = '0,0.00';
    return numeral(number).format(format);
}

export const debounce = (func, wait, immediate) => {
    // 'private' variable for instance
    // The returned function will be able to reference this due to closure.
    // Each call to the returned function will share this common timer.
    let timeout;
  
    // Calling debounce returns a new anonymous function
    return function() {
      // reference the context and args for the setTimeout function
      let context = this,
        args = arguments;
  
      // Should the function be called now? If immediate is true
      //   and not already in a timeout then the answer is: Yes
      let callNow = immediate && !timeout;
  
      // This is the basic debounce behaviour where you can call this 
      //   function several times, but it will only execute once 
      //   [before or after imposing a delay]. 
      //   Each time the returned function is called, the timer starts over.
      clearTimeout(timeout);
  
      // Set the new timeout
      timeout = setTimeout(function() {
  
        // Inside the timeout function, clear the timeout variable
        // which will let the next execution run when in 'immediate' mode
        timeout = null;
  
        // Check if the function already ran with the immediate flag
        if (!immediate) {
          // Call the original function with apply
          // apply lets you define the 'this' object as well as the arguments 
          //    (both captured before setTimeout)
          func.apply(context, args);
        }
      }, wait);
  
      // Immediate mode and no wait timer? Execute the function..
      if (callNow) func.apply(context, args);
    }
  }