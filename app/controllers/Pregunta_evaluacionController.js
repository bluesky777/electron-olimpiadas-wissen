var express         = require('express');
var router          = express.Router();
var User            = require('../conexion/Models/User');
var Pregunta        = require('../conexion/Models/Pregunta');
var Evento          = require('../conexion/Models/Evento');
var db              = require('../conexion/connWeb');





router.route('/asignar-pregunta').get(putAsignarPregunta);




function putAsignarPregunta(req, res) {
    User.fromToken(req).then(($user)=>{

		$pregunta_id    = req.body.pregunta_id;
        
        $evaluacion_id 	= req.body.evaluacion_id;
        $pregunta_id 	= req.body.pregunta_id;
        let consulta    = 'SELECT rowid, * FROM ws_pregunta_evaluacion WHERE categoria_id=? WHERE pregunta_id=? and evaluacion_id=?';
        
        db.query(consulta, [$pregunta_id, $evaluacion_id]).then(($preg_eval)=>{
            res.send('Cambiada');
        })
        
    }) // User.fromToken
}
        

module.exports = router;