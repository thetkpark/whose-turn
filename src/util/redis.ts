import Redis, { RedisOptions } from 'ioredis'

const redisOption: RedisOptions = {
	host: 'localhost',
	port: 6379
}

const redis = new Redis(redisOption)

export default redis
