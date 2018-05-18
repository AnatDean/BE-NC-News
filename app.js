process.env.NODE_ENV = process.env.NODE_ENV || 'dev' 
const app = require('express')();
const bodyParser = require('body-parser');
const {DB, PORT} = require('./config');
const {apiRouter} = require('./routes')
const mongoose = require('mongoose');
const morgan = require('morgan')('dev');
mongoose.Promise = Promise;

mongoose.connect(DB)
  .then(() => console.log(`successfully connected to ${DB}`))
  .catch(err => console.log(`connection failed ${err}`));

app.use(bodyParser.json());
app.use(morgan)
app.use('/api', apiRouter);
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