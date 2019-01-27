import numeral from 'numeral';
import { createBrowserHistory, createHashHistory } from 'history';

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