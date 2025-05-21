import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import Loading from "./components/Loading";
import colors from "tailwindcss/colors";
const theme = window.api.getSettings().theme;

document.body.className = theme === "light" ? "light" : "dark";
document.body.style.setProperty("--color", colors[window.api.getColor()][500]);

ReactDOM.render(
  <Suspense fallback={<Loading />}>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </Suspense>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
