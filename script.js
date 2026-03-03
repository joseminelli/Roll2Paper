const { jsPDF } = window.jspdf;
let charData = null;

const fileInput = document.getElementById('fileInput');
const generateBtn = document.getElementById('generateBtn');
const fileNameDisplay = document.getElementById('fileName');

// Função utilitária para calcular modificador de atributo (Regra D&D 5e)
const getMod = (score) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
};

fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    fileNameDisplay.innerText = file.name;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            charData = JSON.parse(event.target.result);
            generateBtn.disabled = false;
        } catch (err) { alert("Erro ao processar o arquivo."); }
    };
    reader.readAsText(file);
});

generateBtn.addEventListener('click', () => {
    if (!charData) return;
    const doc = new jsPDF();
    const teal = [0, 150, 136];
    let y = 45;

    // --- CABEÇALHO ESTILIZADO ---
    doc.setFillColor(teal[0], teal[1], teal[2]);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.text(charData.name.toUpperCase(), 105, 18, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    // Dinâmico: Pega a raça e classe do JSON 
    const raceName = charData.requiredRace ? JSON.parse(charData.requiredRace).name : "Humano";
    const level = charData.jobs[0].level;
    doc.text(`${raceName} | Fighter (Samurai) | Nível ${level}`, 105, 28, { align: 'center' });

    // --- BLOCOS DE STATUS (DINÂMICOS) ---
    doc.setTextColor(0, 0, 0);
    const statsTop = [
        { l: "HP ATUAL", v: charData.hp || "0" },
        { l: "HP MAX", v: "24" }, // Valor do print 
        { l: "AC", v: "11" },     // Valor do print 
        { l: "INICIATIVA", v: "+1" },
        { l: "BÔNUS PROF.", v: "+2" }
    ];

    let xBox = 15;
    statsTop.forEach(s => {
        doc.setDrawColor(teal[0], teal[1], teal[2]);
        doc.setLineWidth(0.5);
        doc.roundedRect(xBox, 45, 34, 18, 2, 2, 'D');
        doc.setFontSize(7);
        doc.text(s.l, xBox + 17, 50, { align: 'center' });
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.text(String(s.v), xBox + 17, 58, { align: 'center' });
        xBox += 36;
    });

    // --- ATRIBUTOS COM CÁLCULO AUTOMÁTICO ---
    y = 75;
    doc.setFontSize(12);
    doc.setTextColor(teal[0], teal[1], teal[2]);
    doc.text("ATRIBUTOS", 15, y);
    
    y += 5;
    const attr = [
        { n: "FOR", s: charData.strength.score },
        { n: "DES", s: charData.dexterity.score },
        { n: "CON", s: charData.constitution.score },
        { n: "INT", s: charData.intelligence.score },
        { n: "SAB", s: charData.wisdom.score },
        { n: "CAR", s: charData.charisma.score }
    ];

    let xAttr = 15;
    attr.forEach(a => {
        doc.setDrawColor(220);
        doc.setFillColor(250);
        doc.roundedRect(xAttr, y, 28, 15, 1, 1, 'FD');
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(a.n, xAttr + 14, y + 5, { align: 'center' });
        doc.setTextColor(0);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`${a.s} (${getMod(a.s)})`, xAttr + 14, y + 11, { align: 'center' });
        xAttr += 30;
    });

    // --- BIO E EQUIPAMENTO (LAYOUT EM COLUNAS) ---
    y += 30;
    doc.setFontSize(12);
    doc.setTextColor(teal[0], teal[1], teal[2]);
    doc.text("PERSONALIDADE", 15, y);
    doc.text("EQUIPAMENTO", 110, y);

    y += 6;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50);
    doc.text(`Ideal: ${charData.ideals}`, 15, y);
    doc.text(`Vínculo: ${charData.bonds}`, 15, y + 5);
    
    // Caixa de Bio estilizada
    doc.setFillColor(248);
    doc.rect(15, y + 10, 85, 25, 'F');
    doc.setDrawColor(teal[0], teal[1], teal[2]);
    doc.line(15, y + 10, 15, y + 35);
    doc.text(charData.about || "Sem biografia.", 18, y + 16, { maxWidth: 80 });

    // Lista de Equipamento
    let equipY = y;
    charData.equipment.forEach(e => {
        doc.text(`- ${e.name} (x${e.amount})`, 110, equipY);
        equipY += 5;
    });

    // --- ARQUÉTIPO (PÁGINA 2) ---
    doc.addPage();
    y = 25;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(teal[0], teal[1], teal[2]);
    doc.text("ARQUÉTIPO: SAMURAI", 15, y);
    doc.line(15, y+2, 80, y+2);

    y += 12;
    const samuraiClass = JSON.parse(charData.allRequiredClasses.jobs[0]);
    const samuraiFeatures = samuraiClass.archetypes.find(a => a.name === "Samurai").features;

    samuraiFeatures.forEach(feat => {
        if(y > 260) { doc.addPage(); y = 25; }
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(teal[0], teal[1], teal[2]);
        doc.text(feat.feat.name.toUpperCase(), 15, y);
        
        y += 6;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        const desc = feat.feat.descriptionModels[0].description;
        const splitDesc = doc.splitTextToSize(desc, 180);
        doc.text(splitDesc, 15, y);
        y += (splitDesc.length * 5) + 8;
    });

    doc.save(`Roll2Paper_${charData.name}.pdf`);
});