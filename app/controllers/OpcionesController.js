var express         = require('express');
var router          = express.Router();
var User            = require('../conexion/Models/User');
var db              = require('../conexion/connWeb');





router.route('/store').post(postStore);
router.route('/destroy').put(putDestroy);



function postStore(req, res) {
    User.fromToken(req).then(($user)=>{
        let now 			= window.fixDate(new Date(), true);
        is_correct = 0;
        
        if(req.body.is_correct==true || req.body.is_correct=='true' || req.body.is_correct==1 || req.body.is_correct=='1'){
            is_correct = 1;
        }
        
		op = {};
		op.definicion          = req.body.definicion;
		op.orden               = req.body.orden;
		op.is_correct          = is_correct;
		op.pregunta_traduc_id  = req.body.preg_traduc_id;
		op.added_by            = $user.rowid;
		op.created_at          = now;

        db.query('INSERT INTO ws_opciones(definicion, orden, is_correct, pregunta_traduc_id, added_by, created_at) VALUES(?,?,?,?,?,?)', 
            [op.definicion, op.orden, op.is_correct, op.pregunta_traduc_id, op.added_by, op.created_at]).then((result)=>{
                
                op.rowid    = result.insertId;
                op.id       = result.insertId;
                res.send(op);
        });
		
    
    })
}
 

function putDestroy(req, res) {
    User.fromToken(req).then(($user)=>{

        db.query('DELETE FROM ws_opciones WHERE rowid=?', [req.body.rowid]).then((result)=>{
            res.send(req.body);
        });
		
    
    })
}
 

module.exports = router;