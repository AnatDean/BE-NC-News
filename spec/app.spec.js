process.env.NODE_ENV = 'test';
const {expect} = require('chai')
const app = require('../app');
const {seedDB} = require('../seed/seedDB');
const {DB} = require('../config');
const {topicData, userData, articleData}  = require('../seed/testData/');
const request = require('supertest')(app);
const mongoose = require('mongoose')

describe.only('app', () => {
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
                .then(({body}) => {
                    const resTopics = body.topics
                    expect(resTopics).to.be.an('Array')
                    expect(resTopics.length).to.equal(topics.length)
                    expect(resTopics[1].slug).to.equal(topics[1].slug)
                })
            });
            it('GET /topics/:id/articles resolves with a 200 and an array of articles by topic', () => {
                const belongsToNumber = articles.filter(article => article.belongs_to === topics[1]._id).length
                return request
                .get(`/api/topics/${topics[1]._id}/articles`)
                .expect(200)
                .expect('content-type', /json/)
                .then(({body}) => {
                    const {articles} = body
                    expect(articles).to.be.an('Array');
                    expect(articles.length).to.equal(belongsToNumber)
                    expect(articles[1].belongs_to).to.equal(`${(topics[1]._id)}`)
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
                    const resArticle = body.article
                    expect(resArticle).to.be.an('Object');
                    expect(resArticle.text).to.equal(article.text);
                    expect(resArticle.title).to.equal(article.title);
                    expect(resArticle).to.haveOwnProperty('_id');
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
        describe('articles (successful requests)', () => {
            it('GET /api/articles responds with 200 and array of all articles with topic and comment info attached', () => {
                return request
                .get('/api/articles')
                .expect(200)
                .expect('content-type', /json/)
                .then(({body}) => {
                    const {articles} = body
                    expect(articles).to.be.an('Array');
                    expect(articles.length).to.equal(articles.length);
                    expect(articles[0].commentCount).to.equal(1);
                    expect(articles[0].belongs_to).to.haveOwnProperty('slug');
                    expect(articles[1].title).to.equal(articles[1].title);
                });
            });
            it('GET /api/articles/:id responds with 200 and a single article with comments belonging to that article', () => {
                const [article] = articles
                return request
                .get(`/api/articles/${article._id}`)
                .expect(200)
                .expect('content-type', /json/)
                .then(({body}) => {
                    const {article} = body
                    expect(article._id).to.equal(`${article._id}`)
                    expect(article.title).to.equal(article.title)
                    expect(article.commentCount).to.equal(1)
                    expect(article.comments.length).to.equal(article.commentCount)
                    expect(article.comments[0].belongs_to).to.equal(`${article._id}`)
                    expect(article.comments[0]).to.haveOwnProperty('created_at')
                });
            });
        });
    });
});