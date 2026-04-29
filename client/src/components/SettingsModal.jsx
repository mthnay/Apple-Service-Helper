
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function SettingsModal({ onClose, onSave, initialSettings, templates, addTemplate, deleteTemplate }) {
    const { authenticatedFetch } = useAuth();
    const [settings, setSettings] = useState(initialSettings || {
        user: '', pass: ''
    });

    const [newTemplate, setNewTemplate] = useState({
        title: '', subject: '', body: '', icon: '📝', description: 'Özel Bildirim Şablonu', requiresDamageReason: false, requiresDamagedPart: false
    });

    // File Upload State
    const [file, setFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [attachmentExists, setAttachmentExists] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_URL || '';

    useEffect(() => {
        // Check if attachment exists on load
        authenticatedFetch(`${API_BASE_URL}/check-attachment`)
            .then(res => res.json())
            .then(data => setAttachmentExists(data.exists));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleTemplateChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewTemplate(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleCreateTemplate = () => {
        if (!newTemplate.title || !newTemplate.body) return;
        addTemplate(newTemplate);
        setNewTemplate({ title: '', subject: '', body: '', icon: '📝', description: 'Özel Bildirim Şablonu', requiresDamageReason: false, requiresDamagedPart: false });
        setUploadStatus('✅ Şablon eklendi!');
        setTimeout(() => setUploadStatus(''), 2000);
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploadStatus('Yükleniyor...');

        try {
            const res = await authenticatedFetch(`${API_BASE_URL}/upload-attachment`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                setUploadStatus('✅ Dosya kaydedildi! Her maile eklenecek.');
                setAttachmentExists(true);
                setFile(null);
            } else {
                setUploadStatus('❌ Hata: ' + data.message);
            }
        } catch (err) {
            setUploadStatus('❌ Sunucu hatası: ' + err.message);
        }
    };

    const handleDeleteAttachment = async () => {
        try {
            await authenticatedFetch(`${API_BASE_URL}/delete-attachment`, { method: 'DELETE' });
            setAttachmentExists(false);
            setUploadStatus('🗑️ Dosya kaldırıldı.');
        } catch (err) {
            console.error(err);
        }
    };

    const [testStatus, setTestStatus] = useState({ type: '', msg: '' });

    const handleTestConnection = async () => {
        setTestStatus({ type: 'info', msg: 'Test ediliyor...' });
        try {
            const res = await authenticatedFetch(`${API_BASE_URL}/test-connection`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ auth: settings })
            });
            const data = await res.json();
            if (data.success) {
                setTestStatus({ type: 'success', msg: '✅ ' + data.message });
            } else {
                setTestStatus({ type: 'error', msg: '❌ ' + (data.error || data.message) });
            }
        } catch (err) {
            setTestStatus({ type: 'error', msg: '❌ Sunucuya bağlanılamadı.' });
        }
    };

    const handleSave = () => {
        onSave(settings);
        onClose();
    };

    // Password Change State
    const [pwdData, setPwdData] = useState({ current: '', new: '' });
    const [pwdStatus, setPwdStatus] = useState({ type: '', msg: '' });

    const handlePasswordChange = async () => {
        if (!pwdData.current || !pwdData.new) return;
        setPwdStatus({ type: 'info', msg: 'Güncelleniyor...' });
        try {
            const res = await authenticatedFetch('/api/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword: pwdData.current, newPassword: pwdData.new })
            });
            const data = await res.json();
            if (data.success) {
                setPwdStatus({ type: 'success', msg: '✅ Şifre güncellendi.' });
                setPwdData({ current: '', new: '' });
            } else {
                setPwdStatus({ type: 'error', msg: '❌ ' + data.message });
            }
        } catch (err) {
            setPwdStatus({ type: 'error', msg: '❌ Hata oluştu.' });
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="modal-header">
                    <h3>Sistem Ayarları</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">

                    {/* EKLENTİ BÖLÜMÜ - EN ÜSTE */}
                    <div style={{ background: '#f5f5f7', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#1d1d1f' }}>📎 Varsayılan Posta Eki</h4>
                        <p style={{ fontSize: '13px', color: '#86868b', marginBottom: '1rem' }}>
                            Buraya yüklediğiniz PDF dosyası (örn: Havale Bilgileri), gönderilen <strong>her e-postaya</strong> otomatik olarak eklenecektir.
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            {!attachmentExists ? (
                                <>
                                    <input type="file" accept="application/pdf" onChange={handleFileChange} />
                                    <button
                                        onClick={handleUpload}
                                        disabled={!file}
                                        style={{
                                            background: '#0071e3', color: 'white', border: 'none',
                                            padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                                            opacity: !file ? 0.5 : 1
                                        }}>
                                        Yükle
                                    </button>
                                </>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                                    <span style={{ color: '#2e7d32', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        ✅ "Bilgilendirme.pdf" sistemde yüklü.
                                    </span>
                                    <button
                                        onClick={handleDeleteAttachment}
                                        style={{
                                            background: '#fee', color: '#d32f2f', border: '1px solid #ffcdd2',
                                            padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', marginLeft: 'auto'
                                        }}>
                                        Kaldır
                                    </button>
                                </div>
                            )}
                        </div>
                        {uploadStatus && <p style={{ fontSize: '12px', marginTop: '0.5rem', color: '#0071e3' }}>{uploadStatus}</p>}
                    </div>

                    <hr style={{ margin: '2rem 0', border: 0, borderTop: '1px solid #eee' }} />

                    {/* ŞİFRE DEĞİŞTİRME */}
                    <div style={{ background: '#fff', border: '1px solid #d2d2d7', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#1d1d1f' }}>🔐 Giriş Şifresini Değiştir</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '10px' }}>
                            <div>
                                <label style={{ fontSize: '11px' }}>Mevcut Şifre</label>
                                <input
                                    type="password"
                                    placeholder="••••••"
                                    value={pwdData.current}
                                    onChange={(e) => setPwdData({ ...pwdData, current: e.target.value })}
                                    style={{ fontSize: '14px', padding: '8px' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '11px' }}>Yeni Şifre</label>
                                <input
                                    type="password"
                                    placeholder="••••••"
                                    value={pwdData.new}
                                    onChange={(e) => setPwdData({ ...pwdData, new: e.target.value })}
                                    style={{ fontSize: '14px', padding: '8px' }}
                                />
                            </div>
                        </div>
                        {pwdStatus.msg && (
                            <p style={{
                                fontSize: '12px',
                                marginTop: '8px',
                                color: pwdStatus.type === 'error' ? '#d32f2f' : '#2e7d32'
                            }}>
                                {pwdStatus.msg}
                            </p>
                        )}
                        <button
                            onClick={handlePasswordChange}
                            style={{
                                marginTop: '12px',
                                background: '#1d1d1f',
                                color: 'white',
                                border: 'none',
                                padding: '6px 16px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px'
                            }}>
                            Şifreyi Güncelle
                        </button>
                    </div>

                    <hr style={{ margin: '2rem 0', border: 0, borderTop: '1px solid #eee' }} />

                    <p className="description" style={{ color: '#0071e3', fontWeight: '500' }}>
                        Microsoft Exchange Hesap Bilgilerinizi Girin
                        <br />
                        <span style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}>
                            * Bu sistem sadece Microsoft (Office365 / Exchange) altyapısı ile çalışacak şekilde yapılandırılmıştır.
                        </span>
                    </p>

                    <div className="form-group">
                        <label>Exchange Hesabı</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <input
                                type="email"
                                name="user"
                                placeholder="E-posta Adresi"
                                value={settings.user}
                                onChange={handleChange}
                            />
                            <input
                                type="password"
                                name="pass"
                                placeholder="Şifre"
                                value={settings.pass}
                                onChange={handleChange}
                            />
                        </div>
                    </div>


                    <div className="form-group" style={{ marginTop: '2rem' }}>
                        <h4 style={{ marginBottom: '1rem', fontSize: '14px', color: '#0071e3' }}>ÖZEL ŞABLON OLUŞTUR</h4>
                        <div style={{ background: '#f5f5f7', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '12px' }}>Şablon Başlığı</label>
                                    <input type="text" name="title" value={newTemplate.title} onChange={handleTemplateChange} placeholder="Örn: VIP Müşteri İndirimi" />
                                </div>
                                <div>
                                    <label style={{ fontSize: '12px' }}>E-Posta Konusu</label>
                                    <input type="text" name="subject" value={newTemplate.subject} onChange={handleTemplateChange} placeholder="Örn: Özel İndirim Fırsatı" />
                                </div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '12px' }}>Mesaj İçeriği</label>
                                <textarea name="body" value={newTemplate.body} onChange={handleTemplateChange} rows="3" placeholder="Sayın {customerName}, size özel..." style={{ padding: '8px', width: '100%', borderRadius: '6px', border: '1px solid #d2d2d7' }}></textarea>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: '#333' }}>
                                    <input
                                        type="checkbox"
                                        name="requiresDamageReason"
                                        checked={newTemplate.requiresDamageReason}
                                        onChange={handleTemplateChange}
                                        style={{ width: '16px', height: '16px' }}
                                    />
                                    'Hasar Açıklaması / Tanı' sorulsun
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: '#333' }}>
                                    <input
                                        type="checkbox"
                                        name="requiresDamagedPart"
                                        checked={newTemplate.requiresDamagedPart}
                                        onChange={handleTemplateChange}
                                        style={{ width: '16px', height: '16px' }}
                                    />
                                    'Hasarlı Parça Bilgisi' sorulsun
                                </label>
                            </div>
                            <button onClick={handleCreateTemplate} style={{ marginTop: '1rem', background: '#0071e3', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Şablonu Ekle</button>
                        </div>
                        
                        {templates && templates.filter(t => t.isCustom).length > 0 && (
                            <div style={{ marginTop: '1rem' }}>
                                <h5 style={{ fontSize: '13px', color: '#333', marginBottom: '0.5rem' }}>Özel Şablonlarınız:</h5>
                                {templates.filter(t => t.isCustom).map(t => (
                                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', border: '1px solid #ddd', padding: '8px 12px', borderRadius: '6px', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '13px', fontWeight: '500' }}>{t.title}</span>
                                        <button onClick={() => deleteTemplate(t.id)} style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', fontSize: '12px' }}>Sil</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {testStatus.msg && (
                        <div style={{
                            marginTop: '1rem',
                            padding: '10px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            backgroundColor: testStatus.type === 'error' ? '#ffebee' : testStatus.type === 'success' ? '#e8f5e9' : '#e3f2fd',
                            color: testStatus.type === 'error' ? '#c62828' : testStatus.type === 'success' ? '#2e7d32' : '#0277bd',
                            border: `1px solid ${testStatus.type === 'error' ? '#ffcdd2' : testStatus.type === 'success' ? '#c8e6c9' : '#b3e5fc'}`
                        }}>
                            {testStatus.msg}
                        </div>
                    )}

                </div>

                <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                        className="test-btn"
                        onClick={handleTestConnection}
                        style={{
                            background: '#f5f5f7', color: '#1d1d1f', border: '1px solid #d2d2d7',
                            padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
                        }}>
                        Bağlantıyı Test Et
                    </button>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="cancel-btn" onClick={onClose}>İptal</button>
                        <button className="save-btn" onClick={handleSave}>Kaydet</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
