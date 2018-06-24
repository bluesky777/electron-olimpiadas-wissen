var express = require('express');
var router = express.Router();



router.use('/usuarios', require('./UsersController'));
router.use('/welcome', require('./WelcomeController'));
router.use('/idiomas', require('./IdiomasController'));
router.use('/login', require('./LoginController'));

module.exports = router;