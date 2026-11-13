import { useState } from "react";
import { Button, Input, Popconfirm, Select, Table, Tag, type TableProps } from "antd";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatCurrency, formatDate } from "@/lib/utils";
import { apiErrorMessage, refName } from "@/lib/ref";
import {
  useApprovePayoutMutation,
  useGetBookingsQuery,
  useReleasePayoutMutation,
  type BookingRecord,
} from "@/redux/features/operations/operationsApi";

const STATUSES = [
  "AWAITING_PAYMENT",
  "CONFIRMED",
  "IN_PROGRESS",
  "DELIVERED",
  "REVISION_REQUESTED",
  "COMPLETED",
  "CANCELLED",
  "DISPUTED",
];

const PAYMENTS = ["UNPAID", "ESCROW_HELD", "PAID", "REFUNDED"];
const PAYOUTS = ["PENDING", "APPROVED", "RELEASED", "REJECTED"];

function tone(value?: string) {
  if (!value) return "default";
  if (["COMPLETED", "PAID", "RELEASED", "ESCROW_HELD"].includes(value)) return "success";
  if (["CANCELLED", "REFUNDED", "REJECTED", "DISPUTED"].includes(value)) return "error";
  if (["AWAITING_PAYMENT", "PENDING", "UNPAID", "REVISION_REQUESTED"].includes(value)) return "warning";
  return "processing";
}

export default function BookingsPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<string>();
  const [paymentStatus, setPaymentStatus] = useState<string>();
  const [payoutStatus, setPayoutStatus] = useState<string>();

  const { data, isLoading, isFetching } = useGetBookingsQuery({
    page,
    limit: 12,
    searchTerm: searchTerm || undefined,
    status,
    paymentStatus,
    payoutStatus,
  });
  const [approvePayout, { isLoading: approving }] = useApprovePayoutMutation();
  const [releasePayout, { isLoading: releasing }] = useReleasePayoutMutation();

  const bookings = data?.data ?? [];

  const run = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      toast.success(success);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const columns: TableProps<BookingRecord>["columns"] = [
    {
      title: "Booking",
      dataIndex: "bookingNumber",
      render: (number: string | undefined, row) => {
        const canApprove = row.status === "COMPLETED" && row.payoutStatus === "PENDING";
        const canRelease = row.payoutStatus === "APPROVED";
        return (
          <div>
            <p className="font-medium text-stone-900">{number || row._id.slice(-6)}</p>
            <p className="text-xs text-stone-500">{refName(row.job)}</p>
            {canApprove || canRelease ? (
              <div className="mt-2" onClick={(event) => event.stopPropagation()}>
                {canApprove ? (
                  <Popconfirm
                    title="Approve this payout?"
                    description="The artisan can be paid after this. Funds stay recorded until you release them."
                    okText="Approve"
                    onConfirm={() =>
                      run(() => approvePayout({ id: row._id }).unwrap(), "Payout approved")
                    }
                  >
                    <Button size="small" type="primary" loading={approving}>
                      Approve
                    </Button>
                  </Popconfirm>
                ) : null}
                {canRelease ? (
                  <Popconfirm
                    title="Release the payout?"
                    description="Sends the artisan their net after VAT, NHIL, and GETFund."
                    okText="Release"
                    onConfirm={() =>
                      run(
                        () => releasePayout({ id: row._id, payoutMethod: "MANUAL_BANK" }).unwrap(),
                        "Payout released",
                      )
                    }
                  >
                    <Button size="small" type="primary" loading={releasing}>
                      Release
                    </Button>
                  </Popconfirm>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      },
    },
    {
      title: "Customer",
      dataIndex: "customer",
      render: (customer) => refName(customer),
    },
    {
      title: "Artisan",
      dataIndex: "artisan",
      render: (artisan) => refName(artisan),
    },
    {
      title: "Work",
      dataIndex: "status",
      render: (value: string) => <Tag color={tone(value)}>{value.replaceAll("_", " ")}</Tag>,
    },
    {
      title: "Escrow",
      dataIndex: "paymentStatus",
      render: (value?: string) =>
        value ? <Tag color={tone(value)}>{value.replaceAll("_", " ")}</Tag> : "—",
    },
    {
      title: "Payout",
      dataIndex: "payoutStatus",
      render: (value?: string) =>
        value ? <Tag color={tone(value)}>{value.replaceAll("_", " ")}</Tag> : "—",
    },
    {
      title: "Collected",
      dataIndex: "totalAmount",
      align: "right",
      render: (amount?: number) => formatCurrency(amount),
    },
    {
      title: "Artisan net",
      dataIndex: "artisanPayoutAmount",
      align: "right",
      render: (amount?: number) => formatCurrency(amount),
    },
    {
      title: "Opened",
      dataIndex: "createdAt",
      render: (value?: string) => formatDate(value),
    },
  ];

  return (
    <div>
      <PageHeader description="Escrow, completion, and the two-step payout: approve, then release." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="w-full max-w-xs">
        <Input.Search
          allowClear
          placeholder="Booking number"
          onSearch={(value) => {
            setSearchTerm(value.trim());
            setPage(1);
          }}
        />
        </div>
        <Select
          allowClear
          placeholder="Work status"
          className="w-44"
          value={status}
          options={STATUSES.map((value) => ({ value, label: value.replaceAll("_", " ") }))}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />
        <Select
          allowClear
          placeholder="Escrow"
          className="w-40"
          value={paymentStatus}
          options={PAYMENTS.map((value) => ({ value, label: value.replaceAll("_", " ") }))}
          onChange={(value) => {
            setPaymentStatus(value);
            setPage(1);
          }}
        />
        <Select
          allowClear
          placeholder="Payout"
          className="w-40"
          value={payoutStatus}
          options={PAYOUTS.map((value) => ({ value, label: value.replaceAll("_", " ") }))}
          onChange={(value) => {
            setPayoutStatus(value);
            setPage(1);
          }}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-[#e7e2da] bg-white">
        <Table
          rowKey="_id"
          size="middle"
          loading={isLoading || isFetching}
          columns={columns}
          dataSource={bookings}
          scroll={{ x: 980 }}
          pagination={{
            current: page,
            pageSize: 12,
            total: data?.pagination?.total ?? 0,
            showSizeChanger: false,
            onChange: setPage,
          }}
        />
      </div>
    </div>
  );
}
