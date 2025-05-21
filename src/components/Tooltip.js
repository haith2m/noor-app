function Tooltip({ message,widthFull, children }) {
  return (
    <div className={`group relative flex max-w-max flex-col items-center justify-center ${widthFull ? "w-full" : ""}`}>
      {children}
      <div className="absolute left-1/2 bottom-8 ml-auto mr-auto min-w-max -translate-x-1/2 scale-0 transform rounded-lg drop-shadow-xl px-3 py-2 text-xs font-medium transition-all group-hover:scale-100">
        <div className="flex max-w-xs flex-col items-center">
          <div
            className={`rounded-lg bg-bg-color border border-bg-color-3 p-2 text-center text-sm text-text`}
          >
            {message.split("\n").map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tooltip;
