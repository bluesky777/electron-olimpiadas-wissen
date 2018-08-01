var express         = require('express');
var router          = express.Router();
var User            = require('../../conexion/Models/User');
var ExamenRespuesta = require('../../conexion/Models/ExamenRespuesta');
var db              = require('../../conexion/connWeb');





router.route('/mis-examenes').get(getMisExamenes)
router.route('/todos-los-examenes').get(getTodosLosExamenes)



function getMisExamenes(req, res) {
	User.fromToken(req).then(($user)=>{
		
		$evento_id = $user.evento_selected_id;
		
		
		$consulta = 'SELECT i.*, i.rowid, ct.categoria_id, ct.nombre, ct.abrev, ct.descripcion, ct.idioma_id, ct.traducido ' +
			'FROM ws_inscripciones i  ' +
			'inner join ws_categorias_king c on c.id=i.categoria_id and c.deleted_at is null  ' +
			'inner join ws_categorias_traduc ct on ct.categoria_id=c.id and ct.idioma_id=? and ct.deleted_at is null  ' +
			'where i.user_id=? and i.deleted_at is null';
			
		db.query($consulta, [$user.idioma_main_id, $user.rowid]).then(($inscripciones)=>{
			let mapeando = $inscripciones.map(($inscripcion, $key)=>{
				
				$consulta = 'SELECT e.rowid as examen_id, e.inscripcion_id, e.evaluacion_id, i.categoria_id, e.active, ' +
						'e.terminado, e.timeout, e.res_by_promedio, e.created_at as examen_at, i.user_id, i.allowed_to_answer, i.signed_by, i.created_at as inscrito_at, ' +
						'ct.nombre as nombre_categ, ct.abrev as abrev_categ, ct.descripcion as descripcion_categ, ct.idioma_id, ct.traducido ' +
					'FROM ws_examen_respuesta e ' +
					'inner join ws_inscripciones i on i.rowid=e.inscripcion_id and i.rowid=? and i.deleted_at is null ' +
					'inner join ws_categorias_king ck on ck.rowid=i.categoria_id and ck.deleted_at is null ' +
					'left join ws_categorias_traduc ct on ck.id=ct.categoria_id and ct.idioma_id=e.idioma_id and ct.deleted_at is null ' +
					'where e.deleted_at is null ';
				
				return db.query($consulta, [$inscripcion.rowid]);
			})
			return Promise.all(mapeando);
		}).then(($examenes_all)=>{
			let mapeando = $examenes_all.map(($examen, $key)=>{
				return ExamenRespuesta.calcular($examen);
			})
			return Promise.all(mapeando);
		
		}).then(($examenes_puntajes)=>{
			console.log($examenes_puntajes);
			if ($examenes_puntajes)
				res.send($examenes_puntajes);
			else
				res.send([]);
		});

		
	
	})
		
}
	


function getTodosLosExamenes(req, res) {
	User.fromToken(req).then(($user)=>{
		
		$evento_id 		= $user.evento_selected_id;
		$idioma_id 		= req.query.idioma_id || $user.idioma_main_id;
		$gran_final 	= req.query.gran_final || 0;
		let perfil_path = User.$perfil_path;

		
		$consulta = 'SELECT e.id as examen_id, e.inscripcion_id, e.evaluacion_id, i.categoria_id, e.active, ' +
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
	


module.exports = router;