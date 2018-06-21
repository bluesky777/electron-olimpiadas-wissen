var express = require('express');
var router = express.Router();
db = require('../conexion/connWeb');

// Enrutadores
router.route('/')
    .get(getRouteHandler)
    .post(postRouteHandler);

router.route('/crear-tablas').get(getCrearTablas);
router.route('/crear-datos-iniciales').get(getCrearDatosIniciales);



// Funciones
function getRouteHandler(req, res) {
    /*
    return new Promise(function (resolve, reject){
        resolve('Suerte');
    }).then(function(mesn){
        res.send(mesn);
    });
    return;
    */
    var ip = require('ip');
    var ip = ip.address();
    respuesta = {nombre: 'Bienvenido', ip: ip};
    res.json(respuesta);

}

function postRouteHandler(req, res) {
    //handle POST route here
}

function getCrearTablas(req, res) {
    crear = require('../conexion/connCrearTablas')();
    res.send('Tablas Creadas');
}

function getCrearDatosIniciales(req, res) {
    require('../conexion/connCrearDatosIniciales')();
    res.send('Datos agregados');
}

module.exports = router;