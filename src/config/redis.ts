import { Redis } from "ioredis";

const redis = new Redis({
    host: "localhost",
    port: 6379,
});

redis.on("connect", () => {
    console.log("✅ Connected to Redis")
})

redis.on("error", (err: any) => {
    console.error("❌ Redis connection error:", err)
})

export default redis