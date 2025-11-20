import React, { useEffect, useState } from 'react'
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Button,
} from '@mui/material';
import { useForm } from "react-hook-form";

// Icons
import { Save } from "lucide-react";

// Components
import TextBox from '../../../components/text-box/TextBox';
import AutoComplete from '../../../components/auto-complete/AutoComplete';

// i18n
import { useTranslation } from 'react-i18next';

// Types
import { 
  Camera, 
  CameraResponse,
} from "../../../features/types";
import {
  Districts, 
  SubDistricts,
  DistrictsResponse,
  SubDistrictsResponse,
} from "../../../features/dropdown/dropdownTypes";

// Utils
import { fetchClient, combineURL } from "../../../utils/fetchClient";
import { PopupMessage } from '../../../utils/popupMessage';

// Config
import { getUrls } from '../../../config/runtimeConfig';

interface FormData {
  id?: number;
  cameraName: string
  streamEncodeId: number | ''
  apiServer: string
  rtspLiveView: string
  rtspProcess: string
  province_id: number | ''
  district_id: number | ''
  subdistrict_id: number | ''
  route: string
  latitude: string
  longitude: string
};

interface CameraSettingProps {
  open: boolean;
  onClose: () => void;
  isEdit: boolean;
  selectedRow: Camera | null; 
}

const CameraSetting: React.FC<CameraSettingProps> = ({open, onClose, isEdit, selectedRow}) => {
  const { CENTER_API } = getUrls();
  
  // i18n
  const { t, i18n } = useTranslation();

  // Options
  const [provincesOptions, setProvincesOptions] = useState<{ label: string ,value: number }[]>([])
  const [subDistrictsOptions, setSubDistrictsOptions] = useState<{ label: string ,value: number }[]>([])
  const [districtsOptions, setDistrictsOptions] = useState<{ label: string ,value: number }[]>([])
  const [streamEncodeOptions, setStreamEncodeOptions] = useState<{ label: string ,value: number }[]>([]);

  // Data
  const [districtsList, setDistrictsList] = useState<Districts[]>([])
  const [subDistrictsList, setSubDistrictsList] = useState<SubDistricts[]>([])

  // State
  const [isSuperUser, setIsSuperUser] = useState(false);

  const sliceDropdown = useSelector(
    (state: RootState) => state.dropdownData
  );

  const authData = useSelector((state: RootState) => state.auth)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors,
  } = useForm();

  const [formData, setFormData] = useState<FormData>({
    cameraName: "",
    streamEncodeId: '' as number | '',
    apiServer: "",
    rtspLiveView: "",
    rtspProcess: "",
    province_id: 0 as number | '',
    district_id: 0 as number | '',
    subdistrict_id: 0 as number | '',
    route: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    if (selectedRow) {
      setFormData({
        cameraName: selectedRow.camera_name,
        streamEncodeId: selectedRow.stream_encode_id,
        apiServer: selectedRow.api_server_url,
        rtspLiveView: selectedRow.rtsp_live_url,
        rtspProcess: selectedRow.rtsp_process_url,
        province_id: selectedRow.province_id,
        district_id: selectedRow.district_id,
        subdistrict_id: selectedRow.subdistrict_id,
        route: selectedRow.route,
        latitude: selectedRow.latitude.toString(),
        longitude: selectedRow.longitude.toString(),
      })
      setValue("cameraName", selectedRow.camera_name);
      setValue("streamEncodeId", selectedRow.stream_encode_id);
      setValue("apiServer", selectedRow.api_server_url);
      setValue("rtspLiveView", selectedRow.rtsp_live_url);
      setValue("rtspProcess", selectedRow.rtsp_process_url);
      setValue("province_id", selectedRow.province_id);
      setValue("district_id", selectedRow.district_id);
      setValue("subdistrict_id", selectedRow.subdistrict_id);
      setValue("route", selectedRow.route);
      setValue("latitude", selectedRow.latitude);
      setValue("longitude", selectedRow.longitude);

      const user_group = sliceDropdown.userGroups?.data.find(userGroup => userGroup.id === authData.authData.userInfo?.user_group_id && userGroup.group_name.toLowerCase() === "super user");
      setIsSuperUser(user_group ? true : false);
    }
  }, [open, selectedRow])

  useEffect(() => {
    if (sliceDropdown.streamEncodes && sliceDropdown.streamEncodes.data) {
      const options = sliceDropdown.streamEncodes.data.map((row) => ({
        label: row.encode_name,
        value: row.id,
      }))
      setStreamEncodeOptions(options);
    }
  }, [sliceDropdown.streamEncodes])

  useEffect(() => {
    if (sliceDropdown.provinces && sliceDropdown.provinces.data) {
      const options = sliceDropdown.provinces.data.map((row) => ({
        label: row.name_th,
        value: row.id,
      }))
      setProvincesOptions(options)
    }
  }, [sliceDropdown.provinces])

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
        label: i18n.language === "th" ? row.name_th : row.name_en,
        value: row.id,
      }))
      setSubDistrictsOptions([{ label: t('dropdown.all'), value: 0 }, ...options])
    }
  }, [subDistrictsList, i18n.language, i18n.isInitialized])

  useEffect(() => {
    const fetchData = async () => {
      if (formData.province_id) {
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
    };
    fetchData();
  }, [formData.province_id]);

  useEffect(() => {
    const fetchData = async () => {
      if (formData.district_id) {
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
    };
    fetchData();
  }, [formData.district_id]);

  const handleTextChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setValue(key, value);
  };

  const handleDropdownChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setValue(key, value);
  };

  const handleStreamEncodeChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("streamEncodeId", value.value);
      setValue("streamEncodeId", value.value);
    }
    else {
      handleDropdownChange("streamEncodeId", '');
      setValue("streamEncodeId", '');
    }
  };

  const handleProvinceChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault()
    if (value) {
      handleDropdownChange("province_id", value.value)
    }
    else {
      handleDropdownChange("province_id", '')
      handleDropdownChange("district_id", '')
      handleDropdownChange("subdistrict_id", '')
    }
  }

  const handleDistrictChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault()
    if (value) {
      handleDropdownChange("district_id", value.value)
    }
    else {
      handleDropdownChange("district_id", '')
      handleDropdownChange("subdistrict_id", '')
    }
  }

  const handleSubDistrictChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault()
    if (value) {
      handleDropdownChange("subdistrict_id", value.value)
    }
    else {
      handleDropdownChange("subdistrict_id", '')
    }
  }

  const handleCancelClick = () => {
    clearData();
    onClose();
  };

  const onSubmit = async (data: any) => {
    if (selectedRow) {
      updateCamera(data);
    } 
  }

  const updateCamera = async (data: any) => {
    try {
      if (!isDataChanged(data)) {
        PopupMessage(
          t('message.warning.no-change-found'),
          t('message.warning.data-not-change'),
          "warning"
        )
        return;
      }

      const body = JSON.stringify({
        id: selectedRow?.id,
        ...(
          data.cameraName !== selectedRow?.camera_name 
          && { camera_name: data.cameraName }
        ),
        ...(
          data.streamEncodeId?.value !== selectedRow?.stream_encode_id 
          && { stream_encode_id: data.streamEncodeId?.value }
        ),
        ...(
          data.apiServer !== selectedRow?.api_server_url
          && { api_server_url: data.apiServer }
        ),
        ...(
          data.rtspLiveView !== selectedRow?.rtsp_live_url
          && { rtsp_live_url: data.rtspLiveView }
        ),
        ...(
          data.rtspProcess !== selectedRow?.rtsp_process_url
          && { rtsp_process_url: data.rtspProcess }
        ),
        ...(
          data.province_id && data.province_id?.value !== selectedRow?.province_id
          && { province_id: data.province_id?.value }
        ),
        ...(
          data.district_id && data.district_id?.value !== selectedRow?.district_id
          && { district_id: data.district_id?.value }
        ),
        ...(
          data.subdistrict_id && data.subdistrict_id?.value !== selectedRow?.subdistrict_id
          && { subdistrict_id: data.subdistrict_id?.value }
        ),
        ...(
          data.route !== selectedRow?.route
          && { route: data.route }
        ),
        ...(
          data.latitude !== selectedRow?.latitude
          && { latitude: data.latitude }
        ),
        ...(
          data.longitude !== selectedRow?.longitude
          && { longitude: data.longitude }
        ),
      })

      const response = await fetchClient<CameraResponse>(combineURL(CENTER_API, "/cameras/update"), {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json'
        },
        body,
      })

      if (response.success) {
        PopupMessage(t('message.success.save-success'), t('message.success.save-success-message'), "success");
        clearData();
        onClose();
      }
    } 
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-saving'), errorMessage, "error");
    }
  }

  const isDataChanged = (data: any) => {
    const isDataChanged =
      data.cameraName !== selectedRow?.camera_name  ||
      data.streamEncodeId?.value !== selectedRow?.stream_encode_id ||
      data.apiServer !== selectedRow?.api_server_url ||
      data.rtspLiveView !== selectedRow?.rtsp_live_url ||
      data.rtspProcess !== selectedRow?.rtsp_process_url ||
      data.province_id?.value !== selectedRow?.province_id ||
      data.district_id?.value !== selectedRow?.district_id ||
      data.subdistrict_id?.value !== selectedRow?.subdistrict_id ||
      data.route !== selectedRow?.route ||
      data.latitude !== selectedRow?.latitude ||
      data.longitude !== selectedRow?.longitude

    return isDataChanged;
  }

  const clearData = () => {
    setFormData({
      cameraName: "",
      streamEncodeId: "",
      apiServer: "",
      rtspLiveView: "",
      rtspProcess: "",
      province_id: "",
      district_id: "",
      subdistrict_id: "",
      route: "",
      latitude: "",
      longitude: "",
    });
    setValue("cameraName", "");
    setValue("streamEncodeId", "");
    setValue("apiServer", "");
    setValue("rtspLiveView", "");
    setValue("rtspProcess", "");
    setValue("province_id", "");
    setValue("district_id", "");
    setValue("subdistrict_id", "");
    setValue("route", "");
    setValue("latitude", "");
    setValue("longitude", "");
    clearErrors();
  }

  return (
    <Dialog id='camera-setting' open={open} maxWidth="xl" fullWidth>
      <DialogTitle className='bg-black'>
        {/* Header */}
        <div>
          <Typography variant="h5" color="white" className="font-bold">{isEdit ? t('screen.camera-setting.edit-title') : t('screen.camera-setting.add-title')}</Typography>
        </div>
      </DialogTitle>
      <DialogContent className='bg-black'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='p-3 border-[#2B9BED] border'>
            <div className='flex flex-col gap-3'>
              {/* Camera Data */}
              <Typography variant="h6" color="white" className="font-bold">{t('text.camera-data')}</Typography>

              <div className='grid grid-cols-2 gap-x-[50px] gap-y-3 mt-3'>
                <TextBox
                  sx={{ marginTop: "10px", fontSize: "15px" }}
                  id="camera-name"
                  label={t('component.camera-name')}
                  value={formData.cameraName}
                  onChange={(event) =>
                    handleTextChange("cameraName", event.target.value)
                  }
                  placeholder={t('placeholder.camera-name')}
                  register={register("cameraName", { 
                    required: true,
                  })}
                  error={!!errors.cameraName}
                />

                <div className='grid grid-cols-2 gap-[50px]'>
                  <AutoComplete 
                    id="stream-encode-select"
                    sx={{ marginTop: "10px"}}
                    value={formData.streamEncodeId}
                    onChange={handleStreamEncodeChange}
                    options={streamEncodeOptions}
                    label={t('component.stream-encode')}
                    labelFontSize="15px"
                    placeholder={t('placeholder.stream-encode')}
                    disabled={isEdit && !isSuperUser}
                    register={register("streamEncodeId", { 
                      required: isEdit && isSuperUser,
                    })}
                    error={!!errors.streamEncodeId}
                  />

                  <TextBox
                    sx={{ marginTop: "10px", fontSize: "15px" }}
                    id="api-server"
                    label={t('component.api-server')}
                    value={formData.apiServer}
                    onChange={(event) =>
                      handleTextChange("apiServer", event.target.value)
                    }
                    placeholder={t('placeholder.api-server')}
                    disabled={isEdit && !isSuperUser}
                    register={register("apiServer", { 
                      required: isEdit && isSuperUser,
                    })}
                    error={!!errors.apiServer}
                  />
                </div>

                <TextBox
                  sx={{ marginTop: "10px", fontSize: "15px" }}
                  id="rtsp-live-view"
                  label={t('component.rtsp-live-view')}
                  value={formData.rtspLiveView}
                  onChange={(event) =>
                    handleTextChange("rtspLiveView", event.target.value)
                  }
                  placeholder={t('placeholder.rtsp-live-view')}
                  disabled={isEdit && !isSuperUser}
                  register={register("rtspLiveView", { 
                    required: isEdit && isSuperUser,
                  })}
                  error={!!errors.rtspLiveView}
                />

                <TextBox
                  sx={{ marginTop: "10px", fontSize: "15px" }}
                  id="rtsp-process"
                  label={t('component.rtsp-process')}
                  value={formData.rtspProcess}
                  onChange={(event) =>
                    handleTextChange("rtspProcess", event.target.value)
                  }
                  placeholder={t('placeholder.rtsp-process')}
                  disabled={isEdit && !isSuperUser}
                  register={register("rtspProcess", { 
                    required: isEdit && isSuperUser,
                  })}
                  error={!!errors.rtspProcess}
                />

                <div className="grid grid-cols-2 gap-5 my-2.5">
                  <AutoComplete 
                    id="province-select"
                    sx={{ marginTop: "10px"}}
                    value={formData.province_id}
                    onChange={handleProvinceChange}
                    options={provincesOptions}
                    label={t('component.province-name')}
                    placeholder={t('placeholder.province-name')}
                    labelFontSize="16px"
                    disabled={isEdit && !isSuperUser}
                    register={register("province_id", { 
                      required: isEdit && isSuperUser,
                    })}
                    error={!!errors.province_id}
                  />
                  <AutoComplete 
                    id="district-select"
                    sx={{ marginTop: "10px"}}
                    value={formData.district_id}
                    onChange={handleDistrictChange}
                    options={districtsOptions}
                    label={t('component.district-name')}
                    placeholder={t('placeholder.district-name')}
                    labelFontSize="16px"
                    disabled={isEdit && !isSuperUser}
                    register={register("district_id", { 
                      required: isEdit && isSuperUser,
                    })}
                    error={!!errors.district_id}
                  />
                </div>

                <div className="grid grid-cols-2 gap-5 my-2.5">
                  <AutoComplete 
                    id="subdistrict-select"
                    sx={{ marginTop: "10px"}}
                    value={formData.subdistrict_id}
                    onChange={handleSubDistrictChange}
                    options={subDistrictsOptions}
                    label={t('component.sub-district-name')}
                    placeholder={t('placeholder.sub-district-name')}
                    labelFontSize="16px"
                    disabled={isEdit && !isSuperUser}
                    register={register("subdistrict_id", { 
                      required: isEdit && isSuperUser,
                    })}
                    error={!!errors.subdistrict_id}
                  />
                  <TextBox
                    id="route"
                    label={t('component.route-name')}
                    placeholder={t('placeholder.route-name')}
                    value={formData.route}
                    onChange={(event) =>
                      handleTextChange("route", event.target.value)
                    }
                    sx={{ marginTop: "10px", fontSize: "15px" }}
                    disabled={isEdit && !isSuperUser}
                    register={register("route", { 
                      required: isEdit && isSuperUser,
                    })}
                    error={!!errors.route}
                  />
                </div>

                <TextBox
                  id="latitude"
                  label={t('component.location-latitude')}
                  placeholder={t('placeholder.location-latitude')}
                  value={formData.latitude}
                  onChange={(event) =>
                    handleTextChange("latitude", event.target.value)
                  }
                  sx={{ marginTop: "10px", fontSize: "15px" }}
                  disabled={isEdit && !isSuperUser}
                  register={register("latitude", { 
                    required: isEdit && isSuperUser,
                  })}
                  error={!!errors.latitude}
                />

                <TextBox
                  id="longitude"
                  label={t('component.location-longitude')}
                  placeholder={t('placeholder.location-longitude')}
                  value={formData.longitude}
                  onChange={(event) =>
                    handleTextChange("longitude", event.target.value)
                  }
                  sx={{ marginTop: "10px", fontSize: "15px" }}
                  disabled={isEdit && !isSuperUser}
                  register={register("longitude", { 
                    required: isEdit && isSuperUser,
                  })}
                  error={!!errors.longitude}
                />
              </div>
            </div>
          </div>
          {/* Button Part */}
          <div className='flex justify-end w-full mt-5 gap-3'>
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
              className="secondary-checkpoint-search-btn"
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
      </DialogContent>
    </Dialog>
  )
}

export default CameraSetting;