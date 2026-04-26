import { useState, useEffect } from 'react';
import { templates as defaultTemplates } from '../data/templates';

export function useTemplateManager() {
    const [templates, setTemplates] = useState(defaultTemplates);

    // Uygulama açıldığında yükle
    useEffect(() => {
        const savedTemplates = localStorage.getItem('custom_templates');
        if (savedTemplates) {
            const parsed = JSON.parse(savedTemplates);
            // Kayıtlı metinleri (body) koru ama diğer özellikleri koddan al
            const merged = defaultTemplates.map(dt => {
                const saved = parsed.find(st => st.id === dt.id);

                // ÖNEMLİ: Eğer kodda yeni bir placeholder eklediysek ({damagedPart} gibi) 
                // VEYA eski bir satırı ("Servis Takip No") kaldırmak istiyorsak, şablonu yenile.
                const needsRefresh =
                    (dt.body.includes('{damagedPart}') && (!saved || !saved.body.includes('{damagedPart}'))) ||
                    (saved && saved.body.startsWith('Servis Takip No:')) ||
                    ((dt.id === 'liquid' || dt.id === 'unit_replacement') && saved && saved.body.includes('Onarım sonrasında ürününüzde bulunan sorunlar giderilecektir.')) ||
                    (dt.id === 'unauthorized_mod' && saved && saved.body.includes('Yeni gelecek cihaz mevcut ürününüzle aynı olacaktır.')) ||
                    (saved && !saved.body.includes('Troy Mavibahçe Teknik Servis')) ||
                    (dt.id === 'liquid' && saved && saved.body.includes('SIVI TEMASI fiziksel hasar')) ||
                    (dt.id === 'rear_system' && saved && saved.body.includes('kullanıcı kaynaklı ARKA SİSTEM HASARI')) ||
                    (dt.id === 'out_of_warranty' && saved && !saved.body.includes('2 yıllık Apple Sınırlı Garanti süresi sona erdiğinden')) ||
                    ((dt.id === 'airpods_contamination' || dt.id === 'airpods_physical') && saved && !saved.body.includes('{airpodsSide}'));

                return (saved && !needsRefresh) ? { ...dt, body: saved.body } : dt;
            });
            
            // Kullanıcının sıfırdan oluşturduğu şablonları ekle
            const userCreated = parsed.filter(st => st.isCustom);
            setTemplates([...merged, ...userCreated]);
        }
    }, []);

    // Şablonu güncelle ve kaydet
    const updateTemplate = (id, newBody) => {
        const updatedTemplates = templates.map(t =>
            t.id === id ? { ...t, body: newBody } : t
        );
        setTemplates(updatedTemplates);
        localStorage.setItem('custom_templates', JSON.stringify(updatedTemplates));
    };

    // Yeni şablon ekle
    const addTemplate = (newTemplate) => {
        const updatedTemplates = [...templates, { ...newTemplate, id: 'custom_' + Date.now(), isCustom: true }];
        setTemplates(updatedTemplates);
        localStorage.setItem('custom_templates', JSON.stringify(updatedTemplates));
    };

    // Özel şablonu sil
    const deleteTemplate = (id) => {
        const updatedTemplates = templates.filter(t => t.id !== id);
        setTemplates(updatedTemplates);
        localStorage.setItem('custom_templates', JSON.stringify(updatedTemplates));
    };

    // Varsayılanlara dön (Opsiyonel: Bir sorun olursa sıfırlamak için)
    const resetToDefaults = () => {
        setTemplates(defaultTemplates);
        localStorage.removeItem('custom_templates');
    };

    return { templates, updateTemplate, addTemplate, deleteTemplate, resetToDefaults };
}
