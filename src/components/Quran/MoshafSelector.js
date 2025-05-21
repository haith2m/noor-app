import React from "react";
import { useTranslation } from "react-i18next";

function MoshafSelector({ moshafs, onSelect }) {
    const { t } = useTranslation();
  return (
    <div className="moshaf-selector">
      <p className={`text-xl font-medium text-text-2 text-start`}>
        {t("select_moshaf")}
      </p>
      <div className="grid grid-cols-2 gap-4 mt-4">
        {moshafs.map((moshaf) => (
          <button
            key={moshaf.id}
            className="bg-bg-color-2 rounded-lg px-4 py-2 text-text text-center"
            onClick={() => onSelect(moshaf)}
          >
            {moshaf.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MoshafSelector;
