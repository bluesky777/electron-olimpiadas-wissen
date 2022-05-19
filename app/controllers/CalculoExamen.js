CalculoExamen = {
    
    
	cantPreguntasEnGrupo: function($grupo_pregs_id, $idioma_id=false)
	{
        $contenido_trad = [];
        // var connection 	= require('../conexion/conn');
				var connection = require('../conexion/connWeb');

		if ($idioma_id) {
            consulta = 'SELECT * FROM ws_contenido_traduc WHERE grupo_pregs_id=? and idioma_id=?';
            
            $contenido_trad = connection.query(consulta, [ $grupo_pregs_id, $idioma_id ], function (error, result) {
                
            });
		}else{
			//$contenido_trad = Contenido_traduc::where('grupo_pregs_id', $grupo_pregs_id)->first();
		}

		$conten_trad_id = $contenido_trad['id'];

		//$preguntas_agrup = Pregunta_agrupada::where('contenido_id', $conten_trad_id)->get();

		$cant = count($preguntas_agrup);
			
		return $cant;


	}
    
}

module.exports = CalculoExamen;