import fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';

async function testApi() {
    try {
        // Create a minimal valid PDF
        const minPdf = `%PDF-1.1\n%¥±ë\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 /MediaBox [0 0 300 144] >>\nendobj\n3 0 obj\n<<  /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >>\nendobj\n5 0 obj\n<< /Length 70 >>\nstream\nBT\n/F1 18 Tf\n0 0 Td\n(Software Engineer with 3 years of experience.) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000018 00000 n \n0000000069 00000 n \n0000000160 00000 n \n0000000271 00000 n \n0000000359 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n480\n%%EOF`;
        
        fs.writeFileSync('test_resume.pdf', minPdf);
        
        const form = new FormData();
        form.append('resume', fs.createReadStream('test_resume.pdf'));

        console.log("Sending request to port 8000...");
        let response;
        try {
            response = await axios.post('http://localhost:8000/api/interview/resume', form, {
                headers: form.getHeaders(),
                withCredentials: true
            });
            console.log("Port 8000 success:", response.data);
            return;
        } catch (e) {
            console.log("Port 8000 failed:", e.message);
            if (e.response) { console.log("Response data:", e.response.data); }
        }

        console.log("Sending request to port 6000...");
        try {
            response = await axios.post('http://localhost:6000/api/interview/resume', form, {
                headers: form.getHeaders(),
                withCredentials: true
            });
            console.log("Port 6000 success:", response.data);
        } catch (e) {
            console.log("Port 6000 failed:", e.message);
            if (e.response) {
                console.log("Response data:", e.response.data);
            }
        }
        
    } catch (err) {
        console.error("Test failed:", err);
    }
}

testApi();
