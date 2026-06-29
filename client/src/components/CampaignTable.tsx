import { Group, ScrollArea, Table } from "@mantine/core";
import {
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
  IconCircleMinus,
  IconCopy,
  IconTrash,
} from "@tabler/icons-react";
import {
  type BudgetPeriod,
  type CampaignType as CampaignTypeLabel,
  budgetPeriodLabels,
  typeLabels,
} from "../utils/campaignLabels";
import { formatAgeRange } from "../utils/common";
import classes from "./campaignList.module.css";
import type { Campaign as CampaignType } from "./Campaign";

export type SortKey = keyof CampaignType | null;
export type SortDirection = "asc" | "desc";
export type ColumnKey = keyof CampaignType | "actions";

export type ColumnConfig = {
  key: ColumnKey;
  label: string;
  visible: boolean;
};

type CampaignTableProps = {
  campaigns: CampaignType[];
  columns: ColumnConfig[];
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSort: (key: SortKey) => void;
  onSelectCampaign: (campaign: CampaignType) => void;
  onCopy: (e: React.MouseEvent, campaign: CampaignType) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onStatusToggle: (e: React.MouseEvent, campaign: CampaignType) => void;
};

const formatDateCell = (value: unknown): string => {
  const date =
    value instanceof Date
      ? value
      : typeof value === "string"
        ? new Date(value)
        : null;

  if (date && !Number.isNaN(date.getTime())) {
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    return `${hour}:${minute} ${day}.${month}.${year}`;
  }

  return String(value ?? "");
};

const formatCampaignCell = (campaign: CampaignType, colKey: ColumnKey) => {
  let content = campaign[colKey as keyof CampaignType] as unknown;

  if (
    colKey === "start" ||
    colKey === "end" ||
    colKey === "createdAt" ||
    colKey === "updatedAt"
  ) {
    content = formatDateCell(content);
  } else if (colKey === "budget") {
    content = `${content}€`;
  } else if (colKey === "budgetPeriod") {
    content =
      budgetPeriodLabels[content as BudgetPeriod] ?? (content as string);
  } else if (colKey === "targetAge") {
    if (typeof content === "string") {
      content = formatAgeRange(content) || content;
    }
  } else if (colKey === "type") {
    content = typeLabels[content as CampaignTypeLabel] ?? (content as string);
  }

  return typeof content === "string" || typeof content === "number"
    ? content
    : String(content ?? "");
};

const SortableHeader = ({
  label,
  sortBy,
  sortKey,
  sortDirection,
  onSort,
}: {
  label: string;
  sortBy: SortKey;
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSort: (key: SortKey) => void;
}) => (
  <Table.Th
    onClick={() => onSort(sortBy)}
    style={{ cursor: "pointer", userSelect: "none" }}
  >
    <Group gap="xs" justify="flex-start">
      <span>{label}</span>
      {sortKey === sortBy &&
        (sortDirection === "asc" ? <IconChevronUp /> : <IconChevronDown />)}
    </Group>
  </Table.Th>
);

export const CampaignTable = ({
  campaigns,
  columns,
  sortKey,
  sortDirection,
  onSort,
  onSelectCampaign,
  onCopy,
  onDelete,
  onStatusToggle,
}: CampaignTableProps) => {
  const rows = campaigns.map((campaign) => (
    <Table.Tr
      key={campaign.id}
      onClick={() => onSelectCampaign(campaign)}
      style={{ cursor: "pointer" }}
    >
      {columns
        .filter((column) => column.visible)
        .map((column) => {
          if (column.key === "actions") {
            return (
              <Table.Td key={column.key}>
                <Group gap="xs" style={{ whiteSpace: "nowrap" }}>
                  <IconCopy
                    style={{ cursor: "pointer" }}
                    className={classes.copyIcon}
                    onClick={(e) => onCopy(e, campaign)}
                  />
                  <IconTrash
                    className={classes.trashIcon}
                    onClick={(e) => onDelete(e, campaign.id)}
                  />
                </Group>
              </Table.Td>
            );
          }

          if (column.key === "status") {
            return (
              <Table.Td key={column.key}>
                <div
                  onClick={(e) => onStatusToggle(e, campaign)}
                  style={{ display: "inline-block" }}
                >
                  {campaign.status ? (
                    <IconCircleCheck color="green" />
                  ) : (
                    <IconCircleMinus color="red" />
                  )}
                </div>
              </Table.Td>
            );
          }

          const content = formatCampaignCell(campaign, column.key);
          return <Table.Td key={column.key}>{content}</Table.Td>;
        })}
    </Table.Tr>
  ));

  return (
    <ScrollArea type="auto">
      <Table miw={1200} striped withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            {columns
              .filter((column) => column.visible)
              .map((column) =>
                column.key === "actions" ? (
                  <Table.Th key={column.key}>{column.label}</Table.Th>
                ) : (
                  <SortableHeader
                    key={column.key}
                    label={column.label}
                    sortBy={column.key as SortKey}
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    onSort={onSort}
                  />
                ),
              )}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </ScrollArea>
  );
};
