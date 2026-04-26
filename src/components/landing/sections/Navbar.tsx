"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import Link from "next/link";
import { C } from "../lib/constants";

function NavLink({ children, href = "#", onClick }: { children: React.ReactNode; href?: string; onClick?: () => void }) {
  const [h, setH] = useState(false);
  return (
    <Link
      href={href}
      style={{
        color: h ? C.copper : "rgba(245,243,239,.7)",
        fontSize: 13,
        fontWeight: 500,
        textDecoration: "none",
        letterSpacing: ".03em",
        transition: "color .2s",
        position: "relative",
        display: "block",
        padding: "8px 0",
      }}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      onClick={onClick}
    >
      {children}
      <motion.div
        animate={{ scaleX: h ? 1 : 0 }}
        style={{
          position: "absolute",
          bottom: 6,
          left: 0,
          right: 0,
          height: 1,
          background: C.copper,
          transformOrigin: "left",
        }}
      />
    </Link>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations("landing");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const otherLocale = locale === "ar" ? "en" : "ar";
  const isRtl = locale === "ar";

  const switchLocale = () => router.replace(pathname, { locale: otherLocale });

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { key: "howItWorks", href: "#how-it-works" },
    { key: "forOwners", href: "#owners" },
    { key: "professionals", href: "#professionals" },
    { key: "verification", href: "#verification" },
    { key: "about", href: "#about" },
  ];

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: scrolled ? "12px 0" : "20px 0",
          transition: "padding .4s, background .4s, border .4s",
          background: scrolled ? "rgba(27,42,74,.95)" : "transparent",
          backdropFilter: scrolled ? "blur(24px)" : "none",
          borderBottom: scrolled ? `1px solid rgba(184,115,51,.15)` : "none",
        }}
      >
        <style>{`
          @media (min-width: 1024px) {
            nav { padding: ${scrolled ? "14px 0" : "28px 0"} !important; }
          }
          @media (min-width: 768px) {
            nav { padding: ${scrolled ? "14px 0" : "24px 0"} !important; }
          }
        `}</style>

        <div className="container-app" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        {/* Logo */}
        <Link href={`/${locale}`} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", zIndex: 1001 }}>
          <img src="../logo.jpg" alt="Rasi" style={{ width: 40, height: 40 }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: C.ivory, lineHeight: 1.2 }}>
              {isRtl ? "راسي" : "Rasi"}
            </span>
            <span style={{ fontSize: 10, color: "rgba(245,243,239,0.55)", lineHeight: 1.2, letterSpacing: "0.02em" }}>
              Saudi Construction Marketplace
            </span>
          </div>
        </Link>

        {/* Desktop Links - Hidden on mobile */}
        <div style={{ display: "none", gap: 28, alignItems: "center" }} className="desktop-nav">
          <style>{`
            @media (min-width: 1024px) {
              .desktop-nav { display: flex !important; }
            }
          `}</style>
          {navLinks.map((link) => (
            <NavLink key={link.key} href={link.href}>
              {t(`nav.${link.key}`)}
            </NavLink>
          ))}
        </div>

        {/* Desktop Auth Buttons - Hidden on mobile */}
        <div style={{ display: "none", gap: 12, alignItems: "center" }} className="desktop-auth">
          <style>{`
            @media (min-width: 1024px) {
              .desktop-auth { display: flex !important; }
            }
          `}</style>
          {/* Language Switcher */}
          <button
            onClick={switchLocale}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 12px",
              borderRadius: "60px",
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "rgba(245,243,239,.7)",
              background: "transparent",
              border: `1px solid rgba(184,115,51,.3)`,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
              <path d="M2 12h20"/>
            </svg>
            {otherLocale.toUpperCase()}
          </button>
          <Link
            href="/auth/login"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "rgba(245,243,239,.7)",
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "'Plus Jakarta Sans'",
              textDecoration: "none",
            }}
          >
            {t("nav.signIn")}
          </Link>
          <Link href="/auth/register" className="btn-primary" style={{ padding: "10px 20px", fontSize: 12, textDecoration: "none", display: "inline-block" }}>
            {t("nav.postProject")}
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 5,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 8,
            zIndex: 1001,
          }}
          className="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          <style>{`
            @media (min-width: 1024px) {
              .mobile-menu-btn { display: none !important; }
            }
          `}</style>
          <motion.span
            animate={{ rotate: mobileMenuOpen ? 45 : 0, y: mobileMenuOpen ? 8 : 0 }}
            style={{ width: 24, height: 2, background: C.ivory, borderRadius: 2 }}
          />
          <motion.span
            animate={{ opacity: mobileMenuOpen ? 0 : 1 }}
            style={{ width: 24, height: 2, background: C.ivory, borderRadius: 2 }}
          />
          <motion.span
            animate={{ rotate: mobileMenuOpen ? -45 : 0, y: mobileMenuOpen ? -8 : 0 }}
            style={{ width: 24, height: 2, background: C.ivory, borderRadius: 2 }}
          />
        </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(27,42,74,.98)",
              backdropFilter: "blur(20px)",
              zIndex: 999,
              display: "flex",
              flexDirection: "column",
              padding: "80px 24px 24px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <NavLink href={link.href} onClick={closeMenu}>
                    {t(`nav.${link.key}`)}
                  </NavLink>
                </motion.div>
              ))}
            </div>

            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Language Switcher Mobile */}
              <button
                onClick={() => { switchLocale(); closeMenu(); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 0",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "rgba(245,243,239,.7)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: isRtl ? "right" : "left",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                  <path d="M2 12h20"/>
                </svg>
                {locale === "ar" ? "English" : "العربية"}
              </button>
              <div style={{ borderTop: "1px solid rgba(184,115,51,.2)", margin: "4px 0" }} />
              <Link
                href="/auth/login"
                onClick={closeMenu}
                style={{
                  color: "rgba(245,243,239,.7)",
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: "none",
                  padding: "12px 0",
                }}
              >
                {t("nav.signIn")}
              </Link>
              <Link
                href="/auth/register"
                onClick={closeMenu}
                className="btn-primary"
                style={{ padding: "14px 28px", textDecoration: "none", display: "block", textAlign: "center" }}
              >
                {t("nav.postProject")}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
