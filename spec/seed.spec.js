process.env.NODE_ENV = 'test';
const mongoose = require('mongoose');
const {expect} = require('chai');
const {seedDB} = require('../seed/seedDB');
const {topicData, userData, articleData}  = require('../seed/testData/');

describe('seed', () => {
    let articles,topics, users, comments;
    beforeEach(() => {
        return mongoose.connection.db.dropDatabase()
        .then(() => {
            return seedDB(topicData, userData, articleData)
        })
        .then(([topicDocs,userDocs, articleDocs, commentDocs]) => {
            articles = articleDocs;
            topics = topicDocs;
            users = userDocs;
            comments = commentDocs;
        })
        .catch(console.log)

    })
    after(() => mongoose.disconnect()) ;

    it('Seeds topicData', () => {
        expect(topics.length).to.equal(topicData.length);
        expect(topics[0]._doc).to.have.all.keys('_id', 'title','slug', '__v');
        expect(topics[0]._doc.title).to.equal(topicData[0].title)
    });
    it('seeds articleData', () => {
        expect(articles.length).to.equal(articleData.length);
        expect(articles[0]._doc).to.have.all.keys('__v', '_id','body', 'title', 'belongs_to', 'votes', 'created_by');
        expect(articles[0]._doc.title).to.equal(articleData[0].title)
    });
    it('seeds userData', () => {
        expect(users.length).to.equal(userData.length);
        expect(users[0]._doc).to.have.all.keys('_id', 'username','name', 'avatar_url', '__v');
        expect(users[0]._doc.name).to.equal(userData[0].name)
    });
    it('seeds Comments', () => {
        expect(comments.length).to.equal(articles.length);
        expect(comments[0]._doc).to.have.all.keys('created_at', '_id','body', 'belongs_to', 'votes', 'created_by', '__v');
    });
})