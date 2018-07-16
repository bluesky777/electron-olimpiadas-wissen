var express         = require('express');
var router          = express.Router();
var db              = require('../conexion/connWeb');





router.route('/')
    .get(getIndex)
    .post(postRouteHandler);


function getIndex(req, res) {

    consulta 	= 'SELECT * FROM ws_idiomas where deleted_at is null';
    
    db.query(consulta).then(function(result){
        res.json( result );
    }, function(err){
        res.status(500).json({ error: err });
    }); 
        
}
    
function postRouteHandler(req, res) {
    //handle POST route here
}

module.exports = router;