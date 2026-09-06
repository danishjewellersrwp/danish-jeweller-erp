import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Gem, Receipt, Users, BarChart3, Settings as SettingsIcon } from 'lucide-react';

const TILES = [
  { href: '/pos', label: 'POS', icon: ShoppingCart },
  { href: '/products', label: 'Products', icon: Gem },
  { href: '/sales', label: 'Sales', icon: Receipt },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
];

const NecklaceArt = () => (
  <svg className="dj-hero-art" viewBox="0 0 400 230" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="cushionGlow" cx="50%" cy="30%" r="60%">
        <stop offset="0%" stopColor="rgba(201,162,78,0.28)" />
        <stop offset="100%" stopColor="rgba(201,162,78,0)" />
      </radialGradient>
      <linearGradient id="goldChain" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#8B6A2E" /><stop offset="50%" stopColor="#F1DFA9" /><stop offset="100%" stopColor="#8B6A2E" />
      </linearGradient>
      <linearGradient id="gemFill" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FDF3D8" /><stop offset="45%" stopColor="#E4C179" /><stop offset="100%" stopColor="#9A6B1F" />
      </linearGradient>
    </defs>
    <ellipse cx="200" cy="70" rx="180" ry="90" fill="url(#cushionGlow)" />
    <path d="M60 40 Q200 160 340 40" stroke="url(#goldChain)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    {[[88, 61.6], [130, 85], [172, 97.6], [228, 97.6], [270, 85], [312, 61.6]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r="3.2" fill="#E4C179" />
    ))}
    <line x1="200" y1="99" x2="200" y2="112" stroke="url(#goldChain)" strokeWidth="2.5" />
    <polygon points="200,112 224,140 200,192 176,140" fill="url(#gemFill)" stroke="#8B6A2E" strokeWidth="1" />
    <polygon points="200,112 224,140 200,150 176,140" fill="rgba(255,255,255,0.35)" />
    <line x1="200" y1="112" x2="200" y2="192" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
    <line x1="176" y1="140" x2="224" y2="140" stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" />
  </svg>
);

export default function DashboardHero() {
  return (
    <div className="dj-hero">
      <Image src="/logo.png" alt="Danish Jeweller" width={170} height={98} className="dj-hero-logo" priority />
      <NecklaceArt />
      <p className="dj-hero-tag">Pure Gold, Silver &amp; Diamond</p>
      <div className="dj-tiles">
        {TILES.map(t => (
          <Link key={t.href} href={t.href} className="dj-tile">
            <t.icon size={20} />
            <span>{t.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
