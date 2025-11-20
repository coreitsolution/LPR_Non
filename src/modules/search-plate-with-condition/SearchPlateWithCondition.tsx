import React, { useState, useEffect } from 'react';
import { 
  Button,
  Typography,
  Checkbox,
  FormGroup,
  FormControlLabel,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  SelectChangeEvent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Switch,
} from "@mui/material";
import { styled } from '@mui/material/styles';
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import Papa from "papaparse";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import JSZip from "jszip";
import { saveAs } from "file-saver";

// Icons
import SearchIcon from '@mui/icons-material/Search';
import CompareIcon from '@mui/icons-material/Compare';
import { Eye, EyeClosed, Pencil } from "lucide-react";
import ReplayIcon from '@mui/icons-material/Replay';
import CSVIcon from "../../assets/icons/csv.png";
import PDFIcon from "../../assets/icons/pdf.png";
import { KeyboardArrowUp } from '@mui/icons-material';

// Components
import TextBox from '../../components/text-box/TextBox';
import AutoComplete from '../../components/auto-complete/AutoComplete';
import DatePickerBuddhist from "../../components/date-picker-buddhist/DatePickerBuddhist";
import MultiSelectCameras from '../../components/multi-select/MultiSelectCameras';
import PaginationComponent from '../../components/pagination/Pagination';
import InformationDetail from '../information-detail/InformationDetail';
import MultiSelect from '../../components/multi-select/MultiSelect';
import Image from '../../components/image/Image';
import Loading from "../../components/loading/Loading";
import ProgressBarWithLabel from "../../components/progress-bar/ProgressBarWithLabel";

// Context
import { useHamburger } from "../../context/HamburgerContext";

// Types
import {
  Camera,
  CameraResponse,
} from "../../features/types";
import {
  SearchPlateCondition,
  SearchPlateConditionResponse,
  PlateRouteResponse,
  PlateRoute,
} from "../../features/search/SearchTypes";
import { 
  Districts, 
  SubDistricts,
  DistrictsResponse,
  SubDistrictsResponse,
} from "../../features/dropdown/dropdownTypes";

// Constant
import { PLATE_SEARCH_WITH_CONDITION_ROW_PER_PAGES } from "../../constants/dropdown";

// Modules
import SearchCameras from "../search-cameras/SearchCameras";
import ShowLargeImage from '../show-large-image/ShowLargeImage';

// i18n
import { useTranslation } from 'react-i18next';

// Utils
import { formatNumber, isStringMatch } from "../../utils/commonFunction";
import { PopupMessage, PopupMessageCustomTextWithCancel } from '../../utils/popupMessage';
import { fetchClient, combineURL } from "../../utils/fetchClient";

// Config
import { getUrls } from '../../config/runtimeConfig';

// PDF
import { downloadSearchResultPdf, generateSearchResultPdfBlob } from "./search-result-pdf/SearchResultPdf";

interface FormData {
  plate_group: string
  plate_number: string
  group_province_id: string
  province_id: number
  district_id: number
  brand_id: string
  color_id: string
  department_id: number
  area_id: number
  station_id: number
  start_date_time: Date | null
  end_date_time: Date | null
  checkpoints_id: number[]
};


interface SearchPlateWithConditionProps {

};

const SearchPlateWithCondition: React.FC<SearchPlateWithConditionProps> = ({}) => {
  const { CENTER_API, CENTER_FILE_URL } = getUrls();
  const { isOpen } = useHamburger()

  // Constants
  const CHUNK_SIZE = 500;
  const REQUEST_LIMIT = 5000;

  // Options
  const [provincesOptions, setProvincesOptions] = useState<{ label: string ,value: number }[]>([]);
  const [groupProvincesOptions, setGroupProvincesOptions] = useState<{ label: string ,value: string }[]>([]);
  const [districtsOptions, setDistrictsOptions] = useState<{ label: string ,value: number }[]>([]);
  const [subDistrictsOptions, setSubDistrictsOptions] = useState<{ label: string ,value: any }[]>([]);
  const [carColorsOptions, setCarColorsOptions] = useState<{ label: string ,value: string }[]>([]);
  const [carMakesOptions, setCarMakesOptions] = useState<{ label: string ,value: string }[]>([]);
  const [camerasOption, setCamerasOption] = useState<{ label: string ,value: any }[]>([]);

  // States
  const [isEditClick, setIsEditClick] = useState<{ id: string; status: boolean }>({ id: "0", status: false });
  const [isShowImage, setIsShowImage] = useState(true);
  const [isShowOverview, setIsShowOverview] = useState(true);
  const [isHideItems, setIsHideItems] = useState(true);
  const [isCompare, setIsCompare] = useState(false);
  const [searchCamerasVisible, setSearchCamerasVisible] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showLargeImage, setShowLargeImage] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  
  // Data
  const [searchPlateConditionList, setSearchPlateConditionList] = useState<SearchPlateCondition[]>([]);
  const [plateDetail, setPlateDetail] = useState<SearchPlateCondition[]>([]);
  const [selectedIdList, setSelectedIdList] = useState<SearchPlateCondition[]>([]);
  const [selectedCompareIdList, setSelectedCompareIdList] = useState<SearchPlateCondition[]>([]);
  const [selectedCameraObjects, setSelectedCameraObjects] = useState<{value: any, label: string}[]>([]);
  const [tab, setTab] = useState<number>(0);
  const [selectedSubDistrictObjects, setSelectedSubDistrictObjects] = useState<{value: any, label: string}[]>([]);
  const [districtsList, setDistrictsList] = useState<Districts[]>([])
  const [subDistrictsList, setSubDistrictsList] = useState<SubDistricts[]>([])
  const [cameraList, setCameraList] = useState<Camera[]>([])
  const [largeImageList, setLargeImageList] = useState<{name: string, url: string, className: string}[]>([])
  const [largeImagePlageData, setLargeImagePlageData] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState<string>("");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PLATE_SEARCH_WITH_CONDITION_ROW_PER_PAGES[PLATE_SEARCH_WITH_CONDITION_ROW_PER_PAGES.length - 1]);
  const [rowsPerPageOptions] = useState(PLATE_SEARCH_WITH_CONDITION_ROW_PER_PAGES);

  // i18n
  const { t, i18n } = useTranslation();

  // Icons
  const iconChecked = `url('data:image/svg+xml;utf8,<svg width="20px" height="50px" viewBox="0 0 1024 1024" class="icon"  version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M713.664 832H310.208L182.4 959.936 128 905.6 201.6 832H64V64h896v768h-137.664l73.6 73.6-54.336 54.336L713.664 832zM140.8 140.8v614.4h742.4V140.8H140.8zM281.6 256h76.8v384H281.6V256z m384 192h76.8v192h-76.8V448z m-192-96h76.8V640H473.6V352z" fill="white" /></svg>')`;

  const iconUnchecked = `url('data:image/svg+xml;utf8,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.7993 3C17.2899 3 18.5894 4.01393 18.9518 5.45974L19.337 7H20.25C20.6297 7 20.9435 7.28215 20.9932 7.64823L21 7.75C21 8.1297 20.7178 8.44349 20.3518 8.49315L20.25 8.5H19.714L19.922 9.3265C20.5708 9.72128 21.0041 10.435 21.0041 11.25V19.7468C21.0041 20.7133 20.2206 21.4968 19.2541 21.4968H17.75C16.7835 21.4968 16 20.7133 16 19.7468L15.999 18.5H8.004L8.00408 19.7468C8.00408 20.7133 7.22058 21.4968 6.25408 21.4968H4.75C3.7835 21.4968 3 20.7133 3 19.7468V11.25C3 10.4352 3.43316 9.72148 4.08177 9.32666L4.289 8.5H3.75C3.3703 8.5 3.05651 8.21785 3.00685 7.85177L3 7.75C3 7.3703 3.28215 7.05651 3.64823 7.00685L3.75 7H4.663L5.04898 5.46176C5.41068 4.01497 6.71062 3 8.20194 3H15.7993ZM6.504 18.5H4.499L4.5 19.7468C4.5 19.8848 4.61193 19.9968 4.75 19.9968H6.25408C6.39215 19.9968 6.50408 19.8848 6.50408 19.7468L6.504 18.5ZM19.504 18.5H17.499L17.5 19.7468C17.5 19.8848 17.6119 19.9968 17.75 19.9968H19.2541C19.3922 19.9968 19.5041 19.8848 19.5041 19.7468L19.504 18.5ZM18.7541 10.5H5.25C4.83579 10.5 4.5 10.8358 4.5 11.25V17H19.5041V11.25C19.5041 10.8358 19.1683 10.5 18.7541 10.5ZM10.249 14H13.7507C14.165 14 14.5007 14.3358 14.5007 14.75C14.5007 15.1297 14.2186 15.4435 13.8525 15.4932L13.7507 15.5H10.249C9.83478 15.5 9.49899 15.1642 9.49899 14.75C9.49899 14.3703 9.78115 14.0565 10.1472 14.0068L10.249 14H13.7507H10.249ZM17 12C17.5522 12 17.9999 12.4477 17.9999 13C17.9999 13.5522 17.5522 13.9999 17 13.9999C16.4477 13.9999 16 13.5522 16 13C16 12.4477 16.4477 12 17 12ZM6.99997 12C7.55225 12 7.99995 12.4477 7.99995 13C7.99995 13.5522 7.55225 13.9999 6.99997 13.9999C6.4477 13.9999 6 13.5522 6 13C6 12.4477 6.4477 12 6.99997 12ZM15.7993 4.5H8.20194C7.39892 4.5 6.69895 5.04652 6.50419 5.82556L5.71058 9H18.2929L17.4968 5.82448C17.3017 5.04596 16.6019 4.5 15.7993 4.5Z" fill="white"/></svg>')`;

  // Constants
  const BLACKLIST_ID = 6;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors,
  } = useForm();

  const sliceDropdown = useSelector(
    (state: RootState) => state.dropdownData
  );

  const cameraRefreshKey = useSelector((state: RootState) => state.refresh.cameraRefreshKey);
  
  const [formData, setFormData] = useState<FormData>({
    plate_group: "",
    plate_number: "",
    group_province_id: "",
    province_id: 0,
    district_id: 0,
    brand_id: "",
    color_id: "",
    department_id: 0,
    area_id: 0,
    station_id: 0,
    start_date_time: null,
    end_date_time: null,
    checkpoints_id: [],
  });

  useEffect(() => {
    const startDateTime = dayjs().subtract(1, "day").toDate();
    const endDateTime = dayjs().toDate();
    setFormData((prevState) => ({
      ...prevState,
      start_date_time: startDateTime,
      end_date_time: endDateTime,
    }));
    setValue("start_date_time", startDateTime);
    setValue("end_date_time", endDateTime);
  }, [])

  useEffect(() => {
    setDistrictsOptions([{ label: t('dropdown.all'), value: 0 }]);
    setSubDistrictsOptions([{ label: t('dropdown.all'), value: 0 }]);
    setSelectedSubDistrictObjects([{ label: t('dropdown.all'), value: 0 }]);
    setSelectedCameraObjects([{ label: t('dropdown.all'), value: "0" }]);
  }, [i18n.language, i18n.isInitialized])

  useEffect(() => {
    if (searchPlateConditionList) {
      setTotalPages(searchPlateConditionList.length === 0 ? 1 : Math.ceil(searchPlateConditionList.length / rowsPerPage));
    }

    return () => {
      clearData();
    };
  }, []);

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
    if (sliceDropdown.regions && sliceDropdown.regions.data) {
      const options = sliceDropdown.regions.data.map((row) => ({
        label: i18n.language === "th" ? row.name_th : row.name_en,
        value: row.region_code,
      }));
      setGroupProvincesOptions([{ label: t('dropdown.all'), value: "0" }, ...options]);
    }
  }, [sliceDropdown.regions, i18n.language, i18n.isInitialized]);

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
          const errorMessage = error instanceof Error ? error.message : String(error)
          PopupMessage(t('message.error.error-while-fetching-data'), errorMessage, "error");
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
          const errorMessage = error instanceof Error ? error.message : String(error)
          PopupMessage(t('message.error.error-while-fetching-data'), errorMessage, "error");
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
            filter: `${filters.join(",")}`,
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

    fetchData();
  }, [selectedSubDistrictObjects, formData.province_id, formData.district_id, cameraRefreshKey]);

  const handleTextChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleDropdownChange = (key: keyof typeof formData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleGroupProvinceChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("group_province_id", value.value);
    }
    else {
      handleDropdownChange("group_province_id", "");
    }
  };

  const handleProvinceChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("province_id", value.value);
    }
    else {
      handleDropdownChange("province_id", 0);
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

  const handleCarBrandChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("brand_id", value.value);
    }
    else {
      handleDropdownChange("brand_id", '');
    }
  };

  const handleCarColorChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("color_id", value.value);
    }
    else {
      handleDropdownChange("color_id", '');
    }
  };

  const handleStartDateTimeChange = (date: Date | null) => {
    setFormData((prevState) => ({
      ...prevState,
      start_date_time: date,
    }));
    setValue("start_date_time", date)
  };
  
  const handleEndDateTimeChange = (date: Date | null) => {
    setFormData((prevState) => ({
      ...prevState,
      end_date_time: date,
    }));
    setValue("end_date_time", date)
  };

  const handleCameraChange = (ids: string[]) => {
    let newIds: string[];

    if (ids.length === 0 || ids.includes("0")) {
      newIds = ["0"];
    } else {
      newIds = ids;
    }

    const selectedObjects = camerasOption.filter((camera) =>
      newIds.includes(camera.value)
    );

    setSelectedCameraObjects(selectedObjects);
  };


  const handleClearSearch = async () => {
    resetData();
  };

  const resetData = () => {
    const startDateTime = dayjs().subtract(1, "day").toDate();
    const endDateTime = dayjs().toDate();
    setFormData({
      plate_group: "",
      plate_number: "",
      group_province_id: "",
      province_id: 0,
      district_id: 0,
      brand_id: "",
      color_id: "",
      department_id: 0,
      area_id: 0,
      station_id: 0,
      start_date_time: startDateTime,
      end_date_time: endDateTime,
      checkpoints_id: [],
    });
    setValue("start_date_time", startDateTime);
    setValue("end_date_time", endDateTime);
    setDistrictsOptions([{ label: t('dropdown.all'), value: 0 }]);
    setSubDistrictsOptions([{ label: t('dropdown.all'), value: 0 }]);
    setSelectedSubDistrictObjects([{ label: t('dropdown.all'), value: 0 }]);
    setSelectedCameraObjects([{ label: t('dropdown.all'), value: "0" }]);
    setSearchPlateConditionList([]);
    setIsShowOverview(true);
    setTotalPages(1);
    setTotalData(0);
    setIsShowImage(true);
    clearErrors();
  }

  const handleRowsPerPageChange = async (event: SelectChangeEvent) => {
    const limit = parseInt(event.target.value)
    setRowsPerPage(parseInt(event.target.value));
    await fetchSearchData(page, limit);
  };

  const handlePageChange = async (event: React.ChangeEvent<unknown>, value: number) => {
    event.preventDefault();
    setPage(value);
    await fetchSearchData(value, rowsPerPage);
  };

  const handlePageInputKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
  
      setPage(pageInput);
      await fetchSearchData(pageInput, rowsPerPage);
    }
  };

  const handlePageInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    const cleaned = input.replace(/\D/g, '');

    if (cleaned) {
      const numberInput = Number(cleaned);
      if (numberInput > 0 && numberInput <= totalPages) {
        setPageInput(numberInput);
      }
    }
    else if (cleaned === "") {
      setPageInput(1);
    }
    return cleaned;
  }

  const handleShowImageChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsShowImage(event.target.checked);
  };
  
  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsShowOverview(event.target.checked);
  };

  const handleClickEdit = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>, 
    index: number,
    tab: number,
  ) => {
    event.stopPropagation();
    event.preventDefault();
    let status = isEditClick.id === searchPlateConditionList[index].id ? !isEditClick.status : true;
    setIsEditClick(({
      id: searchPlateConditionList[index].id,
      status: status
    }));
    setPlateDetail([searchPlateConditionList[index]])
    setIsCompare(false);
    setIsHideItems(status);
    setTab(tab);
    setSelectedCompareIdList([]);
  };

  const handleCamerasSelected = (cameraSelected: {value: any, label: string}[]) => {
    setSelectedCameraObjects(cameraSelected);
  };

  const handleCheckboxSelectedChange = (event: React.ChangeEvent<HTMLInputElement>, data: SearchPlateCondition) => {
    event.stopPropagation();
    setSelectedIdList((prev) => {
      const exists = prev.find((item) => item.id === data.id);
      if (exists) {
        return prev.filter((item) => item.id !== data.id);
      } 
      else {
        return [...prev, data];
      }
    });
  };

  const handleHideListClicked = () => {
    setIsHideItems(false);
    setIsEditClick({ id: "0", status: false });
    setPlateDetail([]);
  };

  const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement, MouseEvent>, index: number, tab: number, data: SearchPlateCondition) => {
    event.stopPropagation();
    event.preventDefault();
    let status = isEditClick.id === searchPlateConditionList[index].id ? !isEditClick.status : true;
    setIsEditClick(({
      id: searchPlateConditionList[index].id,
      status: status
    }));
    setPlateDetail([searchPlateConditionList[index]])
    setIsCompare(false);
    setIsHideItems(status);
    setTab(tab);
    setSelectedIdList((prev) => {
      const exists = prev.find((item) => item.id === data.id);
      if (exists) {
        return prev.filter((item) => item.id !== data.id);
      } 
      else {
        return [...prev, data];
      }
    });
    setSelectedCompareIdList([]);
  }

  const handleRefreshClick = () => {
    clearForRefresh();
  }

  const clearForRefresh = () => {
    setIsHideItems(false);
    setIsEditClick({ id: "0", status: false });
    setPlateDetail([]);
    setSelectedIdList([]);
  }

  const exportToCsv = async () => {
    try {
      if (totalData > CHUNK_SIZE) {
        const confirmed = await PopupMessageCustomTextWithCancel(t('message.warning.export-all-confirmation'), t('message.warning.export-all-confirmation-message', { totalNumber: totalData }), t('button.confirm'), t('button.cancel'), "warning", "#FDB600")
        
        if (!confirmed) return;

        await handleExportAllDataInCsvConfirm();
        return;
      }

      setPageLoading(true);
      setProgress(0);
      setProgressMessage(t('progress-bar.data-downloading'));

      const response = await fetchNewData(
        1,
        CHUNK_SIZE
      );

      setProgress(80);
      setProgressMessage(t('progress-bar.csv-file-preparing'));

      const csvBlob = await generateDataToExport(response.data);
      const date = dayjs().format(i18n.language === "th" ? "BBBB-MM-DD" : "YYYY-MM-DD");
      const csvName = `${t('file.search-with-condition')}_${date}.csv`;

      downloadCsv(csvName, URL.createObjectURL(csvBlob));

      setProgress(100);
      setProgressMessage(t('progress-bar.file-download-complete'));
      setPageLoading(false);
    }
    catch (error) {
      setProgress(0);
      setProgressMessage("");
      setPageLoading(false);
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-export-data'), errorMessage, "error");
    }
  }

  const downloadCsv = (csvName: string, url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", csvName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleExportAllDataInCsvConfirm = async () => {
    try {
      setPageLoading(true);
      setProgress(0);
      setProgressMessage(t('progress-bar.data-downloading'));

      let allData: SearchPlateCondition[] = [];
      const allPage = Math.ceil(totalData / REQUEST_LIMIT);
      setProgress(20);

      for (let i = 1; i <= allPage; i++) {
        const downloadedData = (i - 1) * REQUEST_LIMIT;
        setProgressMessage(t('progress-bar.data-downloading-with-total', { downloadedData: downloadedData, totalData: totalData}));

        const response = await fetchNewData(
          i,
          REQUEST_LIMIT
        );
        allData.push(...response.data);
        setProgress(20 + (i / allPage) * 60);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const chunks: SearchPlateCondition[][] = [];
      for (let i = 0; i < allData.length; i += CHUNK_SIZE) {
        chunks.push(allData.slice(i, i + CHUNK_SIZE));
      }

      const date = dayjs().format(i18n.language === "th" ? "BBBB-MM-DD" : "YYYY-MM-DD");
      const zip = new JSZip();

      setProgress(80);
      setProgressMessage(t('progress-bar.csv-file-preparing-with-total', { chunksLength: chunks.length }));

      for (let i = 0; i < chunks.length; i++) {
        const chunkData = chunks[i];
        const csvBlob = await generateDataToExport(chunkData);
        const csvFileName = `${t("file.search-with-condition")}_${date}_${i + 1}.csv`;
        zip.file(csvFileName, csvBlob);

        setProgress(80 + ((i + 1) / chunks.length) * 15);
        setProgressMessage(t('progress-bar.file-creating-with-total', { currentNumber: i + 1, chunksLength: chunks.length }));
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      setProgressMessage(t('progress-bar.zip-file-creating'));
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipName = `${t("file.search-with-condition")}_${date}.zip`;
      saveAs(zipBlob, zipName);

      setProgress(100);
      setProgressMessage(t('progress-bar.file-download-complete'));
    } 
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      PopupMessage(t('message.error.error-while-export-data'), errorMessage, "error");
    }
    finally {
      setPageLoading(false);
    }
  }

  const exportToPdf = async () => {
    if (totalData > CHUNK_SIZE) {
      const confirmed = await PopupMessageCustomTextWithCancel(t('message.warning.export-all-confirmation'), t('message.warning.export-all-confirmation-message', { totalNumber: totalData }), t('button.confirm'), t('button.cancel'), "warning", "#FDB600")
      
      if (!confirmed) return;

      await handleExportAllDataInPdfConfirm();
      return;
    }

    setPageLoading(true);
    setProgress(0);
    setProgressMessage(t('progress-bar.data-downloading'));

    const response = await fetchNewData(
      1,
      CHUNK_SIZE
    );

    setProgress(80);
    setProgressMessage(t('progress-bar.pdf-file-preparing'));

    const updateData = response.data.map((item) => {
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
    await downloadSearchResultPdf(updateData, pdfName, t, i18n, CENTER_FILE_URL);

    setProgress(100);
    setProgressMessage(t('progress-bar.file-download-complete'));
    setPageLoading(false);
  }

  const handleExportAllDataInPdfConfirm = async () => {
    try {
      setPageLoading(true);
      setProgress(0);
      setProgressMessage(t('progress-bar.data-downloading'));

      let allData: SearchPlateCondition[] = [];
      const allPage = Math.ceil(totalData / REQUEST_LIMIT);
      setProgress(20);

      for (let i = 1; i <= allPage; i++) {
        const downloadedData = (i - 1) * REQUEST_LIMIT;
        setProgressMessage(t('progress-bar.data-downloading-with-total', { downloadedData: downloadedData, totalData: totalData}));

        const response = await fetchNewData(
          i,
          REQUEST_LIMIT
        );
        allData.push(...response.data);
        setProgress(20 + (i / allPage) * 60);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const chunks: SearchPlateCondition[][] = [];
      for (let i = 0; i < allData.length; i += CHUNK_SIZE) {
        chunks.push(allData.slice(i, i + CHUNK_SIZE));
      }

      const date = dayjs().format(i18n.language === "th" ? "BBBB-MM-DD" : "YYYY-MM-DD");
      const zip = new JSZip();

      setProgress(80);
      setProgressMessage(t('progress-bar.pdf-file-preparing-with-total', { chunksLength: chunks.length }));

      for (let i = 0; i < chunks.length; i++) {
        const chunkData = chunks[i];
        const pdfBlob = await generateSearchResultPdfBlob(chunkData, t, i18n, CENTER_FILE_URL);
        const pdfFileName = `${t("file.search-with-condition")}_${date}_${i + 1}.pdf`;
        zip.file(pdfFileName, pdfBlob);

        setProgress(80 + ((i + 1) / chunks.length) * 15);
        setProgressMessage(t('progress-bar.file-creating-with-total', { currentNumber: i + 1, chunksLength: chunks.length }));
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      setProgressMessage(t('progress-bar.zip-file-creating'));
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipName = `${t("file.search-with-condition")}_${date}.zip`;
      saveAs(zipBlob, zipName);

      setProgress(100);
      setProgressMessage(t('progress-bar.file-download-complete'));
    } 
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      PopupMessage(t('message.error.error-while-export-data'), errorMessage, "error");
    }
    finally {
      setPageLoading(false);
    }
  }

  const onChangeSubDistrict = (ids: string[]) => {
    const newIds = ids.length === 0 ? [0] : ids.map(id => Number(id));
    
    const selectedObjects = subDistrictsOptions.filter(sd => newIds.includes(sd.value));
    setSelectedSubDistrictObjects(selectedObjects);
  };

  const handleCompareClick = async () => {
    if (selectedIdList.length > 4) {
      PopupMessage("", t('message.warning.car-data-more-than-four'), "warning");
      return;
    }
    setSelectedCompareIdList(selectedIdList);
    setIsCompare(true);
  }

  const handleSearchClick = async () => {
    await fetchSearchData(1, rowsPerPage);
  }

  const fetchSearchData = async (currentPage: number = page, limit: number = rowsPerPage) => {
    try {
      clearForRefresh();
      setIsLoading(true);

      const body = {
        ...(formData.plate_group && { 
          plate_prefix: formData.plate_group 
        }),
        ...(formData.plate_number && { 
          plate_number: formData.plate_number 
        }),
        ...((formData.group_province_id && formData.group_province_id !== "0") && { 
          plate_region_code: formData.group_province_id 
        }),
        ...(formData.brand_id && { 
          vehicle_make: formData.brand_id 
        }),
        ...(formData.color_id && { 
          vehicle_color: formData.color_id
        }),
        ...(formData.province_id && { 
          province_id: formData.province_id 
        }),
        ...(formData.district_id && { 
          district_id: formData.district_id 
        }),
        ...((selectedSubDistrictObjects.length > 0 && selectedSubDistrictObjects.some((v) => v.value !== 0)) && { 
          subdistrict_ids: selectedSubDistrictObjects.filter((v) => v.value !== 0).map((v) => v.value)
        }),
        ...((selectedCameraObjects.length > 0 && selectedCameraObjects.some((v) => v.value !== "0")) && { 
          camera_uid_list: selectedCameraObjects.filter((v) => v.value !== 0).map((v) => v.value).join(",")
        }),
        startdateUtc: dayjs(formData.start_date_time).toISOString(),
        enddateUtc: dayjs(formData.end_date_time).toISOString(),
        page: currentPage,
        limit: limit,
        order: [
          [
            "epoch_end",
            "desc"
          ]
        ] 
      }

      const res = await fetchClient<SearchPlateConditionResponse>(combineURL(CENTER_API, "/lpr-data/search"), {
        method: "POST",
        body: JSON.stringify(body)
      });

      if (res.success) {
        setTotalPages(res.pagination.maxPage);
        setTotalData(res.pagination.countAll);
        if (res.data.length === 0) {
          setSearchPlateConditionList(res.data);
          return;
        }; 
        await fetchVehicleRoutes(res.data);
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-fetching-data'), errorMessage, "error");
    }
    finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500)
    }
  }

  const fetchNewData = async (currentPage: number = page, limit: number = rowsPerPage) => {
    try {
      clearForRefresh();

      const body = {
        ...(formData.plate_group && { 
          plate_prefix: formData.plate_group 
        }),
        ...(formData.plate_number && { 
          plate_number: formData.plate_number 
        }),
        ...((formData.group_province_id && formData.group_province_id !== "0") && { 
          plate_region_code: formData.group_province_id 
        }),
        ...(formData.brand_id && { 
          vehicle_make: formData.brand_id 
        }),
        ...(formData.color_id && { 
          vehicle_color: formData.color_id
        }),
        ...(formData.province_id && { 
          province_id: formData.province_id 
        }),
        ...(formData.district_id && { 
          district_id: formData.district_id 
        }),
        ...((selectedSubDistrictObjects.length > 0 && selectedSubDistrictObjects.some((v) => v.value !== 0)) && { 
          subdistrict_ids: selectedSubDistrictObjects.filter((v) => v.value !== 0).map((v) => v.value)
        }),
        ...((selectedCameraObjects.length > 0 && selectedCameraObjects.some((v) => v.value !== "0")) && { 
          camera_uid_list: selectedCameraObjects.filter((v) => v.value !== 0).map((v) => v.value).join(",")
        }),
        startdateUtc: dayjs(formData.start_date_time).toISOString(),
        enddateUtc: dayjs(formData.end_date_time).toISOString(),
        page: currentPage,
        limit: limit,
        order: [
          [
            "epoch_end",
            "desc"
          ]
        ] 
      }

      const res = await fetchClient<SearchPlateConditionResponse>(combineURL(CENTER_API, "/lpr-data/search"), {
        method: "POST",
        body: JSON.stringify(body)
      });

      if (!res.success) {
        throw new Error(res.message);
      }

      return res;
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw errorMessage;
    }
  }

  const generateDataToExport = async (data: SearchPlateCondition[]) => {
    const columnLabels = {
      plate: t('csv.column.plate'),
      provinceCategory: t('csv.column.province-category'),
      carType: t('csv.column.car-type'),
      carModel: t('csv.column.car-model'),
      carBrand: t('csv.column.car-brand'),
      carColor: t('csv.column.car-color'),
      carRoute: t('csv.column.car-route'),
      dayRange: t('csv.column.day-range'),
      time: t('csv.column.time'),
      remarkBehavior: t('csv.column.remark-behavior'),
    };

    const dataRows = data.map((data) => ({
      [columnLabels.plate]: data.plate,
      [columnLabels.provinceCategory]: data.region ? i18n.language === "th" ? data.region.name_th : data.region.name_en : "-",
      [columnLabels.carType]: data.vehicle_body_type_details ? i18n.language === "th" ? data.vehicle_body_type_details.body_type_th || "-" : data.vehicle_body_type_details.body_type_en || "-" : "-",
      [columnLabels.carModel]: data.vehicle_model_details ? data.vehicle_model_details.model_en || "-" : "-",
      [columnLabels.carBrand]: data.vehicle_make_details ? i18n.language === "th" ? data.vehicle_make_details.make_th || "-" : data.vehicle_make_details.make_en || "-" : "-",
      [columnLabels.carColor]: data.vehicle_color_details ? i18n.language === "th" ? data.vehicle_color_details.color_th || "-" : data.vehicle_color_details.color_en || "-" : "-",
      [columnLabels.carRoute]: data.currentRoute?.camera_name ?? "-",
      [columnLabels.dayRange]: dayjs(data.epoch_end).format("DD/MM/YYYY"),
      [columnLabels.time]: dayjs(data.epoch_end).format("HH:mm:ss"),
      [columnLabels.remarkBehavior]: data.remark || "-",
    }));

    const csvString =
        t('file.search-with-condition') + "\n" + 
        Papa.unparse(dataRows, { columns: Object.values(columnLabels) });

    const csvWithBOM = "\uFEFF" + csvString;
    return new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" });
  }

  const fetchVehicleRoutes = async (data: SearchPlateCondition[]) => {
    try {
      const plateRegionList = await Array.from(
        new Map(
          data.map((pr) => [`${pr.plate}_${pr.region_code}`, {
            plate: pr.plate,
            region_code: pr.region_code
          }])
        ).values()
      );

      const body = {
        plate_region_list: plateRegionList,
        startdateUtc: dayjs(formData.start_date_time).toISOString(),
        enddateUtc: dayjs(formData.end_date_time).toISOString(),
        page: 1,
        limit: 1000
      }

      const res = await fetchClient<PlateRouteResponse>(combineURL(CENTER_API, "/lpr-data/get-routes"), {
        method: "POST",
        body: JSON.stringify(body)
      });

      if (res.success) {
        await getRouteData(res.data, data);
      }
    }
    catch (error) {
      throw error;
    }
  }

  const getRouteData = async (
    plateRouteList: PlateRoute[],
    searchPlateList: SearchPlateCondition[]
  ) => {
    const updatedList = searchPlateList.map((spc) => {
      const matches = plateRouteList.filter(
        (pr) => pr.plate === spc.plate && pr.region_code === spc.region_code
      );

      let currentRoute;

      for (const match of matches) {
        const route = match.routes.find(
          (r) => r.camera_name === spc.camera_name
        );
        if (route) {
          currentRoute = route;
          break;
        }
      }

      if (matches.length > 0) {
        return {
          ...spc,
          plateRoute: matches,
          currentRoute: currentRoute ?? spc.currentRoute,
        };
      }

      return spc;
    });

    setSearchPlateConditionList(updatedList);
  };


  const clearData = () => {
    setFormData({
      plate_group: "",
      plate_number: "",
      group_province_id: "",
      province_id: 0,
      district_id: 0,
      brand_id: "",
      color_id: "",
      department_id: 0,
      area_id: 0,
      station_id: 0,
      start_date_time: dayjs().subtract(1, "day").toDate(),
      end_date_time: dayjs().toDate(),
      checkpoints_id: [],
    })
    setIsShowImage(true);
    setIsHideItems(false);
    setIsCompare(false);
    setSearchCamerasVisible(false);
    setIsAccordionOpen(true);
    setIsEditClick({ id: "0", status: false });
    setProvincesOptions([]);
    setCarColorsOptions([]);
    setCarMakesOptions([]);
    setCamerasOption([]);
    setPlateDetail([]);
    setSelectedIdList([]);
    setSelectedCompareIdList([]);
    setValue("start_date_time", null);
    setValue("end_date_time", null);

    setDistrictsOptions([{ label: t('dropdown.all'), value: 0 }]);
    setSubDistrictsOptions([{ label: t('dropdown.all'), value: 0 }]);
    setSelectedSubDistrictObjects([{ label: t('dropdown.all'), value: 0 }]);
    setSelectedCameraObjects([{ label: t('dropdown.all'), value: "0" }]);

    // Pagination
    setPage(1);
    setPageInput(1);
    setTotalPages(1);
    setRowsPerPage(PLATE_SEARCH_WITH_CONDITION_ROW_PER_PAGES[PLATE_SEARCH_WITH_CONDITION_ROW_PER_PAGES.length - 1]);
  }

  const handleImageClick = (event: React.MouseEvent<HTMLDivElement>, data: SearchPlateCondition) => {
    event.stopPropagation()
    setShowLargeImage(true);
    const plate = `${data.plate}${data.region ? ` ${i18n.language === "th" ? data.region.name_th : data.region.name_en}` : ""}`
    setLargeImagePlageData(plate)
    setLargeImageList([
      {
        name: "Overview",
        url: `${CENTER_FILE_URL}${data.overview_image}`,
        className: ""
      },
      {
        name: "Vehicle",
        url: `${CENTER_FILE_URL}${data.vehicle_image}`,
        className: ""
      }
    ])
  }

  const onDataChange = (data: any) => {
    const updateItem = (item: any) =>
      item.id === data.id
        ? {
            ...item,
            ...(data.plate && { plate: data.plate }),
            ...(data.plate_prefix && { plate_prefix: data.plate_prefix }),
            ...(data.plate_number && { plate_number: data.plate_number }),
            ...(data.region_code && { region_code: data.region_code }),
            ...(data.region && { region: data.region }),
            ...(data.vehicle_make && { vehicle_make: data.vehicle_make }),
            ...(data.vehicle_color && { vehicle_color: data.vehicle_color }),
            ...(data.vehicle_make_details && { vehicle_make_details: data.vehicle_make_details }),
            ...(data.vehicle_color_details && { vehicle_color_details: data.vehicle_color_details }),
          }
        : item;

    if (isCompare) {
      setSelectedCompareIdList((prev) => prev.map(updateItem));
    }
    else {
      setPlateDetail((prev) => prev.map(updateItem));
    }
    setSearchPlateConditionList((prev) => prev.map(updateItem));

    if (
      (data.plate_prefix && !isStringMatch(formData.plate_group, data.plate_prefix)) ||
      (data.plate_number && !isStringMatch(formData.plate_number, data.plate_number)) ||
      (data.region_code && (formData.group_province_id !== "0" && formData.group_province_id !== data.region_code)) ||
      (data.vehicle_make && formData.brand_id !== data.vehicle_make) ||
      (data.vehicle_color && formData.color_id !== data.vehicle_color)
    ) {
      setSearchPlateConditionList((prev) => prev.filter((item) => item.id !== data.id));
    }
  };

  const getBlackListId = (data: number | null) => {
    if (data && data === BLACKLIST_ID) {
      return true;
    }
    else {
      return false;
    }
  }

  const setSidePageLoading = (status: boolean) => {
    setPageLoading(status);
  }

  const setSideProgress = (progress: number) => {
    setProgress(progress);
  }

  const setSideProgressMessage = (progress: string) => {
    setProgressMessage(progress);
  }

  const MaterialUISwitch = styled(Switch)(({ theme }) => ({
    width: 62,
    height: 34,
    padding: 7,
    '& .MuiSwitch-switchBase': {
      margin: 1,
      padding: 0,
      transform: 'translateX(6px)',
      '&.Mui-checked': {
        color: '#fff',
        transform: 'translateX(22px)',
        '& .MuiSwitch-thumb': {
          backgroundColor: '#009900',
        },
        '& .MuiSwitch-thumb:before': {
          backgroundImage: iconChecked,
        },
        '& + .MuiSwitch-track': {
          opacity: 1,
          backgroundColor: '#aab4be',
          ...theme.applyStyles('dark', {
            backgroundColor: '#8796A5',
          }),
        },
      },
    },
    '& .MuiSwitch-thumb': {
      backgroundColor: 'rgba(26, 109, 223, 1)',
      width: 32,
      height: 32,
      '&::before': {
        content: "''",
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundImage: iconUnchecked,
      },
      ...theme.applyStyles('dark', {
        backgroundColor: '#003892',
      }),
    },
    '& .MuiSwitch-track': {
      opacity: 1,
      backgroundColor: '#aab4be',
      borderRadius: 20 / 2,
      ...theme.applyStyles('dark', {
        backgroundColor: '#8796A5',
      }),
    },
  }));

  return (
    <div id='search-plate-with-condition' className={`${isEditClick.status ? "pt-20 h-screen w-[73%]" : "main-content"} ${isOpen ? "pl-[130px]" : "pl-2.5"} transition-all duration-500`}>
      { isLoading && <Loading /> }
      {
        pageLoading && <ProgressBarWithLabel message={progressMessage} value={progress} />
      }
      <div className="w-full h-full overflow-x-auto">
        <div className={`flex flex-col w-full h-full overflow-auto ${isOpen ? "min-w-[660px]" : "min-w-[1200px]"}`}>
          {/* Header */}
          <Typography variant="h5" color="white" className="font-bold">{t('screen.search-plate-condition.title')}</Typography>

          {/* Filter Part */}
          <Accordion
            disableGutters
            sx={{
              boxShadow: "none",
              "&.Mui-expanded": { margin: 0 },
              pr: isEditClick.status ? "20px" : "30px",
              backgroundColor: "transparent",
              mt: "10px",
            }}
            expanded={isAccordionOpen} 
            onChange={() => setIsAccordionOpen((prev) => !prev)}
          >
            <AccordionSummary
              expandIcon={<KeyboardArrowUp sx={{ fontSize: 28, color: "white" }} />}
              sx={{
                backgroundColor: "#242727",
                color: "#FFFFFF",
                borderBottom: "1px solid #FFFFFF",
                px: 2,
              }}
            >
              {t('accordion.search-condition')}
            </AccordionSummary>

            <AccordionDetails
              sx={{
                backgroundColor: "#111111"
              }}
            >
              <form onSubmit={handleSubmit(handleSearchClick)} className='flex-none'>
                <div className='grid grid-cols-2 pt-2.5'>
                  {/* Column 1 */}
                  <div className='grid grid-cols-2 border-r border-[#4A4A4A] gap-y-3 gap-x-[13%] pr-[60px]'>
                    <div className='flex gap-3 items-center'>
                      <div className='flex flex-col w-[150px]'>
                        <Typography sx={{ fontSize: "15px" }} variant='subtitle1' color='white'>
                          {`${t('component.plate-group')}`}
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
                        />
                      </div>

                      <Divider sx={{ borderColor: "#FFFFFF", width: "5px", marginTop: "35px" }} />
                      
                      <div className='flex flex-col w-full'>
                        <Typography sx={{ fontSize: "15px" }} variant='subtitle1' color='white'>
                          {`${t('component.plate-number')}`}
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
                        />
                      </div>
                    </div>

                    <AutoComplete 
                      id="province-select"
                      sx={{ marginTop: "10px"}}
                      value={formData.group_province_id}
                      onChange={handleGroupProvinceChange}
                      options={groupProvincesOptions}
                      label={t('component.province-category')}
                      placeholder={t('placeholder.province-category')}
                      labelFontSize="15px"
                    />

                    <AutoComplete 
                      id="car-brand-select"
                      sx={{ marginTop: "10px"}}
                      value={formData.brand_id}
                      onChange={handleCarBrandChange}
                      options={carMakesOptions}
                      label={t('component.car-brand')}
                      placeholder={t('placeholder.car-brand')}
                      labelFontSize="15px"
                    />

                    <AutoComplete 
                      id="car-color-select"
                      sx={{ marginTop: "10px"}}
                      value={formData.color_id}
                      onChange={handleCarColorChange}
                      options={carColorsOptions}
                      label={t('component.car-color')}
                      placeholder={t('placeholder.car-color')}
                      labelFontSize="15px"
                    />

                    <div>
                      <Typography sx={{ fontSize: "15px"}} variant='subtitle1' color='white'>
                        {t('component.start-time')}
                        {
                          <span className="text-red-500"> *</span>
                        }
                      </Typography>
                      <DatePickerBuddhist
                        value={formData.start_date_time}
                        sx={{
                          marginTop: "8px",
                          borderRadius: "5px",
                          backgroundColor: "white",
                          "& .MuiTextField-root": {
                            height: "fit-content",
                          },
                          "& .MuiOutlinedInput-input": {
                            fontSize: 14
                          }
                        }}
                        className="w-full"
                        id="start-date-time"
                        onChange={(value) => handleStartDateTimeChange(value)}
                        isWithTime={true}
                        error={!!errors.start_date_time}
                        register={register("start_date_time", { 
                          required: true,
                        })}
                      >
                      </DatePickerBuddhist>
                    </div>

                    <div>
                      <Typography sx={{ fontSize: "15px"}} variant='subtitle1' color='white'>
                        {t('component.end-time')}
                        {
                          <span className="text-red-500"> *</span>
                        }
                      </Typography>
                      <DatePickerBuddhist
                        value={formData.end_date_time}
                        sx={{
                          marginTop: "8px",
                          borderRadius: "5px",
                          backgroundColor: "white",
                          "& .MuiTextField-root": {
                            height: "fit-content",
                          },
                          "& .MuiOutlinedInput-input": {
                            fontSize: 14
                          }
                        }}
                        className="w-full"
                        id="end-date-time"
                        onChange={(value) => handleEndDateTimeChange(value)}
                        isWithTime={true}
                        error={!!errors.end_date_time}
                        register={register("end_date_time", { 
                          required: true,
                        })}
                      >
                      </DatePickerBuddhist>
                    </div>
                  </div>
                  {/* Column 2 */}
                  <div className={`grid grid-cols-2 gap-y-3 gap-x-[13%] pl-[60px] }`}>
                    <AutoComplete 
                      id="province-select"
                      sx={{ marginTop: "10px"}}
                      value={formData.province_id}
                      onChange={handleProvinceChange}
                      options={provincesOptions}
                      label={t('component.province')}
                      placeholder={t('placeholder.province')}
                      labelFontSize="15px"
                    />

                    <AutoComplete 
                      id="district-select"
                      sx={{ marginTop: "10px"}}
                      value={formData.district_id}
                      onChange={handleDistrictChange}
                      options={districtsOptions}
                      label={t('component.district')}
                      placeholder={t('placeholder.district')}
                      labelFontSize="15px"
                      disabled={formData.province_id === 0}
                    />

                    <div className='flex flex-col w-full'>
                      <Typography sx={{ fontSize: "15px" }} variant='subtitle1' color='white'>{t('component.sub-district')}</Typography>
                      <div className='w-full items-center justify-center mt-2.5'>
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

                    <div className='flex flex-col w-full'>
                      <Typography sx={{ fontSize: "15px" }} variant='subtitle1' color='white'>{t('component.checkpoint-2')}</Typography>
                      <div className='w-full items-center justify-center mt-2.5'>
                        <div className='flex-1'>
                          <MultiSelectCameras 
                            limitTags={1} 
                            options={camerasOption} 
                            onChange={handleCameraChange}
                            selectedValues={selectedCameraObjects}
                            placeHolder={t('placeholder.checkpoint-2')}
                            isLocationButton={true}
                            onIconClick={() => setSearchCamerasVisible(true)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className='col-span-2 h-[74.25px]'>
                      <div className='flex items-end justify-between h-full'>
                        <div className='flex items-center justify-center gap-5'>
                          <FormGroup>
                            <FormControlLabel 
                              sx={{
                                color: "#FFFFFF",
                                '& .MuiTypography-root': {
                                  color: "#FFFFFF"
                                }
                              }}
                              control={
                                <Checkbox 
                                  sx={{
                                    color: "#FFFFFF",
                                    '&.Mui-checked': {
                                      color: "#FFFFFF",
                                    },
                                    '& .MuiSvgIcon-root': { 
                                      fontSize: 30 
                                    }
                                  }}
                                  checked={isShowImage}
                                  onChange={handleShowImageChecked}
                                />
                              } 
                              label={t('checkbox.show-image')}
                            />
                          </FormGroup>
                          {isShowImage && (
                            <div className={`flex items-center ${isEditClick.status ? "" : "gap-2"}`}>
                              <p className="text-white">{t('text.image-vehicle')}</p>
                              <MaterialUISwitch
                                checked={isShowOverview}
                                onChange={handleToggle}
                              />
                              <p className="text-white">{t('text.image-overview')}</p>
                            </div>
                          )}
                        </div>

                        <div className='flex gap-2 justify-end h-10'>
                          <Button
                            type='submit'
                            variant="contained"
                            className="primary-btn"
                            startIcon={<SearchIcon />}
                            sx={{
                              width: t('button.search-width'),
                              textTransform: "capitalize",
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
                              textTransform: "capitalize",
                            }}
                          >
                            {t('button.clear')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </AccordionDetails>
          </Accordion>

          {/* Footer Part */}
          <div className={`flex justify-between mt-5 ${isEditClick.status ? "pr-5" : "pr-[30px]"}`}>
            <div className='flex items-end'>
              <label>{`${t('table.amount')} ${formatNumber(totalData)} ${t('table.list')}`}</label>
            </div>
            {/* Button Part */}
            <div className='flex gap-5'>
              <div className='flex gap-2'>
                <Button
                  variant="contained"
                  className="tertiary-btn"
                  startIcon={<CompareIcon />}
                  sx={{
                    width: t('button.compare-width'),
                    height: "40px",
                    textTransform: "capitalize",
                    '& .MuiSvgIcon-root': { 
                      fontSize: 20
                    } 
                  }}
                  onClick={handleCompareClick}
                  disabled={selectedIdList.length < 2}
                >
                  {t('button.compare')}
                </Button>

                <Button
                  variant="contained"
                  className="tertiary-btn"
                  startIcon={ isHideItems ? <Eye /> : <EyeClosed /> }
                  sx={{
                    width: t('button.hide-list-width'),
                    height: "40px",
                    textTransform: "capitalize",
                    '& .MuiSvgIcon-root': { 
                      fontSize: 20
                    }
                  }}
                  onClick={() => handleHideListClicked()}
                >
                  {t('button.hide-list')}
                </Button>

                <Button
                  variant="contained"
                  className="tertiary-btn"
                  startIcon={<ReplayIcon />}
                  sx={{
                    width: "110px",
                    height: "40px",
                    textTransform: "capitalize",
                    '& .MuiSvgIcon-root': { 
                      fontSize: 20
                    } 
                  }}
                  onClick={handleRefreshClick}
                >
                  {t('button.refresh')}
                </Button>
              </div>

              <div className='flex gap-2'>
                <IconButton 
                  className="tertiary-btn"
                  sx={{
                    borderRadius: "4px !important",
                  }}
                  onClick={exportToCsv}
                  disabled={searchPlateConditionList.length === 0}
                >
                  <img src={CSVIcon} alt='CSV Icon' className='w-5 h-5' />
                </IconButton>

                <IconButton 
                  className="tertiary-btn"
                  sx={{
                    borderRadius: "4px !important",
                  }}
                  onClick={exportToPdf}
                  disabled={searchPlateConditionList.length === 0}
                >
                  <img src={PDFIcon} alt='PDF Icon' className='w-5 h-5' />
                </IconButton>
              </div>
            </div>
          </div>

          {/* Result Table */}
          <div className={`${isEditClick.status ? "pr-5" : "pr-[30px]"}`}>
            <TableContainer 
              component={Paper} 
              className='mt-1'
              sx={{ height: isAccordionOpen ? "37.7vh" : "68vh", backgroundColor: "#000" }}
            >
              <Table sx={{ minWidth: 650, backgroundColor: "#48494B"}} stickyHeader>
                <TableHead
                  sx={{
                    "& .MuiTableCell-head": {
                      color: "white",
                      backgroundColor: "#242727",
                    },
                  }}
                >
                  <TableRow>
                    <TableCell align="center" sx={{ color: "#FFFFFF", width: "8%" }}>{t('table.column.compare')}</TableCell>
                    <TableCell align="center" sx={{ color: "#FFFFFF", width: "12%" }}>{t('table.column.plate')}</TableCell>
                    <TableCell align="center" sx={{ color: "#FFFFFF", width: "10%" }}>{t('table.column.image')}</TableCell>
                    <TableCell align="center" sx={{ color: "#FFFFFF", width: "25%" }}>{t('table.column.car-route')}</TableCell>
                    <TableCell align="center" sx={{ color: "#FFFFFF", width: "20%" }}>{t('table.column.date-time-range')}</TableCell>
                    <TableCell align="center" sx={{ color: "#FFFFFF", width: "10%" }}>{t('table.column.remark')}</TableCell>
                    <TableCell align="center" sx={{ color: "#FFFFFF", width: "5%" }}>{t('table.column.edit')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody sx={{ backgroundColor: "#48494B" }}>
                  {
                    searchPlateConditionList.map((data, index) => (
                      <TableRow 
                        key={index}
                        onClick={(e) => handleRowClick(e, index, 0, data)}
                      >
                        <TableCell sx={{ backgroundColor: data.is_special_plate === 1 && getBlackListId(data.special_plate_id) ? "#EC313161" : "#393B3A", color: "#FFFFFF", width: "8%", textAlign: "center", borderBottom: "1px dashed #ADADAD" }}>
                          <Checkbox 
                            sx={{
                              color: "#FFFFFF",
                              '&.Mui-checked': {
                                color: "#FFFFFF",
                              },
                              '& .MuiSvgIcon-root': { 
                                fontSize: 30 
                              }
                            }}
                            checked={selectedIdList.some((item) => item.id === data.id)}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleCheckboxSelectedChange(e, data)}
                          />
                        </TableCell>
                        <TableCell sx={{ backgroundColor: data.is_special_plate === 1 && getBlackListId(data.special_plate_id) ? "#EC313140" : "#48494B", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>{`${data.plate_prefix} ${data.plate_number}${data.region ? ` ${i18n.language === "th" ? data.region.name_th : data.region.name_en}` : ""}`}</TableCell>
                        <TableCell sx={{ backgroundColor: data.is_special_plate === 1 && getBlackListId(data.special_plate_id) ? "#EC313161" : "#393B3A", color: "#FFFFFF", width: "10%", textAlign: "center", borderBottom: "1px dashed #ADADAD" }}>
                          <div 
                            style={{ 
                              height: "40px", 
                              display: "flex", 
                              alignItems: "center", 
                              justifyContent: "center" 
                            }}
                            onClick={(e) => handleImageClick(e, data)}
                          >
                            { !isShowImage ? 
                              "--" : 
                              <Image 
                                imageSrc={`${CENTER_FILE_URL}${isShowOverview ? data.overview_image : data.vehicle_image}`}
                                imageAlt={isShowOverview ? "Overview Image" : "Vehicle Image"}
                                className="w-[70px] h-[50px]"
                              />
                            }
                          </div>
                        </TableCell>
                        <TableCell
                          sx={{
                            backgroundColor: data.is_special_plate === 1 && getBlackListId(data.special_plate_id) ? "#EC313140" : "#48494B",
                            color: "#FFFFFF",
                            borderBottom: "1px dashed #ADADAD",
                          }}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            {
                              data.currentRoute && (
                                <div className="flex items-center space-x-1">
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "transparent", border: "1px solid #FFF" }} />
                                  <span>{data.currentRoute.camera_name || "-"}</span>
                                </div>
                              )
                            }
                          </div>
                        </TableCell>
                        <TableCell align="center" sx={{ backgroundColor: data.is_special_plate === 1 && getBlackListId(data.special_plate_id) ? "#EC313161" : "#393B3A", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>{dayjs(data.epoch_end).format("DD/MM/YYYY (HH:mm:ss)")}</TableCell>
                        <TableCell sx={{ backgroundColor: data.is_special_plate === 1 && getBlackListId(data.special_plate_id) ? "#EC313140" : "#48494B", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD", position: "relative" }}>
                          {data.remark}
                        </TableCell>
                        <TableCell sx={{ backgroundColor: data.is_special_plate === 1 && getBlackListId(data.special_plate_id) ? "#EC313161" : "#393B3A", color: "#FFFFFF", textAlign: "center", width: "5%", borderBottom: "1px dashed #ADADAD" }}>
                          <IconButton 
                            sx={{
                              borderRadius: "4px !important",
                            }}
                            onClick={(e) => handleClickEdit(e, index, 2)}
                          >
                            <Pencil color='#FFFFFF' size={20} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </TableContainer>

            <div className={`${searchPlateConditionList.length > 0 ? "flex" : "hidden"} items-center justify-between bg-(--background-color) py-3 pl-1 sticky bottom-0`}>
              <PaginationComponent 
                page={page} 
                onChange={handlePageChange}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={rowsPerPageOptions}
                handleRowsPerPageChange={handleRowsPerPageChange}
                totalPages={totalPages}
                pageInput={pageInput.toString()}
                handlePageInputKeyDown={handlePageInputKeyDown}
                handlePageInputChange={handlePageInputChange}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Side Components */}
      <InformationDetail 
        open={isEditClick.status}
        isCompare={isCompare}
        selectedIdList={isCompare ? selectedCompareIdList : plateDetail}
        tab={tab}
        province={formData.province_id > 0 ? provincesOptions.find((p) => p.value === formData.province_id)?.label || "-" : t('dropdown.all')}
        district={formData.district_id > 0 ? districtsOptions.find((p) => p.value === formData.district_id)?.label || "-" : t('dropdown.all')}
        subDistrict={selectedSubDistrictObjects.length > 0 ? selectedSubDistrictObjects.map((s) => s.label).join(", ") : t('dropdown.all')}
        onDataChange={onDataChange}
        setSidePageLoading={setSidePageLoading}
        setSideProgress={setSideProgress}
        setSideProgressMessage={setSideProgressMessage}
      />

      {/* Dialog */}
      <SearchCameras 
        open={searchCamerasVisible}
        selectedCameras={handleCamerasSelected}
        onClose={() => setSearchCamerasVisible(false)}
      />

      <ShowLargeImage 
        plate={largeImagePlageData}
        images={largeImageList}
        onClose={() => setShowLargeImage(false)}
        open={showLargeImage}
      />
    </div>
  )
}

export default SearchPlateWithCondition;