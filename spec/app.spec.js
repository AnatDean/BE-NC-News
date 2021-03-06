process.env.NODE_ENV = 'test';
const {expect} = require('chai')
const app = require('../app');
const {seedDB} = require('../seed/seedDB');
const {topicData, userData, articleData}  = require('../seed/testData/');
const request = require('supertest')(app);
const mongoose = require('mongoose')

describe('app', () => {
    let articles,topics, users, comments
    beforeEach(() => {
        return mongoose.connection.db.dropDatabase()
        .then(() => {
        return seedDB(topicData, userData, articleData)
        })
        .then(([topicDocs,userDocs, articleDocs, commentDocs]) => {
            articles = articleDocs;
            topics = topicDocs;
            users = userDocs;
            comments = commentDocs
        })
        .catch(console.log)   
    }); 
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
                .get(`/api/topics/${topics[1].slug}/articles`)
                .expect(200)
                .expect('content-type', /json/)
                .then(({body:{articles}}) => {
                    expect(articles).to.be.an('Array');
                    expect(articles.length).to.equal(belongsToNumber)
                    expect(articles[1].belongs_to._id).to.equal(`${(topics[1]._id)}`)
                })
            });
            it('POST /topics/:id/articles resolves with a 201 and responds with the posted article text', () => {
                const article = {title: 'article', body:'this is my article'}
                return request
                .post(`/api/topics/${topics[1].slug}/articles`)
                .send(article)
                .expect(201)
                .expect('content-type', /json/)
                .then(({body}) => {
                    const resArticle = body.article
                    expect(resArticle).to.be.an('Object');
                    expect(resArticle.text).to.equal(article.text);
                    expect(resArticle.title).to.equal(article.title);
                    expect(resArticle).to.haveOwnProperty('_id');
                    expect(resArticle).to.haveOwnProperty('created_at');
                })
            });
        });
        describe('topics (ERROR handling)', () => {
            it('GET /topics/:id/articles resolves with a 404 when not an existing topic', () => {
                return request
                .get(`/api/topics/fake123/articles`)
                .expect(404)
                .expect('content-type', /json/)
                .then(({body:{message}}) => {
                    expect(message).to.equal("Sorry that topic doesn't exist!");
                })
            });
            it('POST /topics/:id/articles resolves with a 404 when not an existing topic', () => {
                const article = {title: 'article', body:'this is my article'}
                return request
                .post(`/api/topics/fake123/articles`)
                .send(article)
                .expect(404)
                .expect('content-type', /json/)
                .then(({body:{message}}) => {
                    expect(message).to.equal("Sorry that topic doesn't exist!");
                })
            });
            it('POST /topics/:id/articles resolves with a 400 when article missing fields', () => {
                const article = {body:'this is my article'}
                return request
                .post(`/api/topics/${topics[1]._id}/articles`)
                .send(article)
                .expect(400)
                .expect('content-type', /json/)
                .then(({body:{message}}) => {
                    expect(message).to.equal('Bad Request: Articles have to have a title and a body');
                })
            });
            it('POST /topics/:id/articles resolves with a 404 when valid mongo id but not existing topic', () => {
                const article = {title: 'article', body:'this is my article'}
                return request
                .post(`/api/topics/${articles[1]._id}/articles`)
                .send(article)
                .expect(404)
                .expect('content-type', /json/)
                .then(({body:{message}}) => {
                    expect(message).to.equal("Sorry that topic doesn't exist!");
                })
            });
            it('POST /topics/:id/articles resolves with a 400 when article missing fields', () => {
                const article = ['this is my article']
                return request
                .post(`/api/topics/${topics[1]._id}/articles`)
                .send(article)
                .expect(400)
                .expect('content-type', /json/)
                .then(({body:{message}}) => {
                    expect(message).to.equal('Bad Request: Articles have to have a title and a body');
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
                    const resArticles = body.articles
                    expect(resArticles).to.be.an('Array');
                    expect(resArticles.length).to.equal(articles.length);
                    expect(resArticles[0].commentCount).to.equal(1);
                    expect(resArticles[0]).to.haveOwnProperty('created_at');
                    expect(resArticles[0].belongs_to).to.haveOwnProperty('slug');
                    expect(resArticles[1].title).to.equal(articles[1].title);
                });
            });
            it('GET /api/articles/:id responds with 200 and a single article with comments belonging to that article', () => {
                const [testArticle] = articles
                return request
                .get(`/api/articles/${testArticle._id}`)
                .expect(200)
                .expect('content-type', /json/)
                .then(({body:{article}}) => {
                    expect(article._id).to.equal(`${testArticle._id}`)
                    expect(article.title).to.equal(testArticle.title)
                    expect(article).to.haveOwnProperty('created_at');
                    expect(article.commentCount).to.equal(1)
                    expect(article.comments.length).to.equal(article.commentCount)
                    expect(article.comments[0].belongs_to).to.equal(`${testArticle._id}`)
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
                    expect(newComment.votes).to.equal(0)
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
            it('PUT /articles/:id responds with 404 if valid mongo id but not an existing article', () => {
                return request
                .put(`/api/articles/${topics[0]._id}?vote=up`)
                .expect(404)
                .then(({body}) => {
                    expect(body.message).to.equal("Sorry that article doesn't exist!")
                })
            });
            it('PUT /articles/:id responds with 200 if vote query value', () => {
                const [article] = articles
                return request
                .put(`/api/articles/${article._id}?vote=test`)
                .expect(200)
                .then(({body}) => {
                    expect(body.article.votes).to.equal(article.votes)
                })
            });
            it('PUT /articles/:id responds with 200 if invalid vote query key', () => {
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
            it('DELETE /api/comments/:id responds with a 204 and deletes comment by id', () => {
                const [comment] = comments
                const articleId = comment.belongs_to;
                let returnedArticle
                return request
                .get(`/api/articles/${articleId}`)
                .expect(200)
                .then(({body:{article}}) => {
                    returnedArticle = article;
                    return request
                    .delete(`/api/comments/${comment._id}`)
                    .expect(204)
                })
                .then(() => {
                    return request
                    .get(`/api/articles/${articleId}`)
                    .expect(200)
                })
                .then(({body:{article}}) => {
                    const findComment = () => article.comments.find(oneComment => oneComment._id === comment._id)
                    expect(article.commentCount).to.equal(returnedArticle.commentCount -1);
                    expect(findComment()).to.be.undefined;
                })
            });
        });
        describe('comments  (ERROR handling)', () => {
            it('PUT /comments/:id responds with 404 if invalid id', () => {
                return request
                .put('/api/comments/test?vote=up')
                .expect(404)
                .then(({body:{message}}) => {
                    expect(message).to.equal("Sorry that comment doesn't exist!")
                })
            });
            it('PUT /comments/:id responds with 404 if a valid mongo id but not an existing comment', () => {
                const [article] = articles
                return request
                .put(`/api/comments/${article._id}?vote=up`)
                .expect(404)
                .then(({body:{message}}) => {
                    expect(message).to.equal("Sorry that comment doesn't exist!")
                })
            });
            it('PUT /comments/:id responds with 200 if vote query value', () => {
                const [comment] = comments
                return request
                .put(`/api/comments/${comment._id}?vote=test`)
                .expect(200)
                .then(({body}) => {
                    expect(body.comment.votes).to.equal(comment.votes)
                })
            });
            it('PUT /comments/:id responds with 200 if invalid vote query key', () => {
                const [comment] = comments
                return request
                .put(`/api/comments/${comment._id}?test=up`)
                .expect(200)
                .then(({body}) => {
                    expect(body.comment.votes).to.equal(comment.votes)
                })
            });
            it('DELETE /comments/:id responds with 404 if invalid id', () => {
                return request
                    .delete('/api/comments/test')
                    .expect(404)
                    .then(({body:{message}}) => {
                        expect(message).to.equal("Sorry that comment doesn't exist!")
                })
            });
            it('DELETE /comments/:id responds with 404 if valid mongo id but not existing comment', () => {
                const [article] = articles
                return request
                    .delete(`/api/comments/${article._id}`)
                    .expect(404)
                    .then(({body:{message}}) => {
                        expect(message).to.equal("Sorry that comment doesn't exist!")
                })
            });
        });
        describe('users (successful requests)', () => {
            it('GET /users/:username responds with 200 and a user object by username', () => {
                const [testUser] = users;
                return request
                .get(`/api/users/${testUser.username}`)
                .expect(200)
                .then(({body:{user}}) => {
                    expect(user.username).to.equal(testUser.username);
                    expect(user._id).to.equal(`${testUser._id}`)
                    expect(user).to.haveOwnProperty('avatar_url');
                    expect(user).to.haveOwnProperty('name');

                })
            });
        });
        describe('users (ERROR handling)', () => {
            it('GET users/:id responds with 404 with invalid id ', () => {
                return request
                .get('/api/users/test')
                .expect(404)
                .then(({body:{message}}) => {
                    expect(message).to.equal("Sorry that user doesn't exist!");
                })
            });
            it('GET users/:id responds with 404 with valid mongo id but not an existing user', () => {
                return request
                .get(`/api/users/${topics[0]._id}`)
                .expect(404)
                .then(({body:{message}}) => {
                    expect(message).to.equal("Sorry that user doesn't exist!");
                })
            });
        });
    });
});