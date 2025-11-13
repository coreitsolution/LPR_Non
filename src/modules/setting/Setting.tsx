import React, { useEffect, useState } from 'react'
import { 
  Typography,
  Button,
  IconButton,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  SelectChangeEvent,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";

// Constant
import { SETTING_ROW_PER_PAGES } from "../../constants/dropdown";

// Icon
import SearchIcon from '@mui/icons-material/Search';
// import CSVIcon from "../../assets/icons/csv.png";
import { Pencil } from 'lucide-react';

// i18n
import { useTranslation } from 'react-i18next';

// Context
import { useHamburger } from "../../context/HamburgerContext";

// Components
import Loading from "../../components/loading/Loading";
import PaginationComponent from '../../components/pagination/Pagination';
import TextBox from '../../components/text-box/TextBox';

// Utils
import { fetchClient, combineURL } from "../../utils/fetchClient";
import { formatNumber } from '../../utils/commonFunction';
import { PopupMessage } from '../../utils/popupMessage';

// Types
import { 
  Camera, 
  CameraResponse, 
  CheckpointResponse,
} from "../../features/types";

// Modules
import CameraSetting from "./camera-setting/CameraSetting";
import SensorSetting from './sensor-setting/SensorSetting';

// Config
import { getUrls } from '../../config/runtimeConfig';

interface FormData {
  cameraName: string
};

interface SettingProps {

}

const Setting: React.FC<SettingProps> = ({}) => {
  const { isOpen } = useHamburger();
  const { CENTER_API } = getUrls();

  // i18n
  const { t } = useTranslation();

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [openCameraSetting, setOpenCameraSetting] = useState(false);
  const [openSensorSetting, setOpenSensorSetting] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // Data
  const [cameraList, setCameraList] = useState<Camera[]>([])
  const [selectedRow, setSelectedRow] = useState<Camera | null>(null)
  const [formData, setFormData] = useState<FormData>({
    cameraName: "",
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(SETTING_ROW_PER_PAGES[SETTING_ROW_PER_PAGES.length - 1]);
  const [rowsPerPageOptions] = useState(SETTING_ROW_PER_PAGES);

  const cameraRefreshKey = useSelector((state: RootState) => state.refresh.cameraRefreshKey);

  useEffect(() => {
    fetchCameras(page, rowsPerPage);

    return () => {
      setCameraList([]);
    }
  }, [cameraRefreshKey]);

  const fetchCameras = async (page: number, limit: number, filter?: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      setIsLoading(true);
      const response = await fetchClient<CameraResponse>(combineURL(CENTER_API, "/cameras/get"), {
        method: "GET",
        signal: controller.signal,
        queryParams: {
          page: page.toString(),
          limit: limit.toString(),
          ...(filter ? { filter } : { filter: "deleted=0" })
        }
      })

      if (response.success) {
        const updated = await Promise.all(
          response.data.map(async (camera: Camera) => {
            const { 
              checkpoint_name,
              organization,
              serial_number,
              license_key, 
            } = await fetchCheckpointInfo(camera.checkpoint_uid);
            return {
              ...camera,
              checkpoint_name,
              organization,
              serial_number,
              license_key,
            }
          })
        );
        setCameraList(updated);
        setTotalPages(prev => {
          if (prev > response.pagination.maxPage) {
            return response.pagination.maxPage;
          }
          else {
            return prev;
          }
        })
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-fetching-data'), errorMessage, "error");
    }
    finally {
      clearTimeout(timeoutId);
      setTimeout(() => {
        setIsLoading(false);
      }, 500)
    }
  }

  const fetchCheckpointInfo = async (checkpoint_uid: string) => {
    let checkpoint_name = "";
    let organization = "";
    let serial_number = "" as string | null;
    let license_key = "" as string | null;
    try {
      const response = await fetchClient<CheckpointResponse>(combineURL(CENTER_API, "/checkpoints/get"), {
        method: "GET",
        queryParams: { 
          filter: `checkpoint_uid:${checkpoint_uid}`
        },
      });

      if (response.data) {
        checkpoint_name = response.data[0].checkpoint_name;
        organization = response.data[0].organization;
        serial_number = response.data[0].serial_number;
        license_key = response.data[0].license_key;
      }

      return {
        checkpoint_name,
        organization,
        serial_number,
        license_key,
      };
    } 
    catch (error) {
      return {
        checkpoint_name,
        organization,
        serial_number,
        license_key,
      };
    }
  }

  const handleTextChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleEdit = (data: Camera) => {
    setIsEdit(true);
    setOpenCameraSetting(true);
    setSelectedRow(data);
  }

  const handleRowsPerPageChange = async (event: SelectChangeEvent) => {
    setRowsPerPage(parseInt(event.target.value));
  };

  const handlePageChange = async (event: React.ChangeEvent<unknown>, value: number) => {
    event.preventDefault();
    setPage(value);
  };

  const handlePageInputKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
  
      setPage(pageInput);
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

  const handleCameraSettingClose = async () => {
    setOpenCameraSetting(false);
    const filter = formData.cameraName ? `camera_name~${formData.cameraName},deleted=0` : "";
    setCameraList([]);
    await fetchCameras(page, rowsPerPage, filter);
  }

  const handleSensorSettingClose = async () => {
    setSelectedRow(null);
    setOpenSensorSetting(false);
    await fetchCameras(page, rowsPerPage);
  }

  const handleSensorSettingClick = (item: Camera) => {
    setSelectedRow(item);
    setOpenSensorSetting(true);
  }

  const handleSearchClick = async () => {
    setCameraList([]);
    const filter = formData.cameraName ? `camera_name~${formData.cameraName},deleted=0` : "";
    await fetchCameras(page, rowsPerPage, filter);
  }

  return (
    <div id='setting' className={`main-content ${isOpen ? "pl-[130px]" : "pl-[10px]"} transition-all duration-500`}>
      { isLoading && <Loading /> }
      <div className='flex flex-col w-full gap-3 pr-[20px]'>
        {/* Header */}
        <Typography variant="h5" color="white" className="font-bold">{t('screen.setting.title')}</Typography>

        {/* Filter Part */}
        <div className='grid grid-cols-3'>
          <div className='flex items-end justify-center gap-3'>
            <TextBox
              sx={{ marginTop: "10px", fontSize: "15px" }}
              id="name"
              label={t('component.search-camera-id')}
              placeholder={t('placeholder.search-camera-id')}
              value={formData.cameraName}
              onChange={(event) =>
                handleTextChange("cameraName", event.target.value)
              }
            />
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
              onClick={handleSearchClick}
            >
              {t('button.search')}
            </Button>
          </div>
        </div>

        <div className='flex flex-col gap-3 mt-2'>
          <Typography variant="h6" color="white" className="font-bold">{t('text.camera-list')}</Typography>
          <label>{`${t('table.amount')} ${formatNumber(cameraList.length)} ${t('table.list')}`}</label>
        </div>

        {/* Result Table */}
        <div>
          <TableContainer
            component={Paper} 
            className='mt-2'
            sx={{ height: "60vh", backgroundColor: "transparent" }}
          >
            <Table sx={{ minWidth: 650, backgroundColor: "#48494B"}}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#242727", position: "sticky", top: 0, zIndex: 1 }}>
                  <TableCell align="center" sx={{ color: "#FFFFFF", width: "2%" }}>{t('table.column.no')}</TableCell>
                  <TableCell align="center" sx={{ color: "#FFFFFF", width: "5%" }}>{t('table.column.camera-status')}</TableCell>
                  <TableCell align="center" sx={{ color: "#FFFFFF", width: "10%" }}>{t('table.column.camera-id')}</TableCell>
                  <TableCell align="center" sx={{ color: "#FFFFFF", width: "10%" }}>{t('table.column.camera-location')}</TableCell>
                  <TableCell align="center" sx={{ color: "#FFFFFF", width: "5%" }}>{t('table.column.camera-detect')}</TableCell>
                  <TableCell align="center" sx={{ color: "#FFFFFF", width: "2%" }}>{t('table.column.camera-sensor-setting')}</TableCell>
                  <TableCell align="center" sx={{ color: "#FFFFFF", width: "2%" }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ backgroundColor: "#48494B" }}>
                {
                  cameraList.map((data, index) => 
                    <TableRow 
                      key={index} 
                      sx={{
                        '& td, & th': { borderBottom: '1px dashed #ADADAD' }
                      }}
                    >
                      <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", height: "83px", textAlign: "center" }}>
                        {index + 1}
                      </TableCell>
                      <TableCell sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", height: "83px", textAlign: "center" }}>
                        {
                          (() => {
                            const color = data.active === 1 ? "bg-[#4CB64C]" : "bg-[#ADADAD]";
                            return (
                              <label
                                className={`w-[80px] h-[30px] inline-flex items-center justify-center rounded
                                ${color}`}
                              >
                                { data.active === 1 ? t('text.active') : t('text.inactive') }
                              </label>
                            )
                          })()
                        }
                      </TableCell>
                      <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", height: "83px", textAlign: "center" }}>
                        {data.camera_name}
                      </TableCell>
                      <TableCell sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", height: "83px", textAlign: "center" }}>
                        {`${data.latitude}, ${data.longitude}`}
                      </TableCell>
                      <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", height: "83px", textAlign: "end" }}>
                        {formatNumber(data.detection_count)}
                      </TableCell>
                      <TableCell sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", height: "83px", textAlign: "center" }}>
                        <Button onClick={() => handleSensorSettingClick(data)}>
                          <img 
                            src={`/icons/sensor-setting${data.detection_area !== "" ? "-green" : ""}.png`}
                            style={{ height: "30px", width: "30px" }} 
                            alt="Sensor Setting" 
                          />
                        </Button>
                      </TableCell>
                      <TableCell align="center"
                        sx={{ backgroundColor: "#48494B", color: "#FFFFFF", height: "83px" }}
                        className='flex justify-center items-center'
                      >
                        <div className='flex items-center justify-center gap-1'>
                          <IconButton
                            sx={{
                              borderRadius: "4px !important",
                            }}
                            onClick={() => handleEdit(data)}
                          >
                            <Pencil color='#FFFFFF' size={20} />
                          </IconButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                }
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Part */}
          <div className={`flex items-center justify-between bg-[var(--background-color)] py-3 pl-1 sticky bottom-0`}>
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

        {/* Modules */}
        <CameraSetting open={openCameraSetting} onClose={handleCameraSettingClose} selectedRow={selectedRow} isEdit={isEdit} />
        <SensorSetting open={openSensorSetting} onClose={handleSensorSettingClose} selectedRow={selectedRow} />
      </div>
    </div>
  )
}

export default Setting;