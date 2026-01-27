import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ErrorBoundary } from "react-error-boundary";

import Layout from "./components/Layout";
import AuthLayout from "./components/Auth/AuthLayout";
import ChatComponent from "./components/Chat";
import Signin from "./components/Auth/Signin";
import Signup from "./components/Auth/Signup";
import SavedLocations from "./SavedLocations";
import SettingsLayout from "./components/Settings/Layout";
import UserPage from "./components/User";

import "./css/index.css";

// Setup react query to handle api calls and their associated loading states
// https://tanstack.com/query/v4/docs/react/overview
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    }
  }
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <ErrorBoundary fallback={<div>Something went wrong</div>}>
    <QueryClientProvider client={queryClient}>
      { /* Use React Router to handle client side routing between the auth page and the home page
          https://reactrouter.com/en/main
    */ }
      <BrowserRouter basename="/">
        <Routes>
          { /* Wrap all elements with the Layout component
                https://reactrouter.com/en/main/start/concepts#layout-routes
            */ }
          <Route element={<Layout />}>
            <Route path="/" Component={ChatComponent} />
            <Route path="/savedlocations" Component={SavedLocations} />
            <Route element={<SettingsLayout />}>
              <Route path="/settings/user" Component={UserPage} />
            </Route>
          </Route>
          <Route element={<AuthLayout />}>
            <Route path="/signup" Component={Signup} />
            <Route path="/signin" Component={Signin} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </ErrorBoundary>
);
