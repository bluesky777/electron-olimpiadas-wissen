var express     = require('express');
var router      = express.Router();
db              = require('../conexion/connWeb');

// Enrutadores
router.route('/')
    .get(getRouteHandler)
    .post(postRouteHandler);

router.route('/crear-tablas').get(getCrearTablas);
router.route('/crear-datos-iniciales').get(getCrearDatosIniciales);
router.route('/descargar-datos').get(getDescargarDatos);
router.route('/borrar-datos').get(getBorrarDatos);



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


function getDescargarDatos(req, res) {
    require('../conexion/connDescargarDatos')().then(()=>{
        res.send('Datos descargados');
    }, (r2)=>{
        res.send('Hubo un error descargando Datos');
        console.log(r2)
    });
}


function getBorrarDatos(req, res) {
    db.query('DELETE FROM images;')
    .then(()=>{
        return db.query('DELETE FROM permission_role;')
    }).then(()=>{
        return db.query('DELETE FROM permissions;')
    }).then(()=>{
        return db.query('DELETE FROM pids;')
    }).then(()=>{
        return db.query('DELETE FROM qrcodes;')
    }).then(()=>{
        return db.query('DELETE FROM role_user;')
    }).then(()=>{
        return db.query('DELETE FROM roles;')
    }).then(()=>{
        return db.query('DELETE FROM users;')
    }).then(()=>{
        return db.query('DELETE FROM ws_categorias_king;')
    }).then(()=>{
        return db.query('DELETE FROM ws_categorias_traduc;')
    }).then(()=>{
        return db.query('DELETE FROM ws_contenido_traduc;')
    }).then(()=>{
        return db.query('DELETE FROM ws_disciplinas_king;')
    }).then(()=>{
        return db.query('DELETE FROM ws_disciplinas_traduc;')
    }).then(()=>{
        return db.query('DELETE FROM ws_entidades;')
    }).then(()=>{
        return db.query('DELETE FROM ws_evaluaciones;')
    }).then(()=>{
        return db.query('DELETE FROM ws_eventos;')
    }).then(()=>{
        return db.query('DELETE FROM ws_examen_respuesta;')
    }).then(()=>{
        return db.query('DELETE FROM ws_grupos_preguntas;')
    }).then(()=>{
        return db.query('DELETE FROM ws_idiomas;')
    }).then(()=>{
        return db.query('DELETE FROM ws_idiomas_registrados;')
    }).then(()=>{
        return db.query('DELETE FROM ws_inscripciones;')
    }).then(()=>{
        return db.query('DELETE FROM ws_nivel_participante;')
    }).then(()=>{
        return db.query('DELETE FROM ws_niveles_king;')
    }).then(()=>{
        return db.query('DELETE FROM ws_niveles_traduc;')
    }).then(()=>{
        return db.query('DELETE FROM ws_opciones;')
    }).then(()=>{
        return db.query('DELETE FROM ws_opciones_agrupadas;')
    }).then(()=>{
        return db.query('DELETE FROM ws_opciones_cuadricula;')
    }).then(()=>{
        return db.query('DELETE FROM ws_pregunta_evaluacion;')
    }).then(()=>{
        return db.query('DELETE FROM ws_pregunta_traduc;')
    }).then(()=>{
        return db.query('DELETE FROM ws_preguntas_agrupadas;')
    }).then(()=>{
        return db.query('DELETE FROM ws_preguntas_king;')
    }).then(()=>{
        return db.query('DELETE FROM ws_respuestas;')
    }).then(()=>{
        return db.query('DELETE FROM ws_user_event;')
    }).then(()=>{
        res.send('Datos borrados');
    }, (r2)=>{
        res.send('Hubo un error al borrar Datos');
        console.log(r2)
    });
}

module.exports = router;