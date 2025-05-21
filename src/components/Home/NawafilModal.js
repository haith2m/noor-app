import { useState } from "react";

const NawafilModal = ({ prayersData, t }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div>
      <h1
        className={`font-medium cursor-pointer hover:underline text-${window.api.getColor()}-500`}
        onClick={toggleModal}
      >
        {t("nawafil")}
      </h1>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-all fadeIn-300">
          <div className="bg-bg-color border border-bg-color-3 p-6 rounded-lg shadow-lg w-full max-w-md text-text">
            <h2 className="text-lg font-medium mb-4">{t("nawafil")}</h2>
            <table className="w-full text-center">
              <thead>
                <tr className={`border-b border-bg-color-3 w-full text-${window.api.getColor()}-500`}>
                  <th className="py-2 w-1/3">{t("prayer")}</th>
                  <th className="py-2 w-1/3">{t("before")}</th>
                  <th className="py-2 w-1/3">{t("after")}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(prayersData.times).map(
                  ([prayer, { nawafil }]) =>
                    (nawafil.before > 0 || nawafil.after > 0) && (
                      <tr key={prayer} className="border-b border-bg-color-3 w-full">
                        <td className="py-2 w-1/3">{t(prayer)}</td>
                        <td className="py-2 w-1/3">
                          {nawafil.before > 0 ? `${nawafil.before}` : "-"}
                        </td>
                        <td className="py-2 w-1/3">
                          {nawafil.after > 0 ? `${nawafil.after}` : "-"}
                        </td>
                      </tr>
                    )
                )}
              </tbody>
            </table>
            <button
              onClick={toggleModal}
              className={`mt-4 px-4 py-2 bg-bg-color-3 rounded hover:bg-gray-300 dark:hover:bg-bg-color-2 transition-all text-${window.api.getColor()}-500`}
            >
              {t("close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NawafilModal;