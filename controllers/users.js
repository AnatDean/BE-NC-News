const {Users} = require('../models')

exports.getUserByUsername = (req,res,next) => {
    return Users.findOne(req.params).lean()
    .then(user => {
        if (!user) throw ({path: '_id'})
        res.status(200).send({user})
    })
    .catch(err => {
        if (err.path === '_id') return next({status:404, controller: "user"})
        else return next(err)
    })
}
