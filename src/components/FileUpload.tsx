"use client";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

type UploadResult = { url: string; publicId: string };

export default function FileUpload({
  label,
  accept,
  resourceType,
  folder,
  onUploaded,
}: {
  label: string;
  accept: string;
  resourceType: "video" | "image" | "raw";
  folder: string;
  onUploaded: (result: UploadResult) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleFile(file: File) {
    setFileName(file.name);
    setProgress(0);
    try {
      const sigRes = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      });
      if (!sigRes.ok) throw new Error("Could not get upload authorization");
      const { signature, timestamp, apiKey, cloudName, folder: f } = await sigRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", f);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

      const result: UploadResult = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", uploadUrl);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            resolve({ url: data.secure_url, publicId: data.public_id });
          } else {
            reject(new Error("Upload to Cloudinary failed"));
          }
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(formData);
      });

      onUploaded(result);
      toast.success(`${label} uploaded`);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setProgress(null);
    }
  }

  return (
    <div>
      <label className="label-field">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="btn-secondary w-full text-sm"
        disabled={progress !== null}
      >
        {progress !== null ? `Uploading… ${progress}%` : fileName ? `Replace (${fileName})` : `Upload ${label}`}
      </button>
    </div>
  );
}
