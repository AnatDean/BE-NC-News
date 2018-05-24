const express = require('express');
const router = express.Router();
const {getAllTopics, getArticleByTopic, addArticleToTopic} = require('../controllers/topics');

router.route('/')
    .get(getAllTopics)

router.route('/:slug/articles')
    .get(getArticleByTopic)
    .post(addArticleToTopic)

module.exports = router;