import React, { useState, useEffect, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
} from "@mui/material";
import { useSelector } from "react-redux"
import { RootState } from "../../app/store"
import { Map as LeafletMap } from 'leaflet';

// Types
import {
  Camera,
  CameraResponse,
} from "../../features/types";
import { 
  Districts, 
  SubDistricts,
  DistrictsResponse,
  SubDistrictsResponse,
} from "../../features/dropdown/dropdownTypes";

// Components
import AutoComplete from "../../components/auto-complete/AutoComplete"
import MultiSelectCameras from '../../components/multi-select/MultiSelectCameras';
import BaseMap from '../../components/base-map/BaseMap';
import MultiSelect from '../../components/multi-select/MultiSelect';
import Loading from "../../components/loading/Loading";

// Icons
import { MousePointerClick } from "lucide-react"

// Hooks
import { useMapSearch } from "../../hooks/useOpenStreetMapSearch";

// Config
import { getUrls } from '../../config/runtimeConfig';

// Utils
import { fetchClient, combineURL } from "../../utils/fetchClient"

// i18n
import { useTranslation } from 'react-i18next';

interface FormData {
  station_id: number
  province_id: number
  district_id: number
}

interface SearchCamerasProps {
  open: boolean;
  selectedCameras: (cameraSelected: {value: any, label: string}[]) => void;
  onClose: () => void;
}

const SearchCameras: React.FC<SearchCamerasProps> = ({open, onClose, selectedCameras}) => {
  const { CENTER_API } = getUrls();

  // State
  const [isLoading, setIsLoading] = useState(false);

  // Options
  const [provincesOptions, setProvincesOptions] = useState<{ label: string ,value: number }[]>([]);
  const [districtsOptions, setDistrictsOptions] = useState<{ label: string ,value: number }[]>([]);
  const [subDistrictsOptions, setSubDistrictsOptions] = useState<{ label: string ,value: number }[]>([]);
  const [camerasOption, setCamerasOption] = useState<{ label: string ,value: any }[]>([]);
  
  // Data
  const [map, setMap] = useState<LeafletMap | null>(null)
  const [selectedCameraObjects, setSelectedCameraObjects] = useState<{value: any, label: string}[]>([]);
  const [districtsList, setDistrictsList] = useState<Districts[]>([]);
  const [subDistrictsList, setSubDistrictsList] = useState<SubDistricts[]>([]);
  const [cameraList, setCameraList] = useState<Camera[]>([]);
  const [selectedSubDistrictObjects, setSelectedSubDistrictObjects] = useState<{value: any, label: string}[]>([]);

  // i18n
  const { t, i18n } = useTranslation();

  const sliceDropdown = useSelector(
    (state: RootState) => state.dropdownData
  )
  
  const [formData, setFormData] = useState<FormData>({
    station_id: 0,
    province_id: 0,
    district_id: 0,
  })

  const {
    searchCameras,
    clearSearchPlaces,
    isSearching,
  } = useMapSearch(map)

  useEffect(() => {
    return () => {
      clearData();
    }
  }, [])

  useEffect(() => {
    if (open) {
      setDistrictsOptions([{ label: t('dropdown.all'), value: 0 }]);
      setSubDistrictsOptions([{ label: t('dropdown.all'), value: 0 }]);
      setSelectedSubDistrictObjects([{ label: t('dropdown.all'), value: 0 }]);
      setSelectedCameraObjects([{ label: t('dropdown.all'), value: "0" }]);
    }
  }, [i18n.language, open, i18n.isInitialized])

  useEffect(() => {
    if (sliceDropdown.provinces && sliceDropdown.provinces.data) {
      const options = sliceDropdown.provinces.data.map((row) => ({
        label: i18n.language === "th" ? row.name_th : row.name_en,
        value: row.id,
      }));
      setProvincesOptions([{ label: t('dropdown.all'), value: 0 }, ...options]);
    }
  }, [sliceDropdown.provinces, i18n.language, i18n.isInitialized]);

  useEffect(() => {
    if (districtsList) {
      const options = districtsList.map((row) => ({
        label: i18n.language === "th" ? row.name_th : row.name_en,
        value: row.id,
      }))
      setDistrictsOptions([{ label: t('dropdown.all'), value: 0 }, ...options])
    }
  }, [districtsList, i18n.language, i18n.isInitialized])

  useEffect(() => {
    if (subDistrictsList) {
      const options = subDistrictsList.map((row) => ({
        label: row.name_th,
        value: row.id,
      }))
      setSubDistrictsOptions([{ label: t('dropdown.all'), value: 0 }, ...options])
    }
  }, [subDistrictsList, i18n.language, i18n.isInitialized])

  useEffect(() => {
    if (cameraList) {
      const options = cameraList.map((row) => ({
        label: row.camera_name,
        value: row.camera_uid,
      }))
      setCamerasOption([{ label: t('dropdown.all'), value: "0" }, ...options])
    }
  }, [cameraList, i18n.language, i18n.isInitialized])

  useEffect(() => {
    if (cameraList.length === 0) {
      clearSearchPlaces();
      return;
    }

    const latLng = cameraList.map((point) => ({
      location: `${point.latitude}, ${point.longitude}`,
      name: point.camera_name
    }));
    searchCameras(latLng, "#DD2025", true);
  }, [cameraList])

  useEffect(() => {
    if (selectedCameraObjects.length === 0) {
      clearSearchPlaces();
      return;
    }

    const hasAll = selectedCameraObjects.some((v) => v.value === "0");
    let latLng: {location: string, name: string}[] = [];

    if (hasAll) {
      latLng = cameraList.map((point) => ({
        location: `${point.latitude}, ${point.longitude}`,
        name: point.camera_name
      }));
    }
    else {
      selectedCameraObjects.forEach((sc) => {
        const point = cameraList.find(cp => cp.camera_uid === sc.value);
        if (!point) return;
        latLng.push({
          location: `${point.latitude}, ${point.longitude}`,
          name: point.camera_name
        });
      })
    }

    searchCameras(latLng, "#DD2025", true);
  }, [selectedCameraObjects])

  useEffect(() => {
    const fetchData = async () => {
      if (formData.province_id) {
        try {
          const res = await fetchClient<DistrictsResponse>(combineURL(CENTER_API, "/districts/get"), {
            method: "GET",
            queryParams: { 
              filter: `province_id=${formData.province_id}`,
              limit: "100",
            },
          });
          if (res.success) {
            setDistrictsList(res.data);
          }
        }
        catch (error) {
          console.error(error);
        }
      }
    };
    fetchData();
  }, [formData.province_id]);

  useEffect(() => {
    const fetchData = async () => {
      if (formData.district_id) {
        try {
          const res = await fetchClient<SubDistrictsResponse>(combineURL(CENTER_API, "/subdistricts/get"), {
            method: "GET",
            queryParams: { 
              filter: `province_id=${formData.province_id},district_id=${formData.district_id}`,
              limit: "100",
            },
          });
          if (res.success) {
            setSubDistrictsList(res.data);
          }
        }
        catch (error) {
          console.error(error);
        }
      }
    };
    fetchData();
  }, [formData.district_id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const valueList = selectedSubDistrictObjects.map(sd => sd.value);
        const hasAll = selectedSubDistrictObjects.some((v) => v.value === 0);

        const filters: string[] = [];

        filters.push("deleted=0");
        if (!hasAll && valueList.length > 0) {
          filters.push(`subdistrict_id=${valueList.join("|")}`);
        }
        if (formData.province_id !== 0) {
          filters.push(`province_id=${formData.province_id}`);
        }
        if (formData.district_id !== 0) {
          filters.push(`district_id=${formData.district_id}`);
        }

        const res = await fetchClient<CameraResponse>(combineURL(CENTER_API, "/cameras/get"), {
          method: "GET",
          queryParams: {
            filter: filters.join(","),
            limit: "5000",
          },
        });

        if (res.success) {
          setCameraList(res.data);
        }
      }
      catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [selectedSubDistrictObjects, formData.province_id, formData.district_id]);

  useEffect(() => {
    if (isSearching) {
      setIsLoading(true);
    }
    else {
      setTimeout(() => {
        setIsLoading(false);
      }, 500)
    }
  }, [isSearching])
  
  const onDialogClose = () => {
    clearData();
    onClose();
  };

  const handleDropdownChange = (key: keyof typeof formData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleProvinceChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault()
    if (value) {
      handleDropdownChange("province_id", value.value);
    }
    else {
      handleDropdownChange("province_id", 0)
    }
    handleDropdownChange("district_id", 0);
    setSubDistrictsList([]);
  };

  const handleDistrictChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("district_id", value.value);
    }
    else {
      handleDropdownChange("district_id", 0);
    }
    setSubDistrictsList([]);
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

  const handleMapLoad = useCallback((mapInstance: LeafletMap | null) => {
    setMap(mapInstance)
  }, [])

  const onChangeSubDistrict = (ids: string[]) => {
    const newIds = ids.length === 0 ? [0] : ids.map(id => Number(id));

    const selectedObjects = subDistrictsOptions.filter(sd => newIds.includes(sd.value));
    setSelectedSubDistrictObjects(selectedObjects);
  };

  const clearData = () => {
    setFormData({
      station_id: 0,
      province_id: 0,
      district_id: 0,
    })
    setSelectedCameraObjects([{ label: t('dropdown.all'), value: "0" }]);
    setSelectedSubDistrictObjects([]);
    clearSearchPlaces();
    setSubDistrictsList([]);
    setDistrictsList([]);
  }

  const handleSelectClick = () => {
    if (selectedCameras) {
      const hasAll = selectedCameraObjects.some((v) => v.value === 0);
      if (hasAll) {
        selectedCameras([{ label: t('dropdown.all'), value: 0 }]);
      }
      else {
        selectedCameras(selectedCameraObjects);
      }
    }
    onDialogClose();
  }

  return (
    <Dialog open={open} maxWidth="xl" fullWidth className='relative'>
      <DialogTitle className='bg-black'>
        <div>
          <Typography variant="h5" color="white" className="font-bold">{t('screen.search-camera.title')}</Typography>
        </div>
      </DialogTitle>
      <DialogContent className='bg-black'>
        { isLoading && <Loading /> }
        {/* Selection Part */}
        <div className='grid grid-cols-[20%_20%_auto] gap-x-[100px] gap-y-5 pt-2'>
          <AutoComplete 
            id="province-select"
            sx={{ marginTop: "15px"}}
            value={formData.province_id}
            onChange={handleProvinceChange}
            options={provincesOptions}
            label={t('component.province')}
            placeholder={t('placeholder.province')}
            labelFontSize="16px"
          />

          <AutoComplete 
            id="district-select"
            sx={{ marginTop: "15px"}}
            value={formData.district_id}
            onChange={handleDistrictChange}
            options={districtsOptions}
            label={t('component.district')}
            placeholder={t('placeholder.district')}
            labelFontSize="16px"
            disabled={formData.province_id === 0}
          />

          <div className='flex flex-col w-full'>
            <Typography sx={{ fontSize: "15px" }} variant='subtitle1' color='white'>{t('component.sub-district')}</Typography>
            <div className='w-full items-center justify-center mt-[15px]'>
              <MultiSelect 
                limitTags={1} 
                selectedValues={selectedSubDistrictObjects}
                options={subDistrictsOptions} 
                onChange={onChangeSubDistrict}
                placeHolder={t('placeholder.sub-district')}
                disabled={formData.district_id === 0}
              />
            </div>
          </div>

          <div className='col-span-3'>
            <Typography sx={{ fontSize: "16px" }} variant='subtitle1' color='white'>{t('component.checkpoint-2')}</Typography>
            <MultiSelectCameras 
              limitTags={5} 
              options={camerasOption} 
              onChange={handleCameraChange}
              selectedValues={selectedCameraObjects}
              sx={{ marginTop: "15px"}}
            />
          </div>
        </div>

        {/* Map Part */}
        <div className='relative h-[55vh] w-full mt-5 border border-[#2B9BED]'>
          <BaseMap 
            onMapLoad={handleMapLoad}
            zoomControl={true}
            currentLocation={true}
          />
        </div>

        {/* Bottom Footer Part */}
        <div className='flex justify-end gap-x-4 mt-5'>
          <Button 
            variant="contained" 
            className="primary-checkpoint-search-btn" 
            sx={{
              width: "90px",
            }}
            startIcon={<MousePointerClick />}
            onClick={handleSelectClick}
          >
            {t('button.choose')}
          </Button>
          <Button 
            variant="outlined" 
            className="secondary-checkpoint-search-btn" 
            sx={{
              width: "90px",
            }}
            onClick={onDialogClose}
          >
            {t('button.cancel')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SearchCameras;