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
  var htmlFinal = generarEstructuraTabla(datosEquipoActual.principal, "tablaDatosPrincipal", true); 
  htmlFinal += "<div class='espacio-tablas'></div>"; 
  htmlFinal += generarEstructuraTabla(datosEquipoActual.secundaria, "tablaDatosSecundaria", false); 
  document.getElementById('resultado').innerHTML = htmlFinal;
}

// ==========================================
// VISTA INTERACTIVA DE LA FITXA VERTICAL
// ==========================================

function detectarMiembro() {
  var miembroSeleccionado = document.getElementById('jugador').value;
  var comboJugador = document.getElementById('jugador');
  
  // Si es selecciona "Esborrar" o la opció buida, restaurem les taules horitzontals
  if (!miembroSeleccionado) {
    if (comboJugador && comboJugador.options) {
      comboJugador.options[0].text = "Tria jugador"; 
    }
    renderizarTablasCompletas();
    return;
  }
  
  // Canviem el text de la primera opció del desplegable a "Esborrar"
  if (comboJugador && comboJugador.options) {
    comboJugador.options[0].text = "Esborrar";
  }
  
  if (!datosEquipoActual) return;
  
  var datosP = datosEquipoActual.principal;
  var datosS = datosEquipoActual.secundaria;
  
  // 1. Localitzar en quina columna de la taula principal està el Nom del jugador
  var colNomIndex = -1;
  if (datosP && datosP.length > 0 && datosP[0]) {
    for (var j = 0; j < datosP[0].length; j++) {
      var txtCab = datosP[0][j].toString().trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (txtCab.indexOf("NOM") > -1 || txtCab === "JUGADOR") { 
        colNomIndex = j; 
        break; 
      }
    }
  }
  
  if (colNomIndex === -1) return;
  
  // 2. Buscar la fila exacta del jugador triat al menú desplegable
  var filaJugadorIndex = -1;
  for (var i = 1; i < datosP.length; i++) {
    if (datosP[i][colNomIndex].toString().trim() === miembroSeleccionado) { 
      filaJugadorIndex = i; 
      break; 
    }
  }
  
  if (filaJugadorIndex === -1) return;
  
  // 3. Disseny de la targeta vertical de la fitxa del jugador
  var htmlFicha = '<div style="margin-top: 25px; padding: 20px; background: #f8f9fa; border: 2px solid #1a73e8; border-radius: 8px; max-width: 500px; margin-left: auto; margin-right: auto;">';
  htmlFicha += '<h3 style="margin-top: 0; margin-bottom: 15px; color: #1a73e8; font-size: 22px; text-align: center; border: none; padding: 0;">Fitxa jugador</h3>';
  htmlFicha += '<table style="width: 100%; border-collapse: collapse;">';
  
  // Bucle per recórrer les columnes de la Taula Principal (C:I)
  if (datosP && datosP.length > 0 && datosP[0]) {
    for (var j = 0; j < datosP[0].length; j++) {
      var tituloCamp = datosP[0][j].toString().trim();
      var valorCamp = datosP[filaJugadorIndex][j].toString().trim();
      
      // Filtre de seguretat: Ens saltem les columnes buides o de baixes
      if (tituloCamp === "" || tituloCamp.toUpperCase().indexOf("BAIXES") > -1) continue; 
      
      htmlFicha += '<tr style="border-bottom: 1px solid #ddd;">';
      htmlFicha += '<td style="padding: 10px; font-weight: bold; color: #2c3e50; width: 45%; font-size: 15px; text-transform: uppercase;">' + tituloCamp + ':</td>';
      htmlFicha += '<td style="padding: 10px; color: #333; font-size: 16px;">' + valorCamp + '</td>';
      htmlFicha += '</tr>';
    }
  }
  
  // Bucle per recórrer les columnes de la Taula Secundària (K)
  if (datosS && datosS.length > 0 && datosS[0]) {
    for (var j = 0; j < datosS[0].length; j++) {
      var tituloCampS = datosS[0][j].toString().trim();
      var valorCampS = datosS[filaJugadorIndex][j].toString().trim();
      
      if (tituloCampS === "" || tituloCampS.toUpperCase().indexOf("BAIXES") > -1) continue;
      
      htmlFicha += '<tr style="border-bottom: 1px solid #ddd;">';
      htmlFicha += '<td style="padding: 10px; font-weight: bold; color: #2c3e50; width: 45%; font-size: 15px; text-transform: uppercase;">' + tituloCampS + ':</td>';
      htmlFicha += '<td style="padding: 10px; color: #333; font-size: 16px;">' + valorCampS + '</td>';
      htmlFicha += '</tr>';
    }
  }
  
  htmlFicha += '</table></div>';
  document.getElementById('resultado').innerHTML = htmlFicha;
}



// ==========================================
// GENERAR TAULA CAMB DADES
// ==========================================
function generarEstructuraTabla(datos, idTabla, aplicarRoles) { 
  if (!datos || datos.length === 0) return ''; 
  
  var html = '<div class="tabla-contenedor"><table id="' + idTabla + '">'; 
  var indicesAutoCentrados = []; 
  var cabeceraFila = datos[0]; 
  
  if (cabeceraFila && Array.isArray(cabeceraFila)) {
    for (var j = 0; j < cabeceraFila.length; j++) { 
      var nombreCabecera = cabeceraFila[j].toString().replace(/\s+/g, ' ').trim().toLowerCase(); 
      if (nombreCabecera === "dorsal" || nombreCabecera === "data naixement" || nombreCabecera === "anys al club") { 
        indicesAutoCentrados.push(j); 
      } 
    } 
  }
  
  for (var i = 0; i < datos.length; i++) { 
    var filaVacia = datos[i].every(function(celda) { return celda.toString().trim() === ""; }); 
    if (filaVacia) continue; 
    
    var esEntrenador = false; 
    if (aplicarRoles && i > 0) { 
      for (var c = 0; c < datos[i].length; c++) { 
        if (datos[i][c].toString().trim().toLowerCase() === "entrenador") { 
          esEntrenador = true; 
          break; 
        } 
      } 
    } 
    
    var claseFila = (i === 0) ? 'class="cabecera"' : (esEntrenador ? 'class="fila-entrenador"' : ''); 
    html += '<tr ' + claseFila + '>'; 
    
    for (var j = 0; j < datos[i].length; j++) { 
      var valorCell = datos[i][j].toString().trim(); 
      var claseCelda = indicesAutoCentrados.includes(j) ? 'class="col-auto-centrada"' : ''; 
      
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
        html += '<td ' + claseCelda + '>' + valorCell + '</td>'; 
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
