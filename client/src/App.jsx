import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SettingsModal from './components/SettingsModal'
import { useTemplateManager } from './hooks/useTemplateManager'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './components/Login'

const API_BASE_URL = ''

function MainApp() {
  const { templates, updateTemplate, addTemplate, deleteTemplate, resetToDefaults } = useTemplateManager()
  const { logout, authenticatedFetch, user } = useAuth()
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cost: '',
    serviceNo: '',
    damagedPart: '',
    airpodsSide: 'Kulaklık Tekinin',
    damageReason: '',
    defectivePart: ''
  })
  
  const [messageBody, setMessageBody] = useState('')
  const [status, setStatus] = useState({ type: '', msg: '' })
  const [sending, setSending] = useState(false)

  // Settings State
  const [showSettings, setShowSettings] = useState(false)
  const [emailSettings, setEmailSettings] = useState(() => {
    const saved = localStorage.getItem('email_settings')
    const defaults = {
      host: 'smtp.office365.com',
      port: '587',
      incomingHost: 'outlook.office365.com',
      incomingPort: '993',
      user: 'metehan.ay@artitroy.com',
      pass: 'Mete6han.ay88'
    }
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults
  })

  // Şablon seçildiğinde body'yi yükle
  useEffect(() => {
    if (selectedTemplate) {
      // Şablondaki ham metni, verilerle doldurarak göster
      updateMessageBody(formData)
    }
  }, [selectedTemplate])

  // Form verileri değişince mesajı güncelle
  useEffect(() => {
    if (selectedTemplate) {
      updateMessageBody(formData)
    }
  }, [formData])

  const updateMessageBody = (data) => {
    if (!selectedTemplate) return
    if (selectedTemplate.id === 'history_resend') {
      setMessageBody(data.historyBody || '')
      return
    }
    let text = selectedTemplate.body
    text = text.replace(/{customerName}/g, data.name || '[Müşteri Adı]')
    text = text.replace(/{cost}/g, data.cost || '.....')
    text = text.replace(/{serviceNo}/g, data.serviceNo || '.....')
    text = text.replace(/{damagedPart}/g, data.damagedPart || '[Hasarlı Parça Bilgisi]')
    text = text.replace(/{defectivePart}/g, data.defectivePart || '[Arızalı Parça Bilgisi]')
    text = text.replace(/{airpodsSide}/g, data.airpodsSide || 'Kulaklık Tekinin')
    text = text.replace(/{damageReason}/g, data.damageReason || '')
    
    if (selectedTemplate.requiresDamageReason && !text.includes('{damageReason}') && data.damageReason) {
      text += `\n\nHasar Açıklaması / Tanı:\n${data.damageReason}`
    }

    if (selectedTemplate.requiresDamagedPart && !text.includes('{damagedPart}') && data.damagedPart) {
      text += `\n\nHasarlı Parça Bilgisi: ${data.damagedPart}`
    }

    if (selectedTemplate.requiresDefectivePart && !text.includes('{defectivePart}') && data.defectivePart) {
      text += `\n\nArızalı Parça Bilgisi: ${data.defectivePart}`
    }
    
    setMessageBody(text)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Şablonu Güncelleme Fonksiyonu
  const handleSaveTemplate = () => {
    if (!selectedTemplate) return;

    // Şu an ekranda görünen metni (placeholders doldurulmuş olsa bile)
    // geri 'placeholder'lı hale getirmek zor olabilir.
    // BU NEDENLE: Kullanıcıya "Şablonu Düzenle" diye ayrı bir mod açmak en doğrusudur.
    // Ancak pratik olması için şöyle yapacağız:
    // Kullanıcıya uyarı verip, şu anki metni bu şablonun YENİ STANDARDI yapmak istediğinden emin mi soracağız.
    // DİKKAT: Kullanıcı 'Ahmet Bey' yazılıyken kaydederse, şablon artık hep 'Ahmet Bey' ile başlar.
    // Bunu engellemek için metin içindeki değişkenleri ({customerName} vb.) korumasını istemeliyiz.

    // Basit bir yöntem: Mesaj kutusunu direkt editlemek yerine,
    // "Düzenle" butonuna basınca RAW (Ham) template'i gösteren bir popup açabiliriz.
    // Veya: Kullanıcıya güvenip "Lütfen {customerName} gibi alanları silmeyin" diyebiliriz.

    // Şimdilik: Mevcut metni (değişkenler doldurulmuş haliyle değil, şablon haliyle) düzenletelim.
    // Bunu yapmak için "Düzenleme Modu" ekleyelim.
  }

  // Basitleştirilmiş Yaklaşım:
  // Şablonu düzenlemek için ayrı bir textarea koyalım veya
  // "Şablonu Özelleştir" diye butona basınca current template body'sini editlemeye izin verelim.

  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [templateEditValue, setTemplateEditValue] = useState('');

  const startEditingTemplate = () => {
    setIsEditingTemplate(true);
    setTemplateEditValue(selectedTemplate.body);
  };

  const saveTemplateChanges = () => {
    updateTemplate(selectedTemplate.id, templateEditValue);

    // Seçili şablonu da güncelle ki arayüz yenilensin
    const updated = { ...selectedTemplate, body: templateEditValue };
    setSelectedTemplate(updated);

    setIsEditingTemplate(false);
    setStatus({ type: 'success', msg: 'Şablon kalıcı olarak güncellendi!' });
    setTimeout(() => setStatus({ type: '', msg: '' }), 3000);
  };

  const handleSaveSettings = (newSettings) => {
    setEmailSettings(newSettings)
    localStorage.setItem('email_settings', JSON.stringify(newSettings))
    setStatus({ type: 'success', msg: 'Ayarlar kaydedildi.' })
    setTimeout(() => setStatus({ type: '', msg: '' }), 3000)
  }

  const handleSend = async () => {
    if (!emailSettings.user || !emailSettings.pass) {
      setStatus({ type: 'error', msg: 'Lütfen önce sağ üstteki Ayarlar menüsünden e-posta bilgilerinizi girin.' })
      return
    }

    if (!formData.email) {
      setStatus({ type: 'error', msg: 'Lütfen müşteri e-posta adresini girin.' })
      return
    }

    setSending(true)
    setStatus({ type: '', msg: '' })

    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: formData.email,
          subject: selectedTemplate.id === 'history_resend' ? formData.historySubject : selectedTemplate.subject.replace('{serviceNo}', formData.serviceNo || ''),
          text: messageBody,
          auth: emailSettings
        })
      })

      const result = await response.json()
      if (result.success) {
        setStatus({ type: 'success', msg: 'E-posta başarıyla gönderildi!' })
        // Müşteri verilerini sıfırla
        setFormData({
          name: '', email: '', cost: '', serviceNo: '', 
          damagedPart: '', airpodsSide: 'Kulaklık Tekinin', damageReason: '',
          defectivePart: ''
        })
      } else {
        setStatus({ type: 'error', msg: 'Hata: ' + (result.error || result.message) })
      }
    } catch (error) {
      setStatus({ type: 'error', msg: 'Sunucuya bağlanılamadı. Backend çalışıyor mu?' })
    } finally {
      setSending(false)
    }
  }


  return (
    <div className="container" style={{ maxWidth: '1400px', position: 'relative' }}>
      
      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onSave={handleSaveSettings}
          initialSettings={emailSettings}
          templates={templates}
          addTemplate={addTemplate}
          deleteTemplate={deleteTemplate}
        />
      )}

      <AnimatePresence>
        {!selectedTemplate ? (
          <motion.div
            key="home-screen"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {/* Header Buttons */}
            <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '13px', color: '#86868b', marginBottom: '4px' }}>Hoş geldin, <strong>{user?.name}</strong></span>
              <button className="settings-btn" onClick={() => setShowSettings(true)} style={{ position: 'relative', top: '0', right: '0', width: '120px', textAlign: 'center' }}>
                ⚙️ Ayarlar
              </button>
              <button className="settings-btn" onClick={logout} style={{ position: 'relative', top: '0', right: '0', width: '120px', textAlign: 'center', color: '#d70015', background: '#fff1f0', border: '1px solid #ffa39e' }}>
                Çıkış Yap
              </button>
            </div>

            <header className="header">
              <h1>Servis Bildirim Asistanı</h1>
              <p>Müşteriye gönderilecek bildirim türünü seçin.</p>
            </header>

            <div className="grid">
              {templates.map(template => (
                <motion.div
                  key={template.id}
                  className="card"
                  whileHover={{ y: -5, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedTemplate(template);
                    setIsEditingTemplate(false);
                  }}
                >
                  <div className="card-icon">{template.icon}</div>
                  <h3 className="card-title">{template.title}</h3>
                  <p className="card-desc">{template.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="editor-screen"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25, ease: "backOut" }}
          >
            <button className="back-btn" onClick={() => setSelectedTemplate(null)}>
              ← Geri Dön
            </button>

            <div className="editor-container">
            {/* Sol Panel: Veri Girişi */}
            <div className="panel" style={{ flex: '0 0 400px' }}>
              <h2>Bilgiler</h2>
              <br />

              {['general_info', 'history_resend'].includes(selectedTemplate.id) ? (
                <div className="form-group">
                  <label>Alıcı E-posta (Birden fazla ise virgülle ayırın)</label>
                  <input
                    type="text"
                    name="email"
                    placeholder="ornek@icloud.com, ikinci@mail.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label>Müşteri E-posta (Zorunlu)</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="ornek@icloud.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {!['general_info', 'history_resend'].includes(selectedTemplate.id) && (
                <>
                  <div className="form-group">
                    <label>Müşteri Adı Soyadı</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Ad Soyad"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Servis / Takip No</label>
                    <input
                      type="text"
                      name="serviceNo"
                      placeholder="R123456789"
                      value={formData.serviceNo}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}

              {(['repair_requote', 'unit_replacement', 'rear_system', 'airpods_physical'].includes(selectedTemplate.id) || selectedTemplate.requiresDamagedPart) && (
                <div className="form-group">
                  <label>Hasarlı Parça Bilgisi</label>
                  <input
                    type="text"
                    name="damagedPart"
                    placeholder="Örn: Anakart Hasarı"
                    value={formData.damagedPart}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              {selectedTemplate.requiresDefectivePart && (
                <div className="form-group">
                  <label>Arızalı Parça Bilgisi</label>
                  <input
                    type="text"
                    name="defectivePart"
                    placeholder="Örn: Batarya Arızası"
                    value={formData.defectivePart}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {selectedTemplate.requiresDamageReason && (
                <div className="form-group">
                  <label>Hasar Açıklaması / Tanı</label>
                  <textarea
                    name="damageReason"
                    placeholder="Müşteriye iletilecek özel hasar veya tanı notu..."
                    value={formData.damageReason}
                    onChange={handleInputChange}
                    style={{ minHeight: '80px', padding: '10px', borderRadius: '8px', border: '1px solid #d2d2d7', width: '100%', resize: 'vertical' }}
                  />
                </div>
              )}

              {(selectedTemplate.id === 'airpods_contamination' || selectedTemplate.id === 'airpods_physical') && (
                <div className="form-group">
                  <label>Kulaklık Adeti</label>
                  <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="airpodsSide"
                        value="Kulaklık Tekinin"
                        checked={formData.airpodsSide === 'Kulaklık Tekinin'}
                        onChange={handleInputChange}
                      />
                      Tekli
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="airpodsSide"
                        value="Her İki Kulaklığın"
                        checked={formData.airpodsSide === 'Her İki Kulaklığın'}
                        onChange={handleInputChange}
                      />
                      Çiftli
                    </label>
                  </div>
                </div>
              )}

              {!['general_info', 'history_resend'].includes(selectedTemplate.id) && (
                <div className="form-group">
                  <label>Ücret Tutarı (TL)</label>
                  <input
                    type="text"
                    name="cost"
                    placeholder="0.00"
                    value={formData.cost}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {selectedTemplate.id === 'history_resend' && (
                <>
                  <div className="form-group">
                    <label>E-Posta Konusu</label>
                    <input
                      type="text"
                      name="historySubject"
                      value={formData.historySubject || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Mesaj İçeriği</label>
                    <textarea
                      name="historyBody"
                      value={formData.historyBody || ''}
                      onChange={handleInputChange}
                      style={{ minHeight: '200px', padding: '10px', borderRadius: '8px', border: '1px solid #d2d2d7', width: '100%', resize: 'vertical' }}
                    />
                  </div>
                </>
              )}

              {selectedTemplate.id === 'general_info' && (
                <div className="form-group">
                  <label>Bilgilendirme Mesajı / Notu</label>
                  <textarea
                    name="damageReason"
                    placeholder="Müşteriye veya gruplara iletilecek mesajınızı buraya yazın..."
                    value={formData.damageReason}
                    onChange={handleInputChange}
                    style={{ minHeight: '120px', padding: '10px', borderRadius: '8px', border: '1px solid #d2d2d7', width: '100%', resize: 'vertical' }}
                  />
                </div>
              )}

              <button
                className="send-btn"
                onClick={handleSend}
                disabled={sending}
              >
                {sending ? 'Gönderiliyor...' : 'E-postayı Gönder'}
              </button>

              {status.msg && (
                <div className={`status-message ${status.type}`}>
                  {status.msg}
                </div>
              )}
            </div>

            {/* Sağ Panel: Önizleme */}
            <div className="panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>{isEditingTemplate ? 'Şablonu Düzenle' : 'Önizleme'}</h2>

                {!isEditingTemplate ? (
                  <button
                    onClick={startEditingTemplate}
                    style={{ fontSize: '13px', color: '#0071e3', background: '#f5f5f7', padding: '6px 12px', borderRadius: '6px' }}
                  >
                    ✏️ Şablonu Kalıcı Düzenle
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setIsEditingTemplate(false)}
                      style={{ fontSize: '13px', background: '#f5f5f7', padding: '6px 12px', borderRadius: '6px' }}
                    >
                      İptal
                    </button>
                    <button
                      onClick={saveTemplateChanges}
                      style={{ fontSize: '13px', color: 'white', background: '#2e7d32', padding: '6px 12px', borderRadius: '6px' }}
                    >
                      Kaydet
                    </button>
                  </div>
                )}
              </div>

              {isEditingTemplate ? (
                <>
                  <p style={{ color: '#c62828', fontSize: '13px', marginBottom: '1rem', background: '#ffebee', padding: '8px', borderRadius: '6px' }}>
                    <strong>Dikkat:</strong> <code>{'{customerName}'}</code>, <code>{'{cost}'}</code> gibi değişkenleri silmeyin, yoksa otomatik doldurma çalışmaz.
                  </p>
                  <textarea
                    value={templateEditValue}
                    onChange={(e) => setTemplateEditValue(e.target.value)}
                    style={{ background: '#fffefb', borderColor: '#e6a800' }}
                  />
                </>
              ) : (
                <>
                  <p style={{ color: '#86868b', fontSize: '14px', marginBottom: '1rem' }}>
                    Bu metin müşteriye gönderilecektir.
                  </p>
                  <textarea
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                  />
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Yükleniyor...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return <MainApp />;
}

export default App
