mapboxgl.accessToken =
  'pk.eyJ1IjoiaWFtcmF2aXNpbmdoIiwiYSI6ImNrOXBtbjI4NjA4eHUzZHRnN3BiY2RndzQifQ.BYUNAwI1nDMvV80jmO9IWg';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  zoom: 9,
  center: [75.7139,19.7515]
  // center: [-71.157895, 42.707741]
});

// Fetch stores from API
const getStores = async () => {
  const res = await fetch('/api/v1/stores');
  const data = await res.json();
  const addedStoreId = localStorage.getItem('coordinatesId')
  let currentCoordinates = data.data.find(item => item.storeId == addedStoreId ? item.location.coordinates : null)
  console.log('addedStoreId>>>>>>>>>', currentCoordinates, addedStoreId);
  localStorage.removeItem('coordinatesId');
  const stores = data.data.map(store => {
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [
          store.location.coordinates[0],
          store.location.coordinates[1]
        ]
      },
      properties: {
        storeId: store.storeId,
        icon: 'shop'
      }
    };
  });

  loadMap(stores,currentCoordinates ? currentCoordinates.location.coordinates : null);
}

let isAtStart = true;
// Load map with stores
const loadMap = (stores,currentCoordinates) => {
  map.on('load',() => {
    map.addLayer({
      id: 'points',
      type: 'symbol',
      source: {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: stores
        }
      },
      layout: {
        'icon-image': '{icon}-15',
        'icon-size': 1.5,
        'text-field': '{storeId}',
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-offset': [0, 0.9],
        'text-anchor': 'top'
      }
    });
    var coordinates = stores.map(item => item.geometry.coordinates);
    if (!currentCoordinates) return;
    // Pass the first coordinates in the LineString to `lngLatBounds` &
    // wrap each coordinate pair in `extend` to include them in the bounds
    // result. A variation of this technique could be applied to zooming
    // to the bounds of multiple Points or Polygon geomteries - it just
    // requires wrapping all the coordinates with the extend method.
    var bounds = currentCoordinates.reduce((bounds, coord) => {
    return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(currentCoordinates, currentCoordinates));
    console.log('inside map zoom >>>>>>>>>>>>>', coordinates[0], coordinates[0],currentCoordinates,bounds);
    map.fitBounds(bounds, {
    padding: 20
    });
  });
}

getStores();
