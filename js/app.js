window.addEventListener("DOMContentLoaded", iniciar);

function iniciar() {

	//console.log("Iniciando...");
    carregarConfiguracio();

    //crearGrups();
	crearTorneig()
    //crearSemifinals();

}

function carregarConfiguracio() {
    document.getElementById("titolTorneig").textContent =
        `${CONFIG.titol} ${CONFIG.any}`;

    document.getElementById("logoTorneig").src =
        CONFIG.logos.torneig;

    document.getElementById("logoClub").src =
        CONFIG.logos.club;
		
    document.getElementById("favicon").href =
        CONFIG.logos.torneig;
}

function crearTorneig(){

    const contenedor = document.getElementById("contenedor");

    contenedor.appendChild(crearGrup(CONFIG.grups[0])); // Dilluns
    contenedor.appendChild(crearGrup(CONFIG.grups[1])); // Dimarts

    contenedor.appendChild(crearSemifinals());

    contenedor.appendChild(crearGrup(CONFIG.grups[2])); // Dimecres
    contenedor.appendChild(crearGrup(CONFIG.grups[3])); // Dijous

    contenedor.appendChild(crearFinal());

}

function crearSemifinals(){

    const aside = document.createElement("aside");

    aside.id = "semifinals";
    aside.className = "fase-final";


    aside.innerHTML = `

        <div class="eliminatoria">

            <h2>Semifinals</h2>

            <div class="partido-final">

                <div class="equipo-final" data-origen="dilluns">
                    <span>Guanyador Dilluns</span>
                </div>

                <div class="vs">
                    VS
                </div>

                <div class="equipo-final" data-origen="dimarts">
                    <span>Guanyador Dimarts</span>
                </div>

            </div>


            <div class="partido-final">

                <div class="equipo-final" data-origen="dimecres">
                    <span>Guanyador Dimecres</span>
                </div>

                <div class="vs">
                    VS
                </div>

                <div class="equipo-final" data-origen="dijous">
                    <span>Guanyador Dijous</span>
                </div>

            </div>

        </div>

    `;


    return aside;

}

function crearFinal(){

    const div = document.createElement("div");

    div.id = "final";
    div.className = "fase-final";


    div.innerHTML = `

        <div class="eliminatoria">

            <h2>Final</h2>


            <div class="partido-final">

                <div class="equipo-final" data-origen="s1">
                    <span>Guanyador S1</span>
                </div>


                <div class="vs">
                    VS
                </div>


                <div class="equipo-final" data-origen="s2">
                    <span>Guanyador S2</span>
                </div>

            </div>

        </div>

    `;


    return div;

}





/*function crearGrups() {

    const contenidor = document.getElementById("contenedor");
    CONFIG.grups.forEach(grup => {
        contenidor.appendChild(crearGrup(grup));
    });

}*/

function crearGrup(grup) {

    const article = document.createElement("article");
    article.className = "grupo";

    const indiceGrupo = CONFIG.grups.indexOf(grup);

    article.dataset.grup = indiceGrupo;
    article.dataset.bloqueado = "false";


    article.innerHTML = `
        <div class="cabecera-grupo">

            <h2>${grup.dia}</h2>

            <button 
                class="btn-bloqueo"
                title="Bloquear jornada">
                🔓
            </button>

        </div>

        <table class="clasificacion">
            <thead>
                <tr>
                    <th>Equip</th>
                    <th>PJ</th>
                    <th>Pts</th>
                    <th>GF</th>
                    <th>GC</th>
                    <th>DG</th>
                </tr>
            </thead>

            <tbody></tbody>

        </table>

        <div class="partidos"></div>
    `;


    const boton = article.querySelector(".btn-bloqueo");

    boton.addEventListener("click", () => {

        const bloqueado = article.dataset.bloqueado === "true";

        article.dataset.bloqueado = !bloqueado;

        if (!bloqueado) {

            boton.textContent = "🔒";
            boton.title = "Desbloquear jornada";

            boton.classList.add("bloqueado");
            article.classList.add("grupo-bloqueado");

        } else {

            boton.textContent = "🔓";
            boton.title = "Bloquear jornada";

            boton.classList.remove("bloqueado");
            article.classList.remove("grupo-bloqueado");

        }

    });


    crearClasificacion(article, grup);
    crearEnfrontaments(article, grup);

    return article;

}

function crearClasificacion(article, grup) {

    const tbody = article.querySelector("tbody");

    grup.equips.forEach((equip, index) => {

        const fila = document.createElement("tr");

        fila.dataset.equip = index + 1;

		fila.innerHTML = `
			<td>
				<div class="equip-classificacio">
					<img src="${equip.escut}" alt="${equip.nom}">
					<span>${equip.nom}</span>
				</div>
			</td>
			<td>0</td> <!-- PJ -->
			<td>0</td> <!-- Pts -->
			<td>0</td> <!-- GF -->
			<td>0</td> <!-- GC -->
			<td>0</td> <!-- DG -->
		`;

        tbody.appendChild(fila);

    });

}

function crearEnfrontaments(article, grup){

    const div = article.querySelector(".partidos");
	
			
    CONFIG.partits.forEach((partit,index)=>{

        const html = document.createElement("div");
		const equipLocal = grup.equips[partit.local - 1];

		const equipVisitant =
			partit.visitant === null
				? null
				: grup.equips[partit.visitant - 1];
				
		const textPendent =
			partit.id === 2
				? "Perdedor P1"
				: "Guanyador P1";
					
        html.className="partido";

        html.dataset.id = partit.id;
        html.dataset.local = partit.local;
        html.dataset.visitant = partit.visitant;
        html.dataset.penals = partit.penals;

        html.innerHTML=`
            <div class="equipo local" data-equipo="${partit.local}">
                <img src="${equipLocal.escut}" alt="">
				<span>${equipLocal.nom}</span>
            </div>

            <div class="marcador">
                <input type="number" class="gol gol-local" min="0">

                <span>-</span>

                <input type="number" class="gol gol-visitante" min="0">
            </div>

            <div class="equipo visitante" data-equipo="${partit.visitant}">
                ${equipVisitant
					? `<img src="${equipVisitant.escut}" alt="">
					   <span>${equipVisitant.nom}</span>`
					: `<span class="pendent">${textPendent}</span>`
				}
            </div>

			<div class="penaltis oculto">
				<span class="icono">🎯</span>
				<input type="number" class="penal penal-local" min="0" disabled>
				-
				<input type="number" class="penal penal-visitant" min="0" disabled>
			</div>
        `;

        div.appendChild(html);
		html.addEventListener("input", actualitzarGrup);
		if (partit.id !== 1) {

			html.querySelectorAll(".gol").forEach(campo => {
				campo.disabled = true;
			});

			html.querySelectorAll(".penal").forEach(campo => {
				campo.disabled = true;
			});

		}
    });

}

function actualitzarGrup(evento) {

    //console.log("ENTRA actualitzarGrup");

    const grupHTML =
        evento.currentTarget.closest(".grupo");

    const grupConfig =
        CONFIG.grups[parseInt(grupHTML.dataset.grup)];


    controlarEstadoPartidos(
        grupHTML,
        grupConfig
    );

}

function controlarEstadoPartidos(grupHTML, grupConfig) {

	//console.log("ENTRA controlarEstadoPartidos");

    const p1 = grupHTML.querySelector('.partido[data-id="1"]');

    const p2 = grupHTML.querySelector('.partido[data-id="2"]');

    const p3 = grupHTML.querySelector('.partido[data-id="3"]');

    // =========================
    // PARTIDO 1
    // =========================

    if (!tieneResultado(p1)) {
		//console.log("SALGO: P1 sin resultado");
        return;
    }

    habilitarPenals(p1);

    if (!tienePenaltis(p1)) {
		//console.log("SALGO: P1 penaltis");
        return;
    }

	//console.log("P1 COMPLETO. HABILITO P2");	

    // Aquí ya sabemos ganador/perdedor P1
    const classificacioP1 = calcularClassificacio(
		grupHTML,
		grupConfig,
		1
	);

	const ordenadaP1 = ordenarClassificacio(
		classificacioP1
	);

	pintarClassificacio(
		grupHTML,
		ordenadaP1
	);

	actualitzarCalendari(
		grupHTML,
		grupConfig
	);

	//console.log("P1 terminado. Habilitando P2");
    habilitarGoles(p2);

    // =========================
    // PARTIDO 2
    // =========================

    if (!tieneResultado(p2)) {
		//console.log("SALGO: P2 sin resultado");
        return;
    }


	if (necesitaPenaltisPartido2(
		grupHTML,
		grupConfig
	)) {

		habilitarPenals(p2);


		if (!tienePenaltis(p2)) {
			return;
		}

	}
	else {

		quitarPenaltis(p2);

	}

	const classificacioP2 = calcularClassificacio(
		grupHTML,
		grupConfig,
		2
	);

	const ordenadaP2 = ordenarClassificacio(
		classificacioP2
	);

	pintarClassificacio(
		grupHTML,
		ordenadaP2
	);
		
    habilitarGoles(p3);



    // =========================
    // PARTIDO 3
    // =========================

    if (!tieneResultado(p3)) {
        return;
    }


	if (necesitaPenaltisPartido3(
		grupHTML,
		grupConfig
	)) {

		habilitarPenals(p3);


		if (!tienePenaltis(p3)) {
			return;
		}

	}
	else {

		quitarPenaltis(p3);

	}
	
	const classificacioP3 = calcularClassificacio(
		grupHTML,
		grupConfig,
		3
	);

	const ordenadaP3 = ordenarClassificacio(
		classificacioP3
	);

	pintarClassificacio(
		grupHTML,
		ordenadaP3
	);

    // Aquí ya está todo acabado
    console.log("CLASIFICACIÓN FINAL");

}

function tieneResultado(partido) {

    const goles = partido.querySelectorAll(".gol");

    const local = parseInt(goles[0].value);
    const visitante = parseInt(goles[1].value);

    return (
        !isNaN(local) &&
        !isNaN(visitante)
    );
}

function tienePenaltis(partido) {

    const penales = partido.querySelectorAll(".penal");

    const local = parseInt(penales[0].value);
    const visitante = parseInt(penales[1].value);

    return (
        !isNaN(local) &&
        !isNaN(visitante)
    );
}

function habilitarGoles(partido) {

    const goles = partido.querySelectorAll(".gol");

    goles.forEach(gol => {
        gol.disabled = false;
    });

}

function habilitarPenals(partit) {

    const contenedor = partit.querySelector(".penaltis");

    contenedor.classList.remove("oculto");


    partit.querySelectorAll(".penal")
        .forEach(camp => {
            camp.disabled = false;
        });

}

function actualitzarCalendari(grupHTML, grupConfig) {
	
	//console.log("ENTRA actualitzarCalendari");

    const partit1 = grupHTML.querySelector('.partido[data-id="1"]');

    const gols = partit1.querySelectorAll(".gol");

    const golsLocal = parseInt(gols[0].value);
    const golsVisitant = parseInt(gols[1].value);


    // Si aún no hay resultado
    if (isNaN(golsLocal) || isNaN(golsVisitant)) {
		console.log("Partido ignorado");
		restaurarPartits(grupHTML);
		return;
	}

	// P1 siempre necesita tanda antes de continuar

	const penals = partit1.querySelectorAll(".penal");

	const penalsLocal = parseInt(penals[0].value);
	const penalsVisitant = parseInt(penals[1].value);


	if (
		isNaN(penalsLocal) ||
		isNaN(penalsVisitant)
	) {

		return;

	}

	let guanyador;
	let perdedor;

	if (golsLocal > golsVisitant) {

		guanyador = parseInt(partit1.dataset.local);
		perdedor = parseInt(partit1.dataset.visitant);

	}
	else if (golsVisitant > golsLocal) {

		guanyador = parseInt(partit1.dataset.visitant);
		perdedor = parseInt(partit1.dataset.local);

	}
	else {

		const penals = partit1.querySelectorAll(".penal");

		const penalLocal = penals[0];
		const penalVisitant = penals[1];

		const penalsLocal = parseInt(penalLocal.value);
		const penalsVisitant = parseInt(penalVisitant.value);

		penalLocal.classList.remove("penal-error");
		penalVisitant.classList.remove("penal-error");

		if (isNaN(penalsLocal) || isNaN(penalsVisitant))
			return;

		if (penalsLocal > penalsVisitant) {

			guanyador = parseInt(partit1.dataset.local);
			perdedor = parseInt(partit1.dataset.visitant);

		}
		else if (penalsVisitant > penalsLocal) {

			guanyador = parseInt(partit1.dataset.visitant);
			perdedor = parseInt(partit1.dataset.local);

		}
		else {


			penalLocal.classList.add("penal-error");
			penalVisitant.classList.add("penal-error");
			return;

		}

	}

	console.log(
    "Ganador P1:", guanyador,
    "Perdedor P1:", perdedor
	);

	const partit2 =
		grupHTML.querySelector('.partido[data-id="2"]');

	const partit3 =
		grupHTML.querySelector('.partido[data-id="3"]');


	actualitzarEquipPartit(
		partit2,
		grupConfig.equips[perdedor - 1],
		perdedor
	);

	actualitzarEquipPartit(
		partit3,
		grupConfig.equips[guanyador - 1],
		guanyador
	);
	
}

function actualitzarEquipPartit(partit, equip, numeroEquip) {

    console.log("Actualizando partido", partit.dataset.id);


    const equipoActual =
        parseInt(partit.dataset.visitant);


    // Solo limpiamos si realmente cambia el equipo
    const cambiaEquipo =
        equipoActual !== numeroEquip;


    const visitant = partit.querySelector(".equipo.visitante");

    visitant.innerHTML = `
        <img src="${equip.escut}" alt="">
        <span>${equip.nom}</span>
    `;


    partit.dataset.visitant = numeroEquip;


    if (cambiaEquipo) {

        /*console.log(
            "Cambia equipo, limpiando partido",
            partit.dataset.id
        );*/


        partit.querySelectorAll(".gol").forEach(gol => {
            gol.value = "";
        });


        partit.querySelectorAll(".penal").forEach(penal => {
            penal.value = "";
            penal.disabled = true;
        });

    }

}

function pintarClassificacio(grup, classificacio) {

    const files = grup.querySelectorAll("tbody tr");

    classificacio.forEach((equip, index) => {

        const fila = files[index];

        fila.cells[0].innerHTML = `
            <div class="equip-classificacio">
                <img src="${equip.escut}" alt="${equip.nom}">
                <span>${equip.nom}</span>
            </div>
        `;

        fila.cells[1].textContent = equip.pj;
        fila.cells[2].textContent = equip.pts;
        fila.cells[3].textContent = equip.gf;
        fila.cells[4].textContent = equip.gc;
        fila.cells[5].textContent =
            equip.dg > 0 ? "+" + equip.dg : equip.dg;

    });

}

function obtenirEscenariP2(grupHTML) {

    const p1 = grupHTML.querySelector('.partido[data-id="1"]');
    const p2 = grupHTML.querySelector('.partido[data-id="2"]');

    function resultat(partit) {

        const gols = partit.querySelectorAll(".gol");

        const local = parseInt(gols[0].value);
        const visitant = parseInt(gols[1].value);

        if (local > visitant)
            return "L";

        if (local < visitant)
            return "V";

        return "E";
    }

    return resultat(p1) + resultat(p2);

}

function necesitaPenaltisPartido2(grupHTML, grupConfig) {

    console.log("Evaluando necesidad de penaltis P2");

    const escenario = obtenirEscenariP2(grupHTML);

    const necessita = {
        LL: false,
        LE: false,
        LV: true,
        EL: false,
        EE: true,
        EV: false,
        VL: false,
        VE: false,
        VV: true
    };

    console.log(
        "Escenario:", escenario,
        "Penaltis:", necessita[escenario]
    );

    return necessita[escenario];

}

function obtenirEscenariP3(grupHTML) {

    const partidos = [
        grupHTML.querySelector('.partido[data-id="1"]'),
        grupHTML.querySelector('.partido[data-id="2"]'),
        grupHTML.querySelector('.partido[data-id="3"]')
    ];


    function resultat(partit) {

        const gols = partit.querySelectorAll(".gol");

        const local = parseInt(gols[0].value);
        const visitant = parseInt(gols[1].value);


        if (local > visitant)
            return "L";

        if (local < visitant)
            return "V";

        return "E";
    }


    return partidos.map(p => resultat(p)).join("");

}

function necesitaPenaltisPartido3(grupHTML, grupConfig) {

    const escenario = obtenirEscenariP3(grupHTML);

    console.log(
        "Escenario P3:",
        escenario
    );


    const tabla = {

        LLL: false,
        LLE: "R",
        LLV: false,

        LEL: false,
        LEE: false,
        LEV: false,

        LVL: "R",
        LVE: false,
        LVV: false,

        ELL: false,
        ELE: false,
        ELV: false,

        EEL: false,
        EEE: "R",
        EEV: false,

        EVL: false,
        EVE: false,
        EVV: "R",

        VLL: false,
        VLE: "R",
        VLV: false,

        VEL: false,
        VEE: false,
        VEV: false,

        VVL: "R",
        VVE: false,
        VVV: false
    };


    const resultado = tabla[escenario];


    if (resultado === true) {

        console.log(
            "P3 necesita penaltis"
        );

        return true;

    }


    if (resultado === "R") {

        const classificacio =
            calcularClassificacio(
                grupHTML,
                grupConfig,
                3
            );


        ordenarClassificacio(
            classificacio
        );


        if (hayEmpateSinResolver(classificacio)) {

            console.log(
                "P3 necesita penaltis por reglamento"
            );

            return true;

        }

    }


    console.log(
        "P3 NO necesita penaltis"
    );

    return false;

}

function quitarPenaltis(partit) {

    const contenedor = partit.querySelector(".penaltis");

    const campos = partit.querySelectorAll(".penal");

    campos.forEach(campo => {

        campo.value = "";
        campo.disabled = true;
        campo.classList.remove("penal-error");

    });

    contenedor.classList.add("oculto");

}