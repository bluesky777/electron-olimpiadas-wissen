var express         = require('express');
var router          = express.Router();
var User            = require('../../conexion/Models/User');
var ExamenRespuesta = require('../../conexion/Models/ExamenRespuesta');
var db              = require('../../conexion/connWeb');





router.route('/mis-examenes').get(getMisExamenes)
router.route('/todos-los-examenes').get(getTodosLosExamenes)
router.route('/examen-detalle').put(putExamenDetalle)

// A ver si trae la función de puestos
router.route('/examenes-entidades').get(require('./PuestosController').putTodosExamenesEnt);
router.route('/examenes-entidades-categorias').get(require('./PuestosController').putExamenesEntCateg);
router.route('/examenes-categorias').get(require('./PuestosController').putExamenesCategorias);



function getMisExamenes(req, res) {
	User.fromToken(req).then(($user)=>{
		
		$evento_id = $user.evento_selected_id;
		
		
		$consulta = 'SELECT i.*, i.rowid, ct.categoria_id, ct.nombre, ct.abrev, ct.descripcion, ct.idioma_id, ct.traducido ' +
			'FROM ws_inscripciones i  ' +
			'inner join ws_categorias_king c on c.rowid=i.categoria_id and c.deleted_at is null  ' +
			'inner join ws_categorias_traduc ct on ct.categoria_id=c.rowid and ct.idioma_id=? and ct.deleted_at is null  ' +
			'where i.user_id=? and i.deleted_at is null';
			
		db.query($consulta, [$user.idioma_main_id, $user.rowid]).then(($inscripciones)=>{

			let mapeando = $inscripciones.map(($inscripcion, $key)=>{
				
				$consulta = 'SELECT e.rowid as examen_id, e.inscripcion_id, e.evaluacion_id, i.categoria_id, e.active, ' +
						'e.terminado, e.timeout, e.res_by_promedio, e.created_at as examen_at, i.user_id, i.allowed_to_answer, i.signed_by, i.created_at as inscrito_at, ' +
						'ct.nombre as nombre_categ, ct.abrev as abrev_categ, ct.descripcion as descripcion_categ, ct.idioma_id, ct.traducido ' +
					'FROM ws_examen_respuesta e ' +
					'inner join ws_inscripciones i on i.rowid=e.inscripcion_id and i.rowid=? and i.deleted_at is null ' +
					'inner join ws_categorias_king ck on ck.rowid=i.categoria_id and ck.deleted_at is null ' +
					'left join ws_categorias_traduc ct on ck.rowid=ct.categoria_id and ct.idioma_id=e.idioma_id and ct.deleted_at is null ' +
					'where e.deleted_at is null ';
				
				return db.query($consulta, [$inscripcion.rowid]);
			})
			return Promise.all(mapeando);
		}).then((examenes_all)=>{			
			
			
			return new Promise((resolve, reject)=>{
				if(examenes_all.length > 0){
					
					let $examenes_all = [];
					
					for (let i = 0; i < examenes_all.length; i++) {
						const element = examenes_all[i];
						if (element instanceof Array) {
							
							for (let k = 0; k < element.length; k++) {
								const elem = element[k];
								$examenes_all.push(elem);
							}
							
						}else{
							$examenes_all.push(element);
						}
					}
					
					let mapeando = $examenes_all.map(($examen, $key)=>{
						return ExamenRespuesta.calcular($examen);
					})
					Promise.all(mapeando).then(($examenes_puntajes)=>{
						resolve($examenes_puntajes);
					});
				}else{
					resolve();
				}
			});
		}).then(($examenes_puntajes)=>{

			if ($examenes_puntajes)
				res.send($examenes_puntajes);
			else
				res.send([]);
		});

		
	
	})
		
}
	


function getTodosLosExamenes(req, res) {
	User.fromToken(req).then(($user)=>{
		
		$evento_id 		= req.query.evento_id || $user.evento_selected_id;
		$idioma_id 		= req.query.idioma_id || $user.idioma_main_id;
		$gran_final     = (req.query.gran_final == 0 || req.query.gran_final == 'false' || req.query.gran_final == false) ? 0 : 1;
		let perfil_path = User.$perfil_path;

		
		$consulta = 'SELECT e.rowid as examen_id, e.rowid, e.inscripcion_id, e.evaluacion_id, i.categoria_id, e.active, ' +
				'e.terminado, e.timeout, e.res_by_promedio, e.created_at as examen_at, i.user_id, i.allowed_to_answer, i.signed_by, i.created_at as inscrito_at, ' +
				'e.res_correctas, e.res_incorrectas, e.res_promedio, e.res_puntos, e.res_cant_pregs, e.res_tiempo, e.res_tiempo_format, ' +
				'u.nombres, u.apellidos, u.sexo, u.username, u.entidad_id, ' +
				'u.imagen_id, IFNULL("' + perfil_path + '" || im.nombre, CASE WHEN u.sexo="F" THEN "' + User.$default_female + '" ELSE "' + User.$default_male + '" END ) as imagen_nombre, ' +
				'en.nombre as nombre_entidad, en.alias as alias_entidad, en.lider_id, en.lider_nombre, en.alias, ' +
				'en.logo_id, IFNULL("' + perfil_path + '" || im2.nombre, "perfil/system/avatars/no-photo.jpg") as logo_nombre, ' +
				'ct.nombre as nombre_categ, ct.abrev as abrev_categ, ct.descripcion as descripcion_categ, ct.idioma_id, ct.traducido ' +
			'FROM ws_examen_respuesta e ' +
			'inner join ws_inscripciones i on i.rowid=e.inscripcion_id and i.deleted_at is null ' +
			'inner join users u on u.rowid=i.user_id and u.deleted_at is null ' +
			'inner join ws_categorias_king ck on ck.rowid=i.categoria_id and ck.deleted_at is null ' +
			'inner join ws_user_event ue on ue.user_id=u.rowid and ue.evento_id=? ' +
			'inner join ws_entidades en on en.rowid=u.entidad_id and en.deleted_at is null  ' +
			'left join ws_categorias_traduc ct on ck.rowid=ct.categoria_id and ct.idioma_id=? and ct.deleted_at is null  ' +
			'left join images im on im.rowid=u.imagen_id and im.deleted_at is null ' +
			'left join images im2 on im2.rowid=en.logo_id and im2.deleted_at is null ' + 
			'WHERE e.deleted_at is null and e.gran_final=?';

		db.query($consulta, [$evento_id, $idioma_id, $gran_final]).then(($examenes)=>{
			
			res.send($examenes);
		});

	})
		
}
	



function putExamenDetalle(req, res) {
	User.fromToken(req).then(($user)=>{
		
		$examen_id 		= req.body.examen_id;
		let perfil_path = User.$perfil_path;
		let examen 		= {}

		
		$consulta = 'SELECT e.rowid as examen_id, e.rowid, e.inscripcion_id, e.evaluacion_id, i.categoria_id, e.active, ' + 
				'e.res_tiempo, e.res_tiempo_format, e.gran_final, e.res_promedio, e.res_puntos, e.res_cant_pregs, ' +
                'e.terminado, e.timeout, e.res_by_promedio, e.created_at as examen_at, i.user_id, i.allowed_to_answer, i.signed_by, i.created_at as inscrito_at, ' +
                'u.nombres, u.apellidos, u.sexo, u.username, u.entidad_id, ' +
                'u.imagen_id, IFNULL("' + perfil_path + '" || im.nombre, CASE WHEN u.sexo="F" THEN "' + User.$default_female + '" ELSE "' + User.$default_male + '" END ) as imagen_nombre, ' +
                'en.nombre as nombre_entidad, en.alias as alias_entidad, en.lider_id, en.lider_nombre, en.alias, ' +
                'en.logo_id, IFNULL("' + perfil_path + '" || im2.nombre, "perfil/system/avatars/no-photo.jpg") as logo_nombre, ' +
                'ct.nombre as nombre_categ, ct.abrev as abrev_categ, ct.descripcion as descripcion_categ, ct.idioma_id, ct.traducido ' +
            'FROM ws_examen_respuesta e ' +
            'inner join ws_inscripciones i on i.rowid=e.inscripcion_id and i.deleted_at is null ' +
            'inner join users u on u.rowid=i.user_id and u.deleted_at is null ' +
            'inner join ws_categorias_king ck on ck.rowid=i.categoria_id and ck.deleted_at is null ' +
            'inner join ws_entidades en on en.rowid=u.entidad_id and en.deleted_at is null  ' +
            'left join ws_categorias_traduc ct on ck.rowid=ct.categoria_id and ct.idioma_id=e.idioma_id and ct.deleted_at is null ' +
            'left join images im on im.rowid=u.imagen_id and im.deleted_at is null  ' +
            'left join images im2 on im2.rowid=en.logo_id and im2.deleted_at is null ' +
            'where e.rowid=? and e.deleted_at is null ';
			

		db.query($consulta, [$examen_id]).then(($examenes)=>{

			if ($examenes.length > 0) {
				examen 				= $examenes[0];
				examen.tiempo 		= 0;
				let $respuestas 	= [];
				
				
				let consOpciones = 'SELECT o.rowid, o.definicion, o.orden, o.pregunta_traduc_id, o.is_correct, o.added_by, o.created_at, o.updated_at ' + 
					'FROM ws_opciones o ' + 
					'WHERE o.pregunta_traduc_id=?';
				
				
				$consulta = 'SELECT r.*, r.rowid, pe.orden FROM ws_respuestas r ' + 
					'INNER JOIN ws_examen_respuesta ex on ex.rowid=r.examen_respuesta_id and ex.deleted_at is null ' + 
					'INNER JOIN ws_evaluaciones ev on ev.rowid=ex.evaluacion_id and ev.deleted_at is null ' + 
					'INNER JOIN ws_pregunta_evaluacion pe on pe.evaluacion_id=ev.rowid and r.pregunta_king_id=pe.pregunta_id  ' + 
					'WHERE r.examen_respuesta_id=? and r.pregunta_king_id is not null  ' + 
					'group by r.pregunta_king_id order by orden'
				db.query($consulta, [examen.examen_id]).then((respuestas)=>{
					
					$respuestas = respuestas;
					
					let promesas = $respuestas.map((respuesta, $i)=>{
						let promResp = new Promise(function(resolveResp, rejectResp){
							
							examen.tiempo 			= examen.tiempo + respuesta.tiempo;
							respuesta.tiempo_format = window.msToTime(respuesta.tiempo);
					
							$consulta = 'SELECT pk.rowid as pg_id, pk.rowid, 1 as is_preg, pk.descripcion, pk.tipo_pregunta, pk.duracion, pk.categoria_id, pk.puntos, pk.aleatorias, pk.added_by, pk.created_at as gp_created_at, pk.updated_at as gp_updated_at, 	' + 
									'pt.rowid as pg_traduc_id, pt.enunciado, NULL as definicion, pt.ayuda, pt.idioma_id, pt.texto_arriba, pt.texto_abajo, pt.traducido, pt.updated_at as pgt_updated_at	' + 
								'FROM ws_preguntas_king pk	' + 
								'INNER JOIN ws_pregunta_traduc pt on pt.pregunta_id=pk.rowid and pt.idioma_id=? and pt.deleted_at is null	' + 
								'WHERE pk.rowid=? AND pk.deleted_at is null	';
						
							db.query($consulta, [ examen.idioma_id, respuesta.pregunta_king_id ]).then(($preguntas_king)=>{
								console.log($preguntas_king);
								if ($preguntas_king.length > 0) {
									let pregunta = $preguntas_king[0];
									
									db.query(consOpciones, [ pregunta.pg_traduc_id ]).then((opciones)=>{
										
										for (let i = 0; i < opciones.length; i++) {
											if (opciones[i].is_correct) {
												pregunta.opc_correcta = opciones[i];
											}
											if (opciones[i].rowid == respuesta.opcion_id) {
												pregunta.opc_elegida = opciones[i];
											}
										}
										pregunta.opciones = opciones;
										respuesta.pregunta = pregunta;
										resolveResp();
									})
								}
											
							})			
						})
						return promResp;
					})	
					return Promise.all(promesas);
				}).then(()=>{
					
					examen.respuestas = $respuestas;
					
					res.send(examen);
				})
			}
		});

	})
		
}
	


module.exports = router;