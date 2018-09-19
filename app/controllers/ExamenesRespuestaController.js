var express             = require('express');
var User                = require('../conexion/Models/User');
var Pregunta            = require('../conexion/Models/Pregunta');
var Evaluacion          = require('../conexion/Models/Evaluacion');
var Evento              = require('../conexion/Models/Evento');
var Categoria 			= require('../conexion/Models/Categoria');
var router              = express.Router();

router.route('/iniciar').post(postIniciar);
router.route('/continuar').put(putContinuar);
router.route('/responder-pregunta').put(putResponderPregunta);
router.route('/set-terminado').put(putSetTerminado);
router.route('/destroy').put(putDestroy);




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
		let now 			= window.fixDate(new Date(), true);
		
		consulta = 'INSERT INTO ws_examen_respuesta(inscripcion_id, evaluacion_id, idioma_id, categoria_id, terminado, gran_final, res_by_promedio, created_at, updated_at) VALUES(?,?,?,?,?,?,?,?,?)';
		return db.query(consulta, [inscripcion_id, evaluacion_id, idioma_id, categoria_id, terminado, gran_final, res_by_promedio, now, now])
	}).then((result_insert)=>{
		$evaluacion.examen_id       = result_insert.insertId;
		return Pregunta.deEvaluacion($evaluacion.rowid);
		
	}).then(($preguntas_king)=>{
		// Me falta lo de grupo preg // $preguntas = Grupo_pregunta::deEvaluacion($preguntas_king, $evaluacion->id);
		$evaluacion.preguntas       = $preguntas_king;
		$evaluacion.inscripcion_id 	= req.body.inscripcion_id;
		
		return db.find('ws_categorias_king', req.body.categoria_id);
	}).then(($categoria)=>{
		return Categoria.traducciones_single($categoria); 
	}).then(($categoria)=>{
		$evaluacion.categoria = $categoria; 
		res.send($evaluacion);
	});
}


function putContinuar(req, res) {
	let $user           = {};
	let $exa_resp_id 	= req.body.exa_resp_id;
	let $preguntas 		= [];
	let $evaluacion 	= {};
	let $examen 	= {};
	
	User.fromToken(req).then((user)=>{
		$user = user;
		return db.find('ws_examen_respuesta', $exa_resp_id);
	}).then((examen)=>{
		$examen = examen;
		return Pregunta.deEvaluacion(examen.evaluacion_id, $exa_resp_id);
	}).then((preguntas)=>{
		$preguntas = preguntas;
		return db.find('ws_evaluaciones', $examen.evaluacion_id);
	}).then((evaluacion)=>{
		$evaluacion = evaluacion;
		$evaluacion.preguntas = $preguntas;
		
		$evaluacion.examen_id 			= $examen.rowid;
		$evaluacion.id 					= $evaluacion.examen_id;
		$evaluacion.rowid 				= $evaluacion.examen_id;
		$evaluacion.evaluacion_id 		= $evaluacion.rowid;

		return db.find('ws_categorias_king', req.body.categoria_id);
		
	}).then(($categoria)=>{
		return Categoria.traducciones_single($categoria); 
	}).then(($categoria)=>{
		$evaluacion.categoria = $categoria; 
		res.send($evaluacion);
	});
}




function putResponderPregunta(req, res) {
	
	$puntos 			= 0;
	$examen_actual_id 	= req.body.examen_actual_id;
	$opcion_id 			= req.body.opcion_id;
	$preg_king_id 		= req.body.pregunta_top_id;
	$preg_traduc_id 	= req.body.pregunta_sub_id;
	$pregunta_king 		= {};
	$opcion 			= undefined;

	User.fromToken(req).then((user)=>{
		$user = user;
		return db.find('ws_preguntas_king', $preg_king_id);
	}).then((pregunta_king)=>{
		$pregunta_king 	= pregunta_king;
		return db.query('SELECT *, rowid FROM ws_opciones WHERE rowid=?', [$opcion_id]);
	}).then((opcion)=>{
		if (opcion.length > 0) {
			$opcion = opcion;
		}
		
		consulta 	= 'SELECT *, rowid FROM ws_respuestas WHERE examen_respuesta_id=? and preg_traduc_id=?';
		return db.query(consulta, [$examen_actual_id, $preg_traduc_id]);
	}).then(($respuesta)=>{
		if ($respuesta.length > 0) {
			return res.send('Ya respondida');
		}
		
		if ($pregunta_king.tipo_pregunta == 'Test') { // Solo una opción es correcta
			if ($opcion) {
				if ($opcion.is_correct) {
					$puntos = $pregunta_king.puntos;
				}
			}	
		}
		
		tiempo_aprox 	= req.body.tiempo_aproximado || null;
		let now         = window.fixDate(new Date(), true);
		consulta 		= 'INSERT INTO ws_respuestas(examen_respuesta_id, pregunta_king_id, tiempo, tiempo_aproximado, preg_traduc_id, idioma_id, tipo_pregunta, puntos_maximos, puntos_adquiridos, opcion_id, created_at, updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)';
		
		db.query(consulta, [$examen_actual_id, $preg_king_id, req.body.tiempo, tiempo_aprox, $preg_traduc_id, req.body.idioma_id, req.body.tipo_pregunta, $puntos, (req.body.puntos_adquiridos||null), ($opcion_id || null), now, now])
		.then(()=>{
			res.send('Respuesta guardada.');
		})
	})
}

function putSetTerminado(req, res) {

	User.fromToken(req).then((user)=>{
		$user = user;
		if (req.body.timeout) {
			return db.query('UPDATE ws_examen_respuesta SET terminado=1, timeout=? WHERE rowid=?', [req.body.exa_id, req.body.timeout]);
		}else{
			return db.query('UPDATE ws_examen_respuesta SET terminado=1 WHERE rowid=?', [req.body.exa_id]);
		}

	}).then(()=>{
		res.send('Terminado con éxito');
	})

}


function putDestroy(req, res) {

	let now = window.fixDate(new Date(), true);
	
	User.fromToken(req).then((user)=>{
		return db.query('UPDATE ws_examen_respuesta SET deleted_at=?, deleted_by=? WHERE rowid=?', [now, user.rowid, req.body.examen_id] );
	}).then(($examen)=>{
		res.send({ rowid: req.body.examen_id, deleted_at: now });
	})

}

module.exports = router;