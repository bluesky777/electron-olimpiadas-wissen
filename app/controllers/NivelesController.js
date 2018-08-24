var express         = require('express');
var router          = express.Router();
var User            = require('../conexion/Models/User');
var Nivel           = require('../conexion/Models/Nivel');
var Evento          = require('../conexion/Models/Evento');
var db              = require('../conexion/connWeb');





router.route('/niveles-usuario').get(getNivelesUsuarioHandler);
router.route('/guardar').put(putGuardar);
router.route('/store').post(postStore);
router.route('/destroy').put(putDestroy);



function getNivelesUsuarioHandler(req, res) {
    User.fromToken(req).then(($user)=>{
        
		$evento_id = $user.evento_selected_id;

		db.query('SELECT *, rowid FROM ws_niveles_king WHERE evento_id=? AND deleted_at is null', [$evento_id]).then((result)=>{
            $nivel = result;
            
            Nivel.traduc($nivel).then((result_nivel)=>{
                res.send(result_nivel);                
            });
            
        });
    })
}



function postStore(req, res) {
    User.fromToken(req).then(($user)=>{
        let now             = window.fixDate(new Date(), true);
        let $event_idiomas  = [];
        let $niv_id         = 0;
        let $evento_id      = $user.evento_selected_id;

        
		db.find('ws_eventos', $evento_id).then(($evento)=>{
            return Evento.idiomas_all($evento_id)
        }).then((event_idiomas)=>{
            $event_idiomas = event_idiomas;
            
            consulta = 'INSERT INTO ws_niveles_king(nombre, evento_id, created_at) VALUES(?,?,?)';
            return db.query(consulta, ['', $evento_id, now])        
        }).then((result)=>{
            $niv_id = result.insertId
            let promesas = $event_idiomas.map((idioma, i)=>{
                consulta = 'INSERT INTO ws_niveles_traduc(nombre, nivel_id, idioma_id, traducido, created_at) VALUES(?,?,?,?,?)';
                return db.query(consulta, ['', $niv_id, idioma.rowid, 0, now])
            })
            
            return Promise.all(promesas);
        }).then(()=>{
            let $niv = { rowid: $niv_id, nombre: '', evento_id: $evento_id, created_at: now };
            return Nivel.traducciones_single($niv);
        }).then(($niv)=>{
            res.send($niv);
        })
    })
}


function putGuardar(req, res) {
    User.fromToken(req).then(($user)=>{

        $niv_traducidos     = req.body.niveles_traducidos;
        let now             = window.fixDate(new Date(), true);

		db.find('ws_niveles_king', req.body.rowid).then(($niv_king)=>{
            
            let promesas = [];
            
            if ($niv_king.nombre != $niv_traducidos[0]['nombre'] ) {
                $niv_king.nombre = $niv_traducidos[0]['nombre'];
                prome = db.query('UPDATE ws_niveles_king SET nombre=?, updated_at=? WHERE rowid=?', [$niv_traducidos[0]['nombre'], now, $niv_king.rowid]);
                promesas.push(prome);
            }
            
            for (let i = 0; i < $niv_traducidos.length; i++) {
                actualizarTraduccion($niv_traducidos[i]);
            }
            
            function actualizarTraduccion($niv_traducida){
                
                let $promesa_trad = Nivel.updateTraduc($niv_traducida['rowid'], $niv_traducida['nombre'], $niv_traducida['descripcion'], $niv_traducida['traducido']);
                promesas.push($promesa_trad);
                
            }
            
            Promise.all(promesas).then(()=>{
                res.send('Nivel y sus traducciones guardadas.');                   
            })
        });
    
    })
}


function putDestroy(req, res) {

	let now = window.fixDate(new Date(), true);
	
	User.fromToken(req).then((user)=>{
		return db.query('UPDATE ws_niveles_king SET deleted_at=?, deleted_by=? WHERE rowid=?', [now, user.rowid, req.body.rowid] );
	}).then(()=>{
		res.send({ rowid: req.body.rowid, deleted_at: now });
	})

}


module.exports = router;