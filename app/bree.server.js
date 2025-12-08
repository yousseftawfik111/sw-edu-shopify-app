import Bree from "bree";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bree = new Bree({
  root: path.join(__dirname, "..", "jobs"),
  defaultExtension: "js",
  jobs: [
    {
      name: "insert-car",
      interval: "1m",
    },
  ],
  closeWorkerAfterMs: 30_000,
  errorHandler: (error, workerMetadata) => {
    console.error(`Job ${workerMetadata.name} error:`, error);
  },
});

export default bree;
