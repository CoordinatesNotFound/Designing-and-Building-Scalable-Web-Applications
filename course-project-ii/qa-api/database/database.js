import { postgres } from "../deps.js";

let sql = postgres({});

// If running with Kubernetes (CloudNativePG with PGPASS)
const PGPASS = Deno.env.get("PGPASS");

if (PGPASS) {
  const PGPASS_PARTS = PGPASS.trim().split(":");
  const host = PGPASS_PARTS[0];
  const port = PGPASS_PARTS[1];
  const database = PGPASS_PARTS[2];
  const username = PGPASS_PARTS[3];
  const password = PGPASS_PARTS[4];

  // Connect using PGPASS configuration
  sql = postgres({
    host,
    port,
    database,
    username,
    password,
  });
}

export { sql };
