import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";

import App from "../App";

const Landing = lazy(() => import("@/features/landing/Landing"));
const Dashboard = lazy(() => import("@/features/dashboard/Dashboard"));
const Sources = lazy(() => import("@/features/sources/Sources"));
const Analysis = lazy(() => import("@/features/analysis/Analysis"));
const Reports = lazy(() => import("@/features/reports/Reports"));
const Connectors = lazy(() => import("@/features/connectors/Connectors"));
const Settings = lazy(() => import("@/features/settings/Settings"));

function Loader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500" />
        <span className="text-slate-400">Loading...</span>
      </div>
    </div>
  );
}

const lazyPage = (Page: React.LazyExoticComponent<any>) => (
  <Suspense fallback={<Loader />}>
    <Page />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: lazyPage(Landing),
      },
      {
        path: "dashboard",
        element: lazyPage(Dashboard),
      },
      {
        path: "sources",
        element: lazyPage(Sources),
      },
      {
        path: "analysis",
        element: lazyPage(Analysis),
      },
      {
        path: "reports",
        element: lazyPage(Reports),
      },
      {
        path: "connectors",
        element: lazyPage(Connectors),
      },
      {
        path: "settings",
        element: lazyPage(Settings),
      },
    ],
  },
]);
