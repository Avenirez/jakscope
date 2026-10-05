import L from "leaflet";

/**
 * Clean Architecture: Core Map Configuration Layer
 * Centralized settings for Leaflet maps to prevent duplication and tight coupling in UI components.
 */

// 1. Strict bounds restricted to DKI Jakarta area only
export const JAKARTA_MAX_BOUNDS = L.latLngBounds(
  [-6.39, 106.67], // Southwest corner
  [-6.06, 106.99]  // Northeast corner
);

// 2. Official OpenStreetMap (OSM) tile configuration
export const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const OSM_TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// 3. Dark Masking Overlay (Dims outer cities like Tangerang, Bekasi, Depok)
export const JAKARTA_OUTER_MASK_GEOJSON = {
  type: "Feature",
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [106.30, -5.50],
        [107.40, -5.50],
        [107.40, -6.60],
        [106.30, -6.60],
        [106.30, -5.50]
      ],
      [
        [106.68, -6.08],
        [106.97, -6.08],
        [106.97, -6.37],
        [106.68, -6.37],
        [106.68, -6.08]
      ]
    ]
  }
};

export const JAKARTA_OUTER_MASK_STYLE = {
  fillColor: "#0f172a",
  fillOpacity: 0.85,
  color: "#38bdf8",
  weight: 1.5,
  opacity: 0.8,
};
