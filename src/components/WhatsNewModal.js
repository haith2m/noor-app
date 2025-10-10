import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  IconX,
  IconInfoCircle,
  IconCalendar,
  IconTag,
  IconBrandGithub,
} from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";
import Loading from "./Loading";

const WhatsNewModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const GITHUB_REPO = "haith2m/noor-app";

  useEffect(() => {
    if (isOpen) {
      fetchReleases();
    }
  }, [isOpen]);

  const fetchReleases = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch releases from GitHub API
      // Replace 'your-username/ptapp' with your actual GitHub repository
      const response = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/releases?per_page=10`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch releases");
      }

      const data = await response.json();
      setReleases(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(
      t("language_code") === "ar" ? "ar-SA" : "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

  const parseReleaseBodyByLanguage = (body) => {
    if (!body) return "";

    const currentLanguage = t("language_code");
    const isArabic = currentLanguage === "ar";

    // Define language markers
    const arabicMarker = "## 🇸🇦";
    const englishMarker = "## 🇬🇧";

    // Find the appropriate language section
    let startIndex = -1;
    let endIndex = body.length;

    if (isArabic) {
      // Look for Arabic section
      startIndex = body.indexOf(arabicMarker);
      if (startIndex !== -1) {
        // Find the end of Arabic section (either next language marker or end of text)
        const englishStart = body.indexOf(englishMarker, startIndex);
        if (englishStart !== -1) {
          endIndex = englishStart;
        }
      }
    } else {
      // Look for English section
      startIndex = body.indexOf(englishMarker);
      if (startIndex !== -1) {
        // Find the end of English section (end of text)
        endIndex = body.length;
      }
    }

    // If no language-specific section found, return the original body
    if (startIndex === -1) {
      return body;
    }

    // Extract the language-specific content
    let content = body.substring(startIndex, endIndex).trim();

    // Remove the language marker header
    if (isArabic) {
      content = content.replace(/^## 🇸🇦\s*العربية\s*\n*/gm, "");
    } else {
      content = content.replace(/^## 🇬🇧\s*English\s*\n*/gm, "");
    }

    return content;
  };

  if (!isOpen) return null;

  return (
    <div onClick={(e) => e.target.id === "whats-new-modal" && onClose()} id="whats-new-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-all fadeIn-300">
      <div className="bg-bg-color border border-bg-color-3 p-6 pb-0 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden text-text">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <IconInfoCircle
              className={`text-${window.api.getColor()}-500`}
              size={24}
            />
            <h2 className="text-xl font-semibold">{t("whats_new")}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-text-2 hover:text-text transition-colors"
          >
            <IconX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh] pr-2">
          {loading ? (
            <>
              <Loading />
            </>
          ) : error ? (
            <div className="text-start py-8">
              <div className="text-red-500 mb-2">{t("error_occurred")}</div>
              <div className="text-text-2 text-sm">{error}</div>
              <button
                onClick={fetchReleases}
                className={`mt-4 px-4 py-2 bg-${window.api.getColor()}-500 text-white rounded hover:bg-${window.api.getColor()}-600 transition-colors`}
              >
                {t("retry")}
              </button>
            </div>
          ) : releases.length === 0 ? (
            <div className="text-start py-8 text-text-2">
              {t("no_releases_found")}
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
              {releases.map((release, index) => (
                <div key={release.id} className="mb-8">
                  {/* Release Header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-bg-color-3">
                    <div className="flex items-center gap-3">
                      <IconTag
                        className={`text-${window.api.getColor()}-500`}
                        size={20}
                      />
                      <h2 className="text-xl font-bold text-text">
                        {release.tag_name}
                      </h2>
                      {release.prerelease && (
                        <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-500 rounded">
                          {t("prerelease")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-text-2 text-sm">
                      <IconCalendar size={16} />
                      <span>{formatDate(release.published_at)}</span>
                    </div>
                  </div>

                  {/* Release Notes as Markdown */}
                  {release.body && (
                    <div className="text-text-2 leading-relaxed prose prose-invert max-w-none text-start">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-2xl font-bold mb-4 mt-6 text-text">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-xl font-bold mb-3 mt-5 text-text">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-lg font-semibold mb-2 mt-4 text-text">
                              {children}
                            </h3>
                          ),
                          p: ({ children }) => (
                            <p className="mb-3 text-text-2">{children}</p>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-text">
                              {children}
                            </strong>
                          ),
                          em: ({ children }) => (
                            <em className="italic text-text">{children}</em>
                          ),
                          code: ({ children }) => (
                            <code className="bg-bg-color-3 px-1 py-0.5 rounded text-sm font-mono text-text">
                              {children}
                            </code>
                          ),
                          pre: ({ children }) => (
                            <pre className="bg-bg-color-3 p-3 rounded-lg overflow-x-auto mb-3">
                              {children}
                            </pre>
                          ),
                          ul: ({ children }) => (
                            <ul className="mb-3 list-disc list-inside text-text-2">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="mb-3 list-decimal list-inside text-text-2">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="mb-1">{children}</li>
                          ),
                          a: ({ href, children }) => (
                            <button
                              onClick={() => window.api.openURL(href)}
                              className="text-blue-500 hover:text-blue-600 underline"
                            >
                              {children}
                            </button>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-gray-300 pl-4 italic text-text-2 mb-3">
                              {children}
                            </blockquote>
                          ),
                          hr: () => <hr className="my-4 border-bg-color-3" />,
                        }}
                      >
                        {parseReleaseBodyByLanguage(release.body)}
                      </ReactMarkdown>
                    </div>
                  )}

                  {/* Download Link */}
                  {release.assets && release.assets.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-bg-color-3">
                      <button
                        onClick={() => window.api.openURL(release.html_url)}
                        className={`inline-flex items-center gap-2 text-sm text-${window.api.getColor()}-500 hover:text-${window.api.getColor()}-600 transition-colors`}
                      >
                        <IconBrandGithub size={16} />
                        {t("view_on_github")}
                      </button>
                    </div>
                  )}

                  {/* Separator between releases */}
                  {index < releases.length - 1 && (
                    <hr className="my-8 border-bg-color-3" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default WhatsNewModal;
