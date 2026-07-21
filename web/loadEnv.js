// Loads the repo-root .env into process.env. This is a SIDE-EFFECT module:
// importing it runs dotenv.config() immediately. It must be imported before any
// module that reads process.env at import time (shopify.js, DB.config.js,
// Email.config.js). Because ES module imports are evaluated in source order,
// importing this file first guarantees the env is populated before those run.
//
// The .env lives one level up from web/ (the repo root). We resolve the path
// from this module's own location so it loads regardless of the process's
// working directory (the dev server starts from web/).
//
// In production (Coolify) there is no .env file; dotenv is then a harmless no-op
// and never overwrites env vars already injected by the platform.
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

dotenv.config({
  path: join(dirname(fileURLToPath(import.meta.url)), "..", ".env"),
});
