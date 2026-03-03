const dropZone = document.querySelector('.drop-zone');

// Impede o comportamento padrão do navegador (que seria abrir o arquivo)
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, e => {
        e.preventDefault();
        e.stopPropagation();
    }, false);
});

// Adiciona efeito visual quando o arquivo está sobre a zona
['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.add('active'); // Adiciona classe de destaque
    }, false);
});

// Remove o efeito visual quando o arquivo sai ou é solto
['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove('active');
    }, false);
});

// Captura o arquivo quando ele é solto na zona
dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0) {
        fileInput.files = files; // Vincula o arquivo arrastado ao input hidden
        handleFileUpload(files[0]); // Chama a função de processamento
    }
});

// Função auxiliar para processar o arquivo (refatore seu código para usá-la)
function handleFileUpload(file) {
    if (!file.name.endsWith('.cah')) {
        alert("Por favor, selecione um arquivo .cah");
        return;
    }

    fileNameDisplay.innerText = file.name;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            charData = JSON.parse(event.target.result);
            generateBtn.disabled = false;
        } catch (err) { 
            alert("Erro ao processar o arquivo JSON."); 
        }
    };
    reader.readAsText(file);
}

// Atualize seu listener antigo para usar a nova função:
fileInput.addEventListener('change', function(e) {
    if (this.files.length > 0) {
        handleFileUpload(this.files[0]);
    }
});