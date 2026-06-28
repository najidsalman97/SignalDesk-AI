import {
  createBrowserRouter,
} from "react-router-dom";

import {
  lazy,
  Suspense,
} from "react";

import App from "../App";

const Landing = lazy(() =>
  import("@/features/landing/Landing")
);

const Dashboard = lazy(() =>
  import("@/features/dashboard/Dashboard")
);

const Sources = lazy(() =>
  import("@/features/sources/Sources")
);

const Analysis = lazy(() =>
  import("@/features/analysis/Analysis")
);

const Insights = lazy(() =>
  import("@/features/insights/Insights")
);

const Reports = lazy(() =>
  import("@/features/reports/Reports")
);

const Integrations = lazy(() =>
  import("@/features/integrations/Integrations")
);

const Settings = lazy(() =>
  import("@/features/settings/Settings")
);

function Loader() {
  return (
    <div className="flex h-screen items-center justify-center text-xl">
      Loading...
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
        path: "insights",
        element: lazyPage(Insights),
      },

      {
        path: "reports",
        element: lazyPage(Reports),
      },

      {
        path: "integrations",
        element: lazyPage(Integrations),
      },

      {
        path: "settings",
        element: lazyPage(Settings),
      },
    ],
  },
]);