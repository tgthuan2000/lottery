import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { App as AntAppProvider, ConfigProvider } from "antd";
import locale from "antd/locale/vi_VN";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import arraySupport from "dayjs/plugin/arraySupport";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { BrowserRouter, RouteObject, useRoutes } from "react-router-dom";
import { queryClient } from "./config/query-client";
import { theme } from "./config/theme";
import ConfigPage from "./pages/config";
import DashboardPage from "./pages/dashboard";
import ImportPage from "./pages/import";
import LotteryPage from "./pages/lottery";
import NotFound from "./shared/components/not-found";

dayjs.extend(customParseFormat);
dayjs.extend(arraySupport);

export default function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AntAppProvider notification={{ placement: "bottomLeft" }}>
          <ConfigProvider theme={theme} locale={locale}>
            <AppRouter />
          </ConfigProvider>
        </AntAppProvider>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </BrowserRouter>
  );
}

const routers: RouteObject[] = [
  {
    path: "/",
    element: <DashboardPage />,
  },
  {
    path: "config",
    element: <ConfigPage />,
  },
  {
    path: "lottery",
    element: <LotteryPage />,
  },
  {
    path: "import",
    element: <ImportPage />,
  },
  {
    path: "/404",
    element: <NotFound />,
  },
];

const AppRouter = () => {
  return useRoutes(routers);
};
