import { useState } from "react";
import { Drawer, Input, Select, Table, Tag, type TableProps } from "antd";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatCurrency, formatDate } from "@/lib/utils";
import { refName } from "@/lib/ref";
import {
  useGetJobQuery,
  useGetJobQuotationsQuery,
  useGetJobsQuery,
  type JobRecord,
} from "@/redux/features/operations/operationsApi";

const JOB_STATUSES = ["OPEN", "BOOKED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

function statusColor(status?: string) {
  if (status === "OPEN") return "processing";
  if (status === "COMPLETED") return "success";
  if (status === "CANCELLED") return "default";
  if (status === "BOOKED" || status === "IN_PROGRESS") return "warning";
  return "default";
}

export default function JobsPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState<string>();
  const [openId, setOpenId] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useGetJobsQuery({
    page,
    limit: 12,
    searchTerm: searchTerm || undefined,
    status,
  });

  const jobs = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  const columns: TableProps<JobRecord>["columns"] = [
    {
      title: "Job",
      dataIndex: "title",
      render: (title: string, row) => (
        <div>
          <p className="font-medium text-stone-900">{title}</p>
          <p className="text-xs text-stone-500">
            {refName(row.service) !== "—"
              ? refName(row.service)
              : row.customServiceName || refName(row.category)}
          </p>
        </div>
      ),
    },
    {
      title: "Customer",
      dataIndex: "customer",
      render: (customer) => refName(customer),
    },
    {
      title: "Where",
      dataIndex: "location",
      render: (location: string | undefined, row) =>
        [location, row.postCode].filter(Boolean).join(" · ") || "—",
    },
    {
      title: "Budget",
      dataIndex: "budget",
      align: "right",
      render: (budget?: number) => formatCurrency(budget),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (value: string) => <Tag color={statusColor(value)}>{value.replaceAll("_", " ")}</Tag>,
    },
    {
      title: "Posted",
      dataIndex: "createdAt",
      render: (value?: string) => formatDate(value),
    },
  ];

  return (
    <div>
      <PageHeader description="Every request on the marketplace, including ones still waiting for a quote." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="w-full max-w-xs">
        <Input.Search
          allowClear
          placeholder="Search by title"
          onSearch={(value) => {
            setSearchTerm(value.trim());
            setPage(1);
          }}
        />
        </div>
        <Select
          allowClear
          placeholder="Status"
          className="w-44"
          value={status}
          options={JOB_STATUSES.map((value) => ({ value, label: value.replaceAll("_", " ") }))}
          onChange={(value) => {
            setStatus(value);
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
          dataSource={jobs}
          pagination={{
            current: page,
            pageSize: 12,
            total,
            showSizeChanger: false,
            onChange: setPage,
          }}
          onRow={(row) => ({
            onClick: () => setOpenId(row._id),
            className: "cursor-pointer",
          })}
        />
      </div>

      <JobDrawer jobId={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}

function JobDrawer({ jobId, onClose }: { jobId: string | null; onClose: () => void }) {
  const { data: jobRes, isFetching } = useGetJobQuery(jobId ?? "", { skip: !jobId });
  const { data: quotesRes, isFetching: quotesLoading } = useGetJobQuotationsQuery(jobId ?? "", {
    skip: !jobId,
  });
  const job = jobRes?.data;
  const quotes = quotesRes?.data ?? [];

  return (
    <Drawer
      open={Boolean(jobId)}
      onClose={onClose}
      size={440}
      title={job?.title || "Job"}
      destroyOnHidden
    >
      {isFetching && !job ? (
        <p className="text-sm text-stone-500">Loading job…</p>
      ) : job ? (
        <div className="space-y-5 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status" value={job.status.replaceAll("_", " ")} />
            <Field label="Budget" value={formatCurrency(job.budget)} />
            <Field label="Customer" value={refName(job.customer)} />
            <Field label="Category" value={refName(job.category)} />
            <Field
              label="Service"
              value={job.customServiceName || refName(job.service)}
            />
            <Field label="Location" value={[job.location, job.postCode].filter(Boolean).join(", ") || "—"} />
          </div>
          {job.description ? (
            <p className="leading-relaxed text-stone-700">{job.description}</p>
          ) : null}

          <div>
            <p className="mb-2 font-medium text-stone-900">Quotations</p>
            {quotesLoading ? (
              <p className="text-stone-500">Loading quotations…</p>
            ) : quotes.length === 0 ? (
              <p className="text-stone-500">No artisan has quoted this job yet.</p>
            ) : (
              <ul className="space-y-2">
                {quotes.map((quote) => (
                  <li key={quote._id} className="rounded-lg border border-[#e7e2da] px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-stone-900">{refName(quote.artisan)}</span>
                      <span className="tabular-nums">{formatCurrency(quote.proposedAmount)}</span>
                    </div>
                    <p className="mt-1 text-xs text-stone-500">
                      {[quote.rateType, quote.status, quote.estimatedDuration].filter(Boolean).join(" · ")}
                    </p>
                    {quote.message ? <p className="mt-1 text-stone-600">{quote.message}</p> : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </Drawer>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-stone-500">{label}</p>
      <p className="text-stone-900">{value}</p>
    </div>
  );
}
