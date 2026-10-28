import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Avatar,
  Tag,
  Descriptions,
  Table,
  Spin,
  Image,
  Alert,
} from "antd";
import {
  ArrowLeftOutlined,
  SafetyCertificateOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ToolOutlined,
  IdcardOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusTag } from "@/components/ui/StatusTag";
import { IdentityVerificationModal } from "./components/IdentityVerificationModal";
import { useGetUserByIdQuery } from "@/redux/features/users/usersApi";
import { useGetArtisanServicesQuery } from "@/redux/features/artisans/artisansApi";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { getImageUrl } from "@/lib/getImageUrl";

export default function ArtisanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const { data: userRes, isLoading: isUserLoading, refetch: refetchUser } = useGetUserByIdQuery(
    id || "",
    { skip: !id }
  );

  // Query live ArtisanService collection
  const { data: artisanServicesRes, isLoading: isServicesLoading } = useGetArtisanServicesQuery(
    id || "",
    { skip: !id }
  );

  const artisan = userRes?.data;
  const artisanServices = artisanServicesRes?.data || [];

  if (isUserLoading) {
    return (
      <div className="py-20 text-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!artisan) {
    return (
      <GlassCard className="p-8 text-center">
        <h3 className="text-lg font-bold text-slate-800">Artisan Not Found</h3>
        <p className="text-slate-500 text-sm mt-1">
          The requested artisan profile could not be found.
        </p>
        <Button
          type="primary"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/artisans")}
          className="mt-4 bg-[#FE375D] border-none"
        >
          Back to Artisans
        </Button>
      </GlassCard>
    );
  }

  const frontUrl = getImageUrl(artisan.idCardFront);
  const backUrl = getImageUrl(artisan.idCardBack);
  const selfieUrl = getImageUrl(artisan.selfie);

  return (
    <div className="space-y-6">
      {/* Back button & Action */}
      <div className="flex items-center justify-between">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="rounded-xl"
        >
          Back
        </Button>

        <Button
          type="primary"
          icon={<SafetyCertificateOutlined />}
          onClick={() => setVerifyModalOpen(true)}
          className="bg-[#FE375D] hover:bg-[#e0284e] border-none font-semibold rounded-xl"
        >
          Inspect & Review ID Documents
        </Button>
      </div>

      {/* Header Profile Card */}
      <GlassCard className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Avatar
              size={88}
              src={artisan.image || artisan.profileImage}
              className="bg-gradient-to-tr from-[#FE375D] to-[#e0284e] text-white text-3xl font-bold shadow-md"
            >
              {getInitials(artisan.name)}
            </Avatar>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {artisan.name}
                </h1>
                <StatusTag status={artisan.identityStatus} type="identity" />
                <StatusTag status={artisan.availabilityStatus} type="availability" />
              </div>

              <p className="text-sm font-semibold text-slate-700 mt-1">
                {artisan.businessName || artisan.trade || "Artisan Professional"}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <MailOutlined /> {artisan.email}
                </span>
                {artisan.phoneNumber && (
                  <span className="flex items-center gap-1.5">
                    <PhoneOutlined /> {artisan.phoneNumber}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <EnvironmentOutlined /> {artisan.location || "Ghana"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:items-end text-xs text-slate-500 pt-4 md:pt-0 border-t md:border-t-0 w-full md:w-auto">
            <span>Joined on {formatDate(artisan.createdAt)}</span>
            <span className="mt-1 font-semibold text-slate-700">
              {artisan.experienceYears ? `${artisan.experienceYears} Years Experience` : "Experience unlisted"}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Identity Verification Documents Showcase */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <SafetyCertificateOutlined className="text-[#FE375D]" /> National ID & Selfie Verification
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Admin inspected identity credentials submitted by the artisan
            </p>
          </div>

          <Button
            size="small"
            type="primary"
            onClick={() => setVerifyModalOpen(true)}
            className="bg-[#FE375D] hover:bg-[#e0284e] border-none rounded-lg text-xs font-semibold"
          >
            Review Decisions
          </Button>
        </div>

        {artisan.identityRejectionReason && (
          <Alert
            type="warning"
            showIcon
            message="Reason for Rejection / Needs Update"
            description={artisan.identityRejectionReason}
            className="mb-4"
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <IdcardOutlined className="text-[#FE375D]" /> National ID (Front)
            </span>
            <div className="h-48 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
              {frontUrl ? (
                <Image src={frontUrl} alt="Front ID" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-slate-400">Not uploaded</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <IdcardOutlined className="text-[#FE375D]" /> National ID (Back)
            </span>
            <div className="h-48 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
              {backUrl ? (
                <Image src={backUrl} alt="Back ID" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-slate-400">Not uploaded</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <CameraOutlined className="text-[#FE375D]" /> Live Camera Selfie
            </span>
            <div className="h-48 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
              {selfieUrl ? (
                <Image src={selfieUrl} alt="Live Selfie" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-slate-400">Not uploaded</span>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Services and Rates Offered (From ArtisanService collection) */}
      <GlassCard className="p-6">
        <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
          <ToolOutlined className="text-[#FE375D]" /> Configured Services & Rates ({artisanServices.length})
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Individual selections made by the artisan from the admin service catalog
        </p>

        {isServicesLoading ? (
          <div className="py-8 text-center"><Spin /></div>
        ) : artisanServices.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Artisan has not configured any individual services yet.
          </div>
        ) : (
          <Table
            dataSource={artisanServices}
            rowKey="_id"
            pagination={false}
            columns={[
              {
                title: "Category",
                key: "category",
                render: (_, r) => {
                  const cat = (r.service as any)?.category;
                  const catName = typeof cat === "object" ? cat?.name : "General Trade";
                  return <Tag color="blue">{catName}</Tag>;
                },
              },
              {
                title: "Service Name",
                key: "serviceName",
                render: (_, r) => (
                  <span className="font-semibold text-slate-800 text-xs">
                    {(r.service as any)?.name || "Service"}
                  </span>
                ),
              },
              {
                title: "Rate Type",
                dataIndex: "rateType",
                key: "rateType",
                render: (type: string) => (
                  <Tag color={type === "HOURLY" ? "orange" : "geekblue"} className="font-semibold text-xs uppercase">
                    {type === "HOURLY" ? "Hourly Rate" : "Daily Rate"}
                  </Tag>
                ),
              },
              {
                title: "Rate Amount",
                dataIndex: "rateAmount",
                key: "rateAmount",
                render: (rate: number, r) => (
                  <span className="font-bold text-slate-900 text-xs">
                    {formatCurrency(rate)} / {r.rateType === "HOURLY" ? "hr" : "day"}
                  </span>
                ),
              },
              {
                title: "Status",
                dataIndex: "isActive",
                key: "isActive",
                render: (isActive: boolean) => (
                  <Tag color={isActive ? "success" : "default"}>
                    {isActive ? "Active" : "Paused"}
                  </Tag>
                ),
              },
            ]}
          />
        )}
      </GlassCard>

      {/* Professional Bio */}
      <GlassCard className="p-6">
        <h3 className="text-base font-bold text-slate-900 mb-3">
          Professional Biography
        </h3>
        <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
          {artisan.bio || "No biography provided by artisan."}
        </p>
      </GlassCard>

      <IdentityVerificationModal
        open={verifyModalOpen}
        artisan={artisan}
        onClose={() => {
          setVerifyModalOpen(false);
          refetchUser();
        }}
      />
    </div>
  );
}
