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
router.use('/disciplinas', require('./DisciplinasController'));
router.use('/evaluaciones', require('./EvaluacionesController'));
router.use('/informes', require('./informes/InformesController'));
router.use('/informes-infor', require('./informes/DatosController'));
router.use('/inscripciones', require('./InscripcionesController'));
router.use('/examenes_respuesta', require('./ExamenesRespuestaController'));
router.use('/qr', require('./QrController'));


module.exports = router;