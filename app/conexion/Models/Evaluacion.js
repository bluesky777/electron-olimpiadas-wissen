db = require('../connWeb');


class Evaluacion {
    
    static crear(codigo, comando) {
        let consulta 	= `INSERT INTO ws_disciplinas_king(codigo, comando) VALUES (?,?)`;
        return db.query(consulta, [codigo, comando]);
    }
    
    static deCategoria(categoria_id, evento_id) {
        let consulta 	= `SELECT *, rowid FROM ws_evaluaciones WHERE categoria_id=? and evento_id=? and deleted_at is null`;
        return db.query(consulta, [categoria_id, evento_id]);
    }
    
    static preguntaEvaluacion(evaluacion_id) {
        let consulta 	= `SELECT p.id, p.rowid, pe.rowid as inscripcion_id, pe.evaluacion_id, pe.pregunta_id, pe.grupo_pregs_id, pe.orden, pe.aleatorias, pe.added_by, 
                p.descripcion, p.tipo_pregunta, p.duracion, p.categoria_id, p.puntos
            FROM ws_preguntas_king p
            inner join ws_pregunta_evaluacion pe on pe.pregunta_id=p.id and p.deleted_at is null
            where pe.evaluacion_id = ?`;
        return db.query(consulta, [evaluacion_id]);
    }
    
    
    
    static categoriasConPreguntas($categorias, $exa_resp_id){
        
        let mapeando_categorias = $categorias.map((categoria, $h)=>{
            let $prome_evaluaciones = new Promise(function(resolve, reject){
                
                consulta 	= `SELECT *, rowid FROM ws_evaluaciones WHERE categoria_id=? and evento_id=? and deleted_at is null`;
                db.query(consulta, [categoria.rowid, $evento_id]).then(($evaluaciones)=>{
                    
                    
                    categoria.evaluaciones = $evaluaciones;
                    
                    let mapeando_evaluaciones = categoria.evaluaciones.map(($evaluacion, $i)=>{
                        let $promesa_pregs_evaluaciones = new Promise(function(resolve_pregs_evaluaciones, reject_pregs_evaluacioines){
                            
                            Evaluacion.preguntaEvaluacion($evaluacion.rowid).then(($pregs_eval)=>{
                                $evaluacion.preguntas_evaluacion = $pregs_eval;
                                
                                let mapeando_preguntas_evaluacion = $evaluacion.preguntas_evaluacion.map((pregunta_evaluacion, $i)=>{
                                    let $promesa_pregs_evaluaciones = new Promise(function(resolve_pregs_traducidas, reject_pregs_evaluacioines){
                                        
                                        
                                        consulta = 'SELECT t.id, t.rowid, t.enunciado, t.ayuda, t.pregunta_id, ' +
                                                't.idioma_id, t.traducido, i.nombre as idioma   ' +
                                            'FROM ws_pregunta_traduc t, ws_idiomas i ' +
                                            'WHERE i.id=t.idioma_id and t.pregunta_id =? and t.deleted_at is null';

                                        db.query(consulta, [pregunta_evaluacion.pregunta_id] ).then(($preg_trads)=>{
                                            pregunta_evaluacion.preguntas_traducidas = $preg_trads;
                                            
                                            let mapeando_preguntas_traducidas = pregunta_evaluacion.preguntas_traducidas.map((pregunta_traducida, $i)=>{
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
                                            
                                        }).then(()=>{
                                            resolve_pregs_traducidas($evaluacion); // Para Promise.all(mapeando_preguntas_traducidas)
                                        });
                                        
                                    })
                                    return $promesa_pregs_evaluaciones;
                                })
                                
                                return Promise.all(mapeando_preguntas_evaluacion)
                                
                            }).then(()=>{
                                resolve_pregs_evaluaciones($evaluacion); // Para Promise.all(mapeando_preguntas_evaluaciones)
                            });
                            
                        })
                        return $promesa_pregs_evaluaciones;
                    })
                    
                    return Promise.all(mapeando_evaluaciones);
                    
                }).then((arrayOfResults)=>{
                    resolve(categoria); // Para Promise.all(mapeando_categorias)
                });
            
            })
            return $prome_evaluaciones;
        })
        
        return Promise.all(mapeando_categorias);
    }
    
    
    static updateTraduc(rowid, nombre, descripcion, traducido) {
        let promesa = new Promise(function(resolve, reject){
            
            let now = window.fixDate(new Date(), true);
            let $consulta = "UPDATE ws_disciplinas_traduc SET nombre=?, descripcion=?, traducido=?, updated_at=? WHERE rowid=?";

            db.query($consulta, [nombre, descripcion, traducido, now, rowid] )
            
            .then((result_trads)=>{
                resolve('Guardado');
            });
            
            
        })
        return promesa;
    }
    
    
    static actual($evento_id, categoria_id) {
        let $consulta = "SELECT *, rowid FROM ws_evaluaciones WHERE actual=1 and evento_id=? and categoria_id=?";
        return db.query($consulta, [$evento_id, categoria_id] );
    }
    
};

module.exports = Evaluacion;

