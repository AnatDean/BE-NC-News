process.env.NODE_ENV = process.env.NODE_ENV || 'dev' 
const app = require('express')();
const bodyParser = require('body-parser');
const {DB = require('./config').DB } = process.env;
const {apiRouter} = require('./routes')
const mongoose = require('mongoose');
const morgan = require('morgan')('dev');
const path = require('path')

mongoose.Promise = Promise;

mongoose.connect(DB)
  .then(() => console.log(`successfully connected to ${DB}`))
  .catch(err => console.log(`connection failed ${err}`));

app.use(bodyParser.json());
app.use(morgan)

app.use('/api', apiRouter);

app.get('/api', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/api.html'))
})

app.use ('/*', (req, res, next) => next({status: 404}))

app.use((err, req,res,next) => {
    if (err.status === 400) res.status(400).send({message: err.message ||'Bad Request'})
    else next (err)
})
app.use((err, req, res, next) => {
    if (err.status === 404) res.status(404).send({message: err.message ||'sorry page not found'})
    else next(err)
})
app.use((err, req, res, next) => {
    res.status(500).send({message: err})
})

module.exports = app