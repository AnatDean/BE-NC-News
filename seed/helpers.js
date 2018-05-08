const Chance = require('chance');
const chance = new Chance;


exports.createComment = (articleId, message, userIds ) => {
    return {
        body: message? message: chance.sentence(),
        belongs_to: articleId,
        created_at: chance.timestamp(),
        votes: Math.floor(Math.random() * 50),
        created_by: !message ? userIds[Math.floor(Math.random() * (userIds.length))]._id : userIds
    }
}