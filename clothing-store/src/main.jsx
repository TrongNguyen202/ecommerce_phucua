// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";  // ← đổi từ HashRouter
import { Provider } from "react-redux";
import { store } from "./store";
import App from "./App";
import "./index.scss";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>          {/* ← đổi từ HashRouter */}
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);