const express = require('express');
const router = express.Router();
const {getAllArticles, getArticleById, addComment, incrementVoteArticle} = require('../controllers/articles')

router.route('/')
    .get(getAllArticles)

router.route('/:_id')
    .get(getArticleById)
    .post(addComment)
    .put(incrementVoteArticle)


module.exports = router;