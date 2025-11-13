import React, { useState, useEffect } from 'react'
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
import PaginationComponent from '../../components/pagination/Pagination';

// Icons
import { Import, Plus, Pencil, Trash2 } from 'lucide-react';

// Context
import { useHamburger } from "../../context/HamburgerContext";

// Mocks
import { mockSuspectPeople } from "../../mocks/mockSuspectPeople";

// Constant
import { SUSPECT_PEOPLE_ROW_PER_PAGES } from "../../constants/dropdown";

// Modules
import SearchFilter from './search-filter/SearchFilter';
import ManageSuspectPerson from './manage-suspect-person/ManageSuspectPerson';

// i18n
import { useTranslation } from 'react-i18next';

dayjs.extend(buddhistEra)

interface SuspectPeopleProps {

}

const SuspectPeople: React.FC<SuspectPeopleProps> = ({}) => {
  // i18n
  const { i18n } = useTranslation();

  const { isOpen } = useHamburger();

  // Data
  const [openManageSuspectPeople, setOpenManageSuspectPeople] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(SUSPECT_PEOPLE_ROW_PER_PAGES[SUSPECT_PEOPLE_ROW_PER_PAGES.length - 1]);
  const [rowsPerPageOptions] = useState(SUSPECT_PEOPLE_ROW_PER_PAGES);

  // Options
  const [prefixOptions, setPrefixOptions] = useState<{ label: string ,value: number }[]>([]);

  const sliceDropdown = useSelector(
    (state: RootState) => state.dropdownData
  );

  useEffect(() => {
    setTotalPages(1);
  }, [])

  useEffect(() => {
    if (sliceDropdown.prefix && sliceDropdown.prefix.data) {
      const options = sliceDropdown.prefix.data.map((row) => ({
        label: row.title_th,
        value: row.id,
      }));
      setPrefixOptions(options);
    }
  }, [sliceDropdown.prefix]);

  const handleEdit = (id: number) => {
    alert(`Edit id: ${id}`)
  }

  const handleDelete = (id: number) => {
    alert(`Delete id: ${id}`)
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

  return (
    <div id='suspect-people' className={`main-content ${isOpen ? "pl-[130px]" : "pl-[10px]"} pr-[10px] transition-all duration-500`}>
      <div className="grid grid-cols-[1fr_270px] gap-x-4">
        <div>
          {/* Header */}
          <Typography variant="h5" color="white" className="font-bold">รายการบุคคลต้องสงสัย</Typography>
          {/* Body */}
          <div className='flex flex-col'>
            <div className='flex justify-between items-center'>
              <p className='text-[15px]'>{`จำนวน ${mockSuspectPeople.length} รายการ`}</p>
              {/* Button Part */}
              <div className='flex gap-2'>
                <Button
                  variant="contained"
                  className="secondary-btn-without-border"
                  startIcon={<Import />}
                  sx={{ width: "135px", height: "40px" }}
                >
                  นำเข้าข้อมูล
                </Button>

                <Button
                  variant="contained"
                  className="primary-btn"
                  startIcon={<Plus />}
                  sx={{ width: "180px", height: "40px" }}
                  onClick={() => setOpenManageSuspectPeople(true)}
                >
                  เพิ่มบุคคลต้องสงสัย
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
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "5%" }}>คำนำหน้า</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "10%" }}>ชื่อ-นามสกุล</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "5%" }}>รูป</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "6%" }}>กลุ่มบุคคล</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "5%" }}>วันที่เพิ่ม</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "5%" }}>วันที่แก้ไข</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "10%" }}>เจ้าของข้อมูล</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "10%" }}>หน่วยงาน</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "3%" }}>สถานะ</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "3%" }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {
                      mockSuspectPeople.map((data, index) => (
                        <TableRow 
                          key={index} 
                          sx={{
                            '& td, & th': { borderBottom: '1px dashed #ADADAD' }
                          }}
                        >
                          <TableCell sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", textAlign: "center" }}>
                            {`${ prefixOptions.find((option) => option.value === data.title_id)?.label }`}
                          </TableCell>
                          <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF" }}>
                            {`${data.firstname} ${data.lastname}`}
                          </TableCell>
                          <TableCell align="center" sx={{ backgroundColor: "#393B3A", padding: "6px" }}>
                            {
                              Array.isArray(data.watchlist_images) && data.watchlist_images.length > 0 ? 
                              (
                                <div>
                                  {
                                    data.watchlist_images.map((image, index) => (
                                      <img key={index} src={`${image.url}`} alt={`image-${index}`} className="inline-flex items-center justify-center align-middle h-[70px] w-[70px]" />
                                    ))
                                  }
                                </div>
                              ) : 
                              (
                                <p>--</p>
                              )
                            }
                          </TableCell>
                          <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF" }}>
                            {
                              sliceDropdown.personTypes?.data.find(plateType => plateType.id === data.person_class_id)?.title_en || ""
                            }
                          </TableCell>
                          <TableCell align="center" sx={{ backgroundColor: "#393B3A", color: "#FFFFFF" }}>{ dayjs(data.createdAt).format(i18n.language === 'th' ? 'DD/MM/BBBB' : 'DD/MM/YYYY') }</TableCell>
                          <TableCell align="center" sx={{ backgroundColor: "#48494B", color: "#FFFFFF" }}>{ dayjs(data.updatedAt).format(i18n.language === 'th' ? 'DD/MM/BBBB' : 'DD/MM/YYYY') }</TableCell>
                          <TableCell sx={{ backgroundColor: "#393B3A", color: "#FFFFFF" }}>{data.case_owner_name}</TableCell>
                          <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF" }}>{data.case_owner_agency}</TableCell>
                          <TableCell align="center" sx={{ backgroundColor: "#393B3A", color: "#FFFFFF" }}>
                            {
                              (() => {
                                const color = data.active === 1 ? "bg-[#4CB64C]" : "bg-[#ADADAD]";
                                return (
                                  <label
                                    className={`w-[80px] h-[30px] inline-flex items-center justify-center rounded
                                    ${color}`}
                                  >
                                    { data.active === 1 ? "Active" : "Inactive" }
                                  </label>
                                )
                              })()
                            }
                          </TableCell>
                          <TableCell align="center"
                            sx={{ backgroundColor: "#48494B", color: "#FFFFFF" }}
                            className='flex justify-center items-center'
                          >
                            <div className='flex items-center justify-center gap-1'>
                            <IconButton
                              sx={{
                                borderRadius: "4px !important",
                              }}
                              onClick={() => handleEdit(data.id)}
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
                  </TableBody>
                </Table>
              </TableContainer>

              <div className={`${mockSuspectPeople.length > 0 ? "flex" : "hidden"} items-center justify-between bg-[var(--background-color)] py-3 pl-1 sticky bottom-0`}>
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
        <SearchFilter/>
        <ManageSuspectPerson open={openManageSuspectPeople} onClose={() => setOpenManageSuspectPeople(false)} />
      </div>
    </div>
  )
}

export default SuspectPeople;