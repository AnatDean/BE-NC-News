process.env.NODE_ENV = 'test';
const {expect} = require('chai')
const app = require('../app');
const {seedDB} = require('../seed/seedDB');
const {DB} = require('../config');
const {topicData, userData, articleData}  = require('../seed/testData/');
const request = require('supertest')(app);
const mongoose = require('mongoose')

describe.only('app', () => {
    let articles,topics, users, comments
    beforeEach(() => {
        return mongoose.connection.db.dropDatabase()
        .then(() => {
        return seedDB(DB, topicData, userData, articleData)
        })
        .then(([topicDocs,userDocs, articleDocs, commentDocs]) => {
            articles = articleDocs;
            topics = topicDocs;
            users = userDocs;
            comments = commentDocs
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
            it('POST /api/articles/:id adds a comment to an article responds with a 201 and returned comment ', () => {
                const [article] = articles
                const comment = {message: 'test comment'}
                return request
                .post(`/api/articles/${article._id}`)
                .send(comment)
                .expect(201)
                .expect('content-type', /json/)
                .then(({body}) => {
                    const newComment = body.comment
                    expect(newComment.body).to.equal(comment.message);
                    expect(newComment).to.have.all.keys('__v', '_id','body', 'belongs_to', 'created_at', 'votes', 'created_by');
                    expect(newComment.belongs_to).to.equal(`${article._id}`)
                });
            });
            it('PUT /api/articles/:id?vote=up increments vote up for an article', () => {
                const [article] = articles
                return request
                .put(`/api/articles/${article._id}?vote=up`)
                .expect(200)
                .then(({body}) => {
                    const updatedArticle = body.article
                    expect(updatedArticle._id).to.equal(`${article._id}`);
                    expect(updatedArticle.votes).to.equal(article.votes+1)
                })
            });
            it('PUT /api/articles/:id?vote=down decrements vote down for an article', () => {
                const [article] = articles
                return request
                .put(`/api/articles/${article._id}?vote=down`)
                .expect(200)
                .then(({body}) => {
                    const updatedArticle = body.article
                    expect(updatedArticle._id).to.equal(`${article._id}`);
                    expect(updatedArticle.votes).to.equal(article.votes-1)
                })
            });
        });
        describe('articles (ERROR handling)', () => {
            it('GET articles/:id responds with 404 with invalid id ', () => {
                return request
                .get('/api/articles/test')
                .expect(404)
                .then(({body}) => {
                    expect(body.message).to.equal("Sorry that article doesn't exist!");
                })
            });
            it('GET articles/:id responds with 404 with valid mongo id but not an existing article', () => {
                return request
                .get(`/api/articles/${topics[0]._id}`)
                .expect(404)
                .then(({body}) => {
                    expect(body.message).to.equal("Sorry that article doesn't exist!");
                })
            });
            it('POST /articles/:id responds with 404 with invalid id ', () => {
                const comment = {message: 'test comment'}
                return request
                .post('/api/articles/test')
                .send(comment)
                .expect(404)
                .then(({body}) => {
                    expect(body.message).to.equal("Sorry that article doesn't exist!")
                });
            });
            it('POST /articles/:id responds with 404 with valid mongo id but not existing article ', () => {
                const comment = {message: 'test comment'}
                return request
                .post(`/api/articles/${topics[0]._id}`)
                .send(comment)
                .expect(404)
                .then(({body}) => {
                    expect(body.message).to.equal("Sorry that article doesn't exist!")
                });
            });
            it('POST /articles/:id responds with 400 with missing keys in comment', () => {
                const [article] = articles;
                const comment = {test: 'test comment'}
                return request
                .post(`/api/articles/${article._id}`)
                .send(comment)
                .expect(400)
                .then(({body}) => {
                    expect(body.message).to.equal("Bad Request: Comments have to have a message")
                });
            });
            it('POST /articles/:id responds with 400 with empty message in comment', () => {
                const [article] = articles;
                const comment = {message: ''}
                return request
                .post(`/api/articles/${article._id}`)
                .send(comment)
                .expect(400)
                .then(({body}) => {
                    expect(body.message).to.equal("Bad Request: Comments have to have a message")
                });
            });
            it('PUT /articles/:id responds with 404 if invalid id', () => {
                return request
                .put('/api/articles/test?vote=up')
                .expect(404)
                .then(({body}) => {
                    expect(body.message).to.equal("Sorry that article doesn't exist!")
                })
            });
            it('PUT /articles/:id responds with 404 if invalid id', () => {
                return request
                .put(`/api/articles/${topics[0]._id}?vote=up`)
                .expect(404)
                .then(({body}) => {
                    expect(body.message).to.equal("Sorry that article doesn't exist!")
                })
            });
            it('PUT /articles/:id responds with 404 if invalid id', () => {
                const [article] = articles
                return request
                .put(`/api/articles/${article._id}?vote=test`)
                .expect(200)
                .then(({body}) => {
                    expect(body.article.votes).to.equal(article.votes)
                })
            });
            it('PUT /articles/:id responds with 404 if invalid id', () => {
                const [article] = articles
                return request
                .put(`/api/articles/${article._id}?test=up`)
                .expect(200)
                .then(({body}) => {
                    expect(body.article.votes).to.equal(article.votes)
                })
            });
        });
        describe('comments  (successful requests)', () => {
            it('PUT /api/comments/:id?vote=up increments vote up for a comment', () => {
                const [comment] = comments;
                return request
                .put(`/api/comments/${comment._id}?vote=up`)
                .expect(200)
                .then(({body}) => {
                    const updatedComment = body.comment;
                    expect(updatedComment.votes).to.equal(comment.votes+1)
                });
            });
            it('PUT /api/comments/:id?vote=down increments vote down for a comment', () => {
                const [comment] = comments;
                return request
                .put(`/api/comments/${comment._id}?vote=down`)
                .expect(200)
                .then(({body}) => {
                    const updatedComment = body.comment;
                    expect(updatedComment.votes).to.equal(comment.votes-1)
                });
            });
        });
    });
});