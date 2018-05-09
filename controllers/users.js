const {Users} = require('../models')

exports.getUserByUsername = (req,res,next) => {
    Users.findOne(req.params).lean()
    .then(user => {
        if (!user) throw ({path: '_id'})
        res.status(200).send({user})
    })
    .catch(err => {
        if (err.path === '_id') return next({status:404, message:"Sorry that user doesn't exist!"})
        else return next(err)
    })
}
