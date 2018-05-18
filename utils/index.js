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

exports.formatArticles = (articles, comments) => {
  const commentCount = comments.reduce((count, comment) => {
    count[comment.belongs_to._id]= (count[comment.belongs_to._id] || 0 ) + 1;
    return count
}, {})
  articles.forEach(article => {
    article.commentCount = commentCount[article._id] || 0
  })
  return articles;
}