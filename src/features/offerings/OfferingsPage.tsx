import { useMemo, useState } from "react";
import { Button, Input, Modal, Segmented, Table, Tag, type TableProps } from "antd";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatCurrency, formatDate } from "@/lib/utils";
import { apiErrorMessage, refName } from "@/lib/ref";
import {
  useGetOfferingsQuery,
  useReviewOfferingMutation,
  type OfferingRecord,
} from "@/redux/features/operations/operationsApi";

type Queue = "pending" | "custom" | "all";

function offeringName(row: OfferingRecord) {
  if (typeof row.service === "object" && row.service?.name) return row.service.name;
  return row.customName || "Untitled service";
}

function offeringCategory(row: OfferingRecord) {
  if (typeof row.category === "object" && row.category?.name) return row.category.name;
  if (typeof row.service === "object" && typeof row.service.category === "object") {
    return row.service.category?.name || row.proposedCategory || "Uncategorized";
  }
  return row.proposedCategory || "Uncategorized";
}

export default function OfferingsPage() {
  const [queue, setQueue] = useState<Queue>("pending");
  const [rejecting, setRejecting] = useState<OfferingRecord | null>(null);
  const [reason, setReason] = useState("");

  const params =
    queue === "pending"
      ? { source: "CUSTOM", reviewStatus: "PENDING_REVIEW" }
      : queue === "custom"
        ? { source: "CUSTOM" }
        : undefined;

  const { data, isLoading, isFetching } = useGetOfferingsQuery(params);
  const [reviewOffering, { isLoading: reviewing }] = useReviewOfferingMutation();

  const rows = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data]);

  const decide = async (
    row: OfferingRecord,
    decision: "APPROVE" | "REJECT",
    note?: string,
  ) => {
    try {
      await reviewOffering({ id: row._id, decision, reason: note }).unwrap();
      toast.success(decision === "APPROVE" ? "Added to the catalog" : "Offering declined");
      setRejecting(null);
      setReason("");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const columns: TableProps<OfferingRecord>["columns"] = [
    {
      title: "Service",
      key: "name",
      render: (_, row) => (
        <div>
          <p className="font-medium text-stone-900">{offeringName(row)}</p>
          <p className="text-xs text-stone-500">{offeringCategory(row)}</p>
        </div>
      ),
    },
    {
      title: "Artisan",
      dataIndex: "artisan",
      render: (artisan) => refName(artisan),
    },
    {
      title: "Rate",
      key: "rate",
      render: (_, row) =>
        `${formatCurrency(row.rateAmount)} / ${(row.rateType || "").toLowerCase() || "job"}`,
    },
    {
      title: "Review",
      dataIndex: "reviewStatus",
      render: (value: string | undefined, row) => (
        <Tag
          color={
            value === "PENDING_REVIEW" ? "warning" : value === "REJECTED" ? "error" : "success"
          }
        >
          {(value || (row.source === "CATALOG" ? "CATALOG" : "LIVE")).replaceAll("_", " ")}
        </Tag>
      ),
    },
    {
      title: "Added",
      dataIndex: "createdAt",
      render: (value?: string) => formatDate(value),
    },
    {
      title: "",
      key: "actions",
      width: 180,
      render: (_, row) =>
        row.reviewStatus === "PENDING_REVIEW" ? (
          <div className="flex justify-end gap-2">
            <Button size="small" onClick={() => setRejecting(row)}>
              Decline
            </Button>
            <Button size="small" type="primary" loading={reviewing} onClick={() => decide(row, "APPROVE")}>
              Accept
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <div>
      <PageHeader
        description="Artisans can already offer a service that is not in the catalog. Accepting one creates the official category and service so the next person can pick it."
        actions={
          <Segmented
            value={queue}
            onChange={(value) => setQueue(value as Queue)}
            options={[
              { label: "Awaiting review", value: "pending" },
              { label: "All custom", value: "custom" },
              { label: "Everything", value: "all" },
            ]}
          />
        }
      />

      <div className="overflow-hidden rounded-xl border border-[#e7e2da] bg-white">
        <Table
          rowKey="_id"
          size="middle"
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={rows}
          pagination={{ pageSize: 12, showSizeChanger: false }}
        />
      </div>

      <Modal
        open={Boolean(rejecting)}
        title={rejecting ? `Decline ${offeringName(rejecting)}` : "Decline"}
        okText="Decline"
        okButtonProps={{ danger: true, loading: reviewing }}
        onCancel={() => {
          setRejecting(null);
          setReason("");
        }}
        onOk={() => {
          if (rejecting) void decide(rejecting, "REJECT", reason.trim() || undefined);
        }}
      >
        <p className="mb-3 text-sm text-stone-600">
          The offering stays off new catalog matches. The artisan can still see why it was declined.
        </p>
        <Input.TextArea
          rows={3}
          value={reason}
          maxLength={300}
          placeholder="Optional note for the artisan"
          onChange={(event) => setReason(event.target.value)}
        />
      </Modal>
    </div>
  );
}
