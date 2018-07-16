var express         = require('express');
var router          = express.Router();
var jwt             = require('jsonwebtoken');
var User            = require('../conexion/Models/User');
var db              = require('../conexion/connWeb');

require('dotenv').config();


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
    let token = req.headers.authorization.slice(7);
    
    jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
        if (err) {
            console.log(err);
            res.status(400).send({'error': 'Al parecer el token expiró'});
        }
        
        User.find(decoded.rowid).then((result)=>{
            $user = result;
            User.datos_usuario_logueado($user).then((user)=>{
                res.send(user);
            });
            
        });

        
    });
        
}

module.exports = router;