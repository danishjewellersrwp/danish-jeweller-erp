'use client';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, ShoppingCart, Gem, Users, Truck, Wrench, PenTool,
  Receipt, Wallet, BarChart3, Settings as SettingsIcon, Menu, X, LogOut,
  ArrowRightLeft, Package, Coins, RefreshCw, Check,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ROLES } from '@/lib/roles';
import { fmt, ratePerGram, TOLA_GRAMS } from '@/lib/pricing';
import { refreshLiveRates } from '@/app/actions/rates';
import { useLanguage } from '@/lib/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'pos', label: 'Point of Sale', icon: ShoppingCart, href: '/pos' },
  { id: 'products', label: 'Products & Inventory', icon: Gem, href: '/products' },
  { id: 'sales', label: 'Sales', icon: Receipt, href: '/sales' },
  { id: 'purchases', label: 'Purchases', icon: Truck, href: '/purchases' },
  { id: 'customers', label: 'Customers', icon: Users, href: '/customers' },
  { id: 'suppliers', label: 'Suppliers', icon: Package, href: '/suppliers' },
  { id: 'oldgold', label: 'Old Gold Exchange', icon: ArrowRightLeft, href: '/old-gold' },
  { id: 'repairs', label: 'Repairs', icon: Wrench, href: '/repairs' },
  { id: 'customorders', label: 'Custom Orders', icon: PenTool, href: '/custom-orders' },
  { id: 'expenses', label: 'Expenses', icon: Wallet, href: '/expenses' },
  { id: 'reports', label: 'Reports & Accounting', icon: BarChart3, href: '/reports' },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, href: '/settings' },
];

export default function AppShell({ profile, email, metalRates, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fetching, startFetch] = useTransition();
  const [toast, setToast] = useState(null);
  const pathname = usePathname();
  const router = useRouter();
  const { lang, t } = useLanguage();

  const roleConfig = ROLES[profile.role] || ROLES.readonly;
  const visibleTabs = TABS.filter(tab => roleConfig.tabs.includes(tab.id));
  const activeTab = TABS.find(tab => pathname.startsWith(tab.href));

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600); };
  const refreshRate = () => {
    startFetch(async () => {
      const res = await refreshLiveRates();
      notify(res.ok ? t('topbar.rateUpdated') : `${t('topbar.rateFailed')}: ${res.error}`);
    });
  };

  const usd = metalRates?.usd_to_pkr || 284;
  const goldG = metalRates?.gold_pure_per_gram || 0, goldT = goldG * TOLA_GRAMS;
  const silverG = metalRates?.silver_pure_per_gram || 0, silverT = silverG * TOLA_GRAMS;

  return (
    <div className="dj-root">
      <aside className={`dj-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="dj-sidebar-close" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
        <div className="dj-brand">
          <Image src="/logo.png" alt="Danish Jeweller" width={180} height={104} className="dj-brand-logo" priority />
        </div>
        <nav className="dj-nav">
          {visibleTabs.map(tab => (
            <Link key={tab.id} href={tab.href} className={`dj-nav-item ${activeTab?.id === tab.id ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <tab.icon size={16} /><span>{t(`nav.${tab.id}`, tab.label)}</span>
            </Link>
          ))}
        </nav>
        <div className="dj-sidebar-user">
          <div className="dj-sidebar-user-name">{profile.full_name || email}</div>
          <div className="dj-sidebar-user-role"><span className="dj-role-badge">{roleConfig.label}</span></div>
          <button className="dj-logout-btn" onClick={logout}><LogOut size={13} /> {t('topbar.logout')}</button>
        </div>
      </aside>
      <div className={`dj-backdrop ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />
      <div className="dj-main">
        <div className="dj-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <button className="dj-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
            <div style={{ minWidth: 0 }}>
              <h1>{activeTab ? t(`nav.${activeTab.id}`, activeTab.label) : t('app.name')}</h1>
              <p>{t('app.erp')} · {new Date().toLocaleDateString(lang === 'ur' ? 'ur-PK' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="dj-topbar-rates" style={{ display: 'flex', gap: 10 }}>
              <div className="dj-rate-card">
                <div className="dj-rate-card-head"><Coins size={13} color="#AD8438" /><span>{t('topbar.gold24k')}</span></div>
                <div className="dj-rate-line"><span>PKR</span><b>{fmt(goldG)}/g</b><b>{fmt(goldT)}/tola</b></div>
                <div className="dj-rate-line"><span>USD</span><b>${(goldG / usd).toFixed(2)}/g</b><b>${(goldT / usd).toFixed(2)}/tola</b></div>
              </div>
              <div className="dj-rate-card">
                <div className="dj-rate-card-head"><Coins size={13} color="#8B93A6" /><span>{t('topbar.silver999')}</span></div>
                <div className="dj-rate-line"><span>PKR</span><b>{fmt(silverG)}/g</b><b>{fmt(silverT)}/tola</b></div>
                <div className="dj-rate-line"><span>USD</span><b>${(silverG / usd).toFixed(2)}/g</b><b>${(silverT / usd).toFixed(2)}/tola</b></div>
              </div>
              {(roleConfig.tabs.includes('settings') || profile.role === 'manager') && (
                <button className="dj-btn dj-btn-sm dj-btn-gold" onClick={refreshRate} disabled={fetching} title="Fetch live rates">
                  <RefreshCw size={13} /> {fetching ? '…' : t('topbar.live')}
                </button>
              )}
            </div>
            <LanguageSwitcher />
            <Image src="/logo.png" alt="Danish Jeweller" width={90} height={52} className="dj-topbar-logo" />
          </div>
        </div>
        <div className="dj-content">{children}</div>
      </div>
      {toast && <div className="dj-toast"><Check size={15} />{toast}</div>}
    </div>
  );
}
