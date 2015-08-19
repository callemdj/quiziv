var models = require('../models/models.js');

// MW que permite acciones solamente si el usuario objeto corresponde con el usuario logeado o si es cuenta admin
exports.ownershipRequired = function(req, res, next){
    var objUser = req.user.id;
    var logUser = req.session.user.id;
    var isAdmin = req.session.user.isAdmin;

    if (isAdmin || objUser === logUser) {
        next();
    } else {
        res.redirect('/');
    }
};

// Autoload :id
exports.load = function(req, res, next, userId) {
  models.User.find({
            where: {
                id: Number(userId)
            }
        }).then(function(user) {
      if (user) {
        req.user = user;
        next();
      } else{next(new Error('No existe userId=' + userId))}
    }
  ).catch(function(error){next(error)});
};


// Comprueba si el usuario esta registrado en users
// Si autenticación falla o hay errores se ejecuta callback(error).
exports.autenticar = function(login, password, callback) {
	models.User.find({
        where: {
            username: login
        }
    }).then(function(user) {
    	if (user) {
    		if(user.verifyPassword(password)){
            	callback(null, user);
        	}
        	else { callback(new Error('Password erróneo.')); }
      	} else { callback(new Error('No existe user=' + login))}
    }).catch(function(error){callback(error)});
};


// GET /user/:id/edit
exports.edit = function(req, res) {
  var user = req.user
  res.render('user/edit', { user: user, errors: []});
};            // req.user: instancia de user cargada con autoload

// GET /user
exports.new = function(req, res) {
    var user = models.User.build( // crea objeto user
        {username: "", password: "", image:""}
    );
    res.render('user/new', {user: user, errors: []});
};

// POST /user
exports.create = function(req, res) {
    if ( req.file ){
          req.body.user.image = req.file.filename;
    }
    var user = models.User.build( req.body.user );
    user
    .validate()
    .then(
        function(err){
            if (err) {
                res.render('user/new', {user: user, errors: err.errors});
            } else {
                user // save: guarda en DB campos username y password de user
                .save({fields: ["username", "password", "image"]})
                .then( function(){                    // crea la sesión para que el usuario acceda ya autenticado y redirige a /
                    req.session.user = {id:user.id, username:user.username, image:user.image, creado:user.createdAt, isAdmin:user.isAdmin};
                    res.redirect('/');
                });
            }
        }
    ).catch(function(error){next(error)});
};
// PUT /user/:id
exports.update = function(req, res, next) {
  req.user.username  = req.body.user.username;
  req.user.password  = req.body.user.password;
  if ( req.file ){
        req.user.image = req.file.filename
  };
  req.user
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('user/' + req.user.id, {user: req.user, errors: err.errors});
      } else {
        req.user     // save: guarda campo username, password y imagen si existe en DB
        .save( {fields: ["username", "password", "image"]})
        .then( function(){
            var login = req.body.user.username;
            var password = req.body.user.password;
            var userController = require('./user_controller');
            userController.autenticar(login, password, function(error, user){
              if (error) { // si hay error retornamos mensajes de error de sesión
                req.session.errors = [{'message': 'Se ha producido un error: '+error}];
                res.redirect("/login");
                return;
              }
              req.session.user = {id:user.id, username:user.username, image:user.image, creado:user.createdAt, isAdmin:user.isAdmin};
              models.Comment.findAll({
                    where:{
                        UserId: Number(user.id)
                      }
                    }).then(function(comment){
                      if (comment){
                        for (index in comment){
                            comment[index].image_user = user.image;
                            comment[index].save({fields: ["image_user"]})
                            }
                        next();
                      }else{ next(new Error('No existe commentId=' + commentId))}
                    }
                  ).catch(function(error){next(error)});
              res.redirect('/'); // Redirección HTTP a /
            });
         });
      }
    }
  ).catch(function(error){next(error)});
};

// DELETE /user/:id
exports.destroy = function(req, res) {

  req.user.destroy().then( function() {
    // borra la sesión y redirige a /
    delete req.session.user;
    res.redirect('/');
  }).catch(function(error){next(error)});
};
