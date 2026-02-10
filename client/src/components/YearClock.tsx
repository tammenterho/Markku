import { useState } from "react";
import { Container, Text } from "@mantine/core";
import Campaign, { type Campaign as CampaignType } from "./Campaign";

const YEAR = 2026;
const WEEKS_IN_YEAR = 52;

// Helper function to get week number from date
const getWeekNumber = (date: Date): number => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return weekNo;
};

// Helper to get campaign weeks span
const getCampaignWeeks = (start: Date, end: Date, year: number): number[] => {
  const weeks: number[] = [];
  const startDate = new Date(start);
  const endDate = new Date(end);

  // Only include campaigns that overlap with the target year
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31);

  if (endDate < yearStart || startDate > yearEnd) {
    return weeks;
  }

  // Adjust dates to be within the target year
  const effectiveStart = startDate < yearStart ? yearStart : startDate;
  const effectiveEnd = endDate > yearEnd ? yearEnd : endDate;

  const startWeek = getWeekNumber(effectiveStart);
  const endWeek = getWeekNumber(effectiveEnd);

  // Handle year wrap-around
  if (startWeek <= endWeek) {
    for (let i = startWeek; i <= endWeek; i++) {
      weeks.push(i);
    }
  } else {
    for (let i = startWeek; i <= WEEKS_IN_YEAR; i++) {
      weeks.push(i);
    }
    for (let i = 1; i <= endWeek; i++) {
      weeks.push(i);
    }
  }

  return weeks;
};

// Generate color for campaign based on its index
const getCampaignColor = (index: number): string => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E2",
    "#F8B739",
    "#52B788",
    "#E76F51",
    "#2A9D8F",
    "#E9C46A",
    "#F4A261",
    "#264653",
  ];
  return colors[index % colors.length];
};

interface CampaignSegment {
  campaign: CampaignType;
  week: number;
  color: string;
}

interface YearClockProps {
  campaigns: CampaignType[];
  onUpdate: () => void;
}

export const YearClock = ({
  campaigns: allCampaigns,
  onUpdate,
}: YearClockProps) => {
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignType | null>(
    null,
  );
  const [modalOpened, setModalOpened] = useState(false);
  const [hoveredCampaignId, setHoveredCampaignId] = useState<string | null>(
    null,
  );

  // Filter campaigns that overlap with the target year
  const campaigns = allCampaigns.filter((c: CampaignType) => {
    const start = new Date(c.start);
    const end = new Date(c.end);
    const yearStart = new Date(YEAR, 0, 1);
    const yearEnd = new Date(YEAR, 11, 31);
    return !(end < yearStart || start > yearEnd);
  });

  // Build segments for each week
  const segments: CampaignSegment[] = [];
  campaigns.forEach((campaign, index) => {
    const weeks = getCampaignWeeks(
      new Date(campaign.start),
      new Date(campaign.end),
      YEAR,
    );
    const color = getCampaignColor(index);
    weeks.forEach((week) => {
      segments.push({ campaign, week, color });
    });
  });

  // SVG dimensions
  const size = 800;
  const center = size / 2;
  const outerRadius = 350;
  const innerRadius = 150;
  const anglePerWeek = (2 * Math.PI) / WEEKS_IN_YEAR;

  // Create path for a week segment
  const createSegmentPath = (weekNumber: number): string => {
    const startAngle = (weekNumber - 1) * anglePerWeek - Math.PI / 2;
    const endAngle = weekNumber * anglePerWeek - Math.PI / 2;

    const x1 = center + innerRadius * Math.cos(startAngle);
    const y1 = center + innerRadius * Math.sin(startAngle);
    const x2 = center + outerRadius * Math.cos(startAngle);
    const y2 = center + outerRadius * Math.sin(startAngle);
    const x3 = center + outerRadius * Math.cos(endAngle);
    const y3 = center + outerRadius * Math.sin(endAngle);
    const x4 = center + innerRadius * Math.cos(endAngle);
    const y4 = center + innerRadius * Math.sin(endAngle);

    return `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1} Z`;
  };

  // Group segments by week for multi-campaign weeks
  const weekSegments = new Map<number, CampaignSegment[]>();
  segments.forEach((seg) => {
    if (!weekSegments.has(seg.week)) {
      weekSegments.set(seg.week, []);
    }
    weekSegments.get(seg.week)?.push(seg);
  });

  return (
    <div style={{ width: "100%", padding: "10px" }}>
      <Container
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        {campaigns.length === 0 ? (
          <Text>Ei kampanjoita vuodelle {YEAR}</Text>
        ) : (
          <>
            <svg
              viewBox={`0 0 ${size} ${size}`}
              style={{
                maxWidth: "100%",
                height: "auto",
                width: "100%",
                maxHeight: "90vh",
              }}
            >
              {/* Background circle */}
              <circle
                cx={center}
                cy={center}
                r={outerRadius}
                fill="none"
                stroke="#e0e0e0"
                strokeWidth="1"
              />
              <circle
                cx={center}
                cy={center}
                r={innerRadius}
                fill="none"
                stroke="#e0e0e0"
                strokeWidth="1"
              />

              {/* Week segments */}
              {Array.from({ length: WEEKS_IN_YEAR }, (_, i) => i + 1).map(
                (week) => {
                  const weekSegs = weekSegments.get(week) || [];

                  if (weekSegs.length === 0) {
                    // Empty week - draw gray background
                    return (
                      <path
                        key={`week-${week}`}
                        d={createSegmentPath(week)}
                        fill="#f5f5f5"
                        stroke="#e0e0e0"
                        strokeWidth="0.5"
                      />
                    );
                  }

                  // Week has campaigns - create stacked segments
                  const segmentCount = weekSegs.length;
                  const radiusStep = (outerRadius - innerRadius) / segmentCount;

                  return (
                    <g key={`week-${week}`}>
                      {weekSegs.map((seg, idx) => {
                        const segInnerRadius = innerRadius + idx * radiusStep;
                        const segOuterRadius =
                          innerRadius + (idx + 1) * radiusStep;

                        const startAngle =
                          (week - 1) * anglePerWeek - Math.PI / 2;
                        const endAngle = week * anglePerWeek - Math.PI / 2;

                        const x1 =
                          center + segInnerRadius * Math.cos(startAngle);
                        const y1 =
                          center + segInnerRadius * Math.sin(startAngle);
                        const x2 =
                          center + segOuterRadius * Math.cos(startAngle);
                        const y2 =
                          center + segOuterRadius * Math.sin(startAngle);
                        const x3 = center + segOuterRadius * Math.cos(endAngle);
                        const y3 = center + segOuterRadius * Math.sin(endAngle);
                        const x4 = center + segInnerRadius * Math.cos(endAngle);
                        const y4 = center + segInnerRadius * Math.sin(endAngle);

                        const path = `M ${x1} ${y1} L ${x2} ${y2} A ${segOuterRadius} ${segOuterRadius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${segInnerRadius} ${segInnerRadius} 0 0 0 ${x1} ${y1} Z`;

                        return (
                          <path
                            key={`seg-${week}-${idx}`}
                            d={path}
                            fill={seg.color}
                            stroke="white"
                            strokeWidth="1"
                            opacity={
                              hoveredCampaignId === seg.campaign.id ? 1 : 0.8
                            }
                            style={{ cursor: "pointer" }}
                            onMouseEnter={() =>
                              setHoveredCampaignId(seg.campaign.id)
                            }
                            onMouseLeave={() => setHoveredCampaignId(null)}
                            onClick={() => {
                              setSelectedCampaign(seg.campaign);
                              setModalOpened(true);
                            }}
                          >
                            <title>
                              {seg.campaign.name} - Viikko {week}
                            </title>
                          </path>
                        );
                      })}
                    </g>
                  );
                },
              )}

              {/* Week numbers */}
              {[1, 13, 26, 39].map((week) => {
                const angle = (week - 1) * anglePerWeek - Math.PI / 2;
                const labelRadius = outerRadius + 30;
                const x = center + labelRadius * Math.cos(angle);
                const y = center + labelRadius * Math.sin(angle);

                return (
                  <text
                    key={`label-${week}`}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="14"
                    fill="#666"
                  >
                    V{week}
                  </text>
                );
              })}

              {/* Center text */}
              <text
                x={center}
                y={center}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="48"
                fontWeight="bold"
                fill="#333"
              >
                {YEAR}
              </text>
            </svg>

            {/* Legend */}
            <div style={{ marginTop: "20px", maxWidth: "100%", width: "100%" }}>
              <Text size="lg" fw={600} mb="md">
                Kampanjat:
              </Text>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  gap: "10px",
                }}
              >
                {campaigns.map((campaign, index) => {
                  const color = getCampaignColor(index);
                  const isHovered = hoveredCampaignId === campaign.id;
                  return (
                    <div
                      key={campaign.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        padding: "5px",
                        borderRadius: "4px",
                        transition: "background-color 0.2s",
                        backgroundColor: isHovered ? "#f0f0f0" : "transparent",
                      }}
                      onMouseEnter={() => setHoveredCampaignId(campaign.id)}
                      onMouseLeave={() => setHoveredCampaignId(null)}
                      onClick={() => {
                        setSelectedCampaign(campaign);
                        setModalOpened(true);
                      }}
                    >
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          backgroundColor: color,
                          borderRadius: "3px",
                          flexShrink: 0,
                        }}
                      />
                      <Text
                        size="sm"
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {campaign.name}
                      </Text>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </Container>

      <Campaign
        campaign={selectedCampaign}
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        onUpdate={onUpdate}
      />
    </div>
  );
};
