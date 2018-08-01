var express         = require('express');
var router          = express.Router();
var User            = require('../../conexion/Models/User');
var Evento          = require('../../conexion/Models/Evento');
var Categoria       = require('../../conexion/Models/Categoria');
var ExamenRespuesta = require('../../conexion/Models/ExamenRespuesta');
var db              = require('../../conexion/connWeb');





router.route('/calcular-resultados').put(putCalcularResultados);
router.route('/todos-examenes-ent').put(putTodosExamenesEnt);



function putCalcularResultados(req, res) {
	User.fromToken(req).then(($user)=>{
		
		$evento_id = $user.evento_selected_id;
		let perfil_path = User.$perfil_path;
		
		$consulta = 'SELECT e.rowid as examen_id, e.inscripcion_id, e.evaluacion_id, i.categoria_id, e.active, ' +
                'e.terminado, e.timeout, e.res_by_promedio, e.created_at as examen_at, i.user_id, i.allowed_to_answer, i.signed_by, i.created_at as inscrito_at, ' +
                'u.nombres, u.apellidos, u.sexo, u.username, u.entidad_id, ' +
                'u.imagen_id, IFNULL("' + perfil_path + '" || im.nombre, CASE WHEN u.sexo="F" THEN "' + User.$default_female + '" ELSE "' + User.$default_male + '" END ) as imagen_nombre, ' +
                'en.nombre as nombre_entidad, en.alias as alias_entidad, en.lider_id, en.lider_nombre, en.alias, ' +
                'en.logo_id, IFNULL("' + perfil_path + '" || im.nombre, "perfil/system/avatars/no-photo.jpg") as logo_nombre, ' +
                'ct.nombre as nombre_categ, ct.abrev as abrev_categ, ct.descripcion as descripcion_categ, ct.idioma_id, ct.traducido ' +
            'FROM ws_examen_respuesta e ' +
            'inner join ws_inscripciones i on i.rowid=e.inscripcion_id and i.deleted_at is null ' +
            'inner join users u on u.rowid=i.user_id and u.deleted_at is null ' +
            'inner join ws_categorias_king ck on ck.rowid=i.categoria_id and ck.deleted_at is null ' +
            'inner join ws_user_event ue on ue.user_id=u.rowid and ue.evento_id=? ' +
            'inner join ws_entidades en on en.rowid=u.entidad_id and en.deleted_at is null  ' +
            'left join ws_categorias_traduc ct on ck.rowid=ct.categoria_id and ct.idioma_id=e.idioma_id and ct.deleted_at is null ' +
            'left join images im on im.rowid=u.imagen_id and im.deleted_at is null  ' +
            'left join images im2 on im2.rowid=en.logo_id and im2.deleted_at is null ' +
            'where e.deleted_at is null ';
			
		db.query($consulta, [$evento_id]).then(($examenes)=>{
            
			let mapeando = $examenes.map(($examen, $key)=>{
				
				return ExamenRespuesta.calcular($examen);
				
			})
			return Promise.all(mapeando);
		}).then(($examenes_all)=>{
            console.log($examenes_all);
            let mapeando = $examenes_all.map(($examen, $key)=>{
				let consulta = 'UPDATE ws_examen_respuesta SET res_correctas=?, res_incorrectas=?, res_by_promedio=?, res_promedio=?, res_puntos=?, res_cant_pregs=?, res_tiempo=?, res_tiempo_format=? WHERE rowid=?';
				return db.query(consulta, [$examen.correctas, $examen.incorrec_reales, $examen.por_promedio, $examen.promedio, $examen.puntos, $examen.cantidad_pregs, $examen.tiempo, $examen.tiempo_format, $examen.examen_id]);
				
			})
			return Promise.all(mapeando);
		
		}).then(($examenes_puntajes)=>{
			
			res.send('Calculados con éxito');

		});

		
	
	})
		
}
	


function putTodosExamenesEnt(req, res) {
	User.fromToken(req).then(($user)=>{
		
        $evento_id              = req.body.evento_id || $user.evento_selected_id;
        $gran_final             = req.body.gran_final || 0;
        let perfil_path         = User.$perfil_path;
        $requested_entidades    = req.body.requested_entidades || undefined;
        $entidades              = [];
        
        $consulta = 'SELECT distinct en.rowid as entidad_id, en.nombre as nombre_entidad, en.alias as alias_entidad, en.lider_id, en.lider_nombre, en.alias, ' +
                'en.logo_id, IFNULL("' + perfil_path + '" || im2.nombre, "perfil/system/avatars/no-photo.jpg") as logo_nombre ' +
            'FROM  ws_entidades en  ' +
            'inner join users u on en.rowid=u.entidad_id and en.deleted_at is null and u.deleted_at is null ' +
            'left join images im2 on im2.rowid=en.logo_id and im2.deleted_at is null ' +
            'where en.deleted_at is null and en.evento_id=? ';
                    
			
		db.query($consulta, [$evento_id]).then(($entidades_f)=>{

		
            // Si hay entidades especificadas en el pedido...
            if ($requested_entidades) {
                // Eliminamos las entidades NO pedidas

                $entidades_f.map(($entidad, $key)=>{
				
                    $hay = $requested_entidades.indexOf($entidad.entidad_id);
                    console.log('$hay', $hay, $entidad.entidad_id, $requested_entidades, $entidades_f)
                    if ($hay) {
                        $entidades.push($entidad);
                    }
                    
                })

            }else{
                $entidades = $entidades_f;
            }
            
            console.log('A mapear. Debe ir al final de todos los hay, sincrónico');
            
            let mapeando = $entidades.map(($entidad, $key)=>{
                return new Promise((resolve, reject)=>{
                    $consulta_ex = 'SELECT e.rowid as examen_id, e.inscripcion_id, e.evaluacion_id, i.categoria_id, e.active, ' +
                            'e.terminado, e.timeout, e.res_by_promedio, e.created_at as examen_at, i.user_id, i.allowed_to_answer, i.signed_by, i.created_at as inscrito_at, ' +
                            'e.res_correctas, e.res_incorrectas, e.res_promedio, e.res_puntos, e.res_cant_pregs, e.res_tiempo, e.res_tiempo_format, ' +
                            'u.nombres, u.apellidos, u.sexo, u.username, u.entidad_id, ' +
                            'u.imagen_id, IFNULL("' + perfil_path + '" || im.nombre, CASE WHEN u.sexo="F" THEN "' + User.$default_female + '" ELSE "' + User.$default_male + '" END ) as imagen_nombre, ' +
                            'ct.nombre as nombre_categ, ct.abrev as abrev_categ, ct.descripcion as descripcion_categ, ct.idioma_id, ct.traducido ' +
                        'FROM ws_examen_respuesta e ' +
                        'inner join ws_inscripciones i on i.rowid=e.inscripcion_id and i.deleted_at is null ' +
                        'inner join ws_evaluaciones ev on ev.rowid=e.evaluacion_id and ev.actual=1 and e.deleted_at is null ' +
                        'inner join users u on u.rowid=i.user_id and u.deleted_at is null ' +
                        'inner join ws_categorias_king ck on ck.rowid=i.categoria_id and ck.evento_id=? and ck.deleted_at is null ' +
                        'left join ws_categorias_traduc ct on ck.rowid=ct.categoria_id and ct.idioma_id=e.idioma_id and ct.deleted_at is null ' +
                        'left join images im on im.rowid=u.imagen_id and im.deleted_at is null  ' +
                        'where e.deleted_at is null and u.entidad_id=? and e.gran_final='+$gran_final;

                    db.query($consulta_ex, [$evento_id, $entidad.entidad_id] ).then(($examenes)=>{
                        $entidad.examenes = $examenes;
                        resolve();
                    });
                })
                
            })
            return Promise.all(mapeando);
			
		}).then(()=>{
            res.send($entidades);
		});
	
	})
		
}
	


module.exports = router;