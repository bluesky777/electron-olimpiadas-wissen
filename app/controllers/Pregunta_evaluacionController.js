var express         = require('express');
var router          = express.Router();
var User            = require('../conexion/Models/User');
var Pregunta        = require('../conexion/Models/Pregunta');
var Evento          = require('../conexion/Models/Evento');
var db              = require('../conexion/connWeb');





router.route('/asignar-pregunta').put(putAsignarPregunta);
router.route('/asignar-preguntas').put(putAsignarPreguntas);
router.route('/quitar-pregunta').put(putQuitarPregunta);
router.route('/asignar-aleatoriamente').put(putAsignarAleatoriamente);
router.route('/actualizar-orden-pregunta').put(putActualizarOrdenPregunta);




function putAsignarPregunta(req, res) {
    User.fromToken(req).then(($user)=>{

        $pregunta_id    = req.body.pregunta_id;
        
        let now         = window.fixDate(new Date(), true);
        $evaluacion_id 	= req.body.evaluacion_id;
        $pregunta_id 	= req.body.pregunta_id;
        let consulta    = 'SELECT rowid, * FROM ws_pregunta_evaluacion WHERE pregunta_id=? and evaluacion_id=?';
        
        db.query(consulta, [$pregunta_id, $evaluacion_id]).then(($preg_eval)=>{
            
            return new Promise((resolve, reject)=>{
                if ($preg_eval.length > 0) {
                    resolve($preg_eval);
                }else{
    
                    db.query('SELECT rowid, * FROM ws_pregunta_evaluacion WHERE evaluacion_id=?', [$evaluacion_id]).then(($pregs_evs)=>{
                        $cant = $pregs_evs.length;
                        
                        $preg_eval 					= {};
                        $preg_eval.pregunta_id 	    = $pregunta_id;
                        $preg_eval.evaluacion_id 	= $evaluacion_id;
                        $preg_eval.added_by 		= $user.rowid;
                        $preg_eval.orden 			= $cant+1;
                        
                        db.query('INSERT INTO ws_pregunta_evaluacion(pregunta_id, evaluacion_id, added_by, orden, created_at) VALUES(?,?,?,?,?)', [$pregunta_id, $evaluacion_id, $preg_eval.added_by, $preg_eval.orden, now]).then((result)=>{
                            $preg_eval.rowid 		= result.insertId;
                            resolve($preg_eval);
                        })
                    })
                    
    
                    return $preg_eval;
    
                }
            }).then(($preg_eval)=>{
                
                res.send($preg_eval);
            
            })
        })
        
    }) // User.fromToken
}
   


function putAsignarPreguntas(req, res) {
    User.fromToken(req).then(($user)=>{

        $pregunta_id    = req.body.pregunta_id;
        $preguntas      = req.body.preguntas;
        
        let now         = window.fixDate(new Date(), true);
        $evaluacion_id 	= req.body.evaluacion_id;
        $pregunta_id 	= req.body.pregunta_id;
        
        
        $preguntas_reales   = [];
        $preg_evalu_nuevos 	= [];
        
        let consulta    = 'SELECT rowid, IFNULL(pregunta_id, grupo_pregs_id) as pg_id, CASE WHEN pregunta_id THEN 1 ELSE 0 END as is_preg ' +
            'FROM ws_pregunta_evaluacion WHERE evaluacion_id=?';
        
        
        db.query(consulta, [$evaluacion_id]).then(($pregs_eval)=>{
        
            for ($i=0; $i < $preguntas.length; $i++) { 
                let $is_already = false;
                for ($j=0; $j < $pregs_eval.length; $j++) { 

                    if ( ($preguntas[$i]['is_preg']==$pregs_eval[$j].is_preg) && ($preguntas[$i]['pg_id']==$pregs_eval[$j].pg_id) ) {
                        $is_already = true;
                    }
                }
                if(!$is_already){
                    $preguntas_reales.push($preguntas[$i]);
                }
            }
            
            $contador 			= $pregs_eval.length + 1;
            $cant_real 			= $preguntas_reales.length;
            promesas            = [];
            
            for ($i=0; $i < $cant_real; $i++) { 
                insertar_preg_eval($i);
            }
            function insertar_preg_eval($i){
                let prome = new Promise((resolveInsert, rejectInsert)=>{
                    
                    let $preg_eval 				= {};
                    $preg_eval.evaluacion_id 	= $evaluacion_id;
                    $preg_eval.added_by 		= $user.rowid;
                    $preg_eval.orden 			= $contador++;
                    
                    if ($preguntas_reales[$i].is_preg) {
                        $preg_eval.pregunta_id 	    = $preguntas_reales[$i].pg_id;
                    }else{
                        $preg_eval.grupo_pregs_id 	= $preguntas_reales[$i].pg_id;
                    }
                    
                    cod = $preg_eval.pregunta_id || $preg_eval.grupo_pregs_id;
                    col = $preg_eval.pregunta_id ? 'pregunta_id' : 'grupo_pregs_id';

                    db.query('INSERT INTO ws_pregunta_evaluacion('+col+', evaluacion_id, added_by, orden, created_at) VALUES(?,?,?,?,?)', 
                        [cod, $preg_eval.evaluacion_id, $preg_eval.added_by, $preg_eval.orden, now]).then((result)=>{
                        
                        $preg_eval.rowid 		= result.insertId;
                        $preg_evalu_nuevos.push($preg_eval);
                        resolveInsert($preg_eval);

                    })
                })
                promesas.push(prome);
            }
            return Promise.all(promesas)
            
        }).then(()=>{
                
            res.send($preg_evalu_nuevos);
        
        })
        
    }) // User.fromToken
}
   

function putQuitarPregunta(req, res) {
    User.fromToken(req).then(($user)=>{

        $pregunta_eval_id 	= req.body.pregunta_eval_id;
        
        db.query('DELETE FROM ws_pregunta_evaluacion WHERE rowid=?', [$pregunta_eval_id]).then(()=>{
            res.send('Quitada con éxito');
        })
    }) // User.fromToken
}
    
       
function putAsignarAleatoriamente(req, res) {
    User.fromToken(req).then(($user)=>{

        $idioma_id 		    = $user.idioma_main_id;
		$categoria_id 	    = req.body.categoria_id;
        
        let now             = window.fixDate(new Date(), true);
		$evaluacion_id 	    = req.body.evaluacion_id;
		$cantPreg 		    = req.body.cantPregRandom;
        $pregNoAsignadas    = req.body.pregNoAsignadas;
        let $asignadas      = [];
        let $consulta       = '';
        let datos           = [];
        
        db.query('DELETE FROM ws_pregunta_evaluacion WHERE evaluacion_id=?', [$evaluacion_id]).then(()=>{
            if ($pregNoAsignadas) {
			

                $consulta = 'SELECT * FROM ( ' +
                                'SELECT pk.rowid as pg_id, 1 as is_preg, pk.descripcion, pk.tipo_pregunta, pk.categoria_id, pk.aleatorias, pk.added_by, pk.created_at as gp_created_at, pk.updated_at as gp_updated_at,  ' +
                                    'pt.rowid as pg_traduc_id, pt.enunciado, NULL as definicion, pt.ayuda, pt.idioma_id, pt.texto_arriba, pt.texto_abajo, pt.traducido, pt.updated_at as pgt_updated_at ' +
                                'FROM ws_preguntas_king pk ' +
                                'INNER JOIN ws_pregunta_traduc pt on pt.pregunta_id=pk.rowid and pt.idioma_id=? and pt.deleted_at is null ' +
                                'WHERE pk.categoria_id=? AND pk.deleted_at is null ' +
                            'union ' +
                                'SELECT gp.rowid as pg_id, 0 as is_preg, gp.descripcion, NULL as tipo_pregunta, gp.categoria_id, NULL as aleatorias, gp.added_by, gp.created_at as gp_created_at, gp.updated_at as gp_updated_at, ' +
                                    'ct.rowid as pg_traduc_id, NULL as enunciado, ct.definicion, NULL as ayuda, ct.idioma_id, NULL as texto_arriba, NULL as texto_abajo, ct.traducido, ct.updated_at as pgt_updated_at ' +
                                'FROM ws_grupos_preguntas gp ' +
                                'INNER JOIN ws_contenido_traduc ct on ct.grupo_pregs_id=gp.rowid and ct.idioma_id=? and ct.deleted_at is null ' +
                                'WHERE gp.categoria_id=? and gp.deleted_at is null ' +
                            ')p ' +
                            'WHERE p.pg_id NOT IN (SELECT pregunta_id FROM ws_pregunta_evaluacion WHERE evaluacion_id=? AND pregunta_id IS NOT NULL)  ' +
                                'AND p.pg_id NOT IN (SELECT grupo_pregs_id FROM ws_pregunta_evaluacion WHERE evaluacion_id=? and grupo_pregs_id IS NOT NULL) ' +
                            'order by gp_created_at';
                            
                datos = [$idioma_id, $categoria_id, $idioma_id, $categoria_id, $evaluacion_id, $evaluacion_id];
                            
            }else{

                // Todas las preguntas aunque ya estén asignadas a otras evaluaciones
    
                $consulta = 'SELECT * FROM ( ' +
                                'SELECT pk.rowid as pg_id, 1 as is_preg, pk.descripcion, pk.tipo_pregunta, pk.categoria_id, pk.aleatorias, pk.added_by, pk.created_at as gp_created_at, pk.updated_at as gp_updated_at,  ' +
                                    'pt.rowid as pg_traduc_id, pt.enunciado, NULL as definicion, pt.ayuda, pt.idioma_id, pt.texto_arriba, pt.texto_abajo, pt.traducido, pt.updated_at as pgt_updated_at ' +
                                'FROM ws_preguntas_king pk ' +
                                'INNER JOIN ws_pregunta_traduc pt on pt.pregunta_id=pk.rowid and pt.idioma_id=? and pt.deleted_at is null ' +
                                'WHERE pk.categoria_id=? AND pk.deleted_at is null ' +
                            'union ' +
                                'SELECT gp.rowid as pg_id, 0 as is_preg, gp.descripcion, NULL as tipo_pregunta, gp.categoria_id, NULL as aleatorias, gp.added_by, gp.created_at as gp_created_at, gp.updated_at as gp_updated_at, ' +
                                    'ct.rowid as pg_traduc_id, NULL as enunciado, ct.definicion, NULL as ayuda, ct.idioma_id, NULL as texto_arriba, NULL as texto_abajo, ct.traducido, ct.updated_at as pgt_updated_at ' +
                                'FROM ws_grupos_preguntas gp ' +
                                'INNER JOIN ws_contenido_traduc ct on ct.grupo_pregs_id=gp.rowid and ct.idioma_id=? and ct.deleted_at is null ' +
                                'WHERE gp.categoria_id=? and gp.deleted_at is null ' +
                            ')p order by gp_created_at';
                            
                datos = [$idioma_id, $categoria_id, $idioma_id, $categoria_id];
    
            }
            
            return db.query($consulta, datos);
            
        }).then(($pg_traducidas)=>{
            // NO SÉ POR CUÁL FUNCTION CAMBIAR array_rand
            if ($pg_traducidas.length < $cantPreg) {
                $cantPreg = $pg_traducidas.length;
            }
            $aleatorias = window.array_rand($pg_traducidas, $cantPreg);
            $promesas   = [];

            for ($i=0; $i < $aleatorias.length; $i++) { 
                $toAsign = $aleatorias[$i];
                insertar_preg_eval($toAsign, $i);
            }
            function insertar_preg_eval($toAsign, $i){
                let prome = new Promise((resolve, reject)=>{
                    db.query('SELECT rowid, * FROM ws_pregunta_evaluacion WHERE evaluacion_id=?', [$evaluacion_id]).then(($pregs_evs)=>{
                        //$cant = $pregs_evs.length;              
                        $cant = $i;

                        $preg_eval 					= {};
                        $preg_eval.evaluacion_id 	= $evaluacion_id;
                        $preg_eval.added_by 		= $user.rowid;
                        $preg_eval.orden 			= $cant+1;
                        
                        if ($toAsign.is_preg) {
                            $preg_eval.pregunta_id 	    = $toAsign.pg_id;
                        }else{
                            $preg_eval.grupo_pregs_id 	= $toAsign.pg_id;
                        }
                        
                        cod = $preg_eval.pregunta_id || $preg_eval.grupo_pregs_id;
                        col = $preg_eval.pregunta_id ? 'pregunta_id' : 'grupo_pregs_id';
    
                        db.query('INSERT INTO ws_pregunta_evaluacion('+col+', evaluacion_id, added_by, orden, created_at) VALUES(?,?,?,?,?)', 
                            [cod, $preg_eval.evaluacion_id, $preg_eval.added_by, $preg_eval.orden, now]).then((result)=>{
                            
                            $preg_eval.rowid 		= result.insertId;
                            $asignadas.push($preg_eval);
                            resolve($preg_eval);
                        })
                    })
                })
                $promesas.push(prome);
                
            }
            return Promise.all($promesas);
        }).then(()=>{
            res.send($asignadas);
        })
    }) // User.fromToken
}
    


function putActualizarOrdenPregunta(req, res) {
    User.fromToken(req).then(($user)=>{

        $pregunta_eval_id 	= req.body.pregunta_eval_id;
        $pg_id 			    = req.body.pg_id;
		$orden 			    = req.body.orden;
        
        db.query('UPDATE ws_pregunta_evaluacion SET orden=? WHERE rowid=?', [$orden, $pregunta_eval_id]).then(()=>{
            res.send('Ordenado');
        })
    }) // User.fromToken
}
    

module.exports = router;