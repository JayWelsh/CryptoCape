import * as express from 'express';
import * as GraphHTTP from 'express-graphql'
import {CryptocurrencySchema} from './schema';

const app = express();

// An api endpoint that returns a short list of items
app.get('/api', (req,res) => {
    var list = ["item1", "item2", "item3"];
    res.json(list);
    console.log('Sent list of items');
});

app.use('/graphql', GraphHTTP({
    schema: CryptocurrencySchema,
    pretty: true,
    graphiql: true
}));

const port = process.env.PORT || 5000;
app.listen(port);

console.log('App is listening on port ' + port);