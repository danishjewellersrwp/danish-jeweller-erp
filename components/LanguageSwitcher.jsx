'use client';
import { Languages } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useLanguage();
  return (
    <div className="dj-lang-switch" title={t('topbar.language', 'Language')}>
      <Languages size={13} />
      <button type="button" className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
      <button type="button" className={lang === 'ur' ? 'active' : ''} onClick={() => setLang('ur')}>اردو</button>
    </div>
  );
}
