import type { EndpointConfig } from '@directus/extensions'
import Redis from 'ioredis'

export default {
    id: 'google-place',
    handler: (router, ctx) => {
        router.get('/', async (_req, res) => {
            try {
                // Check if the required environment variables are set
                const requiredEnvVars = [
                    'REDIS_DGPE_CACHE_KEY',
                    'REDIS_DGPE_CACHE_HOURS',
                    'GOOGLE_PLACE_ID',
                    'GOOGLE_API_KEY',
                ]
                requiredEnvVars.forEach(v => {
                    if (!ctx.env[v]) {
                        throw new Error(`Missing environment variable ${v}`)
                    }
                })

                // Get the Redis URL
                const redis_url =
                    ctx.env.REDIS ||
                    (ctx.env.REDIS_HOST &&
                    ctx.env.REDIS_PORT &&
                    ctx.env.REDIS_USERNAME &&
                    ctx.env.REDIS_PASSWORD
                        ? `redis://${ctx.env.REDIS_USERNAME}:${ctx.env.REDIS_PASSWORD}@${ctx.env.REDIS_HOST}:${ctx.env.REDIS_PORT}`
                        : null)
                if (!redis_url) {
                    throw new Error(
                        'Missing Redis configuration. Either REDIS or REDIS_HOST, REDIS_PORT, REDIS_USERNAME, and REDIS_PASSWORD must be provided.'
                    )
                }

                // Create a new Redis client
                const redis_client = new Redis(redis_url)
                // The key to store the cached data
                const redis_key = `${ctx.env.REDIS_DGPE_CACHE_KEY}-google-place`

                // Check for cached data
                const cached_data = await redis_client.get(redis_key)
                if (cached_data) {
                    res.json(JSON.parse(cached_data))
                    return
                }

                const endpoint = `https://places.googleapis.com/v1/places/${ctx.env.GOOGLE_PLACE_ID}`
                const rsp = await fetch(endpoint, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Goog-Api-Key': ctx.env.GOOGLE_API_KEY,
                        'X-Goog-FieldMask':
                            'id,internationalPhoneNumber,plusCode,googleMapsUri,regularOpeningHours,adrFormatAddress,currentOpeningHours,reviews',
                        'Accept-Language': 'en',
                    },
                })

                const data = await rsp.json()

                // Cache the data every REDIS_DGPE_CACHE_HOURS hours
                await redis_client.set(
                    redis_key,
                    JSON.stringify(data),
                    'EX',
                    ctx.env.REDIS_DGPE_CACHE_HOURS * 60 * 60
                )

                rsp.ok
                    ? res.json(data)
                    : res.status(rsp.status).send(rsp.statusText)
            } catch (error: unknown) {
                res.status(500).send(
                    error instanceof Error
                        ? error.message
                        : 'An unknown error occurred'
                )
            }
        })
    },
} as EndpointConfig
