export type CampaignType = "AD" | "POST";
export type BudgetPeriod = "DAY" | "DURATION";

export const typeLabels: Record<CampaignType, string> = {
  AD: "Mainos",
  POST: "Postaus",
};

export const budgetPeriodLabels: Record<BudgetPeriod, string> = {
  DAY: "Käytä budjetti päivittäin",
  DURATION: "Jaa budjetti kampanjan kestolle",
};

export const genderOptions = ["All", "Nainen", "Mies"];

export const ctaOptions = [
  "Pyydä tarjous",
  "Hae nyt",
  "Varaa nyt",
  "Ota meihin yhteyttä",
  "Lataa",
  "Tartu tarjoukseen",
  "Hanki markkinointeja",
  "Hae esitysajat",
  "Lue lisää",
  "Kuuntele nyt",
  "Tilaa nyt",
  "Hanki käyttöoikeus",
  "Varaa aika",
  "Näytä ruokalista",
  "Tilaa päivitykset",
  "Osta nyt",
  "Rekisteröidy",
  "Tilaa",
  "Katso lisää",
];
