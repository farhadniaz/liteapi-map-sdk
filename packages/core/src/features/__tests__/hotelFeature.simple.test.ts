import { describe, it, expect } from '@jest/globals';
import { hotelFeature } from '../hotelFeature';
import type { MapProvider } from '../../providers/types';
import type { State } from '../../types';

describe('hotelFeature', () => {
  const mockProvider = {
    getViewport: () => ({ south: 0, west: 0, north: 0, east: 0, low: { latitude: 0, longitude: 0 }, high: { latitude: 0, longitude: 0 } }),
    setViewport: () => {},
    renderMarkers: () => {},
  } as any as MapProvider;

  it('should return hotels from state', () => {
    const state: State = { currentHotels: [{ hotelId: 'test', name: 'Hotel', latitude: 0, longitude: 0, price: 100, currency: 'EUR', hasAvailability: true, deepLink: '' }] };
    const feature = hotelFeature(mockProvider, state);

    expect(feature.getHotels()).toHaveLength(1);
  });
});
