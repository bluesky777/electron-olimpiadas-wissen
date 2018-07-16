var express = require('express');
var router = express.Router();



router.use('/usuarios', require('./UsersController'));
router.use('/welcome', require('./WelcomeController'));
router.use('/idiomas', require('./IdiomasController'));
router.use('/login', require('./LoginController'));
router.use('/eventos', require('./EventosController'));
router.use('/imagenes', require('./ImagenesController'));
router.use('/niveles', require('./NivelesController'));
router.use('/entidades', require('./EntidadesController'));
router.use('/categorias', require('./CategoriasController'));

module.exports = router;