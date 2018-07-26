var express         = require('express');
var User            = require('../conexion/Models/User');
var Role            = require('../conexion/Models/Role');
var Inscripcion     = require('../conexion/Models/Inscripcion');
var ImagenModel     = require('../conexion/Models/ImagenModel');
var router          = express.Router();


router.route('/inscribir-varios').put(putInscribirVarios);
router.route('/desinscribir-varios').put(putDesinscribirVarios);





function putInscribirVarios(req, res) {
    User.fromToken(req).then(($user)=>{
        
		$usuarios           = req.body.usuarios;
        $categoria_id       = req.body.categoria_id;
        $promesas           = [];

		for($i=0; $i < $usuarios.length; $i++){
            inscribirlos($usuarios[$i]['user_id']);
        }
        
        
        function inscribirlos($user_id){
            $inscrip = Inscripcion.inscribir($user_id, $categoria_id);
            $promesas.push($inscrip);
        }
        
        Promise.all($promesas).then((inscripciones)=>{
            res.send(inscripciones);
        })
    })
}





function putDesinscribirVarios(req, res) {
    User.fromToken(req).then(($user)=>{
        
		$usuarios           = req.body.usuarios;
        $categoria_id       = req.body.categoria_id;
        $promesas           = [];

		for($i=0; $i < $usuarios.length; $i++){
            desinscribirlos($usuarios[$i]['user_id']);
        }
        
        
        function desinscribirlos($user_id){
            $inscrip = Inscripcion.desinscribir($user_id, $categoria_id);
            $promesas.push($inscrip);
        }
        
        Promise.all($promesas).then((inscripciones)=>{
            res.send('Desinscritos');
        })
    })
}



module.exports = router;