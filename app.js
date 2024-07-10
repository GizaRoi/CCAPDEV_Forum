/*
npm i
node app
*/
const express = require('express')
const server = express()
require('dotenv').config();

const fs = require('fs');

const mongoose = require('mongoose'); //import

const bodyParser = require('body-parser')
server.use(express.json())
server.use(express.urlencoded({ extended: true }));
const router = require('./src/routes/Router.js')
const handlebars = require('express-handlebars');
//const initData = require('script/DatabaseInit');
const connectToMongo = require('./src/conn.js');

var hbs = require('handlebars');

server.set('view engine', 'hbs');
server.engine('hbs', handlebars.engine({
    extname: 'hbs'
}));

server.use(bodyParser.json());
server.set("view cache", false);
server.use(express.static('public'));
server.use(router);

//server listen
const port = process.env.PORT || 9090;
server.listen(port, async function(){
    await connectToMongo();
    console.log('Connected to MongoDB.');
    console.log('Listening at port '+ port);
});
