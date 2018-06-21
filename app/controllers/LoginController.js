var express         = require('express');
var router          = express.Router();




router.route('/')
    .put(putLogout)
    .post(postLogin)
    .post(postVerificar);

function putLogout(req, res) {
    var connection 	    = require('../conexion/conn');
    
    consulta 	= `SELECT * FROM ws_idiomas where deleted_at is null`;
    connection.query(consulta, function (error, result) {
        
        res.json( result );
        
    });
}

function postLogin(req, res) {
    //handle POST route here
}


function postVerificar(req, res) {
    //handle POST route here
}

module.exports = router;