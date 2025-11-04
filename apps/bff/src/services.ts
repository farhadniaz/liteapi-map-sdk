import { config } from "dotenv";
config();

const LITEAPI_BASE = process.env.LITEAPI_BASE;
const API_KEY = process.env.LITEAPI_KEY;


if (!LITEAPI_BASE) {
  throw new Error("LITEAPI_BASE environment variable is required");
}
if (!API_KEY) {
  throw new Error("LITEAPI_KEY environment variable is required");
}

function authHeaders() {
  return {
    Accept: "application/json",
    "X-API-Key": API_KEY,
    "Content-Type": "application/json",
  };
}

export const searchSpecificPlace = async (placeId: string) => {
  const response = await fetch(`${LITEAPI_BASE}/data/places/${placeId}`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Failed to fetch place data`);
  }

  const res = await response.json();
  checkForError(res, "data/places:");
  return res as any;
};

interface Occupancy {
  adults: number;
  children?: number[];
}

type RetrieveRatesForHotelsQuery = {
  placeId: string;
  checkin: string;
  checkout: string;
  occupancies: Occupancy[];
  currency: string;
  language: string;
  guestNationality: string;
  maxRatesPerHotel?: number;
};
export const retrieveRatesForHotels = async (
  query: RetrieveRatesForHotelsQuery
) => {
  const response = await fetch(`${LITEAPI_BASE}/hotels/rates`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(query),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Failed to fetch hotel rates`);
  }

  const res = await response.json();
  checkForError(res, "hotels/rates:");
  return res as any;
};

const checkForError = (res: any, path: string) => {
  if (res.error) {
    throw new Error(path + res.error.message);
  }
};
