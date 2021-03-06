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
        allowNull: true
    }
});

const User = Conn.define('user', {
    username: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

(() => {
    Conn.sync({ force: true }).then(() => {
        Cryptocurrency.create({
            abbreviation: "ETH",
            name: "Ether",
            externalLink: "https://www.ethereum.org/",
        }).then(() => {
            Cryptocurrency.create({
                abbreviation: "ZRX",
                name: "0xProject",
                externalLink: "https://0xproject.com/",
            }).then(() => {
                Cryptocurrency.create({
                    abbreviation: "DNT",
                    name: "District0x",
                    externalLink: "https://district0x.io/",
                }).then(() => {
                    Cryptocurrency.create({
                        abbreviation: "ANT",
                        name: "Aragon",
                        externalLink: "https://aragon.org/",
                    }).then(() => {
                        Cryptocurrency.create({
                            abbreviation: "BAT",
                            name: "Basic Attention Token",
                            externalLink: "https://basicattentiontoken.org/",
                        }).then(() => {
                            Cryptocurrency.create({
                                abbreviation: "RDN",
                                name: "Raiden",
                                externalLink: "https://raiden.network/",
                            }).then(() => {
                                Cryptocurrency.create({
                                    abbreviation: "GNT",
                                    name: "Golem",
                                    externalLink: "https://golem.network/",
                                }).then(() => {
                                    Cryptocurrency.create({
                                        abbreviation: "OMG",
                                        name: "OmiseGO",
                                        externalLink: "https://omisego.network/",
                                    }).then(() => {
                                        Cryptocurrency.create({
                                            abbreviation: "BLT",
                                            name: "Bloom",
                                            externalLink: "https://bloom.co/",
                                        }).then(() => {
                                            Cryptocurrency.create({
                                                abbreviation: "REP",
                                                name: "Augur",
                                                externalLink: "https://www.augur.net/",
                                            }).then(() => {
                                                Cryptocurrency.create({
                                                    abbreviation: "SNT",
                                                    name: "Status",
                                                    externalLink: "https://status.im/",
                                                }).then(() => {
                                                    Cryptocurrency.create({
                                                        abbreviation: "PNK",
                                                        name: "Kleros",
                                                        externalLink: "https://kleros.io/",
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
});

export const DB = Conn;