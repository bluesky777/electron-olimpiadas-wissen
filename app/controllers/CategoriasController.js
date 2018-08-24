var express         = require('express');
var router          = express.Router();
var User            = require('../conexion/Models/User');
var Categoria       = require('../conexion/Models/Categoria');
var Evento          = require('../conexion/Models/Evento');
var Evaluacion      = require('../conexion/Models/Evaluacion');
var db              = require('../conexion/connWeb');




router.route('/categorias-usuario').get(getCategoriasUsuarioHandler);
router.route('/categorias-evento').get(getCategoriasEvento);

router.route('/guardar').put(putGuardar);
router.route('/store').post(postStore);
router.route('/destroy').put(putDestroy);


    

function getCategoriasUsuarioHandler(req, res) {
    User.fromToken(req).then(($user)=>{
        
		$evento_id = $user.evento_selected_id;

		db.query('SELECT *, rowid FROM ws_categorias_king WHERE evento_id = ? and deleted_at is null', [$evento_id]).then(($categorias)=>{

            Categoria.traduc($categorias).then((result_categorias)=>{
                res.send(result_categorias);                
            });
            
        });

		
    
    })
}


function getCategoriasEvento(req, res) {
    let $user = {};
    
    User.fromToken(req).then(($user_r)=>{
        
        $user       = $user_r;
		return Evento.actual();		
    
    }).then(($evento)=>{
        
		db.query('SELECT *, rowid FROM ws_categorias_king WHERE evento_id = ? and deleted_at is null', [$evento.rowid]).then(($categorias)=>{

            Categoria.traduc($categorias).then((result_categorias)=>{
                res.send(result_categorias);                
            });
            
        });

    })
}



function postStore(req, res) {
    User.fromToken(req).then(($user)=>{
        let now             = window.fixDate(new Date(), true);
        let $event_idiomas  = [];
        let $cate_id         = 0;
        let $evento_id      = $user.evento_selected_id;

        
		db.find('ws_eventos', $evento_id).then(($evento)=>{
            return Evento.idiomas_all($evento_id)
        }).then((event_idiomas)=>{
            $event_idiomas = event_idiomas;
            
            consulta = 'INSERT INTO ws_categorias_king(nombre, evento_id, created_at) VALUES(?,?,?)';
            return db.query(consulta, ['', $evento_id, now])        
        }).then((result)=>{
            $cate_id = result.insertId
            let promesas = $event_idiomas.map((idioma, i)=>{
                consulta = 'INSERT INTO ws_categorias_traduc(nombre, abrev, categoria_id, idioma_id, traducido, created_at) VALUES(?,?,?,?,?,?)';
                return db.query(consulta, ['', '', $cate_id, idioma.rowid, 0, now])
            })
            
            return Promise.all(promesas);
        }).then(()=>{
            return Evaluacion.crearPrimera($evento_id, $cate_id, 'Evaluación', $user.rowid); // Aún no sé que nombre le asignará el usuario.
        }).then(()=>{
            let $cate = { rowid: $cate_id, nombre: '', evento_id: $evento_id, created_at: now };
            return Categoria.traducciones_single($cate);
        }).then(($cate)=>{
            res.send($cate);
        })
    })
}



function putGuardar(req, res) {
    User.fromToken(req).then(($user)=>{

        $cat_traducidas     = req.body.categorias_traducidas;
        let now             = window.fixDate(new Date(), true);

		db.find('ws_categorias_king', req.body.rowid).then(($cat_king)=>{
            
            let promesas = [];
            
            let temp = new Promise((resolve, reject)=>{
                console.log($cat_king.nombre, $cat_traducidas[0]['nombre']);
                if ($cat_king.nombre != $cat_traducidas[0]['nombre'] ) {
                    $cat_king.nombre = $cat_traducidas[0]['nombre'];
                    
                    // Cambio el nombre a la Evaluación creada automáticamente
                    db.find('ws_categorias_traduc', $cat_traducidas[0]['rowid']).then(($cat_trad)=>{
                        console.log($cat_trad.nombre);
                        if ($cat_trad.nombre == "") {
                            consulta = 'SELECT rowid, * FROM ws_evaluaciones WHERE evento_id=? AND categoria_id=? AND deleted_at is null';
                            db.query(consulta, [$cat_king.evento_id, $cat_king.rowid]).then(($eva)=>{
                                console.log($eva);
            
                                if ($eva.descripcion == "Evaluación") {
                                    $eva.descripcion = "Evaluación de " + $categorias_traducidas[0]['nombre'];
                                    
                                    consulta = 'UPDATE ws_evaluaciones SET descripcion=? WHERE rowid=?';
                                    db.query(consulta, [$eva.descripcion, $eva.rowid]).then(()=>{
                                        resolve();
                                    })

                                }
                            })
                        }
                    })
                }else{
                    resolve();
                }
            })
            
            promesas.push(temp);
            
            
            $cat_king.nivel_id 	        = req.body.nivel_id         || null;
            $cat_king.disciplina_id 	= req.body.disciplina_id    || null;
            
            consulta    = 'UPDATE ws_categorias_king SET nombre=?, nivel_id=?, disciplina_id=?, updated_at=? WHERE rowid=?';
            prome       = db.query(consulta, [$cat_king.nombre, $cat_king.nivel_id, $cat_king.disciplina_id, now, $cat_king.rowid]);
            promesas.push(prome);
            
            for (let i = 0; i < $cat_traducidas.length; i++) {
                actualizarTraduccion($cat_traducidas[i]);
            }
            
            function actualizarTraduccion($cat_traducida){
                let $promesa_trad = Categoria.updateTraduc($cat_traducida['rowid'], $cat_traducida['nombre'], $cat_traducida['alias'], $cat_traducida['descripcion'], $cat_traducida['traducido']);
                promesas.push($promesa_trad);
            }
            
            Promise.all(promesas);
            
        }).then(()=>{
            res.send('Categoría y sus traducciones guardadas.');                   
        })
    
    })
}


function putDestroy(req, res) {

	let now = window.fixDate(new Date(), true);
	
	User.fromToken(req).then((user)=>{
		return db.query('UPDATE ws_niveles_king SET deleted_at=?, deleted_by=? WHERE rowid=?', [now, user.rowid, req.body.rowid] );
	}).then(()=>{
		res.send({ rowid: req.body.rowid, deleted_at: now });
	})

}

module.exports = router;