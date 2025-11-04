import express from "express";
import cors from "cors";
import { retrieveRatesForHotels, searchSpecificPlace } from "./services";
import { createWhiteLabelDeepLink, generateRandomLngLat } from "./utils";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/map/places/:placeId/hotels", async (req, res) => {
  try {
    const { placeId } = req.params;

    const {
      checkin,
      checkout,
      adults = "2",
      rooms = "1",
      currency = "EUR",
      language = "en",
      occupancies = [],
    } = req.body as any;

    const place = await searchSpecificPlace(placeId);

    if (!place?.data?.viewport || !place?.data?.location) {
      return res.status(500).json({ error: "Invalid place data received" });
    }

    const viewport = place.data.viewport;

    const ratesResp = await retrieveRatesForHotels({
      placeId,
      checkin,
      checkout,
      occupancies,
      currency,
      language,
      guestNationality: "EU",
    });

    if (!ratesResp?.data || !ratesResp?.hotels) {
      return res.status(500).json({ error: "Invalid rates data received" });
    }

    const priceById = new Map<string, { amount: number; currency: string }>();

    for (const r of ratesResp.data) {
      const rt = r.roomTypes?.[0];
      const price =
        rt?.offerRetailRate ||
        rt?.suggestedSellingPrice ||
        rt?.rates?.[0]?.retailRate?.suggestedSellingPrice?.[0] ||
        rt?.rates?.[0]?.retailRate?.total?.[0];

      if (price)
        priceById.set(r.hotelId, {
          amount: price.amount,
          currency: price.currency,
        });
    }

    const result = {
      viewport,
      hotels: ratesResp.hotels
        .filter((h: any) => priceById.has(h.id))
        .map((h: any) => {
          const { id, name } = h;
          const p = priceById.get(id)!;

          const deepLink = createWhiteLabelDeepLink({
            hotelId: h.id,
            placeId,
            checkin,
            checkout,
            rooms: Number(rooms),
            adults: Number(adults),
            currency,
            language,
          });

          const location = generateRandomLngLat(place.data.location);

          return {
            hotelId: id,
            name,
            price: p.amount,
            currency: p.currency,
            hasAvailability: true,
            deepLink,
            ...location,
          };
        }),
    };

    res.json(result);
  } catch (err) {
    console.error("Hotel rates API error:", err);
    res.status(500).json({
      error: "Failed to fetch hotel data",
      message: err instanceof Error ? err.message : "Unknown error"
    });
  }
});

app.get("/api/weather", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res
        .status(400)
        .json({ error: "latitude and longitude are required" });
    }

    const API_KEY = process.env.OPENWEATHER_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ error: "Weather service not configured" });
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

    const response = await fetch(url);

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "Failed to fetch weather data" });
    }

    const data = (await response.json()) as any;

    if (!data?.main || !data?.weather?.[0]) {
      return res.status(500).json({ error: "Invalid weather data received" });
    }

    const weatherData = {
      latitude: parseFloat(lat as string),
      longitude: parseFloat(lon as string),
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      city: data.name,
    };

    res.json(weatherData);
  } catch (err) {
    console.error("Weather API error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 BFF Server running on http://localhost:${PORT}`);
  console.log(`📍 Hotels endpoint: POST /api/map/places/:placeId/hotels`);
  console.log(`🌤️  Weather endpoint: GET /api/weather`);
});
