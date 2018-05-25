const Chance = require('chance');
const chance = new Chance;


exports.createComment = (articleId, message, userIds, newComment ) => {
    return {
        body: message? message: chance.sentence(),
        belongs_to: articleId,
        votes: newComment !== 'new'? Math.floor(Math.random() * 50) : 0,
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