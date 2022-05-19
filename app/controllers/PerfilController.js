var express         = require('express');
var User            = require('../conexion/Models/User');
var ImagenModel     = require('../conexion/Models/ImagenModel');
var router          = express.Router();

router.route('/cambiarpassword/:id').put(putCambiarpassword);

function putCambiarpassword(req, res) {
  User.fromToken(req).then(($user)=>{
    const compatible = User.comparar(req.body.oldpassword, $user.password);
		if (!compatible) return res.status(500).json({ result: 'invalid_password' });
    User.update({ ...$user, password: req.body.password }, $user).then(()=>{
      console.log('password cambiado');
      res.json({ result: 'ok' });
    }).catch((err)=>{
      console.log(err);
      res.status(500).json({ result: 'error' });
    });
  })
}

module.exports = router;