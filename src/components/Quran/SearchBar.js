// src/components/Quran/SearchBar.jsx
import { IconSearch } from "@tabler/icons-react";
import React from "react";
import { useTranslation } from "react-i18next";

function SearchBar({ searchText, onSearch }) {
  const { t } = useTranslation();

  return (
    <div
      className={`py-3 flex flex-row items-center justify-center border-bg-color-3 bg-bg-color-2 border rounded-lg mb-4`}
    >
      <div className={`w-16 h-full flex items-center justify-center`}>
        <IconSearch />
      </div>
      <input
        type="text"
        placeholder={t("search")}
        className={`w-[calc(100%_-_4rem)] rounded-s-none text-text focus:outline-none bg-transparent `}
        value={searchText}
        onChange={onSearch}
      />
    </div>
  );
}

export default SearchBar;