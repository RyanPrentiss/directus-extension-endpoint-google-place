# Directus Google Place Endpoint

This is a custom endpoint for Directus that allows you to retrieve place data from the Google Places API.

## Installation

Set the environment variables in your system or in a .env file in the root of your project:

```env
GOOGLE_PLACE_ID=your-google-place-id
GOOGLE_API_KEY=your-google-api-key
REDIS_URL=your-redis-url
REDIS_CACHE_KEY=your-redis-cache-key
REDIS_CACHE_HOURS=your-redis-cache-hours
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

Future plans are to add a configuration panel.
