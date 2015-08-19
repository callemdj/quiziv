<form class="" action="" method="get">
  <p>Buscar preguntas</p>
  <input type="text" name="search" placeholder="Escriba lo que quiere buscar" />
  <input type="submit" value="Buscar"/>
</form>

<div class="navegador">
  <% if (session.user) {%>
    <div></div>
  <% } %>
  <p>Filtro por temas</p>
</div>
<div class="navegador">
   <% if (session.user) {%>
    <div>
      <a href="/quizes/new"><button type="button">Crear una pregunta nueva</button></a>
    </div>
    <% } %>
    <div class="filtro">

    <form class="" action="" method="get">
      <input type="hidden" name="search" ></input>
      <input type="submit" class="todo" value="Todo" />
    </form>
    <% for (tema in temas) { %>
    <form class="" action="" method="get">
      <input type="hidden" name="tema" value= <%= temas[tema] %> ></input>
      <input type="submit" <% if (temas[tema] === 'Otro'){ %> class="otro" <% } %> value="<%= temas[tema] %>"/>
    </form>
      <% } %>
  </div>
</div>
<div class="contenedor_listado">
  <% if (quizes.length === 0){ %>
    <p>
        No existe ninguna pregunta con la búsqueda realizada,<br>
        por favor introduzca otra búsqueda o vaya a Preguntas<br>
        en el menú de <span id="izquierda">la izquierda</span>
        <span id="arriba">arriba</span> para ver todas la preguntas existentes
    </p>
  <% } %>
  <div >
    <p><% if (quizes.length !== 0 ){
              if (tema  === "preguntas"){ %>
                Todos los temas
          <% }else{ %>
                <% if ((quizes[0].tema) === "tecnologia") { %>
                  Tecnología
                <% } %>
                <% if ((quizes[0].tema) === "ocio") { %>
                  Ocio
                <% } %>
                <% if ((quizes[0].tema) === "ciencia") { %>
                  Ciencia
                <% } %>
                <% if ((quizes[0].tema) === "humanidades") { %>
                  Humanidades
                <% } %>
                <% if ((quizes[0].tema) === "otro") { %>
                  Otro
                <% } %>
          <% } %>
     <% } %>
   </p>
 </div>
 <% if (quizes.length !== 0 ){%>
 <div class="listado" id="listado">
   <div class="listado1">
     <div class="tema titulo_preguntas">
       <p>Preguntas</p>
     </div>
     <div class="tema titulo_preguntas">
       <p>Temática</p>
     </div>
   </div>

  <div class="listado1">
     <div class="tema titulo_preguntas">
       <p>Edita la pregunta</p>
     </div>
     <div class="tema titulo_preguntas">
       <p>Borra la pregunta</p>
     </div>
   </div>
   <% } %>
 </div>

  <% for (var i=0; i < quizes.length; i++) { %>
  <div class="listado">
    <div class="listado1">
      <div class="preguntas">
        <a href="/quizes/<%= quizes[i].id %>"><%= quizes[i].pregunta %></a>
      </div>
      <div class="tema" id="tema">
        <p>
          <%= quizes[i].tema %>
        </p>
      </div>
    </div>
    <% if (session.user){
        if( session.user.isAdmin || session.user.id === quizes[i].UserId) { %>
          <div class="listado1">
            <div class="tema editar">
              <a href="/quizes/<%= quizes[i].id %>/edit">Editar</a>
            </div>
            <form method="post" action="/quizes/<%= quizes[i].id %>?_method=delete">
              <button id="boton_borrar" class="tema" type="submit" onClick="return confirm('Borrar: <%= quizes[i].pregunta %>');">
                Borrar
              </button>
            </form>
          </div>
      <% }else{%>
        <div class="listado1">
          <div class="tema editar"></div>
          <div class="tema"></div>
        </div>
      <% } %>

    <% }else{%>
      <div class="listado1">
        <div class="tema editar"></div>
        <div class="tema"></div>
      </div>
    <% } %>
  </div>
  <% } %>
</div>
