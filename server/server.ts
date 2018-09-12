import * as express from 'express';
import * as GraphHTTP from 'express-graphql'
import {CryptocurrencySchema} from './schema';
import * as path from 'path';

const app = express();

app.use('/graphql', GraphHTTP({
    schema: CryptocurrencySchema,
    pretty: true,
    graphiql: true
}));

app.use(express.static(path.join(__dirname, '../../client/build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/build/index.html'));
})

const port = process.env.PORT || 5000;
app.listen(port);

console.log('App is listening on port ' + port);