const {Comments} = require('../models')

exports.incrementCommentVote = (req,res,next) => {
    let vote;
    vote = req.query.vote === 'up'? 1 : req.query.vote === 'down'? -1 : 0;
    return Comments.findById(req.params)
    .then(comment => {
        if (!comment) throw ({path: '_id'})
        return Comments.findByIdAndUpdate(req.params, {$inc: {votes: vote}}, {new:true})
    })
    .then(comment => {
        res.status(200).send({comment})
    })
    .catch(err => {
        if (err.path === '_id') return next({status:404, message:"Sorry that comment doesn't exist!"})
        else return next(err)
    })
}

exports.deleteComment = (req,res,next) => {
    return Comments.findById(req.params)
    .then(comment => {
        if (!comment) throw ({path: '_id'})
        return Comments.findByIdAndRemove(req.params)
    })
    .then(comment => {
        res.status(204).send({comment})
    })
    .catch(err => {
        if (err.path === '_id') return next({status:404, message:"Sorry that comment never existed!"})
        else return next(err)
    })
}