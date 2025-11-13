import { useState } from 'react';
import L, { Map as LeafletMap, Marker, LatLngExpression, divIcon } from 'leaflet';

// Types
import { CheckpointOnMap } from '../features/types';

export const useMarkerManager = (map: LeafletMap | null) => {
  const [markers, setMarkers] = useState<Marker[]>([]);

  const clearMarkers = () => {
    markers.forEach((marker) => marker.remove());
    setMarkers([]);
  };

  const clearMarkerByLocation = async (location: { lat: number; lng: number }) => {
    const updatedMarkers = markers.filter((marker) => {
      const markerLatLng = marker.getLatLng();
      const isSame = 
        markerLatLng.lat.toFixed(6) === location.lat.toFixed(6) &&
        markerLatLng.lng.toFixed(6) === location.lng.toFixed(6);

      if (isSame) {
        marker.remove();
        return false;
      }
      return true;
    });

    setMarkers(updatedMarkers);
  };


  const createMarker = (location: LatLngExpression, color: string = "#FF0000", isLocationWithLabel: boolean = false, markerTag: string = "") => {
    if (!map) return;
    clearMarkers();

    const iconSVG = `
      <svg width="30px" height="40px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M3.37892 10.2236L8 16L12.6211 10.2236C13.5137 9.10788 14 7.72154 14 6.29266V6C14 2.68629 11.3137 0 8 0C4.68629 0 2 2.68629 2 6V6.29266C2 7.72154 2.4863 9.10788 3.37892 10.2236ZM8 8C9.10457 8 10 7.10457 10 6C10 4.89543 9.10457 4 8 4C6.89543 4 6 4.89543 6 6C6 7.10457 6.89543 8 8 8Z" fill="${color}"/>
      </svg>
    `;

    let htmlContent = `<div style="position: relative; display: flex; align-items: center; justify-content: center;">${iconSVG}`;
    
    if (isLocationWithLabel && Array.isArray(location)) {
      const [lat, lng] = location;
      htmlContent += `
        <label style="position: absolute; bottom: -20px; left: 20px; color: white; background: black; padding: 5px 10px; border-radius: 5px; font-size: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
          ${lat.toFixed(5)}, ${lng.toFixed(5)}
        </label>
      `;
    }

    htmlContent += `</div>`;

    const marker = L.marker(location, {
      icon: divIcon({
        html: htmlContent,
        className: '',
        iconSize: [30, 40],
      }),
    }).addTo(map);

    if (markerTag) {
      createToolTip(marker, location, markerTag);
    }

    setMarkers([marker]);
  };

  const createMarkerWithList = (locations: {latLng: LatLngExpression, name: string}[], color: string = "#FF0000", isLocationWithLabel: boolean = false) => {
    if (!map) return;
    clearMarkers();

    const newMarkers: Marker[] = [];

    locations.forEach((loc: {latLng: LatLngExpression, name: string}) => {
      const iconSVG = `
        <svg width="30px" height="40px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M3.37892 10.2236L8 16L12.6211 10.2236C13.5137 9.10788 14 7.72154 14 6.29266V6C14 2.68629 11.3137 0 8 0C4.68629 0 2 2.68629 2 6V6.29266C2 7.72154 2.4863 9.10788 3.37892 10.2236ZM8 8C9.10457 8 10 7.10457 10 6C10 4.89543 9.10457 4 8 4C6.89543 4 6 4.89543 6 6C6 7.10457 6.89543 8 8 8Z" fill="${color}"/>
        </svg>
      `;

      let htmlContent = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          ${iconSVG}
        </div>
      `;

      const marker = L.marker(loc.latLng, {
        icon: divIcon({
          html: htmlContent,
          className: '',
          iconSize: [30, 40],
        }),
      }).addTo(map);

      if (isLocationWithLabel && loc.latLng) {
        const latLng  = L.latLng(loc.latLng);
        createToolTip(marker, latLng, loc.name);
        createPopup(marker, latLng, loc.name);
      }

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
  };

  const createCheckpointMarker = (checkpoint: CheckpointOnMap) => {
    if (!map) return;

    setMarkers(prevMarkers => {
      prevMarkers.forEach(m => {
        if ((m as any).cameraUid === checkpoint.cameraUid) {
          map.removeLayer(m);
        }
      });
      return prevMarkers.filter(m => (m as any).cameraUid !== checkpoint.cameraUid);
    });

    const iconSVG = `
      <svg width="30px" height="40px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M3.37892 10.2236L8 16L12.6211 10.2236C13.5137 9.10788 14 7.72154 14 6.29266V6C14 2.68629 11.3137 0 8 0C4.68629 0 2 2.68629 2 6V6.29266C2 7.72154 2.4863 9.10788 3.37892 10.2236ZM8 8C9.10457 8 10 7.10457 10 6C10 4.89543 9.10457 4 8 4C6.89543 4 6 4.89543 6 6C6 7.10457 6.89543 8 8 8Z" fill="${checkpoint.color}"/>
      </svg>
    `;

    let htmlContent = `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        ${iconSVG}
    `;

    if (checkpoint.isSpecialLocation) {
      htmlContent += `
        <div style="position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: start; top: 0px; left: 30px; color: ${checkpoint.bgColor}; background: white; padding: 5px 12px; border-radius: 5px; font-size: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.3); width: 200px;">
          <div style="font-weight: bold; font-size: 16px; width: 100%;">${checkpoint.checkpointName}</div>
          <div style="font-size: 14px;">${checkpoint.detectTime}</div>
        </div>
      `;
    }

    htmlContent += `</div>`;

    const marker = L.marker(checkpoint.location, {
      icon: divIcon({
        html: htmlContent,
        className: '',
        iconSize: [30, 40],
      }),
    }).addTo(map);

    (marker as any).cameraUid = checkpoint.cameraUid;

    if (checkpoint.isLocationWithLabel) {
      const latLng = L.latLng(checkpoint.location);
      createToolTip(marker, latLng, checkpoint.checkpointName);
      createPopup(marker, latLng, checkpoint.checkpointName);
    }

    setMarkers(prevMarkers => [...prevMarkers, marker]);
  };

  const createCountLabel = async (location: LatLngExpression, count: number, color_1: string, color_2: string) => {
    if (!map) return;
  
    clearMarkers();
  
    const html = `
      <div style="
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: radial-gradient(circle, ${color_1} 0%, ${color_2} 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        font-size: 14px;
        font-weight: bold;
        color: #000;
        border: 2px solid white;
      ">
        ${count.toLocaleString()}
      </div>
    `;

    const marker = L.marker(location, {
      icon: divIcon({
        html,
        className: '',
        iconSize: [60, 60],
      }),
    }).addTo(map);

    setMarkers([marker]);
  };
  
  const createCameraStatus = async (location: LatLngExpression, color: string) => {
    if (!map) return;
  
    clearMarkers();
  
    const html = `
      <div style="
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      ">
      </div>
    `;

    const marker = L.marker(location, {
      icon: divIcon({
        html,
        className: '',
        iconSize: [60, 60],
      }),
    }).addTo(map);

    setMarkers([marker]);
  };

  const createToolTip = (marker: L.Marker<any>, latLng: LatLngExpression, name: string | undefined) => {
    const newLatLng = L.latLng(latLng);
    return marker.bindTooltip(
      `<div style="text-align: center;">
        <div>${newLatLng.lat.toFixed(5)}, ${newLatLng.lng.toFixed(5)}</div>
        <div>${name ?? "-"}</div>
      </div>`,
      {
        permanent: false,
        direction: 'top',
        offset: [0, -10],
      }
    );
  }

  const createPopup = (marker: L.Marker<any>, latLng: LatLngExpression, name: string | undefined) => {
    const newLatLng = L.latLng(latLng);
    return marker.bindPopup(
      `<div style="text-align: center;">
        <div>
          <a 
            href="https://www.google.com/maps/search/?api=1&query=${newLatLng.lat},${newLatLng.lng}" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="popup-link"
          >
            ${newLatLng.lat.toFixed(5)}, ${newLatLng.lng.toFixed(5)}
          </a>
        </div>
        <div>${name ?? "-"}</div>
      </div>`,
      {
        closeButton: true,
        autoPan: true,
      }
    );
  }

  return {
    clearMarkers,
    clearMarkerByLocation,
    createMarker,
    createCountLabel,
    createCameraStatus,
    createMarkerWithList,
    createCheckpointMarker,
  };
};