const {Topics, Articles, Comments, Users} = require('../models')

exports.getAllArticles = (req,res,next) => {
    return Promise.all([
    Articles.find()
    .populate({path: 'belongs_to', select: {'__v': 0}})
    .populate({ path: 'created_by', select: {'__v': 0, 'avatar_url': 0, 'name': 0}})
    .lean(),
    Comments.find()
    .populate({path: 'belongs_to', select: {'_id': 1}})
    .populate({ path: 'created_by', select: {'__v': 0, 'avatar_url': 0, 'name': 0}})
    .lean()
    ])
    .then(([articles,comments]) => {
        const commentCount = comments.reduce((count, comment) => {
            count[comment.belongs_to._id] = (count[comment.belongs_to] || 0) + 1;
            return count
        }, {})
        articles.forEach(article => {
            article.commentCount = commentCount[article._id] || 0
        })

        res.status(200).send({articles})
    })
    .catch(next)
}

 exports.getArticleById = (req,res,next) => {
    return Promise.all([Articles.findOne(req.params)
        .populate({ path: 'belongs_to', select: {'__v':0}})
        .populate({ path: 'created_by', select: { 'avatar_url': 0, '__v':0, 'name': 0 }})
        .lean(),
        Comments
        .find({belongs_to:req.params._id})
        .populate({path: 'created_by', select: { 'avatar_url': 0, '__v':0, 'name': 0 }})
        .lean()
    ])
        .then(([article, comments]) => {
            article.commentCount = comments.length;
            article.comments = [...comments];
            res.status(200).send({article})
        })
        .catch(console.log)
}