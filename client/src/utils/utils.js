import numeral from 'numeral';

export const priceFormat = (number, decimals = 2, currency = "$", prefix = true) => {
    let decimalString = "";
    for(let i = 0; i < 2; i++){
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

export const numberFormat = (number) => {
    let format = '0,0.00';
    return numeral(number).format(format);
}