const { jsPDF } = window.jspdf;
let charData = null;

const fileInput = document.getElementById('fileInput');
const generateBtn = document.getElementById('generateBtn');
const fileNameDisplay = document.getElementById('fileName');

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

    doc.setFillColor(teal[0], teal[1], teal[2]);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text(charData.name.toUpperCase(), 105, 18, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Fighter (Samurai) | Humano | Nível 3", 105, 28, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    const hpMax = charData.baseHp + (3 * 5);
    const statsTop = [
        { l: "HP MAX", v: "24" },
        { l: "AC", v: "11" },
        { l: "INIT", v: "+1" },
        { l: "SPEED", v: "30ft" },
        { l: "PROF. BONUS", v: "+2" }
    ];

    let xBox = 15;
    statsTop.forEach(s => {
        doc.setDrawColor(teal[0], teal[1], teal[2]);
        doc.rect(xBox, 40, 34, 15);
        doc.setFontSize(7);
        doc.text(s.l, xBox + 17, 44, { align: 'center' });
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(s.v, xBox + 17, 51, { align: 'center' });
        xBox += 36;
    });

    y = 65;
    doc.setFontSize(12);
    doc.setTextColor(teal[0], teal[1], teal[2]);
    doc.text("ATRIBUTOS", 15, y);
    
    y += 5;
    const attr = [
        { n: "FOR", s: charData.strength.score, m: "+1" },
        { n: "DES", s: charData.dexterity.score, m: "+3" },
        { n: "CON", s: charData.constitution.score, m: "+1" },
        { n: "INT", s: charData.intelligence.score, m: "0" },
        { n: "SAB", s: charData.wisdom.score, m: "+1" },
        { n: "CAR", s: charData.charisma.score, m: "+1" }
    ];

    let xAttr = 15;
    attr.forEach(a => {
        doc.setDrawColor(200);
        doc.rect(xAttr, y, 28, 12);
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(a.n, xAttr + 14, y + 4, { align: 'center' });
        doc.setTextColor(0);
        doc.setFontSize(10);
        doc.text(`${a.s} (${a.m})`, xAttr + 14, y + 10, { align: 'center' });
        xAttr += 30;
    });

    y += 25;
    doc.setFontSize(12);
    doc.setTextColor(teal[0], teal[1], teal[2]);
    doc.text("PERSONALIDADE E BIOGRAFIA", 15, y);
    doc.setTextColor(0);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    y += 6;
    doc.text(`Alinhamento: ${charData.alignmentName}`, 15, y);
    doc.text(`Ideal: ${charData.ideals}`, 80, y);
    doc.text(`Vínculo: ${charData.bonds}`, 140, y);
    
    y += 6;
    doc.setFillColor(245);
    doc.rect(15, y, 180, 15, 'F');
    doc.text(charData.about, 18, y + 6, { maxWidth: 175 });

    y += 30;
    doc.setFont("helvetica", "bold");
    doc.text("PERÍCIAS (PROFICIENTE)", 15, y);
    doc.text("EQUIPAMENTO", 110, y);
    
    y += 6;
    doc.setFont("helvetica", "normal");
    let skillY = y;
    charData.skills.forEach(s => {
        if(s.proficiencyName === 'FULL') {
            doc.text(`• ${s.typeName.replace('_', ' ')}`, 15, skillY);
            skillY += 5;
        }
    });

    let equipY = y;
    charData.equipment.forEach(e => {
        doc.text(`- ${e.name} (x${e.amount})`, 110, equipY);
        equipY += 5;
    });

    doc.addPage();
    y = 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(teal[0], teal[1], teal[2]);
    doc.text("ARQUÉTIPO: SAMURAI", 15, y);

    y += 10;
    const samuraiClass = JSON.parse(charData.allRequiredClasses.jobs[0]);
    const samuraiFeatures = samuraiClass.archetypes.find(a => a.name === "Samurai").features;

    samuraiFeatures.forEach(feat => {
        if(y > 270) { doc.addPage(); y = 20; }
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(teal[0], teal[1], teal[2]);
        doc.text(feat.feat.name, 15, y);
        
        y += 5;
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0);
        const desc = feat.feat.descriptionModels[0].description;
        const splitDesc = doc.splitTextToSize(desc, 180);
        doc.text(splitDesc, 15, y);
        y += (splitDesc.length * 5) + 5;
    });

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Gerado via Roll2Paper - 2026", 105, 285, { align: 'center' });

    doc.save(`Ficha_${charData.name}.pdf`);
});