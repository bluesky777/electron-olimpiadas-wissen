var express     = require('express');
var router      = express.Router();
db              = require('../conexion/connWeb');

// Enrutadores
router.route('/')
    .get(getRouteHandler)
    .post(postRouteHandler);

router.route('/crear-tablas').get(getCrearTablas);
router.route('/crear-datos-iniciales').get(getCrearDatosIniciales);



// Funciones
function getRouteHandler(req, res) {
    
    var ip = require('ip');
    var ip = ip.address();
    var Eventos = require('../conexion/Models/Evento');
    
    Eventos.actual().then(function(result){
        promesa = new Promise(function(resolve, reject){
            evento      = result;
            evento.ip   = ip;
            
            if (req.qr == false || !req.qr) {
                let QrCodes = require('../conexion/Models/QrCode');
                let numero  = (Math.floor(Math.random() * Math.floor(9999))).toString();
                
                QrCodes.crear(numero, 'let_in').then(function(result2){
                    evento.qr   = numero;
                    resolve(evento);
                });
                
            }else{
                resolve(evento);
            }
        });
        return promesa;
    })
    .then(function(evento){        
        res.json(evento);
    });
    

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