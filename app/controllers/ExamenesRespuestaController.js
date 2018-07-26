var express             = require('express');
var User                = require('../conexion/Models/User');
var Pregunta            = require('../conexion/Models/Pregunta');
var Evaluacion          = require('../conexion/Models/Evaluacion');
var Evento              = require('../conexion/Models/Evento');
var Categoria 			= require('../conexion/Models/Categoria');
var router              = express.Router();

router.route('/iniciar').post(postIniciar);




function postIniciar(req, res) {
	let $user           = {};
	let $evaluacion     = {};
	let consulta        = "";
	
	User.fromToken(req).then((user)=>{
		$user = user;
		return Evento.actual();
	}).then((evento_actual)=>{
		$user.evento_actual     = evento_actual; 
		let $evento_id          = $user.evento_actual.rowid;
		return Evaluacion.actual($evento_id, req.body.categoria_id);
	}).then((eval_actual)=>{
		$evaluacion         = eval_actual[0]; 
		
		inscripcion_id      = req.body.inscripcion_id;
		evaluacion_id       = $evaluacion.rowid;
		idioma_id           = $user.idioma_main_id;
		categoria_id 		= req.body.categoria_id;
		terminado 			= 0;
		gran_final          = $user.evento_actual.gran_final;
		res_by_promedio 	= $evaluacion.puntaje_por_promedio;
		
		consulta = 'INSERT INTO ws_examen_respuesta(inscripcion_id, evaluacion_id, idioma_id, categoria_id, terminado, gran_final, res_by_promedio) VALUES(?,?,?,?,?,?,?)';
		return db.query(consulta, [inscripcion_id, evaluacion_id, idioma_id, categoria_id, terminado, gran_final, res_by_promedio])
	}).then((result_insert)=>{
		
		return Pregunta.deEvaluacion($evaluacion.rowid);
		
	}).then(($preguntas_king)=>{
		// Me falta lo de grupo preg // $preguntas = Grupo_pregunta::deEvaluacion($preguntas_king, $evaluacion->id);
		$evaluacion.preguntas       = $preguntas_king;
		$evaluacion.inscripcion_id 	= req.body.inscripcion_id;
		$evaluacion.examen_id       = result_insert.insertId;
		
		return db.find('ws_categorias_king', req.body.categoria_id);
	}).then(($categoria)=>{
		console.log($categoria, req);
		return Categoria.traducciones_single($categoria); 
	}).then(($categoria)=>{
		$evaluacion.categoria = $categoria; 
		res.send($evaluacion);
	});
}



module.exports = router;