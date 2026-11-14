import { useState } from "react";
import { Button, Input, Popconfirm, Select, Table, Tag, type TableProps } from "antd";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatDate } from "@/lib/utils";
import { apiErrorMessage, refName } from "@/lib/ref";
import {
  useGetWithdrawalsQuery,
  useSettleWithdrawalMutation,
  type WithdrawalRecord,
} from "@/redux/features/operations/operationsApi";

const statusColor: Record<WithdrawalRecord["status"], string> = {
  REQUESTED: "gold",
  PROCESSING: "blue",
  PAID: "green",
  FAILED: "red",
};

function destinationLine(row: WithdrawalRecord) {
  const destination = row.destination;
  if (!destination) return row.method;
  if (row.method === "MOMO") {
    return `${destination.momoNetwork || "MoMo"} · ${destination.momoNumber || "—"} · ${destination.accountName || ""}`;
  }
  return `${destination.bankName || "Bank"} · ${destination.accountNumber || "—"} · ${destination.accountName || ""}`;
}

export default function PayoutsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("REQUESTED");
  const [reference, setReference] = useState("");
  const [reason, setReason] = useState("");
  const { data, isLoading, isFetching } = useGetWithdrawalsQuery({
    page,
    limit: 12,
    status: status || undefined,
  });
  const [settle, { isLoading: settling }] = useSettleWithdrawalMutation();

  const run = async (
    action: () => Promise<unknown>,
    success: string,
  ) => {
    try {
      await action();
      toast.success(success);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const columns: TableProps<WithdrawalRecord>["columns"] = [
    {
      title: "Artisan",
      dataIndex: "artisan",
      render: (artisan) => refName(artisan),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (amount: number) => `GH₵ ${Number(amount || 0).toFixed(2)}`,
    },
    {
      title: "Destination",
      key: "destination",
      render: (_, row) => <span className="text-stone-700">{destinationLine(row)}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (value: WithdrawalRecord["status"]) => (
        <Tag color={statusColor[value]}>{value}</Tag>
      ),
    },
    {
      title: "Requested",
      dataIndex: "createdAt",
      render: (value?: string) => formatDate(value),
    },
    {
      title: "",
      key: "actions",
      render: (_, row) =>
        row.status === "REQUESTED" && row.method !== "STRIPE" ? (
          <div className="flex gap-2" onClick={(event) => event.stopPropagation()}>
            <Popconfirm
              title="Mark this withdrawal paid?"
              description="Only after the bank or mobile money transfer has actually gone out."
              okText="Mark paid"
              onConfirm={() =>
                run(
                  () =>
                    settle({
                      id: row._id,
                      decision: "PAID",
                      reference: reference.trim() || undefined,
                    }).unwrap(),
                  "Withdrawal marked paid",
                )
              }
            >
              <Button size="small" type="primary" loading={settling}>
                Paid
              </Button>
            </Popconfirm>
            <Popconfirm
              title="Return this withdrawal?"
              description="The amount goes back to the artisan's available balance."
              okText="Return"
              onConfirm={() =>
                run(
                  () =>
                    settle({
                      id: row._id,
                      decision: "FAILED",
                      reason: reason.trim() || undefined,
                    }).unwrap(),
                  "Balance restored",
                )
              }
            >
              <Button size="small" loading={settling}>
                Return
              </Button>
            </Popconfirm>
          </div>
        ) : (
          <span className="text-xs text-stone-500">{row.reference || row.failureReason || "—"}</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader description="Artisans withdraw from their Nutsumo balance. Pay the saved bank or mobile money account, then mark it paid. Returning a request puts the money back." />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Select
          className="w-40"
          value={status}
          options={[
            { value: "", label: "All" },
            { value: "REQUESTED", label: "Waiting" },
            { value: "PAID", label: "Paid" },
            { value: "FAILED", label: "Returned" },
          ]}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />
        <Input
          className="max-w-xs"
          placeholder="Payment reference for the next Paid"
          value={reference}
          onChange={(event) => setReference(event.target.value)}
        />
        <Input
          className="max-w-xs"
          placeholder="Reason if you return it"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      </div>
      <Table
        rowKey="_id"
        loading={isLoading || isFetching}
        columns={columns}
        dataSource={data?.data || []}
        pagination={{
          current: page,
          pageSize: 12,
          total: data?.pagination?.total || 0,
          onChange: setPage,
          showSizeChanger: false,
        }}
      />
    </div>
  );
}
