// Type declarations for leaflet plugins that don't ship with @types

declare module 'leaflet.heat' {
  import * as L from 'leaflet';

  interface HeatLatLngTuple extends Array<number> {
    0: number; // lat
    1: number; // lng
    2?: number; // intensity (0–1)
  }

  interface HeatLayerOptions {
    minOpacity?: number;
    maxZoom?: number;
    max?: number;
    radius?: number;
    blur?: number;
    gradient?: Record<number, string>;
  }

  interface HeatLayer extends L.Layer {
    setLatLngs(latlngs: HeatLatLngTuple[]): this;
    addLatLng(latlng: HeatLatLngTuple): this;
    setOptions(options: HeatLayerOptions): this;
    redraw(): this;
  }

  namespace L {
    function heatLayer(latlngs: HeatLatLngTuple[], options?: HeatLayerOptions): HeatLayer;
  }
}

declare module 'leaflet.markercluster' {
  import * as L from 'leaflet';

  interface MarkerClusterGroupOptions extends L.LayerOptions {
    maxClusterRadius?: number | ((zoom: number) => number);
    clusterPane?: string;
    iconCreateFunction?: (cluster: MarkerCluster) => L.Icon | L.DivIcon;
    spiderfyOnMaxZoom?: boolean;
    showCoverageOnHover?: boolean;
    zoomToBoundsOnClick?: boolean;
    singleMarkerMode?: boolean;
    disableClusteringAtZoom?: number;
    removeOutsideVisibleBounds?: boolean;
    animate?: boolean;
    animateAddingMarkers?: boolean;
    spiderfyDistanceMultiplier?: number;
    spiderfyShapePositions?: (count: number, centerPt: L.Point) => L.Point[];
    chunkedLoading?: boolean;
    chunkInterval?: number;
    chunkDelay?: number;
    chunkProgress?: ((processed: number, total: number, elapsed: number, finish: boolean) => void) | null;
    polygonOptions?: L.PolylineOptions;
  }

  interface MarkerCluster extends L.Marker {
    getChildCount(): number;
    getAllChildMarkers(): L.Marker[];
    spiderfy(): void;
    unspiderfy(): void;
  }

  interface MarkerClusterGroup extends L.FeatureGroup {
    addLayer(layer: L.Layer): this;
    removeLayer(layer: L.Layer): this;
    clearLayers(): this;
    hasLayer(layer: L.Layer): boolean;
    getVisibleParent(marker: L.Marker): L.Marker;
    refreshClusters(layers?: L.Layer | L.LayerGroup): this;
  }

  namespace L {
    function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;
  }
}
