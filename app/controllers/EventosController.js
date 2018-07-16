var express         = require('express');
var router          = express.Router();
var Evento          = require('../conexion/Models/Evento');
var db              = require('../conexion/connWeb');



// Enrutadores
router.route('/').get(getIndex);

    


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


module.exports = router;