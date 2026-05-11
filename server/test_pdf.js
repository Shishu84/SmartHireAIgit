import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

async function testPdf() {
    try {
        // Create a minimal PDF (this is a valid 1-page PDF string)
        const minPdf = `%PDF-1.1\n%¥±ë\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 /MediaBox [0 0 300 144] >>\nendobj\n3 0 obj\n<<  /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >>\nendobj\n5 0 obj\n<< /Length 53 >>\nstream\nBT\n/F1 18 Tf\n0 0 Td\n(Hello World) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000018 00000 n \n0000000069 00000 n \n0000000160 00000 n \n0000000271 00000 n \n0000000359 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n463\n%%EOF`;
        
        fs.writeFileSync('dummy.pdf', minPdf);
        const fileBuffer = fs.readFileSync('dummy.pdf');
        const uint8Array = new Uint8Array(fileBuffer);
        const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
        console.log("PDF Pages:", pdf.numPages);
        const page = await pdf.getPage(1);
        const content = await page.getTextContent();
        console.log("Text Items:", content.items.map(i => i.str));
    } catch (e) {
        console.error("Error reading PDF:", e);
    }
}
testPdf();
