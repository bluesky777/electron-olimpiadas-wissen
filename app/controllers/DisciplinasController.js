var express         = require('express');
var router          = express.Router();
var User            = require('../conexion/Models/User');
var Disciplina      = require('../conexion/Models/Disciplina');
var Evento          = require('../conexion/Models/Evento');
var db              = require('../conexion/connWeb');





router.route('/disciplinas-usuario').get(getDisciplinasUsuarioHandler);
router.route('/guardar').put(putGuardar);
router.route('/store').post(postStore);
router.route('/destroy').put(putDestroy);



function getDisciplinasUsuarioHandler(req, res) {
    User.fromToken(req).then(($user)=>{
        
		$evento_id = $user.evento_selected_id;

		db.query('SELECT *, rowid, rowid as id FROM ws_disciplinas_king WHERE evento_id = ? and deleted_at is null', [$evento_id]).then(($disciplinas)=>{

            Disciplina.traduc($disciplinas).then((result_disciplinas)=>{
                res.send(result_disciplinas);                
            });
            
        });

		
    
    })
}
 

function postStore(req, res) {
    User.fromToken(req).then(($user)=>{
        let now             = window.fixDate(new Date(), true);
        let $event_idiomas  = [];
        let $dis_id         = 0;
        let $evento_id      = $user.evento_selected_id;

        
		db.find('ws_eventos', $evento_id).then(($evento)=>{
            return Evento.idiomas_all($evento_id)
        }).then((event_idiomas)=>{
            $event_idiomas = event_idiomas;
            
            consulta = 'INSERT INTO ws_disciplinas_king(nombre, evento_id, created_at) VALUES(?,?,?)';
            return db.query(consulta, ['', $evento_id, now])        
        }).then((result)=>{
            $dis_id = result.insertId
            let promesas = $event_idiomas.map((idioma, i)=>{
                consulta = 'INSERT INTO ws_disciplinas_traduc(nombre, disciplina_id, idioma_id, traducido, created_at) VALUES(?,?,?,?,?)';
                return db.query(consulta, ['', $dis_id, idioma.rowid, 0, now])
            })
            
            return Promise.all(promesas);
        }).then(()=>{
            let $dis = { rowid: $dis_id, nombre: '', evento_id: $evento_id, created_at: now };
            return Disciplina.traducciones_single($dis);
        }).then(($dis)=>{
            res.send($dis);
        })
    })
}


function putGuardar(req, res) {
    User.fromToken(req).then(($user)=>{

        $disc_traducidas    = req.body.disciplinas_traducidas;
        let now             = window.fixDate(new Date(), true);

		db.find('ws_disciplinas_king', req.body.rowid).then(($disc_king)=>{
            
            let promesas = [];
            
            if ($disc_king.nombre != $disc_traducidas[0]['nombre'] ) {
                $disc_king.nombre = $disc_traducidas[0]['nombre'];
                prome = db.query('UPDATE ws_disciplinas_king SET nombre=?, updated_at=? WHERE rowid=?', [$disc_traducidas[0]['nombre'], now, $disc_king.rowid]);
                promesas.push(prome);
            }
            
            for (let i = 0; i < $disc_traducidas.length; i++) {
                actualizarTraduccion($disc_traducidas[i]);
            }
            
            function actualizarTraduccion($disc_traducida){
                
                let $promesa_trad = Disciplina.updateTraduc($disc_traducida['rowid'], $disc_traducida['nombre'], $disc_traducida['descripcion'], $disc_traducida['traducido']);
                promesas.push($promesa_trad);
                
            }
            
            Promise.all(promesas).then(()=>{
                res.send('Disciplina y sus traducciones guardadas.');                   
            })
        });

		
    
    })
}


function putDestroy(req, res) {

	let now = window.fixDate(new Date(), true);
	
	User.fromToken(req).then((user)=>{
		return db.query('UPDATE ws_disciplinas_king SET deleted_at=?, deleted_by=? WHERE rowid=?', [now, user.rowid, req.body.rowid] );
	}).then(()=>{
		res.send({ rowid: req.body.rowid, deleted_at: now });
	})

}


module.exports = router;