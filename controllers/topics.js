const {Topics, Articles, Comments, Users} = require('../models')

exports.getAllTopics = (req,res,next) => {
    return Topics.find()
    .then(topics => {
        res.status(200).send({topics})
    })
    .catch(next)
}

exports.getArticleByTopic = (req,res,next) => {
    const {id} = req.params
    return Articles.find({belongs_to: id})
    .then(articles => {
        res.status(200).send({articles})
    })
    .catch(err => {
        if (err.name === 'CastError') return next({status:404, message: "Sorry that topic doesn't exist!"})
        else next()
    })
}

exports.addArticleToTopic = (req,res,next) => {
    const {body, title} = req.body;
    const {id} = req.params;
    return Promise.all([Users.findOne(), Topics.find({_id: id})])
    .then(([{_id}, topics]) => {
        if (!topics.length) throw({errors: {'belongs_to': 404}})
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
        const [error] = err.errors?  Object.keys(err.errors) : Object.keys(err)
        if (error === 'belongs_to' || err.name === 'CastError') return next({status: 404, message: "Sorry that topic doesn't exist!" });
        if (error === 'title') return next({status: 400, message: 'Bad Request: Articles have to have a title and a body' })
    });
}