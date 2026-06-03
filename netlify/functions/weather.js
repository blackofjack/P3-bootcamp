const DEFAULT_COORDINATES = {
  lat: "15.1873",
  lon: "120.5491",
};

const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";

export default async (request, context) => {
  try {
    if (!process.env.WEATHER_API_KEY) {
      return Response.json(
        { error: "Weather API key is not configured." },
        { status: 500 },
      );
    }

    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat") || DEFAULT_COORDINATES.lat;
    const lon = searchParams.get("lon") || DEFAULT_COORDINATES.lon;

    const apiUrl = new URL(WEATHER_API_URL);
    apiUrl.searchParams.set("lat", lat);
    apiUrl.searchParams.set("lon", lon);
    apiUrl.searchParams.set("appid", process.env.WEATHER_API_KEY);
    apiUrl.searchParams.set("units", "metric");

    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.error(
        `Weather API error (${response.status}):`,
        await response.text(),
      );

      return Response.json(
        { error: "Weather is unavailable right now." },
        { status: response.status },
      );
    }

    return Response.json(await response.json());
  } catch (error) {
    console.error("Weather function error:", error);
    return Response.json({ error: "Weather is unavailable right now." }, { status: 500 });
  }
};
