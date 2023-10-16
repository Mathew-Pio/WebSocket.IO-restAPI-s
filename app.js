const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://MathewPio:Nodedeveloper@cluster0.zvgvmzm.mongodb.net/messages?retryWrites=true&w=majority';

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const app = express();


// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(express.json());

app.use('/images', express.static('images'))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

mongoose
    .connect(MONGODB_URI)
    .then(result => {
        const server = app.listen(3000, () => {
            console.log('App is running on port 3000')
        });

        const io = require('/socket').init(server);
        io.on('connection', Socket => {
            console.log('Connection established')
        })

    })
    .catch(err => (console.log(err)));

