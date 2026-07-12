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
// CÀRREGA INICIAL DE LA WEB
// ==========================================
window.onload = function() { 
  document.getElementById("imgTorneo").src = URL_LOGO_TORNEO; 
  fetch(`${URL_API}?accion=lista`)
    .then(res => res.json())
    .then(cargarSelector)
    .catch(err => console.error("Error llista:", err)); 
};

function cambiarEscudo() { 
  var equipoSeleccionado = document.getElementById('equipo').value; 
  var imgEscudo = document.getElementById('escudoClub'); 
  if (equipoSeleccionado && ESCUDOS_EQUIPOS[equipoSeleccionado]) { 
    imgEscudo.src = ESCUDOS_EQUIPOS[equipoSeleccionado]; 
    imgEscudo.style.display = "block"; 
  } else { 
    imgEscudo.style.display = "none"; 
  }
  document.getElementById('bloqueJugador').style.display = "none";
  document.getElementById('resultado').innerHTML = "";
  datosEquipoActual = null;
}

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
// ENVIAMENT I RECEPCIÓ DE DADES DES DEL SHEETS
// ==========================================
function buscar() { 
  var equipo = document.getElementById('equipo').value; 
  if (!equipo) { 
    document.getElementById('resultado').innerHTML = "<p style='color:orange; text-align:center;'>Si us plau, selecciona un equip vàlid.</p>"; 
    return; 
  } 
  document.getElementById('resultado').innerHTML = "<p class='cargando'>Buscant les dades...</p>"; 
  fetch(`${URL_API}?accion=equipo&nombre=${encodeURIComponent(equipo)}`)
    .then(res => res.json())
    .then(procesarDatos)
    .catch(err => { 
      document.getElementById('resultado').innerHTML = "<p style='color:red; text-align:center;'>Error de connexió.</p>"; 
    }); 
}

function procesarDatos(resultadoBloques) { 
  if (!resultadoBloques || !resultadoBloques.principal || resultadoBloques.principal.length === 0) { 
    document.getElementById('resultado').innerHTML = "<p style='color:red; text-align:center;'>La fulla està buida o no s'ha trobat.</p>"; 
    return; 
  } 
  datosEquipoActual = resultadoBloques;
  var datosPrincipal = resultadoBloques.principal;
  var columnaNomIndex = -1;
  var columnaRolIndex = -1;
  
  if (datosPrincipal && datosPrincipal.length > 0) {
    for (var j = 0; j < datosPrincipal[0].length; j++) {
      var textoCabecera = datosPrincipal[0][j].toString().trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (textoCabecera.indexOf("NOM") > -1 || textoCabecera === "JUGADOR") columnaNomIndex = j;
      if (textoCabecera.indexOf("DEMARCACIO") > -1 || textoCabecera.indexOf("ROL") > -1 || textoCabecera.indexOf("POSICIO") > -1) columnaRolIndex = j;
    }
  }

  var comboJugador = document.getElementById('jugador');
  comboJugador.innerHTML = '<option value="">Tria jugador</option>';
  
  if (columnaNomIndex !== -1) {
    var nombresMiembros = [];
    var ignorarRestoCombo = false;
    for (var i = 1; i < datosPrincipal.length; i++) {
      var filaVacia = datosPrincipal[i].every(function(c) { return c.toString().trim() === ""; });
      if (filaVacia) continue;
      if (columnaRolIndex !== -1) {
        var valorRol = datosPrincipal[i][columnaRolIndex].toString().trim().toLowerCase();
        if (valorRol === "entrenador") { ignorarRestoCombo = true; }
      }
      if (!ignorarRestoCombo) {
        var nombreValue = datosPrincipal[i][columnaNomIndex].toString().trim();
        if (nombreValue !== "") nombresMiembros.push(nombreValue);
      }
    }
    nombresMiembros.sort(function(a, b) { return a.localeCompare(b); });
    nombresMiembros.forEach(function(nom) {
      var opt = document.createElement('option');
      opt.value = nom;
      opt.text = nom;
      comboJugador.appendChild(opt);
    });
    document.getElementById('bloqueJugador').style.display = "block";
  }
  renderizarTablasCompletas();
}

function renderizarTablasCompletas() {
  if (!datosEquipoActual) return;
  var htmlFinal = generarEstructuraTabla(datosEquipoActual.principal, "tablaDatosPrincipal", true, datosEquipoActual.coloresP, false); 
  htmlFinal += "<div class='espacio-tablas'></div>"; 
  // Indicamos con el último parámetro (true) que la tabla secundaria maneja HTML directo
  htmlFinal += generarEstructuraTabla(datosEquipoActual.secundariaHTML, "tablaDatosSecundaria", false, null, true); 
  document.getElementById('resultado').innerHTML = htmlFinal;
}

// ==========================================
// VISTA INTERACTIVA DE LA FITXA VERTICAL
// ==========================================

function detectarMiembro() {
  var miembroSeleccionado = document.getElementById('jugador').value;
  var comboJugador = document.getElementById('jugador');
  
  if (!miembroSeleccionado) {
    if (comboJugador && comboJugador.options) {
      comboJugador.options.text = "Tria jugador"; 
    }
    renderizarTablasCompletas();
    return;
  }
  
  if (comboJugador && comboJugador.options) {
    comboJugador.options.text = "Esborrar";
  }
  
  var htmlFicha = '<div style="margin-top: 25px; padding: 20px; background: #f8f9fa; border: 2px solid #1a73e8; border-radius: 8px; max-width: 500px; margin-left: auto; margin-right: auto; text-align: center;">';
  htmlFicha += '<h3 style="margin: 0; color: #1a73e8; font-size: 22px;">Fitxa jugador</h3>';
  htmlFicha += '<div id="datosFicha" style="margin-top:15px; text-align:left;"></div>';
  htmlFicha += '</div>';
  
  document.getElementById('resultado').innerHTML = htmlFicha;
  completarDatosFicha(miembroSeleccionado);
}

function completarDatosFicha(nombreJugador) {
  if (!datosEquipoActual) return;
  var datosP = datosEquipoActual.principal;
  var datosS = datosEquipoActual.secundariaHTML; // <-- Actualizado al nuevo paquete multicolor
  
  var colNom = 3; 
  var filaIdx = -1;
  for (var i = 1; i < datosP.length; i++) {
    if (datosP[i][colNom].toString().trim() === nombreJugador) { 
      filaIdx = i; 
      break; 
    }
  }
  if (filaIdx === -1) return;

  var tablaHtml = '<table style="width: 100%; border-collapse: collapse;">';
  
  // 1. Líneas de la Tabla Principal (C:I)
  if (datosP && datosP.length > 0) {
    for (var j = 0; j < datosP.length; j++) {
      var tit = datosP[j].toString().trim();
      var val = datosP[filaIdx][j].toString().trim();
      if (tit === "" || tit.toUpperCase().indexOf("BAIXES") > -1) continue;
      
      tablaHtml += '<tr style="border-bottom: 1px solid #ddd;">';
      tablaHtml += '<td style="padding: 10px; font-weight: bold; color: #2c3e50; width: 40%; font-size: 15px; text-transform: uppercase; white-space: normal; word-break: break-word;">' + tit + ':</td>';
      tablaHtml += '<td style="padding: 10px; color: #333; font-size: 16px; white-space: normal; word-break: break-word;">' + val + '</td>';
      tablaHtml += '</tr>';
    }
  }
  
  // 2. Línea de la Tabla Secundaria (K - Baixes) con soporte multicolor
  if (datosS && datosS.length > 0 && datosS[filaIdx]) {
    var titS = datosS.toString().trim();
    var valS = datosS[filaIdx].toString().trim();
    
    if (titS !== "" && titS.toUpperCase().indexOf("BAIXES") === -1) {
      tablaHtml += '<tr style="border-bottom: 1px solid #ddd;">';
      tablaHtml += '<td style="padding: 10px; font-weight: bold; color: #2c3e50; width: 40%; font-size: 15px; text-transform: uppercase; white-space: normal; word-break: break-word;">' + titS + ':</td>';
      // Inyectamos el valor como HTML para renderizar los múltiples colores de la celda
      tablaHtml += '<td style="padding: 10px; color: #333; font-size: 16px; white-space: normal; word-break: break-word;">' + valS + '</td>';
      tablaHtml += '</tr>';
    }
  }
  
  tablaHtml += '</table>';
  document.getElementById('datosFicha').innerHTML = tablaHtml;
}


// ==========================================
// GENERAR TAULA CAMB DADES
// ==========================================

function generarEstructuraTabla(datos, idTabla, aplicarRoles, matrizColores, esHTML) { 
  if (!datos || datos.length === 0) return ''; 
  var html = '<div class="tabla-contenedor"><table id="' + idTabla + '">'; 
  var indicesAutoCentrados = []; 
  
  // En la tabla secundaria, los datos vienen como lista simple, por lo que su cabecera es el elemento 0
  var cabeceraFila = (idTabla === "tablaDatosSecundaria") ? datos : (datos && datos.length > 0 ? datos[0] : null);
  
  if (cabeceraFila && Array.isArray(cabeceraFila)) {
    for (var j = 0; j < cabeceraFila.length; j++) { 
      var nombreCabecera = cabeceraFila[j].toString().replace(/\s+/g, ' ').trim().toLowerCase(); 
      if (nombreCabecera === "dorsal" || nombreCabecera === "data naixement" || nombreCabecera === "anys al club") { 
        indicesAutoCentrados.push(j); 
      } 
    } 
  }
  
  var pararDespuesDeEntrenador = false;
  
  for (var i = 0; i < datos.length; i++) { 
    if (aplicarRoles && pararDespuesDeEntrenador) break;
    
    // Control de salto para filas vacías según la estructura del array
    var filaVacia = false;
    if (idTabla === "tablaDatosSecundaria") {
      filaVacia = (datos[i].toString().trim() === "");
    } else {
      filaVacia = datos[i].every(function(celda) { return celda.toString().trim() === ""; });
    }
    if (filaVacia) continue; 
    
    var esEntrenador = false; 
    if (aplicarRoles && i > 0 && Array.isArray(datos[i])) { 
      for (var c = 0; c < datos[i].length; c++) { 
        if (datos[i][c].toString().trim().toLowerCase() === "entrenador") { esEntrenador = true; pararDespuesDeEntrenador = true; break; } 
      } 
    } 
    
    var claseFila = (i === 0) ? 'class="cabecera"' : (esEntrenador ? 'class="fila-entrenador"' : ''); 
    html += '<tr ' + claseFila + '>'; 
    
    // DIBUJAR CELDAS PARA LA TABLA SECUNDARIA (COLUMNA K DE JUGADORES)
    if (idTabla === "tablaDatosSecundaria") {
      var valorCell = datos[i].toString().trim();
      if (i === 0) {
        html += '<th>' + valorCell + '</th>';
      } else {
        // Al activar esHTML, la web renderiza las etiquetas <span> de colores que ha fabricado Google
        html += '<td>' + (esHTML ? valorCell : valorCell) + '</td>';
      }
    } 
    // DIBUJAR CELDAS PARA LA TABLA PRINCIPAL (C:I)
    else {
      for (var j = 0; j < datos[i].length; j++) { 
        var valorCell = datos[i][j].toString().trim(); 
        var claseCelda = indicesAutoCentrados.includes(j) ? 'class="col-auto-centrada"' : ''; 
        
        var estiloColorInline = "";
        if (i > 0 && !esEntrenador && matrizColores && matrizColores[i] && matrizColores[i][j]) {
          var colorGoogle = matrizColores[i][j].toString().trim();
          var tituloColumnaActual = cabeceraFila && cabeceraFila[j] ? cabeceraFila[j].toString().trim().toUpperCase() : "";
          
          if (tituloColumnaActual.indexOf("NOM FUTBOL") > -1 && colorGoogle !== "#000000" && colorGoogle !== "") {
            estiloColorInline = 'style="color: ' + colorGoogle + ' !important;"';
          }
        }
        
        if (i === 0) { 
          html += '<th>' + valorCell + '</th>'; 
        } else { 
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
          html += '<td ' + claseCelda + ' ' + estiloColorInline + '>' + valorCell + '</td>'; 
        } 
      }
    }
    html += '</tr>'; 
    if (aplicarRoles && esEntrenador) { 
      html += '<tr class="fila-separadora">'; 
      for (var k = 0; k < datos[i].length; k++) html += '<td></td>'; 
      html += '</tr>'; 
    } 
  } 
  html += '</table></div>'; 
  return html; 
}


// ==========================================
// NUEVA PANTALLA: CERCADOR JUGADORS SUB23
// ==========================================
function buscarSub23() {
  document.getElementById('resultado').innerHTML = "<p class='cargando'>Buscant tots els jugadors SUB23 a les plantilles...</p>";
  
  // 1. Blanquear el desplegable de equipos y el de jugadores
  document.getElementById('equipo').value = "";
  document.getElementById('bloqueJugador').style.display = "none";
  
  // 2. Ocultar el escudo del club que estuviera en pantalla
  document.getElementById('escudoClub').style.display = "none";
  
  // 3. Lanzar la petición al servidor de Google Sheets
  fetch(`${URL_API}?accion=sub23`)
    .then(res => res.json())
    .then(mostrarTablaSub23)
    .catch(err => {
      document.getElementById('resultado').innerHTML = "<p style='color:red; text-align:center;'>Error de connexió al cercar Sub23.</p>";
    });
}

function mostrarTablaSub23(listaSub23) {
  if (!listaSub23 || listaSub23.length === 0) {
    document.getElementById('resultado').innerHTML = "<p style='color:orange; text-align:center;'>No s'ha trobat cap jugador nascut després del 01/01/2003.</p>";
    return;
  }
  
  // Fabriquem la taula de 3 columnes demanada: Equip, Nom i Data Naixement
  var html = '<div class="tabla-contenedor" id="contenedorSub23" style="max-width: 600px; margin: 20px auto 0 auto;"><table>';
  html += '<tr class="cabecera"><th>Equip</th><th>Nom</th><th class="col-auto-centrada">Data Naixement</th></tr>';
  
  for (var i = 0; i < listaSub23.length; i++) {
    var equipoNom = listaSub23[i][0];
    var nombre = listaSub23[i][1];
    var fecha = listaSub23[i][2];

    // Control de seguridad: Limpiamos espacios para cruzarlo con tu diccionario de 12 escudos
    var equipoLimpio = equipoNom ? equipoNom.toString().trim() : "";
    // Buscamos si tenemos el enlace del escudo de este club en tu diccionario de arriba
    var urlEscudo = ESCUDOS_EQUIPOS[equipoNom] || "https://wikimedia.org";
    
    html += '<tr>';
    // Colocamos el escudo y el nombre envueltos en clases de diseño inteligente
    html += '<td><div class="celda-equipo"><img class="escudo-tabla-sub23" src="' + urlEscudo + '" alt="Escut"><span class="texto-equipo-sub23">' + equipoNom + '</span></div></td>';
    html += '<td>' + nombre + '</td>';
    html += '<td class="col-auto-centrada">' + fecha + '</td>';
    html += '</tr>';
  }
  
  html += '</table></div>';
  document.getElementById('resultado').innerHTML = html;
}
