var express         = require('express');
var router          = express.Router();
var User            = require('../conexion/Models/User');
var Nivel           = require('../conexion/Models/Nivel');
var db              = require('../conexion/connWeb');





router.route('/')
    .get(getIndex)

router.route('/niveles-usuario').get(getNivelesUsuarioHandler);

function getIndex(req, res) {
        
}
    

function getNivelesUsuarioHandler(req, res) {
    User.fromToken(req).then(($user)=>{
        
		$evento_id = $user.evento_selected_id;

		db.query('SELECT *, rowid FROM ws_niveles_king WHERE evento_id=? AND deleted_at is null', [$evento_id]).then((result)=>{
            $nivel = result;
            
            Nivel.traduc($nivel).then((result_nivel)=>{
                res.send(result_nivel);                
            });
            
        });

		
    
    })
}

module.exports = router;