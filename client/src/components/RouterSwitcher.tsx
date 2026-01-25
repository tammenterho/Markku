import { Route, Routes } from "react-router-dom";
import NotFound from "./NotFound";
import { CampaignList } from "./campaignList";
import Home from "./Home";

const RouterSwitcher = () => {
  return (
    <Routes>
      <Route path="*" element={<NotFound />} />
      <Route path="/" element={<Home />} />
      <Route path="/campaign" element={<CampaignList />} />
    </Routes>
  );
};

export default RouterSwitcher;
