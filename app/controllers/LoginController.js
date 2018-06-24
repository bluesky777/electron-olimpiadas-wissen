var express         = require('express');
var router          = express.Router();
var db              = require('../conexion/connWeb');



// Enrutadores
router.route('/logout').put(putLogout)
router.route('/login').post(postLogin)
router.route('/verificar').post(postVerificar);

    


// Funciones
function putLogout(req, res) {
    
    consulta 	= `SELECT * FROM ws_idiomas where deleted_at is null`;
    connection.query(consulta, function (error, result) {
        
        res.json( result );
        
    });
}

function postLogin(req, res) {
    User = require('../conexion/Models/User');
    
    User.login(req.body).then((user)=>{
        
        return User.datos_usuario_logueado(user);
        
    }, (r2)=>{
        
        console.log(r2);
        res.status(400).send({ error: r2 })
        
    }).then((user)=>{
        
        res.send(user);
        
    })
    
    
}


function postVerificar(req, res) {
    //handle POST route here
}

module.exports = router;