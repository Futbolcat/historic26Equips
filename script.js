// ==========================================
// CONFIGURACIÓ HORIZONTAL (ENLLACES I ESCUTS)
// ==========================================
const URL_API = "https://script.google.com/macros/s/AKfycbzggpYvXbcCjXahfxqatcq0FYE_FjYVayUYs5RYD0-QsHVooxVAcsQoHCs4m-OMEJP7EA/exec";
const URL_LOGO_TORNEO = "https://www.torneigdhistorics.cat/wp-content/uploads/2023/07/logo_th23.png";

// DICCIONARI D'ESCUTS DELS CLUBS
// Escriu el nom exacte de la pestanya del teu Sheets i al costat el seu enllaç de la foto
const ESCUDOS_EQUIPOS = { 
  "Horta": "https://link-del-escudo-del-horta.png", 
  "Europa": "https://link-del-escudo-del-europa.png", 
  "Sant Andreu": "https://link-del-escudo-del-sant-andreu.png" 
};

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

// PROCESAR EL PAQUET JSON I PINTAR LES DUES TAULES
function procesarDatos(resultadoBloques) { 
  if (!resultadoBloques || !resultadoBloques.principal) { 
    document.getElementById('resultado').innerHTML = "<p style='color:red; text-align:center;'>La fulla està buida o no s'ha trobat.</p>"; 
    return; 
  } 
  
  // Construeix la Taula 1 (C:I) amb colors per rol actius
  var htmlFinal = generarEstructuraTabla(resultadoBloques.principal, "tablaDatosPrincipal", true); 
  
  // Afegeix l'espaiador buit entremig
  htmlFinal += "<div class='espacio-tablas'></div>"; 
  
  // Construeix la Taula 2 (K) sense colors per rol
  htmlFinal += generarEstructuraTabla(resultadoBloques.secundaria, "tablaDatosSecundaria", false); 
  
  document.getElementById('resultado').innerHTML = htmlFinal; 
}

// ==========================================
// MOTOR DE CONSTRUCCIÓ DE LES TAULES HTML
// ==========================================
function generarEstructuraTabla(datos, idTabla, aplicarRoles) { 
  if (!datos || datos.length === 0) return ''; 
  
  var html = '<div class="tabla-contenedor"><table id="' + idTabla + '">'; 
  var indicesAutoCentrados = []; 
  var cabeceraFila = datos[0]; 
  
  // Mapejar quines columnes s'han de centrar automàticament segons el seu nom
  for (var j = 0; j < cabeceraFila.length; j++) { 
    var nombreCabecera = cabeceraFila[j].toString().trim().toLowerCase(); 
    if (nombreCabecera === "dorsal" || nombreCabecera === "demarcació" || nombreCabecera === "anys al club" || nombreCabecera === "data naixement") { 
      indicesAutoCentrados.push(j); 
    } 
  } 
  
  // Recórrer les files de dades
  for (var i = 0; i < datos.length; i++) { 
    var filaVacia = datos[i].every(function(celda) { return celda.toString().trim() === ""; }); 
    if (filaVacia) continue; 
    
    // Detectar si la fila pertany a un entrenador
    var esEntrenador = false; 
    if (aplicarRoles && i > 0) { 
      for (var c = 0; c < datos[i].length; c++) { 
        if (datos[i][c].toString().trim().toLowerCase() === "entrenador") { 
          esEntrenador = true; 
          break; 
        } 
      } 
    } 
    
    // Assignar la classe de disseny a la fila sencer
    var claseFila = (i === 0) ? 'class="cabecera"' : (esEntrenador ? 'class="fila-entrenador"' : ''); 
    html += '<tr ' + claseFila + '>'; 
    
    // Recórrer les celdes de la fila actual
    for (var j = 0; j < datos[i].length; j++) { 
      var valorCelda = datos[i][j].toString().trim(); 
      var claseCelda = indicesAutoCentrados.includes(j) ? 'class="col-auto-centrada"' : ''; 
      
      if (i === 0) { 
        html += '<th ' + claseCelda + '>' + valorCelda + '</th>'; 
      } else { 
        // Aplicar colors individuals si no és l'entrenador i té el rol actiu
        if (aplicarRoles && !esEntrenador) { 
          var textoMinuscula = valorCelda.toLowerCase(); 
          if (textoMinuscula === "porter") claseCelda = 'class="rol-porter"'; 
          else if (textoMinuscula === "defensa") claseCelda = 'class="rol-defensa"'; 
          else if (textoMinuscula === "migcampista") claseCelda = 'class="rol-migcampista"'; 
          else if (textoMinuscula === "davanter") claseCelda = 'class="rol-davanter"'; 
          else if (indicesAutoCentrados.includes(j)) claseCelda = 'class="col-auto-centrada"'; 
        } else if (indicesAutoCentrados.includes(j)) { 
          claseCelda = 'class="col-auto-centrada"'; 
        } 
        html += '<td ' + claseCelda + '>' + valorCelda + '</td>'; 
      } 
    } 
    html += '</tr>'; 
    
    // Si és la fila del míster, injecta la fila de separació transparent a sota
    if (aplicarRoles && esEntrenador) { 
      html += '<tr class="fila-separadora">'; 
      for (var k = 0; k < datos[i].length; k++) html += '<td></td>'; 
      html += '</tr>'; 
    } 
  } 
  html += '</table></div>'; 
  return html; 
}
