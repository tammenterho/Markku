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
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/campaigns")
      .then((response) => setCampaigns(response.data))
      .catch((error) => console.error("Error fetching campaigns:", error));
  }, []);

  if (campaigns.length === 0) {
    return <div>Loading campaigns...</div>;
  }

  return (
    <div>
      <h2>Campaign List</h2>
      {campaigns.map((campaign) => (
        <div
          key={campaign.id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          <h3>{campaign.name}</h3>
          <p>Company: {campaign.company}</p>
          <p>Title: {campaign.title}</p>
          <p>Budget: {campaign.budget}€</p>
        </div>
      ))}
    </div>
  );
};
