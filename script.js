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
// PARTE 2: BUSQUEDA I HISTÒRIAL DE JUGADORS
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
  
  // Localizar columnas en la cabecera (Fila 0)
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
        if (valorRol === "entrenador") {
          ignorarRestoCombo = true; 
        }
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
