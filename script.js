const { jsPDF } = window.jspdf;
let charData = null;
let currentTheme = [0, 150, 136];

function setTheme(color) {
    const root = document.documentElement;
    const colors = {
        teal: { hex: '#009688', rgb: [0, 150, 136] },
        red: { hex: '#dc2626', rgb: [220, 38, 38] },
        blue: { hex: '#2563eb', rgb: [37, 99, 235] },
        green: { hex: '#059669', rgb: [5, 150, 105] }
    };
    root.style.setProperty('--theme-color', colors[color].hex);
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
        } catch (err) { alert("Erro ao processar o arquivo."); }
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
    const raceName = raceObj ? raceObj.name : "Raça Desconhecida";
    const classes = charData.jobs.map(j => `${j.jobId.toUpperCase()} (${j.level})`).join(' / ');
    document.querySelector('header p').innerText = `${raceName} | ${classes}`;

    ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].forEach(s => {
        const score = charData[s].score;
        grid.innerHTML += `
            <div class="text-center border border-slate-700 p-2 rounded-lg bg-slate-900/30">
                <div class="text-[10px] text-slate-500 font-bold">${s.substring(0, 3).toUpperCase()}</div>
                <div class="text-lg font-bold">${score}</div>
                <div class="text-theme text-xs font-black">${getMod(score)}</div>
            </div>`;
    });

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
                        <div class="border-l-2 border-theme pl-2 py-1 mb-2">
                            <div class="font-bold text-white text-[11px]">${f.feat.name.toUpperCase()}</div>
                            <div class="text-slate-400 text-[10px] leading-tight">
                                ${f.feat.descriptionModels[0].description.substring(0, 90)}...
                            </div>
                        </div>`;
                }
            });
        });
    }

    if (charData.equipment) {
        charData.equipment.forEach(e => {
            equipList.innerHTML += `<li class="flex justify-between border-b border-slate-700/50 py-1 text-[10px]"><span>${e.name}</span><span class="text-theme font-bold">x${e.amount}</span></li>`;
        });
    }
    atualizarRecursosDinamicos();
}

function atualizarRecursosDinamicos() {
    const resourceContainer = document.getElementById('resource-container');
    const existingResources = resourceContainer.querySelectorAll('.dynamic-res');
    existingResources.forEach(r => r.remove());

    if (charData.specialAbilities) {
        charData.specialAbilities.forEach(ability => {
            if (ability.amountsPerLevel && ability.amountsPerLevel.length > 0) {
                const max = ability.amountsPerLevel[ability.amountsPerLevel.length - 1].amount;
                const div = document.createElement('div');
                div.className = 'dynamic-res flex justify-between items-center bg-slate-900/50 p-3 rounded-xl mt-2';
                div.innerHTML = `<span class="text-[10px] font-bold text-slate-400">${ability.name.toUpperCase()}</span><div class="flex gap-1">${Array(parseInt(max)).fill('<input type="checkbox" class="w-3 h-3 accent-theme" checked>').join('')}</div>`;
                resourceContainer.appendChild(div);
            }
        });
    }
}

document.getElementById('generateBtn').addEventListener('click', () => {
    if (!charData) return;
    const doc = new jsPDF();
    const c = currentTheme;
    const isCompact = document.getElementById('compactMode').checked;
    const nivelPersonagem = charData.jobs[0].level || 1;
    const idArquetipoEscolhido = charData.jobs[0].archetypeId;

    doc.setFillColor(c[0], c[1], c[2]);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(charData.name.toUpperCase(), 105, 18, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const raceObj = typeof charData.requiredRace === 'string' ? JSON.parse(charData.requiredRace) : charData.requiredRace;
    doc.text(`${raceObj.name} | Nível ${nivelPersonagem} | Nobre`, 105, 28, { align: 'center' });

    const bonusProf = Math.ceil(1 + (nivelPersonagem / 4));
    const percPassiva = 10 + parseInt(getMod(charData.wisdom.score));
    const statusCombate = [
        { l: "AC", v: "11" },
        { l: "INIC.", v: getMod(charData.dexterity.score) },
        { l: "PROF.", v: `+${bonusProf}` },
        { l: "PERC. P.", v: percPassiva }
    ];

    doc.setFontSize(8);
    let xStatus = 145;
    statusCombate.forEach(s => {
        doc.text(`${s.l}: ${s.v}`, xStatus, 36);
        xStatus += 15;
    });

    let xBox = 15;
    const stats = [
        { n: 'FOR', v: charData.strength.score }, { n: 'DES', v: charData.dexterity.score },
        { n: 'CON', v: charData.constitution.score }, { n: 'INT', v: charData.intelligence.score },
        { n: 'SAB', v: charData.wisdom.score }, { n: 'CAR', v: charData.charisma.score }
    ];
    stats.forEach(s => {
        doc.setDrawColor(c[0], c[1], c[2]);
        doc.roundedRect(xBox, 45, 28, 15, 2, 2, 'D');
        doc.setFontSize(8);
        doc.setTextColor(c[0], c[1], c[2]);
        doc.text(s.n, xBox + 14, 50, { align: 'center' });
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text(`${s.v} (${getMod(s.v)})`, xBox + 14, 56, { align: 'center' });
        xBox += 31;
    });

    let y = 75;

    if (charData.personalityTraits || charData.bonds) {
        doc.setTextColor(c[0], c[1], c[2]);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("PERSONALIDADE E VÍNCULOS", 15, y);
        y += 6;

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80);
        
        const traits = doc.splitTextToSize(`Traços: ${charData.personalityTraits || "---"}`, 180);
        const bonds = doc.splitTextToSize(`Vínculos: ${charData.bonds || "---"}`, 180);
        
        doc.text(traits, 15, y);
        y += (traits.length * 4) + 2;
        doc.text(bonds, 15, y);
        y += (bonds.length * 4) + 6;
    }

    if (charData.about && charData.about.trim() !== "") {
        doc.setTextColor(c[0], c[1], c[2]);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("HISTÓRIA", 15, y);
        y += 5;

        const bioLines = doc.splitTextToSize(charData.about, 175);
        const boxHeight = (bioLines.length * 5) + 6;
        doc.setFillColor(248, 248, 248);
        doc.rect(15, y, 180, boxHeight, 'F');
        doc.setDrawColor(c[0], c[1], c[2]);
        doc.line(15, y, 15, y + boxHeight); 
        
        doc.setTextColor(0);
        doc.setFontSize(9);
        doc.text(bioLines, 19, y + 6);
        y += boxHeight + 10;
    }

    doc.setTextColor(c[0], c[1], c[2]);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("HABILIDADES E CARACTERÍSTICAS", 15, y);
    y += 8;

    const habilidadesUnicas = new Set();
    let allRequiredData = typeof charData.allRequiredClasses === 'string' ? JSON.parse(charData.allRequiredClasses) : charData.allRequiredClasses;

    allRequiredData.jobs.forEach(jobEntry => {
        const job = typeof jobEntry === 'string' ? JSON.parse(jobEntry) : jobEntry;
        let featuresBrutas = [...(job.features || [])];
        if (job.archetypes) {
            job.archetypes.forEach(arch => {
                if (arch.id === idArquetipoEscolhido || arch.name === idArquetipoEscolhido) {
                    if (arch.features) featuresBrutas.push(...arch.features);
                }
            });
        }

        featuresBrutas.forEach(f => {
            const lvlReq = f.feat ? f.feat.requiredLevel || 0 : 0;
            if (f.feat && f.feat.name && !habilidadesUnicas.has(f.feat.name) && lvlReq <= nivelPersonagem) {
                habilidadesUnicas.add(f.feat.name);

                if (y > 270) { doc.addPage(); y = 20; }
                
                doc.setFont("helvetica", "bold");
                doc.setFontSize(10);
                doc.setTextColor(0);
                
                const descRaw = f.feat.descriptionModels[0].description;

                if (isCompact) {
                    const titulo = `• ${f.feat.name.toUpperCase()}: `;
                    doc.setFont("helvetica", "bold");
                    doc.text(titulo, 15, y);

                    const larguraTitulo = doc.getTextWidth(titulo);
                    const resumo = descRaw.split('.')[0] + ".";
                    doc.setFont("helvetica", "normal");
                    
                    const resumoLines = doc.splitTextToSize(resumo, 185 - larguraTitulo);
                    doc.text(resumoLines, 15 + larguraTitulo, y);
                    y += (resumoLines.length * 5) + 2;
                } else {
                    doc.text(f.feat.name.toUpperCase(), 15, y);
                    y += 5;
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(9);
                    const descSplit = doc.splitTextToSize(descRaw, 180);
                    doc.text(descSplit, 15, y);
                    y += (descSplit.length * 5) + 6;
                }
            }
        });
    });

    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`Roll2Paper | ${charData.name} | Gerado em 2026`, 105, 290, { align: 'center' });

    doc.save(`Roll2Paper_${charData.name}.pdf`);
});