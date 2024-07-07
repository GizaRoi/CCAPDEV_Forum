const express = require('express')
const server = express()
require('dotenv').config();

const bodyParser = require('body-parser')
server.use(express.json())
server.use(express.urlencoded({ extended: true }));
const router = require('./src/routes/Router.js')
const handlebars = require('express-handlebars');
//const initData = require('script/DatabaseInit');


var hbs = require('handlebars');
//const connMongo = require('/src/conn.js')

server.set('view engine', 'hbs');
server.engine('hbs', handlebars.engine({
    extname: 'hbs'
}));
server.use(bodyParser.json());
server.set("view cache", false);
server.use(express.static('public'));
server.use(router);


const port = process.env.PORT || 9090;
server.listen(port, async function(){
    console.log('Listening at port '+ port);
});
