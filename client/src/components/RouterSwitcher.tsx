import { Suspense, lazy, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const NotFound = lazy(() => import("./NotFound"));
const CreateCampaign = lazy(() => import("./CreateCampaign"));
const CampaignList = lazy(() =>
  import("./campaignList").then((module) => ({ default: module.CampaignList })),
);
const Settings = lazy(() => import("./Settings"));
const Login = lazy(() => import("./Login"));

const isAuthenticated = () => Boolean(localStorage.getItem("accessToken"));

const RequireAuth = ({ children }: { children: ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const RouterSwitcher = () => {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated() ? <Navigate to="/" replace /> : <Login />}
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
    </Suspense>
  );
};

export default RouterSwitcher;
