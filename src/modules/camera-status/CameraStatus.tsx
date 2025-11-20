import React, { useState, useCallback, useEffect } from 'react'
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
  SelectChangeEvent,
} from "@mui/material";
// import * as XLSX from "xlsx";
// import JSZip from "jszip";
// import { saveAs } from "file-saver";
import { useSelector } from "react-redux"
import { RootState } from "../../app/store"
import dayjs from 'dayjs';
import { Map as LeafletMap } from 'leaflet';

// Context
import { useHamburger } from "../../context/HamburgerContext";

// Components
import AutoComplete from '../../components/auto-complete/AutoComplete';
import PaginationComponent from '../../components/pagination/Pagination';
import BaseMap from '../../components/base-map/BaseMap';
import DatePickerBuddhist from "../../components/date-picker-buddhist/DatePickerBuddhist";

// Icons
import SearchIcon from '@mui/icons-material/Search';

// Constant
import { USAGE_STATISTICS_GRAPH_ROW_PER_PAGES } from "../../constants/dropdown";

// Hooks
import { useMapSearch } from "../../hooks/useOpenStreetMapSearch";

interface FormData {
  area_id: number
  province_id: number
  station_id: number
  time_range_id: number
  project_id: number
  part_id: number
  status_id: number
  start_date_time: Date | null
  end_date_time: Date | null
};

interface CameraStatusProps {

}

const CameraStatus: React.FC<CameraStatusProps> = ({}) => {
  const { isOpen } = useHamburger();

  // Options
  const [areasOptions, setAreasOptions] = useState<{ label: string ,value: number }[]>([]);
  const [projectsOptions] = useState<{ label: string ,value: number }[]>([]);
  const [partsOptions] = useState<{ label: string ,value: number }[]>([]);
  const [statusOptions] = useState<{ label: string ,value: number }[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState(1);
  const [totalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(USAGE_STATISTICS_GRAPH_ROW_PER_PAGES[USAGE_STATISTICS_GRAPH_ROW_PER_PAGES.length - 1]);
  const [rowsPerPageOptions] = useState(USAGE_STATISTICS_GRAPH_ROW_PER_PAGES);

  // Data
  const [map, setMap] = useState<LeafletMap | null>(null);

  const [formData, setFormData] = useState<FormData>({
    area_id: 0,
    province_id: 0,
    station_id: 0,
    time_range_id: 0,
    project_id: 0,
    part_id: 0,
    status_id: 0,
    start_date_time: null,
    end_date_time: null,
  })

  const cameraStatusList = [
    {
      id: 1,
      check_point_name: "8_กบ_เหนือคลอง_เข้า",
      status: "offline",
      lat: 13.753752015092113,
      lon: 100.4098543172116,
      last_time_synce_data: "10/04/2025 15:56:00",
    },
    {
      id: 2,
      check_point_name: "8_กบ_แยกบ้านเทพพนม_เข้า",
      status: "offline",
      lat: 13.723069985454218,
      lon: 100.51628436561624,
      last_time_synce_data: "10/04/2025 14:52:00",
    },
    {
      id: 3,
      check_point_name: "8_กบ_จราจรปลายพระยา_ออก",
      status: "offline",
      lat: 13.6935726664667,
      lon: 101.37659103187812,
      last_time_synce_data: "10/04/2025 00:00:00",
    },
    {
      id: 4,
      check_point_name: "8_กบ_ศส.เกาะกลาง_ออก",
      status: "offline",
      lat: 13.69347726664667,
      lon: 101.38659103187812,
      last_time_synce_data: "10/04/2025 00:00:00",
    },
    {
      id: 5,
      check_point_name: "5_ชร_บ้านลาดศิลใหม่_เข้า",
      status: "offline",
      lat: 13.69348726664667,
      lon: 101.37659103187812,
      last_time_synce_data: "10/04/2025 00:00:00",
    },
    {
      id: 6,
      check_point_name: "7_กจ_พุฉลูงั้ว_เข้า",
      status: "offline",
      lat: 13.69347726664667,
      lon: 101.37659203187812,
      last_time_synce_data: "10/04/2025 00:00:00",
    },
    {
      id: 7,
      check_point_name: "7_กจ_โป่งป่า_เข้า",
      status: "offline",
      lat: 13.69347726764667,
      lon: 101.37659103187812,
      last_time_synce_data: "10/04/2025 00:00:00",
    },
    {
      id: 8,
      check_point_name: "2_ขบ_แยกบ้านวังลุง_เข้า",
      status: "offline",
      lat: 13.69447726664667,
      lon: 101.37659103187812,
      last_time_synce_data: "10/04/2025 00:00:00",
    },
    {
      id: 9,
      check_point_name: "2_ขบ_คลองตะเคียน_ออก",
      status: "offline",
      lat: 13.69347726664667,
      lon: 101.37669103187812,
      last_time_synce_data: "10/04/2025 00:00:00",
    },
    {
      id: 10,
      check_point_name: "1_ขบ_ขส.สุราษฎร์_เข้า",
      status: "offline",
      lat: 13.69347726664667,
      lon: 101.37689103187812,
      last_time_synce_data: "10/04/2025 00:00:00",
    },
    {
      id: 11,
      check_point_name: "6_กพ_คลองน้ำไหล_เข้า",
      status: "offline",
      lat: 0,
      lon: 0,
      last_time_synce_data: "10/04/2025 00:00:00",
    },
    {
      id: 12,
      check_point_name: "6_กพ_วังชม_เข้า",
      status: "offline",
      lat: 0,
      lon: 0,
      last_time_synce_data: "10/04/2025 00:00:00",
    },
    {
      id: 13,
      check_point_name: "7_กง_แยกอากงซื่อ_เข้า",
      status: "offline",
      lat: 0,
      lon: 0,
      last_time_synce_data: "10/04/2025 00:00:00",
    },
    {
      id: 14,
      check_point_name: "4_ขบ_จอมบึง_เข้า",
      status: "offline",
      lat: 0,
      lon: 0,
      last_time_synce_data: "10/04/2025 00:00:00",
    },
    {
      id: 15,
      check_point_name: "4_ขบ_หนองกา_เข้า",
      status: "offline",
      lat: 0,
      lon: 0,
      last_time_synce_data: "10/04/2025 00:00:00",
    },
    {
      id: 16,
      check_point_name: "4_ขบ_แยกบ้านเหนือ_เข้า",
      status: "offline",
      lat: 0,
      lon: 0,
      last_time_synce_data: "10/04/2025 00:00:00",
    },
    {
      id: 17,
      check_point_name: "3_ชย_แยกบ้านท่าสาป_เข้า",
      status: "offline",
      lat: 0,
      lon: 0,
      last_time_synce_data: "10/04/2025 00:00:00",
    },
    {
      id: 18,
      check_point_name: "3_ชย_แยกไฟแดงตลาดใหญ่_เข้า",
      status: "offline",
      lat: 0,
      lon: 0,
      last_time_synce_data: "10/04/2025 00:00:00",
    },
    {
      id: 19,
      check_point_name: "3_ชย_วังใหญ่_เข้า",
      status: "offline",
      lat: 0,
      lon: 0,
      last_time_synce_data: "10/04/2025 00:00:00",
    },
    {
      id: 20,
      check_point_name: "1_ขบ_คุ้งสำเภา_เข้า",
      status: "offline",
      lat: 0,
      lon: 0,
      last_time_synce_data: "10/04/2025 00:00:00",
    },
  ];

  const {
    showCameraStatusInMap,
  } = useMapSearch(map)

  const sliceDropdown = useSelector(
    (state: RootState) => state.dropdownData
  )

  useEffect(() => {
    if (map) {
      const cameraList = cameraStatusList.map((camera) => {
        const parsedTime = dayjs(camera.last_time_synce_data, "DD/MM/YYYY HH:mm:ss");
        const now = dayjs();
        const isLessthan30Minutes = now.diff(parsedTime, 'minute') < 30;
        const isLessthan3Hours = now.diff(parsedTime, 'hour') < 3;
        const isOver3Hours = now.diff(parsedTime, 'hour') > 3;

        let status = 0;
        if (isLessthan30Minutes) {
          status = 1;
        }
        else if (isLessthan3Hours) {
          status = 2;
        }
        else if (isOver3Hours) {
          status = 3;
        }
        else {
          status = 0;
        }

        return {
          lat: camera.lat.toString(),
          lon: camera.lon.toString(),
          status: status,
        }
      })
      showCameraStatusInMap(cameraList);
    }
  }, [map])

  useEffect(() => {
    if (sliceDropdown.areas && sliceDropdown.areas.data) {
      const options = sliceDropdown.areas.data.map((row) => ({
        label: row.name,
        value: row.id,
      }))
      setAreasOptions(options)
    }
  }, [sliceDropdown.areas])

  const handleDropdownChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleAreaChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("area_id", value.value);
    }
    else {
      handleDropdownChange("area_id", '');
    }
  };

  const handleProjectChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("project_id", value.value);
    }
    else {
      handleDropdownChange("project_id", '');
    }
  };

  const handlePartChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("part_id", value.value);
    }
    else {
      handleDropdownChange("part_id", '');
    }
  };

  const handleStatusChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault()
    if (value) {
      handleDropdownChange("status_id", value.value)
    }
    else {
      handleDropdownChange("status_id", '')
    }
  }

  const handleClearSearch = () => {

  }

  const handleMapLoad = useCallback((mapInstance: LeafletMap | null) => {
    setMap(mapInstance)
  }, []);

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
  
  const handleStartDateTimeChange = (date: Date | null) => {
    setFormData((prevState) => ({
      ...prevState,
      start_date_time: date,
    }));
  };

  const handleEndDateTimeChange = (date: Date | null) => {
    setFormData((prevState) => ({
      ...prevState,
      end_date_time: date,
    }));
  };

  return (
    <div id='usage-statistics-graph' className={`main-content ${isOpen ? "pl-[130px]" : "pl-2.5"} pr-2.5 transition-all duration-500 overflow-y-auto scrollbar-hide`}>
      <div className='flex flex-col'>
        {/* Header */}
        <Typography variant="h5" color="white" className="font-bold">ค้นหาจุดติดตั้งกล้อง</Typography>

        {/* Filter Part */}
        <div className='grid grid-cols-4 gap-x-[50px] gap-y-3 pt-5'>
          <AutoComplete 
            id="project-select"
            sx={{ marginTop: "10px"}}
            value={formData.project_id}
            onChange={handleProjectChange}
            options={projectsOptions}
            label="โครงการ"
            placeholder="กรุณาเลือกโครงการ"
            labelFontSize="16px"
          />

          <AutoComplete 
            id="area-select"
            sx={{ marginTop: "10px"}}
            value={formData.area_id}
            onChange={handleAreaChange}
            options={areasOptions}
            label="ผ่านในพื้นที่"
            placeholder="กรุณาเลือกพื้นที่"
            labelFontSize="15px"
          />

          <AutoComplete 
            id="part-select"
            sx={{ marginTop: "10px"}}
            value={formData.part_id}
            onChange={handlePartChange}
            options={partsOptions}
            label="ภาค"
            placeholder="กรุณาเลือกภาค"
            labelFontSize="15px"
          />

          <AutoComplete 
            id="status-select"
            sx={{ marginTop: "10px"}}
            value={formData.status_id}
            onChange={handleStatusChange}
            options={statusOptions}
            label="สถานะ"
            placeholder="กรุณาเลือกสถานะ"
            labelFontSize="15px"
          />

          <div>
            <Typography sx={{ fontSize: "15px"}} variant='subtitle1' color='white'>
              วัน/เวลา เริ่มต้น
            </Typography>
            <DatePickerBuddhist
              value={formData.start_date_time}
              sx={{
                marginTop: "10px",
                "& .MuiOutlinedInput-input": {
                  fontSize: 15
                }
              }}
              className="w-full"
              id="arrest-date"
              onChange={(value) => handleStartDateTimeChange(value)}
              isWithTime={true}
            >
            </DatePickerBuddhist>
          </div>

          <div>
            <Typography sx={{ fontSize: "15px"}} variant='subtitle1' color='white'>
              วัน/เวลา สิ้นสุด
            </Typography>
            <DatePickerBuddhist
              value={formData.end_date_time}
              sx={{
                marginTop: "10px",
                "& .MuiOutlinedInput-input": {
                  fontSize: 15
                }
              }}
              className="w-full"
              id="end-arrest-date"
              onChange={(value) => handleEndDateTimeChange(value)}
              isWithTime={true}
            >
            </DatePickerBuddhist>
          </div>

          <div className='col-start-4 flex items-end justify-start gap-2'>
            <Button
              type='submit'
              variant="contained"
              className="primary-btn"
              startIcon={<SearchIcon />}
              sx={{ width: "90px", height: "40px" }}
            >
              ค้นหา
            </Button>
            <Button 
              variant="text" 
              className="tertiary-btn" 
              onClick={handleClearSearch}
              sx={{ width: "90px", height: "40px" }}
            >
              ล้างค่า
            </Button>
          </div>
        </div>

        {/* Content Part */}
        <div className='grid grid-cols-2 gap-2 mt-10'>          
          {/* Total Count */}
          <div className='border border-[#797979] rounded-[5px] py-2'>
            <div className='grid grid-cols-4'>
              <div className='flex flex-col w-full border-r border-[#FFFFFF] px-4'>
                <label className='text-white text-[16px]'>Total</label>
                <p className='text-[53px] text-center'>1550</p>
              </div>
              <div className='flex flex-col w-full border-r border-[#FFFFFF] px-4'>
                <label className='text-white text-[16px]'>Less Then 30 Minutes</label>
                <div className='flex justify-between items-end text-[#4CB64C]'>
                  <p className='text-[53px]'>1034</p>
                  <p className='text-[20px] pb-2'>{`(${72}%)`}</p>
                </div>
              </div>
              <div className='flex flex-col w-full border-r border-[#FFFFFF] px-4'>
                <label className='text-white text-[16px]'>Less then 3 Houres</label>
                <div className='flex justify-between items-end text-[#FDCC0A]'>
                  <p className='text-[53px] text-center'>75</p>
                  <p className='text-[20px] text-center pb-2'>{`(${2}%)`}</p>
                </div>
              </div>
              <div className='flex flex-col w-full px-4'>
                <label className='text-white text-[16px]'>More then 3 Houre</label>
                <div className='flex justify-between items-end text-[#DD2025]'>
                  <p className='text-[53px] text-center'>770</p>
                  <p className='text-[20px] text-center pb-2'>{`(${27}%)`}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Count */}
          <div className='border border-[#797979] rounded-[5px] py-2'>
            <div className='flex flex-col px-6'>
              <div className='flex justify-between border-[#797979] border-b text-white text-[16px] py-1.5'>
                <p>อุปกรณ์ชำรุด</p>
                <p>0 (0.00%)</p>
              </div>
              <div className='flex justify-between border-[#797979] border-b text-white text-[16px] py-1.5'>
                <p>เครือข่ายขัดข้อง</p>
                <p>0 (0.00%)</p>
              </div>
              <div className='flex justify-between text-white text-[16px] py-1'>
                <p>สาเหตุอื่นๆ</p>
                <p>153 (12%)</p>
              </div>
            </div>
          </div>

          {/* Map Part */}
          <div className='flex flex-col border border-[#797979] rounded-[5px] px-2 py-3 row-span-6'>
            <label className='text-[#FDCC0A] text-[16px]'>Map Status</label>
            <div className='relative h-full w-full mt-2'>
              <BaseMap 
                onMapLoad={handleMapLoad}
              />
            </div>
          </div>

          {/* Camera Installation Table */}
          <div className='row-span-6 flex flex-col border border-[#797979] rounded-[5px] px-2 pt-3 pb-4'>
            <label className='text-[#FDCC0A] text-[16px]'>ข้อมูลเชื่อมต่อ</label>
            <div className='pt-4'>
              <TableContainer
                component={Paper}
                sx={{ backgroundColor: "transparent", height: "80vh" }}
              >
                <Table>
                  <TableHead sx={{ height: "30px" }}>
                    <TableRow
                      sx={{
                        backgroundColor: "#242727",
                        position: "sticky",
                        top: -1,
                        zIndex: 1,
                        '& td, & th': {
                          borderBottom: 'none',
                          borderTop: '2px solid #384043',
                          padding: '10px 8px',
                        },
                      }}
                    >
                      <TableCell align="center" sx={{ color: "#FFFFFF", fontSize: "16px" }}>LastTimeSycneData</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", fontSize: "16px" }}>Checkpoint Name</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", fontSize: "16px" }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cameraStatusList.map((camera) => (
                      <TableRow>
                        <TableCell sx={{ color: "#FFFFFF", fontSize: "16px", backgroundColor: "#393B3A", borderBottom: "1px dashed #ADADAD" }}>{camera.last_time_synce_data}</TableCell>
                        <TableCell sx={{ color: "#FFFFFF", fontSize: "16px", backgroundColor: "#48494B", borderBottom: "1px dashed #ADADAD" }}>{camera.check_point_name}</TableCell>
                        <TableCell sx={{ color: "#FFFFFF", fontSize: "16px", backgroundColor: "#393B3A", borderBottom: "1px dashed #ADADAD" }}>{camera.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <div className={`${cameraStatusList.length > 0 ? "flex" : "hidden"} items-center justify-between bg-(--background-color) pt-3 pl-1`}>
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
      </div>
    </div>
  )
}

export default CameraStatus;