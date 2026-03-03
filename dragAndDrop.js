const dropZone = document.querySelector('.drop-zone');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, e => {
        e.preventDefault();
        e.stopPropagation();
    }, false);
});

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.add('active');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove('active');
    }, false);
});

dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0) {
        fileInput.files = files;
        handleFileUpload(files[0]);
    }
});

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

fileInput.addEventListener('change', function(e) {
    if (this.files.length > 0) {
        handleFileUpload(this.files[0]);
    }
});