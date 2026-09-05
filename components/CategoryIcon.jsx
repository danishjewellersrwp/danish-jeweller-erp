'use client';
export default function CategoryIcon({ type }) {
  const s = { stroke: '#D9B25F', strokeWidth: 1.6, fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };
  const dot = { fill: '#D9B25F', stroke: 'none' };
  switch (type) {
    case 'ring': return (<svg width="30" height="30" viewBox="0 0 32 32"><circle cx="16" cy="20" r="8" {...s} /><polygon points="16,5 20,10 16,15 12,10" {...dot} /></svg>);
    case 'earrings': return (<svg width="30" height="30" viewBox="0 0 32 32"><circle cx="11" cy="9" r="2.6" {...s} /><path d="M11 12 L11 17" {...s} /><circle cx="11" cy="21" r="4" {...s} /><circle cx="21" cy="9" r="2.6" {...s} /><path d="M21 12 L21 17" {...s} /><circle cx="21" cy="21" r="4" {...s} /></svg>);
    case 'necklace': return (<svg width="30" height="30" viewBox="0 0 32 32"><path d="M6 8 Q16 22 26 8" {...s} /><path d="M16 16 L16 19" {...s} /><polygon points="16,19 20,24 16,29 12,24" {...dot} /></svg>);
    case 'set': return (<svg width="30" height="30" viewBox="0 0 32 32"><path d="M6 7 Q16 18 26 7" {...s} /><polygon points="16,15 19,19 16,23 13,19" {...dot} /><circle cx="16" cy="27" r="2.2" {...s} /></svg>);
    case 'anklet': return (<svg width="30" height="30" viewBox="0 0 32 32"><ellipse cx="16" cy="15" rx="10" ry="6" {...s} /><path d="M16 21 L16 25" {...s} /><circle cx="16" cy="27" r="2.4" {...dot} /></svg>);
    case 'pendant': return (<svg width="30" height="30" viewBox="0 0 32 32"><path d="M11 8 Q16 5 21 8" {...s} /><circle cx="16" cy="9" r="1.6" {...s} /><path d="M16 10 L16 14" {...s} /><polygon points="16,14 22,20 16,27 10,20" {...s} /></svg>);
    case 'chain': return (<svg width="30" height="30" viewBox="0 0 32 32"><ellipse cx="8" cy="16" rx="4" ry="5" transform="rotate(20 8 16)" {...s} /><ellipse cx="15" cy="14" rx="4" ry="5" transform="rotate(-15 15 14)" {...s} /><ellipse cx="22" cy="16" rx="4" ry="5" transform="rotate(20 22 16)" {...s} /></svg>);
    case 'nosepin': return (<svg width="30" height="30" viewBox="0 0 32 32"><path d="M12 20 Q10 10 20 9" {...s} /><circle cx="20" cy="9" r="2.4" {...dot} /></svg>);
    case 'brooch': return (<svg width="30" height="30" viewBox="0 0 32 32"><circle cx="16" cy="16" r="3" {...dot} />{[0, 72, 144, 216, 288].map(a => (<ellipse key={a} cx={16 + 8 * Math.cos(a * Math.PI / 180)} cy={16 + 8 * Math.sin(a * Math.PI / 180)} rx="3.4" ry="2.2" transform={`rotate(${a} ${16 + 8 * Math.cos(a * Math.PI / 180)} ${16 + 8 * Math.sin(a * Math.PI / 180)})`} {...s} />))}</svg>);
    case 'bangle': return (<svg width="30" height="30" viewBox="0 0 32 32"><circle cx="16" cy="16" r="10" {...s} /><circle cx="16" cy="16" r="7" {...s} /></svg>);
    case 'men': return (<svg width="30" height="30" viewBox="0 0 32 32"><rect x="9" y="9" width="14" height="14" rx="2" {...s} /><path d="M9 16 L23 16" {...s} /></svg>);
    default: return (<svg width="30" height="30" viewBox="0 0 32 32"><polygon points="16,5 19,13 27,13 20,18 23,26 16,21 9,26 12,18 5,13 13,13" {...s} /></svg>);
  }
}
export const CATEGORY_TILES = [
  { label: 'All', match: null, icon: 'other' },
  { label: 'Rings', match: 'Rings', icon: 'ring' },
  { label: 'Bangles', match: 'Bangles', icon: 'bangle' },
  { label: 'Earrings', match: 'Earrings', icon: 'earrings' },
  { label: 'Necklaces', match: 'Necklaces', icon: 'necklace' },
  { label: 'Jewellery Sets', match: 'Jewellery Sets', icon: 'set' },
  { label: 'Bridal Sets', match: 'Bridal Sets', icon: 'set' },
  { label: 'Anklets', match: 'Anklets', icon: 'anklet' },
  { label: 'Pendants', match: 'Pendants', icon: 'pendant' },
  { label: 'Chains', match: 'Chains', icon: 'chain' },
  { label: 'Nose Pins', match: 'Nose Pins', icon: 'nosepin' },
  { label: 'Brooches', match: 'Brooches', icon: 'brooch' },
  { label: "Men's", match: "Men's Jewellery", icon: 'men' },
  { label: 'Others', match: 'Other', icon: 'other' },
];
