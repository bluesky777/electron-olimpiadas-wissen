var express         = require('express');
var router          = express.Router();
var User            = require('../conexion/Models/User');
var Disciplina      = require('../conexion/Models/Disciplina');
var Categoria      = require('../conexion/Models/Categoria');
var Evaluacion      = require('../conexion/Models/Evaluacion');
var db              = require('../conexion/connWeb');





router.route('/').get(getIndex)
router.route('/categorias-con-preguntas').get(getCategoriasConPreguntas);
router.route('/guardar').put(putGuardar);
router.route('/update').put(putUpdate);
router.route('/set-actual').put(putSetActual);


function getIndex(req, res) {

	User.fromToken(req).then(($user)=>{
		
		$evento_id = $user.evento_selected_id;

		$categoria_id = req.query.categoria_id;
		
		$evaluaciones = [];

		if ($categoria_id) {
			$consulta 		= 'SELECT *, rowid FROM ws_evaluaciones where categoria_id = ? and evento_id = ? and deleted_at is null';
			db.query($consulta, [$categoria_id, $evento_id] ).then(($evaluaciones_resp)=>{
				$evaluaciones = $evaluaciones_resp;
				pregs_eval();
			});
			
		}else{
			$consulta 		= 'SELECT *, rowid FROM ws_evaluaciones where evento_id = :evento_id and deleted_at is null order by categoria_id';
			db.query($consulta, [$evento_id] ).then(($evaluaciones_resp)=>{
				$evaluaciones = $evaluaciones_resp;
				pregs_eval();
			});
		}
		
		function pregs_eval(){
			let promesas = [];
			let $cant = $evaluaciones.length;
			
			for($i = 0; $i < $cant; $i++){
				preguntas($i);
			}
			
			function preguntas(i){
				$consulta 		= 'SELECT *, rowid FROM ws_pregunta_evaluacion where evaluacion_id = ?';
				prome_preg 	= db.query($consulta, [$evaluaciones[i].rowid] );
				promesas.push(prome_preg);
				prome_preg.then(($pregs_eval)=>{
					$evaluaciones[i].preguntas_evaluacion = $pregs_eval;
				})
			}
			
			Promise.all(promesas).then(()=>{
				res.send($evaluaciones);
			})

		}
		
		
	})
	
}
	

function getCategoriasConPreguntas(req, res) {
	User.fromToken(req).then(($user)=>{
		
		$evento_id = $user.evento_selected_id;

		Categoria.all($evento_id).then(($categorias)=>{
			return Categoria.traduc($categorias);
		}).then(($categorias)=>{
			return Evaluacion.categoriasConPreguntas($categorias);
		}).then(($categorias)=>{
			res.send($categorias);
		})
		
	
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



function putUpdate(req, res) {
	User.fromToken(req).then(($user)=>{

		ev = {};
		
		db.find('ws_evaluaciones', req.body.rowid).then(($evalu)=>{
			ev = $evalu;
			
			ev.categoria_id 	= req.body.categoria_id     || $evalu.categoria_id;
			ev.descripcion 		= req.body.descripcion      || $evalu.descripcion;
			ev.duracion_preg 	= req.body.duracion_preg    || $evalu.duracion_preg;
			ev.duracion_exam 	= req.body.duracion_exam    || $evalu.duracion_exam;
			ev.one_by_one 		= req.body.one_by_one       || $evalu.one_by_one;
			ev.actual 			= req.body.actual 			|| $evalu.actual;
			let now 			= window.fixDate(new Date(), true);
			
			let consulta = 'UPDATE ws_evaluaciones SET categoria_id=?, descripcion=?, duracion_preg=?, duracion_exam=?, one_by_one=?, actual=?, updated_at=? WHERE rowid=?';
			return db.query(consulta, [ev.categoria_id, ev.descripcion, ev.duracion_preg, ev.duracion_exam, ev.one_by_one, ev.actual, now, req.body.rowid])
		}).then(()=>{
			res.send(ev);
		});


		
	
	})
}


function putSetActual(req, res) {
	User.fromToken(req).then(($user)=>{
		let now 		= window.fixDate(new Date(), true);
		let consulta 	= 'UPDATE ws_evaluaciones SET actual=?, updated_at=? WHERE rowid=?';
		db.query(consulta, [req.body.actual, now, req.body.rowid]).then(($evalu)=>{
			res.send('Actualizado');
		});		
	
	})
}

module.exports = router;