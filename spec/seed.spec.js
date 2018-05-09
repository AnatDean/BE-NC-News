process.env.NODE_ENV = 'test';
const mongoose = require('mongoose');
const {expect} = require('chai');
const {seedDB} = require('../seed/seedDB');
const {DB} = require('../config');
const {topicData, userData, articleData}  = require('../seed/testData/');

describe('seed', () => {
    let articles,topics, users;
    before(() => {
        return mongoose.connect(DB)
        .then(() => mongoose.connection.db.dropDatabase())
        .then(() => {
            return seedDB(DB, topicData, userData, articleData)
        })
        .then(([topicIds,userIds, articleIds]) => {
            articles = articleIds;
            topics = topicIds;
            users = userIds;
        })
        .catch(console.log)
    })

    after(() => mongoose.disconnect()) ;

    it('Seeds topicData', () => {
        expect(topics.length).to.equal(topicData.length);
        expect(topics[0]._doc).to.haveOwnProperty('_id');
        expect(topics[0]._doc.title).to.equal(topicData[0].title)
    });
    it('seeds articleData', () => {
        expect(articles.length).to.equal(articleData.length);
        expect(articles[0]._doc).to.haveOwnProperty('_id');
        expect(articles[0]._doc).to.haveOwnProperty('votes');
        expect(articles[0]._doc).to.haveOwnProperty('belongs_to');
        expect(articles[0]._doc).to.haveOwnProperty('created_by');
        expect(articles[0]._doc.title).to.equal(articleData[0].title)
    });
    it('seeds userData', () => {
        expect(users.length).to.equal(userData.length);
        expect(users[0]._doc).to.haveOwnProperty('_id');
        expect(users[0]._doc.name).to.equal(userData[0].name)
    });
})