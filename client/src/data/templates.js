const baseTemplate = `Sayın {customerName},

Yetkili servis sağlayıcısı olarak yaptığımız Görsel/Mekanik incelemesi sonucunda ürününüzde {damageInfo} tespit edilmiştir.

Bu durumda ürününüz Apple Sınırlı Garantisi kapsamında değerlendirilememektedir.

Ürününüzde yaşadığınız sorunları Garanti Dışı (Kapsamda Değil) {repairType} ile giderebiliriz. Üründe bulunan {damageContext} sorunu için {partName} Garanti dışında değişim ücreti {cost} TL KDV Dahildir.

{resultMessage}

Yeniden fiyat teklifinin geçerlilik süresi 3 iş günü olup, müşteri tarafından onaylanması ve ödemenin yapılması durumunda onarım işlemlerine başlanabilecektir. Onay alınamadığı durumlarda servis süreci sonlandırılacaktır.

Apple fiyatlarda değişiklik yapma hakkını saklı tutar.

Ödeme işlemine ait dekont beklenmektedir. Açıklama kısmına servis numarasının ({serviceNo}) yazılması gerekmektedir.

Sorularınız için Apple Desteğe başvurun 0216 282 15 11

Saygılarımızla,
Troy Mavibahçe Teknik Servis / Apple Premium Partner
Apple Yetkili Servis Sağlayıcısı / Apple Authorized Service Provider
www.troyestore.com
Troy bir Artı Bilgisayar A.Ş. Markasıdır.`;

const formatTemplate = (damageInfo, repairType, damageContext, partName, resultMessage = 'Onarım sonrasında ürününüzde bulunan sorunlar giderilecektir.') => {
    return baseTemplate
        .replace('{damageInfo}', damageInfo)
        .replace('{repairType}', repairType) // e.g., 'onarım' or 'Bütün Birim Değişimi'
        .replace('{damageContext}', damageContext)
        .replace('{partName}', partName)
        .replace('{resultMessage}', resultMessage);
};

export const templates = [
    {
        id: 'liquid',
        title: 'Sıvı Teması',
        icon: '💧',
        description: 'Cihazın içine sıvı girmesi.',
        subject: '{serviceNo}',
        body: formatTemplate(
            'kullanıcı kaynaklı SIVI TEMASI hasarı',
            'BÜTÜN BİRİM DEĞİŞİMİ',
            'sıvı teması',
            'Cihazın',
            'Yeni gelecek cihaz mevcut ürününüzle aynı olacaktır.'
        )
    },
    {
        id: 'unit_replacement',
        title: 'Cihaz Değişimi (WUR)',
        icon: '🔄',
        description: 'Cihazın tamamen değişmesi durumu.',
        subject: '{serviceNo}',
        body: formatTemplate(
            '{damagedPart}',
            'BÜTÜN BİRİM DEĞİŞİMİ',
            'onarılamaz donanım',
            'Cihazın',
            'Yeni gelecek cihaz mevcut ürününüzle aynı olacaktır.'
        )
    },
    {
        id: 'screen',
        title: 'Ekran Kırığı / Hasarı',
        icon: '📱',
        description: 'Ekran camında çatlak veya hasar.',
        subject: '{serviceNo}',
        body: formatTemplate(
            'kullanıcı kaynaklı EKRAN HASARI (Kırık/Çatlak) fiziksel hasar',
            'onarım',
            'görüntü/dokunmatik',
            'Ekran Modülünün'
        )
    },
    {
        id: 'bent_enclosure',
        title: 'Kasa Eğrilmesi',
        icon: '📐',
        description: 'Cihaz kasasında bükülme.',
        subject: '{serviceNo}',
        body: formatTemplate(
            'kullanıcı kaynaklı KASA EĞRİLMESİ fiziksel hasar',
            'onarım',
            'yapısal bütünlük',
            'Arka Sistem (Kasa) parçasının'
        )
    },
    {
        id: 'dented_enclosure',
        title: 'Kasa Göçük / Darbe',
        icon: '🔨',
        description: 'Kasa üzerinde darbe izleri.',
        subject: '{serviceNo}',
        body: formatTemplate(
            'kullanıcı kaynaklı KASA GÖÇÜĞÜ/DARBE fiziksel hasar',
            'onarım',
            'kozmetik ve yapısal',
            'Arka Sistem (Kasa) parçasının'
        )
    },
    {
        id: 'rear_system',
        title: 'Arka/Orta Sistem',
        icon: '🛠️',
        description: 'Arka cam veya arka sistem hasarı.',
        subject: '{serviceNo}',
        body: formatTemplate(
            '{damagedPart}',
            'onarım',
            'donanımsal',
            'Arka Sistem (Rear System) parçasının'
        )
    },
    {
        id: 'grille_damage',
        title: 'Izgara/Mesh Hasarı',
        icon: '🕸️',
        description: 'Hoparlör ızgaralarında hasar.',
        subject: '{serviceNo}',
        body: formatTemplate(
            'kullanıcı kaynaklı IZGARA/MESH HASARI fiziksel hasar',
            'onarım',
            'ses çıkış',
            'Ekran/Kasa parçasının'
        )
    },
    {
        id: 'airpods_contamination',
        title: 'AirPods Kontaminasyon',
        icon: '🧼',
        description: 'Yoğun kirlenme.',
        subject: '{serviceNo}',
        body: formatTemplate(
            'kullanıcı kaynaklı YOĞUN KONTAMİNASYON (Kirlenme) fiziksel hasar',
            'bakım/onarım',
            'ses azlığı/tıkanıklık',
            '{airpodsSide}'
        )
    },
    {
        id: 'airpods_physical',
        title: 'AirPods Fiziksel Hasar',
        icon: '🎧',
        description: 'AirPods üzerinde darbe/kırık.',
        subject: '{serviceNo}',
        body: formatTemplate(
            '{damagedPart}',
            'onarım',
            'donanım',
            '{airpodsSide}'
        )
    },
    {
        id: 'repair_requote',
        title: 'Onarım Merkezi Fiyat Teklifi',
        icon: '📝',
        description: 'Merkezden gelen güncel teklif.',
        subject: '{serviceNo}',
        body: formatTemplate(
            '{damagedPart}',
            'onarım',
            'genel onarım',
            'İlgili Parçaların'
        )
    },
    {
        id: 'unauthorized_mod',
        title: 'Yetkisiz Değişiklik',
        icon: '⚠️',
        description: 'Cihazda yetkisiz parça/müdahale tespiti.',
        subject: '{serviceNo}',
        body: formatTemplate(
            'YETKİSİZ DEĞİŞİKLİK',
            'ARKA/ORTA SİSTEM',
            'yetkisiz müdahale',
            'Arka Sistem'
        )
    },
    {
        id: 'rear_glass',
        title: 'Arka Cam Hasarı',
        icon: '💎',
        description: 'Cihazın arka camında kırık/çatlak.',
        subject: '{serviceNo}',
        body: formatTemplate(
            'kullanıcı kaynaklı ARKA CAM HASARI fiziksel hasar',
            'onarım',
            'kozmetik/yapısal',
            'Arka Cam parçasının'
        )
    },
    {
        id: 'out_of_warranty',
        title: 'Garanti Dışı Onarım Bilgilendirmesi',
        icon: '🛠️',
        description: 'Garanti süresi dolmuş veya kapsam dışı arızalı cihazlar.',
        subject: '{serviceNo}',
        requiresDefectivePart: true,
        body: formatTemplate(
            'donanımsal ARIZA',
            'onarım',
            'işlevsel',
            '{defectivePart}'
        )
    },
    {
        id: 'general_info',
        title: 'Genel Bilgilendirme',
        icon: 'ℹ️',
        description: 'Genel durum ve süreç bilgilendirmesi.',
        subject: 'Servis Bilgilendirmesi',
        body: `Değerli Müşterimiz,

{damageReason}

Sorularınız için Apple Desteğe başvurun 0216 282 15 11

Saygılarımızla,
Troy Mavibahçe Teknik Servis / Apple Premium Partner
Apple Yetkili Servis Sağlayıcısı / Apple Authorized Service Provider
www.troyestore.com
Troy bir Artı Bilgisayar A.Ş. Markasıdır.`
    }
];
