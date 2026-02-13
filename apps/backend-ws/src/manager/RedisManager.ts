import Redis from "ioredis";

class RedisManager {
    private static instance: RedisManager;
    public client: Redis;

    private constructor() { 
        this.client = new Redis({
            host: process.env.REDIS_HOST || "localhost",
            port: parseInt(process.env.REDIS_PORT || "6379"),
        });
    }

    public static getInstance(): RedisManager {
        if (!this.instance) {
            this.instance = new RedisManager();
        }
        return this.instance;
    }

    
}

export { RedisManager };