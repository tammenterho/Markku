import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import NotFound from "./NotFound";
import CreateCampaign from "./CreateCampaign";
import { CampaignList } from "./campaignList";
import Settings from "./Settings";
import Login from "./Login";

const isAuthenticated = () => Boolean(localStorage.getItem("accessToken"));

const RequireAuth = ({ children }: { children: ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const RouterSwitcher = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated() ? <Navigate to="/" replace /> : <Login />
        }
      />
      <Route
        path="/"
        element={
          <RequireAuth>
            <CampaignList />
          </RequireAuth>
        }
      />
      <Route
        path="/settings"
        element={
          <RequireAuth>
            <Settings />
          </RequireAuth>
        }
      />
      <Route
        path="/campaign"
        element={
          <RequireAuth>
            <CampaignList />
          </RequireAuth>
        }
      />
      <Route
        path="/new"
        element={
          <RequireAuth>
            <CreateCampaign />
          </RequireAuth>
        }
      />
      <Route
        path="*"
        element={
          <RequireAuth>
            <NotFound />
          </RequireAuth>
        }
      />
    </Routes>
  );
};

export default RouterSwitcher;
