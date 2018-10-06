import numeral from 'numeral';

export const priceFormat = (number, decimals = 2) => {
    let decimalString = "";
    for(let i = 0; i < 2; i++){
        decimalString += "0";
    }
    let format = '$0,0.' + decimalString;
    return numeral(number).format(format);
}

export const numberFormat = (number) => {
    let format = '0,0.00';
    return numeral(number).format(format);
}