const {Topics, Users, Articles, Comments} = require('../models/index');
const Chance = require('chance');
const chance = new Chance;

const seedDB = (DB, topics, users, articles) => {
    return new Promise ((resolve, reject) => {
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
        if (process.env.NODE_ENV !== 'test') {
        console.log(`inserted ${comments.length} comments`)
        console.log('finished seeding!');
        }
       resolve([topicIds,userIds, articleIds]);
    })
    .catch(err => reject(err))
    })     
}

module.exports = {seedDB}