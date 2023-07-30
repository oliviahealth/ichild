import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import Index from "./components";
import Auth from "./components/Auth";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" Component={Index} />
          <Route path="/auth" Component={Auth} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;