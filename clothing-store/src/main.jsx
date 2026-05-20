// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";  // ← đổi từ HashRouter
import { Provider } from "react-redux";
import { store } from "./store";
import App from "./App";
import "./index.scss";
import { GoogleOAuthProvider } from "@react-oauth/google";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
      <GoogleOAuthProvider clientId="990761663054-4ddc5rhrkakiste09c7o2mbrb0m7bu47.apps.googleusercontent.com">       
        <App />
        </GoogleOAuthProvider>  
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);