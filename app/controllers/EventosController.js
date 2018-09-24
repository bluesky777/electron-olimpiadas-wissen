var express         = require('express');
var router          = express.Router();
var Evento          = require('../conexion/Models/Evento');
var Idioma          = require('../conexion/Models/Idioma');
var User            = require('../conexion/Models/User');
var db              = require('../conexion/connWeb');



// Enrutadores
router.route('/').get(getIndex);
router.route('/update').put(putUpdate);
router.route('/store').post(postStore);
router.route('/set-evento-actual').put(putSetActual);
router.route('/set-user-event').put(putSetUserEvent);
router.route('/set-gran-final').put(putSetGranFinal);

    


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

    $event = {};

    $event.nombre 					= req.body.nombre               || 'Evento default';
    $event.alias 					= req.body.alias                || null;
    $event.descripcion              = req.body.descripcion          || null;
    //$event.examen_actual_id 		= req.body.examen_actual_id;
    $event.idioma_principal_id 	    = req.body.idioma_principal_id;
    $event.es_idioma_unico          = req.body.es_idioma_unico;
    $event.enable_public_chat 		= req.body.enable_public_chat;
    $event.enable_private_chat      = req.body.enable_private_chat  || 0;
    $event.with_pay 				= req.body.with_pay;
    $event.actual 					= req.body.actual;

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
    console.log(req.body);
    
    db.find('ws_eventos', req.body.rowid).then(($ev)=>{
        let now     = window.fixDate(new Date(), true);
        let ev      = {};
        
        if ('with_pay' in req.body) { 
            if(req.body.with_pay == 1)
                { req.body.with_pay = 1; }else{ req.body.with_pay = 0; }
        }else{ req.body.with_pay = $ev.with_pay; }
        
        if ('es_idioma_unico' in req.body) { 
            if(req.body.es_idioma_unico == 1)
                { req.body.es_idioma_unico = 1; }else{ req.body.es_idioma_unico = 0; }
        }else{ req.body.es_idioma_unico = $ev.es_idioma_unico; }
        
        if ('enable_public_chat' in req.body) { 
            if(req.body.enable_public_chat == 1)
                { req.body.enable_public_chat = 1; }else{ req.body.enable_public_chat = 0; }
        }else{ req.body.enable_public_chat = $ev.enable_public_chat; }
        
        ev.nombre                       = req.body.nombre               || $ev.nombre;
        ev.alias                        = req.body.alias                || $ev.alias;
        ev.descripcion                  = req.body.descripcion          || $ev.descripcion;
        //$event.examen_actual_id 	    = req.body.examen_actual_id     || $event.examen_actual_id;
        ev.idioma_principal_id          = req.body.idioma_principal_id  || $ev.idioma_principal_id;
        ev.es_idioma_unico              = req.body.es_idioma_unico;
        ev.enable_public_chat           = req.body.enable_public_chat;
        ev.with_pay                     = req.body.with_pay;

        ev.precio1      = req.body.precio1 || $ev.precio1;
        ev.precio2      = req.body.precio2 || $ev.precio2;
        ev.precio3      = req.body.precio3 || $ev.precio3;
        ev.precio4      = req.body.precio4 || $ev.precio4;
        ev.precio5      = req.body.precio5 || $ev.precio5;
        ev.precio6      = req.body.precio6 || $ev.precio6;
        ev.updated_at   = now;
        ev.rowid        = req.body.rowid; // para el WHERE
        
        let consulta = 
            'UPDATE ws_eventos SET nombre=?, alias=?, descripcion=?, idioma_principal_id=?, ' + 
                'es_idioma_unico=?, enable_public_chat=?, with_pay=?, ' + 
                'precio1=?, precio2=?, precio3=?, precio4=?, precio5=?, precio6=?, updated_at=? ' +
            'WHERE rowid=?';
        
        valores = window.getValores(ev);

        db.query(consulta, valores).then(()=>{
            res.send('Guardado');
        })

    })

}


function putSetActual(req, res){
    let consulta = 'UPDATE ws_eventos SET actual=0';
    db.query(consulta).then(()=>{
        
        let consulta = 'UPDATE ws_eventos SET actual=1 WHERE rowid=?';
        
        db.query(consulta, [req.body.id]).then(()=>{
            res.send('Actualizado');
        })
    })
}



function putSetUserEvent(req, res){
    User.fromToken(req).then(($user)=>{
        let consulta = 'UPDATE users set evento_selected_id=? where rowid=? and deleted_at is null';
        db.query(consulta, [req.body.evento_id, $user.rowid]).then(()=>{
            res.send('Evento del usuario establecido');
        })
    })
}



function putSetGranFinal(req, res){
    User.fromToken(req).then(($user)=>{
        let consulta = 'UPDATE ws_eventos SET gran_final=? WHERE rowid=?';
        
        db.query(consulta, [req.body.gran_final, req.body.id]).then(()=>{
            
            res.send('Actualizado');

        })
    })
}



module.exports = router;