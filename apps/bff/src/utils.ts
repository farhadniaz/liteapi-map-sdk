type DeepLinkParams = {
  hotelId: string;
  placeId: string;
  checkin: string;
  checkout: string;
  rooms: number;
  adults: number;
  currency: string;
  language: string;
};

export const createWhiteLabelDeepLink = ({
  hotelId,
  rooms,
  adults,
  ...query
}: DeepLinkParams): string => {
  const queryString = new URLSearchParams({
    ...query,
    rooms: rooms.toString(),
    adults: adults.toString(),
  }).toString();
  return `https://whitelabel.nuitee.link/hotels/${hotelId}?${queryString}`;
};

export const generateRandomLngLat = (center: {
  latitude: number;
  longitude: number;
}) => {
  const { latitude, longitude } = center;
  const angle = Math.random() * 2 * Math.PI;

  // Generate random offset within ~8km radius
  // 111.32 km per degree latitude (approximate Earth radius conversion)
  const MAX_RADIUS_KM = 8;
  const KM_PER_DEGREE = 111.32;
  const radius = (Math.sqrt(Math.random()) * MAX_RADIUS_KM) / KM_PER_DEGREE;

  const lat = radius * Math.cos(angle);
  const lng =
    (radius * Math.sin(angle)) / (Math.cos((latitude * Math.PI) / 180) || 1);

  return {
    latitude: latitude + lat,
    longitude: longitude + lng,
  };
};
