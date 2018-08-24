var express         = require('express');
var router          = express.Router();
var User            = require('../conexion/Models/User');
var db              = require('../conexion/connWeb');





router.route('/').get(getIndex);
router.route('/store').post(postStore);
router.route('/cambiar-idioma').put(putCambiarIdioma);


function getIndex(req, res) {

    consulta 	= 'SELECT *, rowid FROM ws_idiomas where deleted_at is null';
    
    db.query(consulta).then(function(result){
        res.json( result );
    }, function(err){
        res.status(500).json({ error: err });
    }); 
        
}
    
function postStore(req, res) {
    User.fromToken(req).then(($user)=>{
        
        let now         = window.fixDate(new Date(), true);
        let consulta    = 'SELECT rowid, * FROM ws_idiomas_registrados WHERE evento_id=? and idioma_id=? and deleted_at is not null'
        let idioma_ev   = {};
        
        db.query(consulta, [req.body.evento_id, req.body.idioma_id]).then((idioma)=>{
            if (idioma.length > 0){
                idioma      = idioma[0];
                consulta    = 'UPDATE ws_idiomas_registrados SET deleted_at=null, updated_at=? WHERE rowid=?'
                return db.query(consulta, [now, idioma.rowid]);
            }else{
                consulta    = 'INSERT INTO ws_idiomas_registrados(evento_id, idioma_id, created_at) VALUES(?,?,?) '
                return db.query(consulta, [req.body.evento_id, req.body.idioma_id, now]);
            }
            
        }).then(()=>{
            consulta    = 'SELECT rowid, * FROM ws_idiomas_registrados WHERE evento_id=? and idioma_id=? and deleted_at is null'
            return db.query(consulta, [req.body.evento_id, req.body.idioma_id]);
        }).then((idioma)=>{
            idioma_ev = idioma[0];
            
            // Comprobar traducciones de categorías
            consulta = 'SELECT rowid, * FROM ws_categorias_king WHERE evento_id=? and deleted_at is null';
            return db.query(consulta, [idioma_ev.evento_id]);

        }).then(($categorias)=>{
            
            let promesas = $categorias.map((categoria, i)=>{
                consulta    = 'SELECT rowid, * FROM ws_categorias_traduc WHERE categoria_id=? and idioma_id=? and deleted_at is not null'
                db.query(consulta, [categoria.rowid, req.body.idioma_id]).then((categ)=>{
                    if (categ.length > 0){
                        categ       = categ[0];
                        consulta    = 'UPDATE ws_categorias_traduc SET deleted_at=null, updated_at=? WHERE rowid=?'
                        return db.query(consulta, [now, categ.rowid]);
                    }else{
                        consulta    = 'INSERT INTO ws_categorias_traduc(nombre, categoria_id, idioma_id, traducido, created_at) VALUES(?,?,?,?,?) '
                        return db.query(consulta, ['', categoria.rowid, req.body.idioma_id, 0, now]);
                    }
                })
            })
            
            return Promise.all(promesas);
        }).then((result)=>{
            console.log(result);
            res.send(idioma_ev);
        })
        
    })
}


function putCambiarIdioma(req, res) {
    User.fromToken(req).then(($user)=>{
        let consulta    = 'UPDATE users SET idioma_main_id=? WHERE rowid=?'
        
        db.query(consulta, [req.body.idioma_id, $user.rowid]).then(()=>{
            res.send('Idioma cambiado');
        })
    })
}



function deleteDestroy(req, res) {
    User.fromToken(req).then(($user)=>{
        let now         = window.fixDate(new Date(), true);
        let consulta    = 'UPDATE ws_idiomas_registrados SET deleted_at=? WHERE evento_id=? and idioma_id=?;'
        
        db.query(consulta, [now, req.body.evento_id, req.body.idioma_id]).then(()=>{
            res.send('Idioma quitado');
        })
    })
}


module.exports = router;