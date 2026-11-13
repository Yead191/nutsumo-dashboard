import { useState } from "react";
import { Input, Rate, Select, Table, Tag, type TableProps } from "antd";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatDate } from "@/lib/utils";
import { refName } from "@/lib/ref";
import {
  useGetReviewsQuery,
  type ReviewRecord,
} from "@/redux/features/operations/operationsApi";

export default function ReviewsPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [rating, setRating] = useState<number>();
  const [status, setStatus] = useState<string>();

  const { data, isLoading, isFetching } = useGetReviewsQuery({
    page,
    limit: 12,
    searchTerm: searchTerm || undefined,
    rating,
    status,
  });

  const columns: TableProps<ReviewRecord>["columns"] = [
    {
      title: "Rating",
      dataIndex: "rating",
      width: 160,
      render: (value?: number) => <Rate disabled value={value || 0} />,
    },
    {
      title: "Review",
      dataIndex: "comment",
      render: (comment: string | undefined, row) => (
        <div>
          <p className="text-stone-800">{comment || "—"}</p>
          {row.reply?.comment ? (
            <p className="mt-1 text-xs text-stone-500">Artisan: {row.reply.comment}</p>
          ) : null}
        </div>
      ),
    },
    {
      title: "Customer",
      dataIndex: "customer",
      width: 160,
      render: (customer) => refName(customer),
    },
    {
      title: "Artisan",
      dataIndex: "artisan",
      width: 160,
      render: (artisan) => refName(artisan),
    },
    {
      title: "Job",
      dataIndex: "job",
      width: 180,
      render: (job) => refName(job),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 110,
      render: (value?: string) => <Tag>{value || "—"}</Tag>,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      width: 130,
      render: (value?: string) => formatDate(value),
    },
  ];

  return (
    <div>
      <PageHeader description="Public feedback left after a completed booking, including the artisan's reply." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="w-full max-w-xs">
        <Input.Search
          allowClear
          placeholder="Search comments"
          onSearch={(value) => {
            setSearchTerm(value.trim());
            setPage(1);
          }}
        />
        </div>
        <Select
          allowClear
          placeholder="Stars"
          className="w-32"
          value={rating}
          options={[5, 4, 3, 2, 1].map((value) => ({ value, label: `${value} star` }))}
          onChange={(value) => {
            setRating(value);
            setPage(1);
          }}
        />
        <Select
          allowClear
          placeholder="Status"
          className="w-36"
          value={status}
          options={["ACTIVE", "FLAGGED", "HIDDEN"].map((value) => ({ value, label: value }))}
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
          dataSource={data?.data ?? []}
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
