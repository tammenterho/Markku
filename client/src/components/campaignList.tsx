import axios from "axios";
import { useEffect, useState } from "react";

interface Campaign {
  id: string;
  clientId: string;
  companyId: string;
  company: string;
  customer: string;
  name: string;
  title: string;
  copyText: string;
  targetAge: string;
  targetArea: string;
  budget: number;
  start: Date;
  end: Date;
  status: string;
  type: string;
}

export const CampaignList = () => {
  const [campaign, setCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    axios
      .get("http://localhost:3000/campaigns")
      .then((response) => setCampaign(response.data))
      .catch((error) => console.error("Error fetching campaigns:", error));
  }, []);

  if (!campaign) {
    return <div>Loading campaigns...</div>;
  }

  return (
    <div>
      <h2>Campaign List</h2>
      <h3>{campaign.name}</h3>
      <p>Company: {campaign.company}</p>
      <p>Title: {campaign.title}</p>
      <p>Budget: {campaign.budget}€</p>
    </div>
  );
};
