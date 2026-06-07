import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Campaign } from './campaign.entity';

type MetaObjectIdResponse = {
  id: string;
};

type MetaErrorResponse = {
  error?: {
    message?: string;
    error_user_msg?: string;
  };
};

export type MetaPublishResult = {
  metaCampaignId: string;
  metaAdSetId: string;
  metaCreativeId: string;
  metaAdId: string;
  status: 'published';
};

@Injectable()
export class MetaAdsPublisherService {
  private readonly logger = new Logger(MetaAdsPublisherService.name);
  private readonly graphApiVersion =
    process.env.META_GRAPH_API_VERSION || 'v25.0';
  private readonly graphApiBaseUrl = `https://graph.facebook.com/${this.graphApiVersion}`;

  async publishCampaign(campaign: Campaign): Promise<MetaPublishResult> {
    const accessToken = this.getRequiredEnv('META_ACCESS_TOKEN');
    const adAccountId = this.normalizeAdAccountId(
      this.getRequiredEnv('META_AD_ACCOUNT_ID'),
    );
    const pageId = this.getRequiredEnv('META_PAGE_ID');
    const imageUrl = campaign.imageUrls?.[0];

    if (
      !campaign.name ||
      !campaign.title ||
      !campaign.copyText ||
      !campaign.url
    ) {
      throw new BadRequestException(
        'Campaign must include name, title, copyText, and url before publishing to Meta',
      );
    }

    if (!imageUrl) {
      throw new BadRequestException(
        'Campaign must include at least one image URL before publishing to Meta',
      );
    }

    const metaCampaign = await this.postForm<MetaObjectIdResponse>(
      `/${adAccountId}/campaigns`,
      {
        name: campaign.name,
        objective: process.env.META_CAMPAIGN_OBJECTIVE || 'OUTCOME_TRAFFIC',
        special_ad_categories: JSON.stringify([]),
        status: 'PAUSED',
        access_token: accessToken,
      },
    );

    const metaAdSet = await this.postForm<MetaObjectIdResponse>(
      `/${adAccountId}/adsets`,
      this.buildAdSetPayload(campaign, metaCampaign.id, accessToken),
    );

    const metaCreative = await this.postForm<MetaObjectIdResponse>(
      `/${adAccountId}/adcreatives`,
      this.buildCreativePayload(campaign, pageId, imageUrl, accessToken),
    );

    const metaAd = await this.postForm<MetaObjectIdResponse>(
      `/${adAccountId}/ads`,
      {
        name: `${campaign.name} Ad`,
        adset_id: metaAdSet.id,
        creative: JSON.stringify({ creative_id: metaCreative.id }),
        status: 'PAUSED',
        access_token: accessToken,
      },
    );

    this.logger.log(
      `Published campaign ${campaign.id} to Meta campaign ${metaCampaign.id}`,
    );

    return {
      metaCampaignId: metaCampaign.id,
      metaAdSetId: metaAdSet.id,
      metaCreativeId: metaCreative.id,
      metaAdId: metaAd.id,
      status: 'published',
    };
  }

  private getRequiredEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
      throw new BadRequestException(
        `Meta publishing requires ${name} to be configured`,
      );
    }
    return value;
  }

  private normalizeAdAccountId(rawAccountId: string): string {
    const trimmed = rawAccountId.trim();
    return trimmed.replace(/^act_/i, '');
  }

  private buildAdSetPayload(
    campaign: Campaign,
    metaCampaignId: string,
    accessToken: string,
  ): Record<string, string> {
    const targeting: Record<string, unknown> = {
      geo_locations: {
        countries: this.extractCountryCodes(campaign.targetArea),
      },
    };
    const ageRange = this.parseAgeRange(campaign.targetAge);
    const genders = this.parseGenders(campaign.targetGender);

    if (ageRange.minAge) {
      targeting.age_min = ageRange.minAge;
    }

    if (ageRange.maxAge) {
      targeting.age_max = ageRange.maxAge;
    }

    if (genders.length > 0) {
      targeting.genders = genders;
    }

    const payload: Record<string, string> = {
      name: `${campaign.name} Ad Set`,
      campaign_id: metaCampaignId,
      daily_budget: String(this.resolveDailyBudgetInMinorUnits(campaign)),
      billing_event: 'IMPRESSIONS',
      optimization_goal: 'LINK_CLICKS',
      bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
      targeting: JSON.stringify(targeting),
      status: 'PAUSED',
      access_token: accessToken,
    };

    if (campaign.start) {
      payload.start_time = new Date(campaign.start).toISOString();
    }

    if (campaign.end) {
      payload.end_time = new Date(campaign.end).toISOString();
    }

    return payload;
  }

  private buildCreativePayload(
    campaign: Campaign,
    pageId: string,
    imageUrl: string,
    accessToken: string,
  ): Record<string, string> {
    const objectStorySpec: Record<string, unknown> = {
      page_id: pageId,
      link_data: {
        link: campaign.url,
        message: campaign.copyText,
        name: campaign.title,
        picture: imageUrl,
        call_to_action: {
          type: this.normalizeCallToAction(campaign.cta),
          value: {
            link: campaign.url,
          },
        },
      },
    };

    if (process.env.META_INSTAGRAM_ACTOR_ID) {
      objectStorySpec.instagram_actor_id = process.env.META_INSTAGRAM_ACTOR_ID;
    }

    return {
      name: `${campaign.name} Creative`,
      object_story_spec: JSON.stringify(objectStorySpec),
      access_token: accessToken,
    };
  }

  private async postForm<T>(
    path: string,
    payload: Record<string, string>,
  ): Promise<T> {
    const requestUrl = `${this.graphApiBaseUrl}${path}`;
    const safePayload = this.maskSensitivePayload(payload);
    this.logger.log(
      `Meta API request: ${JSON.stringify({
        method: 'POST',
        url: requestUrl,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: safePayload,
      })}`,
    );

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(payload),
    });

    const data = (await response.json()) as T & MetaErrorResponse;

    if (!response.ok) {
      const message =
        data.error?.error_user_msg ||
        data.error?.message ||
        'Unknown Meta API error';
      this.logger.error(`Meta API request failed for ${path}: ${message}`);
      throw new BadRequestException(message);
    }

    return data;
  }

  private maskSensitivePayload(
    payload: Record<string, string>,
  ): Record<string, string> {
    const masked = { ...payload };

    if (masked.access_token) {
      masked.access_token = '***';
    }

    return masked;
  }

  private extractCountryCodes(targetArea?: string | null): string[] {
    if (!targetArea) {
      return ['FI'];
    }

    const countries = targetArea
      .split(',')
      .map((value) => value.trim().toUpperCase())
      .filter((value) => /^[A-Z]{2}$/.test(value));

    return countries.length > 0 ? countries : ['FI'];
  }

  private parseAgeRange(targetAge?: string | null): {
    minAge?: number;
    maxAge?: number;
  } {
    if (!targetAge) {
      return {};
    }

    const match = targetAge.match(/(\d+)?\s*,\s*(\d+)?/);
    if (!match) {
      return {};
    }

    const minAge = match[1] ? Number(match[1]) : undefined;
    const upperBound = match[2] ? Number(match[2]) : undefined;

    return {
      minAge,
      maxAge: upperBound ? Math.max(upperBound - 1, 13) : undefined,
    };
  }

  private parseGenders(targetGender?: string | null): number[] {
    const normalized = targetGender?.trim().toLowerCase();

    if (!normalized || normalized === 'all') {
      return [];
    }

    if (normalized === 'male' || normalized === 'men') {
      return [1];
    }

    if (normalized === 'female' || normalized === 'women') {
      return [2];
    }

    return [];
  }

  private resolveDailyBudgetInMinorUnits(campaign: Campaign): number {
    const budget = Number(campaign.budget || 0);
    if (budget <= 0) {
      throw new BadRequestException(
        'Campaign budget must be greater than zero before publishing to Meta',
      );
    }

    const normalizedPeriod = (campaign.budgetPeriod || 'daily').toLowerCase();
    let dailyBudget = budget;

    if (normalizedPeriod.includes('week')) {
      dailyBudget = budget / 7;
    } else if (normalizedPeriod.includes('month')) {
      dailyBudget = budget / 30;
    } else if (
      (normalizedPeriod.includes('campaign') ||
        normalizedPeriod.includes('total')) &&
      campaign.start &&
      campaign.end
    ) {
      const milliseconds =
        new Date(campaign.end).getTime() - new Date(campaign.start).getTime();
      const days = Math.max(Math.ceil(milliseconds / (1000 * 60 * 60 * 24)), 1);
      dailyBudget = budget / days;
    }

    return Math.max(Math.round(dailyBudget * 100), 100);
  }

  private normalizeCallToAction(cta?: string | null): string {
    const normalized = cta?.trim().toUpperCase().replace(/\s+/g, '_');
    const supported = new Set([
      'APPLY_NOW',
      'BOOK_TRAVEL',
      'CONTACT_US',
      'DOWNLOAD',
      'GET_OFFER',
      'GET_QUOTE',
      'LEARN_MORE',
      'ORDER_NOW',
      'SHOP_NOW',
      'SIGN_UP',
      'SUBSCRIBE',
    ]);

    if (normalized && supported.has(normalized)) {
      return normalized;
    }

    return 'LEARN_MORE';
  }
}
