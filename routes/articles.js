const express = require('express');
const router = express.Router();
const {getAllArticles, getArticleById} = require('../controllers/articles')

router.route('/')
    .get(getAllArticles)

router.route('/:_id')
    .get(getArticleById)


module.exports = router;