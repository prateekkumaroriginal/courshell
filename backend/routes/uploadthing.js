import { Router } from "express";
import { uploadRouter } from "../lib/uploadthing.js";
import { createRouteHandler } from "uploadthing/express";

const router = Router();

const uploadthingHandler = createRouteHandler({
  router: uploadRouter
});

router.use("/", uploadthingHandler);

export default router;