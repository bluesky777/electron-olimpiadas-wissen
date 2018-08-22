var express         = require('express');
var router          = express.Router();
var User            = require('../../conexion/Models/User');
var Evento          = require('../../conexion/Models/Evento');
var ExamenRespuesta = require('../../conexion/Models/ExamenRespuesta');
var db              = require('../../conexion/connWeb');





router.route('/calcular-resultados').put(putCalcularResultados);
router.route('/todos-examenes-ent').put(putTodosExamenesEnt);
router.route('/examenes-ent-categ').put(putExamenesEntCateg);
router.route('/examenes-categorias').put(putExamenesCategorias);
router.route('/examenes-ejecutandose').put(putExamenesEjecutandose);

// Voy a agregar la function a router, espero no dañarlo. Para no crear la función de nuevo en InformesController
router.putTodosExamenesEnt      = putTodosExamenesEnt;
router.putExamenesEntCateg      = putExamenesEntCateg;
router.putExamenesCategorias    = putExamenesCategorias;


function putCalcularResultados(req, res) {
	User.fromToken(req).then(($user)=>{
		
		$evento_id = $user.evento_selected_id;
		let perfil_path = User.$perfil_path;
		
		$consulta = 'SELECT e.rowid as examen_id, e.rowid, e.inscripcion_id, e.evaluacion_id, i.categoria_id, e.active, ' +
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
        $gran_final             = 0;
        let perfil_path         = User.$perfil_path;
        $requested_entidades    = req.body.requested_entidades || undefined;
        $entidades              = [];
        
        // Puede ser pedido por GET en Control - ruta InformesController
        if (req.method == 'GET') {
            $gran_final         = (req.query.gran_final == 0 || req.query.gran_final == 'false' || req.query.gran_final == false) ? 0 : 1;
        }else if(req.method == 'PUT'){
            $gran_final         = (req.body.gran_final == 0 || req.body.gran_final == 'false' || req.body.gran_final == false) ? 0 : 1;
        }
        
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
                    
                    if ($hay) {
                        $entidades.push($entidad);
                    }
                })

            }else{
                $entidades = $entidades_f;
            }
            
            
            let mapeando = $entidades.map(($entidad, $key)=>{
                return new Promise((resolve, reject)=>{
                    $consulta_ex = 'SELECT e.rowid as examen_id, e.rowid, e.inscripcion_id, e.evaluacion_id, i.categoria_id, e.active, ' +
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







function putExamenesEntCateg(req, res) {
	User.fromToken(req).then(($user)=>{
		
        $evento_id              = req.body.evento_id || $user.evento_selected_id;
        $gran_final             = 0;
        let perfil_path         = User.$perfil_path;
        $idioma_id              = req.body.idioma_id || $user.idioma_main_id;
        $requested_entidades    = req.body.requested_entidades || undefined;
        $entidades              = [];
        $requested_categorias   = req.body.requested_categorias || undefined;
        $categorias             = [];
        
        // Puede ser pedido por GET en Control - ruta InformesController
        if (req.method == 'GET') {
            $gran_final         = (req.query.gran_final == 0 || req.query.gran_final == 'false' || req.query.gran_final == false) ? 0 : 1;
        }else if(req.method == 'PUT'){
            $gran_final         = (req.body.gran_final == 0 || req.body.gran_final == 'false' || req.body.gran_final == false) ? 0 : 1;
        }
        
        $consulta = 'SELECT distinct en.rowid as entidad_id, en.nombre as nombre_entidad, en.alias as alias_entidad, en.lider_id, en.lider_nombre, en.alias, ' +
                'en.logo_id, IFNULL("' + perfil_path + '" || im2.nombre, "perfil/system/avatars/no-photo.jpg") as logo_nombre ' +
            'FROM ws_entidades en ' +
            'INNER JOIN users u on en.rowid=u.entidad_id and en.deleted_at is null and u.deleted_at is null ' +
            'LEFT JOIN images im2 on im2.rowid=en.logo_id and im2.deleted_at is null ' +
            'WHERE en.deleted_at is null and en.evento_id=? ';
                    
            
		db.query($consulta, [$evento_id]).then(($entidades_f)=>{

            // Si hay entidades especificadas en el pedido...
            if ($requested_entidades) {
                // Eliminamos las entidades NO pedidas
                $entidades_f.map(($entidad, $key)=>{
                    $hay = $requested_entidades.indexOf($entidad.entidad_id);
                    
                    if ($hay > -1) {
                        $entidades.push($entidad);
                    }
                })

            }else{
                $entidades = $entidades_f;
            }
            
            
            return new Promise((resolve, reject)=>{
                // Si hay categorías especificadas ...
                if ($requested_categorias) {
                    let promesas = $requested_categorias.map(($categoria, $key)=>{
                        
                        $consulta_categ = 'SELECT distinct ck.rowid as categoria_id, ct.rowid as categ_traduc_id, ct.nombre as nombre_categ, ct.abrev as abrev_categ, ct.descripcion as descripcion_categ, ' + 
                                    'ct.idioma_id, ct.traducido ' + 
                                'FROM ws_categorias_king ck ' + 
                                'LEFT JOIN ws_categorias_traduc ct on ck.rowid=ct.categoria_id and ct.idioma_id=? and ct.deleted_at is null ' + 
                                'WHERE ck.deleted_at is null and ck.evento_id=? and ck.rowid=?';

                        return db.query($consulta_categ, [$idioma_id, $evento_id, $categoria ] ).then(($categorias_f)=>{
                                
                            if ($categorias_f.length > 0) {
                                $categorias.push($categorias_f[0]);
                                return $categorias_f[0];
                            }
                        });
                    })
                    Promise.all(promesas).then((result)=>{
                        resolve(result);
                    })
                }else{
                    $consulta_categ = 'SELECT distinct ck.rowid as categoria_id, ct.rowid as categ_traduc_id, ct.nombre as nombre_categ, ct.abrev as abrev_categ, ct.descripcion as descripcion_categ,  ' + 
                            'ct.idioma_id, ct.traducido ' + 
                        'FROM ws_categorias_king ck ' + 
                        'LEFT JOIN ws_categorias_traduc ct on ck.rowid=ct.categoria_id and ct.idioma_id=? and ct.deleted_at is null ' + 
                        'WHERE ck.deleted_at is null and ck.evento_id=?';

                    db.query($consulta_categ, [$idioma_id, $evento_id] ).then((categorias)=>{
                        $categorias = categorias;
                        resolve($categorias);
                    });
                    
                }
            })

            
            
        }).then((result)=>{

            let promesas = [];
            
            $cant_ent = $entidades.length;
            for ($j=0; $j < $cant_ent; $j++) {
                
                $entidad_id 					= $entidades[$j].entidad_id;
                $entidades[$j].categorias 		= [];
                $cant_categ 					= $categorias.length;

                for ($m=0; $m < $cant_categ; $m++) { 
                    $entidades[$j].categorias.push(Object.assign({}, $categorias[$m]));
                }

                for ($k=0; $k < $cant_categ; $k++) { 
                    asignar($j, $k);
                }
                

            }
            
            function asignar($j, $k) {
                    
                $consulta_ex = 'SELECT e.rowid as examen_id, e.rowid, e.inscripcion_id, e.evaluacion_id, i.categoria_id, e.active, ' +
                                'e.terminado, e.timeout, e.res_by_promedio, e.created_at as examen_at, i.user_id, i.allowed_to_answer, i.signed_by, i.created_at as inscrito_at, ' +
                                'e.res_correctas, e.res_incorrectas, e.res_promedio, e.res_puntos, e.res_cant_pregs, e.res_tiempo, e.res_tiempo_format, ' +
                                'u.nombres, u.apellidos, u.sexo, u.username, u.entidad_id, ' +
                                'u.imagen_id, IFNULL("' + perfil_path + '" || im.nombre, CASE WHEN u.sexo="F" THEN "' + User.$default_female + '" ELSE "' + User.$default_male + '" END ) as imagen_nombre, ' +
                                'ct.nombre as nombre_categ, ct.abrev as abrev_categ, ct.descripcion as descripcion_categ, ct.idioma_id, ct.traducido ' +
                            'FROM ws_examen_respuesta e ' +
                            'INNER JOIN ws_inscripciones i on i.rowid=e.inscripcion_id and i.deleted_at is null ' +
                            'INNER JOIN ws_evaluaciones ev on ev.rowid=e.evaluacion_id and ev.actual=1 and e.deleted_at is null ' +
                            'INNER JOIN users u on u.rowid=i.user_id and u.deleted_at is null ' +
                            'INNER JOIN ws_categorias_king ck on ck.rowid=i.categoria_id and ck.rowid=? and ck.deleted_at is null ' +
                            'LEFT JOIN ws_categorias_traduc ct on ck.rowid=ct.categoria_id and ct.idioma_id=e.idioma_id and ct.deleted_at is null ' +
                            'LEFT JOIN images im on im.rowid=u.imagen_id and im.deleted_at is null ' +
                            'WHERE e.deleted_at is null and u.entidad_id=? and e.gran_final='+$gran_final;

                $examenesProm = db.query($consulta_ex, [ $entidades[$j].categorias[$k].categoria_id, $entidad_id ] ).then(($examenes)=>{
                    $entidades[$j].categorias[$k].examenes = $examenes;
                });
                promesas.push($examenesProm);
                
            }
            
            return Promise.all(promesas)

            
        }).then((result)=>{
            
            res.send($entidades);
            
        })
    })
	
}
            
            
	


function putExamenesCategorias(req, res) {
	User.fromToken(req).then(($user)=>{
		
        $evento_id              = req.body.evento_id || $user.evento_selected_id;
        let $gran_final         = 0;
        let perfil_path         = User.$perfil_path;
        $categorias             = [];
        
        // Puede ser pedido por GET en Control - ruta InformesController
        if (req.method == 'GET') {
            $gran_final         = (req.query.gran_final == 0 || req.query.gran_final == 'false' || req.query.gran_final == false) ? 0 : 1;
        }else if(req.method == 'PUT'){
            $gran_final         = (req.body.gran_final == 0 || req.body.gran_final == 'false' || req.body.gran_final == false) ? 0 : 1;
        }
        
        $consulta = 'SELECT distinct ck.rowid as categoria_id, ct.rowid as categ_traduc_id, ct.nombre as nombre_categ, ct.abrev as abrev_categ, ct.descripcion as descripcion_categ, ' + 
                'ct.idioma_id, ct.traducido ' + 
            'FROM ws_categorias_king ck ' + 
            'INNER JOIN ws_inscripciones i on i.categoria_id=ck.rowid and i.deleted_at is null ' + 
            'INNER JOIN ws_examen_respuesta e ON i.rowid=e.inscripcion_id AND e.deleted_at is null ' + 
            'INNER JOIN users u on u.rowid=i.user_id and u.deleted_at is null  ' + 
            'INNER JOIN ws_user_event ue on ue.user_id=u.rowid and ue.evento_id=? ' + 
            'LEFT JOIN ws_categorias_traduc ct on ck.rowid=ct.categoria_id and ct.idioma_id=e.idioma_id and ct.deleted_at is null ' + 
            'WHERE ck.deleted_at is null and ck.evento_id=? and e.gran_final='+$gran_final;
                    

		db.query($consulta, [$evento_id, $evento_id]).then((categorias)=>{
            
            $categorias = categorias;

            let promesas = $categorias.map((categ, i)=>{
                return new Promise((resolve, reject)=>{
                    $consulta_ex = 'SELECT e.rowid as examen_id, e.rowid, e.inscripcion_id, e.evaluacion_id, i.categoria_id, e.active, ' + 
                        'e.terminado, e.timeout, e.res_by_promedio, e.created_at as examen_at, i.user_id, i.allowed_to_answer, i.signed_by, i.created_at as inscrito_at, ' + 
                        'e.res_correctas, e.res_incorrectas, e.res_promedio, e.res_puntos, e.res_cant_pregs, e.res_tiempo, e.res_tiempo_format, ' + 
                        'u.nombres, u.apellidos, u.sexo, u.username, u.entidad_id, ' + 
                        'u.imagen_id, IFNULL("' + perfil_path + '" || im.nombre, CASE WHEN u.sexo="F" THEN "' + User.$default_female + '" ELSE "' + User.$default_male + '" END ) as imagen_nombre, ' + 
                        'en.nombre as nombre_entidad, en.alias as alias_entidad, en.lider_id, en.lider_nombre, en.alias, ' + 
                        'en.logo_id, IFNULL("' + perfil_path + '" || im.nombre, "perfil/system/avatars/no-photo.jpg") as logo_nombre, ' + 
                        'ct.nombre as nombre_categ, ct.abrev as abrev_categ, ct.descripcion as descripcion_categ, ct.idioma_id, ct.traducido ' + 
                    'FROM ws_examen_respuesta e ' + 
                    'INNER JOIN ws_inscripciones i on i.rowid=e.inscripcion_id and i.deleted_at is null ' + 
                    'INNER JOIN users u on u.rowid=i.user_id and u.deleted_at is null ' + 
                    'INNER JOIN ws_categorias_king ck on ck.rowid=i.categoria_id and ck.deleted_at is null and ck.rowid=? ' + 
                    'INNER JOIN ws_user_event ue on ue.user_id=u.rowid and ue.evento_id=? ' + 
                    'INNER JOIN ws_entidades en on en.rowid=u.entidad_id and en.deleted_at is null  ' + 
                    'LEFT JOIN ws_categorias_traduc ct on ck.rowid=ct.categoria_id and ct.idioma_id=e.idioma_id and ct.deleted_at is null ' + 
                    'LEFT JOIN images im on im.rowid=u.imagen_id and im.deleted_at is null  ' + 
                    'LEFT JOIN images im2 on im2.rowid=en.logo_id and im2.deleted_at is null  ' + 
                    'WHERE e.deleted_at is null  and e.gran_final='+$gran_final;

                    db.query($consulta_ex, [categ.categoria_id, $evento_id ] ).then(($examenes)=>{
                        categ.examenes = $examenes;
                        resolve();
                    })
                })
                    
            })
            
            return Promise.all(promesas)
              
        }).then(()=>{
            
            res.send($categorias);
            
        })
    })
	
}
            
            
	



function putExamenesEjecutandose(req, res) {
	User.fromToken(req).then(($user)=>{
		
		$ids_participantes 	= req.body.ids;
		
		if (!$ids_participantes) {
            res.status(400).send({'pailas': 'Deben haber personas haciendo examenes'});
            return;
        }
		if ($ids_participantes.length == 0) {
            res.status(400).send({'pailas': 'Deben haber personas haciendo examenes'});
            return;
        }
        
		$condicionales = '';

		for ($i=0; $i < $ids_participantes.length; $i++) {
			if ($i == 0) {
				$condicionales = 'e.rowid=' + $ids_participantes[$i];
			}else{
				$condicionales = $condicionales + ' or e.rowid=' + $cant_ids[$i];
			}
        }
        
        let perfil_path = User.$perfil_path;
        
		$consulta_ex = 'SELECT e.rowid as examen_id, e.rowid, e.inscripcion_id, e.evaluacion_id, i.categoria_id, e.active, ' +
                'e.terminado, e.timeout, e.res_by_promedio, e.created_at as examen_at, i.user_id, i.allowed_to_answer, i.signed_by, i.created_at as inscrito_at, ' +
                'e.res_correctas, e.res_incorrectas, e.res_promedio, e.res_puntos, e.res_cant_pregs, e.res_tiempo, e.res_tiempo_format, ' +
                'en.nombre as nombre_entidad, en.alias as alias_entidad, en.lider_id, en.lider_nombre, en.alias, ' +
                'u.nombres, u.apellidos, u.sexo, u.username, u.entidad_id, ' +
                'u.imagen_id, IFNULL("' + perfil_path + '" || im.nombre, CASE WHEN u.sexo="F" THEN "' + User.$default_female + '" ELSE "' + User.$default_male + '" END ) as imagen_nombre, ' +
                'ct.nombre as nombre_categ, ct.abrev as abrev_categ, ct.descripcion as descripcion_categ, ct.idioma_id, ct.traducido ' +
            'FROM ws_examen_respuesta e ' +
            'inner join ws_inscripciones i on i.rowid=e.inscripcion_id and i.deleted_at is null ' +
            'inner join ws_evaluaciones ev on ev.rowid=e.evaluacion_id and ev.actual=1 and e.deleted_at is null ' +
            'inner join users u on u.rowid=i.user_id and u.deleted_at is null ' +
            'inner join ws_entidades en on en.rowid=u.entidad_id ' +
            'inner join ws_categorias_king ck on ck.rowid=i.categoria_id and ck.deleted_at is null ' +
            'left join ws_categorias_traduc ct on ck.rowid=ct.categoria_id and ct.idioma_id=e.idioma_id and ct.deleted_at is null ' +
            'left join images im on im.rowid=u.imagen_id and im.deleted_at is null  ' +
            'where e.deleted_at is null and ('+$condicionales+')';

        db.query($consulta_ex ).then(($examenes)=>{
            
            let mapeos = $examenes.map(($examen, $key)=>{
                return new Promise((resolve, reject)=>{
                    ExamenRespuesta.calcular($examen).then(($resultado)=>{
                        
                        $consulta = "UPDATE ws_examen_respuesta SET res_correctas=?, res_incorrectas=?, res_by_promedio=?, res_promedio=?, res_puntos=?, res_cant_pregs=?, res_tiempo=?, res_tiempo_format=? WHERE rowid=?";
                        datos = [$resultado.correctas, $resultado.incorrec_reales, $resultado.por_promedio, $resultado.promedio, $resultado.puntos, $resultado.cantidad_pregs, $resultado.tiempo, $resultado.tiempo_format, $examen.examen_id];
                        console.log(datos);
                        db.query($consulta, datos).then(()=>{
                            resolve();
                        });    
                    });

                })
                
            })
            
            Promise.all(mapeos).then(()=>{
                
                // Repito la consulta por ahora
                db.query($consulta_ex).then(($examenes)=>{
                    res.send($examenes);
                });

            })

            
        });


	})
		
}
	


module.exports = router;