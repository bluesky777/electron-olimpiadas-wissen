var express         = require('express');
var router          = express.Router();
var User            = require('../conexion/Models/User');
var Disciplina      = require('../conexion/Models/Disciplina');
var db              = require('../conexion/connWeb');





router.route('/')
    .get(getIndex)

router.route('/disciplinas-usuario').get(getDisciplinasUsuarioHandler);
router.route('/guardar').put(putGuardar);


function getIndex(req, res) {
        
}
    

function getDisciplinasUsuarioHandler(req, res) {
    User.fromToken(req).then(($user)=>{
        
		$evento_id = $user.evento_selected_id;

		db.query('SELECT *, rowid FROM ws_disciplinas_king WHERE evento_id = ? and deleted_at is null', [$evento_id]).then(($disciplinas)=>{

            Disciplina.traduc($disciplinas).then((result_disciplinas)=>{
                res.send(result_disciplinas);                
            });
            
        });

		
    
    })
}
 

function putGuardar(req, res) {
    User.fromToken(req).then(($user)=>{
        console.log(req);
		$disc_traducidas = req.body.disciplinas_traducidas;

		db.find('ws_disciplinas_king', req.body.rowid).then(($disc_king)=>{
            
            
            if ($disc_king.nombre != $disc_traducidas[0]['nombre'] ) {
                $disc_king.nombre = $disc_traducidas[0]['nombre'];
                //$disc_king.save();
            }
            
            let promesas = [];
            for (let i = 0; i < $disc_traducidas.length; i++) {
                actualizarTraduccion($disc_traducidas[i]);
            }
            
            function actualizarTraduccion($disc_traducida){
                
                let $promesa_trad = Disciplina.updateTraduc($disc_traducida['id'], $disc_traducida['nombre'], $disc_traducida['descripcion'], $disc_traducida['traducido']);
                promesas.push($promesa_trad);
                
                
            }
            
            Promise.all(promesas).then(()=>{
                res.send('Disciplina y sus traducciones guardadas.');                   
            })
        });

		
    
    })
}

module.exports = router;