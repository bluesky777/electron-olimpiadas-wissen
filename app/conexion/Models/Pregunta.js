db = require('../connWeb');


class Pregunta {
    

    static deEvaluacion($evaluacion_id, $exa_resp_id) {
        let promesa = new Promise(function(resolve, reject){
            
            $exa_resp_id = $exa_resp_id || 0;
            
            let $consulta = "SELECT p.*, pe.evaluacion_id, pe.orden FROM ws_preguntas_king p " +
                "inner join ws_pregunta_evaluacion pe on pe.pregunta_id=p.id " +
                "where pe.evaluacion_id=? and p.deleted_at is null;";

            db.query($consulta, [$evaluacion_id] ).then(($preguntas_king)=>{
                
                let promises    = [];

                for(let $i=0; $i < $preguntas_king.length; $i++){
                    traducidos($i);
                }
                
                function traducidos($i){
                    let $promesa_pregs_trad = new Promise(function(resolve_pregs_traducidas, reject_pregs_evaluacioines){
                        
                        let $consulta = "SELECT t.id, t.enunciado, t.ayuda, t.pregunta_id,  " +
                                    "t.idioma_id, t.traducido, i.nombre as idioma " +
                                "FROM ws_pregunta_traduc t, ws_idiomas i " +
                                "where i.id=t.idioma_id and t.pregunta_id =? and t.deleted_at is null";

                        db.query($consulta, [$preguntas_king[$i].rowid] ).then((result_trads)=>{
                            $preguntas_king[$i].preguntas_traducidas = result_trads;
                            
                            let mapeando_preguntas_traducidas = $preguntas_king[$i].preguntas_traducidas.map((pregunta_traducida, $i)=>{
                                let $promesa_pregs_evaluaciones = new Promise(function(resolve_opciones, reject_opciones){
                                    
                                    
                                    consulta = 'SELECT o.id, o.rowid, o.definicion, o.orden, o.pregunta_traduc_id, o.is_correct ' + 
                                            'FROM ws_opciones o ' + 
                                            'WHERE o.pregunta_traduc_id =?';

                                    db.query(consulta, [pregunta_traducida.rowid] ).then((opciones)=>{
                                        pregunta_traducida.opciones = opciones;
                                        
                                        if ($exa_resp_id) {
                                            
                                            let mapeando_opciones = pregunta_traducida.opciones.map((opcion, $i)=>{
                                                let $promesa_opciones = new Promise(function(resolve_respuesta, reject_respuesta){
                                                    
                                                    
                                                    consulta = 'SELECT r.*, r.rowid FROM ws_respuestas r ' + 
                                                            'WHERE r.opcion_id=? and r.examen_respuesta_id=? and pregunta_agrupada_id is null';

                                                    db.query(consulta, [opcion.rowid, $exa_resp_id] ).then(($respuesta)=>{
                                                        
                                                        if ($respuesta.length > 0) {
                                                            opcion.elegida       = true;
                                                            opcion.respondida    = true;
                                                        }
                                                        resolve_respuesta(opcion); // Para Promise.all(mapeando_opciones)
                                                    });
                                                })
                                                return $promesa_opciones;
                                            })
                                            
                                            return Promise.all(mapeando_opciones)
                                        }else{
                                            return new Promise((resolve_dumb)=> resolve_dumb() );
                                        }
                                        
                                    }).then(()=>{
                                        resolve_opciones(pregunta_evaluacion); // Para Promise.all(mapeando_opciones)
                                    });

                                    
                                })
                                return $promesa_pregs_evaluaciones;
                            })
                            
                            return Promise.all(mapeando_preguntas_traducidas)
                        }).then((result)=>{
                            console.log(result);
                            resolve_pregs_traducidas(result)
                        });

                        
                    })
                    promises.push($promesa_pregs_trad);
                }
                
                Promise.all(promises).then((result)=>{
                    resolve($preguntas_king);
                })
            })
            
        })
        return promesa;
    }
    

    static deEvaluacionMala($evaluacion_id, $exa_resp_id) {
        let promesa = new Promise(function(resolve, reject){
            
            $exa_resp_id = $exa_resp_id || 0;
            
            let $consulta = "SELECT p.*, pe.evaluacion_id, pe.orden FROM ws_preguntas_king p " +
                "inner join ws_pregunta_evaluacion pe on pe.pregunta_id=p.id " +
                "where pe.evaluacion_id=? and p.deleted_at is null;";

            db.query($consulta, [$evaluacion_id] ).then(($preguntas_king)=>{
                
                let promises    = [];

                for(let $i=0; $i < $preguntas_king.length; $i++){
                    traducidos($i);
                }
                
                function traducidos($i){
                    let $promesa_pregs_trad = new Promise(function(resolve_pregs_traducidas, reject_pregs_evaluacioines){
                        
                        let $consulta = "SELECT t.id, t.enunciado, t.ayuda, t.pregunta_id,  " +
                                    "t.idioma_id, t.traducido, i.nombre as idioma " +
                                "FROM ws_pregunta_traduc t, ws_idiomas i " +
                                "where i.id=t.idioma_id and t.pregunta_id =? and t.deleted_at is null";

                        db.query($consulta, [$preguntas_king[$i].rowid] ).then((result_trads)=>{
                            $preguntas_king[$i].preguntas_traducidas = result_trads;
                            
                            let mapeando_preguntas_traducidas = $preguntas_king[$i].preguntas_traducidas.map((pregunta_traducida, $i)=>{
                                let $promesa_pregs_evaluaciones = new Promise(function(resolve_opciones, reject_opciones){
                                    
                                    
                                    consulta = 'SELECT o.id, o.rowid, o.definicion, o.orden, o.pregunta_traduc_id, o.is_correct ' + 
                                            'FROM ws_opciones o ' + 
                                            'WHERE o.pregunta_traduc_id =?';

                                    db.query(consulta, [pregunta_traducida.rowid] ).then((opciones)=>{
                                        pregunta_traducida.opciones = opciones;
                                        
                                        if ($exa_resp_id) {
                                            
                                            let mapeando_opciones = pregunta_traducida.opciones.map((opcion, $i)=>{
                                                let $promesa_opciones = new Promise(function(resolve_respuesta, reject_respuesta){
                                                    
                                                    
                                                    consulta = 'SELECT r.*, r.rowid FROM ws_respuestas r ' + 
                                                            'WHERE r.opcion_id=? and r.examen_respuesta_id=? and pregunta_agrupada_id is null';

                                                    db.query(consulta, [opcion.rowid, $exa_resp_id] ).then(($respuesta)=>{
                                                        
                                                        if ($respuesta.length > 0) {
                                                            opcion.elegida       = true;
                                                            opcion.respondida    = true;
                                                        }
                                                        resolve_respuesta(opcion); // Para Promise.all(mapeando_opciones)
                                                    });
                                                })
                                                return $promesa_opciones;
                                            })
                                            
                                            return Promise.all(mapeando_opciones)
                                        }else{
                                            return new Promise((resolve_dumb)=> resolve_dumb() );
                                        }
                                        
                                    }).then(()=>{
                                        resolve_opciones(pregunta_evaluacion); // Para Promise.all(mapeando_opciones)
                                    });

                                    
                                })
                                return $promesa_pregs_evaluaciones;
                            })
                            
                            return Promise.all(mapeando_preguntas_traducidas)
                        }).then((result)=>{
                            console.log(result);
                            resolve_pregs_traducidas(result)
                        });

                        
                    })
                    promises.push($promesa_pregs_trad);
                }
                
                Promise.all(promises).then((result)=>{
                    resolve($preguntas_king);
                })
            })
            
        })
        return promesa;
    }
    
};

module.exports = Pregunta;

