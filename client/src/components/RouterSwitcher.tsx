import { Route, Routes } from "react-router-dom";
import NotFound from "./NotFound";
import CreateCampaign from "./CreateCampaign";
import { CampaignList } from "./campaignList";
import Settings from "./Settings";

const RouterSwitcher = () => {
  return (
    <Routes>
      <Route path="*" element={<NotFound />} />
      <Route path="/" element={<CampaignList />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/campaign" element={<CampaignList />} />
      <Route path="/new" element={<CreateCampaign />} />
    </Routes>
  );
};

export default RouterSwitcher;
