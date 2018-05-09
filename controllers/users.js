const {Users} = require('../models')

exports.getUserByUsername = (req,res,next) => {
    Users.findOne(req.params).lean()
    .then(user => {
        res.status(200).send({user})
    })
    .catch(next)
}
