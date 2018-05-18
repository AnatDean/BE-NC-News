env = process.env.NODE_ENV === 'test'? process.env.NODE_ENV : 'dev';

const {topicData, userData, articleData}  = require(`./${env}Data/`);
const {seedDB} = require('./seedDB');
const {DB, PORT} = require('../config/index');
const mongoose = require('mongoose');
mongoose.Promise = Promise;

mongoose.connect(DB)
.then(() => {
    console.log(`connected to ${DB}`)
    mongoose.connection.db.dropDatabase()
})
.then(() => {
    return seedDB(DB, topicData, userData, articleData)
})
.then(() => {
    mongoose.disconnect()
})
.catch(err => console.log('seedfile:', err))