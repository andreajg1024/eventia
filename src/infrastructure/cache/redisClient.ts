import Redis from "ioredis";
import config from "../../config";
const client = new Redis({
  host: config.redis.host,
  port: config.redis.port
});

client.on("connect", () => console.log("Redis connected"));
client.on("error", (err) => console.error("Redis error", err));

export default client;
