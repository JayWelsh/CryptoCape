import * as express from 'express';
import * as GraphHTTP from 'express-graphql'
import {CryptocurrencySchema} from './schema';
import * as cors from 'cors';
import * as path from 'path';

const app = express();

if (process.env.REACT_APP_FORCE_LOCALHOST) {
    //Enable CORS for dev env
    //(GraphQL endpoint on different port to client dev server)
    app.use('/graphql', cors(), GraphHTTP({
        schema: CryptocurrencySchema,
        pretty: true,
        graphiql: true
    }));
}else{
    //GraphQL routing handled by nginx
    //No CORS needed
    app.use('/graphql', GraphHTTP({
        schema: CryptocurrencySchema,
        pretty: true,
        graphiql: true
    }));
}

app.use(express.static(path.join(__dirname, '../../client/build')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/build/index.html'));
})

const port = process.env.PORT || 5000;
app.listen(port);

console.log('App is listening on port ' + port);