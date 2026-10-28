import { useState } from "react";
import { Modal, Button, Input, Image, Tag, Divider, Alert } from "antd";
import {
  SafetyCertificateOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  IdcardOutlined,
  CameraOutlined,
} from "@ant-design/icons";
import { useVerifyArtisanIdentityMutation } from "@/redux/features/artisans/artisansApi";
import type { ApiUser } from "@/redux/features/users/users.types";
import { getImageUrl } from "@/lib/getImageUrl";
import { StatusTag } from "@/components/ui/StatusTag";
import { toast } from "sonner";

interface IdentityVerificationModalProps {
  open: boolean;
  artisan: ApiUser | null;
  onClose: () => void;
}

export function IdentityVerificationModal({
  open,
  artisan,
  onClose,
}: IdentityVerificationModalProps) {
  const [verifyArtisan, { isLoading }] = useVerifyArtisanIdentityMutation();
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  if (!artisan) return null;

  const frontUrl = getImageUrl(artisan.idCardFront);
  const backUrl = getImageUrl(artisan.idCardBack);
  const selfieUrl = getImageUrl(artisan.selfie);

  const handleDecision = async (decision: "approve" | "reject") => {
    if (decision === "reject" && !rejectionReason.trim()) {
      toast.error("Please provide a reason explaining why the identity submission was rejected or needs an update");
      return;
    }

    try {
      await verifyArtisan({
        id: artisan._id,
        decision,
        reason: rejectionReason.trim(),
      }).unwrap();

      toast.success(
        decision === "approve"
          ? "Artisan identity verified and approved!"
          : "Artisan notified to resubmit updated documents"
      );
      setShowRejectInput(false);
      setRejectionReason("");
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to process identity decision");
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div className="flex items-center gap-2">
          <SafetyCertificateOutlined className="text-[#FE375D] text-lg" />
          <span className="font-bold text-slate-900">
            Artisan Identity Document Review
          </span>
        </div>
      }
      width={840}
      footer={null}
      destroyOnClose
    >
      <div className="space-y-6 mt-4">
        {/* Artisan Header Summary */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-800 text-base">{artisan.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {artisan.trade || "Tradesperson"} · {artisan.email} · {artisan.phoneNumber || "No phone"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Current Status:</span>
            <StatusTag status={artisan.identityStatus} type="identity" />
          </div>
        </div>

        {/* Existing Note */}
        {artisan.identityRejectionReason && (
          <Alert
            type="warning"
            showIcon
            message="Previous Rejection Note / Request"
            description={artisan.identityRejectionReason}
          />
        )}

        {/* 3 Document Cards: Front ID, Back ID, Live Selfie */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Front Card */}
          <div className="border border-slate-200 rounded-2xl p-3 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <IdcardOutlined className="text-[#FE375D]" /> National ID Front
                </span>
                <Tag color={artisan.idCardFront ? "green" : "default"}>
                  {artisan.idCardFront ? "Uploaded" : "Missing"}
                </Tag>
              </div>

              <div className="h-44 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-100">
                {frontUrl ? (
                  <Image
                    src={frontUrl}
                    alt="ID Card Front"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-slate-400">Not uploaded</span>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              Click photo to zoom
            </p>
          </div>

          {/* Back Card */}
          <div className="border border-slate-200 rounded-2xl p-3 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <IdcardOutlined className="text-[#FE375D]" /> National ID Back
                </span>
                <Tag color={artisan.idCardBack ? "green" : "default"}>
                  {artisan.idCardBack ? "Uploaded" : "Missing"}
                </Tag>
              </div>

              <div className="h-44 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-100">
                {backUrl ? (
                  <Image
                    src={backUrl}
                    alt="ID Card Back"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-slate-400">Not uploaded</span>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              Click photo to zoom
            </p>
          </div>

          {/* Live Selfie */}
          <div className="border border-slate-200 rounded-2xl p-3 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CameraOutlined className="text-[#FE375D]" /> Live Camera Selfie
                </span>
                <Tag color={artisan.selfie ? "green" : "default"}>
                  {artisan.selfie ? "Uploaded" : "Missing"}
                </Tag>
              </div>

              <div className="h-44 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-100">
                {selfieUrl ? (
                  <Image
                    src={selfieUrl}
                    alt="Live Selfie"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-slate-400">Not uploaded</span>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              Click photo to zoom
            </p>
          </div>
        </div>

        {/* Rejection / Resubmission Input */}
        {showRejectInput && (
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3">
            <h4 className="text-xs font-bold text-rose-900">
              Reason for Requesting Resubmission / Rejection
            </h4>
            <Input.TextArea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. ID card edges are cut off, glare on the name field, or selfie does not match the ID photo..."
              className="rounded-xl"
            />
            <div className="flex justify-end gap-2">
              <Button size="small" onClick={() => setShowRejectInput(false)}>
                Cancel
              </Button>
              <Button
                size="small"
                danger
                type="primary"
                loading={isLoading}
                onClick={() => handleDecision("reject")}
              >
                Confirm Rejection & Send Note
              </Button>
            </div>
          </div>
        )}

        <Divider className="my-2" />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button onClick={onClose} className="rounded-xl w-full sm:w-auto">
            Close Viewer
          </Button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {!showRejectInput && (
              <Button
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => setShowRejectInput(true)}
                className="rounded-xl font-semibold"
              >
                Request Update / Reject
              </Button>
            )}

            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              loading={isLoading}
              onClick={() => handleDecision("approve")}
              className="bg-emerald-600 hover:bg-emerald-700 border-none rounded-xl font-semibold px-5 shadow-sm shadow-emerald-600/30"
            >
              Approve Identity Verification
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
