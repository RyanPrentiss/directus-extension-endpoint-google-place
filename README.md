# Directus Google Place Endpoint

This is a custom endpoint for Directus that allows you to retrieve place data from the Google Places API.

## Installation:

Ensure your Directus project is configured for Redis.

https://docs.directus.io/self-hosted/config-options.html#redis

Add the following environment variables to your project:

```env
GOOGLE_API_KEY=your-google-api-key
GOOGLE_PLACE_ID=your-google-place-id

REDIS_DGPE_CACHE_KEY=your-redis-dgpe-cache-key
REDIS_DGPE_CACHE_HOURS=your-redis-dgpe-cache-hours
```

## Usage

You can use this endpoint to retrieve place data from the Google Places API.

```http
GET /google-place
```

## Notes

This plugin currently retrieves the following data:

-   id
-   plusCode
-   googleMapsUri
-   internationalPhoneNumber
-   adrFormatAddress
-   regularOpeningHours
-   currentOpeningHours
-   reviews

In the future I would like to add a configuration panel to customize data requests.
