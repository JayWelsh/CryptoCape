import * as Sequelize from 'sequelize';

import * as pLimit from 'p-limit';

import * as request from 'request-promise';

import {config} from './config';

import * as process from 'process';

const promiseLimit = pLimit(1);

const dbName = process.env[config.cryptocape_db_name];
const dbUsername = process.env[config.cryptocape_db_username];
const dbPassword = process.env[config.cryptocape_db_password];

const Conn = new Sequelize(
    dbName,
    dbUsername,
    dbPassword,
    {
        dialect: "mysql",
        host: "localhost"
    }
);

const Cryptocurrency = Conn.define('cryptocurrency', {
    abbreviation: {
        type: Sequelize.STRING,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    externalLink: {
        type: Sequelize.STRING,
        allowNull: false
    },
    historicalDaily: {
        type: Sequelize.JSON,
        allowNull: false
    }
});

const User = Conn.define('user', {
    username: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

let coinList = [
    "ETH",
    "ZRX",
    "DNT",
    "ANT",
    "BAT",
    "RDN",
    "GNT",
    "OMG",
    "BLT",
    "REP",
    "SNT"
];

let coinListURLs = [];

coinList.forEach((item, index) => {
    let url = "https://min-api.cryptocompare.com/data/histoday?fsym=" + item + "&tsym=USD&allData=true&aggregate=1&e=CCCAGG";
    coinListURLs.push(url);
})

let data = [];

const DELAY_MS = 1000;

async function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

async function doRequests(URLs) {
  for(const URL of URLs) {
    data.push(await request(URL));
    await wait(DELAY_MS);
    console.log("Requesting URL: " + URL);
  }
}

doRequests(coinListURLs).then(() => {
    Conn.sync({ force: true }).then(() => {
        Cryptocurrency.create({
            abbreviation: "ETH",
            name: "Ether",
            externalLink: "https://www.ethereum.org/",
            historicalDaily: JSON.parse(data[coinList.indexOf("ETH")]).Data
        }).then(() => {
            Cryptocurrency.create({
                abbreviation: "ZRX",
                name: "0xProject",
                externalLink: "https://0xproject.com/",
                historicalDaily: JSON.parse(data[coinList.indexOf("ZRX")]).Data
            }).then(() => {
                Cryptocurrency.create({
                    abbreviation: "DNT",
                    name: "District0x",
                    externalLink: "https://district0x.io/",
                    historicalDaily: JSON.parse(data[coinList.indexOf("DNT")]).Data
                }).then(() => {
                    Cryptocurrency.create({
                        abbreviation: "ANT",
                        name: "Aragon",
                        externalLink: "https://aragon.org/",
                        historicalDaily: JSON.parse(data[coinList.indexOf("ANT")]).Data
                    }).then(() => {
                        Cryptocurrency.create({
                            abbreviation: "BAT",
                            name: "Basic Attention Token",
                            externalLink: "https://basicattentiontoken.org/",
                            historicalDaily: JSON.parse(data[coinList.indexOf("BAT")]).Data
                        }).then(() => {
                            Cryptocurrency.create({
                                abbreviation: "RDN",
                                name: "Raiden",
                                externalLink: "https://raiden.network/",
                                historicalDaily: JSON.parse(data[coinList.indexOf("RDN")]).Data
                            }).then(() => {
                                Cryptocurrency.create({
                                    abbreviation: "GNT",
                                    name: "Golem",
                                    externalLink: "https://golem.network/",
                                    historicalDaily: JSON.parse(data[coinList.indexOf("GNT")]).Data
                                }).then(() => {
                                    Cryptocurrency.create({
                                        abbreviation: "OMG",
                                        name: "OmiseGO",
                                        externalLink: "https://omisego.network/",
                                        historicalDaily: JSON.parse(data[coinList.indexOf("OMG")]).Data
                                    }).then(() => {
                                        Cryptocurrency.create({
                                            abbreviation: "BLT",
                                            name: "Bloom",
                                            externalLink: "https://bloom.co/",
                                            historicalDaily: JSON.parse(data[coinList.indexOf("BLT")]).Data
                                        }).then(() => {
                                            Cryptocurrency.create({
                                                abbreviation: "REP",
                                                name: "Augur",
                                                externalLink: "https://www.augur.net/",
                                                historicalDaily: JSON.parse(data[coinList.indexOf("REP")]).Data
                                            }).then(() => {
                                                Cryptocurrency.create({
                                                    abbreviation: "SNT",
                                                    name: "Status",
                                                    externalLink: "https://status.im/",
                                                    historicalDaily: JSON.parse(data[coinList.indexOf("SNT")]).Data
                                                })
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

export const DB = Conn;