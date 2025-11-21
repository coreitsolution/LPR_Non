import { useState, useCallback, useEffect } from 'react';
import L, { Map as LeafletMap, LatLngBounds, Polyline } from 'leaflet';
import polyline from '@mapbox/polyline';

// Types
import { SearchResult, CheckpointOnMap, NotificationList } from '../features/types';

// Utils
import { parseCoordinates, parseCoordinatesWith2Param } from '../utils/coordinates';

// Hooks
import { useMarkerManager } from './useMarkerManager';

// Config
import { getUrls } from '../config/runtimeConfig';

// Constants
import { MAP_PIN_ICON_COLOR } from '../constants/map';
const COUNT_OVER = 1000;

export const useMapSearch = (map: LeafletMap | null, ableToClick = false) => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const markerManager = useMarkerManager(map);
  const [routes, setRoutes] = useState<Polyline[]>([]);

  const clearRoutes = () => {
    routes.forEach((route) => map?.removeLayer(route));
    setRoutes([]);
  };

  const clearSearchPlaces = async () => {
    setSearchResults([]);
    await markerManager.clearMarkers();
  }

  const clearPlaceMarkerWithLocation = async (location: { lat: number, lng: number }) => {
    await markerManager.clearMarkerByLocation(location);
  }

  const searchPlace = useCallback(async (query: string, iconColor: string = "#FDCC0A", isLocationWithLabel: boolean = false) => {
    setSearchResults([])
    if (!map) return
    
    setIsSearching(true)
    setSearchError(null)
    
    try {
      // First check if input is coordinates
      const coordinates = parseCoordinates(query)
      if (coordinates) {
        const result: SearchResult = {
          name: `${coordinates.lat}, ${coordinates.lng}`,
          location: coordinates
        }
        setSearchResults([result])
        map.setZoom(18)
        map.panTo(coordinates)
        await markerManager.createMarker(coordinates, iconColor, isLocationWithLabel)
        return
      }
    } 
    catch (error) {
      setSearchError('Error searching for place')
      setSearchResults([])
    } 
    finally {
      setIsSearching(false)
    }
  }, [map, markerManager]);

  const showCountInMap = useCallback(async (list: { lat: string; lon: string, count: number }[], count_over?: number) => {
    setSearchResults([])
    if (!map) return
    
    setIsSearching(true)
    setSearchError(null)
    
    try {
      markerManager.clearMarkers(); // Clear existing markers

      const bounds = new LatLngBounds([]);

      for (const item of list) {
        const coordinate = parseCoordinatesWith2Param(item.lat, item.lon);

        if (!coordinate) continue;

        const countOver = count_over ?? COUNT_OVER;

        const isOver = item.count >= countOver;
        const color1 = isOver ? "rgba(254,190,67,1)" : "rgba(249,191,192,1)";
        const color2 = isOver ? "rgba(253,204,10,1)" : "rgba(255,235,238,1)";

        await markerManager.createCountLabel(coordinate, item.count, color1, color2);
        bounds.extend(coordinate);
      }

      if (!bounds.isValid()) {
        map.fitBounds(bounds);
      }
    } 
    catch (error) {
      setSearchError('Error show count on map')
      setSearchResults([])
    } 
    finally {
      setIsSearching(false)
    }
  }, [map, markerManager]);

  const showCameraStatusInMap = useCallback(async (list: { lat: string; lon: string, status: number }[]) => {
    setSearchResults([])
    if (!map) return
    
    setIsSearching(true)
    setSearchError(null)
    
    try {
      markerManager.clearMarkers(); // Clear existing markers

      const bounds = new LatLngBounds([]);

      for (const item of list) {
        const coordinate = parseCoordinatesWith2Param(item.lat, item.lon);

        if (!coordinate) continue;

        let color = "";
        switch (item.status) {
          case 1:
            color = "#4CB64C";
            break
          case 2:
            color = "linear-gradient(90deg, rgba(254,190,67,1) 0%, rgba(253,204,10,1) 100%)";
            break
          case 3:
            color = "#DD2025";
            break
          default:
            color = "#FFFFFF";
            break
        }

        await markerManager.createCameraStatus(coordinate, color);
        bounds.extend(coordinate);
      }

      if (!bounds.isValid()) {
        map.fitBounds(bounds);
      }
    } 
    catch (error) {
      setSearchError('Error show count on map')
      setSearchResults([])
    } 
    finally {
      setIsSearching(false)
    }
  }, [map, markerManager]);

  const drawRoute = useCallback(
    async (routesData: { id: string; routeList: { lat: string; lon: string }[] }[]) => {
      const { CENTER_OSRM_URL } = getUrls();
      setSearchResults([]);
      if (!map) return;
  
      setIsSearching(true);
      setSearchError(null);
  
      try {
        await clearRoutes(); // Clear previous routes
        await markerManager.clearMarkers(); // Clear existing markers
  
        const newRoutes: Polyline[] = [];
        const allPoints: L.LatLngExpression[] = [];
  
        for (let i = 0; i < routesData.length; i++) {
          const rawCoordinates: [number, number][] = routesData[i].routeList
            .map((point) => {
              const coord = parseCoordinatesWith2Param(point.lat, point.lon);
              return coord ? [coord.lat, coord.lng] as [number, number] : null;
            })
            .filter((c): c is [number, number] => c !== null);

          const color = MAP_PIN_ICON_COLOR[i % MAP_PIN_ICON_COLOR.length].color;

          // Create markers
          for (let j = 0; j < rawCoordinates.length; j++) {
            const coord = rawCoordinates[j];
            let markerLabel = "";

            if (rawCoordinates.length > 1) markerLabel = `Route ${i + 1} (${j})`;

            await markerManager.createMarker(
              { lat: coord[0], lng: coord[1] },
              color,
              false,
              markerLabel
            );
          }

          // Construct OSRM URL
          if (rawCoordinates.length > 1) {
            const coordsString = rawCoordinates
              .map((c) => `${c[1]},${c[0]}`)
              .join(';');
            const url = `${CENTER_OSRM_URL}/route/v1/driving/${coordsString}?geometries=polyline&overview=full`;

            const res = await fetch(url);
            const data = await res.json();

            if (data.routes?.length > 0) {
              const route = data.routes[0];
              const decodedCoords = polyline.decode(route.geometry) as [number, number][];
              const leafletCoords = decodedCoords.map(([lat, lng]) => [lat, lng]) as L.LatLngExpression[];

              const polylineLayer = L.polyline(leafletCoords, {
                color,
                weight: 2,
                opacity: 0.8,
              }).addTo(map);

              newRoutes.push(polylineLayer);
              allPoints.push(...leafletCoords);
            } 
            else {
              console.warn(`No route found for route ID ${routesData[i].id}`);
            }
          } 
          else if (rawCoordinates.length === 1) {
            allPoints.push([rawCoordinates[0][0], rawCoordinates[0][1]]);
          }
        }

        setRoutes(newRoutes);

        if (allPoints.length > 1) {
          map.fitBounds(L.latLngBounds(allPoints));
        }
        else if (allPoints.length === 1) {
          map.setView(allPoints[0], 17);
        }
      } 
      catch (error) {
        console.error(error);
        setSearchError('Error drawing the route.');
        setSearchResults([]);
      } 
      finally {
        setIsSearching(false);
      }
    },
    [map, markerManager]
  );

  const searchCameras = useCallback(async (query: {location: string, name: string}[], iconColor: string = "#DD2025", isLocationWithLabel: boolean = false) => {
    setSearchResults([])
    if (!map) return
    
    setIsSearching(true)
    setSearchError(null)
    
    try {
      const coordinatesList = [];
      const locationList = [];
      const bounds = new LatLngBounds([]);

      for (const q of query) {
        const coordinates = parseCoordinates(q.location)
        if (coordinates) {
          coordinatesList.push(coordinates);
          locationList.push({
            latLng: coordinates,
            name: q.name
          });
          bounds.extend(coordinates);
        }
      }
      
      if (coordinatesList.length > 0) {
        const result: SearchResult[] = coordinatesList.map(coordinates => ({
          name: `${coordinates.lat}, ${coordinates.lng}`,
          location: coordinates
        }));
        setSearchResults(result)
        await markerManager.createMarkerWithList(locationList, iconColor, isLocationWithLabel)

        if (bounds.isValid()) {
          if (coordinatesList.length === 1) {
            map.setView(coordinatesList[0], 15);
          } 
          else {
            map.fitBounds(bounds, { padding: [30, 30] });
          }
        }
      }
    } 
    catch (error) {
      setSearchError('Error searching for place')
      setSearchResults([])
    } 
    finally {
      setIsSearching(false)
    }
  }, [map, markerManager]);

  // const searchSpecialCheckpoint = useCallback(async (
  //   checkpoints: {
  //     query: string,
  //     iconColor?: string,
  //     isLocationWithLabel?: boolean,
  //     isSpecialLocation?: boolean,
  //     checkpointName?: string,
  //     detectTime?: string
  //   },
  // ) => {
  //   if (!map) return;

  //   setIsSearching(true);
  //   setSearchError(null);

  //   try {
  //     const coordinatesList: CheckpointOnMap[] = [];

  //     const coordinates = parseCoordinates(checkpoints.query);

  //     if (coordinates) {
  //       await markerManager.createCheckpointMarker({
  //         location: coordinates,
  //         color: checkpoints.iconColor || "#DD2025",
  //         isLocationWithLabel: checkpoints.isLocationWithLabel || true,
  //         isSpecialLocation: checkpoints.isSpecialLocation || false,
  //         checkpointName: checkpoints.checkpointName || "",
  //         detectTime: checkpoints.detectTime || ""
  //       });

  //       const result: SearchResult[] = coordinatesList.map(coordinates => ({
  //         name: `${coordinates.location?.lat}, ${coordinates.location?.lng}`,
  //         location: coordinates.location
  //       }));
  //       setSearchResults(result);

  //       // if (bounds.isValid()) {
  //       //   if (coordinatesList.length === 1) {
  //       //     map.setView(coordinatesList[0].location, 15);
  //       //   } 
  //       //   else {
  //       //     map.fitBounds(bounds, { padding: [30, 30] });
  //       //   }
  //       // }
  //     }
  //   } 
  //   catch (error) {
  //     setSearchError('Error searching for place');
  //     setSearchResults([]);
  //   } 
  //   finally {
  //     setIsSearching(false);
  //   }
  // }, [map, markerManager]);

  const searchSpecialCheckpoint = useCallback(async (
    NotificationList: NotificationList[],
  ) => {
    if (!map) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const coordinatesList: CheckpointOnMap[] = [];

      const bounds = new LatLngBounds([]);

      for (const nl of NotificationList) {
        const coordinates = parseCoordinates(`${nl.camera_latitude}, ${nl.camera_longitude}`);

        if (!coordinates) continue;

        const checkpointData: CheckpointOnMap = {
          cameraUid: nl.camera_uid,
          location: coordinates,
          color: nl.iconColor || "#DD2025",
          bgColor: nl.bgColor || "#DD2025",
          isLocationWithLabel: nl.isLocationWithLabel ?? false,
          isSpecialLocation: nl.isSpecialLocation ?? false,
          checkpointName: nl.camera_name || "",
          detectTime: nl.detectTime || "",
        };

        coordinatesList.push(checkpointData);
        bounds.extend(coordinates);
      }

      for (const cp of coordinatesList) {
        await markerManager.createCheckpointMarker(cp);
      }

      if (coordinatesList.length > 1) {
        map.flyToBounds(bounds, {
          padding: [80, 80],
          maxZoom: 14,
          duration: 1.2
        });
      } 
      else if (coordinatesList.length === 1) {
        map.flyTo(coordinatesList[0].location, 17, {
          duration: 1.0
        });
      }

      const result: SearchResult[] = coordinatesList.map(c => ({
        name: `${c.location?.lat}, ${c.location?.lng}`,
        location: c.location
      }));

      setSearchResults(result);

    } 
    catch (error) {
      setSearchError('Error searching for place');
      setSearchResults([]);
    } 
    finally {
      setIsSearching(false);
    }
  }, [map, markerManager]);

  const handleClick = useCallback(async (event: L.LeafletMouseEvent) => {
    const location = {
      lat: event.latlng.lat,
      lng: event.latlng.lng,
    };

    const result: SearchResult = {
      name: `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`,
      location: location,
    };

    setSearchResults([result]);
    await markerManager.createMarker(location);
  }, [markerManager])

  useEffect(() => {
    if (!map) return;

    if (ableToClick) {
      map.on('click', handleClick);

      return () => {
        map.off('click', handleClick);
      };
    }
  }, [map, ableToClick, handleClick]);

  return {
    searchPlace,
    drawRoute,
    searchResults,
    isSearching,
    searchError,
    showCountInMap,
    showCameraStatusInMap,
    clearSearchPlaces,
    searchCameras,
    searchSpecialCheckpoint,
    clearPlaceMarkerWithLocation,
  }
}