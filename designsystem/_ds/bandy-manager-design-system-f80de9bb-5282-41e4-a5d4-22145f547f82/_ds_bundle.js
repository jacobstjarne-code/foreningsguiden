/* @ds-bundle: {"format":3,"namespace":"BandyManagerDesignSystem_f80de9","components":[],"sourceHashes":{"ui_kits/bandy-manager-pwa/components.jsx":"f732e59d7a87","ui_kits/bandy-manager-pwa/dashboard.jsx":"755d90c64b8f","ui_kits/bandy-manager-pwa/screens.jsx":"1ae7870c612d","ui_kits/intro_flode/app.jsx":"360e684cc166","ui_kits/intro_flode/artboards.jsx":"f610f7e962b9","ui_kits/intro_flode/design-canvas.jsx":"5d0e39003628","ui_kits/trupp/app.jsx":"8060428d139f","ui_kits/trupp/artboards.jsx":"84541f124bd1","ui_kits/trupp/design-canvas.jsx":"5d0e39003628"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.BandyManagerDesignSystem_f80de9 = window.BandyManagerDesignSystem_f80de9 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// ui_kits/bandy-manager-pwa/components.jsx
try { (() => {
/* Bandy Manager UI Kit components — shared global JSX via window.* */
const {
  useState
} = React;
const BM_CLUBS = {
  forsbacka: {
    primary: '#1e4d8c',
    secondary: '#C47A3A',
    symbol: 'hammer',
    name: 'Forsbacka',
    short: 'FBK'
  },
  soderfors: {
    primary: '#1a237e',
    secondary: '#E8D080',
    symbol: 'star',
    name: 'Söderfors',
    short: 'SFS'
  },
  vastanfors: {
    primary: '#006400',
    secondary: '#FFFFFF',
    symbol: 'crown',
    name: 'Västanfors',
    short: 'VFS'
  },
  karlsborg: {
    primary: '#8B0000',
    secondary: '#FFFFFF',
    symbol: 'river',
    name: 'Karlsborg',
    short: 'KLB'
  },
  malilla: {
    primary: '#4A0080',
    secondary: '#C47A3A',
    symbol: 'shield',
    name: 'Målilla',
    short: 'MAL'
  },
  gagnef: {
    primary: '#CC0000',
    secondary: '#FFFFFF',
    symbol: 'mountain',
    name: 'Gagnef',
    short: 'GAG'
  },
  halleforsnas: {
    primary: '#2E7D32',
    secondary: '#FFFFFF',
    symbol: 'elk',
    name: 'Hälleforsnäs',
    short: 'HFS'
  },
  lesjofors: {
    primary: '#FF6600',
    secondary: '#000000',
    symbol: 'axe',
    name: 'Lesjöfors',
    short: 'LSJ'
  },
  rogle: {
    primary: '#333333',
    secondary: '#C47A3A',
    symbol: 'tower',
    name: 'Rögle',
    short: 'RGL'
  },
  slottsbron: {
    primary: '#0066CC',
    secondary: '#FFFFFF',
    symbol: 'wave',
    name: 'Slottsbron',
    short: 'SLB'
  },
  skutskar: {
    primary: '#006633',
    secondary: '#E8D080',
    symbol: 'tree',
    name: 'Skutskär',
    short: 'SKU'
  },
  heros: {
    primary: '#990000',
    secondary: '#FFFFFF',
    symbol: 'bear',
    name: 'Heros',
    short: 'HRS'
  }
};
const SHIELD = 'M32 2 L58 12 V32 C58 46 46 54 32 60 C18 54 6 46 6 32 V12 Z';
function BadgeSymbol({
  symbol,
  secondary,
  primary
}) {
  switch (symbol) {
    case 'hammer':
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
        x: "28",
        y: "18",
        width: "8",
        height: "20",
        rx: "2",
        fill: secondary,
        opacity: "0.9",
        transform: "rotate(-40 32 32)"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "20",
        y: "14",
        width: "14",
        height: "7",
        rx: "2",
        fill: secondary,
        transform: "rotate(-40 32 32)"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "28",
        y: "18",
        width: "8",
        height: "20",
        rx: "2",
        fill: secondary,
        opacity: "0.7",
        transform: "rotate(40 32 32)"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "20",
        y: "14",
        width: "14",
        height: "7",
        rx: "2",
        fill: secondary,
        opacity: "0.7",
        transform: "rotate(40 32 32)"
      }));
    case 'star':
      return /*#__PURE__*/React.createElement("polygon", {
        points: "32,14 35.5,24.5 47,24.5 37.5,30.5 41,41 32,35 23,41 26.5,30.5 17,24.5 28.5,24.5",
        fill: secondary
      });
    case 'crown':
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
        d: "M18,38 L18,24 L24,30 L32,18 L40,30 L46,24 L46,38 Z",
        fill: secondary
      }), /*#__PURE__*/React.createElement("rect", {
        x: "18",
        y: "38",
        width: "28",
        height: "6",
        rx: "1",
        fill: secondary
      }));
    case 'river':
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
        d: "M16,26 Q22,22 28,26 Q34,30 40,26 Q46,22 50,26",
        stroke: secondary,
        strokeWidth: "2.5",
        fill: "none"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M16,33 Q22,29 28,33 Q34,37 40,33 Q46,29 50,33",
        stroke: secondary,
        strokeWidth: "2.5",
        fill: "none"
      }), /*#__PURE__*/React.createElement("path", {
        d: "M16,40 Q22,36 28,40 Q34,44 40,40 Q46,36 50,40",
        stroke: secondary,
        strokeWidth: "2.5",
        fill: "none"
      }));
    case 'tree':
      return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("rect", {
        x: "29",
        y: "40",
        width: "6",
        height: "8",
        fill: secondary
      }), /*#__PURE__*/React.createElement("polygon", {
        points: "32,14 22,32 42,32",
        fill: secondary
      }), /*#__PURE__*/React.createElement("polygon", {
        points: "32,20 20,40 44,40",
        fill: secondary,
        opacity: "0.9"
      }));
    case 'shield':
      return /*#__PURE__*/React.createElement("path", {
        d: "M32,14 L46,20 L46,34 Q46,44 32,50 Q18,44 18,34 L18,20 Z",
        fill: secondary
      });
    default:
      return /*#__PURE__*/React.createElement("circle", {
        cx: "32",
        cy: "32",
        r: "10",
        fill: secondary
      });
  }
}
function ClubBadge({
  club,
  size = 40
}) {
  const c = BM_CLUBS[club] || BM_CLUBS.forsbacka;
  const id = `bg-${club}`;
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 64 64",
    width: size,
    height: size
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("radialGradient", {
    id: id,
    cx: "50%",
    cy: "30%",
    r: "70%"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: c.primary,
    stopOpacity: "1"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: c.primary,
    stopOpacity: "0.7"
  }))), /*#__PURE__*/React.createElement("path", {
    d: SHIELD,
    fill: `url(#${id})`
  }), /*#__PURE__*/React.createElement(BadgeSymbol, {
    symbol: c.symbol,
    secondary: c.secondary,
    primary: c.primary
  }), /*#__PURE__*/React.createElement("path", {
    d: SHIELD,
    fill: "none",
    stroke: "rgba(196,122,58,0.5)",
    strokeWidth: "1.5"
  }));
}
function SectionLabel({
  emoji,
  children,
  right,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
      ...style
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "h-label",
    style: {
      margin: 0
    }
  }, emoji ? emoji + ' ' : '', children), right);
}
function Chev() {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 16,
      height: 16,
      borderRadius: 4,
      border: '1px solid var(--border)',
      color: 'var(--accent)',
      fontSize: 11,
      flexShrink: 0
    }
  }, "\u203A");
}
function CardSharp({
  children,
  style,
  onClick
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    className: "card-sharp",
    style: {
      borderRadius: 8,
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      padding: '10px 12px',
      boxShadow: 'var(--shadow-card)',
      cursor: onClick ? 'pointer' : 'default',
      ...style
    }
  }, children);
}
function CardRound({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 14,
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      padding: '10px 12px',
      boxShadow: 'var(--shadow-card)',
      ...style
    }
  }, children);
}
function RowCard({
  emoji,
  label,
  value,
  onClick
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '7px 10px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      boxShadow: 'var(--shadow-card)',
      cursor: 'pointer',
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "h-label",
    style: {
      margin: 0,
      flexShrink: 0
    }
  }, emoji, " ", label), /*#__PURE__*/React.createElement("p", {
    style: {
      flex: 1,
      fontSize: 12,
      color: 'var(--text-secondary)',
      margin: 0
    }
  }, value), /*#__PURE__*/React.createElement(Chev, null));
}
function Tag({
  variant = 'ghost',
  children,
  style
}) {
  const styles = {
    fill: {
      background: 'var(--accent)',
      color: '#fff',
      border: 'none'
    },
    copper: {
      background: 'transparent',
      border: '1px solid var(--accent)',
      color: 'var(--accent-dark)'
    },
    green: {
      background: 'rgba(90,154,74,0.12)',
      border: '1px solid rgba(90,154,74,0.3)',
      color: 'var(--success-light)'
    },
    red: {
      background: 'rgba(176,80,64,0.10)',
      border: '1px solid rgba(176,80,64,0.25)',
      color: 'var(--danger-text)'
    },
    ice: {
      background: 'rgba(126,179,212,0.12)',
      border: '1px solid rgba(126,179,212,0.3)',
      color: 'var(--ice-dark)'
    },
    ghost: {
      background: 'transparent',
      border: '1px solid var(--border)',
      color: 'var(--text-muted)'
    },
    dark: {
      background: 'rgba(255,255,255,0.1)',
      color: 'var(--text-light-secondary)',
      border: 'none'
    }
  }[variant];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      borderRadius: 99,
      padding: '2px 8px',
      fontSize: 9,
      fontWeight: 600,
      letterSpacing: 0.4,
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
      ...styles,
      ...style
    }
  }, children);
}
function FormDots({
  results
}) {
  const COLORS = {
    V: 'var(--success)',
    F: 'var(--danger)',
    O: 'var(--accent)'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      gap: 3,
      alignItems: 'center'
    }
  }, Array.from({
    length: 5
  }).map((_, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: results[i] ? COLORS[results[i]] : 'var(--border)'
    }
  })));
}
function DiamondDivider() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      margin: '6px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 1,
      background: 'linear-gradient(90deg, transparent, var(--border-dark))'
    }
  }), /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 28 12",
    width: "28",
    height: "12"
  }, /*#__PURE__*/React.createElement("polygon", {
    points: "14,1 27,6 14,11 1,6",
    fill: "none",
    stroke: "var(--accent)",
    strokeWidth: "0.8",
    opacity: "0.4"
  }), /*#__PURE__*/React.createElement("polygon", {
    points: "14,4 20,6 14,8 8,6",
    fill: "var(--accent)",
    opacity: "0.15"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 1,
      background: 'linear-gradient(90deg, var(--border-dark), transparent)'
    }
  }));
}
function CtaButton({
  children,
  onClick,
  disabled,
  variant = 'primary'
}) {
  const primaryBg = 'linear-gradient(to bottom, rgba(255,255,255,0.35) 0%, transparent 50%),' + 'linear-gradient(to bottom, #DD9555, #8B4820)';
  const style = variant === 'primary' ? {
    background: primaryBg,
    color: '#fff',
    boxShadow: 'var(--shadow-primary)'
  } : {
    background: 'var(--bg-surface)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-dark)'
  };
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    disabled: disabled,
    style: {
      width: '100%',
      padding: '14px 16px',
      fontSize: 14,
      fontWeight: 700,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      fontFamily: 'var(--font-body)',
      border: 'none',
      borderRadius: 12,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      ...style
    }
  }, children);
}
function GameHeader({
  club = 'forsbacka',
  manager = 'J. Stjärne',
  round = 14
}) {
  const c = BM_CLUBS[club];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 12px',
      background: 'var(--bg-dark)',
      borderBottom: '2px solid var(--accent)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: 44,
      position: 'relative',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/bandymanager-logo.png",
    alt: "Bandy Manager",
    style: {
      height: 26,
      opacity: 0.85
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      flex: 1,
      padding: '0 8px'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      color: 'rgba(245,241,235,0.85)',
      fontFamily: 'var(--font-display)',
      margin: 0,
      lineHeight: 1.2
    }
  }, c.name.toUpperCase(), " IF"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 9,
      color: 'rgba(245,241,235,0.55)',
      margin: 0,
      lineHeight: 1.2
    }
  }, manager, " \xB7 2026/2027 \xB7 Omg ", round)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      color: 'var(--accent)',
      fontSize: 17
    }
  }, "\uD83D\uDD14", /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: -3,
      right: -3,
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: 'var(--danger)',
      border: '1.5px solid var(--bg-dark)'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'rgba(245,241,235,0.5)',
      fontSize: 14,
      marginLeft: 2
    }
  }, "\u2699")));
}
function PhaseIndicator({
  phase = 'prepare'
}) {
  const phases = [{
    id: 'prepare',
    label: 'Förbered'
  }, {
    id: 'play',
    label: 'Spela'
  }, {
    id: 'review',
    label: 'Granska'
  }];
  const activeIdx = phases.findIndex(p => p.id === phase);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      padding: '6px 20px 8px',
      background: 'var(--bg-dark)'
    }
  }, phases.map((p, i) => {
    const isActive = i === activeIdx;
    const isPast = i < activeIdx;
    const dotBg = isPast ? 'var(--accent)' : isActive ? 'rgba(139,115,50,0.3)' : 'transparent';
    const border = isPast || isActive ? '1.5px solid var(--accent)' : '1.5px solid rgba(255,255,255,0.2)';
    const color = isPast || isActive ? 'var(--accent)' : 'rgba(255,255,255,0.35)';
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: p.id
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        flex: 1,
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: dotBg,
        border,
        boxShadow: isActive ? '0 0 0 3px rgba(139,115,50,0.1)' : 'none'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9,
        fontWeight: isActive ? 700 : 400,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        color
      }
    }, p.label)), i < phases.length - 1 && /*#__PURE__*/React.createElement("div", {
      style: {
        flex: '0 0 20px',
        height: 1.5,
        margin: '0 2px',
        background: i < activeIdx ? 'var(--accent)' : 'rgba(255,255,255,0.15)'
      }
    }));
  }));
}
function BottomNav({
  active = 'hem',
  onNav
}) {
  const tabs = [{
    id: 'hem',
    label: 'Hem',
    icon: '🏠'
  }, {
    id: 'trupp',
    label: 'Trupp',
    icon: '👥'
  }, {
    id: 'match',
    label: 'Match',
    icon: '⚔️'
  }, {
    id: 'tabell',
    label: 'Tabell',
    icon: '📊'
  }, {
    id: 'transfers',
    label: 'Transfers',
    icon: '↔️'
  }, {
    id: 'klubb',
    label: 'Klubb',
    icon: '🏛️'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      height: 'var(--bottom-nav-height)',
      background: 'var(--bg-surface)',
      backgroundImage: 'repeating-linear-gradient(92deg, rgba(160,130,90,0.04) 0px, rgba(160,130,90,0.02) 2px, transparent 2px, transparent 8px)',
      borderTop: '1.5px solid var(--border)',
      paddingBottom: 'var(--safe-bottom)',
      flexShrink: 0
    }
  }, tabs.map(t => {
    const isActive = t.id === active;
    return /*#__PURE__*/React.createElement("div", {
      key: t.id,
      onClick: () => onNav && onNav(t.id),
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        color: isActive ? 'var(--accent)' : 'var(--text-muted)',
        fontSize: 9,
        fontWeight: isActive ? 700 : 500,
        cursor: 'pointer'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 18,
        filter: isActive ? 'none' : 'grayscale(0.3) opacity(0.7)'
      }
    }, t.icon), /*#__PURE__*/React.createElement("span", null, t.label));
  }));
}
Object.assign(window, {
  BM_CLUBS,
  ClubBadge,
  SectionLabel,
  Chev,
  CardSharp,
  CardRound,
  RowCard,
  Tag,
  FormDots,
  DiamondDivider,
  CtaButton,
  GameHeader,
  PhaseIndicator,
  BottomNav
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/bandy-manager-pwa/components.jsx", error: String((e && e.message) || e) }); }

// ui_kits/bandy-manager-pwa/dashboard.jsx
try { (() => {
const {
  useState,
  useMemo
} = React;
function DashboardScreen({
  goMatch
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      background: 'var(--bg-november)',
      padding: '10px 12px 120px'
    }
  }, /*#__PURE__*/React.createElement(CardRound, {
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, {
    emoji: "\uD83D\uDCE3"
  }, "DAGBOKEN \xB7 ONS 27 NOV"), /*#__PURE__*/React.createElement("p", {
    className: "h-quote",
    style: {
      margin: 0
    }
  }, "\"Vinden river i flaggan. Skutsk\xE4r v\xE4ntar p\xE5 fredag \u2014 hallen \xE4r redan fylld. Brukspatronen h\xF6rs i korridoren: ", /*#__PURE__*/React.createElement("em", null, "vi viker oss inte"), ".\"")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10,
      borderRadius: 8,
      overflow: 'hidden',
      border: '1.5px solid rgba(196,122,58,0.30)',
      background: 'rgba(196,122,58,0.03)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--match-bg-cold)',
      padding: '8px 12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13
    }
  }, "\uD83D\uDD25"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: 'var(--match-gold)'
    }
  }, "Derby \xB7 N\xE4sta match")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 8,
      fontWeight: 700,
      letterSpacing: 1,
      background: 'var(--accent-dark)',
      color: 'var(--text-light)',
      padding: '2px 7px',
      borderRadius: 99
    }
  }, "HEMMA")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 12px 6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(ClubBadge, {
    club: "forsbacka",
    size: 44
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 12,
      margin: '4px 0 0'
    }
  }, "Forsbacka")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--text-muted)',
      margin: 0
    }
  }, "fre 19:00"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 9,
      color: 'var(--text-muted)',
      margin: '2px 0 0'
    }
  }, "Lindhagen IP \xB7 -4 \xB0C")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(ClubBadge, {
    club: "skutskar",
    size: 44
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 12,
      margin: '4px 0 0',
      color: 'var(--text-secondary)'
    }
  }, "Skutsk\xE4r"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 12px 10px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "h-label",
    style: {
      margin: 0
    }
  }, "FORM"), /*#__PURE__*/React.createElement(FormDots, {
    results: ['V', 'V', 'O', 'F', 'V']
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      color: 'var(--accent-dark)',
      fontSize: 12,
      marginLeft: 4
    }
  }, "V2 \xB7 O1 \xB7 F1")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 6,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement(CardSharp, null, /*#__PURE__*/React.createElement(SectionLabel, {
    emoji: "\uD83D\uDCB0"
  }, "EKONOMI"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 20,
      fontWeight: 700,
      margin: 0
    }
  }, "148 400 kr"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 10,
      color: 'var(--success-light)',
      fontWeight: 600,
      margin: '2px 0 0'
    }
  }, "+8 400 /omg")), /*#__PURE__*/React.createElement(CardSharp, null, /*#__PURE__*/React.createElement(SectionLabel, {
    emoji: "\uD83D\uDCCA"
  }, "TABELL"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 20,
      fontWeight: 700,
      margin: 0
    }
  }, "3:a ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--text-muted)',
      fontWeight: 400
    }
  }, "av 12")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 10,
      color: 'var(--text-secondary)',
      margin: '2px 0 0'
    }
  }, "26 p \xB7 7V 5O 1F")), /*#__PURE__*/React.createElement(CardSharp, null, /*#__PURE__*/React.createElement(SectionLabel, {
    emoji: "\uD83D\uDC65"
  }, "TRUPP"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      alignItems: 'center',
      marginTop: 3
    }
  }, /*#__PURE__*/React.createElement(Tag, {
    variant: "red"
  }, "2 skadade")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 10,
      color: 'var(--text-secondary)',
      margin: '4px 0 0'
    }
  }, "18 spelare \xB7 1 tvekar")), /*#__PURE__*/React.createElement(CardSharp, null, /*#__PURE__*/React.createElement(SectionLabel, {
    emoji: "\uD83C\uDFCB\uFE0F"
  }, "TR\xC4NING"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      margin: 0
    }
  }, "Isteknik"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 10,
      color: 'var(--text-secondary)',
      margin: '2px 0 0'
    }
  }, "3 dagar kvar \xB7 intensivt"))), /*#__PURE__*/React.createElement(RowCard, {
    emoji: "\uD83D\uDCCB",
    label: "KONTRAKT",
    value: "Holmgren utg\xE5r om 4 omg"
  }), /*#__PURE__*/React.createElement(RowCard, {
    emoji: "\uD83D\uDC64",
    label: "PATRON",
    value: "Brukspatronen vill prata"
  }), /*#__PURE__*/React.createElement(RowCard, {
    emoji: "\uD83D\uDCEC",
    label: "INKORG",
    value: "3 ol\xE4sta \xB7 1 pressfr\xE5ga"
  }), /*#__PURE__*/React.createElement(DiamondDivider, null), /*#__PURE__*/React.createElement(CardRound, {
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, {
    emoji: "\uD83C\uDFE0"
  }, "BYGDENS PULS"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      alignItems: 'flex-start',
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: '50%',
      background: 'radial-gradient(circle at 35% 35%, #C47A3A, #8B4820)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 16,
      color: '#F5F1EB',
      flexShrink: 0
    }
  }, "\u2764"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      margin: 0,
      color: 'var(--text-primary)'
    }
  }, "Ortens st\xE4mning: stigande"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 11,
      color: 'var(--text-secondary)',
      margin: '3px 0 0',
      lineHeight: 1.4
    }
  }, "Tv\xE5 raka vinster och ett derby i helgen \u2014 kaf\xE9erna pratar om inget annat.")))));
}
function CtaBar({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 'calc(var(--bottom-nav-height) + var(--safe-bottom))',
      left: 0,
      right: 0,
      padding: '10px 12px',
      background: 'linear-gradient(to bottom, transparent, var(--bg) 30%)',
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      pointerEvents: 'auto'
    }
  }, children));
}
Object.assign(window, {
  DashboardScreen,
  CtaBar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/bandy-manager-pwa/dashboard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/bandy-manager-pwa/screens.jsx
try { (() => {
const {
  useState: useMatchState
} = React;

/* ── MATCH / TAKTIK screen ──────────────────────────────── */
function MatchScreen({
  onPlay
}) {
  const [tactic, setTactic] = useMatchState('balanced');
  const tactics = [{
    id: 'defensive',
    label: 'Defensiv',
    desc: 'Håll 0.'
  }, {
    id: 'balanced',
    label: 'Balanserad',
    desc: 'Taktiskt neutralt.'
  }, {
    id: 'offensive',
    label: 'Offensiv',
    desc: 'Jaga mål.'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      background: 'var(--bg)',
      padding: '10px 12px 140px'
    }
  }, /*#__PURE__*/React.createElement(CardRound, {
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, {
    emoji: "\uD83C\uDFA4"
  }, "PEP-TALK \xB7 F\xD6RE MATCH"), /*#__PURE__*/React.createElement("p", {
    className: "h-quote",
    style: {
      margin: 0
    }
  }, "\"Spelarna \xE4r tysta i omkl\xE4dningsrummet. Holmgren spottar i handen och ser upp.\"")), /*#__PURE__*/React.createElement(SectionLabel, {
    emoji: "\uD83C\uDFD2"
  }, "TAKTIK"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 6,
      marginBottom: 10
    }
  }, tactics.map(t => /*#__PURE__*/React.createElement("div", {
    key: t.id,
    onClick: () => setTactic(t.id),
    style: {
      padding: '10px 8px',
      borderRadius: 8,
      border: tactic === t.id ? '1.5px solid var(--accent)' : '1px solid var(--border)',
      background: tactic === t.id ? 'rgba(196,122,58,0.06)' : 'var(--bg-surface)',
      cursor: 'pointer',
      textAlign: 'center',
      boxShadow: tactic === t.id ? '0 0 0 3px rgba(196,122,58,0.08)' : 'var(--shadow-card)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      fontWeight: 700,
      margin: 0,
      color: tactic === t.id ? 'var(--accent-dark)' : 'var(--text-primary)'
    }
  }, t.label), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 9,
      color: 'var(--text-muted)',
      margin: '3px 0 0'
    }
  }, t.desc)))), /*#__PURE__*/React.createElement(SectionLabel, {
    emoji: "\uD83D\uDC65"
  }, "UPPST\xC4LLNING"), /*#__PURE__*/React.createElement(CardSharp, {
    style: {
      padding: 0,
      overflow: 'hidden',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 180,
      background: 'linear-gradient(180deg, #D0D4D8, #E0E4E8)',
      position: 'relative',
      backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 18px)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      width: 50,
      height: 50,
      borderRadius: '50%',
      border: '1px solid rgba(126,179,212,0.5)'
    }
  }), [{
    x: 50,
    y: 92,
    l: 'MV'
  }, {
    x: 20,
    y: 72,
    l: 'B'
  }, {
    x: 50,
    y: 72,
    l: 'B'
  }, {
    x: 80,
    y: 72,
    l: 'B'
  }, {
    x: 15,
    y: 48,
    l: 'YH'
  }, {
    x: 40,
    y: 52,
    l: 'MF'
  }, {
    x: 60,
    y: 52,
    l: 'MF'
  }, {
    x: 85,
    y: 48,
    l: 'YH'
  }, {
    x: 30,
    y: 22,
    l: 'A'
  }, {
    x: 50,
    y: 18,
    l: 'A'
  }, {
    x: 70,
    y: 22,
    l: 'A'
  }].map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      position: 'absolute',
      left: `${p.x}%`,
      top: `${p.y}%`,
      transform: 'translate(-50%, -50%)',
      width: 22,
      height: 22,
      borderRadius: '50%',
      background: 'radial-gradient(circle at 35% 35%, #1e4d8c, #0a2a55)',
      color: '#F5F1EB',
      fontSize: 8,
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1.5px solid var(--accent)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      fontFamily: 'var(--font-body)'
    }
  }, p.l))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 12px',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-secondary)'
    }
  }, "1\u20133\u20134\u20133 \xB7 klassisk"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--accent)',
      fontWeight: 600
    }
  }, "Byt formation \u203A"))), /*#__PURE__*/React.createElement(SectionLabel, {
    emoji: "\uD83E\uDE79"
  }, "SKADERAPPORT"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '7px 10px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 28,
      height: 28,
      borderRadius: '50%',
      background: 'linear-gradient(135deg,#4A0080,#2a0050)',
      color: '#F5F1EB',
      fontSize: 10,
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, "EH"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      margin: 0
    }
  }, "Edvin H\xF6kerberg"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 10,
      color: 'var(--text-secondary)',
      margin: '2px 0 0'
    }
  }, "MF \xB7 ljumskskada \xB7 2 omg kvar")), /*#__PURE__*/React.createElement(Tag, {
    variant: "red"
  }, "UTE")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '7px 10px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 28,
      height: 28,
      borderRadius: '50%',
      background: 'linear-gradient(135deg,#5a2d7a,#3a1a58)',
      color: '#F5F1EB',
      fontSize: 10,
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, "TL"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      margin: 0
    }
  }, "Tobias Lindblom"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 10,
      color: 'var(--text-secondary)',
      margin: '2px 0 0'
    }
  }, "YH \xB7 f\xF6rkylning \xB7 tvekar")), /*#__PURE__*/React.createElement(Tag, {
    variant: "copper"
  }, "TVEKAR"))));
}

/* ── MATCH RESULT / GRANSKA ──────────────────────────────── */
function ResultScreen({
  onBack
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      background: 'var(--bg)',
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'linear-gradient(180deg, #3D3A32, #2A2820)',
      padding: '20px 16px 24px',
      color: 'var(--text-light)',
      textAlign: 'center',
      borderBottom: '2px solid var(--accent)',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 9,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: 'var(--match-gold)',
      margin: 0
    }
  }, "SLUTRESULTAT \xB7 OMG 14"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement(ClubBadge, {
    club: "forsbacka",
    size: 44
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 11,
      margin: '4px 0 0',
      color: 'var(--text-light)'
    }
  }, "Forsbacka")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 44,
      fontWeight: 800,
      letterSpacing: 2,
      color: 'var(--text-light)'
    }
  }, "4", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--match-gold)',
      margin: '0 6px'
    }
  }, "\u2013"), "2"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      opacity: 0.75
    }
  }, /*#__PURE__*/React.createElement(ClubBadge, {
    club: "skutskar",
    size: 44
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 11,
      margin: '4px 0 0',
      color: 'rgba(245,241,235,0.7)'
    }
  }, "Skutsk\xE4r"))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-display)',
      fontStyle: 'italic',
      fontSize: 12,
      color: 'rgba(245,241,235,0.65)',
      margin: '14px 0 0'
    }
  }, "\"Klacken sjunger i kylan.\"")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 12px 120px'
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, {
    emoji: "\uD83D\uDCC8"
  }, "M\xC5LSKYTTAR"), /*#__PURE__*/React.createElement(CardSharp, {
    style: {
      padding: 0,
      marginBottom: 10
    }
  }, [{
    p: 'Holmgren',
    min: 12,
    home: true,
    note: 'passning: Svensson'
  }, {
    p: 'Holmgren',
    min: 28,
    home: true,
    note: 'straff'
  }, {
    p: 'Eriksson (Skutskär)',
    min: 41,
    home: false,
    note: 'hörna'
  }, {
    p: 'Nilsson',
    min: 62,
    home: true,
    note: 'passning: Holmgren'
  }, {
    p: 'Björk (Skutskär)',
    min: 74,
    home: false,
    note: 'soloruscher'
  }, {
    p: 'Svensson',
    min: 88,
    home: true,
    note: 'kontring'
  }].map((g, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 12px',
      borderTop: i === 0 ? 'none' : '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      fontSize: 13,
      width: 28,
      color: g.home ? 'var(--accent-dark)' : 'var(--ice-dark)'
    }
  }, g.min, "'"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      margin: 0
    }
  }, g.p), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 10,
      color: 'var(--text-muted)',
      margin: '2px 0 0'
    }
  }, g.note)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14
    }
  }, g.home ? '🏒' : '·')))), /*#__PURE__*/React.createElement(SectionLabel, {
    emoji: "\u2B50"
  }, "MATCHENS MAN"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      padding: 12,
      background: 'var(--bg-surface)',
      border: '1.5px solid rgba(196,122,58,0.4)',
      borderRadius: 8,
      marginBottom: 10,
      boxShadow: '0 0 0 4px rgba(196,122,58,0.06)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 44,
      borderRadius: '50%',
      flexShrink: 0,
      background: 'radial-gradient(circle at 35% 35%, #1e4d8c, #0a2a55)',
      color: '#F5F1EB',
      fontSize: 14,
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px solid var(--accent)',
      fontFamily: 'var(--font-display)'
    }
  }, "HH"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      margin: 0
    }
  }, "Henrik Holmgren"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 11,
      color: 'var(--text-secondary)',
      margin: '2px 0 0'
    }
  }, "A \xB7 2 m\xE5l + 1 passning"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      display: 'flex',
      gap: 4,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "h-label"
  }, "BETYG"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 18,
      color: 'var(--accent-dark)'
    }
  }, "9.2")))), /*#__PURE__*/React.createElement(SectionLabel, {
    emoji: "\uD83D\uDCF0"
  }, "RAPPORTEN"), /*#__PURE__*/React.createElement(CardRound, null, /*#__PURE__*/React.createElement("p", {
    className: "h-quote",
    style: {
      margin: 0
    }
  }, "\"Forsbacka IF gav bruksorten en kv\xE4ll att minnas. Holmgren fortsatte sin m\xE5lskytteform och Skutsk\xE4r f\xF6ll trots sen reducering. Publiken dr\xF6jde kvar \u2014 man sj\xF6ng fortfarande n\xE4r kylan kr\xF6p in.\""), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 10,
      color: 'var(--text-muted)',
      margin: '8px 0 0',
      textAlign: 'right'
    }
  }, "\u2014 Gefle Bandy-Kuriren"))));
}
Object.assign(window, {
  MatchScreen,
  ResultScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/bandy-manager-pwa/screens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/intro_flode/app.jsx
try { (() => {
/* Intro-flöde canvas — app-skal */

const {
  DesignCanvas,
  DCSection,
  DCArtboard
} = window;
const {
  ContinuousScene,
  NotesContinuous
} = window.IntroArtboards;
function ArtboardWithNotes({
  children,
  notes
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, children, notes);
}
function App() {
  return /*#__PURE__*/React.createElement(DesignCanvas, null, /*#__PURE__*/React.createElement(DCSection, {
    id: "efter-klubbval",
    title: "Efter klubbvalet \u2014 v\xE4gen in i s\xE4songen",
    subtitle: "EN sammanh\xE4ngande scen: Ankomsten + Styrelsem\xF6tet kumulativt. Tryck dig genom r\xF6relserna."
  }, /*#__PURE__*/React.createElement(DCArtboard, {
    id: "continuous",
    label: "Ankomsten \u2014 kumulativ scen",
    width: 760,
    height: 820
  }, /*#__PURE__*/React.createElement(ArtboardWithNotes, {
    notes: /*#__PURE__*/React.createElement(NotesContinuous, null)
  }, /*#__PURE__*/React.createElement(ContinuousScene, null)))));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/intro_flode/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/intro_flode/artboards.jsx
try { (() => {
/* Artboards för intro-flödet — efter klubbvalet.
 * EN sammanhängande scen: Ankomsten + Styrelsemötet i samma duk, kumulativt.
 * Ankomstens 3 rader stannar kvar (dimmade), dialogen byggs upp under dem.
 * Pixelvärden replikerar koden i bandy-manager (CoffeeExchange, BoardMeetingScene, SceneCTA).
 */

const {
  useState,
  useEffect
} = React;

/* ───────────────────────── Delade primitiver ───────────────────────── */

function GenreLabel({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "genre",
    style: {
      marginBottom: 10
    }
  }, children);
}
function Divider() {
  return /*#__PURE__*/React.createElement("div", {
    className: "divider-thin",
    style: {
      margin: '4px 0'
    }
  });
}
function SceneCTA({
  label,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    className: "scene-cta",
    onClick: onClick
  }, label);
}
function CoffeeRow({
  initial,
  name,
  text,
  align = 'left'
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      flexDirection: align === 'right' ? 'row-reverse' : 'row',
      textAlign: align,
      opacity: 0,
      animation: 'fade-in-soft 0.6s ease-out forwards'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "initial-circle"
  }, initial), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "speaker-name"
  }, name), /*#__PURE__*/React.createElement("div", {
    className: "speaker-quote"
  }, `"${text}"`)));
}

/* ───────────────────────── Den kontinuerliga scenen ───────────────────────── */

/* Rörelser:
 *   0 — Ankomsten fade:ar in (auto, 3.4 s)
 *   1 — CTA "Gå in" → kassören (Margareta) syns, Ankomsten dimmas till bakgrund
 *   2 — CTA "Förstått" → ordförande (Pelle)
 *   3 — CTA "Det går bra" → ledamot (Sture)
 *   4 — CTA "Då börjar vi" → in i spelet
 */

function ContinuousScene() {
  const [step, setStep] = useState(0);
  const [arrivalDone, setArrivalDone] = useState(false);

  // Auto-advance Ankomsten — efter sista raden + CTA-fadein har spelaren CTA:n
  useEffect(() => {
    const t = setTimeout(() => setArrivalDone(true), 3400);
    return () => clearTimeout(t);
  }, []);

  // Dimma Ankomsten när dialog börjar (steg ≥ 1)
  const arrivalDim = step >= 1;

  // 4 dialogsteg + 1 slut
  const ctaLabel = step === 0 ? 'Gå in →' : step === 1 ? 'Förstått' : step === 2 ? 'Det går bra' : step === 3 ? 'Då börjar vi' : null;

  // Progress: 4 streck för 4 dialogsteg (Ankomsten räknas inte — den är inramning)
  const totalSteps = 4;
  return /*#__PURE__*/React.createElement("div", {
    className: "phone",
    style: {
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(ellipse 60% 40% at 50% 0%, color-mix(in srgb, var(--accent) 8%, transparent) 0%, transparent 70%)',
      pointerEvents: 'none',
      opacity: arrivalDim ? 0.3 : 1,
      transition: 'opacity 0.8s ease-out'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1,
      padding: '32px 24px 0',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "fadein",
    style: {
      animationDelay: '200ms'
    }
  }, /*#__PURE__*/React.createElement(GenreLabel, null, "\u2B29 \xA0Ankomsten\xA0 \u2B29")), step >= 1 && /*#__PURE__*/React.createElement("div", {
    className: "beat-progress",
    style: {
      marginTop: 14,
      opacity: 0,
      animation: 'fade-in-static 0.5s ease-out forwards',
      animationDelay: '300ms'
    }
  }, Array.from({
    length: totalSteps
  }).map((_, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: `dot${i < step ? ' active' : ''}`
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1,
      padding: '32px 36px 12px',
      textAlign: 'center',
      opacity: arrivalDim ? 0.42 : 1,
      transition: 'opacity 0.9s ease-out, padding 0.5s ease-out',
      paddingTop: arrivalDim ? 18 : 32,
      paddingBottom: arrivalDim ? 4 : 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "fadein prose",
    style: {
      animationDelay: '600ms',
      fontSize: arrivalDim ? 18 : 26,
      fontFamily: 'Georgia, serif',
      fontWeight: 400,
      color: 'var(--text-light)',
      marginBottom: arrivalDim ? 6 : 16,
      transition: 'font-size 0.6s ease-out, margin-bottom 0.6s ease-out'
    }
  }, "Forsbacka."), /*#__PURE__*/React.createElement("div", {
    className: "fadein prose prose-em",
    style: {
      animationDelay: '1400ms',
      fontSize: arrivalDim ? 12 : 16,
      transition: 'font-size 0.6s ease-out',
      marginBottom: arrivalDim ? 4 : 12
    }
  }, "Onsdag kv\xE4ll. Lampan vid klubbhuset lyser. De v\xE4ntar dig d\xE4r inne."), /*#__PURE__*/React.createElement("div", {
    className: "fadein prose prose-em",
    style: {
      animationDelay: '2400ms',
      fontSize: arrivalDim ? 12 : 16,
      transition: 'font-size 0.6s ease-out'
    }
  }, "Pelle Nordin. Margareta Lind. Sture.", !arrivalDim && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("br", null), "Tre kaffekoppar redan p\xE5 bordet."))), step >= 1 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 32px',
      opacity: 0,
      animation: 'fade-in-static 0.6s ease-out forwards',
      animationDelay: '200ms'
    }
  }, /*#__PURE__*/React.createElement(Divider, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      position: 'relative',
      zIndex: 1,
      padding: '14px 20px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      overflowY: 'auto'
    }
  }, step >= 1 && /*#__PURE__*/React.createElement(CoffeeRow, {
    key: "margareta",
    initial: "M",
    name: "MARGARETA \xB7 KASS\xD6R",
    text: "Truppen \xE4r 22. Sex kontrakt g\xE5r ut i v\xE5r. Kassa 380 tkr, transferbudget 120. Mer har vi inte.",
    align: "left"
  }), step >= 2 && /*#__PURE__*/React.createElement(CoffeeRow, {
    key: "pelle",
    initial: "P",
    name: "PELLE \xB7 ORDF\xD6RANDE",
    text: "Plats fem till \xE5tta. Inget kvalspel. Och h\xE5ll bygden med oss \u2014 tomma l\xE4ktare \xE4r d\xE5ligt f\xF6r bandyn och d\xE5ligt f\xF6r budgeten.",
    align: "right"
  }), step >= 3 && /*#__PURE__*/React.createElement(CoffeeRow, {
    key: "sture",
    initial: "S",
    name: "STURE \xB7 LEDAMOT",
    text: "F\xF6r m\xE5nga h\xE4r \xE4r det h\xE4r s\xE4songens enda samling. Gl\xF6m inte det.",
    align: "left"
  })), ctaLabel && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1,
      padding: '12px 20px 28px',
      opacity: step === 0 && !arrivalDone ? 0 : 1,
      animation: step === 0 ? 'fade-in-static 0.6s ease-out forwards' : 'none',
      animationDelay: '3400ms',
      transition: step > 0 ? 'opacity 0.3s' : 'none',
      pointerEvents: step === 0 && !arrivalDone ? 'none' : 'auto'
    }
  }, /*#__PURE__*/React.createElement(SceneCTA, {
    label: ctaLabel,
    onClick: () => setStep(s => Math.min(s + 1, 4))
  })), step >= 4 && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 5,
      background: 'var(--bg-scene)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0,
      animation: 'fade-in-static 0.8s ease-out forwards'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: 'var(--text-muted)',
      letterSpacing: 3,
      textTransform: 'uppercase'
    }
  }, "\u2192 Dashboard")));
}

/* Reset-knapp och stegindikator (utanför själva ramen, för canvas) */
function ContinuousSceneWithControls() {
  const [key, setKey] = useState(0);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(ContinuousScene, {
    key: key
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => setKey(k => k + 1),
    style: {
      background: 'transparent',
      border: '1px solid #C4BAA8',
      color: '#C4BAA8',
      padding: '6px 14px',
      borderRadius: 4,
      fontSize: 11,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      cursor: 'pointer',
      fontFamily: 'system-ui, sans-serif'
    }
  }, "\u21BA Spela om"));
}

/* ───────────────────────── Notes-panel ───────────────────────── */

function NotesContinuous() {
  return /*#__PURE__*/React.createElement("div", {
    className: "notes",
    style: {
      left: 'calc(100% + 32px)',
      width: 360
    }
  }, /*#__PURE__*/React.createElement("h4", null, "En sammanh\xE4ngande scen \u2014 Ankomsten"), /*#__PURE__*/React.createElement("p", null, "Hela infl\xF6det (klubbval \u2192 f\xF6rsta r\xF6ran med klubben) \xE4r ", /*#__PURE__*/React.createElement("em", null, "en"), " scen, inte fyra. Spelaren klipper aldrig till svart mellan r\xF6relserna \u2014 bakgrunden best\xE5r, genre-etiketten best\xE5r."), /*#__PURE__*/React.createElement("h5", null, "R\xF6relse 1 \u2014 Utanf\xF6r (auto, ~3.4 s)"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, "Klubbnamnet stort. F\xE5r andas."), /*#__PURE__*/React.createElement("li", null, "Tid + plats. \"Onsdag kv\xE4ll. Lampan vid klubbhuset lyser.\""), /*#__PURE__*/React.createElement("li", null, "Styrelsens namn + bildelement (kaffekopparna)."), /*#__PURE__*/React.createElement("li", null, "CTA \"G\xE5 in \u2192\" tonas in.")), /*#__PURE__*/React.createElement("h5", null, "R\xF6relse 2-4 \u2014 Vid bordet (kumulativt)"), /*#__PURE__*/React.createElement("p", null, "N\xE4r spelaren trycker \"G\xE5 in\":"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, "Ankomsten dimmas (opacity 0.42, font-size krymper) men ", /*#__PURE__*/React.createElement("em", null, "f\xF6rsvinner inte"), ". Den blir scenens minne."), /*#__PURE__*/React.createElement("li", null, "Tunn divider tonas in mellan inramning och dialog."), /*#__PURE__*/React.createElement("li", null, "Margareta (kass\xF6r) syns. V\xE4nster, M-cirkel."), /*#__PURE__*/React.createElement("li", null, "Tryck \"F\xF6rst\xE5tt\" \u2192 Pelle (ordf\xF6rande) l\xE4ggs till. H\xF6ger, P-cirkel."), /*#__PURE__*/React.createElement("li", null, "Tryck \"Det g\xE5r bra\" \u2192 Sture (ledamot) l\xE4ggs till. V\xE4nster, S-cirkel."), /*#__PURE__*/React.createElement("li", null, "Tryck \"D\xE5 b\xF6rjar vi\" \u2192 fade till Dashboard.")), /*#__PURE__*/React.createElement("h5", null, "Visuella beslut"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("em", null, "Genre-etiketten byts inte"), " \u2014 det ", /*#__PURE__*/React.createElement("em", null, "\xE4r"), " Ankomsten hela v\xE4gen. Du har anl\xE4nt; nu sitter du d\xE4r."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("em", null, "Progress (4 streck)"), " visas f\xF6rst n\xE4r dialogen startar. Ankomsten r\xE4knas inte \u2014 den \xE4r inramning, inte en beat."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("em", null, "Ankomstens text dimmas men visas"), " hela v\xE4gen \u2014 s\xE5 scenen ackumulerar minne i sitt eget rum."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("em", null, "Copper-glow:t fr\xE5n ovan"), " dimmas ocks\xE5 n\xE4r du g\xE5r in (du \xE4r inomhus nu)."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("em", null, "CoffeeRow v\xE4nster/h\xF6ger-alternering"), " f\xF6ljer kafferummets spr\xE5k exakt.")), /*#__PURE__*/React.createElement("h5", null, "Dynamik"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, "Klubbnamn fr\xE5n valet"), /*#__PURE__*/React.createElement("li", null, "Veckodag/tid fr\xE5n currentDate"), /*#__PURE__*/React.createElement("li", null, "Styrelsens namn (chairman/treasurer/member) per klubb"), /*#__PURE__*/React.createElement("li", null, "Siffror (truppstorlek, kontrakt, kassa) fl\xE4tas in i Margaretas replik")));
}
window.IntroArtboards = {
  ContinuousScene: ContinuousSceneWithControls,
  NotesContinuous
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/intro_flode/artboards.jsx", error: String((e && e.message) || e) }); }

// ui_kits/intro_flode/design-canvas.jsx
try { (() => {
// DesignCanvas.jsx — Figma-ish design canvas wrapper
// Warm gray grid bg + Sections + Artboards + PostIt notes.
// Artboards are reorderable (grip-drag), labels/titles are inline-editable,
// and any artboard can be opened in a fullscreen focus overlay (←/→/Esc).
// State persists to a .design-canvas.state.json sidecar via the host
// bridge. No assets, no deps.
//
// Usage:
//   <DesignCanvas>
//     <DCSection id="onboarding" title="Onboarding" subtitle="First-run variants">
//       <DCArtboard id="a" label="A · Dusk" width={260} height={480}>…</DCArtboard>
//       <DCArtboard id="b" label="B · Minimal" width={260} height={480}>…</DCArtboard>
//     </DCSection>
//   </DesignCanvas>

const DC = {
  bg: '#f0eee9',
  grid: 'rgba(0,0,0,0.06)',
  label: 'rgba(60,50,40,0.7)',
  title: 'rgba(40,30,20,0.85)',
  subtitle: 'rgba(60,50,40,0.6)',
  postitBg: '#fef4a8',
  postitText: '#5a4a2a',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
};

// One-time CSS injection (classes are dc-prefixed so they don't collide with
// the hosted design's own styles).
if (typeof document !== 'undefined' && !document.getElementById('dc-styles')) {
  const s = document.createElement('style');
  s.id = 'dc-styles';
  s.textContent = ['.dc-editable{cursor:text;outline:none;white-space:nowrap;border-radius:3px;padding:0 2px;margin:0 -2px}', '.dc-editable:focus{background:#fff;box-shadow:0 0 0 1.5px #c96442}', '[data-dc-slot]{transition:transform .18s cubic-bezier(.2,.7,.3,1)}', '[data-dc-slot].dc-dragging{transition:none;z-index:10;pointer-events:none}', '[data-dc-slot].dc-dragging .dc-card{box-shadow:0 12px 40px rgba(0,0,0,.25),0 0 0 2px #c96442;transform:scale(1.02)}', '.dc-card{transition:box-shadow .15s,transform .15s}', '.dc-card *{scrollbar-width:none}', '.dc-card *::-webkit-scrollbar{display:none}', '.dc-labelrow{display:flex;align-items:center;gap:4px;height:24px}', '.dc-grip{cursor:grab;display:flex;align-items:center;padding:5px 4px;border-radius:4px;transition:background .12s}', '.dc-grip:hover{background:rgba(0,0,0,.08)}', '.dc-grip:active{cursor:grabbing}', '.dc-labeltext{cursor:pointer;border-radius:4px;padding:3px 6px;display:flex;align-items:center;transition:background .12s}', '.dc-labeltext:hover{background:rgba(0,0,0,.05)}', '.dc-expand{position:absolute;bottom:100%;right:0;margin-bottom:5px;z-index:2;opacity:0;transition:opacity .12s,background .12s;', '  width:22px;height:22px;border-radius:5px;border:none;cursor:pointer;padding:0;', '  background:transparent;color:rgba(60,50,40,.7);display:flex;align-items:center;justify-content:center}', '.dc-expand:hover{background:rgba(0,0,0,.06);color:#2a251f}', '[data-dc-slot]:hover .dc-expand{opacity:1}'].join('\n');
  document.head.appendChild(s);
}
const DCCtx = React.createContext(null);

// ─────────────────────────────────────────────────────────────
// DesignCanvas — stateful wrapper around the pan/zoom viewport.
// Owns runtime state (per-section order, renamed titles/labels, focused
// artboard). Order/titles/labels persist to a .design-canvas.state.json
// sidecar next to the HTML. Reads go via plain fetch() so the saved
// arrangement is visible anywhere the HTML + sidecar are served together
// (omelette preview, direct link, downloaded zip). Writes go through the
// host's window.omelette bridge — editing requires the omelette runtime.
// Focus is ephemeral.
// ─────────────────────────────────────────────────────────────
const DC_STATE_FILE = '.design-canvas.state.json';
function DesignCanvas({
  children,
  minScale,
  maxScale,
  style
}) {
  const [state, setState] = React.useState({
    sections: {},
    focus: null
  });
  // Hold rendering until the sidecar read settles so the saved order/titles
  // appear on first paint (no source-order flash). didRead gates writes until
  // the read settles so the empty initial state can't clobber a slow read;
  // skipNextWrite suppresses the one echo-write that would otherwise follow
  // hydration.
  const [ready, setReady] = React.useState(false);
  const didRead = React.useRef(false);
  const skipNextWrite = React.useRef(false);
  React.useEffect(() => {
    let off = false;
    fetch('./' + DC_STATE_FILE).then(r => r.ok ? r.json() : null).then(saved => {
      if (off || !saved || !saved.sections) return;
      skipNextWrite.current = true;
      setState(s => ({
        ...s,
        sections: saved.sections
      }));
    }).catch(() => {}).finally(() => {
      didRead.current = true;
      if (!off) setReady(true);
    });
    const t = setTimeout(() => {
      if (!off) setReady(true);
    }, 150);
    return () => {
      off = true;
      clearTimeout(t);
    };
  }, []);
  React.useEffect(() => {
    if (!didRead.current) return;
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    const t = setTimeout(() => {
      window.omelette?.writeFile(DC_STATE_FILE, JSON.stringify({
        sections: state.sections
      })).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [state.sections]);

  // Build registries synchronously from children so FocusOverlay can read
  // them in the same render. Only direct DCSection > DCArtboard children are
  // walked — wrapping them in other elements opts out of focus/reorder.
  const registry = {}; // slotId -> { sectionId, artboard }
  const sectionMeta = {}; // sectionId -> { title, subtitle, slotIds[] }
  const sectionOrder = [];
  React.Children.forEach(children, sec => {
    if (!sec || sec.type !== DCSection) return;
    const sid = sec.props.id ?? sec.props.title;
    if (!sid) return;
    sectionOrder.push(sid);
    const persisted = state.sections[sid] || {};
    const srcIds = [];
    React.Children.forEach(sec.props.children, ab => {
      if (!ab || ab.type !== DCArtboard) return;
      const aid = ab.props.id ?? ab.props.label;
      if (!aid) return;
      registry[`${sid}/${aid}`] = {
        sectionId: sid,
        artboard: ab
      };
      srcIds.push(aid);
    });
    const kept = (persisted.order || []).filter(k => srcIds.includes(k));
    sectionMeta[sid] = {
      title: persisted.title ?? sec.props.title,
      subtitle: sec.props.subtitle,
      slotIds: [...kept, ...srcIds.filter(k => !kept.includes(k))]
    };
  });
  const api = React.useMemo(() => ({
    state,
    section: id => state.sections[id] || {},
    patchSection: (id, p) => setState(s => ({
      ...s,
      sections: {
        ...s.sections,
        [id]: {
          ...s.sections[id],
          ...(typeof p === 'function' ? p(s.sections[id] || {}) : p)
        }
      }
    })),
    setFocus: slotId => setState(s => ({
      ...s,
      focus: slotId
    }))
  }), [state]);

  // Esc exits focus; any outside pointerdown commits an in-progress rename.
  React.useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') api.setFocus(null);
    };
    const onPd = e => {
      const ae = document.activeElement;
      if (ae && ae.isContentEditable && !ae.contains(e.target)) ae.blur();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPd, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPd, true);
    };
  }, [api]);
  return /*#__PURE__*/React.createElement(DCCtx.Provider, {
    value: api
  }, /*#__PURE__*/React.createElement(DCViewport, {
    minScale: minScale,
    maxScale: maxScale,
    style: style
  }, ready && children), state.focus && registry[state.focus] && /*#__PURE__*/React.createElement(DCFocusOverlay, {
    entry: registry[state.focus],
    sectionMeta: sectionMeta,
    sectionOrder: sectionOrder
  }));
}

// ─────────────────────────────────────────────────────────────
// DCViewport — transform-based pan/zoom (internal)
//
// Input mapping (Figma-style):
//   • trackpad pinch  → zoom   (ctrlKey wheel; Safari gesture* events)
//   • trackpad scroll → pan    (two-finger)
//   • mouse wheel     → zoom   (notched; distinguished from trackpad scroll)
//   • middle-drag / primary-drag-on-bg → pan
//
// Transform state lives in a ref and is written straight to the DOM
// (translate3d + will-change) so wheel ticks don't go through React —
// keeps pans at 60fps on dense canvases.
// ─────────────────────────────────────────────────────────────
function DCViewport({
  children,
  minScale = 0.1,
  maxScale = 8,
  style = {}
}) {
  const vpRef = React.useRef(null);
  const worldRef = React.useRef(null);
  const tf = React.useRef({
    x: 0,
    y: 0,
    scale: 1
  });
  const apply = React.useCallback(() => {
    const {
      x,
      y,
      scale
    } = tf.current;
    const el = worldRef.current;
    if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  }, []);
  React.useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const zoomAt = (cx, cy, factor) => {
      const r = vp.getBoundingClientRect();
      const px = cx - r.left,
        py = cy - r.top;
      const t = tf.current;
      const next = Math.min(maxScale, Math.max(minScale, t.scale * factor));
      const k = next / t.scale;
      // keep the world point under the cursor fixed
      t.x = px - (px - t.x) * k;
      t.y = py - (py - t.y) * k;
      t.scale = next;
      apply();
    };

    // Mouse-wheel vs trackpad-scroll heuristic. A physical wheel sends
    // line-mode deltas (Firefox) or large integer pixel deltas with no X
    // component (Chrome/Safari, typically multiples of 100/120). Trackpad
    // two-finger scroll sends small/fractional pixel deltas, often with
    // non-zero deltaX. ctrlKey is set by the browser for trackpad pinch.
    const isMouseWheel = e => e.deltaMode !== 0 || e.deltaX === 0 && Number.isInteger(e.deltaY) && Math.abs(e.deltaY) >= 40;
    const onWheel = e => {
      e.preventDefault();
      if (isGesturing) return; // Safari: gesture* owns the pinch — discard concurrent wheels
      if (e.ctrlKey) {
        // trackpad pinch (or explicit ctrl+wheel)
        zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.01));
      } else if (isMouseWheel(e)) {
        // notched mouse wheel — fixed-ratio step per click
        zoomAt(e.clientX, e.clientY, Math.exp(-Math.sign(e.deltaY) * 0.18));
      } else {
        // trackpad two-finger scroll — pan
        tf.current.x -= e.deltaX;
        tf.current.y -= e.deltaY;
        apply();
      }
    };

    // Safari sends native gesture* events for trackpad pinch with a smooth
    // e.scale; preferring these over the ctrl+wheel fallback gives a much
    // better feel there. No-ops on other browsers. Safari also fires
    // ctrlKey wheel events during the same pinch — isGesturing makes
    // onWheel drop those entirely so they neither zoom nor pan.
    let gsBase = 1;
    let isGesturing = false;
    const onGestureStart = e => {
      e.preventDefault();
      isGesturing = true;
      gsBase = tf.current.scale;
    };
    const onGestureChange = e => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, gsBase * e.scale / tf.current.scale);
    };
    const onGestureEnd = e => {
      e.preventDefault();
      isGesturing = false;
    };

    // Drag-pan: middle button anywhere, or primary button on canvas
    // background (anything that isn't an artboard or an inline editor).
    let drag = null;
    const onPointerDown = e => {
      const onBg = !e.target.closest('[data-dc-slot], .dc-editable');
      if (!(e.button === 1 || e.button === 0 && onBg)) return;
      e.preventDefault();
      vp.setPointerCapture(e.pointerId);
      drag = {
        id: e.pointerId,
        lx: e.clientX,
        ly: e.clientY
      };
      vp.style.cursor = 'grabbing';
    };
    const onPointerMove = e => {
      if (!drag || e.pointerId !== drag.id) return;
      tf.current.x += e.clientX - drag.lx;
      tf.current.y += e.clientY - drag.ly;
      drag.lx = e.clientX;
      drag.ly = e.clientY;
      apply();
    };
    const onPointerUp = e => {
      if (!drag || e.pointerId !== drag.id) return;
      vp.releasePointerCapture(e.pointerId);
      drag = null;
      vp.style.cursor = '';
    };
    vp.addEventListener('wheel', onWheel, {
      passive: false
    });
    vp.addEventListener('gesturestart', onGestureStart, {
      passive: false
    });
    vp.addEventListener('gesturechange', onGestureChange, {
      passive: false
    });
    vp.addEventListener('gestureend', onGestureEnd, {
      passive: false
    });
    vp.addEventListener('pointerdown', onPointerDown);
    vp.addEventListener('pointermove', onPointerMove);
    vp.addEventListener('pointerup', onPointerUp);
    vp.addEventListener('pointercancel', onPointerUp);
    return () => {
      vp.removeEventListener('wheel', onWheel);
      vp.removeEventListener('gesturestart', onGestureStart);
      vp.removeEventListener('gesturechange', onGestureChange);
      vp.removeEventListener('gestureend', onGestureEnd);
      vp.removeEventListener('pointerdown', onPointerDown);
      vp.removeEventListener('pointermove', onPointerMove);
      vp.removeEventListener('pointerup', onPointerUp);
      vp.removeEventListener('pointercancel', onPointerUp);
    };
  }, [apply, minScale, maxScale]);
  const gridSvg = `url("data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M120 0H0v120' fill='none' stroke='${encodeURIComponent(DC.grid)}' stroke-width='1'/%3E%3C/svg%3E")`;
  return /*#__PURE__*/React.createElement("div", {
    ref: vpRef,
    className: "design-canvas",
    style: {
      height: '100vh',
      width: '100vw',
      background: DC.bg,
      overflow: 'hidden',
      overscrollBehavior: 'none',
      touchAction: 'none',
      position: 'relative',
      fontFamily: DC.font,
      boxSizing: 'border-box',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: worldRef,
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      transformOrigin: '0 0',
      willChange: 'transform',
      width: 'max-content',
      minWidth: '100%',
      minHeight: '100%',
      padding: '60px 0 80px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: -6000,
      backgroundImage: gridSvg,
      backgroundSize: '120px 120px',
      pointerEvents: 'none',
      zIndex: -1
    }
  }), children));
}

// ─────────────────────────────────────────────────────────────
// DCSection — editable title + h-row of artboards in persisted order
// ─────────────────────────────────────────────────────────────
function DCSection({
  id,
  title,
  subtitle,
  children,
  gap = 48
}) {
  const ctx = React.useContext(DCCtx);
  const sid = id ?? title;
  const all = React.Children.toArray(children);
  const artboards = all.filter(c => c && c.type === DCArtboard);
  const rest = all.filter(c => !(c && c.type === DCArtboard));
  const srcOrder = artboards.map(a => a.props.id ?? a.props.label);
  const sec = ctx && sid && ctx.section(sid) || {};
  const order = React.useMemo(() => {
    const kept = (sec.order || []).filter(k => srcOrder.includes(k));
    return [...kept, ...srcOrder.filter(k => !kept.includes(k))];
  }, [sec.order, srcOrder.join('|')]);
  const byId = Object.fromEntries(artboards.map(a => [a.props.id ?? a.props.label, a]));
  return /*#__PURE__*/React.createElement("div", {
    "data-dc-section": sid,
    style: {
      marginBottom: 80,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 60px 56px'
    }
  }, /*#__PURE__*/React.createElement(DCEditable, {
    tag: "div",
    value: sec.title ?? title,
    onChange: v => ctx && sid && ctx.patchSection(sid, {
      title: v
    }),
    style: {
      fontSize: 28,
      fontWeight: 600,
      color: DC.title,
      letterSpacing: -0.4,
      marginBottom: 6,
      display: 'inline-block'
    }
  }), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      color: DC.subtitle
    }
  }, subtitle)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap,
      padding: '0 60px',
      alignItems: 'flex-start',
      width: 'max-content'
    }
  }, order.map(k => /*#__PURE__*/React.createElement(DCArtboardFrame, {
    key: k,
    sectionId: sid,
    artboard: byId[k],
    order: order,
    label: (sec.labels || {})[k] ?? byId[k].props.label,
    onRename: v => ctx && ctx.patchSection(sid, x => ({
      labels: {
        ...x.labels,
        [k]: v
      }
    })),
    onReorder: next => ctx && ctx.patchSection(sid, {
      order: next
    }),
    onFocus: () => ctx && ctx.setFocus(`${sid}/${k}`)
  }))), rest);
}

// DCArtboard — marker; rendered by DCArtboardFrame via DCSection.
function DCArtboard() {
  return null;
}
function DCArtboardFrame({
  sectionId,
  artboard,
  label,
  order,
  onRename,
  onReorder,
  onFocus
}) {
  const {
    id: rawId,
    label: rawLabel,
    width = 260,
    height = 480,
    children,
    style = {}
  } = artboard.props;
  const id = rawId ?? rawLabel;
  const ref = React.useRef(null);

  // Live drag-reorder: dragged card sticks to cursor; siblings slide into
  // their would-be slots in real time via transforms. DOM order only
  // changes on drop.
  const onGripDown = e => {
    e.preventDefault();
    e.stopPropagation();
    const me = ref.current;
    // translateX is applied in local (pre-scale) space but pointer deltas and
    // getBoundingClientRect().left are screen-space — divide by the viewport's
    // current scale so the dragged card tracks the cursor at any zoom level.
    const scale = me.getBoundingClientRect().width / me.offsetWidth || 1;
    const peers = Array.from(document.querySelectorAll(`[data-dc-section="${sectionId}"] [data-dc-slot]`));
    const homes = peers.map(el => ({
      el,
      id: el.dataset.dcSlot,
      x: el.getBoundingClientRect().left
    }));
    const slotXs = homes.map(h => h.x);
    const startIdx = order.indexOf(id);
    const startX = e.clientX;
    let liveOrder = order.slice();
    me.classList.add('dc-dragging');
    const layout = () => {
      for (const h of homes) {
        if (h.id === id) continue;
        const slot = liveOrder.indexOf(h.id);
        h.el.style.transform = `translateX(${(slotXs[slot] - h.x) / scale}px)`;
      }
    };
    const move = ev => {
      const dx = ev.clientX - startX;
      me.style.transform = `translateX(${dx / scale}px)`;
      const cur = homes[startIdx].x + dx;
      let nearest = 0,
        best = Infinity;
      for (let i = 0; i < slotXs.length; i++) {
        const d = Math.abs(slotXs[i] - cur);
        if (d < best) {
          best = d;
          nearest = i;
        }
      }
      if (liveOrder.indexOf(id) !== nearest) {
        liveOrder = order.filter(k => k !== id);
        liveOrder.splice(nearest, 0, id);
        layout();
      }
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      const finalSlot = liveOrder.indexOf(id);
      me.classList.remove('dc-dragging');
      me.style.transform = `translateX(${(slotXs[finalSlot] - homes[startIdx].x) / scale}px)`;
      // After the settle transition, kill transitions + clear transforms +
      // commit the reorder in the same frame so there's no visual snap-back.
      setTimeout(() => {
        for (const h of homes) {
          h.el.style.transition = 'none';
          h.el.style.transform = '';
        }
        if (liveOrder.join('|') !== order.join('|')) onReorder(liveOrder);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          for (const h of homes) h.el.style.transition = '';
        }));
      }, 180);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    "data-dc-slot": id,
    style: {
      position: 'relative',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-labelrow",
    style: {
      position: 'absolute',
      bottom: '100%',
      left: -4,
      marginBottom: 4,
      color: DC.label
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-grip",
    onPointerDown: onGripDown,
    title: "Drag to reorder"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "9",
    height: "13",
    viewBox: "0 0 9 13",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "2",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "2",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "6.5",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "6.5",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "11",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "11",
    r: "1.1"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dc-labeltext",
    onClick: onFocus,
    title: "Click to focus"
  }, /*#__PURE__*/React.createElement(DCEditable, {
    value: label,
    onChange: onRename,
    onClick: e => e.stopPropagation(),
    style: {
      fontSize: 15,
      fontWeight: 500,
      color: DC.label,
      lineHeight: 1
    }
  }))), /*#__PURE__*/React.createElement("button", {
    className: "dc-expand",
    onClick: onFocus,
    onPointerDown: e => e.stopPropagation(),
    title: "Focus"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M7 1h4v4M5 11H1V7M11 1L7.5 4.5M1 11l3.5-3.5"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dc-card",
    style: {
      borderRadius: 2,
      boxShadow: '0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06)',
      overflow: 'hidden',
      width,
      height,
      background: '#fff',
      ...style
    }
  }, children || /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#bbb',
      fontSize: 13,
      fontFamily: DC.font
    }
  }, id)));
}

// Inline rename — commits on blur or Enter.
function DCEditable({
  value,
  onChange,
  style,
  tag = 'span',
  onClick
}) {
  const T = tag;
  return /*#__PURE__*/React.createElement(T, {
    className: "dc-editable",
    contentEditable: true,
    suppressContentEditableWarning: true,
    onClick: onClick,
    onPointerDown: e => e.stopPropagation(),
    onBlur: e => onChange && onChange(e.currentTarget.textContent),
    onKeyDown: e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.currentTarget.blur();
      }
    },
    style: style
  }, value);
}

// ─────────────────────────────────────────────────────────────
// Focus mode — overlay one artboard; ←/→ within section, ↑/↓ across
// sections, Esc or backdrop click to exit.
// ─────────────────────────────────────────────────────────────
function DCFocusOverlay({
  entry,
  sectionMeta,
  sectionOrder
}) {
  const ctx = React.useContext(DCCtx);
  const {
    sectionId,
    artboard
  } = entry;
  const sec = ctx.section(sectionId);
  const meta = sectionMeta[sectionId];
  const peers = meta.slotIds;
  const aid = artboard.props.id ?? artboard.props.label;
  const idx = peers.indexOf(aid);
  const secIdx = sectionOrder.indexOf(sectionId);
  const go = d => {
    const n = peers[(idx + d + peers.length) % peers.length];
    if (n) ctx.setFocus(`${sectionId}/${n}`);
  };
  const goSection = d => {
    const ns = sectionOrder[(secIdx + d + sectionOrder.length) % sectionOrder.length];
    const first = sectionMeta[ns] && sectionMeta[ns].slotIds[0];
    if (first) ctx.setFocus(`${ns}/${first}`);
  };
  React.useEffect(() => {
    const k = e => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        goSection(-1);
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        goSection(1);
      }
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  });
  const {
    width = 260,
    height = 480,
    children
  } = artboard.props;
  const [vp, setVp] = React.useState({
    w: window.innerWidth,
    h: window.innerHeight
  });
  React.useEffect(() => {
    const r = () => setVp({
      w: window.innerWidth,
      h: window.innerHeight
    });
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);
  const scale = Math.max(0.1, Math.min((vp.w - 200) / width, (vp.h - 260) / height, 2));
  const [ddOpen, setDd] = React.useState(false);
  const Arrow = ({
    dir,
    onClick
  }) => /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onClick();
    },
    style: {
      position: 'absolute',
      top: '50%',
      [dir]: 28,
      transform: 'translateY(-50%)',
      border: 'none',
      background: 'rgba(255,255,255,.08)',
      color: 'rgba(255,255,255,.9)',
      width: 44,
      height: 44,
      borderRadius: 22,
      fontSize: 18,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background .15s'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,.18)',
    onMouseLeave: e => e.currentTarget.style.background = 'rgba(255,255,255,.08)'
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 18 18",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: dir === 'left' ? 'M11 3L5 9l6 6' : 'M7 3l6 6-6 6'
  })));

  // Portal to body so position:fixed is the real viewport regardless of any
  // transform on DesignCanvas's ancestors (including the canvas zoom itself).
  return ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    onClick: () => ctx.setFocus(null),
    onWheel: e => e.preventDefault(),
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(24,20,16,.6)',
      backdropFilter: 'blur(14px)',
      fontFamily: DC.font,
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 72,
      display: 'flex',
      alignItems: 'flex-start',
      padding: '16px 20px 0',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setDd(o => !o),
    style: {
      border: 'none',
      background: 'transparent',
      color: '#fff',
      cursor: 'pointer',
      padding: '6px 8px',
      borderRadius: 6,
      textAlign: 'left',
      fontFamily: 'inherit'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      letterSpacing: -0.3
    }
  }, meta.title), /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 11 11",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    style: {
      opacity: .7
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 4l3.5 3.5L9 4"
  }))), meta.subtitle && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 13,
      opacity: .6,
      fontWeight: 400,
      marginTop: 2
    }
  }, meta.subtitle)), ddOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '100%',
      left: 0,
      marginTop: 4,
      background: '#2a251f',
      borderRadius: 8,
      boxShadow: '0 8px 32px rgba(0,0,0,.4)',
      padding: 4,
      minWidth: 200,
      zIndex: 10
    }
  }, sectionOrder.map(sid => /*#__PURE__*/React.createElement("button", {
    key: sid,
    onClick: () => {
      setDd(false);
      const f = sectionMeta[sid].slotIds[0];
      if (f) ctx.setFocus(`${sid}/${f}`);
    },
    style: {
      display: 'block',
      width: '100%',
      textAlign: 'left',
      border: 'none',
      cursor: 'pointer',
      background: sid === sectionId ? 'rgba(255,255,255,.1)' : 'transparent',
      color: '#fff',
      padding: '8px 12px',
      borderRadius: 5,
      fontSize: 14,
      fontWeight: sid === sectionId ? 600 : 400,
      fontFamily: 'inherit'
    }
  }, sectionMeta[sid].title)))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => ctx.setFocus(null),
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,.12)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent',
    style: {
      border: 'none',
      background: 'transparent',
      color: 'rgba(255,255,255,.7)',
      width: 32,
      height: 32,
      borderRadius: 16,
      fontSize: 20,
      cursor: 'pointer',
      lineHeight: 1,
      transition: 'background .12s'
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 64,
      bottom: 56,
      left: 100,
      right: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: width * scale,
      height: height * scale,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      background: '#fff',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: '0 20px 80px rgba(0,0,0,.4)'
    }
  }, children || /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#bbb'
    }
  }, aid))), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      fontSize: 14,
      fontWeight: 500,
      opacity: .85,
      textAlign: 'center'
    }
  }, (sec.labels || {})[aid] ?? artboard.props.label, /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: .5,
      marginLeft: 10,
      fontVariantNumeric: 'tabular-nums'
    }
  }, idx + 1, " / ", peers.length))), /*#__PURE__*/React.createElement(Arrow, {
    dir: "left",
    onClick: () => go(-1)
  }), /*#__PURE__*/React.createElement(Arrow, {
    dir: "right",
    onClick: () => go(1)
  }), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 8
    }
  }, peers.map((p, i) => /*#__PURE__*/React.createElement("button", {
    key: p,
    onClick: () => ctx.setFocus(`${sectionId}/${p}`),
    style: {
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      width: 6,
      height: 6,
      borderRadius: 3,
      background: i === idx ? '#fff' : 'rgba(255,255,255,.3)'
    }
  })))), document.body);
}

// ─────────────────────────────────────────────────────────────
// Post-it — absolute-positioned sticky note
// ─────────────────────────────────────────────────────────────
function DCPostIt({
  children,
  top,
  left,
  right,
  bottom,
  rotate = -2,
  width = 180
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top,
      left,
      right,
      bottom,
      width,
      background: DC.postitBg,
      padding: '14px 16px',
      fontFamily: '"Comic Sans MS", "Marker Felt", "Segoe Print", cursive',
      fontSize: 14,
      lineHeight: 1.4,
      color: DC.postitText,
      boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
      transform: `rotate(${rotate}deg)`,
      zIndex: 5
    }
  }, children);
}
Object.assign(window, {
  DesignCanvas,
  DCSection,
  DCArtboard,
  DCPostIt
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/intro_flode/design-canvas.jsx", error: String((e && e.message) || e) }); }

// ui_kits/trupp/app.jsx
try { (() => {
/* Trupp-canvas — app-skal */

const {
  DesignCanvas,
  DCSection,
  DCArtboard
} = window;
const {
  TruppScreen,
  NotesTrupp
} = window.TruppArtboards;
function ArtboardWithNotes({
  children,
  notes
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, children, notes);
}
function App() {
  return /*#__PURE__*/React.createElement(DesignCanvas, null, /*#__PURE__*/React.createElement(DCSection, {
    id: "trupp",
    title: "Trupp \u2014 A-laget",
    subtitle: "Lista (default) + Plan-toggle. Gruppera p\xE5 position, sortera p\xE5 form. Tre actions per rad: 11, F\xF6rl\xE4ng, Stats."
  }, /*#__PURE__*/React.createElement(DCArtboard, {
    id: "trupp-screen",
    label: "Trupp \xB7 22 spelare",
    width: 780,
    height: 820
  }, /*#__PURE__*/React.createElement(ArtboardWithNotes, {
    notes: /*#__PURE__*/React.createElement(NotesTrupp, null)
  }, /*#__PURE__*/React.createElement(TruppScreen, null)))));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/trupp/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/trupp/artboards.jsx
try { (() => {
/* Trupp-skärmen för Bandy Manager.
 * Två lägen: Lista (default, tät) och Plan (formation 1-3-2-4-1).
 * Gruppera på position: MV → B → YH → MF → A. Sortera på form inom grupp.
 * Filter-rad: Alla / Skadade / Kontrakt går ut / U21.
 * Tre primära actions per spelarrad: Elva-toggle, Förläng (om kontrakt går ut), Stats.
 */

const {
  useState,
  useMemo
} = React;

/* ───────────────────────── Trupp-data (mock) ───────────────────────── */

const POS_ORDER = ['MV', 'B', 'YH', 'MF', 'A'];
const POS_LABEL = {
  MV: 'Målvakt',
  B: 'Backar',
  YH: 'Halvbackar',
  MF: 'Mittfältare',
  A: 'Anfallare'
};

// 22 spelare, baserat på Forsbacka som default-klubb
const SQUAD = [
// MV (2)
{
  id: 1,
  num: 1,
  name: 'Erik Lundberg',
  pos: 'MV',
  age: 31,
  form: 84,
  status: 'redo',
  contractEnd: 2027,
  salaryKr: 38000,
  moral: 78,
  u21: false
}, {
  id: 2,
  num: 25,
  name: 'Jakob Hedström',
  pos: 'MV',
  age: 23,
  form: 71,
  status: 'redo',
  contractEnd: 2026,
  salaryKr: 22000,
  moral: 65,
  u21: false
},
// B (3)
{
  id: 3,
  num: 4,
  name: 'Anders Berg',
  pos: 'B',
  age: 29,
  form: 79,
  status: 'redo',
  contractEnd: 2027,
  salaryKr: 32000,
  moral: 72,
  u21: false
}, {
  id: 4,
  num: 5,
  name: 'Mats Eriksson',
  pos: 'B',
  age: 33,
  form: 76,
  status: 'skadad',
  contractEnd: 2026,
  salaryKr: 30000,
  moral: 60,
  u21: false,
  injuryDays: 12
}, {
  id: 5,
  num: 6,
  name: 'Daniel Persson',
  pos: 'B',
  age: 26,
  form: 81,
  status: 'redo',
  contractEnd: 2028,
  salaryKr: 35000,
  moral: 80,
  u21: false
},
// YH (4)
{
  id: 6,
  num: 2,
  name: 'Lukas Sjögren',
  pos: 'YH',
  age: 24,
  form: 88,
  status: 'redo',
  contractEnd: 2027,
  salaryKr: 34000,
  moral: 84,
  u21: false
}, {
  id: 7,
  num: 3,
  name: 'Pontus Nilsson',
  pos: 'YH',
  age: 28,
  form: 75,
  status: 'redo',
  contractEnd: 2026,
  salaryKr: 31000,
  moral: 68,
  u21: false
}, {
  id: 8,
  num: 14,
  name: 'Hampus Karlsson',
  pos: 'YH',
  age: 21,
  form: 82,
  status: 'redo',
  contractEnd: 2026,
  salaryKr: 24000,
  moral: 75,
  u21: true
}, {
  id: 9,
  num: 15,
  name: 'Oscar Lind',
  pos: 'YH',
  age: 27,
  form: 70,
  status: 'bänken',
  contractEnd: 2027,
  salaryKr: 28000,
  moral: 55,
  u21: false
},
// MF (8)
{
  id: 10,
  num: 7,
  name: 'Filip Andersson',
  pos: 'MF',
  age: 25,
  form: 90,
  status: 'redo',
  contractEnd: 2028,
  salaryKr: 42000,
  moral: 88,
  u21: false
}, {
  id: 11,
  num: 8,
  name: 'Marcus Olofsson',
  pos: 'MF',
  age: 30,
  form: 86,
  status: 'redo',
  contractEnd: 2027,
  salaryKr: 40000,
  moral: 82,
  u21: false
}, {
  id: 12,
  num: 9,
  name: 'Viktor Engström',
  pos: 'MF',
  age: 22,
  form: 83,
  status: 'redo',
  contractEnd: 2026,
  salaryKr: 26000,
  moral: 78,
  u21: false
}, {
  id: 13,
  num: 10,
  name: 'Simon Forsberg',
  pos: 'MF',
  age: 27,
  form: 80,
  status: 'redo',
  contractEnd: 2027,
  salaryKr: 36000,
  moral: 74,
  u21: false
}, {
  id: 14,
  num: 11,
  name: 'Theo Wallin',
  pos: 'MF',
  age: 19,
  form: 76,
  status: 'redo',
  contractEnd: 2027,
  salaryKr: 18000,
  moral: 70,
  u21: true
}, {
  id: 15,
  num: 16,
  name: 'Albin Holm',
  pos: 'MF',
  age: 24,
  form: 73,
  status: 'redo',
  contractEnd: 2026,
  salaryKr: 27000,
  moral: 62,
  u21: false
}, {
  id: 16,
  num: 17,
  name: 'Gustav Strand',
  pos: 'MF',
  age: 32,
  form: 78,
  status: 'redo',
  contractEnd: 2026,
  salaryKr: 33000,
  moral: 70,
  u21: false
}, {
  id: 17,
  num: 18,
  name: 'Jonas Ek',
  pos: 'MF',
  age: 20,
  form: 68,
  status: 'bänken',
  contractEnd: 2028,
  salaryKr: 19000,
  moral: 58,
  u21: true
},
// A (5)
{
  id: 18,
  num: 12,
  name: 'David Kronberg',
  pos: 'A',
  age: 28,
  form: 92,
  status: 'redo',
  contractEnd: 2028,
  salaryKr: 48000,
  moral: 90,
  u21: false
}, {
  id: 19,
  num: 13,
  name: 'Adam Sundström',
  pos: 'A',
  age: 26,
  form: 85,
  status: 'redo',
  contractEnd: 2026,
  salaryKr: 39000,
  moral: 80,
  u21: false
}, {
  id: 20,
  num: 19,
  name: 'Linus Wikström',
  pos: 'A',
  age: 24,
  form: 79,
  status: 'redo',
  contractEnd: 2027,
  salaryKr: 34000,
  moral: 75,
  u21: false
}, {
  id: 21,
  num: 20,
  name: 'Nils Johansson',
  pos: 'A',
  age: 18,
  form: 74,
  status: 'redo',
  contractEnd: 2027,
  salaryKr: 16000,
  moral: 72,
  u21: true
}, {
  id: 22,
  num: 21,
  name: 'Edvin Brink',
  pos: 'A',
  age: 23,
  form: 72,
  status: 'skadad',
  contractEnd: 2026,
  salaryKr: 25000,
  moral: 50,
  u21: false,
  injuryDays: 5
}];

// Default startelva (11 spelare, formation 1-3-2-4-1)
const DEFAULT_ELEVEN = new Set([1, 3, 4, 5, 6, 7, 10, 11, 12, 13, 18]);
const CURRENT_SEASON = 2026;

/* ───────────────────────── Hjälp-komponenter ───────────────────────── */

function FormBar({
  value
}) {
  const color = value >= 85 ? 'var(--success)' : value >= 70 ? 'var(--accent)' : value >= 60 ? '#B8A48C' : 'var(--danger)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 4,
      borderRadius: 2,
      background: 'var(--border-light, #E5DDD0)',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: `${value}%`,
      background: color
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'Georgia, serif',
      fontSize: 12,
      color: 'var(--text-primary)',
      minWidth: 18,
      textAlign: 'right',
      fontWeight: 600
    }
  }, value));
}
function StatusTag({
  status,
  injuryDays
}) {
  if (status === 'redo') return null; // Inga taggar för redo — texten räcker
  const map = {
    skadad: {
      label: injuryDays ? `Skadad · ${injuryDays}d` : 'Skadad',
      color: 'var(--danger)',
      bg: 'rgba(176,80,64,0.10)'
    },
    bänken: {
      label: 'Bänken',
      color: 'var(--text-muted)',
      bg: 'rgba(138,133,122,0.12)'
    }
  };
  const s = map[status];
  if (!s) return null;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: s.color,
      background: s.bg,
      padding: '2px 7px',
      borderRadius: 3,
      fontWeight: 600
    }
  }, s.label);
}
function ContractBadge({
  endYear
}) {
  const yearsLeft = endYear - CURRENT_SEASON;
  let color, bg, label;
  if (yearsLeft <= 0) {
    color = 'var(--danger)';
    bg = 'rgba(176,80,64,0.10)';
    label = `Går ut vår ${endYear}`;
  } else if (yearsLeft === 1) {
    color = 'var(--accent)';
    bg = 'rgba(196,122,58,0.10)';
    label = `→ ${endYear}`;
  } else {
    color = 'var(--text-secondary)';
    bg = 'transparent';
    label = `→ ${endYear}`;
  }
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontFamily: 'Georgia, serif',
      color,
      background: bg,
      padding: bg === 'transparent' ? 0 : '2px 6px',
      borderRadius: 2,
      fontStyle: 'italic'
    }
  }, label);
}
function NumberCircle({
  num,
  inEleven
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 28,
      height: 28,
      borderRadius: '50%',
      background: inEleven ? 'var(--accent)' : 'var(--bg-surface, #FAF6EE)',
      border: `1px solid ${inEleven ? 'var(--accent)' : 'var(--border, #D8CDB8)'}`,
      color: inEleven ? '#fff' : 'var(--text-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Georgia, serif',
      fontSize: 12,
      fontWeight: 700,
      flexShrink: 0
    }
  }, num);
}

/* ───────────────────────── Spelarrad (lista) ───────────────────────── */

function PlayerRow({
  player,
  inEleven,
  onToggleEleven,
  onExtend,
  onStats
}) {
  const goingOut = player.contractEnd - CURRENT_SEASON <= 0;
  const isInactive = player.status === 'skadad';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '28px 1fr auto auto',
      alignItems: 'center',
      gap: 10,
      padding: '10px 14px',
      borderBottom: '1px solid var(--border-light, #E5DDD0)',
      background: 'var(--bg, #FAF6EE)',
      opacity: isInactive ? 0.6 : 1
    }
  }, /*#__PURE__*/React.createElement(NumberCircle, {
    num: player.num,
    inEleven: inEleven
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'Georgia, serif',
      fontSize: 14,
      fontWeight: 600,
      color: 'var(--text-primary)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      letterSpacing: '0.2px'
    }
  }, player.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginTop: 2,
      fontSize: 10,
      color: 'var(--text-secondary)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic'
    }
  }, player.age, " \xE5r"), /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: 0.4
    }
  }, "\xB7"), /*#__PURE__*/React.createElement(ContractBadge, {
    endYear: player.contractEnd
  }), player.u21 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: 0.4
    }
  }, "\xB7"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: 'var(--accent)',
      fontWeight: 600
    }
  }, "U21")), player.status !== 'redo' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: 0.4
    }
  }, "\xB7"), /*#__PURE__*/React.createElement(StatusTag, {
    status: player.status,
    injuryDays: player.injuryDays
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 8,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      fontWeight: 600
    }
  }, "FORM"), /*#__PURE__*/React.createElement(FormBar, {
    value: player.form
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(ActionButton, {
    label: "11",
    active: inEleven,
    disabled: isInactive,
    onClick: () => !isInactive && onToggleEleven(player.id),
    title: inEleven ? 'I startelvan' : 'Sätt i startelvan'
  }), goingOut && /*#__PURE__*/React.createElement(ActionButton, {
    label: "F\xF6rl\xE4ng",
    warm: true,
    onClick: () => onExtend(player),
    title: "F\xF6rl\xE4ng kontrakt"
  }), /*#__PURE__*/React.createElement(ActionButton, {
    icon: "stats",
    onClick: () => onStats(player),
    title: "Statistik & portr\xE4tt"
  })));
}
function ActionButton({
  label,
  icon,
  active,
  warm,
  disabled,
  onClick,
  title
}) {
  let bg, color, border;
  if (disabled) {
    bg = 'transparent';
    color = 'var(--text-muted)';
    border = '1px solid var(--border-light, #E5DDD0)';
  } else if (active) {
    bg = 'var(--accent)';
    color = '#fff';
    border = '1px solid var(--accent)';
  } else if (warm) {
    bg = 'rgba(196,122,58,0.10)';
    color = 'var(--accent-dark, #8a5325)';
    border = '1px solid rgba(196,122,58,0.40)';
  } else {
    bg = 'transparent';
    color = 'var(--text-secondary)';
    border = '1px solid var(--border, #D8CDB8)';
  }
  return /*#__PURE__*/React.createElement("button", {
    title: title,
    disabled: disabled,
    onClick: onClick,
    style: {
      height: 26,
      minWidth: icon ? 26 : 0,
      padding: icon ? 0 : '0 8px',
      background: bg,
      color,
      border,
      borderRadius: 4,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: label === 'Förläng' ? 0.5 : 1,
      textTransform: label === 'Förläng' ? 'none' : 'uppercase',
      fontFamily: 'var(--font-body, system-ui, sans-serif)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }
  }, icon === 'stats' ? /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 12 12",
    fill: "none"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "1.5",
    y: "7",
    width: "2",
    height: "4",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "5",
    y: "4.5",
    width: "2",
    height: "6.5",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "8.5",
    y: "2",
    width: "2",
    height: "9",
    fill: "currentColor"
  })) : label);
}

/* ───────────────────────── Position-grupp ───────────────────────── */

function PositionGroup({
  posCode,
  players,
  eleven,
  onToggleEleven,
  onExtend,
  onStats
}) {
  const inElevenCount = players.filter(p => eleven.has(p.id)).length;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 14px 4px',
      background: 'var(--bg-surface, #FAF6EE)',
      borderTop: '1px solid var(--border, #D8CDB8)',
      borderBottom: '1px solid var(--border-light, #E5DDD0)',
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9,
      letterSpacing: 2,
      textTransform: 'uppercase',
      color: 'var(--accent-dark, #8a5325)',
      fontWeight: 700
    }
  }, POS_LABEL[posCode]), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      color: 'var(--text-secondary)'
    }
  }, inElevenCount, " i elvan \xB7 ", players.length, " totalt")), players.map(p => /*#__PURE__*/React.createElement(PlayerRow, {
    key: p.id,
    player: p,
    inEleven: eleven.has(p.id),
    onToggleEleven: onToggleEleven,
    onExtend: onExtend,
    onStats: onStats
  })));
}

/* ───────────────────────── Filter-rad ───────────────────────── */

function FilterRow({
  filter,
  setFilter,
  counts
}) {
  const filters = [{
    id: 'all',
    label: 'Alla',
    count: counts.all
  }, {
    id: 'injured',
    label: 'Skadade',
    count: counts.injured
  }, {
    id: 'expiring',
    label: 'Kontrakt ut',
    count: counts.expiring
  }, {
    id: 'u21',
    label: 'U21',
    count: counts.u21
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      padding: '10px 12px',
      borderBottom: '1px solid var(--border-light, #E5DDD0)',
      background: 'var(--bg-paper, #EDE8DF)',
      overflowX: 'auto'
    }
  }, filters.map(f => {
    const active = filter === f.id;
    return /*#__PURE__*/React.createElement("button", {
      key: f.id,
      onClick: () => setFilter(f.id),
      style: {
        flexShrink: 0,
        padding: '6px 10px',
        background: active ? 'var(--accent)' : 'transparent',
        color: active ? '#fff' : 'var(--text-secondary)',
        border: `1px solid ${active ? 'var(--accent)' : 'var(--border, #D8CDB8)'}`,
        borderRadius: 4,
        cursor: 'pointer',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 1,
        textTransform: 'uppercase',
        fontFamily: 'var(--font-body, system-ui, sans-serif)',
        display: 'flex',
        alignItems: 'center',
        gap: 5
      }
    }, f.label, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'Georgia, serif',
        fontWeight: 400,
        fontSize: 11,
        opacity: active ? 0.85 : 0.6,
        letterSpacing: 0
      }
    }, f.count));
  }));
}

/* ───────────────────────── Mode-toggle ───────────────────────── */

function ModeToggle({
  mode,
  setMode
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      border: '1px solid var(--border, #D8CDB8)',
      borderRadius: 4,
      overflow: 'hidden'
    }
  }, ['lista', 'plan'].map(m => /*#__PURE__*/React.createElement("button", {
    key: m,
    onClick: () => setMode(m),
    style: {
      padding: '5px 12px',
      background: mode === m ? 'var(--accent)' : 'transparent',
      color: mode === m ? '#fff' : 'var(--text-secondary)',
      border: 'none',
      cursor: 'pointer',
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 1,
      textTransform: 'uppercase',
      fontFamily: 'var(--font-body, system-ui, sans-serif)'
    }
  }, m)));
}

/* ───────────────────────── Plan-läge (formation) ───────────────────────── */

function FormationView({
  players,
  eleven
}) {
  const playerById = id => players.find(p => p.id === id);
  const elevenIds = [...eleven];

  // Sortera per position
  const byPos = {};
  POS_ORDER.forEach(pos => byPos[pos] = []);
  elevenIds.forEach(id => {
    const p = playerById(id);
    if (p) byPos[p.pos].push(p);
  });
  const rows = [{
    pos: 'A',
    players: byPos.A,
    width: '60%'
  }, {
    pos: 'MF',
    players: byPos.MF,
    width: '92%'
  }, {
    pos: 'YH',
    players: byPos.YH,
    width: '76%'
  }, {
    pos: 'B',
    players: byPos.B,
    width: '60%'
  }, {
    pos: 'MV',
    players: byPos.MV,
    width: '20%'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '24px 18px',
      background: 'linear-gradient(180deg, #4a6e3a 0%, #5b7d44 100%)',
      minHeight: 540,
      position: 'relative',
      borderBottom: '1px solid var(--border, #D8CDB8)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      height: 1,
      background: 'rgba(255,255,255,0.18)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: 60,
      height: 60,
      marginTop: -30,
      marginLeft: -30,
      borderRadius: '50%',
      border: '1px solid rgba(255,255,255,0.18)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 28,
      height: '100%',
      position: 'relative',
      zIndex: 1
    }
  }, rows.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.pos,
    style: {
      display: 'flex',
      justifyContent: 'space-around',
      margin: '0 auto',
      width: r.width
    }
  }, r.players.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.id,
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: '50%',
      background: 'var(--bg, #FAF6EE)',
      border: '2px solid #fff',
      color: 'var(--text-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Georgia, serif',
      fontSize: 14,
      fontWeight: 700,
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }
  }, p.num), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: '#fff',
      fontFamily: 'Georgia, serif',
      fontWeight: 600,
      textShadow: '0 1px 2px rgba(0,0,0,0.5)',
      whiteSpace: 'nowrap'
    }
  }, p.name.split(' ').slice(-1)[0])))))));
}

/* ───────────────────────── Trupp-skärmen ───────────────────────── */

function TruppScreen() {
  const [mode, setMode] = useState('lista'); // 'lista' | 'plan'
  const [filter, setFilter] = useState('all');
  const [eleven, setEleven] = useState(DEFAULT_ELEVEN);
  const counts = useMemo(() => ({
    all: SQUAD.length,
    injured: SQUAD.filter(p => p.status === 'skadad').length,
    expiring: SQUAD.filter(p => p.contractEnd - CURRENT_SEASON <= 0).length,
    u21: SQUAD.filter(p => p.u21).length
  }), []);
  const filtered = useMemo(() => {
    let list = SQUAD;
    if (filter === 'injured') list = list.filter(p => p.status === 'skadad');
    if (filter === 'expiring') list = list.filter(p => p.contractEnd - CURRENT_SEASON <= 0);
    if (filter === 'u21') list = list.filter(p => p.u21);
    return list;
  }, [filter]);
  const grouped = useMemo(() => {
    const m = {};
    POS_ORDER.forEach(pos => m[pos] = []);
    filtered.forEach(p => m[p.pos].push(p));
    POS_ORDER.forEach(pos => {
      m[pos].sort((a, b) => b.form - a.form);
    });
    return m;
  }, [filtered]);
  const toggleEleven = id => {
    setEleven(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);else next.add(id);
      return next;
    });
  };
  const extend = p => console.log('Förläng', p.name);
  const stats = p => console.log('Stats', p.name);
  return /*#__PURE__*/React.createElement("div", {
    className: "phone phone-light"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px',
      background: 'var(--bg-leather-dark, #2C2A24)',
      borderBottom: '2px solid var(--accent)',
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9,
      letterSpacing: 3,
      textTransform: 'uppercase',
      color: 'var(--accent)',
      opacity: 0.85,
      fontWeight: 600
    }
  }, "Forsbacka BK \xB7 A-trupp"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'Georgia, serif',
      fontSize: 22,
      fontWeight: 700,
      color: '#F5F1EB',
      marginTop: 2,
      letterSpacing: 0.3
    }
  }, "Trupp")), /*#__PURE__*/React.createElement(ModeToggle, {
    mode: mode,
    setMode: setMode
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      fontSize: 11,
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      color: '#C9B89A'
    }
  }, SQUAD.length, " spelare \xB7 ", eleven.size, "/11 i startelvan \xB7 s\xE4song ", CURRENT_SEASON)), mode === 'lista' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(FilterRow, {
    filter: filter,
    setFilter: setFilter,
    counts: counts
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto'
    }
  }, POS_ORDER.map(pos => grouped[pos].length > 0 && /*#__PURE__*/React.createElement(PositionGroup, {
    key: pos,
    posCode: pos,
    players: grouped[pos],
    eleven: eleven,
    onToggleEleven: toggleEleven,
    onExtend: extend,
    onStats: stats
  })))), mode === 'plan' && /*#__PURE__*/React.createElement(FormationView, {
    players: SQUAD,
    eleven: eleven
  }));
}

/* ───────────────────────── Notes-panel ───────────────────────── */

function NotesTrupp() {
  return /*#__PURE__*/React.createElement("div", {
    className: "notes",
    style: {
      left: 'calc(100% + 32px)',
      width: 380
    }
  }, /*#__PURE__*/React.createElement("h4", null, "Trupp \u2014 \xF6verblick + djup p\xE5 ett"), /*#__PURE__*/React.createElement("p", null, "Lista \xE4r default; Plan \xE4r toggleable. T\xE4t rad: nummer, namn, form, tre actions. Trippelkolumnen st\xE5r sig p\xE5 375 px om kontraktsbadgen bara visas n\xE4r den \xE4r aktuell."), /*#__PURE__*/React.createElement("h5", null, "L\xE4gen"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("em", null, "Lista"), " \u2014 gruppera p\xE5 position (MV \u2192 A), sortera p\xE5 form. Skadad-rad dimmas (opacity 0.6)."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("em", null, "Plan"), " \u2014 formation 1-3-2-4-1 \xF6ver bandyplan (gr\xF6n bakgrund, mittlinje + cirkel). Visar bara namn + nummer per spelare i elvan.")), /*#__PURE__*/React.createElement("h5", null, "Filter"), /*#__PURE__*/React.createElement("p", null, "Alla / Skadade / Kontrakt g\xE5r ut / U21. Antal per filter visas inline i Georgia."), /*#__PURE__*/React.createElement("h5", null, "Spelarrad \u2014 tre actions"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("em", null, "11"), " \u2014 toggle in/ut ur startelvan. Aktiv = kopparfylld, inaktiv = outline. Skadade = disabled."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("em", null, "F\xF6rl\xE4ng"), " \u2014 visas bara om kontraktet g\xE5r ut innevarande s\xE4song (varm kopparton)."), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("em", null, "\uD83D\uDCCA"), " \u2014 alltid synlig, leder till spelarportr\xE4tt + stats.")), /*#__PURE__*/React.createElement("h5", null, "Form-bar"), /*#__PURE__*/React.createElement("p", null, "Liten 32\xD74-bar + 12px Georgia-siffra. Tr\xF6skel: 85+ gr\xF6n, 70-84 koppar, 60-69 bleknad, <60 r\xF6d."), /*#__PURE__*/React.createElement("h5", null, "Kontrakt-badge"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("em", null, "G\xE5r ut v\xE5r 2026"), " \u2014 r\xF6d, fylld pill (s\xE4song = current)"), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("em", null, "\u2192 2026"), " \u2014 koppar, fylld pill (1 \xE5r kvar)"), /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("em", null, "\u2192 2028"), " \u2014 secondary, ren text (\u22652 \xE5r)")), /*#__PURE__*/React.createElement("h5", null, "Header"), /*#__PURE__*/React.createElement("p", null, "M\xF6rkt l\xE4derband med kopparlinje under. Klubbnamn + \"A-trupp\" som meta-rad i 9px UPPERCASE; \"Trupp\" stort i Georgia. Subtext: spelarantal \xB7 elva-status \xB7 s\xE4song."), /*#__PURE__*/React.createElement("h5", null, "F\xF6rbjudet i denna vy"), /*#__PURE__*/React.createElement("ul", null, /*#__PURE__*/React.createElement("li", null, "Emojier p\xE5 status-tags (regel fr\xE5n tags-systemet)"), /*#__PURE__*/React.createElement("li", null, "Egen knapp-typ \u2014 ActionButton \xE4r en kompakt variant av .btn-outline/.btn-primary"), /*#__PURE__*/React.createElement("li", null, "Sortera p\xE5 namn eller \xE5lder som default \u2014 form \xE4r prim\xE4rt")));
}
window.TruppArtboards = {
  TruppScreen,
  NotesTrupp
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/trupp/artboards.jsx", error: String((e && e.message) || e) }); }

// ui_kits/trupp/design-canvas.jsx
try { (() => {
// DesignCanvas.jsx — Figma-ish design canvas wrapper
// Warm gray grid bg + Sections + Artboards + PostIt notes.
// Artboards are reorderable (grip-drag), labels/titles are inline-editable,
// and any artboard can be opened in a fullscreen focus overlay (←/→/Esc).
// State persists to a .design-canvas.state.json sidecar via the host
// bridge. No assets, no deps.
//
// Usage:
//   <DesignCanvas>
//     <DCSection id="onboarding" title="Onboarding" subtitle="First-run variants">
//       <DCArtboard id="a" label="A · Dusk" width={260} height={480}>…</DCArtboard>
//       <DCArtboard id="b" label="B · Minimal" width={260} height={480}>…</DCArtboard>
//     </DCSection>
//   </DesignCanvas>

const DC = {
  bg: '#f0eee9',
  grid: 'rgba(0,0,0,0.06)',
  label: 'rgba(60,50,40,0.7)',
  title: 'rgba(40,30,20,0.85)',
  subtitle: 'rgba(60,50,40,0.6)',
  postitBg: '#fef4a8',
  postitText: '#5a4a2a',
  font: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'
};

// One-time CSS injection (classes are dc-prefixed so they don't collide with
// the hosted design's own styles).
if (typeof document !== 'undefined' && !document.getElementById('dc-styles')) {
  const s = document.createElement('style');
  s.id = 'dc-styles';
  s.textContent = ['.dc-editable{cursor:text;outline:none;white-space:nowrap;border-radius:3px;padding:0 2px;margin:0 -2px}', '.dc-editable:focus{background:#fff;box-shadow:0 0 0 1.5px #c96442}', '[data-dc-slot]{transition:transform .18s cubic-bezier(.2,.7,.3,1)}', '[data-dc-slot].dc-dragging{transition:none;z-index:10;pointer-events:none}', '[data-dc-slot].dc-dragging .dc-card{box-shadow:0 12px 40px rgba(0,0,0,.25),0 0 0 2px #c96442;transform:scale(1.02)}', '.dc-card{transition:box-shadow .15s,transform .15s}', '.dc-card *{scrollbar-width:none}', '.dc-card *::-webkit-scrollbar{display:none}', '.dc-labelrow{display:flex;align-items:center;gap:4px;height:24px}', '.dc-grip{cursor:grab;display:flex;align-items:center;padding:5px 4px;border-radius:4px;transition:background .12s}', '.dc-grip:hover{background:rgba(0,0,0,.08)}', '.dc-grip:active{cursor:grabbing}', '.dc-labeltext{cursor:pointer;border-radius:4px;padding:3px 6px;display:flex;align-items:center;transition:background .12s}', '.dc-labeltext:hover{background:rgba(0,0,0,.05)}', '.dc-expand{position:absolute;bottom:100%;right:0;margin-bottom:5px;z-index:2;opacity:0;transition:opacity .12s,background .12s;', '  width:22px;height:22px;border-radius:5px;border:none;cursor:pointer;padding:0;', '  background:transparent;color:rgba(60,50,40,.7);display:flex;align-items:center;justify-content:center}', '.dc-expand:hover{background:rgba(0,0,0,.06);color:#2a251f}', '[data-dc-slot]:hover .dc-expand{opacity:1}'].join('\n');
  document.head.appendChild(s);
}
const DCCtx = React.createContext(null);

// ─────────────────────────────────────────────────────────────
// DesignCanvas — stateful wrapper around the pan/zoom viewport.
// Owns runtime state (per-section order, renamed titles/labels, focused
// artboard). Order/titles/labels persist to a .design-canvas.state.json
// sidecar next to the HTML. Reads go via plain fetch() so the saved
// arrangement is visible anywhere the HTML + sidecar are served together
// (omelette preview, direct link, downloaded zip). Writes go through the
// host's window.omelette bridge — editing requires the omelette runtime.
// Focus is ephemeral.
// ─────────────────────────────────────────────────────────────
const DC_STATE_FILE = '.design-canvas.state.json';
function DesignCanvas({
  children,
  minScale,
  maxScale,
  style
}) {
  const [state, setState] = React.useState({
    sections: {},
    focus: null
  });
  // Hold rendering until the sidecar read settles so the saved order/titles
  // appear on first paint (no source-order flash). didRead gates writes until
  // the read settles so the empty initial state can't clobber a slow read;
  // skipNextWrite suppresses the one echo-write that would otherwise follow
  // hydration.
  const [ready, setReady] = React.useState(false);
  const didRead = React.useRef(false);
  const skipNextWrite = React.useRef(false);
  React.useEffect(() => {
    let off = false;
    fetch('./' + DC_STATE_FILE).then(r => r.ok ? r.json() : null).then(saved => {
      if (off || !saved || !saved.sections) return;
      skipNextWrite.current = true;
      setState(s => ({
        ...s,
        sections: saved.sections
      }));
    }).catch(() => {}).finally(() => {
      didRead.current = true;
      if (!off) setReady(true);
    });
    const t = setTimeout(() => {
      if (!off) setReady(true);
    }, 150);
    return () => {
      off = true;
      clearTimeout(t);
    };
  }, []);
  React.useEffect(() => {
    if (!didRead.current) return;
    if (skipNextWrite.current) {
      skipNextWrite.current = false;
      return;
    }
    const t = setTimeout(() => {
      window.omelette?.writeFile(DC_STATE_FILE, JSON.stringify({
        sections: state.sections
      })).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [state.sections]);

  // Build registries synchronously from children so FocusOverlay can read
  // them in the same render. Only direct DCSection > DCArtboard children are
  // walked — wrapping them in other elements opts out of focus/reorder.
  const registry = {}; // slotId -> { sectionId, artboard }
  const sectionMeta = {}; // sectionId -> { title, subtitle, slotIds[] }
  const sectionOrder = [];
  React.Children.forEach(children, sec => {
    if (!sec || sec.type !== DCSection) return;
    const sid = sec.props.id ?? sec.props.title;
    if (!sid) return;
    sectionOrder.push(sid);
    const persisted = state.sections[sid] || {};
    const srcIds = [];
    React.Children.forEach(sec.props.children, ab => {
      if (!ab || ab.type !== DCArtboard) return;
      const aid = ab.props.id ?? ab.props.label;
      if (!aid) return;
      registry[`${sid}/${aid}`] = {
        sectionId: sid,
        artboard: ab
      };
      srcIds.push(aid);
    });
    const kept = (persisted.order || []).filter(k => srcIds.includes(k));
    sectionMeta[sid] = {
      title: persisted.title ?? sec.props.title,
      subtitle: sec.props.subtitle,
      slotIds: [...kept, ...srcIds.filter(k => !kept.includes(k))]
    };
  });
  const api = React.useMemo(() => ({
    state,
    section: id => state.sections[id] || {},
    patchSection: (id, p) => setState(s => ({
      ...s,
      sections: {
        ...s.sections,
        [id]: {
          ...s.sections[id],
          ...(typeof p === 'function' ? p(s.sections[id] || {}) : p)
        }
      }
    })),
    setFocus: slotId => setState(s => ({
      ...s,
      focus: slotId
    }))
  }), [state]);

  // Esc exits focus; any outside pointerdown commits an in-progress rename.
  React.useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') api.setFocus(null);
    };
    const onPd = e => {
      const ae = document.activeElement;
      if (ae && ae.isContentEditable && !ae.contains(e.target)) ae.blur();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPd, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPd, true);
    };
  }, [api]);
  return /*#__PURE__*/React.createElement(DCCtx.Provider, {
    value: api
  }, /*#__PURE__*/React.createElement(DCViewport, {
    minScale: minScale,
    maxScale: maxScale,
    style: style
  }, ready && children), state.focus && registry[state.focus] && /*#__PURE__*/React.createElement(DCFocusOverlay, {
    entry: registry[state.focus],
    sectionMeta: sectionMeta,
    sectionOrder: sectionOrder
  }));
}

// ─────────────────────────────────────────────────────────────
// DCViewport — transform-based pan/zoom (internal)
//
// Input mapping (Figma-style):
//   • trackpad pinch  → zoom   (ctrlKey wheel; Safari gesture* events)
//   • trackpad scroll → pan    (two-finger)
//   • mouse wheel     → zoom   (notched; distinguished from trackpad scroll)
//   • middle-drag / primary-drag-on-bg → pan
//
// Transform state lives in a ref and is written straight to the DOM
// (translate3d + will-change) so wheel ticks don't go through React —
// keeps pans at 60fps on dense canvases.
// ─────────────────────────────────────────────────────────────
function DCViewport({
  children,
  minScale = 0.1,
  maxScale = 8,
  style = {}
}) {
  const vpRef = React.useRef(null);
  const worldRef = React.useRef(null);
  const tf = React.useRef({
    x: 0,
    y: 0,
    scale: 1
  });
  const apply = React.useCallback(() => {
    const {
      x,
      y,
      scale
    } = tf.current;
    const el = worldRef.current;
    if (el) el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  }, []);
  React.useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const zoomAt = (cx, cy, factor) => {
      const r = vp.getBoundingClientRect();
      const px = cx - r.left,
        py = cy - r.top;
      const t = tf.current;
      const next = Math.min(maxScale, Math.max(minScale, t.scale * factor));
      const k = next / t.scale;
      // keep the world point under the cursor fixed
      t.x = px - (px - t.x) * k;
      t.y = py - (py - t.y) * k;
      t.scale = next;
      apply();
    };

    // Mouse-wheel vs trackpad-scroll heuristic. A physical wheel sends
    // line-mode deltas (Firefox) or large integer pixel deltas with no X
    // component (Chrome/Safari, typically multiples of 100/120). Trackpad
    // two-finger scroll sends small/fractional pixel deltas, often with
    // non-zero deltaX. ctrlKey is set by the browser for trackpad pinch.
    const isMouseWheel = e => e.deltaMode !== 0 || e.deltaX === 0 && Number.isInteger(e.deltaY) && Math.abs(e.deltaY) >= 40;
    const onWheel = e => {
      e.preventDefault();
      if (isGesturing) return; // Safari: gesture* owns the pinch — discard concurrent wheels
      if (e.ctrlKey) {
        // trackpad pinch (or explicit ctrl+wheel)
        zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.01));
      } else if (isMouseWheel(e)) {
        // notched mouse wheel — fixed-ratio step per click
        zoomAt(e.clientX, e.clientY, Math.exp(-Math.sign(e.deltaY) * 0.18));
      } else {
        // trackpad two-finger scroll — pan
        tf.current.x -= e.deltaX;
        tf.current.y -= e.deltaY;
        apply();
      }
    };

    // Safari sends native gesture* events for trackpad pinch with a smooth
    // e.scale; preferring these over the ctrl+wheel fallback gives a much
    // better feel there. No-ops on other browsers. Safari also fires
    // ctrlKey wheel events during the same pinch — isGesturing makes
    // onWheel drop those entirely so they neither zoom nor pan.
    let gsBase = 1;
    let isGesturing = false;
    const onGestureStart = e => {
      e.preventDefault();
      isGesturing = true;
      gsBase = tf.current.scale;
    };
    const onGestureChange = e => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, gsBase * e.scale / tf.current.scale);
    };
    const onGestureEnd = e => {
      e.preventDefault();
      isGesturing = false;
    };

    // Drag-pan: middle button anywhere, or primary button on canvas
    // background (anything that isn't an artboard or an inline editor).
    let drag = null;
    const onPointerDown = e => {
      const onBg = !e.target.closest('[data-dc-slot], .dc-editable');
      if (!(e.button === 1 || e.button === 0 && onBg)) return;
      e.preventDefault();
      vp.setPointerCapture(e.pointerId);
      drag = {
        id: e.pointerId,
        lx: e.clientX,
        ly: e.clientY
      };
      vp.style.cursor = 'grabbing';
    };
    const onPointerMove = e => {
      if (!drag || e.pointerId !== drag.id) return;
      tf.current.x += e.clientX - drag.lx;
      tf.current.y += e.clientY - drag.ly;
      drag.lx = e.clientX;
      drag.ly = e.clientY;
      apply();
    };
    const onPointerUp = e => {
      if (!drag || e.pointerId !== drag.id) return;
      vp.releasePointerCapture(e.pointerId);
      drag = null;
      vp.style.cursor = '';
    };
    vp.addEventListener('wheel', onWheel, {
      passive: false
    });
    vp.addEventListener('gesturestart', onGestureStart, {
      passive: false
    });
    vp.addEventListener('gesturechange', onGestureChange, {
      passive: false
    });
    vp.addEventListener('gestureend', onGestureEnd, {
      passive: false
    });
    vp.addEventListener('pointerdown', onPointerDown);
    vp.addEventListener('pointermove', onPointerMove);
    vp.addEventListener('pointerup', onPointerUp);
    vp.addEventListener('pointercancel', onPointerUp);
    return () => {
      vp.removeEventListener('wheel', onWheel);
      vp.removeEventListener('gesturestart', onGestureStart);
      vp.removeEventListener('gesturechange', onGestureChange);
      vp.removeEventListener('gestureend', onGestureEnd);
      vp.removeEventListener('pointerdown', onPointerDown);
      vp.removeEventListener('pointermove', onPointerMove);
      vp.removeEventListener('pointerup', onPointerUp);
      vp.removeEventListener('pointercancel', onPointerUp);
    };
  }, [apply, minScale, maxScale]);
  const gridSvg = `url("data:image/svg+xml,%3Csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M120 0H0v120' fill='none' stroke='${encodeURIComponent(DC.grid)}' stroke-width='1'/%3E%3C/svg%3E")`;
  return /*#__PURE__*/React.createElement("div", {
    ref: vpRef,
    className: "design-canvas",
    style: {
      height: '100vh',
      width: '100vw',
      background: DC.bg,
      overflow: 'hidden',
      overscrollBehavior: 'none',
      touchAction: 'none',
      position: 'relative',
      fontFamily: DC.font,
      boxSizing: 'border-box',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: worldRef,
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      transformOrigin: '0 0',
      willChange: 'transform',
      width: 'max-content',
      minWidth: '100%',
      minHeight: '100%',
      padding: '60px 0 80px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: -6000,
      backgroundImage: gridSvg,
      backgroundSize: '120px 120px',
      pointerEvents: 'none',
      zIndex: -1
    }
  }), children));
}

// ─────────────────────────────────────────────────────────────
// DCSection — editable title + h-row of artboards in persisted order
// ─────────────────────────────────────────────────────────────
function DCSection({
  id,
  title,
  subtitle,
  children,
  gap = 48
}) {
  const ctx = React.useContext(DCCtx);
  const sid = id ?? title;
  const all = React.Children.toArray(children);
  const artboards = all.filter(c => c && c.type === DCArtboard);
  const rest = all.filter(c => !(c && c.type === DCArtboard));
  const srcOrder = artboards.map(a => a.props.id ?? a.props.label);
  const sec = ctx && sid && ctx.section(sid) || {};
  const order = React.useMemo(() => {
    const kept = (sec.order || []).filter(k => srcOrder.includes(k));
    return [...kept, ...srcOrder.filter(k => !kept.includes(k))];
  }, [sec.order, srcOrder.join('|')]);
  const byId = Object.fromEntries(artboards.map(a => [a.props.id ?? a.props.label, a]));
  return /*#__PURE__*/React.createElement("div", {
    "data-dc-section": sid,
    style: {
      marginBottom: 80,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 60px 56px'
    }
  }, /*#__PURE__*/React.createElement(DCEditable, {
    tag: "div",
    value: sec.title ?? title,
    onChange: v => ctx && sid && ctx.patchSection(sid, {
      title: v
    }),
    style: {
      fontSize: 28,
      fontWeight: 600,
      color: DC.title,
      letterSpacing: -0.4,
      marginBottom: 6,
      display: 'inline-block'
    }
  }), subtitle && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      color: DC.subtitle
    }
  }, subtitle)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap,
      padding: '0 60px',
      alignItems: 'flex-start',
      width: 'max-content'
    }
  }, order.map(k => /*#__PURE__*/React.createElement(DCArtboardFrame, {
    key: k,
    sectionId: sid,
    artboard: byId[k],
    order: order,
    label: (sec.labels || {})[k] ?? byId[k].props.label,
    onRename: v => ctx && ctx.patchSection(sid, x => ({
      labels: {
        ...x.labels,
        [k]: v
      }
    })),
    onReorder: next => ctx && ctx.patchSection(sid, {
      order: next
    }),
    onFocus: () => ctx && ctx.setFocus(`${sid}/${k}`)
  }))), rest);
}

// DCArtboard — marker; rendered by DCArtboardFrame via DCSection.
function DCArtboard() {
  return null;
}
function DCArtboardFrame({
  sectionId,
  artboard,
  label,
  order,
  onRename,
  onReorder,
  onFocus
}) {
  const {
    id: rawId,
    label: rawLabel,
    width = 260,
    height = 480,
    children,
    style = {}
  } = artboard.props;
  const id = rawId ?? rawLabel;
  const ref = React.useRef(null);

  // Live drag-reorder: dragged card sticks to cursor; siblings slide into
  // their would-be slots in real time via transforms. DOM order only
  // changes on drop.
  const onGripDown = e => {
    e.preventDefault();
    e.stopPropagation();
    const me = ref.current;
    // translateX is applied in local (pre-scale) space but pointer deltas and
    // getBoundingClientRect().left are screen-space — divide by the viewport's
    // current scale so the dragged card tracks the cursor at any zoom level.
    const scale = me.getBoundingClientRect().width / me.offsetWidth || 1;
    const peers = Array.from(document.querySelectorAll(`[data-dc-section="${sectionId}"] [data-dc-slot]`));
    const homes = peers.map(el => ({
      el,
      id: el.dataset.dcSlot,
      x: el.getBoundingClientRect().left
    }));
    const slotXs = homes.map(h => h.x);
    const startIdx = order.indexOf(id);
    const startX = e.clientX;
    let liveOrder = order.slice();
    me.classList.add('dc-dragging');
    const layout = () => {
      for (const h of homes) {
        if (h.id === id) continue;
        const slot = liveOrder.indexOf(h.id);
        h.el.style.transform = `translateX(${(slotXs[slot] - h.x) / scale}px)`;
      }
    };
    const move = ev => {
      const dx = ev.clientX - startX;
      me.style.transform = `translateX(${dx / scale}px)`;
      const cur = homes[startIdx].x + dx;
      let nearest = 0,
        best = Infinity;
      for (let i = 0; i < slotXs.length; i++) {
        const d = Math.abs(slotXs[i] - cur);
        if (d < best) {
          best = d;
          nearest = i;
        }
      }
      if (liveOrder.indexOf(id) !== nearest) {
        liveOrder = order.filter(k => k !== id);
        liveOrder.splice(nearest, 0, id);
        layout();
      }
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      const finalSlot = liveOrder.indexOf(id);
      me.classList.remove('dc-dragging');
      me.style.transform = `translateX(${(slotXs[finalSlot] - homes[startIdx].x) / scale}px)`;
      // After the settle transition, kill transitions + clear transforms +
      // commit the reorder in the same frame so there's no visual snap-back.
      setTimeout(() => {
        for (const h of homes) {
          h.el.style.transition = 'none';
          h.el.style.transform = '';
        }
        if (liveOrder.join('|') !== order.join('|')) onReorder(liveOrder);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          for (const h of homes) h.el.style.transition = '';
        }));
      }, 180);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    "data-dc-slot": id,
    style: {
      position: 'relative',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-labelrow",
    style: {
      position: 'absolute',
      bottom: '100%',
      left: -4,
      marginBottom: 4,
      color: DC.label
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "dc-grip",
    onPointerDown: onGripDown,
    title: "Drag to reorder"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "9",
    height: "13",
    viewBox: "0 0 9 13",
    fill: "currentColor"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "2",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "2",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "6.5",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "6.5",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "2",
    cy: "11",
    r: "1.1"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "7",
    cy: "11",
    r: "1.1"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dc-labeltext",
    onClick: onFocus,
    title: "Click to focus"
  }, /*#__PURE__*/React.createElement(DCEditable, {
    value: label,
    onChange: onRename,
    onClick: e => e.stopPropagation(),
    style: {
      fontSize: 15,
      fontWeight: 500,
      color: DC.label,
      lineHeight: 1
    }
  }))), /*#__PURE__*/React.createElement("button", {
    className: "dc-expand",
    onClick: onFocus,
    onPointerDown: e => e.stopPropagation(),
    title: "Focus"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 12 12",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M7 1h4v4M5 11H1V7M11 1L7.5 4.5M1 11l3.5-3.5"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "dc-card",
    style: {
      borderRadius: 2,
      boxShadow: '0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06)',
      overflow: 'hidden',
      width,
      height,
      background: '#fff',
      ...style
    }
  }, children || /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#bbb',
      fontSize: 13,
      fontFamily: DC.font
    }
  }, id)));
}

// Inline rename — commits on blur or Enter.
function DCEditable({
  value,
  onChange,
  style,
  tag = 'span',
  onClick
}) {
  const T = tag;
  return /*#__PURE__*/React.createElement(T, {
    className: "dc-editable",
    contentEditable: true,
    suppressContentEditableWarning: true,
    onClick: onClick,
    onPointerDown: e => e.stopPropagation(),
    onBlur: e => onChange && onChange(e.currentTarget.textContent),
    onKeyDown: e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.currentTarget.blur();
      }
    },
    style: style
  }, value);
}

// ─────────────────────────────────────────────────────────────
// Focus mode — overlay one artboard; ←/→ within section, ↑/↓ across
// sections, Esc or backdrop click to exit.
// ─────────────────────────────────────────────────────────────
function DCFocusOverlay({
  entry,
  sectionMeta,
  sectionOrder
}) {
  const ctx = React.useContext(DCCtx);
  const {
    sectionId,
    artboard
  } = entry;
  const sec = ctx.section(sectionId);
  const meta = sectionMeta[sectionId];
  const peers = meta.slotIds;
  const aid = artboard.props.id ?? artboard.props.label;
  const idx = peers.indexOf(aid);
  const secIdx = sectionOrder.indexOf(sectionId);
  const go = d => {
    const n = peers[(idx + d + peers.length) % peers.length];
    if (n) ctx.setFocus(`${sectionId}/${n}`);
  };
  const goSection = d => {
    const ns = sectionOrder[(secIdx + d + sectionOrder.length) % sectionOrder.length];
    const first = sectionMeta[ns] && sectionMeta[ns].slotIds[0];
    if (first) ctx.setFocus(`${ns}/${first}`);
  };
  React.useEffect(() => {
    const k = e => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(-1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(1);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        goSection(-1);
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        goSection(1);
      }
    };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  });
  const {
    width = 260,
    height = 480,
    children
  } = artboard.props;
  const [vp, setVp] = React.useState({
    w: window.innerWidth,
    h: window.innerHeight
  });
  React.useEffect(() => {
    const r = () => setVp({
      w: window.innerWidth,
      h: window.innerHeight
    });
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);
  const scale = Math.max(0.1, Math.min((vp.w - 200) / width, (vp.h - 260) / height, 2));
  const [ddOpen, setDd] = React.useState(false);
  const Arrow = ({
    dir,
    onClick
  }) => /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onClick();
    },
    style: {
      position: 'absolute',
      top: '50%',
      [dir]: 28,
      transform: 'translateY(-50%)',
      border: 'none',
      background: 'rgba(255,255,255,.08)',
      color: 'rgba(255,255,255,.9)',
      width: 44,
      height: 44,
      borderRadius: 22,
      fontSize: 18,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background .15s'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,.18)',
    onMouseLeave: e => e.currentTarget.style.background = 'rgba(255,255,255,.08)'
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 18 18",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: dir === 'left' ? 'M11 3L5 9l6 6' : 'M7 3l6 6-6 6'
  })));

  // Portal to body so position:fixed is the real viewport regardless of any
  // transform on DesignCanvas's ancestors (including the canvas zoom itself).
  return ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    onClick: () => ctx.setFocus(null),
    onWheel: e => e.preventDefault(),
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(24,20,16,.6)',
      backdropFilter: 'blur(14px)',
      fontFamily: DC.font,
      color: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 72,
      display: 'flex',
      alignItems: 'flex-start',
      padding: '16px 20px 0',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setDd(o => !o),
    style: {
      border: 'none',
      background: 'transparent',
      color: '#fff',
      cursor: 'pointer',
      padding: '6px 8px',
      borderRadius: 6,
      textAlign: 'left',
      fontFamily: 'inherit'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      letterSpacing: -0.3
    }
  }, meta.title), /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 11 11",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8",
    strokeLinecap: "round",
    style: {
      opacity: .7
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2 4l3.5 3.5L9 4"
  }))), meta.subtitle && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 13,
      opacity: .6,
      fontWeight: 400,
      marginTop: 2
    }
  }, meta.subtitle)), ddOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '100%',
      left: 0,
      marginTop: 4,
      background: '#2a251f',
      borderRadius: 8,
      boxShadow: '0 8px 32px rgba(0,0,0,.4)',
      padding: 4,
      minWidth: 200,
      zIndex: 10
    }
  }, sectionOrder.map(sid => /*#__PURE__*/React.createElement("button", {
    key: sid,
    onClick: () => {
      setDd(false);
      const f = sectionMeta[sid].slotIds[0];
      if (f) ctx.setFocus(`${sid}/${f}`);
    },
    style: {
      display: 'block',
      width: '100%',
      textAlign: 'left',
      border: 'none',
      cursor: 'pointer',
      background: sid === sectionId ? 'rgba(255,255,255,.1)' : 'transparent',
      color: '#fff',
      padding: '8px 12px',
      borderRadius: 5,
      fontSize: 14,
      fontWeight: sid === sectionId ? 600 : 400,
      fontFamily: 'inherit'
    }
  }, sectionMeta[sid].title)))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => ctx.setFocus(null),
    onMouseEnter: e => e.currentTarget.style.background = 'rgba(255,255,255,.12)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent',
    style: {
      border: 'none',
      background: 'transparent',
      color: 'rgba(255,255,255,.7)',
      width: 32,
      height: 32,
      borderRadius: 16,
      fontSize: 20,
      cursor: 'pointer',
      lineHeight: 1,
      transition: 'background .12s'
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 64,
      bottom: 56,
      left: 100,
      right: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width: width * scale,
      height: height * scale,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      background: '#fff',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: '0 20px 80px rgba(0,0,0,.4)'
    }
  }, children || /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#bbb'
    }
  }, aid))), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      fontSize: 14,
      fontWeight: 500,
      opacity: .85,
      textAlign: 'center'
    }
  }, (sec.labels || {})[aid] ?? artboard.props.label, /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: .5,
      marginLeft: 10,
      fontVariantNumeric: 'tabular-nums'
    }
  }, idx + 1, " / ", peers.length))), /*#__PURE__*/React.createElement(Arrow, {
    dir: "left",
    onClick: () => go(-1)
  }), /*#__PURE__*/React.createElement(Arrow, {
    dir: "right",
    onClick: () => go(1)
  }), /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 8
    }
  }, peers.map((p, i) => /*#__PURE__*/React.createElement("button", {
    key: p,
    onClick: () => ctx.setFocus(`${sectionId}/${p}`),
    style: {
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      width: 6,
      height: 6,
      borderRadius: 3,
      background: i === idx ? '#fff' : 'rgba(255,255,255,.3)'
    }
  })))), document.body);
}

// ─────────────────────────────────────────────────────────────
// Post-it — absolute-positioned sticky note
// ─────────────────────────────────────────────────────────────
function DCPostIt({
  children,
  top,
  left,
  right,
  bottom,
  rotate = -2,
  width = 180
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top,
      left,
      right,
      bottom,
      width,
      background: DC.postitBg,
      padding: '14px 16px',
      fontFamily: '"Comic Sans MS", "Marker Felt", "Segoe Print", cursive',
      fontSize: 14,
      lineHeight: 1.4,
      color: DC.postitText,
      boxShadow: '0 2px 8px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)',
      transform: `rotate(${rotate}deg)`,
      zIndex: 5
    }
  }, children);
}
Object.assign(window, {
  DesignCanvas,
  DCSection,
  DCArtboard,
  DCPostIt
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/trupp/design-canvas.jsx", error: String((e && e.message) || e) }); }

})();
