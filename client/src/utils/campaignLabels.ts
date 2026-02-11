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
