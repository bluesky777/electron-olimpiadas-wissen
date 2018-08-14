var express         = require('express');
var router          = express.Router();
var User            = require('../conexion/Models/User');
var Pregunta        = require('../conexion/Models/Pregunta');
var Evento          = require('../conexion/Models/Evento');
var db              = require('../conexion/connWeb');





router.route('/').get(getIndex);
router.route('/traducidas').get(getTraducidas);
router.route('/store').post(postStore);
router.route('/update').put(putUpdate);



function getIndex(req, res) {
    User.fromToken(req).then(($user)=>{

        $evento_id      = $user.evento_selected_id;
        $categoria_id 	= req.query.categoria_id;
        $idioma_id 		= req.query.idioma_id;
        
        let consulta = 'SELECT * FROM (	' + 
                'SELECT pk.rowid as pg_id, pk.rowid, 1 as is_preg, pk.descripcion, pk.tipo_pregunta, pk.duracion, pk.categoria_id, pk.puntos, pk.aleatorias, pk.added_by, pk.created_at as gp_created_at, pk.updated_at as gp_updated_at, 	' + 
                    'pt.rowid as pg_traduc_id, pt.enunciado, NULL as definicion, pt.ayuda, pt.idioma_id, pt.texto_arriba, pt.texto_abajo, pt.traducido, pt.updated_at as pgt_updated_at	' + 
                'FROM ws_preguntas_king pk	' + 
                'INNER JOIN ws_pregunta_traduc pt on pt.pregunta_id=pk.rowid and pt.idioma_id=? and pt.deleted_at is null	' + 
                'WHERE pk.categoria_id=? AND pk.deleted_at is null	' + 
            'union	' + 
                'SELECT gp.rowid as pg_id, gp.rowid, 0 as is_preg, gp.descripcion, NULL as tipo_pregunta, NULL as duracion, gp.categoria_id, NULL as puntos, NULL as aleatorias, gp.added_by, gp.created_at as gp_created_at, gp.updated_at as gp_updated_at,	' + 
                    'ct.rowid as pg_traduc_id, NULL as enunciado, ct.definicion, NULL as ayuda, ct.idioma_id, NULL as texto_arriba, NULL as texto_abajo, ct.traducido, ct.updated_at as pgt_updated_at	' + 
                'FROM ws_grupos_preguntas gp	' + 
                'INNER JOIN ws_contenido_traduc ct on ct.grupo_pregs_id=gp.rowid and ct.idioma_id=? and ct.deleted_at is null	' + 
                'WHERE gp.categoria_id=? and gp.deleted_at is null	' + 
            ')p order by gp_created_at';
        
		db.query(consulta, [$idioma_id, $categoria_id, $idioma_id, $categoria_id]).then(($preguntas_king)=>{

            let promises = $preguntas_king.map((pregunta, $i)=>{
                return new Promise((resolve, reject)=>{
                    
                    if (pregunta.is_preg) {
                        $consulta = 'SELECT o.rowid, o.definicion, o.orden, o.pregunta_traduc_id, o.is_correct, o.added_by, o.created_at, o.updated_at ' + 
                            'FROM ws_opciones o ' + 
                            'WHERE o.pregunta_traduc_id=?';
                        db.query($consulta, [pregunta.pg_traduc_id]).then((opciones)=>{
                            pregunta.opciones = opciones;
                            resolve();
                        });
                    }else{
                        // TRAEMOS PREGUNTAS AGRUPADAS Y LUEGO SUS OPCIONES. INCOMPLETOOOOOO
                        $consulta = 'SELECT t.rowid, t.enunciado, t.ayuda, t.duracion, t.tipo_pregunta, t.puntos, t.aleatorias, t.orden, t.added_by, t.created_at, t.updated_at  ' + 
                            'FROM ws_preguntas_agrupadas t ' + 
                            'WHERE t.contenido_id = ? and t.deleted_at is null';

                        resolve();
                    }
                })
                
            })
                
            
            Promise.all(promises).then(()=>{
                res.send($preguntas_king);
            })
            
        });
    
    })
}
    



function getTraducidas(req, res) {
    User.fromToken(req).then(($user)=>{

        $pregunta_id 	= req.query.pregunta_id;
        
        let consulta = 'SELECT pk.rowid as pg_id, pk.descripcion, pk.tipo_pregunta, pk.duracion, pk.categoria_id, pk.puntos, pk.aleatorias, pk.added_by, pk.created_at as gp_created_at, pk.updated_at as gp_updated_at,  ' + 
                'pt.rowid as pg_traduc_id, pt.enunciado, pt.ayuda, pt.idioma_id, pt.texto_arriba, pt.texto_abajo, pt.traducido, pt.updated_at as pgt_updated_at, ' + 
                'idi.nombre as idioma, idi.original as idioma_original, idi.abrev as idioma_abrev ' + 
            'FROM ws_preguntas_king pk ' + 
            'INNER JOIN ws_pregunta_traduc pt on pt.pregunta_id=pk.rowid and pt.deleted_at is null ' + 
            'INNER JOIN ws_idiomas idi on idi.rowid=pt.idioma_id and idi.deleted_at is null ' + 
            'WHERE pk.rowid=? AND pk.deleted_at is null';
        
		db.query(consulta, [$pregunta_id]).then(($pg_traducidas)=>{

            let promises = $pg_traducidas.map((pregunta, $i)=>{
                return new Promise((resolve, reject)=>{
                    
                    $consulta = 'SELECT o.rowid, o.definicion, o.orden, o.pregunta_traduc_id, o.is_correct, o.added_by, o.created_at, o.updated_at ' + 
                        'FROM ws_opciones o ' + 
                        'WHERE o.pregunta_traduc_id=?';
                    db.query($consulta, [pregunta.pg_traduc_id]).then((opciones)=>{
                        pregunta.opciones = opciones;
                        resolve();
                    });
                    
                })
                
            })
                
            
            Promise.all(promises).then(()=>{
                res.send($pg_traducidas);
            })
            
        });
    
    })
}
    


function postStore(req, res) {
    User.fromToken(req).then(($user)=>{

        $evento_id 		= $user.evento_selected_id;
		$categoria_id 	= req.body.categoria_id;
        $idioma_id 		= req.body.idioma_id;
        $evento         = {};
        $preg_id        = -1;
        let now         = window.fixDate(new Date(), true);
        let consulta    = '';
        
		db.find('ws_eventos', $evento_id).then((evento)=>{
            $evento     = evento;
            consulta    = 'INSERT INTO ws_preguntas_king(tipo_pregunta, categoria_id, aleatorias, puntos, added_by, created_at) VALUES(?,?,?,?,?,?)';
            return db.query(consulta, ['Test', $categoria_id, 0, 1, $user.rowid, now]);
            
        }).then((preg)=>{
            $preg_id = preg.insertId;
            return Evento.idiomas_all($evento.rowid);
                
        }).then(($event_idiomas)=>{
            
            let promesas = $event_idiomas.map((idioma, i)=>{
                return new Promise((resolve, reject)=>{
                    let $preg 			= {};
                    $preg.enunciado		= 'Pregunta ' + $preg_id;
                    $preg.ayuda			= '';
                    $preg.pregunta_id   = $preg_id;
                    $preg.idioma_id		= idioma.rowid;
                    $preg.traducido     = 0;
                    consulta            = 'INSERT INTO ws_pregunta_traduc(enunciado, ayuda, pregunta_id, idioma_id, traducido, created_at) VALUES(?,?,?,?,?,?)';
                    
                    db.query(consulta, [ $preg.enunciado, $preg.ayuda, $preg.pregunta_id, $preg.idioma_id, $preg.traducido, now]).then((preg_trad)=>{
                        
                        if ($user.idioma_main_id == $preg.idioma_id) {
                            let promOpciones = [];
                            
				            for (let $i=0; $i < 4; $i++) { 
                                let is_correct = 1;
                                if($i){ is_correct = 0 };
                                
                                consulta = 'INSERT INTO ws_opciones(definicion, orden, is_correct, pregunta_traduc_id, added_by, created_at) VALUES(?,?,?,?,?,?)';
                                let promeOp = db.query(consulta, [ 'Opción '+($i+1), $i, is_correct, preg_trad.insertId, $user.rowid, now]);
                                promOpciones.push(promeOp);
                            }
                            
                            Promise.all(promOpciones).then(()=>{
                                resolve();
                            })
                        }else{
                            resolve();
                        }
                    })
                })
            })
            return Promise.all(promesas);
        }).then(()=>{
            return Pregunta.unaPGPregunta($idioma_id, $preg_id);
        }).then(($pregunta_trad)=>{
            res.send($pregunta_trad);
        })

        
    }) // User.fromToken
}
    



function putUpdate(req, res) {
    User.fromToken(req).then(($user)=>{

        
		let $preg_id 		= req.body.pg_id || req.body.id;
		let descripcion 	= req.body.descripcion;
		let tipo_pregunta 	= req.body.tipo_pregunta;
		let duracion 		= req.body.duracion;
		let categoria_id 	= req.body.categoria_id;
		let puntos 			= req.body.puntos || 1;
		let aleatorias 		= req.body.aleatorias;
		
        let now         = window.fixDate(new Date(), true);
        let consulta    = 'UPDATE ws_preguntas_king SET descripcion=?, tipo_pregunta=?, duracion=?, categoria_id=?, puntos=?, aleatorias=?, updated_at=? WHERE rowid=?';
        
		db.query(consulta, [descripcion, tipo_pregunta, duracion, categoria_id, puntos, aleatorias, now, $preg_id]).then(()=>{
            
            if (req.body.preguntas_traducidas) {
                let promesas = req.body.preguntas_traducidas.map((preg_trad)=>{
                    return new Promise((resolve, reject)=>{
                        consulta = 'UPDATE ws_pregunta_traduc SET enunciado=?, ayuda=?, updated_at=? WHERE rowid=?';
                        db.query(consulta, [preg_trad.enunciado, preg_trad.ayuda, now, preg_trad.pg_traduc_id]).then(()=>{
                            
                            let promeOpc = preg_trad.opciones.map((opcion)=>{
                                new Promise((resolveOpc, rejectOpc)=>{
                                    let consul = 'UPDATE ws_opciones SET definicion=?, is_correct=?, updated_at=? WHERE rowid=?';
                                    if (opcion.hasOwnProperty('nueva')) {
                                        if (opcion.nueva == true) {
                                            // No es una opción a agregar, es el botón.
                                            resolveOpc();
						                }else{
                                            db.query(consul, [opcion.definicion, opcion.is_correct, now, opcion.rowid]).then(()=>{
                                                resolveOpc();
                                            })
                                        }
                                    }else{
                                        db.query(consul, [opcion.definicion, opcion.is_correct, now, opcion.rowid]).then(()=>{
                                            resolveOpc();
                                        })
                                    }
                                })
                                
                            })
                            Promise.all(promeOpc).then(()=>{
                                resolve();
                            })
                        })
                    })
                    
                })
                return Promise.all(promesas)
            }else{
                return new Promise((resolve, reject)=>{
                    consulta = 'UPDATE ws_pregunta_traduc SET enunciado=?, ayuda=?, updated_at=? WHERE rowid=?';
                    db.query(consulta, [req.body.enunciado, req.body.ayuda, now, req.body.pg_traduc_id]).then(()=>{
                        
                        let promeOpc = req.body.opciones.map((opcion)=>{
                            new Promise((resolveOpc, rejectOpc)=>{
                                let consul = 'UPDATE ws_opciones SET definicion=?, is_correct=?, updated_at=? WHERE rowid=?';
                                if (opcion.hasOwnProperty('nueva')) {
                                    if (opcion.nueva == true) {
                                        // No es una opción a agregar, es el botón.
                                        resolveOpc();
                                    }else{
                                        db.query(consul, [opcion.definicion, opcion.is_correct, now, opcion.rowid]).then(()=>{
                                            resolveOpc();
                                        })
                                    }
                                }else{
                                    db.query(consul, [opcion.definicion, opcion.is_correct, now, opcion.rowid]).then(()=>{
                                        resolveOpc();
                                    })
                                }
                            })
                            
                        })
                        Promise.all(promeOpc).then(()=>{
                            resolve();
                        })
                    })
                })
            }
            
        }).then(()=>{
            return Pregunta.unaPGPregunta(req.body.idioma_id, $preg_id);
        }).then(($pregunta_trad)=>{
            res.send($pregunta_trad);
        })

        
    }) // User.fromToken
}
    


module.exports = router;