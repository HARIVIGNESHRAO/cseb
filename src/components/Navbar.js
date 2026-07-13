'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './Navbar.module.css';

const THEME_STORAGE_KEY = 'cseb-theme';
const THEME_EVENT = 'cseb-theme-change';
const SIDEBAR_STORAGE_KEY = 'cseb-sidebar-expanded';

const DESKTOP_SIDEBAR_WIDTH = 220;
const DESKTOP_SIDEBAR_COLLAPSED_WIDTH = 72;

const NAV_LINKS = [
  { label: 'Home',       href: '#',           icon: '⌂' },
  { label: 'Search',     href: '#search',     icon: '⌕' },
  { 
    label: 'Semesters',  
    icon: '◫',
    children: [
      { label: '3-2',    href: '#semester-3-2' },
      { label: '4-1',    href: '#semester-4-1' },
    ]
  },
  { label: 'Feedback',   href: '#feedback',   icon: '✉' },
];

function getActiveHref() {
  const hash = window.location.hash;

  if (hash === '#search' || hash === '#feedback' || hash === '#semester-3-2' || hash === '#semester-4-1') {
    return hash;
  }

  if (window.scrollY < 180) {
    return '#';
  }

  const feedback = document.getElementById('feedback');
  if (feedback && feedback.getBoundingClientRect().top <= window.innerHeight * 0.7) {
    return '#feedback';
  }

  const search = document.getElementById('search');
  if (search) {
    const rect = search.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.45 && rect.bottom >= 96) {
      return '#search';
    }
  }

  return '#';
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopExpanded, setDesktopExpanded] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [activeHref, setActiveHref] = useState('#');
  const fabRef = useRef(null);
  const drawerRef = useRef(null);

  /* ── Sidebar persistence ── */
  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (saved !== null) {
      setDesktopExpanded(saved === 'true');
    }
    // Default is false (collapsed) if nothing saved
  }, []);

  /* ── Theme init ── */
  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    const sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initial = saved === 'light' || saved === 'dark' ? saved : sys;
    setTheme(initial);

    const handleThemeChange = (event) => {
      const nextTheme = event.detail?.theme;
      if (nextTheme === 'light' || nextTheme === 'dark') {
        setTheme(nextTheme);
      }
    };

    const handleStorage = (event) => {
      if (event.key === THEME_STORAGE_KEY && (event.newValue === 'light' || event.newValue === 'dark')) {
        setTheme(event.newValue);
      }
    };

    window.addEventListener(THEME_EVENT, handleThemeChange);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(THEME_EVENT, handleThemeChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  /* ── Push main content smoothly ── */
  useEffect(() => {
    const main = document.getElementById('sidebar-main-content');
    if (!main) return;

    main.style.transition = 'margin-left 0.3s ease';

    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      const desktopOffset = desktopExpanded ? DESKTOP_SIDEBAR_WIDTH : DESKTOP_SIDEBAR_COLLAPSED_WIDTH;
      document.documentElement.style.setProperty(
        '--sidebar-offset',
        isMobile ? '0px' : `${desktopOffset}px`
      );
      document.documentElement.style.setProperty(
        '--sidebar-offset-half',
        isMobile ? '0px' : `${desktopOffset / 2}px`
      );
      main.style.marginLeft = isMobile ? '0' : `${desktopOffset}px`;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.documentElement.style.removeProperty('--sidebar-offset');
      document.documentElement.style.removeProperty('--sidebar-offset-half');
    };
  }, [desktopExpanded]);

  /* ── Mobile body lock ── */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  /* ── Outside click closes mobile drawer ── */
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e) => {
      if (fabRef.current && fabRef.current.contains(e.target)) return;
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [mobileOpen]);

  /* ── Escape closes mobile drawer ── */
  useEffect(() => {
    const handler = (e) => { 
      if (e.key === 'Escape') setMobileOpen(false); 
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const updateActiveHref = () => setActiveHref(getActiveHref());

    updateActiveHref();
    window.addEventListener('scroll', updateActiveHref, { passive: true });
    window.addEventListener('hashchange', updateActiveHref);

    return () => {
      window.removeEventListener('scroll', updateActiveHref);
      window.removeEventListener('hashchange', updateActiveHref);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: { theme: nextTheme } }));
  };

  const handleCollapseToggle = () => {
    const newState = !desktopExpanded;
    setDesktopExpanded(newState);
    localStorage.setItem(SIDEBAR_STORAGE_KEY, newState);
  };

  return (
    <>
      {/* Mobile FAB */}
      <button
        ref={fabRef}
        className={`${styles.fab} ${mobileOpen ? styles.fabHidden : ''}`}
        onClick={() => setMobileOpen(v => !v)}
        aria-label="Open sidebar"
        aria-expanded={mobileOpen}
        aria-controls="sidebar-drawer"
      >
        <span className={styles.fabBar} />
        <span className={styles.fabBar} />
        <span className={styles.fabBar} />
      </button>

      {/* Mobile overlay */}
      <div
        className={`${styles.overlay} ${mobileOpen ? styles.overlayVisible : ''}`}
        aria-hidden="true"
        onClick={() => setMobileOpen(false)}
      />

      {/* Desktop sidebar */}
      <aside 
        className={`${styles.sidebar} ${!desktopExpanded ? styles.sidebarCollapsed : ''}`}
        aria-label="Site navigation"
      >
        <SidebarInner
          theme={theme}
          toggleTheme={toggleTheme}
          activeHref={activeHref}
          onNavigate={setActiveHref}
          onLinkClick={() => {}}
          collapsed={!desktopExpanded}
          showCollapse
          onCollapseToggle={handleCollapseToggle}
          onExpandSidebar={() => {
            setDesktopExpanded(true);
            localStorage.setItem(SIDEBAR_STORAGE_KEY, 'true');
          }}
        />
      </aside>

      {/* Mobile drawer */}
      <aside
        id="sidebar-drawer"
        ref={drawerRef}
        className={`${styles.drawer} ${mobileOpen ? styles.drawerOpen : ''}`}
        aria-hidden={!mobileOpen}
        aria-label="Site navigation"
      >
        <SidebarInner
          theme={theme}
          toggleTheme={toggleTheme}
          activeHref={activeHref}
          onNavigate={setActiveHref}
          onLinkClick={() => setMobileOpen(false)}
          collapsed={false}
          showMobileClose
          onMobileClose={() => setMobileOpen(false)}
        />
      </aside>
    </>
  );
}

/* ── Shared inner content ── */
function SidebarInner({
  theme,
  toggleTheme,
  activeHref,
  onNavigate,
  onLinkClick,
  collapsed = false,
  showCollapse = false,
  onCollapseToggle,
  onExpandSidebar,
  showMobileClose = false,
  onMobileClose,
}) {
  const [semestersOpen, setSemestersOpen] = useState(false);
  const semesterActive = activeHref === '#semester-3-2' || activeHref === '#semester-4-1';

  useEffect(() => {
    if (semesterActive && !collapsed) {
      setSemestersOpen(true);
    }
  }, [collapsed, semesterActive]);

  return (
    <div className={styles.inner}>
      {showMobileClose ? (
        <div className={styles.mobileCloseRow}>
          <button
            className={styles.mobileCloseButton}
            onClick={onMobileClose}
            aria-label="Close sidebar"
            type="button"
          >
            ×
          </button>
        </div>
      ) : null}

      {/* Brand */}
      <div className={styles.brandRow}>
        <div className={styles.brand}>
          <span className={styles.brandDot} aria-hidden="true" />
          <span className={styles.brandText}>
            CSE<span className={styles.brandAccent}>·</span>PORTAL
          </span>
        </div>

        {showCollapse ? (
          <button
            className={styles.collapseButton}
            onClick={onCollapseToggle}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            type="button"
          >
            <span aria-hidden="true" className={styles.collapseIcon}>
              {collapsed ? '▶' : '◀'}
            </span>
          </button>
        ) : null}
      </div>

      {/* Nav links */}
      <nav className={styles.nav} aria-label="Primary">
        <ul role="list" className={styles.navList}>
          {NAV_LINKS.map((link, i) => {
            if (link.children) {
              const parentActive = link.children.some((child) => child.href === activeHref);

              return (
                <li key={link.label} style={{ '--i': i }} className={styles.navItemDropdown}>
                  <button
                    className={`${styles.navLink} ${parentActive ? styles.navLinkActive : ''}`}
                    onClick={() => {
                      if (collapsed) {
                        onExpandSidebar?.();
                        setSemestersOpen(true);
                        return;
                      }
                      setSemestersOpen(!semestersOpen);
                    }}
                    aria-expanded={semestersOpen}
                    aria-current={parentActive ? 'true' : undefined}
                    type="button"
                  >
                    <span className={styles.navIcon} aria-hidden="true">{link.icon}</span>
                    <span className={styles.navLabel}>{link.label}</span>
                    <span className={`${styles.arrow} ${semestersOpen ? styles.arrowOpen : ''}`}>
                      {semestersOpen ? '▴' : '▾'}
                    </span>
                  </button>

                  {semestersOpen && !collapsed && (
                    <ul className={styles.submenu} role="list">
                      {link.children.map((child) => (
                        <li key={child.href}>
                          <a
                            href={child.href}
                            className={`${styles.submenuLink} ${
                              activeHref === child.href ? styles.submenuLinkActive : ''
                            }`}
                            onClick={() => {
                              onNavigate?.(child.href);
                              onLinkClick();
                            }}
                            aria-current={activeHref === child.href ? 'page' : undefined}
                          >
                            {child.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }

            return (
              <li key={link.href} style={{ '--i': i }}>
                <a
                  href={link.href}
                  className={`${styles.navLink} ${activeHref === link.href ? styles.navLinkActive : ''}`}
                  onClick={() => {
                    onNavigate?.(link.href);
                    onLinkClick();
                  }}
                  aria-current={activeHref === link.href ? 'page' : undefined}
                >
                  <span className={styles.navIcon} aria-hidden="true">{link.icon}</span>
                  <span className={styles.navLabel}>{link.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Spacer */}
      <div className={styles.spacer} />

      {/* Bottom controls */}
      <div className={styles.bottom}>
        <button
          className={styles.iconBtn}
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <span aria-hidden="true" className={styles.themeIcon}>
            {theme === 'dark' ? '☀' : '☽'}
          </span>
          <span className={styles.navLabel}>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </span>
        </button>
      </div>
    </div>
  );
}