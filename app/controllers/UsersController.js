var express = require('express');
var router = express.Router();

router.route('/')
    .get(getRouteHandler)
    .post(postRouteHandler);

function getRouteHandler(req, res) {
    //handle GET route here
}

function postRouteHandler(req, res) {
    //handle POST route here
}

module.exports = router;