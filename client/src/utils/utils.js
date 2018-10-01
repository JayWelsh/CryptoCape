import numeral from 'numeral';

export const priceFormat = (number) => {
    let format = '$0,0.00';
    return numeral(number).format(format);
}

export const numberFormat = (number) => {
    let format = '0,0.00';
    return numeral(number).format(format);
}