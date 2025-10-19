import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type LanguageCode = 'en' | 'hi';

interface I18nContextValue {
    lang: LanguageCode;
    setLang: (lang: LanguageCode) => void;
    t: (key: string) => string;
}

const translations: Record<LanguageCode, Record<string, string>> = {
    en: {
        app_name: 'JanSetu',
        report_issue: 'Report an issue',
        my_complaints: 'My Complaints',
        contact_us: 'Contact Us',
        about: 'About',
        home: 'Home',
        stay_updated: 'Stay Updated',
        newsletter_cta: 'Join our newsletter to get the latest updates on civic improvements.',
        subscribe: 'Subscribe',
        back_to_top: 'Back to top',
    },
    hi: {
        app_name: 'जनसेतु',
        report_issue: 'समस्या दर्ज करें',
        my_complaints: 'मेरी शिकायतें',
        contact_us: 'संपर्क करें',
        about: 'हमारे बारे में',
        home: 'होम',
        stay_updated: 'अपडेट्स पाते रहें',
        newsletter_cta: 'नागरिक सुधारों पर नवीनतम अपडेट प्राप्त करने के लिए हमारे न्यूज़लेटर से जुड़ें।',
        subscribe: 'सब्सक्राइब',
        back_to_top: 'ऊपर जाएँ',
    }
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
    const [lang, setLangState] = useState<LanguageCode>(() => {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('lang') : null;
        return (stored === 'en' || stored === 'hi') ? stored : 'en';
    });

    useEffect(() => {
        localStorage.setItem('lang', lang);
        document.documentElement.lang = lang;
    }, [lang]);

    const value: I18nContextValue = useMemo(() => ({
        lang,
        setLang: (l: LanguageCode) => setLangState(l),
        t: (key: string) => translations[lang][key] ?? key,
    }), [lang]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
    const ctx = useContext(I18nContext);
    if (!ctx) throw new Error('useI18n must be used within I18nProvider');
    return ctx;
};



