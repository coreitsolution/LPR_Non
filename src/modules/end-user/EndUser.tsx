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
  SelectChangeEvent,
  Box,
} from "@mui/material";
import { PieChart, Pie, ResponsiveContainer } from 'recharts';
// import * as XLSX from "xlsx";
// import JSZip from "jszip";
// import { saveAs } from "file-saver";
import { Map as LeafletMap } from 'leaflet';

// Context
import { useHamburger } from "../../context/HamburgerContext";

// Components
import DatePickerBuddhist from "../../components/date-picker-buddhist/DatePickerBuddhist";
import PaginationComponent from '../../components/pagination/Pagination';
import LinearProgressWithLabel from '../../components/linear-progress-with-label/LinearProgressWithLabel';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import CSVIcon from "../../assets/icons/csv.png";

// Utils
import { CustomShape } from '../../utils/customShape';

// Constant
import { USAGE_STATISTICS_GRAPH_ROW_PER_PAGES } from "../../constants/dropdown";

// Hooks
import { useMapSearch } from "../../hooks/useOpenStreetMapSearch";

interface FormData {
  bh_id: number
  bk_id: number
  org_id: number
  userId: string
  action_id: number
  start_date_time: Date | null
  end_date_time: Date | null
};

interface EndUserProps {

}

const EndUser: React.FC<EndUserProps> = ({}) => {
  const { isOpen } = useHamburger();

  // Options
  // const [bhOptions, setBhOptions] = useState<{ label: string ,value: number }[]>([]);
  // const [bkOptions, setBKOptions] = useState<{ label: string ,value: number }[]>([]);
  // const [orgOptions, setOrgOptions] = useState<{ label: string ,value: number }[]>([]);
  // const [actionOptions, setActionOptions] = useState<{ label: string ,value: number }[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState(1);
  const [totalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(USAGE_STATISTICS_GRAPH_ROW_PER_PAGES[USAGE_STATISTICS_GRAPH_ROW_PER_PAGES.length - 1]);
  const [rowsPerPageOptions] = useState(USAGE_STATISTICS_GRAPH_ROW_PER_PAGES);

  // Data
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [map] = useState<LeafletMap | null>(null);

  const [formData, setFormData] = useState<FormData>({
    bh_id: 0,
    bk_id: 0,
    org_id: 0,
    userId: "",
    action_id: 0,
    start_date_time: null,
    end_date_time: null,
  })

  const COLORS = [
    '#18F269', 
    '#6FCC21', 
    '#3A845B', 
    '#41888B', 
    '#8805DE', 
    '#530ED5', 
    '#6D6D97', 
    '#A56FFB', 
    '#F3B586', 
    '#B68E2F', 
    '#7E4065', 
    '#B0DFF1', 
    '#58DFE5'
  ];
  
  const pieChartMock = [
    { name: "บช.น.", bh: "บช.น." , value: 2.3, fill: COLORS[0] }, 
    { name: "ภ.8", bh: "ภ.8" , value: 2.3, fill: COLORS[1] }, 
    { name: "ภ.7", bh: "ภ.7" , value: 2.5, fill: COLORS[2] },
    { name: "ภ.4", bh: "ภ.4" , value: 2.6, fill: COLORS[3] },
    { name: "ภ.3", bh: "ภ.3" , value: 2.7, fill: COLORS[4] },
    { name: "บช.ตชด.", bh: "บช.ตชด." , value: 2.7, fill: COLORS[5] },
    { name: "ภ.2", bh: "ภ.2" , value: 3.5, fill: COLORS[6] },
    { name: "ภ.6", bh: "ภ.6" , value: 3.7, fill: COLORS[7] },
    { name: "บช.ก.", bh: "บช.ก." , value: 4.2, fill: COLORS[8] },
    { name: "ภ.1", bh: "ภ.1" , value: 4.7, fill: COLORS[9] },
    { name: "ภ.9", bh: "ภ.9" , value: 8.0, fill: COLORS[10] },
    { name: "ภ.5", bh: "ภ.5" , value: 29.6, fill: COLORS[11] },
    { name: "บช.ปส.", bh: "บช.ปส." , value: 25.9, fill: COLORS[12] },
  ];

  const progress = [
    { id: 1, bh: "บก.สปส.บช.ปส", duplicate: 5660 },
    { id: 2, bh: "บก.ปส.3", duplicate: 4279 },
    { id: 3, bh: "บก.ปส.2", duplicate: 2947 },
    { id: 4, bh: "บก.ปส.4", duplicate: 2499 },
    { id: 5, bh: "บก.ปส.1", duplicate: 1489 },
    { id: 6, bh: "บก.ขส.บช.ปส.", duplicate: 1084 },
    { id: 7, bh: "บก.อก.บช.ปส.", duplicate: 183 },
  ];

  const allAgencyTable = [
    { id: 1, bh: "บช.ปส.", duplicate: 18196 },
    { id: 2, bh: "ภ.5", duplicate: 10393 },
    { id: 3, bh: "ภ.9", duplicate: 5219 },
    { id: 4, bh: "ภ.4", duplicate: 3736 },
    { id: 5, bh: "ภ.1", duplicate: 3380 },
    { id: 6, bh: "ภ.3", duplicate: 3368 },
    { id: 7, bh: "ภ.2", duplicate: 3321 },
    { id: 8, bh: "บช.ก.", duplicate: 3300 },
    { id: 9, bh: "ภ.6", duplicate: 2903 },
    { id: 10, bh: "ภ.8", duplicate: 2900 },
    { id: 11, bh: "ภ.7", duplicate: 1900 },
    { id: 12, bh: "บช.น.", duplicate: 1832 },
    { id: 13, bh: "บช.ตชด.", duplicate: 1590 },
    { id: 14, bh: "บช.สอท.", duplicate: 824 },
    { id: 15, bh: "สตม.", duplicate: 363 },
    { id: 16, bh: "บช.ส.", duplicate: 263 },
    { id: 17, bh: "บช.ทท.", duplicate: 124 },
    { id: 18, bh: "บช.ศ.", duplicate: 60 },
    { id: 19, bh: "กมค.", duplicate: 44 },
    { id: 20, bh: "สง.ผบ.ตร.", duplicate: 12 },
  ];

  const agencyTable = [
    { id: 1, bh: "บก.สปส.บช.ปส", duplicate: 18196, lat: 13.7563, lon: 100.5018 },
    { id: 2, bh: "บก.ปส.3", duplicate: 10393, lat: 13.963, lon: 100.5018 },
    { id: 3, bh: "บก.ปส.2", duplicate: 100, lat: 13.363, lon: 100.5018 },
    { id: 4, bh: "บก.ปส.4", duplicate: 3736, lat: 13.263, lon: 100.5018 },
    { id: 5, bh: "บก.ปส.1", duplicate: 3380, lat: 13.163, lon: 100.5018 },
    { id: 6, bh: "บก.ขส.บช.ปส.", duplicate: 3368, lat: 14.7563, lon: 100.5018 },
    { id: 7, bh: "บก.อก.บช.ปส.", duplicate: 3321, lat: 12.7563, lon: 100.5018 },
  ];

  const userList = [
    { id: 1, count: 818, nationId: "3446788789167", prefix: "นาย", name: "สมชาย", lastName: "ใจดี", phone: "0812345678", bh: "บช.น.", bk: "ภ.1", org: "บก.สปส.บช.ปส" },
    { id: 2, count: 799, nationId: "3446788789716", prefix: "นาย", name: "สมชาย", lastName: "ใจดี", phone: "0812345678", bh: "บช.น.", bk: "ภ.1", org: "บก.สปส.บช.ปส" },
    { id: 3, count: 750, nationId: "3446787891678", prefix: "นาย", name: "สมชาย", lastName: "ใจดี", phone: "0812345678", bh: "บช.น.", bk: "ภ.1", org: "บก.สปส.บช.ปส" },
    { id: 4, count: 735, nationId: "3446788789111", prefix: "นาย", name: "สมชาย", lastName: "ใจดี", phone: "0812345678", bh: "บช.น.", bk: "ภ.1", org: "บก.สปส.บช.ปส" },
    { id: 5, count: 710, nationId: "3446878916778", prefix: "นาย", name: "สมชาย", lastName: "ใจดี", phone: "0812345678", bh: "บช.น.", bk: "ภ.1", org: "บก.สปส.บช.ปส" },
    { id: 6, count: 697, nationId: "1446788789347", prefix: "นาย", name: "สมชาย", lastName: "ใจดี", phone: "0812345678", bh: "บช.น.", bk: "ภ.1", org: "บก.สปส.บช.ปส" },
    { id: 7, count: 654, nationId: "3446788716789", prefix: "นาย", name: "สมชาย", lastName: "ใจดี", phone:"0812345678" ,bh:"บช.น.", bk:"ภ.1" ,org:"บก.สปส.บช.ปส"},
    { id: 8, count: 645, nationId: "1446788787916", prefix: "นาย", name: "สมชาย", lastName: "ใจดี", phone:"0812345678" ,bh:"บช.น.", bk:"ภ.1" ,org:"บก.สปส.บช.ปส"},
    { id: 9, count: 600, nationId: "3448789167678", prefix: "นาย", name: "สมชาย", lastName: "ใจดี", phone:"0812345678" ,bh:"บช.น.", bk:"ภ.1" ,org:"บก.สปส.บช.ปส"},
    { id: 10, count: 550, nationId: "3446788916787", prefix: "นาย", name: "สมชาย", lastName: "ใจดี", phone:"0812345678" ,bh:"บช.น.", bk:"ภ.1" ,org:"บก.สปส.บช.ปส"},
  ];

  const maxValueProgress = Math.max(...progress.map(row => row.duplicate))

  const {
    showCountInMap,
  } = useMapSearch(map)

  useEffect(() => {
    if (map) {
      const agencyList = agencyTable.map((agency) => ({
        lat: agency.lat.toString(),
        lon: agency.lon.toString(),
        count: agency.duplicate,
      }))
      showCountInMap(agencyList);
    }
  }, [map])

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

  const handleClearSearch = () => {

  }

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

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
    <div id='usage-statistics-graph' className={`main-content ${isOpen ? "pl-[130px]" : "pl-[10px]"} pr-[10px] transition-all duration-500 overflow-y-auto scrollbar-hide`}>
      <div className='flex flex-col'>
        {/* Header */}
        <Typography variant="h5" color="white" className="font-bold">จำนวนผู้ใช้โดนตัดรหัส</Typography>

        {/* Filter Part */}
        <div className='grid grid-cols-4 gap-x-[50px] gap-y-3 pt-5'>
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

          <div className='col-start-4 flex items-end justify-end gap-2'>
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
        <div className='grid grid-cols-3 gap-2 mt-10'>
          {/* Pie Chart */}
          <div className='flex flex-col border-[1px] border-[#797979] rounded-[5px] p-2 row-span-3'>
            <label className='text-[#FDCC0A] text-[16px]'>สถิติการใช้งานระบบ</label>
            <div className='flex items-center justify-center w-full h-full'>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie
                    stroke="none"
                    data={pieChartMock}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    activeShape={CustomShape}
                    isAnimationActive={false}
                    activeIndex={activeIndex}
                    onMouseEnter={onPieEnter}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Total Count */}
          <div className='col-span-2 border-[1px] border-[#797979] rounded-[5px] p-2'>
            <div className='grid grid-cols-[40%_auto_auto_auto]'>
              <div className='flex flex-col w-full border-r-[1px] border-[#FFFFFF]'>
                <label className='text-[#FDCC0A] text-[16px]'>จำนวนทั้งหมด</label>
                <p className='text-[53px] text-center'>1,565,660</p>
              </div>
              <div className='flex flex-col items-center justify-center border-r-[1px] border-[#FFFFFF]'>
                <p className='text-[38px] text-center'>121,900</p>
                <label className='text-[#FDCC0A] text-[16px] justify-end'>หน่วยงาน</label>
              </div>
              <div className='flex flex-col items-center justify-center border-r-[1px] border-[#FFFFFF]'>
                <p className='text-[38px] text-center'>12,900</p>
                <label className='text-[#FDCC0A] text-[16px] justify-end'>หน่วยงาน</label>
              </div>
              <div className='flex flex-col items-center justify-center'>
                <p className='text-[38px] text-center'>12,900</p>
                <label className='text-[#FDCC0A] text-[16px] justify-end'>หน่วยงาน</label>
              </div>
            </div>
          </div>

          {/* Agency Chart */}
          <div className='flex flex-col border-[1px] border-[#797979] rounded-[5px] px-2 pt-3 pb-4 row-span-2'>
            <div className='flex justify-between'>
              <label className='text-[#FDCC0A] text-[16px]'>หน่วยงาน</label>
              <IconButton 
                className="tertiary-btn"
                sx={{
                  borderRadius: "4px !important",
                }}
              >
                <img src={CSVIcon} alt='CSV Icon' className='w-[20px] h-[20px]' />
              </IconButton>
            </div>
            <div className='flex flex-col space-y-2 pt-3'>
              {
                progress.map((row) => (
                  <div>
                    <div className='flex justify-between text-[16px]'>
                      <span>{row.bh}</span>
                      <span>{row.duplicate}</span>
                    </div>
                    <Box sx={{ width: '100%' }}>
                      <LinearProgressWithLabel value={row.duplicate} maxValueProgress={maxValueProgress} />
                    </Box>
                  </div>
                ))
              }
            </div>
          </div>

          {/* All Agency Table */}
          <div className='col-start-3 row-span-5 flex flex-col border-[1px] border-[#797979] rounded-[5px] px-2 pt-3 pb-4'>
            <div className='flex justify-between'>
              <label className='text-[#FDCC0A] text-[16px]'>หน่วยงาน</label>
              <IconButton 
                className="tertiary-btn"
                sx={{
                  borderRadius: "4px !important",
                }}
              >
                <img src={CSVIcon} alt='CSV Icon' className='w-[20px] h-[20px]' />
              </IconButton>
            </div>
            <div className='pt-2'>
              <TableContainer
                component={Paper} 
                sx={{ backgroundColor: "transparent" }}
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
                      <TableCell align="center" sx={{ color: "#FFFFFF" }}>หน่วยงาน</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF" }}>จำนวน</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {
                      allAgencyTable.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD", padding: "10px 8px" }}>{row.bh}</TableCell>
                          <TableCell sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD", padding: "10px 8px" }}>{row.duplicate}</TableCell>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </div>

          {/* Agency Table */}
          <div className='row-span-3 col-span-2 flex flex-col border-[1px] border-[#797979] rounded-[5px] px-2 pt-3 pb-4'>
            <div className='flex justify-between'>
              <label className='text-[#FDCC0A] text-[16px]'>หน่วยงาน</label>
              <IconButton 
                className="tertiary-btn"
                sx={{
                  borderRadius: "4px !important",
                }}
              >
                <img src={CSVIcon} alt='CSV Icon' className='w-[20px] h-[20px]' />
              </IconButton>
            </div>
            <div className='pt-2'>
              <TableContainer
                component={Paper} 
                sx={{ backgroundColor: "transparent" }}
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
                      <TableCell align="center" sx={{ color: "#FFFFFF" }}>หน่วยงาน</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF" }}>จำนวน</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {
                      agencyTable.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD", padding: "10px 8px" }}>{row.bh}</TableCell>
                          <TableCell sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD", padding: "10px 8px" }}>{row.duplicate}</TableCell>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </div>

          {/* User List Table */}
          <div className='row-span-3 col-span-3 flex flex-col border-[1px] border-[#797979] rounded-[5px] px-2 pt-3 pb-4'>
            <div className='flex justify-between'>
              <label className='text-[#FDCC0A] text-[16px]'>จำนวนรายชื่อ</label>
              <IconButton 
                className="tertiary-btn"
                sx={{
                  borderRadius: "4px !important",
                }}
              >
                <img src={CSVIcon} alt='CSV Icon' className='w-[20px] h-[20px]' />
              </IconButton>
            </div>
            <div className='pt-2'>
              <TableContainer
                component={Paper} 
                sx={{ backgroundColor: "transparent" }}
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
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "3%" }}>ลำดับ</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "5%" }}>จำนวน</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "8%" }}>เลขบัตร</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "5%" }}>คำนำหน้า</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "15%" }}>ชื่อ-นามสกุล</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "5%" }}>โทรศัพท์</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "8%" }}>กองบัญชาการ</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "10%" }}>กองกำกับการ</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF" }}>หน่วยงาน</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {
                      userList.map((row, index) => (
                        <TableRow key={row.id}>
                          <TableCell align="center" sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD", padding: "10px 8px" }}>{index + 1}</TableCell>
                          <TableCell align="center" sx={{ backgroundColor: "#48494B", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD", padding: "10px 8px" }}>{row.count}</TableCell>
                          <TableCell align="center" sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD", padding: "10px 8px" }}>{row.nationId}</TableCell>
                          <TableCell align="center" sx={{ backgroundColor: "#48494B", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD", padding: "10px 8px" }}>{row.prefix}</TableCell>
                          <TableCell sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD", padding: "10px 8px" }}>{`${row.name} ${row.lastName}`}</TableCell>
                          <TableCell align="center" sx={{ backgroundColor: "#48494B", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD", padding: "10px 8px" }}>{row.phone}</TableCell>
                          <TableCell align="center" sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD", padding: "10px 8px" }}>{row.bh}</TableCell>
                          <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD", padding: "10px 8px" }}>{row.bk}</TableCell>
                          <TableCell sx={{ backgroundColor: "#393B3A", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD", padding: "10px 8px" }}>{row.org}</TableCell>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </TableContainer>

              <div className={`${userList.length > 0 ? "flex" : "hidden"} items-center justify-between bg-[var(--background-color)] pt-3 pl-1`}>
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

export default EndUser;