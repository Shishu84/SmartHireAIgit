import fs from "fs";
import axios from "axios";
import FormData from "form-data";

async function testResume() {
    try {
        const dummyPdfPath = "./dummy_resume.pdf";
        fs.writeFileSync(dummyPdfPath, "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n5 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Software Engineer Resume Test Data) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000213 00000 n \n0000000299 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n393\n%%EOF");

        const form = new FormData();
        form.append('resume', fs.createReadStream(dummyPdfPath));

        console.log("Sending request to http://localhost:8000/api/interview/analyze");
        const res = await axios.post("http://localhost:8000/api/interview/analyze", form, {
            headers: form.getHeaders(),
        });
        
        console.log("Success:", res.data);
    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}
testResume();
