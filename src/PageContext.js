import React, { createContext, useContext, useEffect, useState } from "react";

const PageContext = createContext();

export const PageProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState("home");
  const [settings, setSettings] = useState({
    language: "ar",
    theme: "light",
  });

  useEffect(() => {
    setSettings(window.api.getSettings());
    setCurrentPage(window.api.getPage());
  }, []);

  const editSettings = (newSettings) => {
    window.api.setSettings(newSettings);
  };

  return (
    <PageContext.Provider
      value={{ currentPage, setCurrentPage, settings, editSettings }}
    >
      {children}
    </PageContext.Provider>
  );
};

export const usePage = () => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error("usePage must be used within a PageProvider");
  }
  return context;
};
