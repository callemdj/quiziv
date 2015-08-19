var models = require('../models/models.js');
var multer = require('multer');
var upload = multer({ dest: '../public/images/'});

// MW que permite acciones solamente si el quiz objeto pertenece al usuario logeado o si es cuenta admin
exports.ownershipRequired = function(req, res, next){
    var objQuizOwner = req.quiz.UserId;
    var logUser = req.session.user.id;
    var isAdmin = req.session.user.isAdmin;

    if (isAdmin || objQuizOwner === logUser) {
        next();
    } else {
        res.redirect('/');
    }
};

// Auto load - factoriza el código si ruta incluye :quizId
exports.load = function(req, res, next, quizId) {

  models.Quiz.find({
          where: { id: Number(quizId) },
          include: [{ model: models.Comment }]
      }).then(
    function(quiz){
      if (quiz){
        req.quiz = quiz;
        next();
      }else{ next(new Error('No existe quizId=' + quizId));}
    }
  ).catch(function(error){ next(error);});
};

// GET /quizes
exports.index = function(req, res) {
  var search = ('%' + req.query.search + '%').replace(/\s+/g,"%");
  var quizes = models.Quiz.findAll();
  var preguntaTema = req.query.tema;
  var options = {};
  var tema = "preguntas";

  if (search !== '%'+undefined+'%'){
    quizes = models.Quiz.findAll({where:["lower(pregunta) like ?", search.toLowerCase()],order:"pregunta"});
    tema = "";
  }else{
    tema = "preguntas"
  }

  if(req.user){
    if (preguntaTema !== undefined){
      options.where = {UserId: req.user.id, tema: preguntaTema};
      quizes = models.Quiz.findAll(options);
      tema = "";
    }else{
      options.where = {UserId: req.user.id}
      quizes = models.Quiz.findAll(options);
    }
  }else{
    if (preguntaTema !== undefined){
      options.where = {tema: preguntaTema}
      quizes = models.Quiz.findAll(options);
      tema = "";
    }else{
      tema = "preguntas";
    }
  }
  var temas=['Humanidades','Ocio','Tecnología','Ciencia','Otro'];
  quizes.then(
    function(quizes){
      res.render('quizes/index', {quizes: quizes, tema: tema, temas:temas, errors: []});
    }
  ).catch(function(error){next(error);});
};

// GET /quizes/:id
exports.show = function(req, res, UserId) {
  var usuario=models.User.find({
        where:{
            id: Number(UserId)
          }
  });
  var preguntaTema = req.quiz.tema
  var options = {};
  options.where = {tema: preguntaTema}
  tema = models.Quiz.findAll(options);
  tema.then(
    function(tema){
      res.render('quizes/show',{quiz:req.quiz, tema:tema, usuario:usuario, errors: []});
    }
  ).catch(function(error){next(error);});
    //res.render('quizes/show',{quiz:req.quiz, ocio:ocio, errors: []});
};

// GET / quizes/:id/answer
exports.answer = function(req,res){
  var resultado = 'Incorrecto';
  if (req.query.respuesta === req.quiz.respuesta){
      resultado = 'Correcto';
  }
  res.render('quizes/answer',{quiz:req.quiz, respuesta:resultado, errors: []});
};
exports.author = function(req, res) {
  res.render('author/author', {author:'Antonio Ropero Muela',errors: []});
};

// GET /quizes/new
exports.new = function(req, res){
  var quiz = models.Quiz.build( // crea objeto quiz
    {pregunta:"Pregunta", respuesta:"Respuesta", tema:"Tema"}
  );
  res.render('quizes/new', {quiz:quiz, errors: []});
};

// POST /quizes/create
exports.create = function(req, res){
    req.body.quiz.UserId = req.session.user.id;
    if ( req.file ){
          req.body.quiz.image = req.file.filename;
    }
    var quiz= models.Quiz.build(req.body.quiz);

//guarda en DB los campos pregunta y respuesta de quiz
    quiz
    .validate()
    .then(
      function(err){
        if(err) {
          res.render('quizes/new', {quiz: quiz, errors: err.errors});
        }else{
          quiz // save: guarda en DB campos pregunta y respuesta de quiz
          .save({fields: [ "pregunta", "respuesta","image", "tema","UserId" ]})
          .then(function(){res.redirect("/quizes")}); // Redireccion HTTP (URL relativo) lista de preguntas
        }
      }
    );
};

// GET quizes/:id/edit
exports.edit = function(req, res){
  var quiz = req.quiz; // autoload de instancia de quiz
 var image = req.quiz.image
  res.render('quizes/edit', {quiz: quiz,image: image, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res) {
  req.body.quiz.UserId = req.session.user.id;
  req.quiz.pregunta = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;
  req.quiz.tema = req.body.quiz.tema;
  req.quiz.image = req.file.filename;
  req.quiz
  .validate()
  .then(
    function(err){
      if(err){
        res.render('quizes/edit',{quiz: req.quiz, errors: err.errors});
      }else{
        req.quiz
        .save( {fields:["UserId","pregunta","respuesta","image","tema"]}) // save: guarda campos pregunta y respuesta en DB
        .then( function(){res.redirect('/quizes')});
      }// Redireccion HTTP a lista de preguntas (URL relative)
    }
  );
};

// DELETE /quizes/:id
exports.destroy = function(req, res) {
  console.log("esta es la variable quizId: "+ req.quiz.id)
    models.Comment.findAll(
          {
          where:{
              QuizId: Number(req.quiz.id)
            }
          }).then(
            function(comment){
            if (comment){
              for (index in comment){
                  comment[index].destroy()
                  console.log("Este es el comentario identificado"+comment[index])
              }
              req.quiz.destroy().then( function(){
                  res.redirect('/quizes');
              }).catch(function(error){next(error)});
              next();
            }else{
              req.quiz.destroy().then( function(){
              res.redirect('/quizes');
              next(new Error('No existe commentId=' + commentId))}
              ).catch(function(error){next(error)});
            }
          }
      )
};
