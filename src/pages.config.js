import Dashboard from './pages/Dashboard';
import IslamicFinanceChat from './pages/IslamicFinanceChat';
import Financing from './pages/Financing.jsx';
import Landing from './pages/Landing';
import Logistics from './pages/Logistics';
import MarketInsights from './pages/MarketInsights';
import Messages from './pages/Messages';
import Network from './pages/Network';
import Production from './pages/Production';
import Resources from './pages/Resources';
import Sustainability from './pages/Sustainability';
import Traceability from './pages/Traceability';
import Weather from './pages/Weather';
import HalalCertification from './pages/HalalCertification';
import ZakatCalculator from './pages/ZakatCalculator';
import Marketplace from './pages/Marketplace';
import __Layout from './Layout.jsx';

export const PAGES = {
  Dashboard,
  IslamicFinanceChat,
  Financing,
  Landing,
  Logistics,
  MarketInsights,
  Messages,
  Network,
  Production,
  Resources,
  Sustainability,
  Traceability,
  Weather,
  HalalCertification,
  ZakatCalculator,
  Marketplace,
};

export const pagesConfig = {
  mainPage: 'Landing',
  Pages: PAGES,
  Layout: __Layout,
};
