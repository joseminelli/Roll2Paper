const { jsPDF } = window.jspdf;
let charData = null;
let currentTheme = [0, 150, 136];

function setTheme(color) {
    const root = document.documentElement;
    const colors = {
        teal: { hex: '#009688', rgb: [0, 150, 136], rgbStr: '0, 150, 136' },
        red: { hex: '#dc2626', rgb: [220, 38, 38], rgbStr: '220, 38, 38' },
        blue: { hex: '#2563eb', rgb: [37, 99, 235], rgbStr: '37, 99, 235' },
        green: { hex: '#059669', rgb: [5, 150, 105], rgbStr: '5, 150, 105' }
    };
    root.style.setProperty('--theme-color', colors[color].hex);
    root.style.setProperty('--theme-color-rgb', colors[color].rgbStr);
    currentTheme = colors[color].rgb;
}

const getMod = (score) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
};

document.getElementById('fileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    document.getElementById('fileName').innerText = file.name;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            charData = JSON.parse(event.target.result);
            setupUI();
        } catch (err) { alert("Erro ao processar o arquivo protocol."); }
    };
    reader.readAsText(file);
});

function setupUI() {
    if (!charData) return;

    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('char-content').classList.remove('hidden');

    const featContainer = document.getElementById('feats-list');
    const equipList = document.getElementById('equip-list');
    const grid = document.getElementById('attr-grid');
    featContainer.innerHTML = '';
    equipList.innerHTML = '';
    grid.innerHTML = '';

    const raceObj = typeof charData.requiredRace === 'string' ? JSON.parse(charData.requiredRace) : charData.requiredRace;
    const raceName = raceObj ? raceObj.name : "Unidade Desconhecida";

    const bgRaw = charData.background?.backgroundId || "Nenhum";
    const bgName = bgRaw.charAt(0).toUpperCase() + bgRaw.slice(1).replace(/_/g, ' ');

    const classes = charData.jobs.map(j => `${j.jobId.toUpperCase()} (${j.level})`).join(' / ');
    document.querySelector('header p').innerText = `${raceName} | ${classes} | ${bgName}`;

    ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].forEach(s => {
        const score = charData[s].score;
        grid.innerHTML += `
        <div class="attr-card p-3 text-center transition-all hover:brightness-125 border-theme/20 border">
            <div class="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">${s.substring(0, 3)}</div>
            <div class="text-2xl font-black tracking-tighter">${score}</div>
            <div class="text-theme text-[10px] font-bold mt-1">${getMod(score)}</div>
        </div>`;
    });

    const hpProgress = document.getElementById('hp-progress');
    const hpVal = document.getElementById('hp-val');
    hpVal.innerText = `${charData.hp} / ${charData.hp}`;
    hpProgress.style.width = "100%";

    atualizarRecursosDinamicos();

    let allRequiredData = charData.allRequiredClasses;
    if (typeof allRequiredData === 'string') allRequiredData = JSON.parse(allRequiredData);

    const idArquetipoEscolhido = charData.jobs[0].archetypeId;
    const nivelPersonagem = charData.jobs[0].level || 1;
    const habilidadesUnicas = new Set();

    if (allRequiredData && allRequiredData.jobs) {
        allRequiredData.jobs.forEach(jobEntry => {
            const job = typeof jobEntry === 'string' ? JSON.parse(jobEntry) : jobEntry;
            let features = [...(job.features || [])];
            if (job.archetypes) {
                job.archetypes.forEach(arch => {
                    if (arch.id === idArquetipoEscolhido || arch.name === idArquetipoEscolhido) {
                        if (arch.features) features.push(...arch.features);
                    }
                });
            }
            features.forEach(f => {
                const lvlReq = f.feat ? f.feat.requiredLevel || 0 : 0;
                if (f.feat && f.feat.name && !habilidadesUnicas.has(f.feat.name) && lvlReq <= nivelPersonagem) {
                    habilidadesUnicas.add(f.feat.name);
                    featContainer.innerHTML += `
                        <div class="border-l-2 border-theme pl-2 py-1 mb-2 bg-slate-900/20 rounded-r-lg">
                            <div class="font-bold text-white text-[11px]">${f.feat.name.toUpperCase()}</div>
                            <div class="text-slate-400 text-[10px] leading-tight">
                                ${f.feat.descriptionModels[0].description.substring(0, 95)}...
                            </div>
                        </div>`;
                }
            });
        });
    }

    if (charData.equipment) {
        charData.equipment.forEach(e => {
            equipList.innerHTML += `
                <li class="flex justify-between border-b border-slate-700/50 py-1 text-[10px]">
                    <span class="text-slate-300">${e.name}</span>
                    <span class="text-theme font-bold">x${e.amount}</span>
                </li>`;
        });
    }
}

function atualizarRecursosDinamicos() {
    const resourceContainer = document.getElementById('resource-container');
    const existingResources = resourceContainer.querySelectorAll('.dynamic-res');
    existingResources.forEach(r => r.remove());

    if (!charData) return;
    const nivelAtual = charData.jobs[0].level || 1;

    if (charData.specialAbilities) {
        charData.specialAbilities.forEach(ability => {
            const usoParaNivel = ability.amountsPerLevel
                .filter(a => a.level <= nivelAtual)
                .pop();

            if (usoParaNivel && usoParaNivel.amount > 0) {
                const max = usoParaNivel.amount;
                const div = document.createElement('div');
                div.className = 'dynamic-res p-4 rounded-xl bg-slate-900/80 border border-slate-700/50 shadow-inner';
                div.innerHTML = `
                    <div class="flex justify-between items-center">
                        <span class="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">${ability.name}</span>
                        <div class="flex gap-1.5">
                            ${Array(parseInt(max)).fill('<div class="resource-dot"></div>').join('')}
                        </div>
                    </div>
                `;
                resourceContainer.appendChild(div);
            }
        });
    }
}

document.getElementById('generateBtn').addEventListener('click', () => {
    if (!charData) {
        alert("PROTOCOL ERROR: Carregue um arquivo .cah primeiro.");
        return;
    }

    const doc = new jsPDF();
    const c = currentTheme;
    const isCompact = document.getElementById('compactMode').checked;

    const nivel = charData.jobs[0].level || 1;
    const idArquetipoEscolhido = charData.jobs[0].archetypeId;
    const bonusProf = Math.ceil(1 + (nivel / 4));

    const modDex = parseInt(getMod(charData.dexterity.score));
    const modWis = parseInt(getMod(charData.wisdom.score));
    const acFinal = (charData.baseAc || 10) + modDex;
    const isPerceptionProf = charData.skills.find(s => s.typeName === "PERCEPTION")?.proficiencyName === "FULL";
    const passivePerception = 10 + modWis + (isPerceptionProf ? bonusProf : 0);

    doc.setFillColor(c[0], c[1], c[2]);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(charData.name.toUpperCase(), 15, 18);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const raceObj = typeof charData.requiredRace === 'string' ? JSON.parse(charData.requiredRace) : charData.requiredRace;
    const classes = charData.jobs.map(j => `${j.jobId.toUpperCase()} (${j.level})`).join(' / ');
    
    const bgRaw = charData.background?.backgroundId || "None";
    const bgFormatado = bgRaw.charAt(0).toUpperCase() + bgRaw.slice(1).replace(/_/g, ' ');
    
    doc.text(`${raceObj.name} | ${classes} | ${bgFormatado}`, 15, 28);
    doc.setFontSize(8);
    doc.text(`AC: ${acFinal} | INIC: ${getMod(charData.dexterity.score)} | PROF: +${bonusProf} | PASSIVE PERC: ${passivePerception}`, 15, 35);

    let xBox = 15;
    const stats = [
        { n: 'FOR', k: 'strength' }, { n: 'DES', k: 'dexterity' },
        { n: 'CON', k: 'constitution' }, { n: 'INT', k: 'intelligence' },
        { n: 'SAB', k: 'wisdom' }, { n: 'CAR', k: 'charisma' }
    ];
    stats.forEach(s => {
        const data = charData[s.k];
        const temSave = data.save === true;
        doc.setDrawColor(c[0], c[1], c[2]);
        doc.setLineWidth(temSave ? 0.8 : 0.2);
        doc.roundedRect(xBox, 45, 28, 16, 2, 2, 'D');
        doc.setFontSize(7);
        doc.setTextColor(temSave ? c[0] : 100);
        doc.text(temSave ? `${s.n} *` : s.n, xBox + 14, 50, { align: 'center' });
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text(`${data.score} (${getMod(data.score)})`, xBox + 14, 56, { align: 'center' });
        xBox += 31;
    });

    let y = 72;

    doc.setTextColor(c[0], c[1], c[2]);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`IDIOMAS: `, 15, y);
    let listaIdiomas = [];
    if (raceObj.languages) {
        listaIdiomas = raceObj.languages
            .map(l => l.proficiency || l.name)
            .filter(name => name && !name.includes("Choose"));
    }
    const idiomasTexto = listaIdiomas.length > 0 ? listaIdiomas.join(', ') : "Common";
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    doc.text(idiomasTexto, 35, y);

    const sentidos = charData.senses || "Percepção Normal";
    doc.setTextColor(c[0], c[1], c[2]);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`SENTIDOS: `, 110, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    doc.text(sentidos, 130, y);

    y += 12;

    doc.setTextColor(c[0], c[1], c[2]);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("PERFIL E HISTÓRIA", 15, y);
    y += 6;
    doc.setFontSize(8);
    doc.setTextColor(80);

    const secoesPerfil = [
        { label: "TRAÇOS: ", content: charData.personalityTraits || "---" },
        { label: "VÍNCULOS: ", content: charData.bonds || "---" },
        { label: "HISTÓRIA: ", content: charData.about || "Sem história registrada." }
    ];

    secoesPerfil.forEach(item => {
        doc.setFont("helvetica", "bold");
        doc.text(item.label, 15, y);
        const labelWidth = doc.getTextWidth(item.label);
        doc.setFont("helvetica", "normal");
        const disponivel = 180 - labelWidth;
        const linhas = doc.splitTextToSize(item.content, disponivel);
        doc.text(linhas, 15 + labelWidth, y);
        y += (linhas.length * 4) + 2;
    });

    y += 4;
    doc.setTextColor(c[0], c[1], c[2]);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("HABILIDADES DE CLASSE", 15, y);
    y += 6;

    const habilidadesUnicas = new Set();
    let allRequiredData = typeof charData.allRequiredClasses === 'string' ? JSON.parse(charData.allRequiredClasses) : charData.allRequiredClasses;

    allRequiredData.jobs.forEach(jobEntry => {
        const job = typeof jobEntry === 'string' ? JSON.parse(jobEntry) : jobEntry;
        let features = [...(job.features || [])];
        if (job.archetypes) {
            job.archetypes.forEach(arch => {
                if (arch.id === idArquetipoEscolhido || arch.name === idArquetipoEscolhido) {
                    if (arch.features) features.push(...arch.features);
                }
            });
        }
        features.forEach(f => {
            if (!f.feat) return;
            const lvlReq = f.feat.requiredLevel || 0;
            if (!habilidadesUnicas.has(f.feat.name) && lvlReq <= nivel) {
                habilidadesUnicas.add(f.feat.name);
                if (y > 275) { doc.addPage(); y = 20; }
                doc.setFont("helvetica", "bold");
                doc.setFontSize(9);
                doc.setTextColor(0);
                const desc = f.feat.descriptionModels[0].description;
                if (isCompact) {
                    const titulo = `• ${f.feat.name.toUpperCase()}: `;
                    doc.text(titulo, 15, y);
                    const larguraT = doc.getTextWidth(titulo);
                    doc.setFont("helvetica", "normal");
                    const resumo = desc.split('.')[0] + ".";
                    const lines = doc.splitTextToSize(resumo, 185 - (15 + larguraT));
                    doc.text(lines, 15 + larguraT, y);
                    y += (lines.length * 4) + 2;
                } else {
                    doc.text(f.feat.name.toUpperCase(), 15, y);
                    y += 4;
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(8);
                    const descS = doc.splitTextToSize(desc, 180);
                    doc.text(descS, 15, y);
                    y += (descS.length * 4) + 4;
                }
            }
        });
    });

    if (charData.spells && charData.spells.length > 0) {
        if (y > 240) { doc.addPage(); y = 20; }
        y += 8;
        doc.setTextColor(c[0], c[1], c[2]);
        doc.setFontSize(12);
        doc.text("LIVRO DE MAGIAS", 15, y);
        y += 6;
        const magiasPorNivel = charData.spells.reduce((acc, s) => {
            const lvl = s.level === 0 ? "Truques" : `Nível ${s.level}`;
            if (!acc[lvl]) acc[lvl] = [];
            acc[lvl].push(s.name);
            return acc;
        }, {});
        for (const [lvl, nomes] of Object.entries(magiasPorNivel)) {
            if (y > 280) { doc.addPage(); y = 20; }
            doc.setFontSize(9); doc.setFont("helvetica", "bold");
            doc.setTextColor(c[0], c[1], c[2]);
            doc.text(`${lvl}:`, 15, y);
            doc.setFont("helvetica", "normal"); doc.setTextColor(0);
            const listaS = doc.splitTextToSize(nomes.join(', '), 165);
            doc.text(listaS, 35, y);
            y += (listaS.length * 4) + 2;
        }
    }

    if (charData.equipment && charData.equipment.length > 0) {
        if (y > 260) { doc.addPage(); y = 20; }
        y += 8;
        doc.setTextColor(c[0], c[1], c[2]); doc.setFontSize(11);
        doc.text("EQUIPAMENTO", 15, y);
        y += 5; doc.setTextColor(80); doc.setFontSize(7);
        const equipS = doc.splitTextToSize(charData.equipment.map(e => `${e.name} (x${e.amount})`).join('  |  '), 180);
        doc.text(equipS, 15, y);
    }

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8); doc.setTextColor(150);
        doc.text(`Página ${i} de ${pageCount} | Roll2Paper Protocol`, 105, 292, { align: 'center' });
    }

    doc.save(`Roll2Paper_${charData.name}.pdf`);
});