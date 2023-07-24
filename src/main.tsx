import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import App from "./App.tsx";

import "./css/index.css";
import Layout from "./components/Layout.tsx";

// Setup react query to handle api calls and their associated loading states
// https://tanstack.com/query/v4/docs/react/overview
const queryClient = new QueryClient({ defaultOptions: {
  queries: {
    refetchOnWindowFocus: false,
  }
} });

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <QueryClientProvider client={queryClient}>
      <Layout>
        <App />
      </Layout>
    </QueryClientProvider>
);
