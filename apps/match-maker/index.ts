import Redis from "ioredis";
import { v4 as uuidv4 } from "uuid";

const redis = new Redis({ host: process.env.REDIS_HOST || "localhost", port: +process.env.REDIS_PORT! || 6379 });

async function loop() {
  while (true) {
    const res1 = await redis.brpop("waiting_users", 0);
    const res2 = await redis.brpop("waiting_users", 0);
    if (!res1 || !res2) continue;

    const user1 = res1[1];
    const user2 = res2[1];

    if (!user1 || !user2 || user1 === user2) {
      if (user1) await redis.lpush("waiting_users", user1);
      if (user2) await redis.lpush("waiting_users", user2);
      continue;
    }

    const roomId = uuidv4();
    await redis.publish("match_maker", JSON.stringify({ roomId, users: [user1, user2] }));
    console.log("match created", roomId, user1, user2);
  }
}

loop().catch(console.error);
