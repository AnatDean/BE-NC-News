process.env.NODE_ENV = 'test';
const {expect} = require('chai')
const app = require('../app');
const {seedDB} = require('../seed/seedDB');
const {DB} = require('../config');
const {topicData, userData, articleData}  = require('../seed/testData/');
const request = require('supertest')(app);
const mongoose = require('mongoose')

describe('app', () => {
    let articles,topics, users
    beforeEach(() => {
        return mongoose.connection.db.dropDatabase() 
        .then(() => {
            return seedDB(DB, topicData, userData, articleData)
        })
        .then(([topicIds,userIds, articleIds]) => {
            articles = articleIds;
            topics = topicIds;
            users = userIds;
        })
        .catch(console.log)   
    }); 
    after(()=>  mongoose.disconnect());

    describe('api', () => {
        describe('topics (successful requests)', () => {
            it('GET /topics resolves with a 200 and array of topics', () => {
                return request
                .get('/api/topics')
                .expect(200)
                .expect('content-type', /json/)
                .then(res => {
                    expect(res.body.topics).to.be.an('Array')
                    expect(res.body.topics.length).to.equal(topics.length)
                    expect(res.body.topics[1].slug).to.equal(topics[1].slug)
                })
            });
            it('GET /topics/:id/articles resolves with a 200 and an array of articles by topic', () => {
                const belongsToNumber = articles.filter(article => article.belongs_to === topics[1]._id).length
                return request
                .get(`/api/topics/${topics[1]._id}/articles`)
                .expect(200)
                .expect('content-type', /json/)
                .then(({body}) => {
                    expect(body.articles).to.be.an('Array');
                    expect(body.articles.length).to.equal(belongsToNumber)
                    expect(body.articles[1].belongs_to).to.equal(`${(topics[1]._id)}`)
                })
            });
            it('POST /topics/:id/articles resolves with a 201 and responds with the posted article text', () => {
                const article = {title: 'article', body:'this is my article'}
                return request
                .post(`/api/topics/${topics[1]._id}/articles`)
                .send(article)
                .expect(201)
                .expect('content-type', /json/)
                .then(({body}) => {
                    expect(body.article).to.be.an('Object');
                    expect(body.article.text).to.equal(article.text);
                    expect(body.article.title).to.equal(article.title);
                    expect(body.article.hasOwnProperty('_id')).to.be.true;
                })
            });
        });
        describe('topics (ERROR handling)', () => {
            it('GET /topics/:id/articles resolves with a 404 when not an existing topic', () => {
                return request
                .get(`/api/topics/fake123/articles`)
                .expect(404)
                .expect('content-type', /json/)
                .then(({body}) => {
                    expect(body.message).to.equal("Sorry that topic doesn't exist!");
                })
            });
            it('POST /topics/:id/articles resolves with a 404 when not an existing topic', () => {
                const article = {title: 'article', body:'this is my article'}
                return request
                .post(`/api/topics/fake123/articles`)
                .send(article)
                .expect(404)
                .expect('content-type', /json/)
                .then(({body}) => {
                    expect(body.message).to.equal("Sorry that topic doesn't exist!");
                })
            });
            it('POST /topics/:id/articles resolves with a 400 when article missing fields', () => {
                const article = {body:'this is my article'}
                return request
                .post(`/api/topics/${topics[1]._id}/articles`)
                .send(article)
                .expect(400)
                .expect('content-type', /json/)
                .then(({body}) => {
                    expect(body.message).to.equal('Bad Request: Articles have to have a title and a body');
                })
            });
            it('POST /topics/:id/articles resolves with a 404 when valid mongo id but not existing topic', () => {
                const article = {title: 'article', body:'this is my article'}
                return request
                .post(`/api/topics/${articles[1]._id}/articles`)
                .send(article)
                .expect(404)
                .expect('content-type', /json/)
                .then(({body}) => {
                    expect(body.message).to.equal("Sorry that topic doesn't exist!");
                })
            });
            it('POST /topics/:id/articles resolves with a 400 when article missing fields', () => {
                const article = ['this is my article']
                return request
                .post(`/api/topics/${topics[1]._id}/articles`)
                .send(article)
                .expect(400)
                .expect('content-type', /json/)
                .then(({body}) => {
                    expect(body.message).to.equal('Bad Request: Articles have to have a title and a body');
                })
            });
        });
    });
});