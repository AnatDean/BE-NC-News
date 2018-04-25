const express = require('express');
const router = express.Router();
const {getAllArticles} = require('../controllers/articles')

router.route('/')
    .get(getAllArticles)


module.exports = router;