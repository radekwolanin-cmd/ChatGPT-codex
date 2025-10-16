import "dotenv/config";

const route = process.argv[2];

if (!route) {
  console.error("Usage: pnpm cron:[daily|hourly]");
  process.exit(1);
}

const endpoint = route === "daily" ? "/api/cron/daily" : "/api/cron/hourly";
const url = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}${endpoint}`;

fetch(url, { method: "POST" })
  .then(async (res) => {
    const json = await res.json();
    console.log(`Cron ${route} response`, json);
  })
  .catch((err) => {
    console.error("Cron invocation failed", err);
    process.exit(1);
  });
