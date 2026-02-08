export const TENANT_PREFIX = 'tenant_';
export const USER_ID_HEADER = 'x-user-id';
export const API_BASE_URL = 'http://localhost:3000';

export const CAMPAIGN_ALLOWED_FIELDS = [
  'clientId',
  'type',
  'companyId',
  'company',
  'payer',
  'name',
  'customer',
  'budget',
  'budgetPeriod',
  'mediaInfo',
  'start',
  'end',
  'targetArea',
  'targetAge',
  'targetGender',
  'title',
  'copyText',
  'url',
  'cta',
  'createdBy',
] as const;
