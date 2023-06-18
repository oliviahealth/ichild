import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";

import "./css/index.css";
import Layout from "./components/Layout.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Layout>
      <App />
    </Layout>
  </React.StrictMode>
);
