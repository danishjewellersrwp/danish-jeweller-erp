'use client';
import { createContext, useContext, useEffect, useState } from 'react';

// Central dictionary. Add a key here, then use t('your.key', 'English fallback')
// anywhere in a client component. A key missing from a language falls back to
// English, and a key missing everywhere falls back to the text you passed in.
export const translations = {
  en: {
    'app.name': 'Danish Jeweller',
    'app.erp': 'Danish Jeweller ERP',

    'nav.dashboard': 'Dashboard',
    'nav.pos': 'Point of Sale',
    'nav.products': 'Products & Inventory',
    'nav.sales': 'Sales',
    'nav.purchases': 'Purchases',
    'nav.customers': 'Customers',
    'nav.suppliers': 'Suppliers',
    'nav.oldgold': 'Old Gold Exchange',
    'nav.repairs': 'Repairs',
    'nav.customorders': 'Custom Orders',
    'nav.expenses': 'Expenses',
    'nav.reports': 'Reports & Accounting',
    'nav.settings': 'Settings',

    'topbar.logout': 'Log Out',
    'topbar.live': 'Live',
    'topbar.gold24k': 'Gold 24K',
    'topbar.silver999': 'Silver 999',
    'topbar.rateUpdated': 'Live gold & silver rates updated',
    'topbar.rateFailed': 'Live fetch failed',
    'topbar.language': 'Language',

    'hero.tagline': 'Pure Gold, Silver & Diamond',
    'hero.tiles.pos': 'POS',
    'hero.tiles.products': 'Products',
    'hero.tiles.sales': 'Sales',
    'hero.tiles.customers': 'Customers',
    'hero.tiles.reports': 'Reports',
    'hero.tiles.settings': 'Settings',

    'dashboard.todaySales': "Today's Sales",
    'dashboard.totalSales': 'Total Sales (all-time)',
    'dashboard.receivables': 'Receivables',
    'dashboard.customersOwe': 'customers owe',
    'dashboard.payables': 'Payables',
    'dashboard.goldRate': 'Gold Rate',
    'dashboard.silverRate': 'Silver Rate',
    'dashboard.perGram': 'Per Gram',
    'dashboard.perTola': 'Per Tola',
    'dashboard.otherPurities': 'Other purities',
    'dashboard.source': 'Source',
    'dashboard.updated': 'Updated',
    'dashboard.goldInStock': 'Gold in stock',
    'dashboard.silverInStock': 'Silver in stock',
    'dashboard.inventoryValue': 'Inventory value',
    'dashboard.cashInHand': 'Cash in hand',
    'dashboard.bankBalance': 'Bank balance',
    'dashboard.lowStockAlerts': 'Low stock alerts',
    'dashboard.allStocked': 'All items sufficiently stocked.',
    'dashboard.purityTable': 'Purity Reference Table',
    'dashboard.purity': 'Purity',
    'dashboard.metal': 'Metal',
    'dashboard.factor': 'Factor',
    'dashboard.rateGram': 'Rate / gram',
    'dashboard.rateTola': 'Rate / tola',
    'dashboard.usdPkr': 'USD/PKR',
    'dashboard.liveFetchFailed': 'Live fetch failed',
  },
  ur: {
    'app.name': 'دانش جیولر',
    'app.erp': 'دانش جیولر ای آر پی',

    'nav.dashboard': 'ڈیش بورڈ',
    'nav.pos': 'پوائنٹ آف سیل',
    'nav.products': 'مصنوعات اور انوینٹری',
    'nav.sales': 'فروخت',
    'nav.purchases': 'خریداری',
    'nav.customers': 'گاہک',
    'nav.suppliers': 'سپلائرز',
    'nav.oldgold': 'پرانا سونا تبادلہ',
    'nav.repairs': 'مرمت',
    'nav.customorders': 'خصوصی آرڈرز',
    'nav.expenses': 'اخراجات',
    'nav.reports': 'رپورٹس اور اکاؤنٹنگ',
    'nav.settings': 'ترتیبات',

    'topbar.logout': 'لاگ آؤٹ',
    'topbar.live': 'لائیو',
    'topbar.gold24k': 'سونا 24 قیراط',
    'topbar.silver999': 'چاندی 999',
    'topbar.rateUpdated': 'سونے اور چاندی کی لائیو قیمت اپڈیٹ ہو گئی',
    'topbar.rateFailed': 'لائیو اپڈیٹ ناکام',
    'topbar.language': 'زبان',

    'hero.tagline': 'خالص سونا، چاندی اور ہیرا',
    'hero.tiles.pos': 'POS',
    'hero.tiles.products': 'مصنوعات',
    'hero.tiles.sales': 'فروخت',
    'hero.tiles.customers': 'گاہک',
    'hero.tiles.reports': 'رپورٹس',
    'hero.tiles.settings': 'ترتیبات',

    'dashboard.todaySales': 'آج کی فروخت',
    'dashboard.totalSales': 'کل فروخت (ہمہ وقت)',
    'dashboard.receivables': 'وصولیاں',
    'dashboard.customersOwe': 'گاہکوں کے ذمے',
    'dashboard.payables': 'قابلِ ادائیگی',
    'dashboard.goldRate': 'سونے کی قیمت',
    'dashboard.silverRate': 'چاندی کی قیمت',
    'dashboard.perGram': 'فی گرام',
    'dashboard.perTola': 'فی تولہ',
    'dashboard.otherPurities': 'دیگر خالص درجات',
    'dashboard.source': 'ماخذ',
    'dashboard.updated': 'تازہ کاری',
    'dashboard.goldInStock': 'اسٹاک میں سونا',
    'dashboard.silverInStock': 'اسٹاک میں چاندی',
    'dashboard.inventoryValue': 'انوینٹری کی مالیت',
    'dashboard.cashInHand': 'نقد رقم',
    'dashboard.bankBalance': 'بینک بیلنس',
    'dashboard.lowStockAlerts': 'کم اسٹاک الرٹس',
    'dashboard.allStocked': 'تمام اشیاء وافر مقدار میں موجود ہیں۔',
    'dashboard.purityTable': 'خالص درجہ حوالہ جدول',
    'dashboard.purity': 'خالص درجہ',
    'dashboard.metal': 'دھات',
    'dashboard.factor': 'عنصر',
    'dashboard.rateGram': 'قیمت / گرام',
    'dashboard.rateTola': 'قیمت / تولہ',
    'dashboard.usdPkr': 'امریکی ڈالر/پاکستانی روپیہ',
    'dashboard.liveFetchFailed': 'لائیو اپڈیٹ ناکام',
  },
};

const LanguageContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: (key, fallback) => fallback ?? key,
});

const STORAGE_KEY = 'dj_lang';

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('en');

  // Pick up a saved choice on first load (client only — localStorage isn't
  // available during server rendering).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'ur') setLangState(saved);
    } catch (e) { /* localStorage blocked — just stay on the default */ }
  }, []);

  // Keep <html lang> correct for accessibility/screen readers, and toggle a
  // class that switches to an Urdu-friendly typeface. We deliberately do NOT
  // flip the whole page to dir="rtl" — the layout (sidebar, tables, forms)
  // wasn't built with mirrored RTL in mind, and flipping it would scramble
  // the UI rather than just translate it. Urdu text still reads correctly
  // left-to-right-laid-out because each word itself renders RTL internally.
  useEffect(() => {
    document.documentElement.lang = lang === 'ur' ? 'ur' : 'en';
    document.documentElement.classList.toggle('lang-ur', lang === 'ur');
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* best effort */ }
  }, [lang]);

  const setLang = (l) => setLangState(l === 'ur' ? 'ur' : 'en');
  const t = (key, fallback) => translations[lang]?.[key] ?? translations.en[key] ?? fallback ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
