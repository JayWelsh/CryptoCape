import numeral from 'numeral';
import { createBrowserHistory, createHashHistory } from 'history';
import BigNumber from 'bignumber.js';

BigNumber.config({ EXPONENTIAL_AT: 100 });

export const priceFormat = (number, decimals = 2, currency = "$", prefix = true) => {
    let decimalString = "";
    for(let i = 0; i < decimals; i++){
        decimalString += "0";
    }
    if (currency.length > 1) {
        prefix = false;
    }
    let format = '0,0.' + decimalString;
    if (prefix) {
        return currency + numeral(number).format(format);
    } else {
        return numeral(number).format(format) + " " + currency;
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

export const subtractNumbers = (value1, value2) => BigNumber(value1).minus(BigNumber(value2)).toString();

export const addNumbers = (value1, value2) => BigNumber(value1).plus(BigNumber(value2)).toString();

export const multiplyNumbers = (value1, value2) => BigNumber(value1).multipliedBy(BigNumber(value2)).toString();

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

export function rangeToHours(range){
    switch(range){
        case '1HR': {
            return 1;
        }
        case '24HR': {
            return 2;
        }
        case '1W': {
            return 168
        }
        case '1M': {
            return 730
        }
        case '3M': {
            return 2190
        }
        case '6M': {
            return 4380
        }
        case '1Y': {
            return 8760
        }
        default: {
            return false
        }
      }
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