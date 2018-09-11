import {
    GraphQLObjectType,
    GraphQLInt,
    GraphQLString,
    GraphQLList,
    GraphQLSchema,
    GraphQLFloat
} from "graphql";

import {DB} from "./db";

const Timeseries = new GraphQLObjectType({
    name: "Timeseries",
    description: 'Timeseries',
    fields: {
        low: { 
            type: GraphQLFloat
        },
        high: { 
            type: GraphQLFloat
        },
        open: { 
            type: GraphQLFloat
        },
        time: { 
            type: GraphQLFloat
        },
        close: { 
            type: GraphQLFloat
        },
        volumeto: { 
            type: GraphQLFloat
        },
        volumefrom: { 
            type: GraphQLFloat
        }
    }
});

const Cryptocurrency = new GraphQLObjectType({
    name: "Cryptocurrency",
    description: "This represents a cryptocurrency",
    fields: () => {
        return {
            id: {
                type: GraphQLInt,
                resolve(cryptocurrency) {
                    return cryptocurrency.id;
                }
            },
            abbreviation: {
                type: GraphQLString,
                resolve(cryptocurrency) {
                    return cryptocurrency.abbreviation;
                }
            },
            name: {
                type: GraphQLString,
                resolve(cryptocurrency) {
                    return cryptocurrency.name;
                }
            },
            externalLink: {
                type: GraphQLString,
                resolve(cryptocurrency) {
                    return cryptocurrency.externalLink;
                }
            },
            historicalDaily: {
                type: new GraphQLList(Timeseries),
                resolve(cryptocurrency){
                    return cryptocurrency.historicalDaily;
                }
            }
        }
    }
});

const CryptocurrencyQuery = new GraphQLObjectType({
    name: "CryptocurrencyQuery",
    description: "This is a cryptocurrency query",
    fields: () => {
        return {
            cryptocurrencies: {
                type: new GraphQLList(Cryptocurrency),
                args: {
                    id: {
                        type: GraphQLInt
                    },
                    abbreviation: {
                        type: GraphQLString
                    },
                    name: {
                        type: GraphQLString
                    }
                },
                resolve(cryptocurrency, args){
                    return DB.models.cryptocurrency.findAll({where: args});
                }
            }
        }
    }
});

export const CryptocurrencySchema = new GraphQLSchema({
    query: CryptocurrencyQuery
});