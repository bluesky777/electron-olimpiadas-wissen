var express         = require('express');
var router          = express.Router();
var User            = require('../conexion/Models/User');
var Categoria       = require('../conexion/Models/Categoria');
var Evento          = require('../conexion/Models/Evento');
var db              = require('../conexion/connWeb');





router.route('/')
    .get(getIndex)

router.route('/categorias-usuario').get(getCategoriasUsuarioHandler);
router.route('/categorias-evento').get(getCategoriasEvento);

function getIndex(req, res) {
        
}
    

function getCategoriasUsuarioHandler(req, res) {
    User.fromToken(req).then(($user)=>{
        
		$evento_id = $user.evento_selected_id;

		db.query('SELECT *, rowid FROM ws_categorias_king WHERE evento_id = ? and deleted_at is null', [$evento_id]).then(($categorias)=>{

            Categoria.traduc($categorias).then((result_categorias)=>{
                res.send(result_categorias);                
            });
            
        });

		
    
    })
}


function getCategoriasEvento(req, res) {
    let $user = {};
    
    User.fromToken(req).then(($user_r)=>{
        
        $user       = $user_r;
		return Evento.actual();		
    
    }).then(($evento)=>{
        
		db.query('SELECT *, rowid FROM ws_categorias_king WHERE evento_id = ? and deleted_at is null', [$evento.rowid]).then(($categorias)=>{

            Categoria.traduc($categorias).then((result_categorias)=>{
                res.send(result_categorias);                
            });
            
        });

    })
}

module.exports = router;