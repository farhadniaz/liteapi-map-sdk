import { describe, it, expect } from '@jest/globals';
import { MapboxProvider } from '../mapbox';

describe('MapboxProvider', () => {
  it('should throw error when access token is missing', async () => {
    const provider = new MapboxProvider();
    await expect(provider.initialize({ selector: 'map', accessToken: '' })).rejects.toThrow('Access token is required');
  });

  it('should throw error when map not initialized', () => {
    const provider = new MapboxProvider();

    expect(() => provider.setCenter(0, 0)).toThrow('Map not initialized');
    expect(() => provider.getViewport()).toThrow('Map not initialized');
  });

  it('should not throw on safe methods when uninitialized', () => {
    const provider = new MapboxProvider();

    expect(() => provider.clearMarkers()).not.toThrow();
    expect(() => provider.destroy()).not.toThrow();
  });
});
