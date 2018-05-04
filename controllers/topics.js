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
}

exports.addArticleToTopic = (req,res,next) => {
    const {body, title} = req.body;
    const {id} = req.params;
    return Users.findOne()
    .then(({_id}) => {
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
    .catch((err) => console.log(err))
}