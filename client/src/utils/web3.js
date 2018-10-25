import Web3 from 'web3';

const web3Client = new Web3(Web3.givenProvider || "wss://localhost:8546");

export function isValidAddress(address){
    return web3Client.utils.isAddress(address);
};