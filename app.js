const express = require('express');
const server = express();
require('dotenv').config();

const fs = require('fs');
const mongoose = require('mongoose'); // Import
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const router = require('./src/routes/Router.js');
const handlebars = require('express-handlebars');
const connectToMongo = require('./src/conn.js');

// Set up Handlebars
server.set('view engine', 'hbs');
server.engine('hbs', handlebars.engine({
    extname: 'hbs'
}));

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.set("view cache", false);
server.use(express.static('public'));

// Session configuration
server.use(session({
    secret: process.env.SESSION_SECRET || 'asdf',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb+srv://roi:asdf@atlascluster.mrdeg2v.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster',
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

// Use the router
server.use(router);

// Server listen
const port = process.env.PORT || 3000;
server.listen(port, async function(){
    await connectToMongo();
    console.log('Connected to MongoDB.');
    console.log('Listening at port ' + port);
});
