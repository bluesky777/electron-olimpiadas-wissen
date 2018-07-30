var express         = require('express');
var router          = express.Router();
var User            = require('../../conexion/Models/User');
var Evento          = require('../../conexion/Models/Evento');
var Categoria       = require('../../conexion/Models/Categoria');
var ExamenRespuesta = require('../../conexion/Models/ExamenRespuesta');
var db              = require('../../conexion/connWeb');





router.route('/datos').put(putDatos)



function putDatos(req, res) {
	User.fromToken(req).then(($user)=>{
		
		$datos 	    = [];
        $categorias = [];
        $events     = [];
        
        Evento.todos().then((events)=>{
            $events = events;
            		
            let mapeando = $events.map(($event, $i)=>{
                return new Promise((resolve, reject)=>{
                    
                    Evento.idiomas_all($event.rowid).then((idiomas)=>{
                        $event.idiomas 	= idiomas;
                        
                        $consulta 	= 'SELECT *, rowid FROM ws_categorias_king c WHERE c.evento_id=? AND c.deleted_at is null';
                        return db.query($consulta, [$event.rowid] );
                        
                    }).then(($categorias)=>{

                        return Categoria.traduc($categorias);
                        
                    }).then((categorias)=>{
                        $categorias = categorias;
                        
                        let mapeando = $categorias.map((categoria, $i)=>{
                            return new Promise((resolveCate, rejectCate)=>{
                                $consulta = 'SELECT *, rowid FROM ws_evaluaciones e where e.categoria_id=? and e.evento_id=? and e.deleted_at is null';
                                db.query($consulta, [categoria.rowid, $event.rowid] ).then(($evaluaciones)=>{
                                    categoria.evaluaciones = $evaluaciones;
                                    resolveCate(categoria);
                                });
                            })
                        })
                        
                        return Promise.all(mapeando)
                    }).then((categorias)=>{
                        
                        $event.categorias = $categorias;
                        $consulta = 'SELECT *, rowid FROM ws_entidades e where e.evento_id=? and e.deleted_at is null';
                        
                        db.query($consulta, [$event.rowid] ).then(($entidades)=>{
                            $event.entidades = $entidades;
                            resolve($event)
                        });
                    })
                    
                })

            })
            
            Promise.all(mapeando).then((eventos)=>{
                
                res.send($events);
            
            });

        });

		
	
	})
		
}
	


module.exports = router;