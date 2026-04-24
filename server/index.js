const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Ön yüz (React) dosyalarını sunma
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// Dosya Yükleme Ayarları
const uploadDir = process.env.USER_DATA_PATH
    ? path.join(process.env.USER_DATA_PATH, 'uploads')
    : path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
console.log('Upload directory:', uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Her zaman aynı isimle kaydedelim ki üzerine yazsın (tek dosya mantığı)
        // Ya da orijinal ismini saklayıp bir config dosyasında tutabiliriz.
        // Basitlik için: 'attachment.pdf' olarak kaydediyoruz.
        cb(null, 'generic_attachment.pdf');
    }
});

const upload = multer({ storage: storage });

// Dosya Yükleme Endpoint'i
app.post('/upload-attachment', upload.single('file'), (req, res) => {
    console.log('Upload request received');
    if (!req.file) {
        console.log('No file in request');
        return res.status(400).json({ success: false, message: 'Dosya seçilmedi.' });
    }
    console.log('File uploaded:', req.file.path);
    res.json({ success: true, message: 'Dosya başarıyla yüklendi ve varsayılan olarak ayarlandı.' });
});

// Kayıtlı dosya bilgisini kontrol etme
app.get('/check-attachment', (req, res) => {
    const defaultPath = path.join(__dirname, 'assets', 'Bilgilendirme.pdf');
    const uploadedPath = path.join(uploadDir, 'generic_attachment.pdf');

    if (fs.existsSync(defaultPath) || fs.existsSync(uploadedPath)) {
        res.json({ exists: true, name: 'Bilgilendirme.pdf' });
    } else {
        res.json({ exists: false });
    }
});

// Dosya Silme
app.delete('/delete-attachment', (req, res) => {
    const filePath = path.join(uploadDir, 'generic_attachment.pdf');
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ success: true, message: 'Dosya silindi.' });
    } else {
        res.json({ success: false, message: 'Silinecek dosya bulunamadı.' });
    }
});

// SMTP Bağlantı Testi
app.post('/test-connection', async (req, res) => {
    const { auth } = req.body;

    if (!auth || !auth.user || !auth.pass) {
        return res.status(400).json({
            success: false,
            message: 'Mail ayarları eksik.'
        });
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
            user: auth.user,
            pass: auth.pass,
        },
        tls: { ciphers: 'SSLv3', rejectUnauthorized: false }
    });

    try {
        await transporter.verify();
        res.status(200).json({ success: true, message: 'Bağlantı başarılı! Ayarlar doğru.' });
    } catch (error) {
        console.error('Connection test failed:', error);
        res.status(500).json({ success: false, message: 'Bağlantı başarısız.', error: error.message });
    }
});

// E-posta gönderme endpoint'i
app.post('/send-email', async (req, res) => {
    const { to, subject, text, auth } = req.body;

    if (!auth || !auth.user || !auth.pass) {
        return res.status(400).json({
            success: false,
            message: 'Mail ayarları eksik. Lütfen ayarlardan giriş yapın.'
        });
    }

    // SMTP Ayarları (Microsoft Exchange)
    const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
            user: auth.user,
            pass: auth.pass,
        },
        tls: { ciphers: 'SSLv3', rejectUnauthorized: false }
    });

    // Ekleri hazırla
    const attachments = [];

    // Önce assets klasöründeki sabit/varsayılan dosyaya bak
    const defaultAttachmentPath = path.join(__dirname, 'assets', 'Bilgilendirme.pdf');
    const uploadedAttachmentPath = path.join(uploadDir, 'generic_attachment.pdf');

    if (fs.existsSync(defaultAttachmentPath)) {
        attachments.push({
            filename: 'Bilgilendirme.pdf',
            path: defaultAttachmentPath
        });
    } else if (fs.existsSync(uploadedAttachmentPath)) {
        attachments.push({
            filename: 'Bilgilendirme.pdf',
            path: uploadedAttachmentPath
        });
    }

    // İmza logosunu ekle (eğer varsa)
    const logoPath = path.join(__dirname, 'assets', 'signature_logo.png');
    if (fs.existsSync(logoPath)) {
        attachments.push({
            filename: 'signature_logo.png',
            path: logoPath,
            cid: 'signature_logo' // HTML içinde kullanmak için
        });
    }

    const mailOptions = {
        from: auth.user,
        to: to,
        cc: 'servis.mavibahce@artitroy.com',
        subject: subject,
        text: text, // Eski sistemler için text formatı kalsın
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                ${text.replace(/\n/g, '<br>')}
                <br><br>
                <img src="cid:signature_logo" width="150" style="display: block; margin-top: 20px;" alt="Troy Logo">
            </div>
        `,
        attachments: attachments
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);

        // No history storage requested

        res.status(200).json({ success: true, message: 'Email başarıyla gönderildi!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Email gönderilirken hata oluştu.', error: error.message });
    }
});


app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

// React Router için tüm istekleri index.html'e yönlendir (API rotaları hariç)
app.get(/^.*$/, (req, res) => {
    if (fs.existsSync(path.join(clientDistPath, 'index.html'))) {
        res.sendFile(path.join(clientDistPath, 'index.html'));
    } else {
        res.send('Frontend build not found. Please run build first.');
    }
});
