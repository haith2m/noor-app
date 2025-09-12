import colors from "tailwindcss/colors";
import { ReadingView } from "react-quran";
import { useEffect } from "react";
function QuranPage({ page, position }) {
  const theme = window.api.getSettings().theme;
  useEffect(() => {
    if (!page) return; // Early return if no page
    const content = document.querySelectorAll(".quran-text");
    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    if (content) {
      content.forEach((content) => {
        content.querySelectorAll("span").forEach((span) => {
          if (arabicNumbers.some((num) => span.textContent.includes(num))) {
            span.style.color = colors[window.api.getColor()][500];
          }
        });
      });
    }
  }, [page]);

  if (!page) return null; // Don't render if the page number is invalid

  // Base styles for the ReadingView
  const readingViewStyles = {
    width: "900px",
    height: "500px",
    maxWidth: "100%",
    backgroundColor: "transparent",
    color: window.api.getSettings().theme === "light" ? "black" : "white",
    margin: "0",
    paddingTop: "12px",
    paddingBottom: "12px",
    paddingLeft: "28px",
    paddingRight: "28px",
  };

  return (
    <div className="flex-1 max-w-[400px] relative" dir="rtl">
      {/* Top Frame */}
      <div
        className={`qFrameTop bg-${window.api.getColor()}-500`}
        style={{
          backgroundImage: `url('./${theme !== "light" ? "dark-" : ""}frame.png')`,
          backgroundBlendMode: theme !== "light" ? "multiply" : "screen",
          height: "23px",
        }}
      ></div>

      {/* right Frame */}
      <div
        className={`qFrameRight bg-${window.api.getColor()}-500`}
        style={{
          backgroundImage: `url('./${theme !== "light" ? "dark-" : ""}frame.png')`,
          backgroundBlendMode: theme !== "light" ? "multiply" : "screen",
          backgroundRepeat: "repeat-y",
          width: "19px",
          height: "500px",
          position: "absolute",
          backgroundPosition: "-400px 0",
        }}
      ></div>
      <div
        className={`qFrameLeft bg-${window.api.getColor()}-500`}
        style={{
          backgroundImage: `url('./${theme !== "light" ? "dark-" : ""}frame.png')`,
          backgroundBlendMode: theme !== "light" ? "multiply" : "screen",
          backgroundRepeat: "repeat-y",
          width: "19px",
          height: "500px",
          position: "absolute",
          left: "0",
          backgroundPosition: "-400px 0",
        }}
      ></div>
      <div className="quran-text">
        <ReadingView
          page={page}
          readingViewStyles={readingViewStyles}
          surahTitleStyles={{
            backgroundColor: colors[window.api.getColor()][600] + "80",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            border: "none",
            lineHeight: "1rem",
            width: "calc(100% + 19px)",
            marginRight: "-9px",
            borderWidth: "1px",
            borderColor: colors[window.api.getColor()][600],
            borderStyle: "solid",
          }}
          fixedAspectRatio={true}
        />
      </div>
      {/* Bottom Frame */}
      <div
        className={`qFrameBottom bg-${window.api.getColor()}-500`}
        style={{
          backgroundImage: `url('./${theme !== "light" ? "dark-" : ""}frame.png')`,
          backgroundBlendMode: theme !== "light" ? "multiply" : "screen",
          backgroundPosition: "0 bottom",
          height: "23px",
        }}
      ></div>
    </div>
  );
}

export default QuranPage;
