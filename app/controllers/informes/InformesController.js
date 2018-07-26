var express         = require('express');
var router          = express.Router();
var User            = require('../../conexion/Models/User');
var ExamenRespuesta = require('../../conexion/Models/ExamenRespuesta');
var db              = require('../../conexion/connWeb');





router.route('/mis-examenes').get(getMisExamenes)



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
				return db.query('SELECT *, rowid FROM ws_examen_respuesta WHERE inscripcion_id=?', [$inscripcion.rowid]);
			})
			return Promise.all(mapeando);
		}).then(($examenes_all)=>{
			//console.log($examenes_all);
			let mapeando = $examenes_all.map(($examen, $key)=>{
				return ExamenRespuesta.calcularExamen($examen.rowid);
			})
			return Promise.all(mapeando);
		
		}).then(($examenes_puntajes)=>{
			if ($examenes_puntajes)
				res.send($examenes_puntajes);
			else
			res.send();
		});

		
	
	})
		
}
	


module.exports = router;