import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import en from '../locales/en';
import ar from '../locales/ar';

const translations = { en, ar };

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState(() => {
        const saved = localStorage.getItem('clinic_lang');
        return saved === 'ar' || saved === 'en' ? saved : 'en';
    });

    const dir = lang === 'ar' ? 'rtl' : 'ltr';

    useEffect(() => {
        localStorage.setItem('clinic_lang', lang);
        document.documentElement.setAttribute('dir', dir);
        document.documentElement.setAttribute('lang', lang);
        if (lang === 'ar') {
            document.body.classList.add('rtl');
        } else {
            document.body.classList.remove('rtl');
        }
    }, [lang, dir]);

    const t = useMemo(() => {
        return (path, params = {}) => {
            const keys = path.split('.');
            let current = translations[lang];

            for (const key of keys) {
                if (current && current[key] !== undefined) {
                    current = current[key];
                } else {
                    // Fallback to English
                    let fallback = translations.en;
                    for (const fbKey of keys) {
                        if (fallback && fallback[fbKey] !== undefined) {
                            fallback = fallback[fbKey];
                        } else {
                            fallback = null;
                            break;
                        }
                    }
                    current = fallback !== null ? fallback : path;
                    break;
                }
            }

            if (typeof current === 'string' && Object.keys(params).length > 0) {
                return current.replace(/\{(\w+)\}/g, (_, k) => params[k] !== undefined ? params[k] : `{${k}}`);
            }

            return current;
        };
    }, [lang]);

    const toggleLang = () => {
        setLang((prev) => (prev === 'en' ? 'ar' : 'en'));
    };

    const setLanguage = (newLang) => {
        if (newLang === 'en' || newLang === 'ar') {
            setLang(newLang);
        }
    };

    return (
        <LanguageContext.Provider value={{ lang, dir, t, toggleLang, setLanguage, isRtl: lang === 'ar' }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export default LanguageContext;
