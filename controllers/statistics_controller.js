var models = require('../models/models.js');

var statistics = {
      numQuizes: 0,
      numComments: 0,
      numNoCommentedQuizes: 0,
      numCommentedQuizes: 0
};
var errors = [];

// calcular las estadisticas

exports.calculate = function(req, res, next) {
  //note: Usar promesas (Promise.all) sería mejor, ya que se podrían
 // lanzar todas las consultas simultáneamente
  var preguntas = models.Quiz.count();
  var numComments = models.Comment.count();
  var numNoCommentedQuizes = models.Comment.numNoCommentedQuizes();
  var numCommentedQuizes = models.Comment.numCommentedQuizes();
   models.Quiz.count().then(function (numQuizes) { // número de preguntas
        statistics.numQuizes = numQuizes;
        return numComments;
   })
   .then(function (numComments) { // número de comentarios
       statistics.numComments = numComments;
       return numNoCommentedQuizes;
    })
    .then(function (numNoCommentedQuizes) { // número preguntas sin comentario
        statistics.numNoCommentedQuizes = numNoCommentedQuizes;
        return numCommentedQuizes;
    })
    .then(function (numCommentedQuizes) { // número de preguntas con comentario
      statistics.numCommentedQuizes = numCommentedQuizes;
    })
    .catch(function (err) { errors.push(err); })
    .finally(function () {
      next();
    });

  };

// GET /quizes/statistics
exports.show = function(req, res) {
  res.render('quizes/statistics', { statistics: statistics, errors: errors });
};
