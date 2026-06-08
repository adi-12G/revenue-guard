import FileUploader from "@/components/FileUploader";

export default function UploadPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Upload Invoices
      </h1>

      <FileUploader />
    </div>
  );
}
