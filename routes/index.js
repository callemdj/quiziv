ar express = require('express');
var multer  = require('multer');
var upload_quizes = multer({ dest: './public/media/quizes'});
var upload_user = multer({ dest: './public/media/user'});
var router = express.Router();

var quizController = require('../controllers/quiz_controller');
var commentController = require('../controllers/comment_controller');
var sessionController = require('../controllers/session_controller');
var userController = require('../controllers/user_controller');
var statisticsController = require('../controllers/statistics_controller');

/* GET home page. Página de entrada */
router.get('/', function(req, res) {
  res.render('index', { title: 'Quiz', errors: []});
});
/*pagina autor*/
router.get('/author', quizController.author);

// Autoload de comandos con ids
router.param('quizId',    quizController.load); // auto load : quizId
router.param('commentId', commentController.load); // autoload: commentId
router.param('userId',    userController.load);  // autoload :userId

// Definición de rutas de sesion
router.get('/login',  sessionController.new);     // formulario login
router.post('/login', sessionController.create);  // crear sesión
router.get('/logout', sessionController.destroy); // destruir sesión

// Definición de rutas de cuenta
router.get('/user',                     userController.new);     // formulario sign un
router.post('/user',                    upload_user.single("user[image]"),
                                        userController.create);     // registrar usuario
router.get('/user/:userId(\\d+)/edit',  sessionController.loginRequired,
                                        userController.ownershipRequired,
                                        userController.edit);     // editar información de cuenta
router.put('/user/:userId(\\d+)',       sessionController.loginRequired,
                                        upload_user.single("user[image]"),                                        
                                        userController.update);     // actualizar información de cuenta
router.delete('/user/:userId(\\d+)',    sessionController.loginRequired,
                                        userController.ownershipRequired,
                                        userController.destroy);     // borrar cuenta
router.get('/user/:userId(\\d+)/quizes',quizController.index);     // ver las preguntas de un usuario

// Definición de rutas de /quizes
router.get('/quizes',                      quizController.index);
router.get('/quizes/:quizId(\\d+)',        quizController.show);
router.get('/quizes/:quizId(\\d+)/answer', quizController.answer);
router.get('/quizes/new', 				         sessionController.loginRequired,
                                           quizController.new);
router.post('/quizes/create',              sessionController.loginRequired,
                                           upload_quizes.single("quiz[image]"),
                                           quizController.create);
router.get('/quizes/:quizId(\\d+)/edit',   sessionController.loginRequired,
                                           quizController.ownershipRequired,
                                           quizController.edit);
router.put('/quizes/:quizId(\\d+)',        sessionController.loginRequired,
                                           quizController.ownershipRequired,
                                           upload_quizes.single("quiz[image]"),
                                           quizController.update);
router.delete('/quizes/:quizId(\\d+)',     sessionController.loginRequired,
                                           quizController.ownershipRequired,
                                           quizController.destroy);

// Definición de rutas de comentarios
router.get('/quizes/:quizId(\\d+)/comments/new',                        commentController.new);
router.post('/quizes/:quizId(\\d+)/comments',                           commentController.create);
router.get('/quizes/:quizId(\\d+)/comments/:commentId(\\d+)/publish',   sessionController.loginRequired,
                                                                        commentController.ownershipRequired,
                                                                        commentController.publish);
/*router.put('/quizes/:quizId(\\d+)/comments/edit',                       sessionController.loginRequired,
                                                                        quizController.ownershipRequired,
                                                                        quizController.update);*/
router.delete('/quizes/:quizId(\\d+)/comments/:commentId(\\d+)/destroy',sessionController.loginRequired,
                                                                        commentController.destroy)

// Estadisticas
router.get('/quizes/statistics', statisticsController.calculate, statisticsController.show);

module.exports = router;
