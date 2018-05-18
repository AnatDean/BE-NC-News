const express = require('express');
const router = express.Router();
const {getAllTopics, getArticleByTopic, addArticleToTopic} = require('../controllers/topics');

router.route('/')
    .get(getAllTopics)

router.route('/:id/articles')
    .get(getArticleByTopic)
    .post(addArticleToTopic)

module.exports = router;