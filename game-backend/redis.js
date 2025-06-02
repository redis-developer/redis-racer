import { createClient } from "redis";

if (!process.env.REDIS_URL) {
  console.error("REDIS_URL not set");
}

let client = null;

/**
 * @param {import("redis").RedisClientOptions} [options]
 *
 * @returns {Promise<ReturnType<typeof createClient>>}
 */
export default async function getClient(options) {
  options = Object.assign(
    {},
    {
      url: process.env.REDIS_URL,
    },
    options,
  );

  if (client && client.options?.url === options.url) {
    return client;
  }

  client = createClient(options);

  client
    .on("error", (err) => {
      console.error("Redis Client Error", err);
      void refreshClient();
    })
    .connect();

  return client;
}

async function refreshClient() {
  if (client) {
    await client.disconnect();
    client = null;
  }

  client = await getClient();
}
