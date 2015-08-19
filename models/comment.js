// Definición del modelo de Comment con valiudación
module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
  	'Comment',
    { texto: {
        type: DataTypes.STRING,
        validate: { notEmpty: {msg: "-> Falta Comentario"}}
      },
      username:{
        type: DataTypes.STRING
      },
      image_user:{
        type: DataTypes.STRING
      },
      creado:{
        type: DataTypes.DATE
      },
      publicado: {
      	type: DataTypes.BOOLEAN,
      	defaultValue: false
      }
    },
    {
     classMethods: {
      numNoCommentedQuizes: function () {
          return this.aggregate('QuizId', 'count', {'where': { 'publicado': false }}).then('success',function(count){
          return count;})
        },
      numCommentedQuizes: function () {
          return this.aggregate('QuizId', 'count', {'distinct': true }).then('success',function(count){
            return count;})
        }
      }
  });
};
