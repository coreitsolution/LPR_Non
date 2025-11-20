import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react"
import { 
  IconButton,
} from "@mui/material";

// Types
import { MapProps } from "../../features/types";
import { DEFAULT_DIMENSIONS, DEFAULT_MAP_CONFIG } from "../../constants/map"
import { useMap } from "../../hooks/useOpenStreetMap"

// Components
import Loading from "../../components/loading/Loading"

// Icons
import CurrentLocation from "../../assets/icons/current-location.png";

// i18n
import { useTranslation } from 'react-i18next';

export interface BaseMapRef {
  captureMap: () => Promise<Blob | null>;
}

const BaseMap = forwardRef<BaseMapRef, MapProps> (({
  height = DEFAULT_DIMENSIONS.height,
  width = DEFAULT_DIMENSIONS.width,
  panControl = DEFAULT_MAP_CONFIG.panControl,
  zoomControl = DEFAULT_MAP_CONFIG.zoomControl,
  mapTypeControl = DEFAULT_MAP_CONFIG.mapTypeControl,
  streetViewControl = DEFAULT_MAP_CONFIG.streetViewControl,
  fullscreenControl = DEFAULT_MAP_CONFIG.fullscreenControl,
  currentLocation = DEFAULT_MAP_CONFIG.currentLocation,
  onMapLoad,
}, ref) => {
  // i18n
  const { t } = useTranslation();

  const mapRef = useRef<HTMLDivElement>(null)
  const { initMap, isLoading, error, mapInstance, goToCurrentLocation, handleCapture } = useMap({
    panControl: panControl,
    zoomControl: zoomControl, 
    mapTypeControl: mapTypeControl,
    streetViewControl: streetViewControl,
    fullscreenControl: fullscreenControl, 
  })
  const [isFullScreen, setIsFullScreen] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  useEffect(() => {
    if (mapRef.current) {
      initMap(mapRef.current)
    }
  }, [])

  useEffect(() => {
    if (onMapLoad) {
      onMapLoad(mapInstance?.current)
    }
  }, [mapInstance, onMapLoad])

  useImperativeHandle(ref, () => ({
    captureMap: async () => await handleCapture(),
  }));

  if (error) {
    return <div className="text-red-500">{`${t('text.failed-to-load-map')}: ${error.message}`}</div>
  }

  return (
    <div className="relative w-full h-full">
      { isLoading && (
        <div className="absolute h-full w-full">
          <Loading />
        </div>
      ) }
      <div
        ref={mapRef}
        id="map"
        className="relative"
        style={{
          width: width || "100%",
          height: height || "100%",
          position: "absolute",
          top: isFullScreen ? 0 : 0,
          left: isFullScreen ? 0 : 0,
          zIndex: 1,
        }}
      />

      {
        currentLocation && (
          <IconButton 
            className="current-location-btn"
            sx={{
              borderRadius: "4px !important",
              position: "absolute",
              bottom: "10px",
              left: "5px",
              zIndex: 1000,
            }}
            onClick={goToCurrentLocation}
          >
            <img src={CurrentLocation} alt='Current Location' className='w-5 h-5' />
          </IconButton>
        )
      }
    </div>
  )
})

export default BaseMap