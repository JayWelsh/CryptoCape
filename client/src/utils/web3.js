export function isValidAddress(address){
    const isAddress = function (address) {
        // check if it has the basic requirements of an address
        if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
            return false;
            // If it's ALL lowercase or ALL upppercase
        } else if (/^(0x|0X)?[0-9a-fA-F]{40}$/.test(address)) {
            return true;
        }
    };
    return isAddress(address);
};