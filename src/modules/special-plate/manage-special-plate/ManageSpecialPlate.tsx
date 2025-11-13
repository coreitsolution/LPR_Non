import React, {useState, useCallback, useRef, useEffect } from 'react'
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import { useForm, Controller } from "react-hook-form";
import dayjs from 'dayjs';
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";

// Components
import TextBox from '../../../components/text-box/TextBox';
import AutoComplete from '../../../components/auto-complete/AutoComplete';
import DatePickerBuddhist from "../../../components/date-picker-buddhist/DatePickerBuddhist";

// Types
import {
  FileData,
  FileDataResponse,
  SpecialPlate,
  SpecialPlateResponse,
  SpecialPlateFilesResponse,
  SpecialPlateCreateResponse,
  Option,
  UserResponse,
  User,
} from "../../../features/types";

// Icons
import { Save, Download, Upload, Trash2 } from "lucide-react";
import { Icon } from "../../../components/icons/Icon";

// i18n
import { useTranslation } from 'react-i18next';

// Utils
import { formatPhone, getStringId, getId } from '../../../utils/commonFunction';
import { PopupMessage, PopupMessageWithCancel } from '../../../utils/popupMessage';
import { fetchClient, combineURL } from "../../../utils/fetchClient";

// Config
import { getUrls } from '../../../config/runtimeConfig';

interface FormData {
  id?: number;
  plate_group: string
  plate_number: string
  region_code: string | Option
  plate_type: number | Option
  case_number: string
  arrest_date: Date | null
  end_arrest_date: Date | null
  behavior: string
  case_owner_name: string
  case_owner_phone: string
  imagesData: {
    [key: number]: FileData
  }
  filesData: FileData[]
  active_status: number
};


interface ManageSpecialPlateProps {
  open: boolean;
  onClose: () => void;
  selectedRow: SpecialPlate | null; 
}

const ManageSpecialPlate: React.FC<ManageSpecialPlateProps> = ({open, onClose, selectedRow}) => {
  const { CENTER_API, CENTER_FILE_URL } = getUrls();

  // State
  const [isBlacklist, setIsBlackList] = useState(false);

  // Data
  const [userInfo, setUserInfo] = useState<User | null>(null);
  
  // Elements
  const hiddenFileInput = useRef<HTMLInputElement | null>(null)

  // Options
  const [provinceOptions, setProvinceOptions] = useState<{ label: string ,value: string }[]>([]);
  const [plateTypesOptions, setPlateTypesOptions] = useState<{ label: string ,value: number }[]>([]);

  // i18n
  const { t, i18n } = useTranslation();

  const bc = new BroadcastChannel("specialPlateChannel");

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    clearErrors,
  } = useForm();

  const [formData, setFormData] = useState<FormData>({
    id: undefined,
    plate_group: "",
    plate_number: "",
    region_code: "",
    plate_type: 0,
    case_number: "",
    arrest_date: null,
    end_arrest_date: null,
    behavior: "",
    case_owner_name: "",
    case_owner_phone: "",
    imagesData: {},
    filesData: [],
    active_status: 0,
  });

  const sliceDropdown = useSelector(
    (state: RootState) => state.dropdownData
  );

  useEffect(() => {
    if (open) {
      fetchUsers(14);
    }
  }, [open])

  useEffect(() => {
    if (selectedRow) {
      setFormData({
        id: selectedRow.id,
        plate_group: selectedRow.plate_prefix,
        plate_number: selectedRow.plate_number,
        region_code: selectedRow.region_code,
        plate_type: selectedRow.plate_class_id,
        case_number: selectedRow.case_number,
        arrest_date: selectedRow.arrest_warrant_date ? new Date(selectedRow.arrest_warrant_date) : null,
        end_arrest_date: selectedRow.arrest_warrant_expire_date ? new Date(selectedRow.arrest_warrant_expire_date) : null,
        behavior: selectedRow.behavior,
        case_owner_name: selectedRow.case_owner_name,
        case_owner_phone: selectedRow.case_owner_phone,
        imagesData: {},
        filesData: [],
        active_status: selectedRow.active,
      });
      setValue("plate_group", selectedRow.plate_prefix);
      setValue("plate_number", selectedRow.plate_number);
      setValue("region_code", selectedRow.region_code);
      setValue("plate_type", selectedRow.plate_class_id);
      setValue("behavior", selectedRow.behavior);
      setValue("case_owner_name", selectedRow.case_owner_name);
      setValue("case_owner_phone", selectedRow.case_owner_phone);
      setValue("case_number", selectedRow.case_number);
      setValue("arrest_date", selectedRow.arrest_warrant_date);
      setValue("end_arrest_date", selectedRow.arrest_warrant_expire_date);
      setValue("active_status", selectedRow.active);
      setIsBlackList(isBlacklistPlate(selectedRow.plate_class_id));
      fetchSpecialPlateImages();
      fetchSpecialPlateFiles();
    }
    else {
      setValue("plate_group", "");
      setValue("plate_number", "");
      setValue("region_code", "");
      setValue("plate_type", "");
      setValue("behavior", "");
      setValue("case_owner_name", "");
      setValue("case_owner_phone", "");
      setValue("case_number", "");
      setValue("arrest_date", "");
      setValue("end_arrest_date", "");
      setValue("active_status", "");
      setValue("active_status", 0);
      setIsBlackList(false);
    }
  }, [selectedRow])

  useEffect(() => {
    if (sliceDropdown.regions && sliceDropdown.regions.data) {
      const options = sliceDropdown.regions.data.map((row) => ({
        label: i18n.language === "th" ? row.name_th : row.name_en,
        value: row.region_code,
      }));
      setProvinceOptions(options);
    }
  }, [sliceDropdown.regions, i18n.language]);

  useEffect(() => {
    if (sliceDropdown.plateTypes && sliceDropdown.plateTypes.data) {
      const options = sliceDropdown.plateTypes.data.map((row) => ({
        label: i18n.language === "th" ? row.title_en : row.title_en,
        value: row.id,
      }));
      setPlateTypesOptions(options);
    }
  }, [sliceDropdown.plateTypes, i18n.language]);

  useEffect(() => {
    if (userInfo) {
      const name = `${userInfo.firstname} ${userInfo.lastname}`;
      const phone = formatPhone(userInfo.phone);

      setFormData((prevData) => ({
        ...prevData,
        case_owner_name: name,
        case_owner_phone: phone
      }));

      setValue("case_owner_name", name);
      setValue("case_owner_phone", phone);
    }
  }, [userInfo])

  const fetchSpecialPlateImages = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetchClient<FileDataResponse>(combineURL(CENTER_API, "/special-plate-images/get"), {
        method: "GET",
        signal: controller.signal,
        queryParams: {
          filter: `special_plate_id=${selectedRow?.id}`
        }
      })

      if (response.success) {
        setFormData((prevData) => ({
          ...prevData,
          imagesData: response.data
        }));
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-fetching-image'), errorMessage, "error");
    }
    finally {
      clearTimeout(timeoutId);
    }
  }

  const fetchSpecialPlateFiles = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetchClient<FileDataResponse>(combineURL(CENTER_API, "/special-plate-files/get"), {
        method: "GET",
        signal: controller.signal,
        queryParams: {
          filter: `special_plate_id=${selectedRow?.id}`
        }
      })

      if (response.success) {
        setFormData((prevData) => ({
          ...prevData,
          filesData: response.data
        }));
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-fetching-image'), errorMessage, "error");
    }
    finally {
      clearTimeout(timeoutId);
    }
  }

  const fetchUsers = async (id: number) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetchClient<UserResponse>(combineURL(CENTER_API, "/users/get"), {
        method: "GET",
        signal: controller.signal,
        queryParams: {
          "filter": `id=${id}`,
        }
      })

      if (response.success) {
        setUserInfo(response.data[0]);
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-fetching-data'), errorMessage, "error");
    }
    finally {
      clearTimeout(timeoutId);
    }
  }

  const handleCancelClick = () => {
    clearData();
    onClose();
  };

  const handleDropdownChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setValue(key, value);
  };

  const handleProvinceChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("region_code", value.value);
    }
    else {
      handleDropdownChange("region_code", '');
    }
  };

  const handlePlateTypesChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("plate_type", value.value);
      setIsBlackList(isBlacklistPlate(value.value));
    }
    else {
      handleDropdownChange("plate_type", '');
      setIsBlackList(false);
    }
  };

  const handleTextChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setValue(key, value);
  };

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    const cleaned = input.replace(/\D/g, '');
    
    if (cleaned.length <= 10) {
      const formatted = formatPhone(cleaned)
      handleTextChange("case_owner_phone", formatted)
    }
    return cleaned
  };

  const handleStatusChange = (status: number) => {
    setFormData((prevState) => ({
      ...prevState,
      active_status: status
    }));
    setValue("active_status", status);
  };

  const handleDeleteImage = useCallback(async (position: number, fileData: FileData) => {
    try {
      if (selectedRow) {
        await fetchClient<SpecialPlateResponse>(combineURL(CENTER_API, `/special-plate-images/delete`), {
          method: "DELETE",
          queryParams: {
            ids: [fileData.id].toString()
          },
        })
      }

      const body = JSON.stringify({
        urls: [fileData.url]
      })

      await fetchClient<SpecialPlateResponse>(combineURL(CENTER_API, `/upload/remove`), {
        method: "POST",
        body,
      })
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-deleting-data'), errorMessage, "error");
    }

    setFormData((prev) => {
      const updatedImagesData = { ...prev.imagesData }
      delete updatedImagesData[position]

      return {
        ...prev,
        imagesData: updatedImagesData,
      }
    })
  }, [])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    // Convert the file list to an array for processing
    const fileArray = Array.from(files)

    // Helper function to determine next available positions
    const getNextAvailablePositions = (
      currentImages: { [key: number]: FileData },
      numNeeded: number
    ) => {
      const positions: number[] = []
      for (let i = 0; i < 3 && positions.length < numNeeded; i++) {
        if (!currentImages[i]) {
          positions.push(i)
        }
      }
      return positions
    }

    const availablePositions = getNextAvailablePositions(
      formData.imagesData,
      fileArray.length
    )

    try {
      const formData = new FormData()
      fileArray.forEach(file => {
        formData.append("files", file)
      })

      const response = await fetchClient<SpecialPlateFilesResponse>(combineURL(CENTER_API, "/upload/"), {
        method: "POST",
        isFormData: true,
        body: formData,
      })

      if (response.success) {
        const uploadedImages = response.data.map((file: any, index: any) => ({
          position: availablePositions[index],
          image: {
            id: file.id,
            title: file.title,
            url: file.url,
          },
        }))

        const imagesDataUpdates = uploadedImages.reduce(
          (acc: any, { position, image }) => {
            if (position !== undefined) {
              acc[position] = image
            }
            return acc
          },
          {} as { [key: number]: FileData }
        )

        setFormData((prev) => ({
          ...prev,
          imagesData: {
            ...prev.imagesData,
            ...imagesDataUpdates,
          },
        }))
      }
    } 
    catch (error) {
      PopupMessage(t('message.error.error-upload-file'), error instanceof Error ? error.message : String(error) , "error");
    }

  };

  const handleImportFileClick = () => {
    if (hiddenFileInput.current) {
      hiddenFileInput.current.click()
    }
  }

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return

    const newFiles = Array.from(e.target.files).filter((file) =>
      /\.(pdf|docx|doc)$/i.test(file.name)
    )

    if (newFiles.length > 0) {
      try {
        const formData = new FormData()
        newFiles.forEach(file => {
          formData.append("files", file)
        })

        const response = await fetchClient<SpecialPlateFilesResponse>(combineURL(CENTER_API, "/upload/"), {
          method: "POST",
          isFormData: true,
          body: formData,
        })

        if (response.success) {
          const uploadedFiles = response.data.map((file: any) => ({
            id: file.id,
            title: file.title,
            url: file.url,
            created_at: dayjs().toISOString(),
          }));

          setFormData((prev) => ({
            ...prev,
            filesData: [...prev.filesData, ...uploadedFiles],
          }))
        }
      }
      catch (error) {
        PopupMessage(t('message.error.error-upload-file'), error instanceof Error ? error.message : String(error) , "error");
      }
    }

    if (hiddenFileInput.current) {
      hiddenFileInput.current.value = ""
    }
  }, [])

  const getFileName = (title:string, url:string):string => {
    try {
      const urlSplit = url.split('/')
      const fileNameWithExtension = urlSplit[urlSplit.length - 1] 
      const extensionSplit = fileNameWithExtension.split('.')
      const extension = extensionSplit.length > 1 ? extensionSplit.pop() : 'txt'
      return `${title}.${extension}`
    } 
    catch (error) {
      console.error("Error extracting file name:", error)
      return `${title}.txt`
    }
  }

  const handleDeleteFile = useCallback(async(fileData: FileData, index: number) => {
    try {
      if (selectedRow) {
        await fetchClient<SpecialPlateResponse>(combineURL(CENTER_API, `/special-plate-files/delete`), {
          method: "DELETE",
          queryParams: {
            ids: [fileData.id].toString()
          },
        })
      }

      const body = JSON.stringify({
        urls: [fileData.url]
      })

      await fetchClient<SpecialPlateResponse>(combineURL(CENTER_API, `/upload/remove`), {
        method: "POST",
        body,
      })

      setFormData((prev) => ({
        ...prev,
        filesData: prev.filesData.filter((_, i) => i !== index),
      }))
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-deleting-data'), errorMessage, "error");
    }
  }, [])

  const onSubmit = async (data: any) => {
    if (selectedRow) {
      updateSpecialPlate(data);
    } 
    else {
      saveSpecialPlate(data);
    }
  }

  const convertImagesToArray = (imagesObj: {
    [key: number]: FileData | null
  }): (FileData | null)[] => {
    const maxIndex = Math.max(...Object.keys(imagesObj).map(Number), -1)

    // Create array of that length + 1
    return Array.from({ length: maxIndex + 1 }, (_, index) => {
      return imagesObj[index] || null
    })
  }

  const getImagesArrayWithoutNulls = (imagesObj: {
    [key: number]: FileData | null
  }): FileData[] => {
    return convertImagesToArray(imagesObj).filter(
      (img): img is FileData => img !== null
    )
  }

  const saveSpecialPlate = async (data: any) => {
    try {
      const body = JSON.stringify({
        plate_prefix: data.plate_group,
        plate_number: data.plate_number,
        region_code: data.region_code.value,
        plate_class_id: data.plate_type.value,
        ...(
          data.case_number && { case_number: data.case_number }
        ),
        arrest_warrant_date: data.arrest_date ? dayjs(data.arrest_date).format('YYYY-MM-DD') : null,
        arrest_warrant_expire_date: data.end_arrest_date ? dayjs(data.end_arrest_date).format('YYYY-MM-DD') : null,
        ...(
          data.behavior && { behavior: data.behavior }
        ),
        case_owner_name: data.case_owner_name,
        case_owner_phone: data.case_owner_phone ? data.case_owner_phone.replaceAll("-", "") : "",
        active: data.active_status,
      })

      const response = await fetchClient<SpecialPlateCreateResponse>(combineURL(CENTER_API, "/special-plates/create"), {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body,
      })

      if (response.success) {
        if (formData.imagesData && Object.keys(formData.imagesData).length > 0) {
          const imageArray = getImagesArrayWithoutNulls(formData.imagesData);
          await Promise.all(
            imageArray.map(async (image) => {
              const body = JSON.stringify({
                special_plate_id: response.data.id,
                url: image.url,
                title: image.title
              });
              await fetchClient<SpecialPlateFilesResponse>(combineURL(CENTER_API, "/special-plate-images/create"), {
                method: "POST",
                headers: {
                  'Content-Type': 'application/json'
                },
                body,
              })
            })
          )
        }

        if (formData.filesData && formData.filesData.length > 0) {
          await Promise.all(
            formData.filesData.map(async (file) => {
              const body = JSON.stringify({
                special_plate_id: response.data.id,
                url: file.url,
                title: file.title
              });
              await fetchClient<SpecialPlateFilesResponse>(combineURL(CENTER_API, "/special-plate-files/create"), {
                method: "POST",
                headers: {
                  'Content-Type': 'application/json'
                },
                body,
              })
            })
          )
        }
        PopupMessage(t('message.success.save-success'), t('message.success.save-success-message'), "success");
        bc.postMessage("reload");
        clearData();
        onClose();
      }
    } 
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-saving'), errorMessage, "error");
    }
  }

  const handleArrestDateChange = (date: Date | null) => {
    setFormData((prevState) => ({
      ...prevState,
      arrest_warrant_date: date,
    }))
  }

  const handleEndArrestDateChange = (date: Date | null) => {
    setFormData((prevState) => ({
      ...prevState,
      end_arrest_date: date,
    }))
  }

  const updateSpecialPlate = async (data: any) => {
    try {
      const { all, onlyStatus, isImageChanged, isFileChanged } = isDataChanged();
      if (!all) {
        PopupMessage(
          t('message.warning.no-change-found'),
          t('message.warning.data-not-change'),
          "warning"
        )
        return;
      }

      let titleMessage = t('message.warning.edit-confirmation');
      let message = t('message.warning.edit-confirmation-message');

      if (onlyStatus) {
        titleMessage = t('message.warning.update-status-confirmation');
        message = t('message.warning.update-status-confirmation-message');
      }

      const confirmed = await PopupMessageWithCancel(titleMessage, message, t('button.confirm'), t('button.cancel'), "warning", "#FDB600")

      if (!confirmed) return;

      if (!selectedRow) return;

      const arrestDate = data.arrest_date ? dayjs(data.arrest_date).format("YYYY-MM-DD") : "";
      const endArrestDate = data.end_arrest_date ? dayjs(data.end_arrest_date).format("YYYY-MM-DD") : "";

      const body = JSON.stringify({
        id: selectedRow.id,
        ...(
          data.plate_group !== selectedRow.plate_prefix && { plate_prefix: data.plate_group }
        ),
        ...(
          data.plate_number !== selectedRow.plate_number && { plate_number: data.plate_number }
        ),
        ...(
          data.region_code && getStringId(data.region_code) !== selectedRow.region_code && { region_code: getStringId(data.region_code) }
        ),
        ...(
          data.plate_type && getId(data.plate_type) !== selectedRow.plate_class_id && { plate_class_id: getId(data.plate_type) }
        ),
        ...(
          data.case_number !== selectedRow.case_number && { case_number: data.case_number }
        ),
        ...(
          arrestDate !== selectedRow.arrest_warrant_date && { arrest_warrant_date: dayjs(data.arrest_date).format("YYYY-MM-DD") }
        ),
        ...(
          endArrestDate !== selectedRow.arrest_warrant_expire_date && { arrest_warrant_expire_date: dayjs(data.end_arrest_date).format("YYYY-MM-DD") }
        ),
        ...(
          data.behavior !== selectedRow.behavior && { behavior: data.behavior }
        ),
        ...(
          data.case_owner_name !== selectedRow.case_owner_name && { case_owner_name: data.case_owner_name }
        ),
        ...(
          data.case_owner_phone && data.case_owner_phone !== selectedRow.case_owner_phone && { case_owner_phone: data.case_owner_phone.replaceAll("-", "") }
        ),
        ...(
          data.active_status !== selectedRow.active && { active: data.active_status }
        ),
      })

      const response = await fetchClient<SpecialPlateResponse>(combineURL(CENTER_API, "/special-plates/update"), {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json'
        },
        body,
      })

      if (isImageChanged) {
        const imageArray = getImagesArrayWithoutNulls(formData.imagesData);
        const oldImageArray = selectedRow?.imagesData ?? [];
        const { added, removed } = getFilesDiff(imageArray, oldImageArray);

        if (removed.length > 0) {
          await fetchClient<SpecialPlateResponse>(combineURL(CENTER_API, `/special-plate-images/delete`), {
            method: "DELETE",
            headers: {
              'Content-Type': 'application/json'
            },
            queryParams: {
              ids: removed.map((image) => image.id).toString()
            }
          })
        }

        if (added.length > 0) {
          await Promise.all(
            added.map(async (image) => {
              const body = JSON.stringify({
                special_plate_id: selectedRow.id,
                url: image.url,
                title: image.title
              });

              await fetchClient<SpecialPlateResponse>(combineURL(CENTER_API, `/special-plate-images/create`), {
                method: "POST",
                headers: {
                  'Content-Type': 'application/json'
                },
                body,
              });
            })
          );
        }
      }

      if (isFileChanged) {
        const { added, removed } = getFilesDiff(formData.filesData, selectedRow?.filesData ?? []);

        if (removed.length > 0) {
          await fetchClient<SpecialPlateResponse>(combineURL(CENTER_API, `/special-plate-files/delete`), {
            method: "DELETE",
            headers: {
              'Content-Type': 'application/json'
            },
            queryParams: {
              ids: removed.map((file) => file.id).toString()
            }
          })
        }

        if (added.length > 0) {
          await Promise.all(
            added.map(async (file) => {
              const body = JSON.stringify({
                special_plate_id: selectedRow.id,
                url: file.url,
                title: file.title
              });

              await fetchClient<SpecialPlateResponse>(combineURL(CENTER_API, `/special-plate-files/create`), {
                method: "POST",
                headers: {
                  'Content-Type': 'application/json'
                },
                body,
              });
            })
          );
        }
      }

      if (response.success) {
        PopupMessage(t('message.success.save-success'), "", "success");
        bc.postMessage("reload");
        clearData();
        onClose();
      }
    } 
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-saving'), errorMessage, "error");
    }
  };

  const getFilesDiff = (newArray: any[], oldFileArray: any[]) => {
    const currentURLs = newArray.map(data => data.url);
    const oldURLs = oldFileArray.map(data => data.url);

    // Find removed: in old but not in current
    const removed = oldFileArray.filter(data => !currentURLs.includes(data.url));

    // Find added: in current but not in old
    const added = newArray.filter(data => !oldURLs.includes(data.url));

    return { added, removed };
  };
  
  const isDataChanged = () => {
    const isOnlyStatusChanged = formData.active_status !== selectedRow?.active;

    const imageArray = getImagesArrayWithoutNulls(formData.imagesData).map((image) => image.url);
    const oldImageArray = selectedRow?.imagesData?.map((image) => image.url) ?? [];
    const isImageChanged = JSON.stringify(imageArray) !== JSON.stringify(oldImageArray);

    const fileArray = getImagesArrayWithoutNulls(formData.filesData).map((file) => file.url);
    const oldFileArray = selectedRow?.filesData?.map((file) => file.url) ?? [];
    const isFileChanged = JSON.stringify(fileArray) !== JSON.stringify(oldFileArray);

    const isOtherDataChanged =
      formData.plate_group !== selectedRow?.plate_prefix ||
      formData.plate_number !== selectedRow?.plate_number ||
      getStringId(formData.region_code) !== selectedRow?.region_code ||
      getId(formData.plate_type) !== selectedRow?.plate_class_id ||
      formData.behavior !== selectedRow?.behavior ||
      formData.case_owner_name !== selectedRow?.case_owner_name ||
      formData.case_owner_phone !== selectedRow?.case_owner_phone;

    const statusChangeOnly = isOnlyStatusChanged && isImageChanged && isFileChanged && !isOtherDataChanged;

    return { all: statusChangeOnly || isOtherDataChanged || isImageChanged || isFileChanged, onlyStatus: statusChangeOnly, isImageChanged, isFileChanged };
  };

  const clearData = () => {
    setFormData({
      plate_group: "",
      plate_number: "",
      region_code: "",
      plate_type: 0,
      case_number: "",
      arrest_date: null,
      end_arrest_date: null,
      behavior: "",
      case_owner_name: "",
      case_owner_phone: "",
      imagesData: {},
      filesData: [],
      active_status: 0,
    });
    setValue("plate_group", "");
    setValue("plate_number", "");
    setValue("region_code", "");
    setValue("plate_type", "");
    setValue("behavior", "");
    setValue("case_owner_name", "");
    setValue("case_owner_phone", "");
    setValue("active_status", 0);
    clearErrors();
    setIsBlackList(false);
  }

  const isBlacklistPlate = (plateClassId: number) => {
    const plateTypesData = sliceDropdown.plateTypes?.data.find((type) => type.id === plateClassId);

    if (!plateTypesData) return false;

    if (plateTypesData.title_en === "Blacklist") {
      return true;
    }
    else {
      clearErrors("behavior");
      clearErrors("case_number");
      clearErrors("arrest_date");
      clearErrors("end_arrest_date");
      return false;
    }
  }

  return (
    <Dialog id='manage-special-plate' open={open} maxWidth="xl" fullWidth>
      <DialogTitle className='bg-black'>
        {/* Header */}
        <div>
          <Typography variant="h5" color="white" className="font-bold">{t('screen.manage-plate.title')}</Typography>
        </div>
      </DialogTitle>
      <DialogContent className='bg-black'>
        <form className='border-[1px] border-[#2B9BED]' onSubmit={handleSubmit(onSubmit)}>
          <div className='grid grid-cols-[auto_25%] py-3'>
            {/* Column 1 */}
            <div className='grid grid-cols-3 gap-5 p-4 border-r-[1px] border-[#999999]'>
              <div>
                <div className='flex gap-3 items-center'>
                  <div className='flex flex-col w-[150px]'>
                    <Typography sx={{ fontSize: "15px" }} variant='subtitle1' color='white'>
                      {`${t('component.plate-group')}`}<span className="text-red-500"> *</span>
                    </Typography>
                    <TextBox
                      sx={{ marginTop: "10px", fontSize: "15px" }}
                      id="character"
                      label=""
                      placeholder={t('placeholder.plate-group')}
                      value={formData.plate_group}
                      onChange={(event) =>
                        handleTextChange("plate_group", event.target.value)
                      }
                      register={register("plate_group", { 
                        required: true,
                      })}
                      error={!!errors.plate_group}
                    />
                  </div>

                  <Divider sx={{ borderColor: "#FFFFFF", width: "5px", marginTop: "35px" }} />
                  
                  <div className='flex flex-col w-full'>
                    <Typography sx={{ fontSize: "15px" }} variant='subtitle1' color='white'>
                      {`${t('component.plate-number')}`}<span className="text-red-500"> *</span>
                    </Typography>
                    <TextBox
                      sx={{ marginTop: "10px", fontSize: "15px" }}
                      id="plate-number"
                      label=""
                      placeholder={t('placeholder.plate-number')}
                      value={formData.plate_number}
                      onChange={(event) =>
                        handleTextChange("plate_number", event.target.value)
                      }
                      register={register("plate_number", { 
                        required: true,
                      })}
                      error={!!errors.plate_number}
                    />
                  </div>
                </div>
              </div>

              <AutoComplete 
                id="province-select"
                sx={{ marginTop: "10px"}}
                value={formData.region_code}
                onChange={handleProvinceChange}
                options={provinceOptions}
                label={t('component.province-category')}
                labelFontSize="15px"
                placeholder={t('placeholder.province-category')}
                register={register("region_code", { 
                  required: true,
                })}
                error={!!errors.region_code}
                required={true}
              />

              <AutoComplete 
                id="plate-type-select"
                sx={{ marginTop: "10px"}}
                value={formData.plate_type}
                onChange={handlePlateTypesChange}
                options={plateTypesOptions}
                label={t('component.plate-type-group')}
                labelFontSize="15px"
                placeholder={t('placeholder.plate-type-group')}
                register={register("plate_type", { 
                  required: true,
                })}
                error={!!errors.plate_type}
                required={true}
              />

              <div className='col-start-1'>
                <TextBox
                  sx={{ marginTop: "10px", fontSize: "15px" }}
                  id="case-number"
                  label={t('component.case-number')}
                  value={formData.case_number}
                  onChange={(event) =>
                    handleTextChange("case_number", event.target.value)
                  }
                  placeholder={t('placeholder.case-number')}
                  register={register("case_number", { 
                    required: isBlacklist,
                  })}
                  required={isBlacklist}
                  error={!!errors.case_number}
                  disabled={!isBlacklist}
                />
              </div>

              <div>
                <Typography sx={{ fontSize: "15px"}} variant='subtitle1' color='white'>
                  {t('component.date-arrest-warrant')}
                  {
                    isBlacklist && (
                      <span className="text-red-500"> *</span>
                    )
                  }
                </Typography>
                <DatePickerBuddhist
                  value={formData.arrest_date}
                  sx={{
                    marginTop: "8px",
                    "& .MuiOutlinedInput-input": {
                      fontSize: 15
                    }
                  }}
                  className="w-full"
                  id="arrest-date"
                  onChange={(value) => handleArrestDateChange(value)}
                  error={!!errors.arrest_date}
                  register={register("arrest_date", { 
                    required: isBlacklist,
                  })}
                  disabled={!isBlacklist}
                >
                </DatePickerBuddhist>
              </div>

              <div>
                <Typography sx={{ fontSize: "15px"}} variant='subtitle1' color='white'>
                  {t('component.date-expiration-arrest-warrant')}
                  {
                    isBlacklist && (
                      <span className="text-red-500"> *</span>
                    )
                  }
                </Typography>
                <DatePickerBuddhist
                  value={formData.end_arrest_date}
                  sx={{
                    marginTop: "8px",
                    "& .MuiOutlinedInput-input": {
                      fontSize: 15
                    }
                  }}
                  className="w-full"
                  id="end-arrest-date"
                  onChange={(value) => handleEndArrestDateChange(value)}
                  error={!!errors.end_arrest_date}
                  register={register("end_arrest_date", { 
                    required: isBlacklist,
                  })}
                  disabled={!isBlacklist}
                >
                </DatePickerBuddhist>
              </div>

              <div className='col-span-3'>
                <TextBox
                  sx={{ marginTop: "10px", fontSize: "15px" }}
                  id="behavior"
                  label={t('component.remark-behavior')}
                  value={formData.behavior}
                  onChange={(event) =>
                    handleTextChange("behavior", event.target.value)
                  }
                  isMultiline={true}
                  rows={4}
                  placeholder={t('placeholder.remark-behavior')}
                  register={register("behavior", { 
                    required: isBlacklist,
                  })}
                  required={isBlacklist}
                  error={!!errors.behavior}
                />
              </div>

              <TextBox
                sx={{ marginTop: "10px", fontSize: "15px" }}
                id="case-owner-name"
                label={t('component.owner-name')}
                value={formData.case_owner_name}
                onChange={(event) =>
                  handleTextChange("case_owner_name", event.target.value)
                }
                placeholder={t('placeholder.owner-name')}
                register={register("case_owner_name", { 
                  required: false,
                })}
                error={!!errors.case_owner_name}
                disabled={true}
              />

              <TextBox
                sx={{ marginTop: "10px", fontSize: "15px" }}
                id="case-owner-phone"
                label={t('component.phone')}
                value={formData.case_owner_phone}
                onChange={handlePhoneChange}
                placeholder={t('placeholder.phone-number')}
                register={register("case_owner_phone", { 
                  required: false,
                })}
                error={!!errors.case_owner_phone}
                disabled={true}
              />

              <div className='flex items-center justify-start h-full text-white col-start-1'>
                <FormGroup>
                  <Controller
                    name="active_status"
                    control={control}
                    render={({ field: { value, onChange, ...rest } }) => (
                      <FormControlLabel 
                        control={
                          <Checkbox
                            name={rest.name}
                            onBlur={rest.onBlur}
                            slotProps={{
                              input: {
                                ref: rest.ref
                              }
                            }}
                            checked={value === 1}
                            onChange={(e) => {
                              const newVal = e.target.checked ? 1 : 0;
                              onChange(newVal);
                              handleStatusChange(newVal)
                            }}
                            sx={{
                              color: "#FFFFFF",
                              "&.Mui-checked": {
                                color: "#FFFFFF",
                              },
                              "& .MuiSvgIcon-root": {
                                fontSize: 30
                              }
                            }}
                          />
                        }
                        label={t('component.active-status')}
                      />
                    )}
                  />
                </FormGroup>
              </div>

              <div className='col-start-3 row-start-8 flex items-center justify-end gap-3'>
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
            </div>

            {/* Column 2 */}
            <div
              id="file-import-container"
              className="h-full border-l-[2px] border-nobel px-[25px] py-2"
            >
              <div className="h-full text-white">
                {/* Image Upload Section */}
                <div id="image-import-part" className="flex flex-col items-center">
                  <label
                    className="relative flex items-center justify-center w-full h-[250px] mt-[5px] bg-[#48494B] cursor-pointer overflow-hidden hover:bg-gray-800"
                  >
                    { formData.imagesData && Object.keys(formData.imagesData).length > 0 ? (
                      <div className="relative w-full h-full">
                        {/* First Image (Full Size) */}
                        {formData.imagesData[0] && (
                          <div className="absolute inset-0">
                            <img
                              src={`${CENTER_FILE_URL}${formData.imagesData[0].url}`}
                              alt="Uploaded 1"
                              className="object-contain w-full h-full"
                            />
                            <button
                              type="button"
                              className="absolute z-[52] top-2 right-2 text-white bg-red-500 rounded-full w-[30px] h-[30px] flex items-center justify-center hover:cursor-pointer"
                              onClick={() => handleDeleteImage(0, formData.imagesData[0])}
                            >
                              &times;
                            </button>
                          </div>
                        )}

                        {/* Second and Third Images (Bottom Left) */}
                        <div className="absolute bottom-2 left-2 flex gap-2">
                          {[1, 2].map(
                            (position) =>
                              formData.imagesData[position] && (
                                <div
                                  key={position}
                                  className="relative w-[80px] h-[60px] border border-white bg-tuna"
                                >
                                  <img
                                    src={`${CENTER_FILE_URL}${formData.imagesData[position].url}`}
                                    alt={`Uploaded ${position + 1}`}
                                    className="object-contain w-full h-full"
                                  />
                                  <button
                                    type="button"
                                    className="absolute z-[52] top-[-5px] right-[-5px] text-white bg-red-500 rounded-full w-[20px] h-[20px] flex items-center justify-center hover:cursor-pointer"
                                    onClick={() => handleDeleteImage(position, formData.imagesData[position])}
                                  >
                                    &times;
                                  </button>
                                </div>
                              )
                          )}
                        </div>
                      </div>
                    ) : (
                      /* No Images */
                      <div className="flex flex-col justify-center items-center">
                        <Icon icon={Download} size={80} color="#999999" />
                        <span className="text-[18px] text-nobel mt-[20px]">
                          {t('button.upload-image')}
                        </span>
                      </div>
                    )}
                    {/* Hidden File Input */}
                    <input
                      id="image-upload"
                      type="file"
                      name="images"
                      accept="image/*"
                      multiple
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>

                {/* File Upload Section */}
                <div
                  id="file-import-part"
                  className="flex justify-end mt-[25px] space-x-2"
                >
                  <Button
                    variant="contained"
                    className="primary-btn"
                    startIcon={<Upload size={20} />}
                    sx={{
                      width: "130px",
                      textTransform: "capitalize",
                    }}
                    onClick={handleImportFileClick}
                  >
                    {t('button.upload-file')}
                  </Button>
                </div>

                <input
                  ref={hiddenFileInput}
                  name="files"
                  type="file"
                  accept=".docx, .pdf"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />

                {/* File List Section */}
                <div id="file-list-part" className="mt-[15px]">
                  <table className="w-full">
                    <tbody>
                      {formData.filesData && formData.filesData.length > 0 ? (
                        formData.filesData.map((file, index) => (
                          <tr
                            key={`${file.title}-${index}`}
                            className={`h-[40px] ${
                              index % 2 === 0 ? "bg-swamp" : "bg-celtic"
                            } ${
                              index === formData.filesData.length - 1
                                ? "border-b border-white"
                                : "border-b-[1px] border-dashed border-gray-300"
                            }`}
                          >
                            <td className="font-medium text-center">
                              {getFileName(file.title, file.url)}
                            </td>
                            <td className="font-medium text-center">
                              {file.created_at && dayjs(file.created_at).format('DD/MM/YYYY (HH:mm)')}
                            </td>
                            <td className="w-[30px]">
                              <button
                                type="button"
                                onClick={() => handleDeleteFile(file, index)}
                                className="hover:opacity-80 transition-opacity hover:cursor-pointer"
                              >
                                <Icon icon={Trash2} size={20} color="white" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="font-medium h-[40px] bg-swamp border-b border-white">
                          <td className="text-start pl-[10px]">{t('text.no-data')}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ManageSpecialPlate;