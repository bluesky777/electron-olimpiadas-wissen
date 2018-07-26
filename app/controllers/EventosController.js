var express         = require('express');
var router          = express.Router();
var Evento          = require('../conexion/Models/Evento');
var Idioma          = require('../conexion/Models/Idioma');
var db              = require('../conexion/connWeb');



// Enrutadores
router.route('/').get(getIndex);
router.route('/update').put(putUpdate);
router.route('/store').post(postStore);
router.route('/set-actual').put(putSetActual);

    


// Funciones
function getIndex(req, res) {
        
    Evento.todos().then((result)=>{
        
        let eventos     = result;
        let promises    = [];
        
        for (i=0; i < eventos.length; i++) { 
            idiomas_all(i);
        }
        
        function idiomas_all(i){
            let idioma_promise = Evento.idiomas_all(eventos[i].rowid, eventos[i]);
            promises.push(idioma_promise);
            
            idioma_promise.then((idiomas)=>{
                eventos[i].idiomas = idiomas;
            });
        }
        
        
        Promise.all(promises).then(function(values) {
            res.json( eventos );
        });
    });

}



function postStore(req, res) {
    console.log(req);
    $event = {};

    $event.nombre 					= req.body.nombre               || 'Evento default';
    $event.alias 					= req.body.alias                || null;
    $event.descripcion              = req.body.descripcion          || null;
    //$event.examen_actual_id 		= req.body.examen_actual_id     || null;
    $event.idioma_principal_id 	    = req.body.idioma_principal_id  || 1;
    $event.es_idioma_unico          = req.body.es_idioma_unico      || 1;
    $event.enable_public_chat 		= req.body.enable_public_chat   || 0;
    $event.enable_private_chat      = req.body.enable_private_chat  || 0;
    $event.with_pay 				= req.body.with_pay             || 0;
    $event.actual 					= req.body.actual               || 0;

    $event.precio1 = req.body.precio1 || 0;
    $event.precio2 = req.body.precio2 || 0;
    $event.precio3 = req.body.precio3 || 0;
    $event.precio4 = req.body.precio4 || 0;
    $event.precio5 = req.body.precio5 || 0;
    $event.precio6 = req.body.precio6 || 0;


    Evento.create($event).then((ev_id)=>{
        $event.rowid = ev_id;
        
        return new Promise((resolve, reject)=>{
            
            // Inscribimos los otros idiomas si no es idioma único
            if (!$event.es_idioma_unico){

                $idiomas_extras = req.body.idiomas_extras;

                if ( $idiomas_extras instanceof Array){

                    let promesas = $idiomas_extras.map(($idioma_extra)=>{
                        return Idioma.registrar($idioma_extra.rowid, ev_id);
                    })
                    
                    Promise.all(promesas).then((result)=>{
                        resolve();
                    })
                        
                }else{
                    resolve();
                }
            }else{
                resolve();  
            }

        })
        
    }).then(()=>{
        res.send($event);
    })

}


function putUpdate(req, res) {

    $event = db.find(req.body.rowid);

    $event.nombre 					= req.body.nombre               || 'Evento default';
    $event.alias 					= req.body.alias                || null;
    $event.descripcion              = req.body.descripcion          || null;
    //$event.examen_actual_id 		= req.body.examen_actual_id     || null;
    $event.idioma_principal_id 	    = req.body.idioma_principal_id  || 1;
    $event.es_idioma_unico          = req.body.es_idioma_unico      || 1;
    $event.enable_public_chat 		= req.body.enable_public_chat   || 0;
    $event.enable_private_chat      = req.body.enable_private_chat  || 0;
    $event.with_pay 				= req.body.with_pay             || 0;
    $event.actual 					= req.body.actual               || 0;

    $event.precio1 = req.body.precio1 || 0;
    $event.precio2 = req.body.precio2 || 0;
    $event.precio3 = req.body.precio3 || 0;
    $event.precio4 = req.body.precio4 || 0;
    $event.precio5 = req.body.precio5 || 0;
    $event.precio6 = req.body.precio6 || 0;


    // Terminar

}


function putSetActual(req, res){
    let consulta = 'UPDATE ws_eventos SET actual=0';
    db.query(consulta).then(()=>{
        
        let consulta = 'UPDATE ws_eventos SET actual=1 WHERE rowid=?';
        
        db.query(consulta, [req.body.rowid]).then(()=>{
            res.send('Actualizado');
        })
    })
}



module.exports = router;