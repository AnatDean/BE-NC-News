const {Topics, Users, Articles, Comments} = require('../models/index');
const {createComment} = require('./helpers')

const Chance = require('chance');
const chance = new Chance;

const seedDB = (DB, topics, users, articles) => {
    let topicIds, userIds, articleIds
    return Promise.all([Topics.insertMany(topics), Users.insertMany(users)])
    .then(([topics, users]) => {
        if (process.env.NODE_ENV !== 'test') {
            console.log(`inserted ${topics.length} topics` )
            console.log(`inserted ${users.length} users` )
        }
        topicIds = topics;
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
        if (process.env.NODE_ENV !== 'test') console.log(`inserted ${articles.length} articles` )
        articleIds = articles;
        const comments = [];
        articleIds.forEach(article => {
            let randomCallCount = process.env.NODE_ENV === 'test'? 1 : Math.floor(Math.random() * 5)
            while (randomCallCount){
                comments.push(createComment(article._id, '',  userIds));
                randomCallCount--;
            }
        })
        return Comments.insertMany(comments)
    })
    .then(comments => {
        if (process.env.NODE_ENV !== 'test') {
        console.log(`inserted ${comments.length} comments`)
        console.log('finished seeding!');
        }
       return [topicIds,userIds, articleIds];
    })
    .catch(console.log)
}

module.exports = {seedDB}