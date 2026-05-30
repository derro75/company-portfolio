function loadPDF(pdfFile) {
    document.getElementById('pdf-viewer').innerHTML = `
        <iframe
            src="${pdfFile}"
            width="100%"
            height="800"
            style="border:none;">
        </iframe>
    `;

    document.getElementById('pdf-viewer').scrollIntoView({
        behavior: 'smooth'
    });
}