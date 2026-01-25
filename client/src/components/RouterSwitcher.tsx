import { Route, Routes } from "react-router-dom";
import NotFound from "./NotFound";
import Home from "./Home";
import CreateCampaign from "./CreateCampaign";
import { CampaignList } from "./campaignList";

const RouterSwitcher = () => {
  return (
    <Routes>
      <Route path="*" element={<NotFound />} />
      <Route path="/" element={<Home />} />
      <Route path="/campaign" element={<CampaignList />} />
      <Route path="/new" element={<CreateCampaign />} />
    </Routes>
  );
};

export default RouterSwitcher;
