import React, { useState, useEffect } from 'react'
import { 
  Typography,
  Button,
  Tabs,
  Tab,
  Box,
  Stack,
  IconButton,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  SelectChangeEvent,
  Checkbox,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";

// Types
import { Camera, CameraResponse, CheckpointResponse } from "../../features/types";

// Icons
import { Search } from 'lucide-react';

// Context
import { useHamburger } from "../../context/HamburgerContext";

// Components
import Loading from "../../components/loading/Loading";
import TextBox from '../../components/text-box/TextBox';
import PaginationComponent from '../../components/pagination/Pagination';

// i18n
import { useTranslation } from 'react-i18next';

// Config
import { getUrls } from '../../config/runtimeConfig';

// Utils
import { formatNumber } from "../../utils/commonFunction";
import { fetchClient, combineURL } from "../../utils/fetchClient";
import { PopupMessage, PopupMessageWithCustomImage } from '../../utils/popupMessage';

// Mocks
import { mockCheckpointCameras } from "../../mocks/mockCheckpointCameras";

// Constant
import { MANAGE_CHECKPOINT_CAMERAS_ROW_PER_PAGES } from "../../constants/dropdown";

interface FormData {
  searchText: string
};

interface ManageCheckpointCamerasProps {

}

const ManageCheckpointCameras: React.FC<ManageCheckpointCamerasProps> = ({}) => {
  const { isOpen } = useHamburger();
  const { CENTER_API } = getUrls();

  // i18n
  const { t } = useTranslation();

  // State
  const [isLoading, setIsLoading] = useState(false);

  // Data
  const [tabValue, setTabValue] = React.useState(0);
  const [requestDeleteCameraData, setRequestDeleteCameraData] = useState<Camera[]>([]);
  const [deletedCameraData, setDeletedCameraData] = useState<Camera[]>([]);
  const [requestDeleteCameraTotalData, setRequestDeleteCameraTotalData] = useState(0);
  const [deletedCameraTotalData, setDeletedCameraTotalData] = useState(0);
  const [requestDeleteCameraSelectId, setRequestDeleteCameraSelectId] = useState<string[]>([]);
  const [deletedCameraSelectId, setDeletedCameraSelectId] = useState<string[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(MANAGE_CHECKPOINT_CAMERAS_ROW_PER_PAGES[MANAGE_CHECKPOINT_CAMERAS_ROW_PER_PAGES.length - 1]);
  const [rowsPerPageOptions] = useState(MANAGE_CHECKPOINT_CAMERAS_ROW_PER_PAGES);

  const [formData, setFormData] = useState<FormData>({
    searchText: "",
  });

  const requestDeleteCameraRefreshKey = useSelector((state: RootState) => state.refresh.requestDeleteCameraRefreshKey);

  const a11yProps = (index: number) => {
    return {
      id: `tab-${index}`
    };
  };

  useEffect(() => {
    setTabValue(0);
    fetchRequestDeleteCamera();

    return () => {
      setRequestDeleteCameraData([]);
      setDeletedCameraData([]);
    }
  }, [requestDeleteCameraRefreshKey]);

  useEffect(() => {
    return () => {
      clearData();
    }
  }, [])

  useEffect(() => {
    if (tabValue === 0) {
      fetchRequestDeleteCamera();
    }
    else if (tabValue === 1) {
      fetchDeletedCamera();
    }
  }, [tabValue])

  const fetchRequestDeleteCamera = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      setIsLoading(true);
      const response = await fetchClient<CameraResponse>(combineURL(CENTER_API, "/cameras/get"), {
        method: "GET",
        signal: controller.signal,
        queryParams: { 
          filter: `request_delete=true${formData.searchText && formData.searchText.trim().length > 0 ? `,camera_name~${formData.searchText}*` : ""}`,
          page: "1",
          limit: "100",
        },
      });

      if (response.success) {
        const updated = await Promise.all(
          response.data.map(async (camera: Camera) => {
            const { checkpoint_name } = await fetchCheckpointInfo(camera.checkpoint_uid);
            return {
              ...camera,
              checkpoint_name,
            }
          })
        );
        setRequestDeleteCameraData(updated);
        setRequestDeleteCameraSelectId([]);
        setRequestDeleteCameraTotalData(response.pagination.countAll);
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setRequestDeleteCameraData([]);
      PopupMessage(t('message.error.error-while-fetching-data'), errorMessage, "error");
    }
    finally {
      clearTimeout(timeoutId);
      setTimeout(() => {
        setIsLoading(false);
      }, 500)
    }
  }

  const fetchDeletedCamera = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      setIsLoading(true);
      const response = await fetchClient<CameraResponse>(combineURL(CENTER_API, "/cameras/get"), {
        method: "GET",
        signal: controller.signal,
        queryParams: { 
          filter: `deleted=1${formData.searchText && formData.searchText.trim().length > 0 ? `,camera_name~${formData.searchText}` : ""}`,
          page: page.toString(),
          limit: rowsPerPage.toString(),
        },
      });

      if (response.success) {
        const updated = await Promise.all(
          response.data.map(async (camera: Camera) => {
            const { checkpoint_name } = await fetchCheckpointInfo(camera.checkpoint_uid);
            return {
              ...camera,
              checkpoint_name,
            }
          })
        );
        setDeletedCameraData(updated);
        setTotalPages(response.pagination.maxPage);
        setDeletedCameraTotalData(response.pagination.countAll);
        setDeletedCameraSelectId([]);
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setDeletedCameraData([]);
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
    try {
      const response = await fetchClient<CheckpointResponse>(combineURL(CENTER_API, "/checkpoints/get"), {
        method: "GET",
        queryParams: { 
          filter: `checkpoint_uid:${checkpoint_uid}`
        },
      });

      if (response.data) {
        checkpoint_name = response.data[0].checkpoint_name;
      }

      return {
        checkpoint_name,
      };
    } 
    catch (error) {
      return {
        checkpoint_name,
      };
    }
  }

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    event.stopPropagation();
    setTabValue(newValue);
  };

  const handleTextChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearchClick = async () => {
    if (tabValue === 0) {
      await fetchRequestDeleteCamera();
    }
    else {
      await fetchDeletedCamera();
    }
  }

  const handleRowsPerPageChange = async (event: SelectChangeEvent) => {
    const limit = parseInt(event.target.value)
    setRowsPerPage(limit);
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

  const checkAllRequestDeleteCamera = () => {
    const allSelectedIds = requestDeleteCameraData.map((data) => data.camera_uid);
  
    setRequestDeleteCameraSelectId((prevChecked) => {
      const allSelected = allSelectedIds.every((id) => prevChecked.includes(id));
  
      if (allSelected) {
        return prevChecked.filter((id) => !allSelectedIds.includes(id));
      } 
      else {
        return Array.from(new Set([...prevChecked, ...allSelectedIds]));
      }
    });
  };

  const checkRequestDeleteCamera = (cameraUid: string) => {
    setRequestDeleteCameraSelectId((prevChecked) => {
      const isChecked = prevChecked.includes(cameraUid);
  
      if (isChecked) {
        return prevChecked.filter((prevId) => prevId !== cameraUid);
      } 
      else {
        return [...prevChecked, cameraUid];
      }
    });
  };

  const checkAllDeletedCamera = () => {
    const allSelectedIds = deletedCameraData.map((data) => data.camera_uid);
  
    setDeletedCameraSelectId((prevChecked) => {
      const allSelected = allSelectedIds.every((id) => prevChecked.includes(id));
  
      if (allSelected) {
        return prevChecked.filter((id) => !allSelectedIds.includes(id));
      } 
      else {
        return Array.from(new Set([...prevChecked, ...allSelectedIds]));
      }
    });
  };

  const checkDeletedCamera = (cameraUid: string) => {
    setDeletedCameraSelectId((prevChecked) => {
      const isChecked = prevChecked.includes(cameraUid);
  
      if (isChecked) {
        return prevChecked.filter((prevId) => prevId !== cameraUid);
      } 
      else {
        return [...prevChecked, cameraUid];
      }
    });
  };

  const handleApproveAllCamera = async () => {
    const confirm = await PopupMessageWithCustomImage(
                      t('message.camera.delete-approve'),
                      "",
                      t('button.ok'),
                      "/svg/delete-approve.svg",
                      "Delete Approve"
                    );

    if (!confirm) return;

    await postDeleteApproveAllCamera(true);
  }

  const handleApproveSelectCamera = async (cameraUid: string) => {
    const confirm = await PopupMessageWithCustomImage(
                      t('message.camera.delete-approve'),
                      "",
                      t('button.ok'),
                      "/svg/delete-approve.svg",
                      "Delete Approve"
                    );

    if (!confirm) return;

    await postDeleteApproveSingleCamera(cameraUid, true);
  }

  const handleUnapproveAllCamera = async () => {
    const confirm = await PopupMessageWithCustomImage(
                      t('message.camera.delete-unapprove'),
                      "",
                      t('button.ok'),
                      "/svg/delete-unapprove.svg",
                      "Delete Unapprove"
                    );

    if (!confirm) return;

    await postDeleteApproveAllCamera(false);
  }

  const handleUnapproveSelectCamera = async (cameraUid: string) => {
    const confirm = await PopupMessageWithCustomImage(
                      t('message.camera.delete-unapprove'),
                      "",
                      t('button.ok'),
                      "/svg/delete-unapprove.svg",
                      "Delete Unapprove"
                    );

    if (!confirm) return;

    await postDeleteApproveSingleCamera(cameraUid, false);
  }

  const handleActiveAllCamera = async () => {
    const confirm = await PopupMessageWithCustomImage(
                      t('message.camera.active-camera'),
                      "",
                      t('button.ok'),
                      "/svg/active-camera.svg",
                      "Active Camera"
                    );

    if (!confirm) return;

    await postReactiveAllCamera();
  }

  const handleActiveSelectCamera = async (cameraUid: string) => {
    const confirm = await PopupMessageWithCustomImage(
                      t('message.camera.active-camera'),
                      "",
                      t('button.ok'),
                      "/svg/active-camera.svg",
                      "Active Camera"
                    );

    if (!confirm) return;

    await postReactiveSingleCamera(cameraUid);
  }

  const postDeleteApproveSingleCamera = async (cameraUid: string, approved: boolean) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      setIsLoading(true);
      const response = await fetchClient<CameraResponse>(combineURL(CENTER_API, "/cameras/delete-approve"), {
        method: "POST",
        signal: controller.signal,
        body: JSON.stringify({
          camera_uid: cameraUid,
          approved,
        })
      });

      if (response.success) {
        await fetchRequestDeleteCamera();
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      PopupMessage(t('message.error.error-while-saving'), errorMessage, "error");
    }
    finally {
      clearTimeout(timeoutId);
      setTimeout(() => {
        setIsLoading(false);
      }, 500)
    }
  }

  const postDeleteApproveAllCamera = async (approved: boolean) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      setIsLoading(true);
      
      const requests = requestDeleteCameraSelectId
        .map(cameraUid => 
          fetchClient<CameraResponse>(combineURL(CENTER_API, "/cameras/delete-approve"), {
            method: "POST",
            signal: controller.signal,
            body: JSON.stringify({
              camera_uid: cameraUid,
              approved,
            })
          })
        );

      await Promise.all(requests);
      await fetchRequestDeleteCamera();
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      PopupMessage(t('message.error.error-while-saving'), errorMessage, "error");
    }
    finally {
      clearTimeout(timeoutId);
      setTimeout(() => {
        setIsLoading(false);
      }, 500)
    }
  }

  const postReactiveSingleCamera = async (cameraUid: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      setIsLoading(true);
      const response = await fetchClient<CameraResponse>(combineURL(CENTER_API, "/cameras/reactivate"), {
        method: "POST",
        signal: controller.signal,
        body: JSON.stringify({
          camera_uid: cameraUid,
        })
      });

      if (response.success) {
        await fetchDeletedCamera();
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      PopupMessage(t('message.error.error-while-saving'), errorMessage, "error");
    }
    finally {
      clearTimeout(timeoutId);
      setTimeout(() => {
        setIsLoading(false);
      }, 500)
    }
  }

  const postReactiveAllCamera = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      setIsLoading(true);
      
      const requests = deletedCameraSelectId
        .map(cameraUid => 
          fetchClient<CameraResponse>(combineURL(CENTER_API, "/cameras/reactivate"), {
            method: "POST",
            signal: controller.signal,
            body: JSON.stringify({
              camera_uid: cameraUid,
            })
          })
        );

      await Promise.all(requests);
      await fetchDeletedCamera();
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      PopupMessage(t('message.error.error-while-saving'), errorMessage, "error");
    }
    finally {
      clearTimeout(timeoutId);
      setTimeout(() => {
        setIsLoading(false);
      }, 500)
    }
  }

  const clearData = () => {
    setRequestDeleteCameraTotalData(0);
    setDeletedCameraTotalData(0);
    setRequestDeleteCameraData([]);
    setDeletedCameraData([]);
    setRequestDeleteCameraSelectId([]);
    setDeletedCameraSelectId([]);
    setPage(1);
    setPageInput(1);
    setTotalPages(1);
    setTabValue(0);
    setFormData({
      searchText: "",
    });
  }

  return (
    <div id='manage-checkpoint-cameras' className={`main-content ${isOpen ? "pl-[130px]" : "pl-2.5"} pr-2.5 transition-all duration-500`}>
      { isLoading && <Loading /> }

      <div className='flex flex-col w-full gap-3 pr-5'>
        {/* Header */}
        <Typography variant="h5" color="white" className="font-bold">{t('screen.manage-checkpoint-camera.title')}</Typography>

        {/* Filter Part */}
        <div className='grid grid-cols-3'>
          <div className='flex items-end justify-center gap-3'>
            <TextBox
              sx={{ marginTop: "10px", fontSize: "15px" }}
              id="search-cameras"
              label=""
              placeholder={t('placeholder.cameras')}
              value={formData.searchText}
              onChange={(event) =>
                handleTextChange("searchText", event.target.value)
              }
            />
            <Button
              variant="contained"
              className="primary-btn"
              startIcon={<Search />}
              sx={{
                width: t('button.search-width'),
                height: "40px",
                textTransform: 'capitalize',
              }}
              onClick={handleSearchClick}
            >
              {t('button.search')}
            </Button>
          </div>
        </div>

        <div className='flex flex-col'>
          <Box 
            sx={{ borderColor: 'divider' }}
          >
            <Tabs 
              value={tabValue} 
              onChange={handleChange} 
              className="h-full bg-black border border-[#2B9BED] rounded-t-[5px]"
              sx={{
                "& .MuiTabs-indicator": {
                  backgroundColor: "transparent !important",
                },
                "& .MuiTab-root": {
                  color: "#ADADAD",
                },
                "& .Mui-selected": {
                  color: "white !important",
                  backgroundColor: "#2B9BED",
                  borderTopRightRadius: "3px",
                  borderTopLeftRadius: "3px",
                },
              }}
              style={{
                width: t('tab.camera-tab-width')
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
                    <span>{t('tab.delete-camera-approve')}</span>
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
                    <span>{t('tab.active-camera')}</span>
                  </Stack>
                }
                {...a11yProps(1)}
                sx={{ flex: 1, padding: "12px 5px" }}
              />
            </Tabs>
          </Box>
          {/* Delete Camera Approve */}
          {
            tabValue === 0 && (
              <div className='flex flex-col gap-3 p-3 border-[#2B9BED] border'>
                <Typography variant="h5" color="white" className="font-bold">{t('text.delete-camera-approve-list')}</Typography>
              
                <div className='flex justify-between'>
                  <div className='flex justify-center items-center'>
                    <label>{`${t('table.amount')} ${formatNumber(requestDeleteCameraTotalData)} ${t('table.list')}`}</label>
                  </div>
                  <div className='flex gap-2'>
                    <IconButton 
                      className="approve-unapprove-btn"
                      sx={{
                        borderRadius: "5px !important",
                        "&.Mui-disabled img": {
                          filter: "brightness(0) invert(1)",
                        },
                      }}
                      disabled={requestDeleteCameraSelectId.length === 0}
                      onClick={handleApproveAllCamera}
                    >
                      <img src="/svg/approve-icon.svg" alt="Approve Icon" className='w-6 h-6' />
                    </IconButton>
                    <IconButton 
                      className="approve-unapprove-btn"
                      sx={{
                        borderRadius: "5px !important",
                        "&.Mui-disabled img": {
                          filter: "brightness(0) invert(1)",
                        },
                      }}
                      disabled={requestDeleteCameraSelectId.length === 0}
                      onClick={handleUnapproveAllCamera}
                    >
                      <img src="/svg/unapprove-icon.svg" alt="Unapprove Icon" className='w-6 h-6' />
                    </IconButton>
                  </div>
                </div>

                {/* Table */}
                <TableContainer
                  component={Paper} 
                  sx={{ height: "60vh", backgroundColor: "transparent" }}
                >
                  <Table sx={{ minWidth: 650, backgroundColor: "#48494B"}}>
                    <TableHead>
                      <TableRow 
                        sx={{ 
                          backgroundColor: "#242727", 
                          position: "sticky", 
                          top: 0, 
                          zIndex: 1, 
                          '& td, & th': { borderBottom: 'none' } 
                        }}
                      >
                        <TableCell align="center" sx={{ color: "#FFFFFF", width: "2%" }}>
                          <div className='flex justify-center items-center'>
                            <Checkbox
                              sx={{
                                color: "#FFFFFF",
                                '& .MuiSvgIcon-root': {
                                  fontSize: 28,
                                },
                                width: "10px",
                                height: "10px",
                                '&.Mui-disabled': {
                                  color: '#888888',
                                },
                              }}
                              checked={requestDeleteCameraData.length === requestDeleteCameraSelectId.length && requestDeleteCameraSelectId.length !== 0}
                              onChange={checkAllRequestDeleteCamera}
                              disabled={requestDeleteCameraData.length === 0}
                            />
                          </div>
                        </TableCell>
                        <TableCell align="center" sx={{ color: "#FFFFFF", width: "2%" }}>{t('table.column.no')}</TableCell>
                        <TableCell align="center" sx={{ color: "#FFFFFF", width: "10%" }}>{t('table.column.station')}</TableCell>
                        <TableCell align="center" sx={{ color: "#FFFFFF", width: "5%" }}>{t('table.column.camera-status')}</TableCell>
                        <TableCell align="center" sx={{ color: "#FFFFFF", width: "10%" }}>{t('table.column.camera-id')}</TableCell>
                        <TableCell align="center" sx={{ color: "#FFFFFF", width: "10%" }}>{t('table.column.camera-location')}</TableCell>
                        <TableCell align="center" sx={{ color: "#FFFFFF", width: "15%" }}>{t('table.column.reason-to-delete')}</TableCell>
                        <TableCell colSpan={2} align="center" sx={{ color: "#FFFFFF", width: "5%" }}>{t('table.column.approve-to-delete-camera')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody sx={{ backgroundColor: "#48494B" }}>
                      {
                        requestDeleteCameraData.map((data, index) => (
                          <TableRow 
                            key={index} 
                            sx={{
                              '& td, & th': { borderBottom: '1px dashed #ADADAD' }
                            }}
                          >
                            <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", height: "83px", textAlign: "center" }}>
                              <div className="flex items-center justify-center">
                                <Checkbox
                                  sx={{
                                    color: "#FFFFFF",
                                    '& .MuiSvgIcon-root': {
                                      fontSize: 28,
                                    },
                                    width: "10px",
                                    height: "10px",
                                  }}
                                  checked={requestDeleteCameraSelectId.includes(data.camera_uid)}
                                  onChange={() =>  checkRequestDeleteCamera(data.camera_uid)}
                                />
                              </div>
                            </TableCell>
                            <TableCell sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", height: "83px", textAlign: "center" }}>
                              {index + 1}
                            </TableCell>
                            <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", height: "83px" }}>
                              {data.checkpoint_name}
                            </TableCell>
                            <TableCell sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", height: "83px", textAlign: "center" }}>
                              {
                                (() => {
                                  const color = data.active === 1 ? "bg-[#4CB64C]" : "bg-[#ADADAD]";
                                  return (
                                    <label
                                      className={`w-20 h-[30px] inline-flex items-center justify-center rounded
                                      ${color}`}
                                    >
                                      { data.active === 1 ? t('text.on') : t('text.off') }
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
                            <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", height: "83px", textAlign: "center" }}>
                              {data.request_delete_reason}
                            </TableCell>
                            <TableCell sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", height: "83px", textAlign: "center" }}>
                              <IconButton 
                                className="approve-unapprove-btn"
                                sx={{
                                  borderRadius: "5px !important",
                                  "&.Mui-disabled img": {
                                    filter: "brightness(0) invert(1)",
                                  },
                                }}
                                onClick={() => handleApproveSelectCamera(data.camera_uid)}
                              >
                                <img src="/svg/approve-icon.svg" alt="Approve Icon" className='w-6 h-6' />
                              </IconButton>
                            </TableCell>
                            <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", height: "83px", textAlign: "center" }}>
                              <IconButton 
                                className="approve-unapprove-btn"
                                sx={{
                                  borderRadius: "5px !important",
                                  "&.Mui-disabled img": {
                                    filter: "brightness(0) invert(1)",
                                  },
                                }}
                                onClick={() => handleUnapproveSelectCamera(data.camera_uid)}
                              >
                                <img src="/svg/unapprove-icon.svg" alt="Unapprove Icon" className='w-6 h-6' />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      }
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            )
          }
          {/* Active Camera */}
          {
            tabValue === 1 && (
              <>
                <div className='flex flex-col gap-3 p-3 border-[#2B9BED] border'>
                  <Typography variant="h5" color="white" className="font-bold">{t('text.deleted-camera-list')}</Typography>
                
                  <div className='flex justify-between'>
                    <div className='flex justify-center items-center'>
                      <label>{`${t('table.amount')} ${formatNumber(deletedCameraTotalData)} ${t('table.list')}`}</label>
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        variant="contained"
                        className="camera-active-btn"
                        sx={{ 
                          width: t('button.camera-active-width'), 
                          height: "30px",
                          textTransform: "capitalize",
                        }}
                        disabled={deletedCameraSelectId.length === 0}
                        onClick={handleActiveAllCamera}
                      >
                        {t('button.camera-active')}
                      </Button>
                    </div>
                  </div>

                  {/* Table */}
                  <TableContainer
                    component={Paper} 
                    sx={{ height: "56vh", backgroundColor: "transparent" }}
                  >
                    <Table sx={{ minWidth: 650, backgroundColor: "#48494B"}}>
                      <TableHead>
                        <TableRow 
                          sx={{ 
                            backgroundColor: "#242727", 
                            position: "sticky", 
                            top: 0, 
                            zIndex: 1, 
                            '& td, & th': { borderBottom: 'none' } 
                          }}
                        >
                          <TableCell align="center" sx={{ color: "#FFFFFF", width: "2%" }}>
                            <div className='flex justify-center items-center'>
                              <Checkbox
                                sx={{
                                  color: "#FFFFFF",
                                  '& .MuiSvgIcon-root': {
                                    fontSize: 28,
                                  },
                                  width: "10px",
                                  height: "10px",
                                  '&.Mui-disabled': {
                                    color: '#888888',
                                  },
                                }}
                                checked={deletedCameraData.length === deletedCameraSelectId.length && deletedCameraSelectId.length !== 0}
                                onChange={checkAllDeletedCamera}
                                disabled={deletedCameraData.length === 0}
                              />
                            </div>
                          </TableCell>
                          <TableCell align="center" sx={{ color: "#FFFFFF", width: "2%" }}>{t('table.column.no')}</TableCell>
                          <TableCell align="center" sx={{ color: "#FFFFFF", width: "10%" }}>{t('table.column.station')}</TableCell>
                          <TableCell align="center" sx={{ color: "#FFFFFF", width: "5%" }}>{t('table.column.camera-status')}</TableCell>
                          <TableCell align="center" sx={{ color: "#FFFFFF", width: "10%" }}>{t('table.column.camera-id')}</TableCell>
                          <TableCell align="center" sx={{ color: "#FFFFFF", width: "10%" }}>{t('table.column.camera-location')}</TableCell>
                          <TableCell align="center" sx={{ color: "#FFFFFF", width: "3%" }}>{t('table.column.camera-active')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody sx={{ backgroundColor: "#48494B" }}>
                        {
                          deletedCameraData.map((data, index) => (
                            <TableRow 
                              key={index} 
                              sx={{
                                '& td, & th': { borderBottom: '1px dashed #ADADAD' }
                              }}
                            >
                              <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", height: "83px", textAlign: "center" }}>
                                <div className="flex items-center justify-center">
                                  <Checkbox
                                    sx={{
                                      color: "#FFFFFF",
                                      '& .MuiSvgIcon-root': {
                                        fontSize: 28,
                                      },
                                      width: "10px",
                                      height: "10px",
                                    }}
                                    checked={deletedCameraSelectId.includes(data.camera_uid)}
                                    onChange={() =>  checkDeletedCamera(data.camera_uid)}
                                  />
                                </div>
                              </TableCell>
                              <TableCell sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", height: "83px", textAlign: "center" }}>
                                {index + 1}
                              </TableCell>
                              <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", height: "83px" }}>
                                {data.checkpoint_name}
                              </TableCell>
                              <TableCell sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", height: "83px", textAlign: "center" }}>
                                {
                                  (() => {
                                    const color = data.active === 1 ? "bg-[#4CB64C]" : "bg-[#ADADAD]";
                                    return (
                                      <label
                                        className={`w-20 h-[30px] inline-flex items-center justify-center rounded
                                        ${color}`}
                                      >
                                        { data.active === 1 ? t('text.on') : t('text.off') }
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
                              <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", height: "83px", textAlign: "center" }}>
                                <Button
                                  variant="contained"
                                  className="camera-active-btn"
                                  sx={{ 
                                    width: t('button.camera-active-width'),
                                    height: "30px",
                                    textTransform: "capitalize",
                                  }}
                                  onClick={() => handleActiveSelectCamera(data.camera_uid)}
                                >
                                  {t('button.camera-active')}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        }
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>

                <div className={`${mockCheckpointCameras.length > 0 ? "flex" : "hidden"} items-center justify-between bg-(--background-color) py-3 pl-1 sticky bottom-0`}>
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
              </>
            )
          }
        </div>
      </div>
    </div>
  )
}

export default ManageCheckpointCameras;