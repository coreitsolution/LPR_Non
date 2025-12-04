import React, { useEffect, useCallback, useState, useRef } from 'react'
import { 
  Typography,
  Tabs,
  Tab,
  Box,
  Stack,
  IconButton,
  Button,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { Map as LeafletMap } from 'leaflet';
import { useForm } from "react-hook-form";
import dayjs from "dayjs";

// Icons
import CompareIcon from '@mui/icons-material/Compare';
import { Images, Printer, Pencil, Save, X } from "lucide-react";
import ListIcon from "../../assets/icons/list.png";
import RouteList from "../../assets/icons/route-list.png";
import OwnerIcon from "../../assets/icons/owner.png";
import CautionIcon from "../../assets/icons/caution-mark.png";
import CarIcon from "../../assets/icons/car-front.png";

// Components
import BaseMap, { BaseMapRef } from '../../components/base-map/BaseMap';
import TextBox from '../../components/text-box/TextBox';
import AutoComplete from '../../components/auto-complete/AutoComplete';

// Types
import { 
  SearchPlateCondition, 
  Route,
} from '../../features/search/SearchTypes';
import {
  RealTimeLprDataResponse,
  Option,
  FileMapDataResponse,
  FileData,
} from "../../features/types";

// Hooks
import { useMapSearch } from "../../hooks/useOpenStreetMapSearch";

// Modules
import RouteDetail from '../route-detail/RouteDetail';
import CompareRoutes from '../compare-routes/CompareRoutes';

// i18n
import { useTranslation } from 'react-i18next';

// Config
import { getUrls } from '../../config/runtimeConfig';

// Utils
import { fetchClient, combineURL } from "../../utils/fetchClient";
import { getStringId } from "../../utils/commonFunction";
import { PopupMessage } from '../../utils/popupMessage';

// PDF
import { downloadVehicleRoutePdf } from "./vehicle-route-pdf/VehicleRoutePdf";

interface FormData {
  plate_prefix: string
  plate_number: string
  region_code: string | Option
  vehicle_make: string | Option
  vehicle_color: string | Option
};

interface LocationDetailProps {
  open: boolean;
  selectedIdList: SearchPlateCondition[]
  isCompare: boolean;
  tab?: number;
  province: string;
  district: string;
  subDistrict: string;
  onDataChange: (data: any) => void;
  setSidePageLoading: (loading: boolean) => void;
  setSideProgress: (progress: number) => void;
  setSideProgressMessage: (message: string) => void;
}

const LocationDetail: React.FC<LocationDetailProps> = ({ 
  open, 
  selectedIdList, 
  isCompare,
  tab = 0,
  onDataChange,
  setSidePageLoading,
  setSideProgress,
  setSideProgressMessage,
}) => {
  const { CENTER_FILE_URL, CENTER_API } = getUrls();

  // Ref
  const mapRef = useRef<BaseMapRef>(null);
  
  // Options
  const [provincesOptions, setProvincesOptions] = useState<{ label: string ,value: string }[]>([]);
  const [carColorsOptions, setCarColorsOptions] = useState<{ label: string ,value: string }[]>([]);
  const [carMakesOptions, setCarMakesOptions] = useState<{ label: string ,value: string }[]>([]);
  
  // Data
  const [tabValue, setTabValue] = React.useState(0);
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [plateList, setPlateList] = useState<SearchPlateCondition[]>([]);  
  const [alertText, setAlertText] = useState<string>("");
  const [editData, setEditData] = useState<SearchPlateCondition | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // State
  const [showAlert, setShowAlert] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>("success");
  const [routeDetailVisible, setRouteDetailVisible] = useState(false);
  const [compareRoutesVisible, setCompareRoutesVisible] = useState(false);

  // i18n
  const { t, i18n } = useTranslation();

  const [formData, setFormData] = useState<FormData>({
    plate_prefix: "",
    plate_number: "",
    region_code: "",
    vehicle_make: "",
    vehicle_color: "",
  });

  const {
    drawRoute,
  } = useMapSearch(map)

  const sliceDropdown = useSelector(
    (state: RootState) => state.dropdownData
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors,
  } = useForm();

  useEffect(() => {
    setTabValue(tab);
    clearData();
  }, [tab])

  useEffect(() => {
    return () => {
      clearData();
    }
  }, [open])

  useEffect(() => {
    if (selectedIdList.length > 0 && map && tabValue === 0) {
      setPlateList(selectedIdList);

      const latLonList: { id: string; routeList: { lat: string; lon: string }[] }[] = [];
      for (let i = 0; i < selectedIdList.length; i++) {
        const data = selectedIdList[i].plateRoute
        if (!data) continue;

        const routeList = data[0].routes.map((data: Route) => ({
          lat: data.latitude,
          lon: data.longitude,
        }));

        latLonList.push({ id: selectedIdList[i].id, routeList: routeList});
      };

      if (!latLonList) return;
      drawRoute(latLonList);
    }
  }, [selectedIdList, map, open])

  useEffect(() => {
    if (sliceDropdown.regions && sliceDropdown.regions.data) {
      const options = sliceDropdown.regions.data.map((row) => ({
        label: i18n.language === "th" ? row.name_th : row.name_en,
        value: row.region_code,
      }));
      setProvincesOptions(options);
    }
  }, [sliceDropdown.regions, i18n.language, i18n.isInitialized]);

  useEffect(() => {
    if (sliceDropdown.vehicleColors && sliceDropdown.vehicleColors.data) {
      const options = sliceDropdown.vehicleColors.data.map((row) => ({
        label: i18n.language === "th" ? row.color_th : row.color_en || "",
        value: row.color,
      }));
      setCarColorsOptions(options);
    }
  }, [sliceDropdown.vehicleColors, i18n.language, i18n.isInitialized]);

  useEffect(() => {
    if (sliceDropdown.vehicleMakes && sliceDropdown.vehicleMakes.data) {
      const options = sliceDropdown.vehicleMakes.data.map((row) => ({
        label: row.make_en,
        value: row.make,
      }));
      setCarMakesOptions(options);
    }
  }, [sliceDropdown.vehicleMakes]);
  
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    event.stopPropagation();
    setTabValue(newValue);
    clearData();
  };

  const a11yProps = (index: number) => {
    return {
      id: `tab-${index}`
    };
  };

  const handleMapLoad = useCallback((mapInstance: LeafletMap | null) => {
    setMap(mapInstance)
  }, []);

  const handleClickEditVehicleDetail = (data: SearchPlateCondition) => {
    setEditingId(data.id);
    setFormData(data);
    setEditData(data);
    setValue("id", data.id);
    setValue("plate_prefix", data.plate_prefix);
    setValue("plate_number", data.plate_number);
    setValue("region_code", data.region_code);
    setValue("vehicle_make", data.vehicle_make);
    setValue("vehicle_color", data.vehicle_color);
  };

  const handleCancelClick = () => {
    setEditingId(null);
    clearData();
  }

  const handleTextChange = (key: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setValue(key, value);
  };

  const handleDropdownChange = (key: keyof FormData, value: number) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setValue(key, value);
  };

  const handleDropdownSelection = (
    event: React.SyntheticEvent,
    value: { value: number; label: string } | null,
    key: keyof FormData
  ) => {
    event.preventDefault();
    handleDropdownChange(key, value ? value.value : 0);
  };

  const dataIsChange = (data: any) => {
    const vehicleMakeId = getStringId(data.vehicle_make);
    const vehicleColorId = getStringId(data.vehicle_color);
    const regionCode = getStringId(data.region_code);

    return (
      editData?.plate_prefix !== data.plate_prefix ||
      editData?.plate_number !== data.plate_number ||
      editData?.region_code !== regionCode ||
      editData?.vehicle_make !== vehicleMakeId ||
      editData?.vehicle_color !== vehicleColorId
    )
  }

  const handleClickSaveVehicleDetail = async (data: any) => {
    setEditingId(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      if (!dataIsChange(data)) {
        setAlertText(t('alert.data-not-change'));
        setSaveStatus("warning");
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
          setAlertText("");
        }, 5000)
        return;
      }

      const vehicleMakeId = getStringId(data.vehicle_make);
      const vehicleColorId = getStringId(data.vehicle_color);
      const regionCode = getStringId(data.region_code);

      const body = {
        id: data.id,
        ...(
          (data.plate_prefix !== editData?.plate_prefix || data.plate_number !== editData?.plate_number) && { plate: `${data.plate_prefix}${data.plate_number}` }
        ),
        ...(
          data.plate_prefix !== editData?.plate_prefix && { plate_prefix: data.plate_prefix }
        ),
        ...(
          data.plate_number !== editData?.plate_number && { plate_number: data.plate_number }
        ),
        ...(
          regionCode !== editData?.region_code && { region_code: regionCode }
        ),
        ...(
          vehicleMakeId !== editData?.vehicle_make && { vehicle_make: vehicleMakeId }
        ),
        ...(
          vehicleColorId !== editData?.vehicle_color && { vehicle_color: vehicleColorId }
        ),
      }
      
      const response = await fetchClient<RealTimeLprDataResponse>(combineURL(CENTER_API, "/lpr-data/update"), {
        method: "PATCH",
        signal: controller.signal,
        body: JSON.stringify(body),
      })

      if (response.success) {
        setAlertText(t('alert.save-success'));
        setSaveStatus("success");
        setShowAlert(true);
        updateData(body);
      }
    }
    catch (error) {
      setAlertText(t('alert.save-unsuccess'));
      setSaveStatus("error");
      setShowAlert(true);
    }
    finally {
      clearTimeout(timeoutId);
    }
  };

  const updateData = (data: any) => {
    const updatedData = {
      ...data,
      ...(
        data.vehicle_make && {
          vehicle_make_details: sliceDropdown.vehicleMakes?.data.find((item) => item.make === data.vehicle_make)
        }
      ),
      ...(
        data.vehicle_color && {
          vehicle_color_details: sliceDropdown.vehicleColors?.data.find((item) => item.color === data.vehicle_color)
        }
      ),
      ...(
        data.region_code && {
          region: sliceDropdown.regions?.data.find((item) => item.region_code === data.region_code)
        }
      )
    }

    setPlateList((prev) => prev.map((item) =>
      item.id === updatedData.id
        ? {
            ...item,
            ...(
              (updatedData.plate && { plate: updatedData.plate })
            ),
            ...(
              updatedData.plate_prefix && { plate_prefix: updatedData.plate_prefix }
            ),
            ...(
              updatedData.plate_number && { plate_number: updatedData.plate_number }
            ),
            ...(
              updatedData.region_code && { region_code: updatedData.region_code }
            ),
            ...(
              updatedData.region && { region: updatedData.region }
            ),
            ...(
              updatedData.vehicle_make && { vehicle_make: updatedData.vehicle_make }
            ),
            ...(
              updatedData.vehicle_make_details && { vehicle_make_details: updatedData.vehicle_make_details }
            ),
            ...(
              updatedData.vehicle_color && { vehicle_color: updatedData.vehicle_color }
            ),
            ...(
              updatedData.vehicle_color_details && { vehicle_color_details: updatedData.vehicle_color_details }
            ),
          }
        : item
    ));
    if (onDataChange) {
      onDataChange(updatedData);
    }
  }

  const clearData = () => {
    setEditingId(null);
    setShowAlert(false);
    setAlertText("");
    setEditData(null);
    setSaveStatus("success");
    setValue("id", 0);
    setValue("plate_prefix", "");
    setValue("plate_number", "");
    setValue("region_code", "");
    setValue("vehicle_make","");
    setValue("vehicle_color", "");
    setFormData({
      plate_prefix: "",
      plate_number: "",
      region_code: "",
      vehicle_make: "",
      vehicle_color: "",
    });
    clearErrors();
  }

  const exportToPdf = async () => {
    try {
      setSideProgressMessage("");
      setSidePageLoading(true);

      setSideProgress(10);
      setSideProgressMessage(t('progress-bar.map-capture-preparing'));

      const mapCapture = await handleCapture() ?? [];

      setSideProgress(50);
      setSideProgressMessage(t('progress-bar.pdf-file-preparing'));

      const updateData = plateList.map((item) => {
        const plateType = sliceDropdown.plateTypes?.data.find(
          (pt) => pt.id === item.special_plate_id
        );

        return {
          ...item,
          isBlackList:
            plateType?.title_en?.trim().toLowerCase() === "blacklist" || false,
          special_plate_name: i18n.language === "th" ? plateType?.title_th ?? "" : plateType?.title_en ?? "",
        };
      });

      const date = dayjs().format(i18n.language === "th" ? "BBBB-MM-DD" : "YYYY-MM-DD");
      const pdfName = `${t('file.search-with-condition')}_${date}.pdf`;
      await downloadVehicleRoutePdf(updateData, pdfName, t, i18n, CENTER_FILE_URL, mapCapture);

      setSideProgress(100);
      setSideProgressMessage(t('progress-bar.file-download-complete'));

      await deleteMapCapture(mapCapture);

      setSidePageLoading(false);
    }
    catch (error) {
      setSidePageLoading(false);
      setSideProgressMessage("");
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-export-data'), errorMessage, "error");
    }
  }

  const handleCapture = async () => {
    try {
      const blob = await mapRef.current?.captureMap();
      if (!blob) return;

      const formData = new FormData();
      formData.append("files", blob);

      const response = await fetchClient<FileMapDataResponse>(combineURL(CENTER_API, "/upload/"), {
        method: "POST",
        isFormData: true,
        body: formData,
      })

      return response.data;
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new Error(errorMessage);
    }
  };

  const deleteMapCapture = async (mapCapture: FileData[]) => {
    try {
      if (mapCapture.length === 0) return;

      const body = JSON.stringify({
        urls: [mapCapture[0].url]
      })

      await fetchClient<FileMapDataResponse>(combineURL(CENTER_API, `/upload/remove`), {
        method: "POST",
        body,
      })
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new Error(errorMessage);
    }
  }

  return (
    <div id='location-detail' className={`fixed right-0 pt-[70px] top-0 h-screen w-[27%] ${open ? "!right-0 block" : "right-[-100%]"} transition-all duration-500`}>
      <div className='flex flex-col h-full'>
        {/* Header */}
        <div className='flex justify-between px-2.5 py-2 bg-[#11212D]'>
          <Typography variant="h6" color="white" className="font-bold">{t('screen.route-detail.title')}</Typography>
          <IconButton 
            className="tertiary-btn"
            sx={{
              borderRadius: "4px !important",
            }}
            onClick={() => setRouteDetailVisible(true)}
          >
            <img src={ListIcon} alt='List Icon' className='w-5 h-5' />
          </IconButton>
        </div>
        {/* Button Part */}
        <div className='w-full h-full'>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleChange} 
              className="w-full h-full bg-[#797979]"
              sx={{
                "& .MuiTabs-indicator": {
                  backgroundColor: "transparent !important",
                },
                "& .MuiTab-root": {
                  color: "black",
                },
                "& .Mui-selected": {
                  color: "white !important",
                  backgroundColor: "#2B9BED"
                },
              }}
            >
              <Tab 
                label={
                  <Stack 
                    direction="row" 
                    alignItems="center" 
                    spacing={0.5}
                    sx={{
                      textTransform: "capitalize",
                    }}
                  >
                    <Images size={19} />
                    <span>{t('tab.route-map')}</span>
                  </Stack>
                }
                {...a11yProps(0)}
                sx={{ flex: 1, padding: "12px 5px" }}
              />
              <Tab 
                label={
                  <Stack 
                    direction="row" 
                    alignItems="center" 
                    spacing={0.5}
                    sx={{
                      textTransform: "capitalize",
                    }}
                  >
                    <Images size={19} />
                    <span>{t('tab.car-data')}</span>
                  </Stack>
                }
                {...a11yProps(1)}
                sx={{ flex: 1, padding: "12px 5px" }}
              />
              <Tab 
                label={
                  <Stack 
                    direction="row" 
                    alignItems="center" 
                    spacing={0.5}
                    sx={{
                      textTransform: "capitalize",
                    }}
                  >
                    <Images size={19} />
                    <span>{t('tab.car-route')}</span>
                  </Stack>
                }
                {...a11yProps(2)}
                sx={{ flex: 1, padding: "12px 5px" }}
              />
            </Tabs>
          </Box>
          {/* Route Map */}
          {
            tabValue === 0 && (
              <>
                {/* Map Part */}
                <div className='relative h-[280px] w-full'>
                  <BaseMap 
                    ref={mapRef}
                    onMapLoad={handleMapLoad}
                    zoomControl={false}
                    width='519px'
                    height='280px'
                  />
                </div>
                {/* Vehicle Detail Part */}
                <div className='flex flex-col relative p-2 bg-[#384043] h-[53vh] overflow-y-auto space-y-2'>
                  {
                    plateList.map((data, index) => (
                      <div key={`vehicle_detail_${index + 1}`}>
                        {isCompare && (
                          <div className='flex py-1 space-x-2'>
                            <img src={CarIcon} alt={`Car Icon ${index + 1}`} className='w-[22px] h-[22px]' />
                            <p className='text-white text-[16px]'>{`${t('text.car-no')} ${index + 1}`}</p>
                          </div>
                        )}
                        
                        {/* Image */}
                        <div className='flex items-center justify-center h-40 bg-black border-b border-[#384043]'>
                          <div className='h-40 w-[60%] relative'>
                            <img src={`${CENTER_FILE_URL}${data.vehicle_image}`} alt='Vehicle Image' className='h-full w-full' />
                            <img src={`${CENTER_FILE_URL}${data.plate_image}`} alt='Plate Image' className='h-[30%] w-[100px] absolute bottom-0 left-0' />
                          </div>
                        </div>
                        
                        {/* Plate Detail */}
                        <div className='bg-black py-2 px-6 text-center'>{`${data.plate}${data.region ? i18n.language === "th" ? ` ${data.region.name_th}` : ` ${data.region.name_en}` : ""}`}</div>
                        
                        {/* Route Detail */}
                        <div className='flex flex-col mt-2.5'>
                          <div className='flex items-center justify-start space-x-1'>
                            <img src={RouteList} alt='Route Icon' className='w-[30px] h-[30px]' />
                            <label>{t('text.travel-order')}</label>
                          </div>
                          <div className='h-[170px] overflow-y-auto'>
                            <table className='w-full h-full'>
                              <thead className='bg-[#242727] h-[35px] sticky top-0'>
                                <tr className='text-[16px]'>
                                  <td className='text-center'>{t('table.column.checkpoint')}</td>
                                  <td className='w-[40%] text-center'>{t('table.column.time')}</td>
                                </tr>
                              </thead>
                              <tbody>
                                {data.plateRoute && data.plateRoute[0].routes.map((route, index) => (
                                  <tr key={`data_${index}`} className='h-10 text-[15px] border-b border-[#ADADAD] border-dashed'>
                                    <td className='pl-3 text-start bg-[#393B3A]'>{route.camera_name}</td>
                                    <td className='text-center bg-[#48494B]'>{route.epoch_end}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                  
                  {/* Button Container */}
                  <div className='flex justify-end gap-2 py-2 bg-[#384043]'>
                    <Button
                      variant='contained'
                      className='tertiary-btn'
                      startIcon={<CompareIcon />}
                      sx={{ 
                        width: t('button.compare-width'), 
                        height: '40px', 
                        textTransform: "capitalize",
                        '& .MuiSvgIcon-root': { 
                          fontSize: 20 
                        } 
                      }}
                      onClick={() => setCompareRoutesVisible(true)}
                      disabled={plateList.length < 2}
                    >
                      {t('button.compare')}
                    </Button>
                    
                    <Button
                      variant='contained'
                      className='tertiary-btn'
                      startIcon={<Printer />}
                      sx={{ 
                        width: '140px',
                        height: '40px', 
                        textTransform: "capitalize",
                        '& .MuiSvgIcon-root': { 
                          fontSize: 20 
                        } 
                      }}
                      onClick={exportToPdf}
                    >
                      {t('button.print')}
                    </Button>
                  </div>
                </div>
              </>
            )
          }
          {/* Vehicle Data */}
          {
            tabValue === 1 && (
              <>
                {/* Vehicle Detail Part */}
                <div className='flex flex-col bg-[#384043] h-full'>
                  <div className='h-[81vh] overflow-y-auto px-2 pt-2 space-y-2'>
                    {
                      plateList.map((data, index) => (
                        <div key={`vehicle_detail_${index + 1}`}>
                          {isCompare && (
                            <div className='flex py-1 space-x-2'>
                              <img src={CarIcon} alt={`Car Icon ${index + 1}`} className='w-[22px] h-[22px]' />
                              <p className='text-white text-[16px]'>{`${t('text.car-no')} ${index + 1}`}</p>
                            </div>
                          )}

                          {/* Image */}
                          <div className='flex items-center justify-center h-40 bg-black border-b border-[#384043]'>
                            <div className='h-40 w-[60%] relative'>
                              <img src={`${CENTER_FILE_URL}${data.vehicle_image}`} alt="Vehicle Image" className='h-full w-full' />
                              <img src={`${CENTER_FILE_URL}${data.plate_image}`} alt="Plate Image" className='h-[30%] w-[100px] absolute bottom-0 left-0' />
                            </div>
                          </div>
                          {/* Plate Detail */}
                          <div className='bg-black py-2 px-6 text-center'>
                            {`${data.plate}${data.region ? i18n.language === "th" ? ` ${data.region.name_th}` : ` ${data.region.name_en}` : ""}`}
                          </div>

                          {/* Alert */}
                          {
                            (() => {
                              let icon = "";
                              let bgColor = "";
                              switch (saveStatus) {
                                case "success":
                                  icon = "/svg/correct-icon.svg";
                                  bgColor = "bg-[#F6FFED]";
                                  break;
                                case "warning":
                                  icon = "/svg/warning-icon.svg";
                                  bgColor = "bg-[#FFFDF7]";
                                  break;
                                default:
                                  icon = "/svg/wrong-icon.svg";
                                  bgColor = "bg-red-500";
                                  break;
                              }

                              return (
                                showAlert && (
                                  <div className={`${bgColor} p-2 border border-[#2B9BED] flex justify-between`}>
                                    <div className='flex items-center justify-center space-x-3'>
                                      <img src={icon} alt="Icon" className='w-5 h-5' />
                                      <p className='text-[16px] text-[#9E9E9E]'>{alertText}</p>
                                    </div>
                                    <IconButton 
                                      onClick={() => setShowAlert(false)}
                                    >
                                      <X size={20} color='#9E9E9E' />
                                    </IconButton>
                                  </div>
                                )
                              )
                            })()
                          }

                          {/* Vehicle Detail */}
                          <div className='flex flex-col mt-2.5'>
                            <div className='flex justify-between'>
                              <div className='flex items-center justify-start space-x-1'>
                                <img src={RouteList} alt='Vehicle Detail Icon' className='w-[30px] h-[30px]' />
                                <label>{t('text.vehicle-data')}</label>
                              </div>
                              <div>
                                <IconButton
                                  onClick={() => handleClickEditVehicleDetail(data)}
                                >
                                  <Pencil size={20} color='white' />
                                </IconButton>
                              </div>
                            </div>
                            <div className='text-[15px]'>
                              {
                                editingId === data.id ?
                                (
                                  <form onSubmit={handleSubmit(handleClickSaveVehicleDetail)} className='grid grid-cols-[30%_auto]'>
                                    <div className='bg-[#393B3A] border-b border-[#ADADAD] border-dashed p-4'>
                                      {t('text.vehicle-plate')}
                                    </div>
                                    <div className='bg-[#48494B] border-b border-[#ADADAD] border-dashed p-4'>
                                      <div className='flex flex-col'>
                                        <TextBox
                                          sx={{ fontSize: "15px" }}
                                          id="plate-character"
                                          label=""
                                          value={formData.plate_prefix}
                                          onChange={(event) =>
                                            handleTextChange("plate_prefix", event.target.value)
                                          }
                                          register={register("plate_prefix", { 
                                            required: true,
                                          })}
                                          error={!!errors.plate_prefix}
                                        />

                                        <TextBox
                                          sx={{ marginTop: "10px", fontSize: "15px" }}
                                          id="plate-number"
                                          label=""
                                          value={formData.plate_number}
                                          onChange={(event) =>
                                            handleTextChange("plate_number", event.target.value)
                                          }
                                          register={register("plate_number", { 
                                            required: true,
                                          })}
                                          error={!!errors.plate_number}
                                        />

                                        <AutoComplete 
                                          id="province-select"
                                          sx={{ marginTop: "10px"}}
                                          value={formData.region_code}
                                          onChange={(event, value) => handleDropdownSelection(event, value, "region_code")}
                                          options={provincesOptions}
                                          label=""
                                          placeholder="กรุณาเลือกจังหวัด"
                                          labelFontSize="15px"
                                          register={register("region_code", { 
                                            required: true,
                                          })}
                                          error={!!errors.region_code}
                                        />
                                      </div>
                                    </div>

                                    <div className='bg-[#393B3A] border-b border-[#ADADAD] border-dashed p-4'>
                                      {t('text.brand')}
                                    </div>
                                    <div className='bg-[#48494B] border-b border-[#ADADAD] border-dashed p-4'>
                                      <div className='flex flex-col'>
                                        <AutoComplete 
                                          id="car-brand-select"
                                          value={formData.vehicle_make}
                                          onChange={(event, value) => handleDropdownSelection(event, value, "vehicle_make")}
                                          options={carMakesOptions}
                                          label=""
                                          placeholder={t('placeholder.car-brand')}
                                          labelFontSize="15px"
                                          register={register("vehicle_make", { 
                                            required: true,
                                          })}
                                          error={!!errors.vehicle_make}
                                        />
                                      </div>
                                    </div>

                                    <div className='bg-[#393B3A] border-b border-[#ADADAD] border-dashed p-4'>
                                      {t('text.color')}
                                    </div>
                                    <div className='bg-[#48494B] border-b border-[#ADADAD] border-dashed p-4'>
                                      <div className='flex flex-col'>
                                        <AutoComplete 
                                          id="car-color-select"
                                          value={formData.vehicle_color}
                                          onChange={(event, value) => handleDropdownSelection(event, value, "vehicle_color")}
                                          options={carColorsOptions}
                                          label=""
                                          placeholder={t('placeholder.car-color')}
                                          labelFontSize="15px"
                                          register={register("vehicle_color", { 
                                            required: true,
                                          })}
                                          error={!!errors.vehicle_color}
                                        />
                                      </div>
                                    </div>
                                    <div className='col-span-2 flex items-center justify-center mt-3 gap-3'>
                                      <Button
                                        type='submit'
                                        variant="contained"
                                        className="primary-btn"
                                        startIcon={ <Save />}
                                        sx={{
                                          width: "100px",
                                          height: "40px",
                                          textTransform: "capitalize",
                                          '& .MuiSvgIcon-root': { 
                                            fontSize: 20
                                          } 
                                        }}
                                      >
                                        {t('button.save')}
                                      </Button>

                                      <Button
                                        variant="text"
                                        className="cancel-btn"
                                        sx={{
                                          width: "100px",
                                          height: "40px",
                                          textTransform: "capitalize",
                                          '& .MuiSvgIcon-root': { 
                                            fontSize: 20
                                          } 
                                        }}
                                        onClick={handleCancelClick}
                                      >
                                        {t('button.cancel')}
                                      </Button>
                                    </div>
                                  </form>
                                ) : 
                                (
                                  <div className='grid grid-cols-[30%_auto]'>
                                    <div className='bg-[#393B3A] border-b border-[#ADADAD] border-dashed p-4'>
                                      {t('text.vehicle-plate')}
                                    </div>
                                    <div className='bg-[#48494B] border-b border-[#ADADAD] border-dashed p-4'>
                                      {`${data.plate}${data.region ? i18n.language === "th" ? ` ${data.region.name_th}` : ` ${data.region.name_en}` : ""}`}
                                    </div>

                                    <div className='bg-[#393B3A] border-b border-[#ADADAD] border-dashed p-4'>
                                      {t('text.brand')}
                                    </div>
                                    <div className='bg-[#48494B] border-b border-[#ADADAD] border-dashed p-4'>
                                      {data.vehicle_make_details && i18n.language === "th" ? data.vehicle_make_details.make_th || "-" : data.vehicle_make_details.make_en || "-"}
                                    </div>

                                    <div className='bg-[#393B3A] border-b border-[#ADADAD] border-dashed p-4'>
                                      {t('text.color')}
                                    </div>
                                    <div className='bg-[#48494B] border-b border-[#ADADAD] border-dashed p-4'>
                                      {data.vehicle_color_details && i18n.language === "th" ? data.vehicle_color_details.color_th || "-" : data.vehicle_color_details.color_en || "-"}
                                    </div>
                                  </div>
                                )
                              }
                            </div>
                          </div>
                        </div>
                      ))
                    }
                    <div className='flex justify-end gap-2 py-2'>
                      <Button
                        variant="contained"
                        className="tertiary-btn"
                        startIcon={<Printer />}
                        sx={{
                          width: "140px",
                          height: "40px",
                          textTransform: "capitalize",
                          '& .MuiSvgIcon-root': { 
                            fontSize: 20
                          },
                          ":disabled": {
                            cursor: "not-allowed"
                          }
                        }}
                        // disabled={isEditVehicleDetail}
                        disabled={true}
                      >
                        {t('button.print')}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )
          }
          {/* Vehicle Route */}
          {
            tabValue === 2 && (
              <>
                {/* Vehicle Detail Part */}
                <div className='flex flex-col bg-[#384043] h-full'>
                  <div className='h-[81vh] overflow-y-auto px-2 pt-2 space-y-2'>
                    {
                      plateList.map((data, index) => (
                        <div key={`vehicle_detail_${index}`}>
                          {isCompare && (
                            <div className='flex py-1 space-x-2'>
                              <img src={CarIcon} alt={`Car Icon ${index + 1}`} className='w-[22px] h-[22px]' />
                              <p className='text-white text-[16px]'>{`${t('text.car-no')} ${index + 1}`}</p>
                            </div>
                          )}

                          {/* Image */}
                          <div className='flex items-center justify-center h-[180px] bg-black border-b border-[#384043]'>
                            <div className='h-[180px] py-2 w-[60%] relative'>
                              <img src={`${CENTER_FILE_URL}${data.vehicle_image}`} alt="Vehicle Image" className='h-full w-full' />
                              <img src={`${CENTER_FILE_URL}${data.plate_image}`} alt="Plate Image" className='h-[30%] w-[100px] absolute bottom-2 left-0' />
                            </div>
                          </div>
                          <div className='flex flex-col mt-2.5 space-y-3'>
                            {/* Vehicle Detail */}
                            <div>
                              <div className='flex items-center justify-start space-x-1'>
                                <img src={RouteList} alt='Vehicle Detail Icon' className='w-[30px] h-[30px]' />
                                <label>{t('text.vehicle-data')}</label>
                              </div>
                              <div className='grid grid-cols-[30%_auto] text-[14px]'>
                                <div className='bg-[#393B3A] border-b border-[#ADADAD] border-dashed p-2'>
                                  {t('text.vehicle-plate')}
                                </div>
                                <div className='bg-[#48494B] border-b border-[#ADADAD] border-dashed p-2'>
                                  {`${data.plate}${data.region ? i18n.language === "th" ? ` ${data.region.name_th}` : ` ${data.region.name_en}` : ""}`}
                                </div>

                                <div className='bg-[#393B3A] border-b border-[#ADADAD] border-dashed p-2'>
                                  {t('text.brand')}
                                </div>
                                <div className='bg-[#48494B] border-b border-[#ADADAD] border-dashed p-2'>
                                  {data.vehicle_make_details && i18n.language === "th" ? data.vehicle_make_details.make_th || "-" : data.vehicle_make_details.make_en || "-"}
                                </div>

                                <div className='bg-[#393B3A] border-b border-[#ADADAD] border-dashed p-2'>
                                  {t('text.color')}
                                </div>
                                <div className='bg-[#48494B] border-b border-[#ADADAD] border-dashed p-2'>
                                  {data.vehicle_color_details && i18n.language === "th" ? data.vehicle_color_details.color_th || "-" : data.vehicle_color_details.color_en || "-"}
                                </div>

                                <div className='bg-[#393B3A] border-b border-[#ADADAD] border-dashed p-2'>
                                  {t('text.model')}
                                </div>
                                <div className='bg-[#48494B] border-b border-[#ADADAD] border-dashed p-2'>
                                  {data.vehicle_model_details && i18n.language === "th" ? data.vehicle_model_details.model_th || "-" : data.vehicle_model_details.model_en || "-"}
                                </div>

                                <div className='bg-[#393B3A] border-b border-[#ADADAD] border-dashed p-2'>
                                  {t('text.plate-group')}
                                </div>
                                <div className='bg-[#48494B] border-b border-[#ADADAD] border-dashed p-2'>
                                  {data.vehicle_body_type_details && i18n.language === "th" ? data.vehicle_body_type_details.body_type_th || "-" : data.vehicle_body_type_details.body_type_en || "-"}
                                </div>
                              </div>
                            </div>
                            {/* Owner Detail */}
                            <div>
                              <div className='flex items-center justify-start space-x-1'>
                                <img src={OwnerIcon} alt='Owner Icon' className='w-[30px] h-[30px]' />
                                <label>{t('text.owner-info')}</label>
                              </div>
                              <div className='grid grid-cols-[30%_auto] text-[14px]'>
                                <div className='bg-[#393B3A] border-b border-[#ADADAD] border-dashed p-2'>
                                  {t('text.owner-name')}
                                </div>
                                <div className='bg-[#48494B] border-b border-[#ADADAD] border-dashed p-2'>
                                  {data.ownerName || "-"}
                                </div>

                                <div className='bg-[#393B3A] border-b border-[#ADADAD] border-dashed p-2'>
                                  {t('text.owner-pid')}
                                </div>
                                <div className='bg-[#48494B] border-b border-[#ADADAD] border-dashed p-2'>
                                  {data.ownerNationalId || "-"}
                                </div>

                                <div className='bg-[#393B3A] border-b border-[#ADADAD] border-dashed p-2'>
                                  {t('text.owner-address')}
                                </div>
                                <div className='bg-[#48494B] border-b border-[#ADADAD] border-dashed p-2'>
                                  {data.ownerAddress || "-"}
                                </div>
                              </div>
                            </div>
                            {/* Ownership Detail */}
                            <div>
                              <div className='flex items-center justify-start space-x-1'>
                                <img src={OwnerIcon} alt='Ownership Icon' className='w-[30px] h-[30px]' />
                                <label>{t('text.ownership-info')}</label>
                              </div>
                              <div className='grid grid-cols-[30%_auto] text-[14px]'>
                                <div className='bg-[#393B3A] border-b border-[#ADADAD] border-dashed p-2'>
                                  {t('text.ownership-name')}
                                </div>
                                <div className='bg-[#48494B] border-b border-[#ADADAD] border-dashed p-2'>
                                  {data.ownershipName || "-"}
                                </div>

                                <div className='bg-[#393B3A] border-b border-[#ADADAD] border-dashed p-2'>
                                  {t('text.ownership-pid')}
                                </div>
                                <div className='bg-[#48494B] border-b border-[#ADADAD] border-dashed p-2'>
                                  {data.ownershipNationalId || "-"}
                                </div>

                                <div className='bg-[#393B3A] border-b border-[#ADADAD] border-dashed p-2'>
                                  {t('text.ownership-address')}
                                </div>
                                <div className='bg-[#48494B] border-b border-[#ADADAD] border-dashed p-2'>
                                  {data.ownershipAddress || "-"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    }
                    {/* Caution */}
                    {
                      i18n.language === "th" && (
                        <div className='flex flex-col items-center justify-center'>
                          <div className='flex items-center justify-center space-x-5'>
                            <img src={CautionIcon} alt="Caution Icon" className='w-[30px] h-[30px]' />
                            <label className='text-[#9F0C0C] text-xl font-bold underline'>ห้ามนำข้อมูลและรูปภาพ</label>
                            <img src={CautionIcon} alt="Caution Icon" className='w-[30px] h-[30px]' />
                          </div>
                          <div className='flex flex-col items-center justify-center text-[13px]'>
                            <p>ภายในเว็บไซต์ไปเผยแพร่ เนื่องจากเป็นข้อมูลความลับของทางราชการ</p>
                            <p>ไม่อนุญาตให้นำข้อมูลดังกล่าวไปเผยแพร่</p>
                            <p>ในทุกช่องทาง ก่อนได้รับอนุญาต</p>
                            <p className='underline'>*หากผู้ใดนำข้อมูลไปเผยแพร่และก่อให้เกิดความเสียหาย</p>
                            <p>แก่ทางราชการหรือก่อให้เกิดความเสียหายกับบุคคลอื่น อาจเข้าข่ายเป็นความผิดตาม</p>
                            <p>พ.ร.บ.คอมพิวเตอร์ เจ้าของรหัสจะถูกตัดสิทธิ์การใช้งานระบบ LPR และถูกดำเนินการทางวินัย *</p>
                          </div>
                        </div>
                      )
                    }
                    {
                      i18n.language === "en" && (
                        <div className='flex flex-col items-center justify-center'>
                          <div className='flex items-center justify-center space-x-5'>
                            <img src={CautionIcon} alt="Caution Icon" className='w-[30px] h-[30px]' />
                            <label className='text-[#9F0C0C] text-xl font-bold underline'>Do not use information and images</label>
                            <img src={CautionIcon} alt="Caution Icon" className='w-[30px] h-[30px]' />
                          </div>
                          <div className='flex flex-col items-center justify-center text-[13px]'>
                            <p>It is not published on the website because it is confidential government information.</p>
                            <p>Dissemination of such information is not permitted.</p>
                            <p>In all channels, before permission is granted</p>
                            <p className='underline'>*If anyone disseminates the information and causes damage</p>
                            <p>To the government or causing damage to other persons</p>
                            <p>may be considered an offense under</p>
                            <p>Computer Crime Act: The owner of the code will be disqualified</p>
                            <p>from using the LPR system and will face disciplinary action. *</p>
                          </div>
                        </div>
                      )
                    }
                    {
                      i18n.language === "la" && (
                        <div className='flex flex-col items-center justify-center'>
                          <div className='flex items-center justify-center space-x-5'>
                            <img src={CautionIcon} alt="Caution Icon" className='w-[30px] h-[30px]' />
                            <label className='text-[#9F0C0C] text-xl font-bold underline'>
                              ຫ້າມນໍາຂໍ້ມູນ ແລະ ຮູບພາບໄປໃຊ້
                            </label>
                            <img src={CautionIcon} alt="Caution Icon" className='w-[30px] h-[30px]' />
                          </div>
                          <div className='flex flex-col items-center justify-center text-[13px]'>
                            <p>ຂໍ້ມູນນີ້ບໍ່ໄດ້ເຜີຍແຜ່ຢູ່ໃນເວັບໄຊດ້ວຍເປັນຂໍ້ມູນລັບຂອງລັດຖະບານ</p>
                            <p>ການເຜີຍແຜ່ຂໍ້ມູນນີ້ບໍ່ໄດ້ຮັບອະນຸຍາດ</p>
                            <p>ທຸກຊ່ອງທາງ ກ່ອນທີ່ຈະໄດ້ຮັບອະນຸຍາດ</p>
                            <p className='underline'>*ຖ້າມີຜູ້ໃດເຜີຍແຜ່ຂໍ້ມູນແລະເຮັດໃຫ້ເກີດຄວາມເສຍຫາຍ</p>
                            <p>ໃຫ້ແກ່ລັດຖະບານ ຫຼືເຮັດໃຫ້ຄົນອື່ນເສຍຫາຍ</p>
                            <p>ອາດຈະຖືວ່າເປັນຄວາມຜິດຕາມ</p>
                            <p>ພາລະບັດຄວາມຜິດທາງຄອມພິວເຕີ: ເຈົ້າຂອງລະຫັດຈະຖືກຕັດສິນບໍ່ໃຫ້ໃຊ້ລະບົບ</p>
                            <p>LPR ແລະຖືກລົງໂທດຕາມລະບຽບ *</p>
                          </div>
                        </div>

                      )
                    }
                    <div className='flex justify-end gap-2 py-2'>
                      {
                        isCompare && (
                          <Button
                            variant='contained'
                            className='tertiary-btn'
                            startIcon={<CompareIcon />}
                            sx={{ 
                              width: t('button.compare-width'), 
                              height: '40px', 
                              textTransform: "capitalize",
                              '& .MuiSvgIcon-root': { 
                                fontSize: 20 
                              } 
                            }}
                            onClick={() => setCompareRoutesVisible(true)}
                            disabled={plateList.length < 2}
                          >
                            {t('button.compare')}
                          </Button>
                        )
                      }
                      <Button
                        variant="contained"
                        className="tertiary-btn"
                        startIcon={<Printer />}
                        sx={{
                          width: "140px",
                          height: "40px",
                          textTransform: "capitalize",
                          '& .MuiSvgIcon-root': { 
                            fontSize: 20
                          } 
                        }}
                        disabled={true}
                      >
                        {t('button.print')}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )
          }
        </div>
      </div>

      {/* Dialog */}
      <RouteDetail 
        open={routeDetailVisible}
        onClose={() => setRouteDetailVisible(false)}
        plateDetailList={ selectedIdList }
      />

      <CompareRoutes 
        open={compareRoutesVisible}
        onClose={() => setCompareRoutesVisible(false)}
        plateDetailList={ selectedIdList }
      />
    </div>
  )
}

export default LocationDetail;