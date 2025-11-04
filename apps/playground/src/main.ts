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
    console.log("=".repeat(70));
    console.log("🗺️  LiteAPI Map SDK - Multiple Instances Demo");
    console.log("=".repeat(70));

    const { checkin, checkout } = getTomorrowDates();

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
    // PATTERN 1: Auto-Load (Spec Compliant)
    // ========================================
    console.log("\n📍 Pattern 1: Auto-load on init (Paris)");

    const mapParis = await LiteAPI.Map.init({
      selector: "#map-paris",
      hotelsQuery: parisQuery,
    });
    console.log("✅ Paris loaded automatically");

    // ========================================
    // PATTERN 2: Manual Load (Flexible)
    // ========================================
    console.log("\n🏜️ Pattern 2: Manual loadHotels() (Dubai)");

    const mapDubai = await LiteAPI.Map.init({
      selector: "#map-dubai",
    });

    // Load hotels explicitly after initialization
    await mapDubai.loadHotels(dubaiQuery);
    console.log("✅ Dubai loaded via loadHotels()");

    // ========================================
    // PATTERN 1 (Again): Auto-Load for New York
    // ========================================
    console.log("\n🗽 Pattern 1: Auto-load on init (New York)");
    const mapNewYork = await LiteAPI.Map.init({
      selector: "#map-newyork",
      hotelsQuery: nycQuery,
    });
    console.log("✅ New York loaded automatically");

    console.log("\n" + "=".repeat(70));
    console.log(`🎯 All 3 maps loaded successfully!`);
    console.log(`   Paris: ${mapParis.getHotels().length} hotels`);
    console.log(`   Dubai: ${mapDubai.getHotels().length} hotels`);
    console.log(`   New York: ${mapNewYork.getHotels().length} hotels`);
    console.log("=".repeat(70));

    // ========================================
    // Demo: Reload Dubai with different query after 5 seconds
    // ========================================
    // setTimeout(async () => {
    //   try {
    //     console.log("\n🔄 Reloading Dubai with different dates...");

    //     const nextWeek = new Date();
    //     nextWeek.setDate(nextWeek.getDate() + 7);
    //     const newCheckin = nextWeek.toISOString().split("T")[0];

    //     const weekAfter = new Date();
    //     weekAfter.setDate(weekAfter.getDate() + 14);
    //     const newCheckout = weekAfter.toISOString().split("T")[0];

    //     // Create new query with different dates and occupancy
    //     const dubaiReloadQuery = {
    //       ...createHotelQuery(
    //         "ChIJRcbZaklDXz4RYlEphFBu5r0",
    //         newCheckin,
    //         newCheckout,
    //         "AED",
    //         "AE"
    //       ),
    //       occupancies: [{ adults: 3, children: [8] }], // Override occupancy
    //     };

    //     // Reload with loadHotels()
    //     await mapDubai.loadHotels(dubaiReloadQuery);

    //     console.log(`✅ Dubai reloaded: ${mapDubai.getHotels().length} hotels`);
    //     console.log(`   New dates: ${newCheckin} to ${newCheckout}`);
    //     console.log(`   Occupancy: 3 adults + 1 child`);
    //   } catch (error) {
    //     console.error("❌ Failed to reload Dubai:", error);
    //   }
    // }, 5000);

    // ========================================
    // Demo: Load weather layer for Paris after 8 seconds
    // ========================================
    setTimeout(async () => {
      try {
        console.log("\n☁️ Loading weather layer for Paris...");

        // Load weather data for viewport center (single API call!)
        await mapParis.loadWeather(PROXY_BASE_URL);

        // Toggle weather layer ON
        mapParis.toggleWeatherLayer(true);

        console.log("\n💡 Try toggling weather:");
        console.log(
          "   - maps.paris.toggleWeatherLayer(false) // Hide weather"
        );
        console.log(
          "   - maps.paris.toggleWeatherLayer(true)  // Show weather"
        );
      } catch (error) {
        console.error("❌ Failed to load weather:", error);
      }
    }, 0);

    // For browser console testing
    (window as any).LiteAPI = LiteAPI;
    (window as any).maps = {
      paris: mapParis,
      dubai: mapDubai,
      // newyork: mapNewYork,
    };
  } catch (error) {
    console.error("❌ Failed to initialize maps:", error);
  }
  const v = document.getElementById("version");
  if (v) v.innerHTML = LiteAPI.Map.version;
})();
