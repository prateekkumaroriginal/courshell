import { createUploadthing } from "uploadthing/express";

const f = createUploadthing();

export const uploadRouter = {
  coverImage: f({ image: { maxFileSize: "2MB" } })
    .middleware(async ({ req }) => {
      // Verify authentication here if needed
      return { userId: req.user?.id, x: "hello" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("✅ Upload complete:", { metadata, file });
      return { uploadedBy: metadata.userId };
    }),
};
