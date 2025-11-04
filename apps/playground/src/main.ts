import "./style.css";
import LiteAPI from "liteapi-map-core-sdk";

const PROXY_BASE_URL = import.meta.env.VITE_PROXY_BASE_URL;

const getTomorrowDates = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const checkin = tomorrow.toISOString().split("T")[0];

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  const checkout = dayAfter.toISOString().split("T")[0];

  return { checkin, checkout };
};

// Common query parameters for hotel searches
const createHotelQuery = (
  placeId: string,
  checkin: string,
  checkout: string,
  currency: string,
  guestNationality: string
) => ({
  placeId,
  checkin,
  checkout,
  occupancies: [{ adults: 2 }],
  currency,
  guestNationality,
  proxyBaseURL: PROXY_BASE_URL,
});

(async () => {
  try {
    console.log("🗺️  LiteAPI Map SDK - Multiple Instances Demo");

    const { checkin, checkout } = getTomorrowDates();
    (window as any).maps = {};

    // Create hotel queries for each location
    const parisQuery = createHotelQuery(
      "ChIJu1K2erNv5kcR6HyzBQieKJ0",
      checkin,
      checkout,
      "EUR",
      "EU"
    );
    const dubaiQuery = createHotelQuery(
      "ChIJRcbZaklDXz4RYlEphFBu5r0",
      checkin,
      checkout,
      "AED",
      "AE"
    );
    const nycQuery = createHotelQuery(
      "ChIJOwg_06VPwokRYv534QaPC8g",
      checkin,
      checkout,
      "USD",
      "US"
    );

    // ========================================
    // PATTERN : Auto-Load
    // ========================================
    const mapParisFunc = async () => {
      const mapParis = await LiteAPI.Map.init({
        selector: "#map-paris",
        hotelsQuery: parisQuery,
      });
      (window as any).maps.mapParis = mapParis;
      await mapParis.loadHotels(parisQuery);
      console.log(`Paris: ${mapParis.getHotels().length} hotels`);
      await mapParis.loadWeather(PROXY_BASE_URL);
      mapParis.toggleWeatherLayer(true);
    };
    mapParisFunc();

    // ========================================
    // PATTERN : Auto-Load (Flexible)
    // ========================================

    const mapDubaiFunc = async () => {
      const mapDubai = await LiteAPI.Map.init({
        selector: "#map-dubai",
        hotelsQuery: dubaiQuery,
      });
      (window as any).maps.mapDubai = mapDubai;
      console.log(`Dubai: ${mapDubai.getHotels().length} hotels`);
    };
    mapDubaiFunc();

    // ========================================
    // PATTERN : Manual-Load
    // ========================================
    const mapNYCFunc = async () => {
      const mapNewYork = await LiteAPI.Map.init({
        selector: "#map-newyork",
      });
      (window as any).maps.mapNewYork = mapNewYork;
      console.log(`New York: ${mapNewYork.getHotels().length} hotels`);
      (window as any).maps.mapNewYorkLoadHotels = async () => {

        await mapNewYork.loadHotels(nycQuery);
      };
    };
    mapNYCFunc();
  } catch (error) {
    console.error("❌ Failed to initialize maps:", error);
  }
  const v = document.getElementById("version");
  if (v) v.innerHTML = "v:" + LiteAPI.Map.version;
})();
