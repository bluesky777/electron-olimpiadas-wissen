// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

require('dotenv').config();
const path          = require('path');
const express       = require('express');
const app           = express();
var cors            = require('cors');
var http            = require('http').Server(app);
var io              = require('socket.io')(http);
var bodyParser      = require('body-parser');
const fileUpload 	= require('express-fileupload');
var img_folder    	= require('os').homedir();





process.env.JWT_SECRET = 'FB2ywB21v60UosPDYcO7HiVQkQZcFhbQ';

if (!process.env.NODE_PORT) {
	process.env.NODE_PORT = 8787;
}



app.use(cors());
app.use(fileUpload({ limits: { fileSize: 50 * 1024 * 1024 } }));
app.use(bodyParser.json({limit: '50mb'}));
app.use("/app/ws_dist", express.static(path.join(__dirname, 'app/ws_dist')));
app.use("/images", express.static(path.join(__dirname, 'app/images')));
app.use("/images", express.static(path.join(img_folder + '/images_olimpiadas_wissen')));
app.use("/sounds", express.static(path.join(img_folder + '/sounds_olimpiadas')));
app.use('/api', require('./app/controllers/routes'));


app.get('/chat', function(req, res){
	res.sendFile(__dirname + '/views/index.html');
});

app.get('/', function(req, res){
	res.writeHead(301,
		{ Location: 'app/ws_dist/' }
	);
	res.end();
});

	

//console.log(app._router.stack); // Para ver las actuales rutas Routes






var User            = require(path.join(__dirname, 'app/conexion/Models/User'));
var db              = require(path.join(__dirname, '/app/conexion/connWeb'));



self 		= this;
self.io 	= io;

var count_clients 	= localStorage.count_clients 	|| 0;
var all_clts 		= localStorage.all_clts 		|| [];
var categorias_king = [];
var info_evento 	= {
		examen_iniciado: 		false, 
		preg_actual: 			0,
		free_till_question: 	-1,
		puestos_ordenados: 		true
	};


http.listen(process.env.NODE_PORT, function(){
  console.log('listening on *:'+process.env.NODE_PORT);
});





self.io.on('connection', (socket)=> {

	count_clients++;

	datos 					= {};
	datos.logged 			= false;
	datos.registered 		= false;
	datos.resourceId		= socket.id;
	datos.categsel			= 0;
	datos.respondidas		= 0;
	datos.correctas			= 0;
	datos.tiempo			= 0;
	datos.nombre_punto		= 'Punto_' + count_clients;
	datos.user_data 		= {};
	socket.datos 			= datos;

	all_clts.push(socket.datos);


	console.log('New connection: ', socket.id);
	setTimeout(function(){
		socket.emit('te_conectaste', { datos: socket.datos });
		socket.broadcast.emit('conectado:alguien', {clt: socket.datos} );
    }, 1000);


	socket.on('reconocer:punto:registered', (data)=>{
		if (data.nombre_punto) {
			socket.datos.nombre_punto = data.nombre_punto;
		}
		if (data.registered) {
			socket.datos.registered = data.registered;
		}
		
		for(var i=0; i < all_clts.length; i++){
			if (all_clts[i].resourceId == socket.id) {
				all_clts.splice(i, 1, socket.datos);
			}
		}
		
		datos = {nombre_punto: socket.datos.nombre_punto, resourceId: socket.id, registered: socket.datos.registered };
		self.io.sockets.emit('reconocido:punto:registered', datos );
	});

	socket.on('error', (error)=>{
		console.log('*** Error: '+error);
	});

	socket.on('guardar:mi_qr:resourceId', (data)=>{
		if ( data.qr) {
			parametro 		= { "resourceId": socket.datos.resourceId };
			parametro  		= JSON.stringify(parametro);
			set_param_to_codigo_qr(data.qr, parametro).then(function(){
				//console.log('en guardar:mi_qr:resourceId');
			});
		}
	});

	socket.on('loguear', (data)=> {
		if (data.usuario.eventos) {
			delete data.usuario.eventos;
		}
		datos 					= {};
		datos.logged 			= true;
		datos.registered 		= data.registered?true:false;
		datos.resourceId		= socket.id;
		datos.categsel			= 0;
		datos.respondidas		= 0;
		datos.correctas			= 0;
		datos.tiempo			= 0;
		datos.nombre_punto		= data.nombre_punto?data.nombre_punto:socket.datos.nombre_punto;
		datos.user_data 		= data.usuario;
		socket.datos 			= datos;

		if(socket.room)
			socket.leave(socket.room);

		
		if (data.usuario.evento_selected_id) {
			socket.room = 'etapa' + data.usuario.evento_selected_id;
		}else{
			if (data.usuario.evento_actual) {
				socket.room = 'etapa' + data.usuario.evento_actual.id;
			}else{
				console.log('No tiene evento actual :( ', data.usuario);
				socket.room = 'etapa' + 1;
			}
			
		}
		socket.join(socket.room);
		
		for (var propiedad in self.io.in(socket.room).sockets) {
			//console.log(self.io.in(socket.room).sockets[propiedad].datos);
			//self.io.in(socket.room).sockets[propiedad].emit('Mirameeeeeee', self.io.in(socket.room).sockets[propiedad].datos)
		}
		

		if (socket.datos.user_data.inscripciones){
			if (socket.datos.user_data.inscripciones.length > 0) {
				socket.datos.categsel 	= socket.datos.user_data.inscripciones[0].categoria_id;
			}
		}
		

		for (var i = 0; i < all_clts.length; i++) {
			if (all_clts[i].resourceId == socket.id) {
				all_clts.splice(i, 1, socket.datos);
			}
		}

		socket.broadcast.emit('logueado:alguien', {clt: socket.datos} );

		if (categorias_king.length > 0) {
			socket.broadcast.emit('logueado:alguien', {clt: socket.datos, categorias_king: categorias_king} );
			socket.emit('logueado:yo', { yo: socket.datos, info_evento: info_evento, categorias_king: categorias_king } );
		}else{
			categorias_king_con_traducciones(datos.user_data.evento_selected_id).then(function(result){
				categorias_king = result;
				socket.broadcast.emit('logueado:alguien', {clt: socket.datos, categorias_king: categorias_king} );
				socket.emit('logueado:yo', { yo: socket.datos, info_evento: info_evento, categorias_king: categorias_king } );
			});
		}
		
	});

	socket.on('guardar:nombre_punto', function(data){
		for (var i = 0; i < all_clts.length; i++) {
			if (all_clts[i].resourceId == data.resourceId){
				all_clts[i].nombre_punto = data.nombre;
			}
		}
		self.io.sockets.emit('nombre_punto_cambiado',{ resourceId: data.resourceId, nombre: data.nombre });
	});

	socket.on('get_clts', function(data){
		socket.emit('take:clientes',{ clts: all_clts, info_evento: info_evento });
	});


	socket.on('get_usuarios', function(data){
		get_users(socket.datos.user_data.evento_selected_id).then(function(usuarios) {
			socket.emit('take:usuarios', { usuarios: usuarios });
		})
	});

	socket.on('let_him_enter', function(data){

		var jwt 		= require('jsonwebtoken');
		var secret 		= process.env.JWT_SECRET;
		var decoded 	= jwt.verify(data.from_token, secret);

		if (decoded.iat) {
			get_user(data.usuario_id).then(function(usuario){
				socket.broadcast.to(data.resourceId).emit('enter', {usuario: usuario, from_token: data.from_token}); 
			});
		}

	});

	socket.on('change_a_categ_selected', function(data){

		for (var i = 0; i < all_clts.length; i++) {
			if (all_clts[i].resourceId == socket.id) {
				all_clts[i].categsel 			= data.categsel;
				all_clts[i].categsel_id 		= data.categsel;
				all_clts[i].categsel_nombre 	= data.categsel_nombre;
				all_clts[i].categsel_abrev 		= data.categsel_abrev;
				all_clts.splice(i, 1, all_clts[i]);

				socket.broadcast.to(data.resourceId).emit('change_the_categ_selected', 	{ categsel: data.categsel, categsel_nombre: data.categsel_nombre, categsel_abrev: data.categsel_abrev, resourceId: socket.id}); 
				socket.broadcast.emit('change_a_categ_selected', 						{ categsel: data.categsel, categsel_nombre: data.categsel_nombre, categsel_abrev: data.categsel_abrev, resourceId: socket.id });
	
			}
		}
	});

	socket.on('warn_my_categ_selected', function(data){
		socket.datos.categsel 				= data.categsel;
		socket.datos.categsel_id 			= data.categsel;
		socket.datos.categsel_nombre 		= data.categsel_nombre;
		socket.datos.categsel_abrev 		= data.categsel_abrev;

		for (var i = 0; i < all_clts.length; i++) {
			if (all_clts[i].resourceId == socket.id) {
				all_clts.splice(i, 1, socket.datos);
			}
		}
		socket.broadcast.emit('a_categ_selected_change', { categsel: data.categsel, categsel_nombre: data.categsel_nombre, categsel_abrev: data.categsel_abrev, resourceId: socket.id });
	});

	socket.on('empezar_examen', function(data){
		info_evento.examen_iniciado 	= true;
		info_evento.preg_actual 		= 1;

		if(data){
			if(data.puestos_ordenados){
				info_evento.puestos_ordenados 	= data.puestos_ordenados;
			}
		}
		
		socket.broadcast.emit('empezar_examen');
	});

	socket.on('empezar_examen_cliente', function(data){
		socket.broadcast.to(data.resourceId).emit('empezar_examen'); 
	});

	socket.on('set_my_examen_id', (data)=> {
		socket.datos.examen_actual_id = data.examen_actual_id;

		for (var i = 0; i < all_clts.length; i++) {
			if (all_clts[i].resourceId == socket.id) {
				all_clts.splice(i, 1, socket.datos);
			}
		}
	});

	socket.on('liberar_hasta_pregunta', function(data){
		info_evento.free_till_question 	= data.numero;
		info_evento.preg_actual 		= data.numero;
		socket.broadcast.emit('set_free_till_question', { free_till_question: data.numero }); 
	});

	socket.on('hasta_que_pregunta_esta_free', function(data){
		socket.emit('set_free_till_question', { free_till_question: info_evento.free_till_question }); 
	});

	socket.on('set_puestos_ordenados', function(data){
		console.log('set_puestos_ordenados');
		info_evento.puestos_ordenados 		= data.puestos_ordenados;
		socket.broadcast.emit('set_puestos_ordenados', { puestos_ordenados: data.puestos_ordenados }); 
	});



	socket.on('message',function(data){
		console.log(data);
		socket.broadcast.emit('receive',data.message);

	});

	socket.on('desloguear',function(data){
		datos 					= {};
		datos.logged 			= false;
		datos.resourceId		= socket.id;
		datos.categsel			= 0;
		datos.respondidas		= 0;
		datos.correctas			= 0;
		datos.tiempo			= 0;
		datos.user_data 		= {};
		
		if (data.registered) {
			datos.registered = data.registered;
		}
		if (data.nombre_punto) {
			datos.nombre_punto = data.nombre_punto;
		}

		socket.datos 			= datos;

		for (var i = 0; i < all_clts.length; i++) {
			if (all_clts[i].resourceId == socket.id) {
				all_clts[i] = datos;
			}
		}

		socket.broadcast.emit('deslogueado', {client: socket.datos} );


	});

	socket.on('got_qr',function(data){
		
		get_qr(data.qr.codigo).then(function(resu) {
			qr = resu;
			
			if (qr) {
				switch(qr.comando){
					case 'let_in':
						qr.reconocido 	= true;
						qr.parametro 	= JSON.parse(qr.parametro);
						if (qr.parametro != null) {

							for (var i = 0; i < all_clts.length; i++) {
								if (all_clts[i].resourceId == qr.parametro.resourceId || all_clts[i].resourceId == parseInt(qr.parametro.resourceId) ) {
									indice = i; // si no hago esto, i llega a ser el total porque es llamado después de la promesa (me robó 3 horas de mi precioso tiempo)
									if (data.usuario_id) {
										socket.broadcast.to(all_clts[i].resourceId).emit('got_your_qr', {codigo: qr.codigo, usuario_id: data.usuario_id, from_token: data.from_token} );
									}else{
										get_users(socket.datos.user_data.evento_selected_id).then(function(usuarios) {
											socket.broadcast.to(all_clts[indice].resourceId).emit('got_your_qr', {codigo: qr.codigo, seleccionar: true, usuarios: usuarios, from_token: data.from_token } );
										})
									
									}

								}
							}
							delete_qr(data.qr.codigo).then(function(result) {});
						}else{
							socket.emit('qr_no_param');
						}

						break;

					default:
						// code...
						break;
				}
			}


		});

	});

	socket.on('correspondencia', function (data) {
		mensaje 	= { from: socket.datos, texto: data.mensaje };
		if (data.to) {
			for(var i=0; i < all_clts.length; i++){
				if (all_clts[i].resourceId == data.to) {
					socket.broadcast.to(data.to).emit('correspondencia', { mensaje: mensaje });
				}
			}
		}else{
			self.io.sockets.emit('correspondencia', { mensaje: mensaje });
		}
	});

	socket.on('cerrar_sesion_a', function (data) {
		socket.broadcast.to(data.resourceId).emit('cerrar:tu_sesion');
	});

	socket.on('registrar_a', function (data) {
		for(var i=0; i < all_clts.length; i++){
			if (all_clts[i].resourceId == data.resourceId) {
				all_clts[i].registered = true;
				all_clts.splice(i, 1, all_clts[i]);
			}
		}
		socket.broadcast.to(data.resourceId).emit('me_registraron');
	});

	socket.on('desregistrar_a', function (data) {
		for(var i=0; i < all_clts.length; i++){
			if (all_clts[i].resourceId == data.resourceId) {
				all_clts[i].registered = false;
				all_clts.splice(i, 1, all_clts[i]);
			}
		}
		socket.broadcast.to(data.resourceId).emit('me_desregistraron');
	});


	// clean up when a user leaves, and broadcast it to other users
	socket.on('disconnect', function () {
		//console.log(socket);
		for (var i = 0; i < all_clts.length; i++) {
			if (all_clts[i].resourceId == socket.id) {
				all_clts.splice(i, 1);
			}
		}
		socket.broadcast.emit('user:left', {
			resourceId: socket.datos.resourceId
		});
	});








	socket.on('sc_show_participantes', function (data) {
		socket.broadcast.emit('sc_show_participantes');
	});

	socket.on('sc_mostrar_resultados_actuales', function (data) {
		for (var i = 0; i < all_clts.length; i++) {
			if (all_clts[i].user_data.roles) {
				if(all_clts[i].user_data.roles[0].name == 'Pantalla'){
					socket.broadcast.to(all_clts[i].resourceId).emit('sc_mostrar_resultados_actuales', { examenes_cargados: data.examenes_cargados });
				}
			}
		}
	});

	socket.on('sc_show_barras', function (data) {
		for (var i = 0; i < all_clts.length; i++) {
			if (all_clts[i].user_data.roles) {
				if(all_clts[i].user_data.roles[0].name == 'Pantalla'){
					socket.broadcast.to(all_clts[i].resourceId).emit('sc_show_barras');
				}
			}
		}
	});

	socket.on('sc_show_question', function (data) {
		for (var i = 0; i < all_clts.length; i++) {
			if (all_clts[i].user_data.roles) {
				role = all_clts[i].user_data.roles[0].name;
				if(role == 'Pantalla' || role == 'Presentador' || role == 'Admin'){
					if(socket.id == all_clts[i].resourceId){
						socket.emit('sc_show_question', {pregunta: data.pregunta, no_question: data.no_question } );
					}else{
						socket.to(all_clts[i].resourceId).emit('sc_show_question', {pregunta: data.pregunta, no_question: data.no_question } );
					}
				}
			}
		}
	});

	socket.on('selec_opc_in_question', function (data) {
		for (var i = 0; i < all_clts.length; i++) {
			if (all_clts[i].user_data.roles) {
				role = all_clts[i].user_data.roles[0].name;
				if(role == 'Pantalla' || role == 'Presentador' || role == 'Admin'){
					socket.to(all_clts[i].resourceId).emit('selec_opc_in_question', {opcion: data.opcion } );
				}
			}
		}
	});

	socket.on('sc_reveal_answer', function (data) {
		for (var i = 0; i < all_clts.length; i++) {
			if (all_clts[i].user_data.roles) {
				role = all_clts[i].user_data.roles[0].name;
				if(role == 'Pantalla' || role == 'Presentador' || role == 'Admin'){
					if(socket.id == all_clts[i].resourceId){
						socket.emit('sc_reveal_answer');
					}else{
						socket.broadcast.to(all_clts[i].resourceId).emit('sc_reveal_answer');
					}
				}
			}
		}
	});

	socket.on('sc_show_logo_entidad_partici', function (data) {
		for (var i = 0; i < all_clts.length; i++) {
			if (all_clts[i].user_data.roles) {
				if(all_clts[i].user_data.roles[0].name == 'Pantalla'){
					socket.broadcast.to(all_clts[i].resourceId).emit('sc_show_logo_entidad_partici', {valor: data.valor} );
				}
			}
		}
	});

	socket.on('sc_show_puntaje_particip', function (data) {
		for (var i = 0; i < all_clts.length; i++) {
			if (all_clts[i].user_data.roles) {
				if(all_clts[i].user_data.roles[0].name == 'Pantalla'){
					socket.broadcast.to(all_clts[i].resourceId).emit('sc_show_puntaje_particip', {cliente: data.cliente});
				}
			}
		}
	});

	socket.on('sc_show_puntaje_examen', function (data) {
		for (var i = 0; i < all_clts.length; i++) {
			if (all_clts[i].user_data.roles) {
				if(all_clts[i].user_data.roles[0].name == 'Pantalla'){
					socket.broadcast.to(all_clts[i].resourceId).emit('sc_show_puntaje_examen', {examen: data.examen});
				}
			}
		}
	});


	socket.on('sc_mostrar_resultados_actuales', function (data) {
		for (var i = 0; i < all_clts.length; i++) {
			if (all_clts[i].user_data.roles) {
				if(all_clts[i].user_data.roles[0].name == 'Pantalla'){
					socket.broadcast.to(all_clts[i].resourceId).emit('sc_mostrar_resultados_actuales', {examenes_cargados: data.examenes_cargados});
				}
			}
		}
	});


	socket.on('establecer_fondo', function (data) {
		info_evento.img_name 		= data.img_name;
		socket.broadcast.emit('a_establecer_fondo', { img_name: data.img_name });
	});

	socket.on('mostrar_solo_fondo', function (data) {
		info_evento.img_name 		= data.img_name;
		for (var i = 0; i < all_clts.length; i++) {
			if (all_clts[i].user_data.roles) {
				if(all_clts[i].user_data.roles[0].name == 'Pantalla'){
					socket.broadcast.to(all_clts[i].resourceId).emit('a_mostrar_solo_fondo', { img_name: data.img_name });
				}
			}
		}
	});

	socket.on('cambiar_teleprompter', function (data) {
		info_evento.msg_teleprompter 		= data.msg_teleprompter;
		for (var i = 0; i < all_clts.length; i++) {
			if (all_clts[i].user_data.roles) {
				if(all_clts[i].user_data.roles[0].name == 'Pantalla'){
					socket.broadcast.to(all_clts[i].resourceId).emit('a_cambiar_teleprompter', { msg_teleprompter: data.msg_teleprompter });
				}
			}
		}
	});

	socket.on('sc_answered', function (data) {
		socket.datos.answered 		= data.valor;
		socket.datos.respondidas++;
		socket.datos.tiempo 		= socket.datos.tiempo + data.tiempo;
		if (data.valor == 'correct') {
			socket.datos.correctas++;
		}

		participante = {};

		for (var i = 0; i < all_clts.length; i++) {
			if(all_clts[i].resourceId == socket.id){
				all_clts[i] 	= socket.datos;
				participante 	= all_clts[i];
			}
		}
		for (var i = 0; i < all_clts.length; i++) {
			if (all_clts[i].user_data.roles) {
				if(all_clts[i].user_data.roles[0].name == 'Pantalla' || all_clts[i].user_data.roles[0].name == 'Admin'){
					socket.broadcast.to(all_clts[i].resourceId).emit('sc_answered', { resourceId: socket.id, cliente: participante });
				}
			}
		}
	});

	socket.on('next_question', function (data) {
		info_evento.preg_actual++;
		for (var i = 0; i < all_clts.length; i++) {
			all_clts[i].answered = 'waiting';
			if(all_clts[i].logged && all_clts[i].resourceId != socket.resourceId){
				socket.broadcast.to(all_clts[i].resourceId).emit('next_question');
			}
		}
	});

	socket.on('next_question_cliente', function (data) {
		for (var i = 0; i < all_clts.length; i++) {
			all_clts[i].answered = 'waiting';
			if(all_clts[i].logged && all_clts[i].resourceId != socket.resourceId){
				socket.broadcast.to(all_clts[i].resourceId).emit('next_question');
			}
		}
	});

	socket.on('goto_question_no', function (data) {
		for (var i = 0; i < all_clts.length; i++) {
			all_clts[i].answered = 'waiting';
			if(all_clts[i].logged && all_clts[i].resourceId != socket.resourceId){
				socket.broadcast.to(all_clts[i].resourceId).emit('goto_question_no', {numero: data.numero});
			}
		}
	});

	socket.on('goto_question_no_clt', function (data) {
		for (var i = 0; i < all_clts.length; i++) {
			all_clts[i].answered = 'waiting';
			if(all_clts[i].logged && all_clts[i].resourceId != socket.resourceId){
				socket.broadcast.to(all_clts[i].resourceId).emit('goto_question_no', {numero: data.numero});
			}
		}
	});






});






function set_param_to_codigo_qr(qr, param) {
	var self = this;
	return new Promise(function(resolve, reject) {

		//var connection 	= require('./app/conexion/conn');

		db.query("UPDATE qrcodes SET parametro='"+ param +"' WHERE codigo = ?", [ qr ]).then( function (results) {
			resolve(results.affectedRows);
		}, (error)=>{throw error;});

	});
}




function get_users(evento_id) {
	var self = this;
	return new Promise(function(resolve, reject) {

		consulta = `SELECT u.id, u.rowid, u.nombres, u.apellidos, u.sexo, u.username, u.email, u.is_superuser, 
							u.cell, u.edad, u.idioma_main_id, u.evento_selected_id, 
							IFNULL(e.nivel_id, "") as nivel_id, e.pagado, e.pazysalvo, u.entidad_id, 
							u.imagen_id, IFNULL('perfil/' || i.nombre, CASE WHEN u.sexo='F' THEN '`+User.$default_female+`' ELSE '`+User.$default_male+`' END) as imagen_nombre,
							en.nombre as nombre_entidad, en.lider_id, en.lider_nombre, en.logo_id, en.alias  
						FROM users u 
						inner join ws_user_event e on e.user_id = u.rowid and e.evento_id = ? 
						left join images i on i.rowid=u.imagen_id and i.deleted_at is null 
						left join ws_entidades en on en.rowid=u.entidad_id and en.deleted_at is null 
						where u.deleted_at is null`;

		db.query(consulta, [evento_id]).then( function (results) {
			resolve(results);
		}, (error)=>{
			if (error){
				console.log('Error al consultar usuarios');
				reject('Error al consultar usuarios');
				throw error;
			} 
		});
	});

}


function get_user(usuario_id) {
	var self = this;
	return new Promise(function(resolve, reject) {

		consulta = `SELECT id, rowid, nombres, username FROM users WHERE rowid=?`;

		db.query(consulta, [usuario_id]).then( function (results) {
			resolve(results[0]);
		}, (error)=> {if (error) throw error;} );
	});

}


function get_qr(qr_codigo) {
	var self = this;
	return new Promise(function(resolve, reject) {

		consulta = `SELECT * FROM qrcodes WHERE codigo=?`;

		db.query(consulta, [qr_codigo]).then( function (results) {
			resolve(results[0]);
		}, (error)=> {if (error) throw error;} );
	});

}
function delete_qr(qr_codigo) {
	var self = this;
	return new Promise(function(resolve, reject) {

		consulta = `DELETE FROM qrcodes WHERE codigo=?`;

		db.query(consulta, [qr_codigo]).then( function (results) {
			resolve(results);
		}, (error)=> {
			if (error) {
				console.log(error);
				reject(error);
				throw error;
			}
		});
	});

}

function categorias_king_con_traducciones(evento_id) {
	var self = this;
	return new Promise(function(resolve, reject) {

		consulta 	    = `SELECT rowid FROM ws_eventos where actual=1 and deleted_at is null`;
		db.query(consulta).then(function (eventoRes) {
			evento      = eventoRes[0];

			consulta    = `SELECT *, rowid FROM ws_categorias_king where evento_id = ? and deleted_at is null`;
			event_id 	= evento.id;
			if(evento.rowid) event_id = evento.rowid;
			
			db.query(consulta, [event_id]).then(function (results) {
				
				Promise.all(
					results.map(function(row) {
						var promise = new Promise(function(resolve,reject) {

							consulta = `SELECT t.rowid, t.nombre, t.abrev, t.categoria_id, t.descripcion, t.idioma_id, t.traducido, i.nombre as idioma  
										FROM ws_categorias_traduc t, ws_idiomas i
										where i.rowid=t.idioma_id and t.categoria_id = ? and t.deleted_at is null`;
							db.query(consulta, [row.rowid]).then( function (results) {
								row.categorias_traducidas = results;
								resolve(row);
							});
						});
						return promise;
					})
				).then(function() {
					//console.log(results);
					resolve(results);
				});

			
			}, (error)=> {if (error) throw error;} );
		}, (error)=> {if (error) throw error;} );
	});

}





// Para las fechas
window.fixDate = function(fec, con_hora){
	dia   = fec.getDate();
	mes   = (fec.getMonth() + 1 );
	year  = fec.getFullYear();
  
	if (dia < 10) {
	  dia = '0' + dia;
	}
  
	if (mes < 10) {
	  mes = '0' + mes;
	}
  
	fecha   = '' + year + '-' + mes  + '-' + dia;
	
	if (con_hora){
		hora 	= fec.getHours();
		if (hora<10) { hora = '0' + hora; };
		min 	= fec.getMinutes();
		if (min<10) { min = '0' + min; };
		sec 	= fec.getSeconds();
		if (sec<10) { sec = '0' + sec; };
		fecha 	= fecha + ' ' + hora + ':' + min + ':' + sec
	}
	
	return fecha;
}
window.msToTime = function(s) {

	// Pad to 2 or 3 digits, default is 2
	function pad(n, z) {
	  z = z || 2;
	  return ('00' + n).slice(-z);
	}
  
	var ms = s % 1000;
	s = (s - ms) / 1000;
	var secs = s % 60;
	s = (s - secs) / 60;
	var mins = s % 60;
	var hrs = (s - mins) / 60;
  
	return pad(hrs) + ':' + pad(mins) + ':' + pad(secs) + '.' + pad(ms, 3);
}
  
window.getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
window.getValores = (element)=>{
	valores = Object.keys(element).map(function(clave){
		return element[clave];
	})
	return valores;
}
window.array_rand = (items, reqCant)=>{
	result 	= [];
	for (let i = 0; i < reqCant; i++) {
		var num 	= Math.floor(Math.random()*items.length);
		var item 	= items.splice(num, 1)[0];
		
		result.push(item);
	}
	return result;
}