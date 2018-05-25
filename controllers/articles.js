const {Articles, Comments, Users} = require('../models')
const {createComment, formatArticles} = require('../utils')

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
        articles = formatArticles(articles, comments)
        res.status(200).send({articles})
    })
    .catch(next)
}

 exports.getArticleById = (req,res,next) => {
    return Promise.all([Articles.findOne(req.params)
        .populate({ path: 'belongs_tocontroller', select: {'__v':0}})
        .populate({ path: 'created_by', select: { 'avatar_url': 0, '__v':0, 'name': 0 }})
        .lean(),
        Comments
        .find({belongs_to:req.params._id})
        .populate({path: 'created_by', select: { 'avatar_url': 0, '__v':0, 'name': 0 }})
        .lean()
    ])
        .then(([article, comments]) => {
            if (!article) throw ({name: 'CastError'})
            article.commentCount = comments.length;
            article.comments = [...comments];
            res.status(200).send({article})
        })
        .catch(err => {
            if (err.name === 'CastError') return next({status:404, controller: "article"})
            else return next(err)
        })
}

exports.addComment = (req,res,next) => {
    const {_id} = req.params;
    const {message} = req.body;
    if (!message) return next ({status:400, message: "Bad Request: Comments have to have a message"})
    return Promise.all([Articles.findById(req.params), Users.findOne({username: 'northcoder'})])
    .then(([article, user]) => {
        if (!article) throw ({name: 'ValidationError'})
        const comment = createComment(_id, req.body.message, user._id);
        return Comments.create(comment)
    })
    .then(({_doc}) => {
        const sendComment = {..._doc, created_by: 'northcoder' }
        res.status(201).send({comment:sendComment}) 
    })
    .catch(err => {
        if (err.name ==='ValidationError' || err.name === 'CastError') return next({status:404, controller: "article"})
        if (err.name ==='BadRequest') return next({status:400, message: "Bad Request: Comments have to have a message"})

        else return next(err)
    })
}

exports.incrementVoteArticle = (req,res,next) => {
    const vote = req.query.vote === 'up'? 1 : req.query.vote === 'down'? -1 : 0;
    return Articles.findById(req.params)
    .then(article => {
        if (!article) throw ({name: 'CastError'})
        return Articles.findByIdAndUpdate(req.params, {$inc: {votes: vote}}, {new:true})
    })
    .then(article => {
        res.status(200).send({article})
    })
    .catch(err => {
        if (err.name === 'CastError') return next({status:404, controller: "article"}) 
        else return next(err)
    })
}