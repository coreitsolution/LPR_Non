import React, { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { RootState, AppDispatch } from "../../../app/store"
import { fetchClient, combineURL } from "../../../utils/fetchClient"
import { getUrls } from '../../../config/runtimeConfig';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Divider,
  Button,
} from "@mui/material"
import { useForm } from "react-hook-form";

// Types
import { 
  Districts,
  DistrictsResponse, 
  SubDistricts,
  SubDistrictsResponse,
} from "../../../features/dropdown/dropdownTypes";
import { 
  CheckpointResponse,
  Checkpoint,
} from "../../../features/types"

// Components
import TextBox from "../../../components/text-box/TextBox"
import AutoComplete from "../../../components/auto-complete/AutoComplete"

// Icon
import { Save } from "lucide-react"

// Pop-up
import { PopupMessage, PopupMessageWithCancel } from "../../../utils/popupMessage"

// Utils
import { formatPhone, getId } from "../../../utils/commonFunction"

// i18n
import { useTranslation } from 'react-i18next';

interface CheckpointSettingProps {
  open: boolean
  onClose: () => void
  checkpointData: Checkpoint | null
  isEditMode: boolean
}

const CheckpointSetting: React.FC<CheckpointSettingProps> = ({
  open,
  onClose,
  checkpointData,
  isEditMode,
}) => {
  const { CENTER_API } = getUrls();

  // i18n
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    id: undefined as number | undefined,
    checkpoint_ip: "",
    checkpoint_name: "",
    organization: "",
    province_id: 0 as number | '',
    district_id: 0 as number | '',
    subdistrict_id: 0 as number | '',
    route: "",
    latitude: "",
    longitude: "",
    officer_title_id: 0,
    officer_firstname: "",
    officer_lastname: "",
    officer_position: "",
    officer_phone: "",
    serial_number: "",
    license: "",
  })

  const dispatch: AppDispatch = useDispatch()
  const {
    provinces,
    positions,
    prefix,
  } = useSelector((state: RootState) => state.dropdownData)
  const [provincesOptions, setProvincesOptions] = useState<{ label: string ,value: number }[]>([])
  const [subDistrictsOptions, setSubDistrictsOptions] = useState<{ label: string ,value: number }[]>([])
  const [districtsOptions, setDistrictsOptions] = useState<{ label: string ,value: number }[]>([])
  const [personTitlesOptions, setPersonTitlesOptions] = useState<{ label: string ,value: number }[]>([])
  const [districtsList, setDistrictsList] = useState<Districts[]>([])
  const [subDistrictsList, setSubDistrictsList] = useState<SubDistricts[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors,
  } = useForm();

  useEffect(() => {
    if (
      provinces?.data &&
      provinces?.data?.length > 0 &&
      prefix?.data && prefix?.data.length > 0 &&
      positions?.data && positions?.data.length > 0 &&
      open
    ) {
      if (isEditMode && checkpointData) {
        setFormData((prev) => ({
          ...prev,
          id: checkpointData.id,
          checkpoint_ip: checkpointData.checkpoint_ip,
          checkpoint_name: checkpointData.checkpoint_name,
          organization: checkpointData.organization,
          province_id: checkpointData.province_id,
          district_id: checkpointData.district_id,
          subdistrict_id: checkpointData.subdistrict_id,
          route: checkpointData.route,
          latitude: checkpointData.latitude.toString(),
          longitude: checkpointData.longitude.toString(),
          officer_title_id: checkpointData.officer_title_id,
          officer_firstname: checkpointData.officer_firstname,
          officer_lastname: checkpointData.officer_lastname,
          officer_position: checkpointData.officer_position,
          officer_phone: checkpointData.officer_phone ? formatPhone(checkpointData.officer_phone) : checkpointData.officer_phone,
          serial_number: checkpointData.serial_number ?? "-",
          license: checkpointData.license_key ?? "-",
        }))
        setValue("checkpoint_name", checkpointData.checkpoint_name);
        setValue("organization", checkpointData.organization);
        setValue("province_id", checkpointData.province_id);
        setValue("district_id", checkpointData.district_id);
        setValue("subdistrict_id", checkpointData.subdistrict_id);
        setValue("route", checkpointData.route);
        setValue("latitude", checkpointData.latitude.toString());
        setValue("longitude", checkpointData.longitude.toString());
        setValue("officer_title_id", checkpointData.officer_title_id);
        setValue("officer_firstname", checkpointData.officer_firstname);
        setValue("officer_lastname", checkpointData.officer_lastname);
        setValue("officer_position", checkpointData.officer_position);
        setValue("officer_phone", checkpointData.officer_phone ? formatPhone(checkpointData.officer_phone) : checkpointData.officer_phone);
        setValue("serial_number", checkpointData.serial_number ?? "-");
        setValue("license", checkpointData.license_key ?? "-");

      }
    }
  }, [
    provinces,
    prefix,
    positions,
    isEditMode,
    checkpointData,
    open,
  ])

  const handleDropdownChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    setValue(key, value);
  }

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
  }, [dispatch, formData.province_id, formData.district_id]);

  useEffect(() => {
    if (provinces && provinces.data) {
      const options = provinces.data.map((row) => ({
        label: row.name_th,
        value: row.id,
      }))
      setProvincesOptions(options)
    }
  }, [provinces])

  useEffect(() => {
    if (districtsList) {
      const options = districtsList.map((row) => ({
        label: row.name_th,
        value: row.id,
      }))
      setDistrictsOptions(options)
    }
  }, [districtsList])

  useEffect(() => {
    if (subDistrictsList) {
      const options = subDistrictsList.map((row) => ({
        label: row.name_th,
        value: row.id,
      }))
      setSubDistrictsOptions(options)
    }
  }, [subDistrictsList])

  useEffect(() => {
    if (prefix && prefix.data) {
      const options = prefix.data.map((row) => ({
        label: row.title_th,
        value: row.id,
      }))
      setPersonTitlesOptions(options)
    }
  }, [prefix])

  const isDataChange = () => {
    return (
      formData.checkpoint_name !== checkpointData?.checkpoint_name ||
      formData.organization !== checkpointData?.organization ||
      formData.province_id !== checkpointData?.province_id ||
      formData.district_id !== checkpointData?.district_id ||
      formData.subdistrict_id !== checkpointData?.subdistrict_id ||
      formData.route !== checkpointData?.route ||
      formData.latitude !== checkpointData?.latitude ||
      formData.longitude !== checkpointData?.longitude ||
      formData.officer_title_id !== checkpointData?.officer_title_id ||
      formData.officer_firstname !== checkpointData?.officer_firstname ||
      formData.officer_lastname !== checkpointData?.officer_lastname ||
      formData.officer_position !== checkpointData?.officer_position ||
      formData.officer_phone.replaceAll(/[^0-9]/g, "") !== checkpointData?.officer_phone ||
      formData.serial_number !== checkpointData?.serial_number ||
      formData.license !== checkpointData?.license_key
    )
  }

  const onSubmit = async (data: any) => {
    try {
      if (!isDataChange()) {
        PopupMessage(
          t('message.warning.no-change-found'),
          t('message.warning.data-not-change'),
          "warning"
        )
        return;
      }

      const confirmed = await PopupMessageWithCancel(t('message.warning.edit-confirmation'), t('message.warning.edit-confirmation-message'), t('button.confirm'), t('button.cancel'), "warning", "#FDB600")

      if (!confirmed) return;

      const body = JSON.stringify({
        id: formData.id,
        checkpoint_ip: formData.checkpoint_ip,
        checkpoint_name: data.checkpoint_name,
        organization: data.organization,
        province_id: getId(data.province_id),
        district_id: getId(data.district_id),
        subdistrict_id: getId(data.subdistrict_id),
        route: data.route,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        officer_title_id: getId(data.officer_title_id),
        officer_firstname: data.officer_firstname,
        officer_lastname: data.officer_lastname,
        officer_position: data.officer_position,
        officer_phone: data.officer_phone.replaceAll(/[^0-9]/g, ""),
      })

      const response = await fetchClient<CheckpointResponse>(combineURL(CENTER_API, "/checkpoints/update"), {
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

  const handleTextChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    setValue(key, value);
  }

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
  
  const handlePrefixChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault()
    if (value) {
      handleDropdownChange("officer_title_id", value.value)
    }
    else {
      handleDropdownChange("officer_title_id", '')
    }
  }

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    const cleaned = input.replace(/\D/g, '');
    
    if (cleaned.length <= 10) {
      const formatted = formatPhone(cleaned)
      handleTextChange("officer_phone", formatted)
    }
    return cleaned
  }

  const handleCloseDialog = () => {
    clearData();
    onClose();
  }

  const clearData = () => {
    setFormData({
      id: undefined,
      checkpoint_ip: "",
      checkpoint_name: "",
      organization: "",
      province_id: 0,
      district_id: 0,
      subdistrict_id: 0,
      route: "",
      latitude: "",
      longitude: "",
      officer_title_id: 0,
      officer_firstname: "",
      officer_lastname: "",
      officer_position: "",
      officer_phone: "",
      serial_number: "",
      license: "",
    })
    setValue("checkpoint_name", "");
    setValue("organization", "");
    setValue("province_id", "");
    setValue("district_id", "");
    setValue("subdistrict_id", "");
    setValue("police_station_id", "");
    setValue("route", "");
    setValue("latitude", "");
    setValue("longitude", "");
    setValue("officer_title_id", "");
    setValue("officer_firstname", "");
    setValue("officer_lastname", "");
    setValue("officer_position", "");
    setValue("officer_phone", "");
    setValue("serial_number", "");
    setValue("license", "");
    clearErrors();
  }

  const handleCancelClick = () => {
    clearData();
    onClose();
  };

  return (
    <Dialog id="checkpoint-setting" open={open} maxWidth="xl" fullWidth sx={{ zIndex: 1000 }}>
      <DialogTitle className='bg-black'>
        <div className="flex justify-between items-center bg-black">
          <Typography variant="h5" color="white" className="font-bold">{t('screen.checkpoint-setting.title')}</Typography>
          <button
            onClick={handleCloseDialog} 
            className="text-white bg-transparent border-0 text-[28px] pr-6"
          >
            &times;
          </button>
        </div>
      </DialogTitle>
      <DialogContent className='bg-black'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-black text-white p-[30px] border border-[#2B9BED] w-full">
            {/* Checkpoint Information */}
            <div>
              <div className="flex mb-[15px]">
                <label className="text-[20px]">{t('text.station-data')}</label>
              </div>
              <div className="grid grid-cols-2 lt1443:grid-cols-1 gap-[60px]">
                {/* First Column */}
                <div>
                  <div className="my-2.5">
                    <TextBox
                      id="checkpoint-name"
                      label={t('component.checkpoint-name')}
                      placeholder={t('placeholder.checkpoint-name')}
                      value={formData.checkpoint_name}
                      onChange={(event) =>
                        handleTextChange("checkpoint_name", event.target.value)
                      }
                      sx={{ marginTop: "10px", fontSize: "15px" }}
                      register={register("checkpoint_name", { 
                        required: true,
                      })}
                      error={!!errors.checkpoint_name}
                    />
                  </div>
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
                      register={register("province_id", { 
                        required: true,
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
                      disabled={!formData.province_id || formData.province_id === 0  ? true : false}
                      register={register("district_id", { 
                        required: true,
                      })}
                      error={!!errors.district_id}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-5 my-2.5">
                    <TextBox
                      id="latitude"
                      label={t('component.location-latitude')}
                      placeholder={t('placeholder.location-latitude')}
                      value={formData.latitude}
                      onChange={(event) =>
                        handleTextChange("latitude", event.target.value)
                      }
                      sx={{ marginTop: "10px", fontSize: "15px" }}
                      register={register("latitude", { 
                        required: true,
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
                      register={register("longitude", { 
                        required: true,
                      })}
                      error={!!errors.longitude}
                    />
                  </div>
                </div>
                {/* Seconds Column */}
                <div>
                  <div className="my-2.5">
                    <TextBox
                      id="organization"
                      label={t('component.organization-name')}
                      placeholder={t('placeholder.organization-name')}
                      value={formData.organization}
                      onChange={(event) =>
                        handleTextChange("organization", event.target.value)
                      }
                      sx={{ marginTop: "10px", fontSize: "15px" }}
                      register={register("organization", { 
                        required: true,
                      })}
                      error={!!errors.organization}
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
                      disabled={!formData.district_id || formData.district_id === 0 ? true : false}
                      register={register("subdistrict_id", { 
                        required: true,
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
                      register={register("route", { 
                        required: true,
                      })}
                      error={!!errors.route}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-5 my-2.5">
                    <TextBox
                      id="serial-number"
                      label={t('component.pc-serial-number')}
                      placeholder={t('placeholder.pc-serial-number')}
                      value={formData.serial_number}
                      onChange={(event) =>
                        handleTextChange("serial_number", event.target.value)
                      }
                      sx={{ marginTop: "10px", fontSize: "15px" }}
                      register={register("serial_number", { 
                        required: true,
                      })}
                      error={!!errors.serial_number}
                    />
                    <TextBox
                      id="license"
                      label={t('component.license')}
                      placeholder={t('placeholder.license')}
                      value={formData.license}
                      onChange={(event) =>
                        handleTextChange("license", event.target.value)
                      }
                      sx={{ marginTop: "10px", fontSize: "15px" }}
                      disabled={true}
                      register={register("license", { 
                        required: false,
                      })}
                      error={!!errors.license}
                    />
                  </div>
                </div>
              </div>
            </div>
            <Divider sx={{ borderColor: "#2B9BED", my: "10px" }} />
            {/* Officer Information */}
            <div>
              <div className="flex mb-[15px]">
                <label className="text-[20px]">{t('text.officer-data')}</label>
              </div>
              <div className="grid grid-cols-2 lt1443:grid-cols-1 gap-[60px]">
                {/* First Column */}
                <div>
                  <div className="grid grid-cols-2 gap-5 my-2.5">
                    <AutoComplete 
                      id="prefix-select"
                      sx={{ marginTop: "10px"}}
                      value={formData.officer_title_id}
                      onChange={handlePrefixChange}
                      options={personTitlesOptions}
                      label={t('component.officer-prefix')}
                      placeholder={t('placeholder.officer-prefix')}
                      labelFontSize="16px"
                    />
                    <TextBox
                      id="firstname"
                      label={t('component.officer-name')}
                      placeholder={t('placeholder.officer-name')}
                      value={formData.officer_firstname}
                      onChange={(event) =>
                        handleTextChange("officer_firstname", event.target.value)
                      }
                      sx={{ marginTop: "10px", fontSize: "15px" }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-5 my-2.5">
                    <TextBox
                      id="phone"
                      label={t('component.officer-phone')}
                      placeholder={t('placeholder.officer-phone')}
                      value={formData.officer_phone}
                      onChange={handlePhoneChange}
                      sx={{ marginTop: "10px", fontSize: "15px" }}
                    />
                  </div>
                </div>
                {/* Seconds Column */}
                <div>
                  <div className="grid grid-cols-2 gap-5 my-2.5">
                    <TextBox
                      id="lastname"
                      label={t('component.officer-lastname')}
                      placeholder={t('placeholder.officer-lastname')}
                      value={formData.officer_lastname}
                      onChange={(event) =>
                        handleTextChange("officer_lastname", event.target.value)
                      }
                      sx={{ marginTop: "10px", fontSize: "15px" }}
                    />
                    <TextBox
                      id="position"
                      label={t('component.officer-position')}
                      placeholder={t('placeholder.officer-position')}
                      value={formData.officer_position}
                      onChange={(event) =>
                        handleTextChange("officer_position", event.target.value)
                      }
                      sx={{ marginTop: "10px", fontSize: "15px" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Footer */}
          <div className="flex justify-end my-6 ml-7 gap-2">
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
      </DialogContent>
    </Dialog>
  )
}

export default CheckpointSetting
