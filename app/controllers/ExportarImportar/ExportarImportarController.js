var express         = require('express');
var router          = express.Router();
var User            = require('../../conexion/Models/User');
var ExamenRespuesta = require('../../conexion/Models/ExamenRespuesta');
var Inscripcion     = require('../../conexion/Models/Inscripcion');
var db              = require('../../conexion/connWeb');





router.route('/ver-cambios').put(putVerCambios);
router.route('/revisar-datos').put(putRevisarDatos);
router.route('/importar-datos').put(putImportarDatos);




function putVerCambios(req, res) {
    let $usuarios = [];
    
	User.fromToken(req).then(($user)=>{
		
		$fecha_ini 	= req.body.fecha_ini;
		$fecha_fin 	= req.body.fecha_fin;
	
		$consulta = 'SELECT u.*, u.rowid, e.nombre as nombre_entidad, e.alias as alias_entidad, ' + 
                'ue.user_id, ue.evento_id, ue.nivel_id, ue.pagado, ue.pazysalvo, ue.signed_by, 1 as exportar ' + 
            'FROM  users u  ' + 
            'INNER JOIN ws_user_event ue on ue.user_id=u.rowid  ' + 
            'LEFT JOIN ws_entidades e on e.rowid=u.entidad_id ' + 
            'where u.deleted_at is null and u.created_at > ? and u.created_at < ? ';

		return db.query($consulta, [ $fecha_ini, $fecha_fin ] );

	}).then((usuarios)=>{
        $usuarios       = usuarios;
        let promesas    = $usuarios.map(($usuario, key)=>{
            return new Promise((resolve, reject)=>{
                
                $consulta_ex = 'SELECT e.id as examen_id, e.rowid, e.inscripcion_id, e.evaluacion_id, i.categoria_id, e.active, ' + 
                        'e.terminado, e.gran_final, e.timeout, e.created_at as examen_at, i.user_id, i.allowed_to_answer, i.signed_by, i.created_at as inscrito_at, ' + 
                        'ct.nombre as nombre_categ, ct.abrev as abrev_categ, ct.descripcion as descripcion_categ, ct.idioma_id ' + 
                    'FROM ws_examen_respuesta e ' + 
                    'INNER JOIN ws_inscripciones i on i.rowid=e.inscripcion_id and i.user_id=? and i.deleted_at is null ' + 
                    'INNER JOIN ws_evaluaciones ev on ev.rowid=e.evaluacion_id and e.deleted_at is null ' + 
                    'INNER JOIN ws_categorias_king ck on ck.rowid=i.categoria_id and ck.deleted_at is null ' + 
                    'LEFT JOIN ws_categorias_traduc ct on ck.rowid=ct.categoria_id and ct.idioma_id=? and ct.deleted_at is null ' + 
                    'WHERE e.deleted_at is null ';

                db.query($consulta_ex, [ $usuario.rowid, $usuario.idioma_main_id ] ).then(($examenes)=>{
                    $usuario.examenes   = $examenes;
                    let promExa         = $usuario.examenes.map(($examen, $j)=>{
                        
                        $consulta_ex = 'SELECT *, rowid FROM ws_respuestas r WHERE r.examen_respuesta_id=?';

                        return db.query($consulta_ex, [ $examen.examen_id ] ).then(($respuestas)=>{
                            $examen.respuestas = $respuestas;
                        });

                    })
                    Promise.all(promExa).then(()=>{
                        resolve();
                    })
                });
            })
        })
        
        return Promise.all(promesas)
        
    }).then(()=>{
        res.send($usuarios);
    })
		
}
	



function putRevisarDatos(req, res) {
	User.fromToken(req).then(($user)=>{
		
        $array_usuarios 	= req.body.array_usuarios;
        $array_res 			= [];
	
        let promesas    = $array_usuarios.map(($usuario, key)=>{
            return new Promise((resolve, reject)=>{
                
                $consulta_ex = 'SELECT u.*, u.rowid, e.nombre as nombre_entidad, e.alias as alias_entidad, ' +
                        'ue.user_id, ue.evento_id, ue.nivel_id, ue.pagado, ue.pazysalvo, ue.signed_by ' +
                    'FROM  users u  ' +
                    'INNER JOIN ws_user_event ue on ue.user_id=u.id  ' +
                    'LEFT JOIN ws_entidades e on e.rowid=u.entidad_id ' +
                    'WHERE u.deleted_at is null and u.username=? ';

                db.query($consulta_ex, [ $usuario.username ] ).then(($usuarios)=>{

                    if ($usuarios.length > 0) {
                        
                        $consulta_ex = 'SELECT e.id as examen_id, e.rowid, e.inscripcion_id, e.evaluacion_id, i.categoria_id, e.active, ' + 
                                'e.terminado, e.timeout, e.created_at as examen_at, i.user_id, i.allowed_to_answer, i.signed_by, i.created_at as inscrito_at, ' + 
                                'ct.nombre as nombre_categ, ct.abrev as abrev_categ, ct.descripcion as descripcion_categ, ct.idioma_id ' + 
                            'FROM ws_examen_respuesta e ' + 
                            'INNER JOIN ws_inscripciones i on i.id=e.inscripcion_id and i.user_id=:user_id and i.deleted_at is null ' + 
                            'INNER JOIN ws_evaluaciones ev on ev.id=e.evaluacion_id and e.deleted_at is null ' + 
                            'INNER JOIN ws_categorias_king ck on ck.id=i.categoria_id and ck.deleted_at is null ' + 
                            'LEFT JOIN ws_categorias_traduc ct on ck.id=ct.categoria_id and ct.idioma_id=:idioma_id and ct.deleted_at is null ' + 
                            'WHERE e.deleted_at is null ';

                        db.query($consulta_ex, [ $usuarios[0].rowid, $usuarios[0].idioma_main_id ] ).then(($examenes)=>{
                            $usuarios[0].examenes = $examenes;
                            $comparando = { en_db: $usuarios[0], a_importar: $usuario };
                            $array_res.push($comparando);
                            resolve();
                        });

                    }else{
                        resolve();
                    }
                });
            })
        })
        
        return Promise.all($array_res)
        
    }).then(()=>{
        res.send($array_res);
    })
		
}
	



function putImportarDatos(req, res) {
	User.fromToken(req).then(($user)=>{
		
        $array_usuarios 	= req.body.array_usuarios;
        $array_res 			= { importados: 0, no_importados: 0, usuarios_agregados: [] };
        let now             = window.fixDate(new Date(), true);
        
        let promesas    = $array_usuarios.map(($usuario, key)=>{
            return new Promise((resolve, reject)=>{
                
                $consulta = 'SELECT * FROM  users u where u.username=? ';

                db.query($consulta, [ $usuario.username ] ).then(($usuarios)=>{

                    if ($usuarios.length > 0) {
                        $usuario.username = $usuario['username'] + '-' + window.getRandomInt(99, 999);
                    }
                    
                    User.create($usuario.nombres, $usuario.apellidos, $usuario.sexo, $usuario.username, $usuario.password, $usuario.email, $usuario.is_superuser, $usuario.cell, $usuario.edad, $usuario.entidad_id, $usuario.evento_selected_id, $usuario.nivel_id, $usuario.idioma_main_id).then((user_id)=>{
                        
                        $array_res.usuarios_agregados.push($usuario);
                        
                        $examenes_a_insert 	= $usuario['examenes'];
                        let promeExas       = $examenes_a_insert.map(($examen, key)=>{
                            return new Promise((resolveExa, rejectExa)=>{
                                
                                $categoria_id 	= $examen['categoria_id'];	
                                $consulta 		= 'INSERT INTO ws_inscripciones(user_id, categoria_id, signed_by, created_at) VALUES(?,?,?,?)';
                                db.query($consulta, [ user_id, $categoria_id, $usuario.signed_by, now] ).then(()=>{
                                    Inscripcion.one(user_id, $categoria_id).then(($inscripcion)=>{

                                        $consulta 		= 'INSERT INTO ws_examen_respuesta(inscripcion_id, evaluacion_id, categoria_id, terminado, gran_final, created_at) VALUES(?,?,?,?,?,?)';
                                        db.query($consulta, [ $inscripcion.rowid, $examen['evaluacion_id'], $categoria_id, $examen['terminado'], $examen['gran_final'], now ] ).then(($exa)=>{

                                            $respuestas 		= $examen['respuestas'];
                                            
                                            let promeResp = $respuestas.map(($resp, key)=>{
                                                $categoria_id 	= $examen['categoria_id'];	
                                                $consulta 		= 'INSERT INTO ws_respuestas(examen_respuesta_id, pregunta_king_id, tiempo, tiempo_aproximado, preg_traduc_id, idioma_id, tipo_pregunta, puntos_maximos, puntos_adquiridos, opcion_id, created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)';
                                                return db.query($consulta, [ $exa.insertId, $resp['pregunta_king_id'], $resp['tiempo'], $resp['tiempo_aproximado'], $resp['preg_traduc_id'], $resp['idioma_id'], $resp['tipo_pregunta'], $resp['puntos_maximos'], $resp['puntos_adquiridos'], $resp['opcion_id'], now ] );
                                            })
                                            
                                            Promise.all(promeResp).then(()=>{
                                                resolveExa();
                                            })
                                        });
                                        
                                    });
                                });
                            })
                        })
                        
                        return Promise.all(promeExas).then(()=>{
                            $array_res['importados'] = $array_res['importados'] + 1;
                            resolve();
                        })
                    })
                });
            })
        })
        
        return Promise.all(promesas)
        
    }).then(()=>{
        res.send($array_res);
    })
		
}
	





module.exports = router;