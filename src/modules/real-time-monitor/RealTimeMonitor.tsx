import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useForm } from "react-hook-form";
import { 
  Button,
  Typography 
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import dayjs from 'dayjs'
import buddhistEra from 'dayjs/plugin/buddhistEra'
import { useSelector } from "react-redux"
import { RootState } from "../../app/store"
import { toast, ToastContainer } from 'react-toastify';
import { Map as LeafletMap } from 'leaflet';
import { motion, AnimatePresence } from "framer-motion";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { useAppDispatch } from '../../app/hooks';

// Context
import { useHamburger } from "../../context/HamburgerContext";

// Components
import MultiSelectCameras from '../../components/multi-select/MultiSelectCameras';
import BaseMap from '../../components/base-map/BaseMap';
import RealTimeToastify from '../../components/toastify/RealTimeToastify';
import Image from '../../components/image/Image';

// Types
import {
  Camera,
  CameraResponse,
  SpecialPlate,
  NotificationList,
} from "../../features/types";

// Images
import PinGoogleMap from "../../assets/icons/pin_google-maps.png";

// Utils
import { reformatString, getPlateTypeColor } from "../../utils/commonFunction";
import { fetchClient, combineURL } from "../../utils/fetchClient";
import { PopupMessage } from '../../utils/popupMessage';

// Hooks
import { useMapSearch } from "../../hooks/useOpenStreetMapSearch";

// Modules
import SearchCameras from "../search-cameras/SearchCameras";

// i18n
import { useTranslation } from 'react-i18next';

// Config
import { getUrls } from '../../config/runtimeConfig';

// API
import {
    updateToastMessage,
} from '../../features/realtime-data/realtimeDataSlice';

dayjs.extend(buddhistEra);
dayjs.extend(utc);
dayjs.extend(timezone);

interface RealTimeMonitorProps {

}

const RealTimeMonitor: React.FC<RealTimeMonitorProps> = () => {
  const dispatch = useAppDispatch();
  const { CENTER_FILE_URL, CENTER_API } = getUrls();

  // i18n
  const { t, i18n } = useTranslation();

  const { isOpen } = useHamburger()

  // Data
  const [prevCameraIds, setPrevCameraIds] = useState<Camera[]>([]);
  const [selectedCameraIds, setSelectedCameraIds] = useState<Camera[]>([]);
  const [selectedCameraObjects, setSelectedCameraObjects] = useState<{value: string, label: string}[]>([]);
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [cameraList, setCameraList] = useState<Camera[]>([])
  const [notificationList, setNotificationList] = useState<Map<string, NotificationList[]>>(new Map());

  // State
  const [searchCheckpointsVisible, setSearchCheckpointsVisible] = useState(false);
  const [showScrollbar, setShowScrollbar] = useState(false);
  const [isSearchClicked, setIsSearchClicked] = useState(false); 

  // Options
  const [camerasOption, setCamerasOption] = useState<{value: string, label: string}[]>([]);

  // Ref
  const shownToastsRef = useRef<string[]>([]);
  const initialSearchRanRef = useRef(false);

  const cameraRefreshKey = useSelector((state: RootState) => state.refresh.cameraRefreshKey);

  const sliceDropdown = useSelector(
    (state: RootState) => state.dropdownData
  )

  const { realtimeData, toastNotification } = useSelector(
    (state: RootState) => state.realTimeData
  )

  const sliceSpecialPlate = useSelector(
    (state: RootState) => state.specialPlateData
  )

  const {
    handleSubmit,
  } = useForm();
  
  // Map Search Hook
  const {
    searchSpecialCheckpoint,
    clearSearchPlaces,
    clearPlaceMarkerWithLocation,
  } = useMapSearch(map);

  useEffect(() => {
    return () => {
      setIsSearchClicked(false);
      setSearchCheckpointsVisible(false);
      setSelectedCameraIds([]);
      setSelectedCameraObjects([]);
      setPrevCameraIds([]);
    }
  }, [])

  useEffect(() => {
    setSelectedCameraObjects([{ label: t('dropdown.all'), value: "0" }]);
  }, [i18n.language, i18n.isInitialized])

  useEffect(() => {
    if (cameraList.length > 0) {
      const hasAll = selectedCameraObjects.some((v) => v.value === "0");
      const selectedUids = selectedCameraObjects.map(sc => String(sc.value)); 
      
      const newCameraList = hasAll 
        ? cameraList 
        : cameraList.filter(c => selectedUids.includes(c.camera_uid));
      
      setSelectedCameraIds(newCameraList);
    }
  }, [selectedCameraObjects, cameraList])

  useEffect(() => {
    if (cameraList.length > 0) {
      const options = cameraList.map((row) => ({
        label: row.camera_name,
        value: row.camera_uid,
      }))
      setCamerasOption([{ label: t('dropdown.all'), value: "0" }, ...options])
    }
  }, [cameraList, i18n.language, i18n.isInitialized])

  useEffect(() => {
    fetchData();
  }, [cameraRefreshKey]);

  useEffect(() => {
    if (map && cameraList.length > 0 && !initialSearchRanRef.current) {
      setSelectedCameraObjects([{ label: t('dropdown.all'), value: "0" }]);
      
      // Run the search
      handleSearch(cameraList); 
      initialSearchRanRef.current = true;
    }
  }, [map, cameraList, i18n.language]);

  useEffect(() => {
    if (!toastNotification || toastNotification.length === 0 || !initialSearchRanRef.current) return;

    showToastsAndMapPin();
  }, [toastNotification, prevCameraIds]);

  useEffect(() => { 
    if (!notificationList || !isSearchClicked) return; 

    const runSearch = async () => {
      const allNotificationItems: NotificationList[] = [];

      for (const camera of prevCameraIds) { 
        const listForKey = notificationList.get(camera.camera_uid) || [];

        const sortedList = [...listForKey].sort(
          (a, b) => new Date(b.detectTime).getTime() - new Date(a.detectTime).getTime()
        );

        const isLocationWithLabel = true;
        const defaultColor = "#FDCC0A";

        if (sortedList.length > 0) {
          const enhancedList = sortedList.map(item => ({
            ...item,
            camera_latitude: camera.latitude, 
            camera_longitude: camera.longitude,
            iconColor: item.iconColor || "#DD2025",
            bgColor: item.bgColor || "#DD2025",
            isLocationWithLabel,
            isSpecialLocation: true
          }));

          allNotificationItems.push(...enhancedList); 

        } else {
          const fallbackItem = {
            id: camera.id,
            camera_uid: camera.camera_uid,
            camera_name: camera.camera_name,
            // ... other fallback properties
            iconColor: defaultColor,
            bgColor: defaultColor,
            isLocationWithLabel,
            isSpecialLocation: false,
            detectTime: "",
            camera_latitude: camera.latitude,
            camera_longitude: camera.longitude,
          };

          allNotificationItems.push(fallbackItem as NotificationList); 
        }
      }
        
      if (allNotificationItems.length > 0) {
        await searchSpecialCheckpoint(allNotificationItems); 
      }
    };

    runSearch();
  }, [notificationList, isSearchClicked, prevCameraIds]);

  const fetchData = async () => {
    try {
      const res = await fetchClient<CameraResponse>(combineURL(CENTER_API, "/cameras/get"), {
        method: "GET",
        queryParams: {
          filter: `deleted=0`,
          limit: "5000",
        },
      });

      if (res.success) {
        setCameraList(res.data);
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-fetching-data'), errorMessage, "error");
    }
  };

  const showToastsAndMapPin = async () => {
    const uniqueToastIds: string[] = [];
    
    for (const data of toastNotification) {
      const uniqueKey = `${data.plate}-${data.epoch_end}`;

      // Skip if already shown
      if (shownToastsRef.current.includes(uniqueKey)) continue;

      const cameraMatched = prevCameraIds.find( 
        (camera) => camera.camera_uid === data.camera_uid
      );

      if (!cameraMatched) continue; // Skip if camera is not currently selected/pinned

      shownToastsRef.current.unshift(uniqueKey);
      if (shownToastsRef.current.length > 20) {
        shownToastsRef.current = shownToastsRef.current.slice(0, 20);
      }
      
      uniqueToastIds.push(uniqueKey);

      const updatedData = {
        ...data,
        camera_name: cameraMatched.camera_name || "-",
        camera_latitude: cameraMatched.latitude || "",
        camera_longitude: cameraMatched.longitude || "",
      };

      const newEpochEnd = dayjs(data.epoch_end).format(
        i18n.language === "th" ? "DD-MM-BBBB HH:mm:ss" : "DD-MM-YYYY HH:mm:ss"
      );

      setNotificationList((prev) => {
        const newMap = new Map(prev);
        const key = data.camera_uid;
        const existing = newMap.get(key) || [];

        newMap.set(key, [
          ...existing,
          {
            id: data.id,
            camera_uid: data.camera_uid,
            camera_name: updatedData.camera_name,
            plate_number: data.plate_number,
            plate_prefix: data.plate_prefix,
            region_code: data.region_code,
            iconColor: data.color,
            bgColor: data.pin_background_color,
            textShadow: data.text_shadow,
            isLocationWithLabel: true,
            isSpecialLocation: true,
            detectTime: newEpochEnd,
            camera_latitude: updatedData.camera_latitude,
            camera_longitude: updatedData.camera_longitude,
          },
        ]);
        return newMap;
      });

      // Show toast
      toast(
        ({ closeToast, ...toastProps }) => (
          <RealTimeToastify
            closeToast={closeToast}
            titleName={data.title_name}
            color={data.color}
            alertData={updatedData}
            onDelete={() => {
              setNotificationList((prev) => {
                const newMap = new Map(prev);
                newMap.forEach((list, key) => {
                    const filtered = list.filter(
                    (item) => item.id !== updatedData.id
                    );
                    if (filtered.length > 0) newMap.set(key, filtered);
                    else newMap.delete(key);
                });
                return newMap;
              });
              
              const newData = toastNotification.filter(
                (item) => item.id !== updatedData.id
              );
              dispatch(updateToastMessage(newData));
              closeToast();
            }}
            {...toastProps}
          />
        ),
        {
          toastId: `realtime-toast-${updatedData.id}`,
          containerId: "realtime-toast",
          position: "bottom-left",
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          autoClose: false,
          closeButton: false,
          style: { marginBottom: "5px" },
        }
      );
    }
  };
  
  const handleCameraChange = (ids: string[]) => {
    let newIds: string[];

    if (ids.length === 0 || ids.includes("0")) {
      newIds = ["0"];
    } else {
      newIds = ids;
    }

    const selectedObjects = camerasOption.filter(c => newIds.includes(c.value));
    setSelectedCameraObjects(selectedObjects);
  };

  const handleSearch = async (initialCameras?: Camera[]) => {
    if (!map) return;
    
    const currentSelectedCameras = initialCameras || selectedCameraIds;

    if (currentSelectedCameras.length === 0) {
      clearSearchPlaces();
      setPrevCameraIds([]);
      return;
    }
    
    setIsSearchClicked(true);

    const removedIds = prevCameraIds.filter(prevCam => 
      !currentSelectedCameras.some(newCam => newCam.camera_uid === prevCam.camera_uid)
    );

    removedIds.forEach(camera => {
      clearPlaceMarkerWithLocation({
        lat: parseFloat(camera.latitude),
        lng: parseFloat(camera.longitude),
      }); 
    });

    setPrevCameraIds(currentSelectedCameras);

    const searchData = currentSelectedCameras.map((camera) => {
      const activeAlerts = (notificationList.get(camera.camera_uid) || []).length > 0;
      const defaultColor = "#FDCC0A";
      const alertColor = "#DD2025";

      return {
        id: camera.id,
        camera_uid: camera.camera_uid,
        camera_name: camera.camera_name,
        plate_number: "",
        plate_prefix: "",
        region_code: "",
        iconColor: activeAlerts ? alertColor : defaultColor,
        bgColor: activeAlerts ? alertColor : defaultColor,
        textShadow: "",
        isLocationWithLabel: true,
        isSpecialLocation: activeAlerts,
        detectTime: "",
        camera_latitude: camera.latitude,
        camera_longitude: camera.longitude,
      }
    })

    await searchSpecialCheckpoint(searchData);

    setNotificationList(prev => new Map(prev)); 
  };
  
  const onSubmitSearch = () => {
    handleSearch();
  }

  const handleClearSearch = async () => {
    setSelectedCameraObjects([{ label: t('dropdown.all'), value: "0" }]);
    
    clearSearchPlaces();
    setPrevCameraIds([]);
    setIsSearchClicked(false);
  };

  const handleMapLoad = useCallback((mapInstance: LeafletMap | null) => {
    setMap(mapInstance)
  }, []);

  const handleCamerasSelected = (cameraSelected: {value: string, label: string}[]) => {
    setSelectedCameraObjects(cameraSelected);
  };

  const getProvinceName = (regionCode: string) => {
    const province = sliceDropdown.regions?.data.find(region => region.region_code === regionCode);
    return province?.name_th || "";
  }

  const checkSpecialPlate = (platePrefix: string, plateNumber: string, region: string): SpecialPlate | undefined => {
    const specialPlate = sliceSpecialPlate.specialPlates?.data.find(sp => sp.plate_prefix === platePrefix && sp.plate_number === plateNumber && sp.region_code === region);
    return specialPlate
  };

  return (
    <div id="real-time-monitor" className={`main-content ${isOpen ? "pl-[130px]" : "pl-2.5"} pr-2.5 transition-all duration-500`}>
      <div className='flex flex-col w-full'>
        {/* Header */}
        <Typography variant="h5" color="white" className="font-bold">{t('screen.real-time.title')}</Typography>
        
        {/* Search Filter Part */}
        <form onSubmit={handleSubmit(onSubmitSearch)}>
          <div className='flex mt-3'>
            <div className='flex w-[60vw] space-x-3'>
              <div className='flex flex-col w-full space-y-2'>
                <p className='text-[15px]'>{t('component.checkpoint-2')}</p>
                <div className='w-full items-center justify-center'>
                    <MultiSelectCameras 
                    limitTags={3} 
                    selectedValues={selectedCameraObjects}
                    options={camerasOption} 
                    onChange={handleCameraChange}
                    placeHolder={t('placeholder.checkpoint-2')}
                    />
                </div>
              </div>
              <div className='flex items-end'>
                <button 
                    type="button"
                    className="flex items-center justify-center bg-[#797979] w-[60px] h-10 rounded-[5px] cursor-pointer"
                    onClick={() => setSearchCheckpointsVisible(true)}>
                    <img src={PinGoogleMap} alt="Pin Google map" className='w-[25px] h-[25px]' />
                </button>
              </div>

              <div className='flex items-end gap-2 ml-2'>
                <Button
                    type='submit'
                    variant="contained"
                    className="primary-btn"
                    startIcon={<SearchIcon />}
                    sx={{
                    width: t('button.search-width'),
                    height: "40px",
                    textTransform: 'capitalize',
                    '& .MuiSvgIcon-root': { 
                      fontSize: 26 
                    } 
                    }}
                    >
                    {t('button.search')}
                </Button>
                <Button 
                    variant="outlined" 
                    className="secondary-btn" 
                    onClick={handleClearSearch}
                    sx={{
                    width: t('button.clear-width'),
                    height: "40px",
                    textTransform: 'capitalize',
                    }}
                >
                    {t('button.clear')}
                </Button>
              </div>
            </div>
          </div>
        </form>

        {/* Content Part */}
        <div className='grid grid-cols-[70%_30%] mt-8 border border-[#2B9BED]'>
          {/* Map Part */}
          <div id="realtime-map-container" className='relative h-[75.5vh] w-full'>
            <BaseMap 
              onMapLoad={handleMapLoad}
            />

            {/* Toastify */}
            <div
              onMouseEnter={() => setShowScrollbar(true)}
              onMouseLeave={() => setShowScrollbar(false)}
            >
              <ToastContainer
                containerId="realtime-toast"
                position="bottom-left"
                hideProgressBar
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
                style={{
                    position: 'absolute',
                    bottom: '1px',
                    left: '5px',
                    zIndex: 50,
                    maxHeight: '75vh',
                    overflowX: 'hidden',
                    overflowY: showScrollbar ? 'auto' : 'hidden',
                    scrollbarWidth: showScrollbar ? 'thin' : 'none',
                    msOverflowStyle: showScrollbar ? 'auto' : 'none',
                }}
                className={`${showScrollbar ? 'customScrollbar' : 'hide-scrollbar'}`}
                toastClassName={() =>
                    'bg-black mb-2'
                }
              />
            </div>
          </div>
          {/* Real Time Result */}
          <div className='h-[75.5vh] overflow-y-auto'>
            <AnimatePresence initial={false}>
              {realtimeData.map((data, index) => {
                // Filter results to show only those for currently pinned cameras
                if (prevCameraIds.every((camera) => camera.camera_uid !== data.camera_uid)) return null;
                
                return (
                    <motion.div
                    key={`data_${data.id}_${index}`}
                    className='flex flex-col border border-[#CCD0CF]'
                    >
                    <div className='grid grid-cols-[55%_45%]'>
                      {/* Plate Header */}
                      {
                        (() => {
                          const specialPlateData = checkSpecialPlate(data.plate_prefix, data.plate_number, data.region_code);
                          const { color, feedBackgroundColor  } = getPlateTypeColor(specialPlateData ? specialPlateData.plate_class_id : 0);
                          const provinceName = getProvinceName(data.region_code);
                          return (
                            <p
                                className="text-center"
                                style={{ backgroundColor: feedBackgroundColor, color }}
                            >
                                {`${data.plate}${provinceName && ` ${provinceName}`}`}
                            </p>
                          );
                        })()
                      }

                      <p className='bg-[#383A39] text-center'>
                        {dayjs(data.epoch_end).format(i18n.language === 'th' ? 'DD-MM-BBBB HH:mm:ss' : 'DD-MM-YYYY HH:mm:ss')} | <span className='font-bold'>{`${data.plate_confidence}%`}</span>
                      </p>

                      {/* Checkpoint */}
                      <div className='pl-[30px] col-span-2'>{`${t('text.checkpoint')}: ${cameraList.find(cp => cp.camera_uid === data.camera_uid)?.camera_name || "-"}`}</div>

                      {/* Images */}
                      <div className="grid grid-cols-2">
                        <Image 
                          imageSrc={`${CENTER_FILE_URL}${data.vehicle_image}`}
                          imageAlt='Vehicle'
                          className={`h-[130px] w-full`}
                        />

                        <Image 
                          imageSrc={`${CENTER_FILE_URL}${data.plate_image}`}
                          imageAlt='Plate'
                          className={`h-1/2 w-full`}
                        />
                      </div>

                      {/* Vehicle Info */}
                      <div className="w-full h-full bg-[#161817]">
                        <div className="h-full flex flex-col p-1 pl-3 space-y-2">
                          {
                            (() => {
                                const vehicleColor = sliceDropdown.vehicleColors?.data.find(color => color.color === data.vehicle_color);

                                let newVehicleColor = "-";
                                if (vehicleColor) {
                                  newVehicleColor = i18n.language === "th"
                                  ? vehicleColor.color_th || "-"
                                  : vehicleColor.color_en || "-";
                                } 
                                else {
                                  newVehicleColor = data.vehicle_color || "-";
                                }

                                return (
                                  [
                                  { label: t('feed-data.type'), value: data.vehicle_body_type },
                                  { label: t('feed-data.brand'), value: data.vehicle_make },
                                  { label: t('feed-data.color'), value: newVehicleColor },
                                  { label: t('feed-data.model'), value: data.vehicle_model },
                                  ].map(({ label, value }, idx) => (
                                  <div className="flex" key={idx}>
                                    <span className="w-[55px] text-left">{label}</span>
                                    <span className="mx-1">:</span>
                                    <span className="w-[135px] truncate" title={reformatString(value)}>
                                        {reformatString(value)}
                                    </span>
                                  </div>
                                  ))
                                )
                            })()
                          }
                        </div>
                      </div>
                    </div>
                    </motion.div>
                )
              })
              }
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Dialog */}
      <SearchCameras 
        open={searchCheckpointsVisible}
        selectedCameras={handleCamerasSelected}
        onClose={() => setSearchCheckpointsVisible(false)}
      />
    </div>
  )
}

export default RealTimeMonitor;