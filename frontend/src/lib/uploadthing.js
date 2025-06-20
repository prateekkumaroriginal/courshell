import { VITE_APP_BACKEND_URL } from "@/constants";
import { generateUploadDropzone } from "@uploadthing/react";

export const UploadDropzone = generateUploadDropzone({
  url: `${VITE_APP_BACKEND_URL}/uploadthing`
});