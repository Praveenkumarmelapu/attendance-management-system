/**
 * context/NavContext.jsx — Mobile Navigation Drawer State
 * Shared open/close state so the Navbar hamburger can toggle the Sidebar drawer on small screens
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

const NavContext = createContext({
  mobileNavOpen: false,
  toggleMobileNav: () => {},
  closeMobileNav: () => {},
});

export const NavProvider = ({ children }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const toggleMobileNav = useCallback(() => setMobileNavOpen((o) => !o), []);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);
  return (
    <NavContext.Provider value={{ mobileNavOpen, toggleMobileNav, closeMobileNav }}>
      {children}
    </NavContext.Provider>
  );
};

export const useNav = () => useContext(NavContext);
