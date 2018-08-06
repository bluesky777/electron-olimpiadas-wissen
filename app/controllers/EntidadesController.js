var express         = require('express');
var router          = express.Router();
var User            = require('../conexion/Models/User');
var Entidad         = require('../conexion/Models/Entidad');
var db              = require('../conexion/connWeb');





router.route('/').get(getIndex)
router.route('/store').post(postStore);
router.route('/destroy').put(putDestroy);
router.route('/update').put(putUpdate);


function getIndex(req, res) {
    User.fromToken(req).then(($user)=>{
        
		$evento_id = $user.evento_selected_id;

		Entidad.todas($evento_id).then(($enti)=>{
            res.send($enti);
        })
    })
}
    

function postStore(req, res) {
    User.fromToken(req).then(($user)=>{
        
        $evento_id          = $user.evento_selected_id;
        req.body.evento_id  = $evento_id;
        console.log(req.body);
		Entidad.crear(req.body).then(($enti)=>{
            Entidad.find($enti.insertId).then(($entidad)=>{
                res.send($entidad);
            });
        })
    })
}
    
 

function putUpdate(req, res) {
    User.fromToken(req).then(($user)=>{
        let now     = window.fixDate(new Date());
        
        db.find('ws_entidades', req.body.rowid).then(($entidad)=>{
            
            evento_id      = req.body.evento_id   || $user.evento_selected_id;
            alias           = req.body.alias        || $entidad.alias;
            lider_id        = req.body.lider_id     || $entidad.lider_id;
            lider_nombre    = req.body.lider_nombre || $entidad.lider_nombre;
            logo_id         = req.body.logo_id      || $entidad.logo_id;
            nombre          = req.body.nombre       || $entidad.nombre;
            telefono        = req.body.telefono     || $entidad.telefono;
            
            
            consulta    = 'UPDATE ws_entidades SET alias=?, evento_id=?, lider_id=?, lider_nombre=?, logo_id=?, nombre=?, telefono=?, updated_at=? WHERE rowid=?';
            db.query(consulta, [alias, evento_id, lider_id, lider_nombre, logo_id, nombre, telefono, now, req.body.rowid]).then(()=>{
                res.send(req.body);
            });
        });
    })
}
    
 

function putDestroy(req, res) {
    User.fromToken(req).then(($user)=>{
        let now     = window.fixDate(new Date());
        consulta    = 'UPDATE ws_entidades SET deleted_at=? WHERE rowid=?';
		db.query(consulta, [now, req.body.rowid]).then(()=>{
            res.send(req.body);
        })
    })
}
    


module.exports = router;