env = process.env.NODE_ENV;
const {Topics, Users, Articles, Comments} = require('../models/index');
const {topicData, userData, articleData}  = require(`./${env}Data/`);
const mongoose = require('mongoose');
mongoose.Promise = Promise;
const {DB, PORT} = require('../config/index');
const Chance = require('chance');
const chance = new Chance;

function seedDB (DB, topics, users, articles) {
    let topicIds, userIds, articleIds
    return mongoose.connect(DB)
    .then(() => {
        console.log(`connected to ${DB}`)
        mongoose.connection.db.dropDatabase()
    })
    .then(() => {
        console.log('dropped database')
        return Topics.insertMany(topics)
    })
    .then((topics) => {
        console.log(`inserted ${topics.length} topics` )
        topicIds = topics;
        return Users.insertMany(users)
    })
    .then((users) => {
        console.log(`inserted ${users.length} users` )
        userIds = users;
        const newArticles = articles.map((article, i) => {
            article.belongs_to = topicIds.find(topic => topic.slug === article.topic)._id;
            article.votes = Math.floor(Math.random() * 50);
            article.created_by = userIds[Math.floor(Math.random() * (userIds.length))]._id;
            return article
        });
        return Articles.insertMany(newArticles)
    })
    .then(articles => {
        console.log(`inserted ${articles.length} articles` )
        articleIds = articles;
        const comments = [];

        articleIds.forEach(article => {
            let randomCallCount = Math.floor(Math.random() * 5)
            while (randomCallCount){
                comments.push(createComment(article._id));
                randomCallCount--;
            }
        })
        function createComment (articleId) {
            return comment = {
                body: chance.sentence(),
                belongs_to: articleId,
                created_at: chance.timestamp(),
                votes: Math.floor(Math.random() * 50),
                created_by: userIds[Math.floor(Math.random() * (userIds.length))]._id
            };
        }
        return Comments.insertMany(comments)
    })
    .then(comments => {
        console.log(`inserted ${comments.length} comments`)
        console.log('finished seeding!')
        mongoose.disconnect()
    })
    .catch(err => {
        console.log(err);
        mongoose.disconnect()
    })
}

seedDB(DB, topicData, userData, articleData)


