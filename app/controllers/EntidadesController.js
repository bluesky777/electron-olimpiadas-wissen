var express         = require('express');
var router          = express.Router();
var User            = require('../conexion/Models/User');
var Entidad         = require('../conexion/Models/Entidad');
var db              = require('../conexion/connWeb');





router.route('/').get(getIndex)
router.route('/store').post(postStore);
router.route('/destroy').put(putDestroy);


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