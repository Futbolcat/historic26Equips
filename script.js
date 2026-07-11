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
  
  // Guardamos la primera fila de datos para analizar los títulos de las columnas
  var cabeceraFila = datos[0]; 
  
  // Mapeamos qué columnas del CONTENIDO se centrarán (Dorsal, Data naixement, Anys al club)
  if (cabeceraFila && Array.isArray(cabeceraFila)) {
    for (var j = 0; j < cabeceraFila.length; j++) { 
      var nombreCabecera = cabeceraFila[j].toString().trim().toLowerCase(); 
      if (nombreCabecera === "dorsal" || nombreCabecera === "data naixement" || nombreCabecera === "anys al club") { 
        indicesAutoCentrados.push(j); 
      } 
    } 
  }
  
  // Recorrer las filas de la tabla
  for (var i = 0; i < datos.length; i++) { 
    var filaVacia = datos[i].every(function(celda) { return celda.toString().trim() === ""; }); 
    if (filaVacia) continue; 
    
    // Detectar si la fila pertenece a un entrenador
    var esEntrenador = false; 
    if (aplicarRoles && i > 0) { 
      for (var c = 0; c < datos[i].length; c++) { 
        if (datos[i][c].toString().trim().toLowerCase() === "entrenador") { 
          esEntrenador = true; 
          break; 
        } 
      } 
    } 
    
    // Asignar la clase a la fila sutilmente
    var claseFila = (i === 0) ? 'class="cabecera"' : (esEntrenador ? 'class="fila-entrenador"' : ''); 
    html += '<tr ' + claseFila + '>'; 
    
    // Recorrer las celdas de la fila actual
    for (var j = 0; j < datos[i].length; j++) { 
      var valorCell = datos[i][j].toString().trim(); 
      
      // Aplicar clase centrada si el índice de columna coincide
      var claseCelda = indicesAutoCentrados.includes(j) ? 'class="col-auto-centrada"' : ''; 
      
      if (i === 0) { 
        // Las cabeceras ya se centran por CSS, no necesitan clase col-auto-centrada
        html += '<th>' + valorCell + '</th>'; 
      } else { 
        // Aplicar colores de rol si procede (Porter, Defensa, etc.)
        if (aplicarRoles && !esEntrenador) { 
          var textoMinuscula = valorCell.toLowerCase(); 
          if (textoMinuscula === "porter") claseCelda = 'class="rol-porter"'; 
          else if (textoMinuscula === "defensa") claseCelda = 'class="rol-defensa"'; 
          else if (textoMinuscula === "migcampista") claseCelda = 'class="rol-migcampista"'; 
          else if (textoMinuscula === "davanter") claseCelda = 'class="rol-davanter"'; 
          else if (indicesAutoCentrados.includes(j)) claseCelda = 'class="col-auto-centrada"'; 
        } else if (indicesAutoCentrados.includes(j)) { 
          claseCelda = 'class="col-auto-centrada"'; 
        } 
        html += '<td ' + claseCelda + '>' + valorCell + '</td>'; 
      } 
    } 
    html += '</tr>'; 
    
    // Inyectar fila de separación debajo del entrenador
    if (aplicarRoles && esEntrenador) { 
      html += '<tr class="fila-separadora">'; 
      for (var k = 0; k < datos[i].length; k++) html += '<td></td>'; 
      html += '</tr>'; 
    } 
  } 
  html += '</table></div>'; 
  return html; 
}
