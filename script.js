// ==========================================
// CONFIGURACIÓ HORIZONTAL (ENLLACES I ESCUTS)
// ==========================================
const URL_API = "https://script.google.com/macros/s/AKfycbzggpYvXbcCjXahfxqatcq0FYE_FjYVayUYs5RYD0-QsHVooxVAcsQoHCs4m-OMEJP7EA/exec";
const URL_LOGO_TORNEO = "https://www.torneigdhistorics.cat/wp-content/uploads/2023/07/logo_th23.png";

// DICCIONARI D'ESCUTS DELS CLUBS
// Escriu el nom exacte de la pestanya del teu Sheets i al costat el seu enllaç de la foto
const ESCUDOS_EQUIPOS = { 
  "CE Europa": "https://files.fcf.cat/escudos/clubes/escudos/00100_0000735880_europa_200x200.png", 
  "Reus FC Reddis": "https://files.fcf.cat/escudos/clubes/escudos/00100_0000880558_reddis_200.png", 
  "UE Sant Andreu": "https://files.fcf.cat/escudos/clubes/escudos/00100_0000573790_standreu_200x200.png", 
  "CF Badalona": "https://files.fcf.cat/escudos/clubes/escudos/00100_0000574727_bdn_200x200.png", 
  "CE l'Hospitalet": "https://files.fcf.cat/escudos/clubes/escudos/00100_0001106091_COLOR.png", 
  "CF Vilanova": "https://files.fcf.cat/escudos/clubes/escudos/00100_0001044079_cfv.png", 
  "CF Montañesa": "https://files.fcf.cat/escudos/clubes/escudos/00100_0000584781_montanesa_200x200.png", 
  "FC Martinenc": "https://files.fcf.cat/escudos/clubes/escudos/00100_0000577607_martinenc-200x200.png", 
  "AE Prat": "https://files.fcf.cat/escudos/clubes/escudos/00100_0000892062_aeprat_200.png", 
  "UA Horta": "https://files.fcf.cat/escudos/clubes/escudos/00100_0000959029_1049_HortaUAT_200.png", 
  "CE Júpiter": "https://files.fcf.cat/escudos/clubes/escudos/00100_0000672018_cejupiter_200x200.png", 
  "UE Sants": "https://files.fcf.cat/escudos/clubes/escudos/00100_0000959051_1051_SantUE_200.png" 
};

// Variable global interna para guardar los datos cargados del equipo actual
let datosEquipoActual = null;

// ==========================================
// LOGICA DE CÀRREGA INICIAL (AL OBRIR LA WEB)
// ==========================================
window.onload = function() { 
  // Carrega la foto oficial del torneig a la capçalera
  document.getElementById("imgTorneo").src = URL_LOGO_TORNEO; 
  
  // Demana automàticament la llista de pestanyes al Google Sheets
  fetch(`${URL_API}?accion=lista`)
    .then(res => res.json())
    .then(cargarSelector)
    .catch(err => console.error("Error carregant la llista:", err)); 
};

// ==========================================
// GESTIÓ DINÀMICA DELS ESCUTS AL SELECTOR
// ==========================================
function cambiarEscudo() { 
  var equipoSeleccionado = document.getElementById('equipo').value; 
  var imgEscudo = document.getElementById('escudoClub'); 
  
  // Si l'equip triat té un enllaç al diccionari d'escuts, el mostra
  if (equipoSeleccionado && ESCUDOS_EQUIPOS[equipoSeleccionado]) { 
    imgEscudo.src = ESCUDOS_EQUIPOS[equipoSeleccionado]; 
    imgEscudo.style.display = "block"; 
  } else { 
    imgEscudo.style.display = "none"; 
  } 
}

// OMPLIR EL DESPLEGABLE AMB ELS EQUIPS REALS
function cargarSelector(equipos) { 
  var select = document.getElementById('equipo'); 
  select.innerHTML = '<option value="">Tria equip</option>'; 
  
  if (equipos && Array.isArray(equipos)) { 
    equipos.forEach(function(nombre) { 
      var option = document.createElement('option'); 
      option.value = nombre; 
      option.text = nombre; 
      select.appendChild(option); 
    }); 
  } 
}

// ==========================================
// LOGICA DE BUSQUEDA I PETICIÓ DE DADES
// ==========================================
function buscar() { 
  var equipo = document.getElementById('equipo').value; 
  
  if (!equipo) { 
    document.getElementById('resultado').innerHTML = "<p style='color:orange; text-align:center;'>Si us plau, selecciona un equip vàlid.</p>"; 
    return; 
  } 
  
  document.getElementById('resultado').innerHTML = "<p class='cargando'>Buscant les dades...</p>"; 
  
  // Crida a l'API de Google per rebre els dos blocs C:I i K
  fetch(`${URL_API}?accion=equipo&nombre=${encodeURIComponent(equipo)}`)
    .then(res => res.json())
    .then(procesarDatos)
    .catch(err => { 
      document.getElementById('resultado').innerHTML = "<p style='color:red; text-align:center;'>Error de connexió.</p>"; 
    }); 
}

// PROCESAR EL PAQUET JSON, PINTAR LES DUES TAULES I OMPLIR EL DESPLEGABLE
function procesarDatos(resultadoBloques) { 
  if (!resultadoBloques || !resultadoBloques.principal || resultadoBloques.principal.length === 0) { 
    document.getElementById('resultado').innerHTML = "<p style='color:red; text-align:center;'>La fulla està buida o no s'ha trobat.</p>"; 
    return; 
  } 
  
  datosEquipoActual = resultadoBloques;
  var datosPrincipal = resultadoBloques.principal;
  var cabeceraOpciones = datosPrincipal[0]; 
  
  // 1. Localizar la columna que se llama exactamente "NOM" en la cabecera (Fila 0)
  var columnaNomIndex = -1;
  if (cabeceraOpciones && Array.isArray(cabeceraOpciones)) {
    for (var j = 0; j < cabeceraOpciones.length; j++) {
      var textoCabecera = cabeceraOpciones[j].toString().trim().toUpperCase();
      textoCabecera = textoCabecera.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (textoCabecera.indexOf("NOM") > -1 || textoCabecera === "JUGADOR") {
        columnaNomIndex = j;
        break; 
      }
    }
  }
  // 2. Extraer los nombres de los jugadores si la columna existe
  var comboJugador = document.getElementById('jugador');
  comboJugador.innerHTML = '<option value="">Esborrar</option>';
  
  if (columnaNomIndex !== -1) {
    var nombresMiembros = [];
    
    // Empezamos en i = 1 para saltarnos los títulos
    for (var i = 1; i < datosPrincipal.length; i++) {
      var filaVacia = datosPrincipal[i].every(function(c) { return c.toString().trim() === ""; });
      if (filaVacia) continue;
      
      var nombreValue = datosPrincipal[i][columnaNomIndex].toString().trim();
      if (nombreValue !== "" && nombreValue.toUpperCase() !== "ENTRENADOR") {
        nombresMiembros.push(nombreValue);
      }
    }
    
    // ORDENAR ALFABÉTICAMENTE los nombres obtenidos
    nombresMiembros.sort(function(a, b) { return a.localeCompare(b); });
    
    // Insertar los nombres ordenados en el menú desplegable
    nombresMiembros.forEach(function(nom) {
      var opt = document.createElement('option');
      opt.value = nom;
      opt.text = nom;
      comboJugador.appendChild(opt);
    });
    
    // Desplazar visualmente los controles e iluminar el nuevo menú a la derecha
    document.getElementById('bloqueJugador').style.display = "block";
  }
  renderizarTablasCompletas();
}

// FUNCIÓN PARA VOLVER A PINTAR LAS TABLAS ORIGINALES HORIZONTALES
function renderizarTablasCompletas() {
  if (!datosEquipoActual) return;
  var htmlFinal = generarEstructuraTabla(datosEquipoActual.principal, "tablaDatosPrincipal", true); 
  htmlFinal += "<div class='espacio-tablas'></div>"; 
  htmlFinal += generarEstructuraTabla(datosEquipoActual.secundaria, "tablaDatosSecundaria", false); 
  document.getElementById('resultado').innerHTML = htmlFinal;
}

// ==========================================
// GENERAR LA FITXA VERTICAL DEL JUGADOR
// ==========================================
function detectarMiembro() {
  var miembroSeleccionado = document.getElementById('jugador').value;
  
  // Si el usuario vuelve a seleccionar el texto vacío "Tria membre", restauramos las tablas completas
  if (!miembroSeleccionado) {
    renderizarTablasCompletas();
    return;
  }
  
  if (!datosEquipoActual) return;
  
  var datosP = datosEquipoActual.principal;
  var datosS = datosEquipoActual.secundaria;
  var cabeceraP = datosP[0];
  var cabeceraS = datosS[0];
  
  // 1. Encontrar en qué columna de la tabla principal está el nombre
  var colNomIndex = -1;
  for (var j = 0; j < cabeceraP.length; j++) {
    if (cabeceraP[j].toString().trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").indexOf("NOM") > -1) {
      colNomIndex = j;
      break;
    }
  }
  
  if (colNomIndex === -1) return;
  
  // 2. Buscar la fila exacta del jugador seleccionado
  var filaJugadorIndex = -1;
  for (var i = 1; i < datosP.length; i++) {
    if (datosP[i][colNomIndex].toString().trim() === miembroSeleccionado) {
      filaJugadorIndex = i;
      break;
    }
  }
  
  if (filaJugadorIndex === -1) return;
  
  // 3. CONSTRUIR ESTRUCTURA DE TARJETA VERTICAL COMPACTA
  var htmlFicha = '<div style="margin-top: 25px; padding: 20px; background: #f8f9fa; border: 2px solid #1a73e8; border-radius: 8px; max-width: 500px; margin-left: auto; margin-right: auto;">';
  htmlFicha += '<table style="width: 100%; border-collapse: collapse; margin-top: 15px;">';
  
  // Procesar campos de la Tabla Principal (C:I) hacia abajo
  for (var j = 0; j < cabeceraP.length; j++) {
    var tituloCamp = cabeceraP[j].toString().trim();
    var valorCamp = datosP[filaJugadorIndex][j].toString().trim();
    if (tituloCamp === "") continue; // Nos saltamos columnas sin título
    
    htmlFicha += '<tr style="border-bottom: 1px solid #ddd;">';
    htmlFicha += '<td style="padding: 10px; font-weight: bold; color: #2c3e50; width: 45%; font-size: 15px; text-transform: uppercase;">' + tituloCamp + ':</td>';
    htmlFicha += '<td style="padding: 10px; color: #333; font-size: 16px;">' + valorCamp + '</td>';
    htmlFicha += '</tr>';
  }
  
  // Procesar campos de la Tabla Secundaria (K) hacia abajo en la misma ficha
  for (var j = 0; j < cabeceraS.length; j++) {
    var tituloCampS = cabeceraS[j].toString().trim();
    var valorCampS = datosS[filaJugadorIndex][j].toString().trim();
    if (tituloCampS === "" || tituloCampS.toUpperCase().indexOf("BAIXES") > -1) continue;
    
    htmlFicha += '<tr style="border-bottom: 1px solid #ddd;">';
    htmlFicha += '<td style="padding: 10px; font-weight: bold; color: #2c3e50; width: 45%; font-size: 15px; text-transform: uppercase;">' + tituloCampS + ':</td>';
    htmlFicha += '<td style="padding: 10px; color: #333; font-size: 16px;">' + valorCampS + '</td>';
    htmlFicha += '</tr>';
  }
  
  htmlFicha += '</table></div>';
  
  // Inyectamos la ficha borrando las tablas horizontales temporalmente
  document.getElementById('resultado').innerHTML = htmlFicha;
}

// ==========================================
// MOTOR DE CONSTRUCCIÓ DE LES TAULES HTML
// ==========================================
function generarEstructuraTabla(datos, idTabla, aplicarRoles) { 
  // 1. Control de seguretat: Si no venen dades o l'array està buit, no dibuixa res
  if (!datos || datos.length === 0) return ''; 
  
  // Iniciar la cadena de text on s'anirà muntant tota la taula HTML
  var html = '<div class="tabla-contenedor"><table id="' + idTabla + '">'; 
  
  // Array on guardarem els números (índexs) de les columnes que s'han de centrar
  var indicesAutoCentrados = []; 
  
  // Guardem la primera fila (fila 0), que sempre conté els títols de les cabeceres
  var cabeceraFila = datos[0]; 
  
  // 2. MAPETJAR LES COLUMNES QUE S'HAN DE CENTRAR
  // Recorrem totes les cel·les de la cabecera per buscar els noms de les columnes a centrar
  if (cabeceraFila && Array.isArray(cabeceraFila)) {
    for (var j = 0; j < cabeceraFila.length; j++) { 
      // Convertim el text a minúscules i netegem espais per evitar errades d'escriptura al Sheets
      var nombreCabecera = cabeceraFila[j].toString().replace(/\s+/g, ' ').trim().toLowerCase(); 
      
      // Si la columna es diu Dorsal, Data naixement o Anys al club, guardem la seva posició (j)
      if (nombreCabecera === "dorsal" || nombreCabecera === "data naixement" || nombreCabecera === "anys al club") { 
        indicesAutoCentrados.push(j); 
      } 
    } 
  }
  
  // 3. RECORRER LES FILES DE DADES DEL SHEETS
  for (var i = 0; i < datos.length; i++) { 
    // Comprovació: Si tota la fila sencera està buida de text, ens la saltem per no crear línies en blanc
    var filaVacia = datos[i].every(function(celda) { return celda.toString().trim() === ""; }); 
    if (filaVacia) continue; 
    
    // Bandera de control per saber si a la fila actual hi ha un entrenador
    var esEntrenador = false; 
    
    // Si la taula té actiu el paràmetre 'aplicarRoles' i no estem a la cabecera (i > 0)...
    if (aplicarRoles && i > 0) { 
      // Recorrem les cel·les d'aquesta fila per veure si algun text diu exactament "Entrenador"
      for (var c = 0; c < datos[i].length; c++) { 
        if (datos[i][c].toString().trim().toLowerCase() === "entrenador") { 
          esEntrenador = true; // Si el trobem, activem la bandera
          break; // Sortim del bucle de cel·les, ja sabem que és l'entrenador
        } 
      } 
    } 
    
    // 4. ASSIGNAR DISSENY A LA FILA (TR)
    // Si i és 0 apliquem la classe 'cabecera'. Si esEntrenador és cert, 'fila-entrenador'. Si no, fila normal.
    var claseFila = (i === 0) ? 'class="cabecera"' : (esEntrenador ? 'class="fila-entrenador"' : ''); 
    html += '<tr ' + claseFila + '>'; 
    
    // 5. RECORRER CADA CEL·LA DE LA FILA ACTUAL
    for (var j = 0; j < datos[i].length; j++) { 
      // Netegem els espais en blanc del text de la cel·la actual
      var valorCell = datos[i][j].toString().trim(); 
      
      // Mirem si la columna actual ha de anar centrada segons el llistat que hem fet al Pas 2
      var claseCelda = indicesAutoCentrados.includes(j) ? 'class="col-auto-centrada"' : ''; 
      
      // Si és la fila 0, pintem cel·les de cabecera (TH)
      if (i === 0) { 
        // Nota: Les cabeceres ja es centren totes directament per les regles del fitxer CSS (index.html)
        html += '<th>' + valorCell + '</th>'; 
      } else { 
        // Si no és cabecera, pintem cel·les normals de dades (TD)
        
        // Si la taula demana colors per rol i NO és la fila sencera de l'entrenador...
        if (aplicarRoles && !esEntrenador) { 
          var textoMinuscula = valorCell.toLowerCase(); 
          
          // Busquem paraules clau individuals per pintar fons suaus segons la demarcació del jugador
          if (textoMinuscula === "porter") claseCelda = 'class="rol-porter"'; 
          else if (textoMinuscula === "defensa") claseCelda = 'class="rol-defensa"'; 
          else if (textoMinuscula === "migcampista") claseCelda = 'class="rol-migcampista"'; 
          else if (textoMinuscula === "davanter") claseCelda = 'class="rol-davanter"'; 
          // Si la cel·la no és una demarcació però pertany a Dorsal/Data/Anys, manté el seu centratge
          else if (indicesAutoCentrados.includes(j)) claseCelda = 'class="col-auto-centrada"'; 
          
        } else if (indicesAutoCentrados.includes(j)) { 
          // Si no s'apliquen rols (Taula 2) o és la fila de l'entrenador, només hereta el centratge si correspon
          claseCelda = 'class="col-auto-centrada"'; 
        } 
        
        // Injectem la cel·la de dades (TD) a la línia HTML amb la seva classe de disseny i el seu text
        html += '<td ' + claseCelda + '>' + valorCell + '</td>'; 
      } 
    } 
    html += '</tr>'; // Tanquem la línia de la fila actual
    
    // 6. INJECTAR FILA SEPARADORA POST-ENTRENADOR
    // Si hem acabat de dibuixar la línia de l'entrenador, afegim immediatament una fila completament buida i transparent
    if (aplicarRoles && esEntrenador) { 
      html += '<tr class="fila-separadora">'; 
      // Creem tantes cel·les buides com columnes tingui la taula per no desconfigurar l'estructura
      for (var k = 0; k < datos[i].length; k++) html += '<td></td>'; 
      html += '</tr>'; 
    } 
  } 
  
  // Tanquem les etiquetes de la taula i el seu contenidor de lliscament lateral
  html += '</table></div>'; 
  
  // Retornem tot el bloc HTML generat en forma de text perquè es pugui pintar a la web
  return html; 
}
