import React, { useEffect, useState } from 'react'
import { 
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  SelectChangeEvent
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import dayjs from 'dayjs'
import buddhistEra from 'dayjs/plugin/buddhistEra'

// Components
import Loading from "../../components/loading/Loading";
import PaginationComponent from '../../components/pagination/Pagination';
import Image from '../../components/image/Image';

// Icons
import { Import, Plus, Pencil, Trash2, Download } from 'lucide-react';

// Context
import { useHamburger } from "../../context/HamburgerContext";

// Mocks
import { mockSpecialPlates } from "../../mocks/mockSpecialPlates";

// Constant
import { PLATE_SEARCH_WITH_CONDITION_ROW_PER_PAGES } from "../../constants/dropdown";

// Modules
import SearchFilter, { FormData } from './search-filter/SearchFilter';
import ManageSpecialPlate from './manage-special-plate/ManageSpecialPlate';
import ImportFile from './import-file/ImportFile';

// i18n
import { useTranslation } from 'react-i18next';

// Config
import { getUrls } from '../../config/runtimeConfig';

// Utils
import { fetchClient, combineURL } from "../../utils/fetchClient";
import { PopupMessage, PopupMessageWithCancel } from '../../utils/popupMessage';
import { formatNumber } from '../../utils/commonFunction';

// Types
import { SpecialPlateResponse, SpecialPlate, SpecialPlateFilesResponse, FileDataResponse } from "../../features/types";

dayjs.extend(buddhistEra)

interface SpecialPlateProps {

}

const SpecialPlatePage: React.FC<SpecialPlateProps> = ({}) => {
  const { isOpen } = useHamburger();
  const { CENTER_API, CENTER_FILE_URL } = getUrls();

  // State
  const [isFileImportOpen, setIsFileImportOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openManageSpecialPlate, setOpenManageSpecialPlate] = useState(false);

  // Data
  const [specialPlateList, setSpecialPlateList] = useState<SpecialPlate[]>([]);
  const [selectedRow, setSelectedRow] = useState<SpecialPlate | null>(null)

  // Pagination
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PLATE_SEARCH_WITH_CONDITION_ROW_PER_PAGES[PLATE_SEARCH_WITH_CONDITION_ROW_PER_PAGES.length - 1]);
  const [rowsPerPageOptions] = useState(PLATE_SEARCH_WITH_CONDITION_ROW_PER_PAGES);

  // i18n
  const { t, i18n } = useTranslation();

  const bc = new BroadcastChannel("specialPlateChannel");

  const sliceDropdown = useSelector(
    (state: RootState) => state.dropdownData
  );

  useEffect(() => {
    fetchSpecialPlates(page, rowsPerPage);
  }, [])

  const fetchSpecialPlates = async (page: number, limit: number, filter?: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      setIsLoading(true);
      const response = await fetchClient<SpecialPlateResponse>(combineURL(CENTER_API, "/special-plates/get"), {
        method: "GET",
        signal: controller.signal,
        queryParams: {
          page: page.toString(),
          limit: limit.toString(),
          ...(filter ? { filter } : {filter: "deleted=0"})
        }
      })

      if (response.success) {
        setSpecialPlateList(response.data);
        await Promise.all(
          response.data.map(async (data) => {
            await fetchSpecialPlateImages(data.id);
            await fetchSpecialPlateFiles(data.id);
          })
        );
        setTotalPages(response.pagination.maxPage);
        setTotalData(response.pagination.countAll);
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

  const fetchSpecialPlateImages = async (id: number) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetchClient<FileDataResponse>(combineURL(CENTER_API, "/special-plate-images/get"), {
        method: "GET",
        signal: controller.signal,
        queryParams: {
          filter: `special_plate_id=${id}`
        }
      })

      if (response.success) {
        setSpecialPlateList((prevList) =>
          prevList.map((item) =>
            item.id === id ? { ...item, imagesData: response.data } : item
          )
        );
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

  const fetchSpecialPlateFiles = async (id: number) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetchClient<FileDataResponse>(combineURL(CENTER_API, "/special-plate-files/get"), {
        method: "GET",
        signal: controller.signal,
        queryParams: {
          filter: `special_plate_id=${id}`
        }
      })

      if (response.success) {
        setSpecialPlateList((prevList) =>
          prevList.map((item) =>
            item.id === id ? { ...item, filesData: response.data } : item
          )
        );
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

  const handleEdit = (data: SpecialPlate) => {
    setSelectedRow(data);
    setOpenManageSpecialPlate(true);
  }

  const handleDownload = (data: SpecialPlate) => {
    setSelectedRow(data);
    alert(data.id)
  }

  const handleDelete = async (id: number) => {
    try {
      const confirmed = await PopupMessageWithCancel(t('message.warning.delete-confirmation'), t('message.warning.delete-confirmation-message'), t('button.confirm'), t('button.cancel'), "warning", "#b91c1c")
      
      if (!confirmed) return;

      const imageResponse = await fetchClient<SpecialPlateFilesResponse>(combineURL(CENTER_API, `/special-plate-images/get`), {
        method: "GET"
      })

      if (!imageResponse.success) {
        PopupMessage(t('message.error.error-while-fetching-image'), "", "error");
        return;
      };

      if (imageResponse.data.length > 0) {
        const imagesIdList = imageResponse.data.map(image => image.id);
        await fetchClient<SpecialPlateResponse>(combineURL(CENTER_API, `/special-plate-images/delete`), {
          method: "DELETE",
          queryParams: {
            ids: imagesIdList.toString()
          },
        })
      }

      const fileResponse = await fetchClient<SpecialPlateFilesResponse>(combineURL(CENTER_API, `/special-plate-files/get`), {
        method: "GET"
      })

      if (!fileResponse.success) {
        PopupMessage(t('message.error.error-while-fetching-file'), "", "error");
        return;
      };

      if (fileResponse.data.length > 0) {
        const filesIdList = fileResponse.data.map(file => file.id);
        await fetchClient<SpecialPlateResponse>(combineURL(CENTER_API, `/special-plate-files/delete`), {
          method: "DELETE",
          queryParams: {
            ids: filesIdList.toString()
          },
        })
      }

      const deletePlate = await fetchClient<SpecialPlateResponse>(combineURL(CENTER_API, `/special-plates/delete`), {
        method: "DELETE",
        queryParams: {
          ids: [id].toString()
        },
      })

      if (!deletePlate.success) {
        PopupMessage(t('message.error.error-while-deleting-data'), "", "error");
        return;
      };

      PopupMessage(t('message.success.delete-success'), "", "success");
      await fetchSpecialPlates(1, rowsPerPage);
      bc.postMessage("reload");
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      PopupMessage(t('message.error.error-while-deleting-data'), errorMessage, "error");
    }
  }

  const handleRowsPerPageChange = async (event: SelectChangeEvent) => {
      const limit = parseInt(event.target.value)
      setRowsPerPage(limit);
      await fetchSpecialPlates(page, limit);
    };
  
  const handlePageChange = async (event: React.ChangeEvent<unknown>, value: number) => {
    event.preventDefault();
    setPage(value);
    await fetchSpecialPlates(value, rowsPerPage);
  };

  const handlePageInputKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
  
      setPage(pageInput);
      await fetchSpecialPlates(pageInput, rowsPerPage);
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

  const handleFileImportOpen = () => {
    setIsFileImportOpen(true)
  }

  const handleManageSpecialPlateClose = async () => {
    setOpenManageSpecialPlate(false);
    await fetchSpecialPlates(1, rowsPerPage);
    setSelectedRow(null);
  }

  const handleFileImportClose = async () => {
    setIsFileImportOpen(false);
    await fetchSpecialPlates(1, rowsPerPage);
  }

  const handleSearch = async (searchFilter: FormData) => {
    const filterParts = [];

    if (searchFilter.plate_group.trim() !== "") {
      filterParts.push(`plate_prefix~${searchFilter.plate_group}`);
    }
    if (searchFilter.plate_number.trim() !== "") {
      filterParts.push(`plate_number~${searchFilter.plate_number}`);
    }
    if (searchFilter.region_code.trim() !== "") {
      filterParts.push(`region_code~${searchFilter.region_code}`);
    }
    if (searchFilter.plate_type !== 0) {
      filterParts.push(`plate_class_id=${searchFilter.plate_type}`);
    }
    if (searchFilter.status !== 2) {
      filterParts.push(`active=${searchFilter.status}`);
    }

    filterParts.push(`deleted=0`);

    await fetchSpecialPlates(1, rowsPerPage, filterParts.join(','));
  }

  const handleAddSpecialPlateClick = () => {
    setSelectedRow(null);
    setOpenManageSpecialPlate(true);
  }

  return (
    <div id='special-plate' className={`main-content ${isOpen ? "pl-[130px]" : "pl-2.5"} pr-2.5 transition-all duration-500`}>
      { isLoading && <Loading /> }
      <div className="grid grid-cols-[1fr_270px] gap-x-4">
        <div>
          {/* Header */}
          <Typography variant="h5" color="white" className="font-bold">{t('screen.special-plate.title')}</Typography>
          {/* Body */}
          <div className='flex flex-col'>
            <div className='flex justify-between items-center'>
              <p className='text-[15px]'>{`${t('table.amount')} ${formatNumber(totalData)} ${t('table.list')}`}</p>
              {/* Button Part */}
              <div className='flex gap-2'>
                <Button
                  variant="contained"
                  className="secondary-btn-without-border"
                  startIcon={<Import />}
                  sx={{ 
                    width: "135px", 
                    height: "40px",
                    textTransform: "capitalize",
                  }}
                  onClick={handleFileImportOpen}
                >
                  {t('button.import')}
                </Button>

                <Button
                  variant="contained"
                  className="primary-btn"
                  startIcon={<Plus />}
                  sx={{ 
                    width: "170px", 
                    height: "40px",
                    textTransform: "capitalize",
                  }}
                  onClick={handleAddSpecialPlateClick}
                >
                  {t('button.add-new-plate')}
                </Button>
              </div>
            </div>

            {/* Table Part */}
            <div>
              <TableContainer 
                component={Paper} 
                className='mt-3'
                sx={{ height: "75vh", backgroundColor: "transparent" }}
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
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "10%" }}>{t('table.column.plate')}</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "7%" }}>{t('table.column.image')}</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "6%" }}>{t('table.column.plate-type')}</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "5%" }}>{t('table.column.added-Date')}</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "5%" }}>{t('table.column.edited-Date')}</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "10%" }}>{t('table.column.record-owner')}</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "10%" }}>{t('table.column.remark-behavior')}</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "3%" }}>{t('table.column.status')}</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "3%" }}>{t('table.column.document')}</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "3%" }}>{t('table.column.edit-delete')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {
                      specialPlateList.map((data, index) => (
                        <TableRow 
                          key={index} 
                          sx={{
                            '& td, & th': { borderBottom: '1px dashed #ADADAD' }
                          }}
                        >
                          {
                            (() => {
                              const regions = sliceDropdown?.regions?.data.find(regions => regions.region_code === data.region_code);
                              const regionName =
                                i18n.language === 'th'
                                  ? regions?.name_th ?? ''
                                  : regions?.name_en ?? '';
                              return (
                                <TableCell sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", height: "83px" }}>
                                  {`${data.plate_prefix} ${data.plate_number}${regionName ? ` ${regionName}` : ''}`}
                                </TableCell>
                              )
                            })()
                          }
                          <TableCell align="center" sx={{ backgroundColor: "#48494B", padding: "6px", height: "83px" }}>
                            {
                              Array.isArray(data.imagesData) && data.imagesData.length > 0 ? 
                              (
                                <div className='flex items-center justify-center space-x-1'>
                                  {
                                    data.imagesData.map((image, index) => (
                                      <Image
                                        key={index}
                                        imageSrc={`${CENTER_FILE_URL}${image.url}`} 
                                        imageAlt={`image-${index}`}
                                        className="inline-flex items-center justify-center align-middle h-[70px] w-[70px]" 
                                      />
                                    ))
                                  }
                                </div>
                              ) : 
                              (
                                <p className='text-white'>--</p>
                              )
                            }
                          </TableCell>
                          <TableCell sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", height: "83px" }}>
                            {
                              sliceDropdown.plateTypes?.data.find(plateType => plateType.id === data.plate_class_id)?.title_en || ""
                            }
                          </TableCell>
                          <TableCell align="center" sx={{ backgroundColor: "#48494B", color: "#FFFFFF", height: "83px" }}>{ dayjs(data.created_at).format(i18n.language === 'th' ? 'DD/MM/BBBB' : 'DD/MM/YYYY') }</TableCell>
                          <TableCell align="center" sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", height: "83px" }}>{ dayjs(data.updated_at).format(i18n.language === 'th' ? 'DD/MM/BBBB' : 'DD/MM/YYYY') }</TableCell>
                          <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", height: "83px" }}>{data.case_owner_name ?? "-"}</TableCell>
                          <TableCell sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", height: "83px" }}>{data.behavior ?? "-"}</TableCell>
                          <TableCell align="center" sx={{ backgroundColor: "#48494B", color: "#FFFFFF", height: "83px" }}>
                            {
                              (() => {
                                const color = data.active === 1 ? "bg-[#4CB64C]" : "bg-[#ADADAD]";
                                return (
                                  <label
                                    className={`w-20 h-[30px] inline-flex items-center justify-center rounded
                                    ${color}`}
                                  >
                                    { data.active === 1 ? "Active" : "Inactive" }
                                  </label>
                                )
                              })()
                            }
                          </TableCell>
                          <TableCell align="center" sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", height: "83px" }}>
                            <IconButton
                              sx={{
                                borderRadius: "4px !important",
                              }}
                              onClick={() => handleDownload(data)}
                            >
                              <Download color='#FFFFFF' size={25} />
                            </IconButton>
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

                            <IconButton
                              sx={{
                                borderRadius: "4px !important",
                              }}
                              onClick={ () => handleDelete(data.id)}
                            >
                              <Trash2 color='#FFFFFF' size={20} />
                            </IconButton>
                          </div>
                          </TableCell>
                        </TableRow>
                      ))
                    }
                    {
                      specialPlateList.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={10} align="center" sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", height: "83px" }}>
                            {t('text.no-data')}
                          </TableCell>
                        </TableRow>
                      )
                    }
                  </TableBody>
                </Table>
              </TableContainer>

              <div className={`${mockSpecialPlates.length > 0 ? "flex" : "hidden"} items-center justify-between bg-(--background-color) py-3 pl-1 sticky bottom-0`}>
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
        
        {/* Modules */}
        <SearchFilter onSearch={handleSearch}/>
        {
          openManageSpecialPlate && (
            <ManageSpecialPlate 
              open={openManageSpecialPlate} 
              onClose={handleManageSpecialPlateClose} 
              selectedRow={selectedRow} 
            />
          )
        }
        <ImportFile open={isFileImportOpen} onClose={handleFileImportClose} />
      </div>
    </div>
  )
}

export default SpecialPlatePage;