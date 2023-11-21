import { App as AntAppProvider, ConfigProvider } from "antd";
import locale from "antd/locale/vi_VN";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import arraySupport from "dayjs/plugin/arraySupport";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { BrowserRouter, RouteObject, useRoutes } from "react-router-dom";
import { theme } from "./config/theme";
import NotFound from "./shared/components/not-found";
import ConfigPage from "./pages/config";
import DashboardPage from "./pages/dashboard";
import LotteryPage from "./pages/lottery";

dayjs.extend(customParseFormat);
dayjs.extend(arraySupport);

export default function App() {
  return (
    <BrowserRouter>
      <AntAppProvider notification={{ placement: "bottomLeft" }}>
        <ConfigProvider theme={theme} locale={locale}>
          <AppRouter />
        </ConfigProvider>
      </AntAppProvider>
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
    children: [],
  },
  {
    path: "/404",
    element: <NotFound />,
  },
];

const AppRouter = () => {
  return useRoutes(routers);
};
