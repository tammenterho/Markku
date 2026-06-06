import { useMemo, useState } from "react";
import {
  Container,
  Text,
  Checkbox,
  Group,
  useComputedColorScheme,
} from "@mantine/core";
import Campaign, { type Campaign as CampaignType } from "./Campaign";

const WEEKS_IN_YEAR = 52;
const MONTHS_IN_YEAR = 12;
const QUARTERS_IN_YEAR = 4;

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

const GOLDEN_ANGLE = 137.508;

const formatDateLabel = (value: string | Date): string => {
  if (typeof value === "string") {
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      const [, year, month, day] = m;
      return `${day}.${month}.${year}`;
    }
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

interface CampaignSegment {
  campaign: CampaignType;
  period: number; // week, month, or quarter number
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
  const colorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });
  const isDark = colorScheme === "dark";
  const ringStroke = isDark ? "#3d3d3d" : "#e0e0e0";
  const emptyFill = isDark ? "#1e1e1e" : "#f5f5f5";
  const labelColor = isDark ? "#b5b5b5" : "#666";
  const centerText = isDark ? "#e6e6e6" : "#333";
  const arrowColor = isDark ? "#9b9b9b" : "#888";
  const segmentStroke = isDark ? "#1a1a1a" : "#ffffff";
  const legendHover = isDark ? "#222" : "#f0f0f0";

  const [year, setYear] = useState(2026);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignType | null>(
    null,
  );
  const [modalOpened, setModalOpened] = useState(false);
  const [hoveredCampaignId, setHoveredCampaignId] = useState<string | null>(
    null,
  );
  const [showMonths, setShowMonths] = useState(false);
  const [showQuarters, setShowQuarters] = useState(false);

  const monthNames = [
    "Tammi",
    "Helmi",
    "Maalis",
    "Huhti",
    "Touko",
    "Kesä",
    "Heinä",
    "Elo",
    "Syys",
    "Loka",
    "Marras",
    "Joulu",
  ];

  // Filter campaigns that overlap with the target year
  const campaigns = allCampaigns.filter((c: CampaignType) => {
    const start = new Date(c.start);
    const end = new Date(c.end);
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);
    return !(end < yearStart || start > yearEnd);
  });

  const colorIndexMap = useMemo(() => {
    const ids = campaigns.map((c) => c.id).sort();
    return new Map(ids.map((id, index) => [id, index]));
  }, [campaigns]);

  const getCampaignColor = (id: string): string => {
    const index = colorIndexMap.get(id) ?? 0;
    const hue = (index * GOLDEN_ANGLE) % 360;
    const lightness = isDark ? 70 : 55;
    return `hsl(${hue} 70% ${lightness}%)`;
  };

  // Build segments for each week (always use weeks for campaigns)
  const segments: CampaignSegment[] = [];
  campaigns.forEach((campaign) => {
    const weeks = getCampaignWeeks(
      new Date(campaign.start),
      new Date(campaign.end),
      year,
    );
    const color = getCampaignColor(campaign.id);
    weeks.forEach((week) => {
      segments.push({ campaign, period: week, color });
    });
  });

  // Group segments by period for multi-campaign periods
  const periodSegments = new Map<number, CampaignSegment[]>();
  segments.forEach((seg) => {
    if (!periodSegments.has(seg.period)) {
      periodSegments.set(seg.period, []);
    }
    periodSegments.get(seg.period)?.push(seg);
  });

  // Find the maximum number of concurrent campaigns in any period
  const maxConcurrentCampaigns = Math.max(
    ...Array.from(periodSegments.values()).map((segs) => segs.length),
    1,
  );

  // Assign each campaign a consistent track number, avoiding overlaps
  const campaignTracks = new Map<string, number>();
  const trackOccupancy: Map<number, Set<number>> = new Map(); // track -> set of periods

  campaigns.forEach((campaign) => {
    const periods = getCampaignWeeks(
      new Date(campaign.start),
      new Date(campaign.end),
      year,
    );

    // Find the first track that doesn't conflict with this campaign's periods
    let assignedTrack = -1;
    for (let track = 0; track < maxConcurrentCampaigns; track++) {
      const occupiedPeriods = trackOccupancy.get(track) || new Set();
      const hasConflict = periods.some((p) => occupiedPeriods.has(p));

      if (!hasConflict) {
        assignedTrack = track;
        // Mark these periods as occupied in this track
        periods.forEach((p) => {
          if (!trackOccupancy.has(track)) {
            trackOccupancy.set(track, new Set());
          }
          trackOccupancy.get(track)!.add(p);
        });
        break;
      }
    }

    // If no non-conflicting track found, use a fallback
    if (assignedTrack === -1) {
      assignedTrack = campaigns.indexOf(campaign) % maxConcurrentCampaigns;
    }

    campaignTracks.set(campaign.id, assignedTrack);
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
        <>
          <Group mb="md">
            <Checkbox
              label="Näytä kuukaudet"
              checked={showMonths}
              onChange={(e) => setShowMonths(e.currentTarget.checked)}
            />
            <Checkbox
              label="Näytä kvartaalit"
              checked={showQuarters}
              onChange={(e) => setShowQuarters(e.currentTarget.checked)}
            />
          </Group>
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
              stroke={ringStroke}
              strokeWidth="1"
            />
            <circle
              cx={center}
              cy={center}
              r={innerRadius}
              fill="none"
              stroke={ringStroke}
              strokeWidth="1"
            />

            {/* Week segments */}
            {Array.from({ length: WEEKS_IN_YEAR }, (_, i) => i + 1).map(
              (week) => {
                const periodSegs = periodSegments.get(week) || [];
                const radiusStep =
                  (outerRadius - innerRadius) / maxConcurrentCampaigns;

                if (periodSegs.length === 0) {
                  // Empty week - draw gray background
                  return (
                    <path
                      key={`week-${week}`}
                      d={createSegmentPath(week)}
                      fill={emptyFill}
                      stroke={ringStroke}
                      strokeWidth="0.5"
                    />
                  );
                }

                return (
                  <g key={`week-${week}`}>
                    {/* Draw all tracks as white/light background first */}
                    {Array.from(
                      { length: maxConcurrentCampaigns },
                      (_, trackIndex) => {
                        const segInnerRadius =
                          innerRadius + trackIndex * radiusStep;
                        const segOuterRadius =
                          innerRadius + (trackIndex + 1) * radiusStep;

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
                            key={`bg-${week}-${trackIndex}`}
                            d={path}
                            fill={emptyFill}
                            stroke={ringStroke}
                            strokeWidth="0.5"
                          />
                        );
                      },
                    )}

                    {/* Draw campaigns on top */}
                    {periodSegs.map((seg) => {
                      // Use consistent track number for this campaign
                      const trackIndex =
                        campaignTracks.get(seg.campaign.id) || 0;
                      const segInnerRadius =
                        innerRadius + trackIndex * radiusStep;
                      const segOuterRadius =
                        innerRadius + (trackIndex + 1) * radiusStep;

                      const startAngle =
                        (week - 1) * anglePerWeek - Math.PI / 2;
                      const endAngle = week * anglePerWeek - Math.PI / 2;

                      const x1 = center + segInnerRadius * Math.cos(startAngle);
                      const y1 = center + segInnerRadius * Math.sin(startAngle);
                      const x2 = center + segOuterRadius * Math.cos(startAngle);
                      const y2 = center + segOuterRadius * Math.sin(startAngle);
                      const x3 = center + segOuterRadius * Math.cos(endAngle);
                      const y3 = center + segOuterRadius * Math.sin(endAngle);
                      const x4 = center + segInnerRadius * Math.cos(endAngle);
                      const y4 = center + segInnerRadius * Math.sin(endAngle);

                      const path = `M ${x1} ${y1} L ${x2} ${y2} A ${segOuterRadius} ${segOuterRadius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${segInnerRadius} ${segInnerRadius} 0 0 0 ${x1} ${y1} Z`;

                      return (
                        <path
                          key={`seg-${week}-${seg.campaign.id}`}
                          d={path}
                          fill={seg.color}
                          stroke={segmentStroke}
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
                            {seg.campaign.name} -{" "}
                            {formatDateLabel(seg.campaign.start)} -{" "}
                            {formatDateLabel(seg.campaign.end)}
                          </title>
                        </path>
                      );
                    })}
                  </g>
                );
              },
            )}

            {/* Week labels */}
            {Array.from({ length: WEEKS_IN_YEAR }, (_, i) => i + 1).map(
              (week) => {
                const angle = (week - 0.5) * anglePerWeek - Math.PI / 2;
                const labelRadius = outerRadius + 20;
                const x = center + labelRadius * Math.cos(angle);
                const y = center + labelRadius * Math.sin(angle);

                return (
                  <text
                    key={`label-${week}`}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="9"
                    fill={labelColor}
                  >
                    {week}
                  </text>
                );
              },
            )}

            {/* Month dividers and labels */}
            {showMonths &&
              Array.from({ length: MONTHS_IN_YEAR }, (_, i) => i + 1).map(
                (month) => {
                  // Calculate which week each month starts at (approximately)
                  const weekInMonth = Math.floor(
                    (month - 1) * (WEEKS_IN_YEAR / MONTHS_IN_YEAR),
                  );
                  const angle = weekInMonth * anglePerWeek - Math.PI / 2;

                  // Draw divider line
                  const lineInner = innerRadius - 10;
                  const lineOuter = outerRadius + 15;
                  const x1 = center + lineInner * Math.cos(angle);
                  const y1 = center + lineInner * Math.sin(angle);
                  const x2 = center + lineOuter * Math.cos(angle);
                  const y2 = center + lineOuter * Math.sin(angle);

                  // Label position
                  const labelRadius = outerRadius + 50;
                  const midWeek =
                    weekInMonth + WEEKS_IN_YEAR / MONTHS_IN_YEAR / 2;
                  const labelAngle = midWeek * anglePerWeek - Math.PI / 2;
                  const labelX = center + labelRadius * Math.cos(labelAngle);
                  const labelY = center + labelRadius * Math.sin(labelAngle);

                  return (
                    <g key={`month-${month}`}>
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#2196F3"
                        strokeWidth="2"
                        opacity="0.7"
                      />
                      <text
                        x={labelX}
                        y={labelY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="14"
                        fontWeight="600"
                        fill="#2196F3"
                      >
                        {monthNames[month - 1]}
                      </text>
                    </g>
                  );
                },
              )}

            {/* Quarter dividers and labels */}
            {showQuarters &&
              Array.from({ length: QUARTERS_IN_YEAR }, (_, i) => i + 1).map(
                (quarter) => {
                  // Calculate which week each quarter starts at
                  const weekInQuarter = Math.floor(
                    (quarter - 1) * (WEEKS_IN_YEAR / QUARTERS_IN_YEAR),
                  );
                  const angle = weekInQuarter * anglePerWeek - Math.PI / 2;

                  // Draw divider line
                  const lineInner = innerRadius - 15;
                  const lineOuter = outerRadius + 15;
                  const x1 = center + lineInner * Math.cos(angle);
                  const y1 = center + lineInner * Math.sin(angle);
                  const x2 = center + lineOuter * Math.cos(angle);
                  const y2 = center + lineOuter * Math.sin(angle);

                  // Label position
                  const labelRadius = innerRadius - 35;
                  const midWeek =
                    weekInQuarter + WEEKS_IN_YEAR / QUARTERS_IN_YEAR / 2;
                  const labelAngle = midWeek * anglePerWeek - Math.PI / 2;
                  const labelX = center + labelRadius * Math.cos(labelAngle);
                  const labelY = center + labelRadius * Math.sin(labelAngle);

                  return (
                    <g key={`quarter-${quarter}`}>
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#FF9800"
                        strokeWidth="3"
                        opacity="0.7"
                      />
                      <text
                        x={labelX}
                        y={labelY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="20"
                        fontWeight="700"
                        fill="#FF9800"
                      >
                        Q{quarter}
                      </text>
                    </g>
                  );
                },
              )}

            {/* Center text + year nav */}
            <g>
              <text
                x={center}
                y={center}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="48"
                fontWeight="bold"
                fill={centerText}
              >
                {year}
              </text>
              <text
                x={center - 90}
                y={center - 4}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="60"
                fill={arrowColor}
                style={{ cursor: "pointer" }}
                onClick={() => setYear((y) => y - 1)}
              >
                ‹
              </text>
              <text
                x={center + 90}
                y={center - 4}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="60"
                fill={arrowColor}
                style={{ cursor: "pointer" }}
                onClick={() => setYear((y) => y + 1)}
              >
                ›
              </text>
            </g>
          </svg>

          {campaigns.length === 0 ? (
            <Text>Ei kampanjoita vuodelle {year}</Text>
          ) : (
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
                {campaigns.map((campaign) => {
                  const color = getCampaignColor(campaign.id);
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
                        backgroundColor: isHovered
                          ? legendHover
                          : "transparent",
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
          )}
        </>
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
