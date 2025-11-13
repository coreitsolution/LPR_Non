import { useRef, useState } from 'react'
import L, { Map as LeafletMap, divIcon } from 'leaflet';
import html2canvas from 'html2canvas';

// Types
import { MapConfig } from "../features/types";
import { DEFAULT_MAP_CONFIG } from '../constants/map'

export const useMap = (config: Partial<MapConfig> = {}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mapInstance = useRef<LeafletMap | null>(null);
  const currentLocationMarker = useRef<L.Marker | null>(null);

  const initMap = (element: HTMLDivElement) => {
    try {
      setIsLoading(true);

      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }

      const map = L.map(element, {
        zoomControl: false,
        preferCanvas: true,
      }).setView(
        [config.center?.lat ?? DEFAULT_MAP_CONFIG.center.lat, config.center?.lng ?? DEFAULT_MAP_CONFIG.center.lng],
        config.zoom ?? DEFAULT_MAP_CONFIG.zoom
      );

      L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
        maxZoom: 19,
        crossOrigin: true,
      }).addTo(map);

      if (config.zoomControl ? config.zoomControl : DEFAULT_MAP_CONFIG.zoomControl) {
        L.control.zoom({
          position: 'bottomleft'
        }).addTo(map);
      }

      mapInstance.current = map;
    } 
    catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to initialize map'));
    } 
    finally {
      setIsLoading(false);
    }
  };

  const handleCapture = async (): Promise<Blob | null> => {
    // Hide controls and attribution
    const controlsToHide = document.querySelectorAll('.leaflet-control');
    controlsToHide.forEach(control => {
      (control as HTMLElement).style.display = 'none';
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    // Capture the map
    const mapContainer = mapInstance.current?.getContainer();
    const canvas = await html2canvas(mapContainer!, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: null
    });

    // Show controls again
    controlsToHide.forEach(control => {
      (control as HTMLElement).style.display = '';
    });

    // Convert to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      }, 'image/png');
    });
  };

  const goToCurrentLocation = () => {
    if (!mapInstance.current) return;

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const currentLocation = L.latLng(lat, lng);
        mapInstance.current?.setView(currentLocation, 20);

        if (currentLocationMarker.current) {
          mapInstance.current?.removeLayer(currentLocationMarker.current);
          currentLocationMarker.current = null;
        }

        const iconSVG = `
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 8.25C9.92893 8.25 8.25 9.92893 8.25 12C8.25 14.0711 9.92893 15.75 12 15.75C14.0711 15.75 15.75 14.0711 15.75 12C15.75 9.92893 14.0711 8.25 12 8.25Z" fill="#227CBE"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M12 1.25C12.4142 1.25 12.75 1.58579 12.75 2V3.28169C16.9842 3.64113 20.3589 7.01581 20.7183 11.25H22C22.4142 11.25 22.75 11.5858 22.75 12C22.75 12.4142 22.4142 12.75 22 12.75H20.7183C20.3589 16.9842 16.9842 20.3589 12.75 20.7183V22C12.75 22.4142 12.4142 22.75 12 22.75C11.5858 22.75 11.25 22.4142 11.25 22V20.7183C7.01581 20.3589 3.64113 16.9842 3.28169 12.75H2C1.58579 12.75 1.25 12.4142 1.25 12C1.25 11.5858 1.58579 11.25 2 11.25H3.28169C3.64113 7.01581 7.01581 3.64113 11.25 3.28169V2C11.25 1.58579 11.5858 1.25 12 1.25ZM4.75 12C4.75 16.0041 7.99594 19.25 12 19.25C16.0041 19.25 19.25 16.0041 19.25 12C19.25 7.99594 16.0041 4.75 12 4.75C7.99594 4.75 4.75 7.99594 4.75 12Z" fill="#227CBE"></path> </g></svg>
        `;

        const marker = L.marker(currentLocation, {
          icon: divIcon({
            html: iconSVG,
            className: '',
            iconSize: [30, 40],
          }),
        }).addTo(mapInstance.current!);

        currentLocationMarker.current = marker;
      },
      () => {
        alert('Unable to retrieve your location.');
      }
    );
  };

  return {
    initMap,
    isLoading,
    error,
    mapInstance,
    goToCurrentLocation,
    handleCapture,
  };
};