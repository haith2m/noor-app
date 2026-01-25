import { IconBook2, IconRefresh, IconX } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { sanitizeHtml } from "./utils";

function TafsirPanel({
  tafsirOpen,
  onClose,
  tafsirs,
  tafsirId,
  onTafsirIdChange,
  selectedVerse,
  tafsirText,
  tafsirLoading,
  tafsirError,
  onRefresh,
}) {
  const { t, i18n } = useTranslation();
  const color = window.api.getColor?.() || "blue";

  if (!tafsirOpen) return null;

  return (
    <div className="w-[26rem] border-l border-bg-color-3 bg-bg-color/60 h-full flex flex-col animate-slide-in">
      <div className="p-4 border-b border-bg-color-3 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <IconBook2 size={18} className={`text-${color}-500 shrink-0`} />
          <div className="min-w-0">
            <div className="font-medium truncate">{t("tafsir")}</div>
            <div className="text-xs text-text-2">
              {selectedVerse ? `سورة ${selectedVerse.chapter} • آية ${selectedVerse.verse}` : "اضغط على آية"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded hover:bg-bg-color-2"
            onClick={onRefresh}
            disabled={!selectedVerse}
            title="تحديث"
          >
            <IconRefresh size={16} />
          </button>
          <button
            className="p-2 rounded hover:bg-bg-color-2"
            onClick={onClose}
            title="إغلاق"
          >
            <IconX size={16} />
          </button>
        </div>
      </div>

      <div className="p-4 border-b border-bg-color-3">
        <select
          className="w-full bg-bg-color-2 border border-bg-color-3 rounded px-3 py-2 text-sm"
          value={tafsirId ?? ""}
          onChange={(e) => onTafsirIdChange(Number(e.target.value))}
        >
          {tafsirs.length === 0 && <option value="">{t("tafsir_description")}</option>}
          {tafsirs.map((x) => {
            const translationKey = `tafsirs.tafsir_${x.id}`;
            const translatedName = t(translationKey);
            // If translation returns the same key, it means translation doesn't exist
            const displayName =
              translatedName !== translationKey
                ? translatedName
                : x.name || x.translated_name?.name || `Tafsir ${x.id}`;
            
            return (
              <option key={x.id} value={x.id}>
                {displayName}
              </option>
            );
          })}
        </select>
      </div>

      <div className="p-4 overflow-y-auto flex-1">
        {!selectedVerse ? (
          <div className="text-sm text-text-2">اضغط على آية لعرض التفسير</div>
        ) : tafsirLoading ? (
          <div className="text-sm text-text-2">جاري تحميل التفسير...</div>
        ) : tafsirError ? (
          <div className="text-sm text-red-500">{tafsirError}</div>
        ) : (
          <div
            className="text-sm leading-7 prose prose-invert max-w-none text-start"
            dir={i18n.language === "ar" ? "rtl" : "ltr"}
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(tafsirText),
            }}
          />
        )}
      </div>
    </div>
  );
}

export default TafsirPanel;

