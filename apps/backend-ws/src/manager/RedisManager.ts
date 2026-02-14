import Redis from "ioredis";

class RedisManager {
    private static instance: RedisManager;
    public client: Redis;
    public pub: Redis;
    public sub: Redis;

    private constructor() { 
        this.client = new Redis({
            host: process.env.REDIS_HOST || "localhost",
            port: parseInt(process.env.REDIS_PORT || "6379"),
        });

        this.pub = new Redis({
            host: process.env.REDIS_HOST || "localhost",
            port: parseInt(process.env.REDIS_PORT || "6379"),
        });
        
        this.sub = new Redis({
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

    public async publish(channel: string, message: string) {
        await this.pub.publish(channel, message);
    }

    public async subscribe(channel: string, callback: (message: string) => void) {
        await this.sub.subscribe(channel);

        this.sub.on("message", (_chan, message) => {
            if (_chan === channel) callback(message);
        });
    }

}

export { RedisManager };