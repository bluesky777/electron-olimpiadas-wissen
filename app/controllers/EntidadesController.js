var express         = require('express');
var router          = express.Router();
var User            = require('../conexion/Models/User');
var Entidad         = require('../conexion/Models/Entidad');
var db              = require('../conexion/connWeb');





router.route('/')
    .get(getIndex)

//router.route('/entidades').get(getNivelesUsuarioHandler);

function getIndex(req, res) {
    User.fromToken(req).then(($user)=>{
        
		$evento_id = $user.evento_selected_id;

		Entidad.todas($evento_id).then(($enti)=>{
            res.send($enti);
        })
    })
}
    


module.exports = router;