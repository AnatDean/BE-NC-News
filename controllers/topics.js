const {Topics, Articles, Users, Comments} = require('../models')
const {formatArticles} = require('../utils')

exports.getAllTopics = (req,res,next) => {
    return Topics.find()
    .then(topics => {
        res.status(200).send({topics})
    })
    .catch(next)
}

exports.getArticleByTopic = (req,res,next) => {
    const {id} = req.params
    return Promise.all([
    Articles.find({belongs_to: id})
    .populate({path: 'belongs_to', select: {'__v': 0}})
    .populate({ path: 'created_by', select: {'__v': 0, 'avatar_url': 0, 'name': 0}})
    .lean(),
    Comments.find()
    .populate({path: 'belongs_to', select: {'_id': 1}})
    .populate({ path: 'created_by', select: {'__v': 0, 'avatar_url': 0, 'name': 0}})
    .lean()
    ])
    .then(([articles, comments])=> {
        articles = formatArticles(articles, comments)
        res.status(200).send({articles})
    })
    .catch(err => {
        if (err.name === 'CastError') return next({status:404, controller: "topic"})
        else next()
    })
}

exports.addArticleToTopic = (req,res,next) => {
    const {body, title} = req.body
    if (!body | !title) return next({status: 400, message: 'Bad Request: Articles have to have a title and a body' })
    const {id} = req.params;
    return Promise.all([Users.findOne(), Topics.find({_id: id})])
    .then(([{_id}, topics]) => {
        if (!topics.length) throw({name: 'CastError'})
        const article = {
            title,
            body,
            belongs_to: id,
            created_by: _id
        }
    return Articles.create(article)
   })
    .then(article => {
        res.status(201).send({article})
    })
    .catch((err) => {
        if (err.name === 'CastError') return next({status: 404, controller: 'topic' });
        else return next(err)
    });
}