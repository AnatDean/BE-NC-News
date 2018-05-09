const {Topics, Articles, Comments, Users} = require('../models')

exports.incrementCommentVote = (req,res,next) => {
    let vote;
    vote = req.query.vote === 'up'? 1 : req.query.vote === 'down'? -1 : 0;
    return Comments.findById(req.params)
    .then(comment => {
        return Comments.findByIdAndUpdate(req.params, {$inc: {votes: vote}}, {new:true})
    })
    .then(comment => {
        res.status(200).send({comment})
    })
    .catch(next)
}