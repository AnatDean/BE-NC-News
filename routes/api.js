const express = require('express');
const router = express.Router();
const {
    topicsRouter,
    articlesRouter,
    commentsRouter, 
    usersRouter
    } = require('./');


router.use('/topics', topicsRouter)
router.use('/articles', articlesRouter)
router.use('/comments', commentsRouter)
router.use('/users', usersRouter)

module.exports = router