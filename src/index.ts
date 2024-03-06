import type { EndpointConfig } from '@directus/extensions'
import Redis from 'ioredis'

export default {
    id: 'google-place',
    handler: (router, ctx) => {
        router.get('/', async (_req, res) => {
            const checkEnvironmentVariables = (vars: string[]): void => {
                vars.forEach(v => {
                    if (!ctx.env[v]) {
                        throw new Error(`Missing environment variable ${v}`)
                    }
                })
            }

            try {
                // Check if the required environment variables are set
                checkEnvironmentVariables([
                    'REDIS_URL',
                    'REDIS_CACHE_KEY',
                    'REDIS_CACHE_HOURS',
                    'GOOGLE_PLACE_ID',
                    'GOOGLE_API_KEY',
                ])

                // Create a new Redis client
                const redis_client = new Redis(ctx.env.REDIS_URL)

                // The key to store the cached data
                const redis_key = `${ctx.env.REDIS_CACHE_KEY}-google-place`

                // Check if the data is cached
                const cachedData = await redis_client.get(redis_key)

                // If the data is cached, return it
                if (cachedData) {
                    res.json(JSON.parse(cachedData))
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

                // Cache the data every REDIS_CACHE_HOURS hours
                await redis_client.set(
                    redis_key,
                    JSON.stringify(data),
                    'EX',
                    ctx.env.REDIS_CACHE_HOURS * 3600
                )

                rsp.ok
                    ? res.json(data)
                    : res.status(rsp.status).send(rsp.statusText)
            } catch (error: unknown) {
                if (error instanceof Error) {
                    res.status(500).send(error.message)
                } else {
                    res.status(500).send('An unknown error occurred')
                }
            }
        })
    },
} as EndpointConfig
