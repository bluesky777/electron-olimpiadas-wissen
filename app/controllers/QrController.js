var express             = require('express');
var User                = require('../conexion/Models/User');
var Pregunta            = require('../conexion/Models/Pregunta');
var Evaluacion          = require('../conexion/Models/Evaluacion');
var Evento              = require('../conexion/Models/Evento');
var Categoria 			= require('../conexion/Models/Categoria');
var jwt                 = require('jsonwebtoken');
var router              = express.Router();

router.route('/validar-usuario').put(putValidarUsuario);




function putValidarUsuario(req, res) {
	token = req.body.token_auth;
	
    User.fromToken(req, token).then((user)=>{
		$user_auth = user;
		
        if ( $user_auth.roles[0]['Admin'] || $user_auth.roles[0]['Profesor'] || $user_auth.roles[0]['Asesor'] ||  $user_auth.is_superuser || $user_auth.roles[0]['Ejecutor']) {
            $user_id 	= req.body.user_id;
            $token      = jwt.sign({ rowid: $user_id }, process.env.JWT_SECRET);
            res.send({'token': $token});
        }else{
            res.status(400).send({'error': 'No autorizado'});
        }

        
    });

}



module.exports = router;