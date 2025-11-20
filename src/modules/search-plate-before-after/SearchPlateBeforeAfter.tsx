// import React, { useState, useEffect, useRef } from 'react';
// import { 
//   Button,
//   Typography,
//   Checkbox,
//   FormGroup,
//   FormControlLabel,
//   IconButton,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   SelectChangeEvent,
// } from "@mui/material";
// import { useSelector, useDispatch } from "react-redux";
// import { RootState, AppDispatch } from "../../app/store";

// // Icons
// import SearchIcon from '@mui/icons-material/Search';
// import CompareIcon from '@mui/icons-material/Compare';
// import { Eye, EyeClosed, Pencil } from "lucide-react";
// import ReplayIcon from '@mui/icons-material/Replay';
// import CSVIcon from "../../assets/icons/csv.png";
// import PDFIcon from "../../assets/icons/pdf.png";
// import DownArrowIcon from "../../assets/icons/down-arrow.png";
// import RightArrowIcon from "../../assets/icons/right-arrow.png";
// import RouteList from "../../assets/icons/route-list.png";

// // Components
// import AutoComplete from '../../components/auto-complete/AutoComplete';
// import DatePickerBuddhist from "../../components/date-picker-buddhist/DatePickerBuddhist";
// import MultiSelectCheckpoints from '../../components/multi-select/MultiSelectCameras';
// import PaginationComponent from '../../components/pagination/Pagination';
// import InformationDetail from '../information-detail/InformationDetail';
// import Loading from "../../components/loading/Loading";

// // Context
// import { useHamburger } from "../../context/HamburgerContext";

// // Types
// import {
//   CheckPoint
// } from "../../features/dropdown/dropdownTypes";
// import {
//   PlateSearch
// } from "../../features/search/SearchTypes";

// // Images
// import PinGoogleMap from "../../assets/icons/pin_google-maps.png";

// // Constant
// import { PLATE_SEARCH_BEFORE_AFTER_ROW_PER_PAGES } from "../../constants/dropdown";
// import { ROUTE_COLOR_LIST } from "../../constants/routeColorList";

// // Mocks
// import { mockPlateSearch } from "../../mocks/mockPlateSearch";

// // Modules
// import SearchCheckpoints from "../search-cameras/SearchCameras";

// interface FormData {
//   plate_group: string
//   plate_number: string
//   group_province_id: number
//   province_id: number
//   brand_id: number
//   color_id: number
//   department_id: number
//   area_id: number
//   station_id: number
//   time_range_id: number
//   start_date_time: Date | null
//   end_date_time: Date | null
//   checkpoints_id: number[]
// };


// interface SearchPlateBeforeAfterProps {

// };

// const SearchPlateBeforeAfter: React.FC<SearchPlateBeforeAfterProps> = ({}) => {
//   const { isOpen } = useHamburger()
//   const [isLoading, setIsLoading] = useState(false);

//   // Options
//   const [provincesOptions, setProvincesOptions] = useState<{ label: string ,value: number }[]>([]);
//   const [areasOptions, setAreasOptions] = useState<{ label: string ,value: number }[]>([]);
//   const [stationsOptions, setStationsOptions] = useState<{ label: string ,value: number }[]>([]);
//   const [timeRangeOptions, setTimeRangeOptions] = useState<{ label: string ,value: number }[]>([]);
  
//   // State
//   const [isEditClick, setIsEditClick] = useState(false);
//   const [isHideImage, setIsHideImage] = useState(false);
//   const [isHideItems, setIsHideItems] = useState(false);
//   const [isCompare, setIsCompare] = useState(false);
//   const [searchCheckpointsVisible, setSearchCheckpointsVisible] = useState(false);

//   // Data
//   const [checkpointsOption, setCheckpointsOption] = useState<CheckPoint[]>([]);
//   const [plateList, setPlateList] = useState<PlateSearch[]>(mockPlateSearch);
//   const [plateDetail, setPlateDetail] = useState<PlateSearch[]>([]);
//   const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
//   const [selectedIdList, setSelectedIdList] = useState<PlateSearch[]>([]);
//   const [selectedCheckpointObjects, setSelectedCheckpointObjects] = useState<CheckPoint[]>([]);
//   const [tab, setTab] = useState<number>(0);

//   // Pagination
//   const [page, setPage] = useState(1);
//   const [pageInput, setPageInput] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [rowsPerPage, setRowsPerPage] = useState(PLATE_SEARCH_BEFORE_AFTER_ROW_PER_PAGES[PLATE_SEARCH_BEFORE_AFTER_ROW_PER_PAGES.length - 1]);
//   const [rowsPerPageOptions] = useState(PLATE_SEARCH_BEFORE_AFTER_ROW_PER_PAGES);

//   const sliceDropdown = useSelector(
//     (state: RootState) => state.dropdownData
//   );
  
//   const [formData, setFormData] = useState<FormData>({
//     plate_group: "",
//     plate_number: "",
//     group_province_id: 0,
//     province_id: 0,
//     brand_id: 0,
//     color_id: 0,
//     department_id: 0,
//     area_id: 0,
//     station_id: 0,
//     time_range_id: 0,
//     start_date_time: null,
//     end_date_time: null,
//     checkpoints_id: [],
//   });

//   useEffect(() => {
//     if (plateList) {
//       setTotalPages(plateList.length === 0 ? 1 : Math.ceil(plateList.length / rowsPerPage));
//     }
//   }, []);

//   useEffect(() => {
//     if (sliceDropdown.provinces && sliceDropdown.provinces.data) {
//       const options = sliceDropdown.provinces.data.map((row) => ({
//         label: row.name_th,
//         value: row.id,
//       }));
//       setProvincesOptions(options);
//     }
//   }, [sliceDropdown.provinces]);

//   useEffect(() => {
//     if (sliceDropdown.areas && sliceDropdown.areas.data) {
//       const options = sliceDropdown.areas.data.map((row) => ({
//         label: row.name,
//         value: row.id,
//       }));
//       setAreasOptions(options);
//     }
//   }, [sliceDropdown.areas]);

//   useEffect(() => {
//     if (sliceDropdown.stations && sliceDropdown.stations.data) {
//       const options = sliceDropdown.stations.data.map((row) => ({
//         label: row.name,
//         value: row.id,
//       }));
//       setStationsOptions(options);
//     }
//   }, [sliceDropdown.stations]);

//   useEffect(() => {
//     if (sliceDropdown.checkpoints) {
//       setCheckpointsOption(sliceDropdown.checkpoints.data);
//     }
//   }, [sliceDropdown]);

//   const handleDropdownChange = (key: keyof typeof formData, value: string) => {
//     setFormData((prev) => ({ ...prev, [key]: value }));
//   };

//   const handleProvinceChange = (
//     event: React.SyntheticEvent,
//     value: { value: any ,label: string } | null
//   ) => {
//     event.preventDefault();
//     if (value) {
//       handleDropdownChange("province_id", value.value);
//     }
//     else {
//       handleDropdownChange("province_id", '');
//     }
//   };

//   const handleAreaChange = (
//     event: React.SyntheticEvent,
//     value: { value: any ,label: string } | null
//   ) => {
//     event.preventDefault();
//     if (value) {
//       handleDropdownChange("area_id", value.value);
//     }
//     else {
//       handleDropdownChange("area_id", '');
//     }
//   };

//   const handleStationChange = (
//     event: React.SyntheticEvent,
//     value: { value: any ,label: string } | null
//   ) => {
//     event.preventDefault();
//     if (value) {
//       handleDropdownChange("station_id", value.value);
//     }
//     else {
//       handleDropdownChange("station_id", '');
//     }
//   };

//   const handleTimeRangeChange = (
//     event: React.SyntheticEvent,
//     value: { value: any ,label: string } | null
//   ) => {
//     event.preventDefault();
//     if (value) {
//       handleDropdownChange("time_range_id", value.value);
//     }
//     else {
//       handleDropdownChange("time_range_id", '');
//     }
//   };

//   const handleStartDateTimeChange = (date: Date | null) => {
//     setFormData((prevState) => ({
//       ...prevState,
//       start_date_time: date,
//     }));
//   };
  
//   const handleEndDateTimeChange = (date: Date | null) => {
//     setFormData((prevState) => ({
//       ...prevState,
//       end_date_time: date,
//     }));
//   };

//   const handleCheckPointChange = (ids: number[]) => {
//     setFormData((prev) => ({ ...prev, ["checkpoints_id"]: ids }));
//     const selectedObjects = checkpointsOption.filter(cp => ids.includes(cp.id));
//     setSelectedCheckpointObjects(selectedObjects);
//   };

//   const handleClearSearch = async () => {
//     setSelectedCheckpointObjects([]);
//     resetData();
//   };

//   const resetData = () => {
//     setFormData({
//       plate_group: "",
//       plate_number: "",
//       group_province_id: 0,
//       province_id: 0,
//       brand_id: 0,
//       color_id: 0,
//       department_id: 0,
//       area_id: 0,
//       station_id: 0,
//       time_range_id: 0,
//       start_date_time: null,
//       end_date_time: null,
//       checkpoints_id: [],
//     });
//     setIsHideImage(false);
//   }

//   const handleRowsPerPageChange = async (event: SelectChangeEvent) => {
//     setRowsPerPage(parseInt(event.target.value));
//   };

//   const handlePageChange = async (event: React.ChangeEvent<unknown>, value: number) => {
//     event.preventDefault();
//     setPage(value);
//   };

//   const handlePageInputKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
//     if (event.key === 'Enter') {
//       event.preventDefault();
  
//       setPage(pageInput);
//     }
//   };

//   const handlePageInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const input = event.target.value;
//     const cleaned = input.replace(/\D/g, '');

//     if (cleaned) {
//       const numberInput = Number(cleaned);
//       if (numberInput > 0 && numberInput <= totalPages) {
//         setPageInput(numberInput);
//       }
//     }
//     else if (cleaned === "") {
//       setPageInput(1);
//     }
//     return cleaned;
//   }

//   const handleHideImageChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setIsHideImage(event.target.checked);
//   };

//   const handleClickEdit = (
//     event: React.MouseEvent<HTMLButtonElement, MouseEvent>, 
//     index: number,
//     tab: number,
//   ) => {
//     event.stopPropagation();
//     event.preventDefault();
//     setIsEditClick(true);
//     setPlateDetail([plateList[index]])
//     setIsCompare(false);
//     setIsHideItems(true);
//     setTab(tab);
//   };
  
//   const toggleExpand = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, index: number) => {
//     event.stopPropagation();
//     setExpandedRows((prev) => ({
//       ...prev,
//       [index]: !prev[index],
//     }));
//   };

//   const handleCheckpointsSelected = () => {

//   };

//   const handleCheckboxSelectedChange = (event: React.ChangeEvent<HTMLInputElement>, data: PlateSearch) => {
//     event.stopPropagation();
//     setSelectedIdList((prev) => {
//       const exists = prev.find((item) => item.id === data.id);
//       if (exists) {
//         return prev.filter((item) => item.id !== data.id);
//       } 
//       else {
//         return [...prev, data];
//       }
//     });
//   };

//   const handleHideListClicked = () => {
//     setIsHideItems(false);
//     setIsEditClick(false);
//     setPlateDetail([]);
//   };

//   const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement, MouseEvent>, index: number, tab: number, data: PlateSearch) => {
//     event.stopPropagation();
//     event.preventDefault();
//     setIsEditClick(true);
//     setPlateDetail([plateList[index]])
//     setIsCompare(false);
//     setIsHideItems(true);
//     setTab(tab);
//     setSelectedIdList((prev) => {
//       const exists = prev.find((item) => item.id === data.id);
//       if (exists) {
//         return [...prev];
//       } 
//       else {
//         return [...prev, data];
//       }
//     });
//   }

//   const handleRefreshClick = () => {
//     setIsHideItems(false);
//     setIsEditClick(false);
//     setPlateDetail([]);
//     setSelectedIdList([]);
//   }

//   return (
//     <div id='search-plate-before-after' className={`${isEditClick ? "pt-20 h-screen w-[73%]" : "main-content"} ${isOpen ? "pl-[130px]" : "pl-2.5"} transition-all duration-500`}>
//       { isLoading && <Loading /> }
//       <div className='w-full h-full overflow-x-auto'>
//         <div className='flex flex-col w-full h-full overflow-auto min-w-[1200px]'>
//           {/* Header */}
//           <Typography variant="h5" color="white" className="font-bold">ตรวจหาทะเบียน แบบก่อน/หลัง ผ่านด่าน</Typography>

//           {/* Filter Part */}
//           <div className='flex-none'>
//             <div className={`grid grid-cols-[20%_20%_20%_25%] gap-y-3 ${isEditClick ? "pr-5 gap-x-[5%]" : "pr-2.5 gap-x-[5%]"}`}>
//               <AutoComplete 
//                 id="area-select"
//                 sx={{ marginTop: "10px"}}
//                 value={formData.area_id}
//                 onChange={handleAreaChange}
//                 options={areasOptions}
//                 label="ผ่านในพื้นที่"
//                 placeholder="กรุณาเลือกพื้นที่"
//                 labelFontSize="15px"
//               />

//               <AutoComplete 
//                 id="provice-select"
//                 sx={{ marginTop: "10px"}}
//                 value={formData.province_id}
//                 onChange={handleProvinceChange}
//                 options={provincesOptions}
//                 label="จังหวัด"
//                 placeholder="กรุณาเลือกจังหวัด"
//                 labelFontSize="15px"
//               />

//               <AutoComplete 
//                 id="station-select"
//                 sx={{ marginTop: "10px"}}
//                 value={formData.station_id}
//                 onChange={handleStationChange}
//                 options={stationsOptions}
//                 label="สถานี"
//                 placeholder="กรุณาเลือกสถานี"
//                 labelFontSize="15px"
//               />

//               <div>
//                 <Typography sx={{ fontSize: "15px" }} variant='subtitle1' color='white'>{"จุดตรวจ/ชื่อด่าน"}</Typography>
//                 <div className={`flex mt-2.5 gap-2`}>
//                   <div className='w-[80%]'>
//                     <div className='flex-1'>
//                       <MultiSelectCheckpoints 
//                         limitTags={ 1 } 
//                         selectedValues={selectedCheckpointObjects}
//                         options={checkpointsOption} 
//                         onChange={handleCheckPointChange}
//                       />
//                     </div>
//                   </div>
//                   <button 
//                     className="flex items-center justify-center bg-[#797979] hover:bg-[#898989] transition-colors w-[60px] h-10 rounded-[5px] cursor-pointer"
//                     onClick={() => setSearchCheckpointsVisible(true)}
//                   >
//                     <img src={PinGoogleMap} alt="Pin Google map" className='w-[25px] h-[25px]' />
//                   </button>
//                 </div>
//               </div>

//               <AutoComplete 
//                 id="provice-select"
//                 sx={{ marginTop: "10px"}}
//                 value={formData.province_id}
//                 onChange={handleProvinceChange}
//                 options={provincesOptions}
//                 label="ลักษณะการผ่านด่าน"
//                 placeholder="กรุณาเลือกลักษณะการผ่านด่าน"
//                 labelFontSize="15px"
//               />

//               <AutoComplete 
//                 id="time-range-select"
//                 sx={{ marginTop: "10px"}}
//                 value={formData.time_range_id}
//                 onChange={handleTimeRangeChange}
//                 options={timeRangeOptions}
//                 label="ช่วงเวลาการค้นหา"
//                 placeholder="กรุณาเลือกช่วงเวลาการค้นหา"
//                 labelFontSize="15px"
//               />

//               <div>
//                 <Typography sx={{ fontSize: "15px"}} variant='subtitle1' color='white'>
//                   วัน/เวลา เริ่มต้น
//                 </Typography>
//                 <DatePickerBuddhist
//                   value={formData.start_date_time}
//                   sx={{
//                     marginTop: "8px",
//                     "& .MuiOutlinedInput-input": {
//                       fontSize: 14
//                     }
//                   }}
//                   className="w-full"
//                   id="start-date-time"
//                   onChange={(value) => handleStartDateTimeChange(value)}
//                   isWithTime={true}
//                 >
//                 </DatePickerBuddhist>
//               </div>

//               <div className='w-[80%]'>
//                 <Typography sx={{ fontSize: "15px"}} variant='subtitle1' color='white'>
//                   วัน/เวลา สิ้นสุด
//                 </Typography>
//                 <DatePickerBuddhist
//                   value={formData.end_date_time}
//                   sx={{
//                     marginTop: "8px",
//                     "& .MuiOutlinedInput-input": {
//                       fontSize: 14
//                     }
//                   }}
//                   className="w-full"
//                   id="end-date-time"
//                   onChange={(value) => handleEndDateTimeChange(value)}
//                   isWithTime={true}
//                 >
//                 </DatePickerBuddhist>
//               </div>

//               <div className='col-span-4 flex justify-between items-center mt-4 pr-5'>
//                 <FormGroup>
//                   <FormControlLabel 
//                     control={
//                       <Checkbox 
//                         sx={{ color: "#FFFFFF", '&.Mui-checked': { color: "#FFFFFF" } }}
//                         onChange={handleHideImageChecked}
//                       />
//                     } 
//                     label="ซ่อนรูปภาพ"
//                   />
//                 </FormGroup>
//                 <div className='flex gap-2'>
//                   <Button
//                     type='submit'
//                     variant="contained"
//                     className="primary-btn"
//                     startIcon={<SearchIcon />}
//                     sx={{ width: "90px" }}
//                   >
//                     ค้นหา
//                   </Button>
//                   <Button 
//                     variant="text" 
//                     className="tertiary-btn" 
//                     onClick={handleClearSearch}
//                     sx={{ width: "90px" }}
//                   >
//                     ล้างค่า
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Footer Part */}
//           <div className={`flex justify-between mt-5 ${isEditClick ? "pr-5" : "pr-[30px]"}`}>
//             <div className='flex items-end'>
//               <label>{`จำนวน ${plateList.length} รายการ`}</label>
//             </div>
//             {/* Button Part */}
//             <div className='flex gap-5'>
//               <div className='flex gap-2'>
//                 <Button
//                   variant="contained"
//                   className="tertiary-btn"
//                   startIcon={<CompareIcon />}
//                   sx={{
//                     width: "135px",
//                     height: "40px",
//                     '& .MuiSvgIcon-root': { 
//                       fontSize: 20
//                     } 
//                   }}
//                   onClick={() => setIsCompare(true)}
//                 >
//                   เปรียบเทียบ
//                 </Button>

//                 <Button
//                   variant="contained"
//                   className="tertiary-btn"
//                   startIcon={ isHideItems ? <Eye /> : <EyeClosed />}
//                   sx={{
//                     width: "135px",
//                     height: "40px",
//                     '& .MuiSvgIcon-root': { 
//                       fontSize: 20
//                     } 
//                   }}
//                   onClick={() => handleHideListClicked()}
//                 >
//                   ซ่อนรายการ
//                 </Button>

//                 <Button
//                   variant="contained"
//                   className="tertiary-btn"
//                   startIcon={<ReplayIcon />}
//                   sx={{
//                     width: "110px",
//                     height: "40px",
//                     textTransform: "capitalize",
//                     '& .MuiSvgIcon-root': { 
//                       fontSize: 20
//                     } 
//                   }}
//                   onClick={handleRefreshClick}
//                 >
//                   Refresh
//                 </Button>
//               </div>

//               <div className='flex gap-2'>
//                 <IconButton 
//                   className="tertiary-btn"
//                   sx={{
//                     borderRadius: "4px !important",
//                   }}
//                 >
//                   <img src={CSVIcon} alt='CSV Icon' className='w-5 h-5' />
//                 </IconButton>

//                 <IconButton 
//                   className="tertiary-btn"
//                   sx={{
//                     borderRadius: "4px !important",
//                   }}
//                 >
//                   <img src={PDFIcon} alt='PDF Icon' className='w-5 h-5' />
//                 </IconButton>
//               </div>
//             </div>
//           </div>

//           {/* Result Table */}
//           <div className={`${isEditClick ? "pr-5" : "pr-[30px]"}`}>
//             <TableContainer 
//               component={Paper} 
//               className='mt-1'
//               sx={{ maxHeight: "49.8vh", backgroundColor: "transparent" }}
//             >
//               <Table sx={{ minWidth: 650, backgroundColor: "#48494B"}}>
//                 <TableHead>
//                   <TableRow sx={{ backgroundColor: "#242727", position: "sticky", top: 0, zIndex: 1 }}>
//                     <TableCell align="center" sx={{ color: "#FFFFFF", width: "8%" }}>เปรียบเทียบ</TableCell>
//                     <TableCell align="center" sx={{ color: "#FFFFFF", width: "12%" }}>ป้ายทะเบียน</TableCell>
//                     <TableCell align="center" sx={{ color: "#FFFFFF", width: "10%" }}>รูป</TableCell>
//                     <TableCell align="center" sx={{ color: "#FFFFFF", width: "25%" }}>เส้นทางรถ</TableCell>
//                     <TableCell align="center" sx={{ color: "#FFFFFF", width: "20%" }}>ช่วงวัน/เวลา</TableCell>
//                     <TableCell align="center" sx={{ color: "#FFFFFF", width: "5%" }}>รายละเอียด</TableCell>
//                     <TableCell align="center" sx={{ color: "#FFFFFF", width: "5%" }}>แก้ไข</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody sx={{ backgroundColor: "#48494B" }}>
//                   {
//                     plateList.map((data, index) => (
//                       <TableRow 
//                         key={index}
//                         onClick={(e) => handleRowClick(e, index, 0, data)}
//                       >
//                         <TableCell sx={{ backgroundColor: data.remark ? "#EC313161" : "#393B3A", color: "#FFFFFF", width: "8%", textAlign: "center", borderBottom: "1px dashed #ADADAD" }}>
//                           <Checkbox 
//                             sx={{
//                               color: "#FFFFFF",
//                               '&.Mui-checked': {
//                                 color: "#FFFFFF",
//                               },
//                               '& .MuiSvgIcon-root': { 
//                                 fontSize: 30 
//                               }
//                             }}
//                             checked={selectedIdList.some((item) => item.id === data.id)}
//                             onClick={(e) => e.stopPropagation()}
//                             onChange={(e) => handleCheckboxSelectedChange(e, data)}
//                           />
//                         </TableCell>
//                         <TableCell sx={{ backgroundColor: data.remark ? "#EC313140" : "#48494B", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>{data.plate}</TableCell>
//                         <TableCell sx={{ backgroundColor: data.remark ? "#EC313161" : "#393B3A", color: "#FFFFFF", width: "10%", textAlign: "center", borderBottom: "1px dashed #ADADAD" }}>
//                           <div style={{ 
//                             height: "40px", 
//                             display: "flex", 
//                             alignItems: "center", 
//                             justifyContent: "center" 
//                           }}>
//                             { 
//                               isHideImage ? 
//                               "--" : 
//                               <div className='flex space-x-1'>
//                                 <img src={data.plateImage} alt="Vehicle Image" className='w-[60px] h-[60px]' /> 
//                                 <img src={data.vehicleImage} alt="Vehicle Image" className='w-[60px] h-[60px]' /> 
//                               </div>
//                             }
//                           </div>
//                         </TableCell>
//                         <TableCell
//                           sx={{
//                             backgroundColor: data.remark ? "#EC313140" : "#48494B",
//                             color: "#FFFFFF",
//                             borderBottom: "1px dashed #ADADAD",
//                           }}
//                         >
//                           <div className="flex flex-wrap items-center gap-2">
//                             {data.vehicleRouteList.map((route, routeIndex) => {
//                               const colorIndex = routeIndex % ROUTE_COLOR_LIST.length;
//                               const bgColor = ROUTE_COLOR_LIST[colorIndex];

//                               return (
//                                 <div key={`${index}_${routeIndex}`} className="flex items-center space-x-1">
//                                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: bgColor }} />
//                                   <span>{route.vehicleRoute}</span>
//                                   {routeIndex < data.vehicleRouteList.length - 1 && <span>{">"}</span>}
//                                 </div>
//                               );
//                             })}
//                           </div>
//                           {
//                             expandedRows[index] && (
//                               <>
//                                 <div className='flex flex-col mt-2'>
//                                   <div className='flex space-x-1 items-center'>
//                                     <img src={RouteList} alt="Route List Icon" className='flex w-[30px] h-[30px] ml-[-5px]' />
//                                     <label>รายละเอียดเส้นทางเดินรถ</label>
//                                   </div>
//                                   <div className='space-y-1'>
//                                     {
//                                       data.vehicleRouteList.map((route, routeIndex) => {
//                                         const colorIndex = routeIndex % ROUTE_COLOR_LIST.length;
//                                         const bgColor = ROUTE_COLOR_LIST[colorIndex];

//                                         return (
//                                           <div key={`detail_${index}_${routeIndex}`} className='flex justify-between items-center'>
//                                             <div className='flex items-center space-x-1'>
//                                               <div className="w-3 h-3 rounded-full" style={{ backgroundColor: bgColor }} />
//                                               <span className="whitespace-nowrap">{route.vehicleRoute}</span>
//                                             </div>
//                                             <div>
//                                               {route.dateTimeRange}
//                                             </div>
//                                           </div>
//                                         )
//                                       })
//                                     }
//                                   </div>
//                                 </div>
//                               </>
//                             )
//                           }
//                         </TableCell>
//                         <TableCell align="center" sx={{ backgroundColor: data.remark ? "#EC313161" : "#393B3A", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>{data.dateTimeRange}</TableCell>
//                         <TableCell sx={{ backgroundColor: data.remark ? "#EC313140" : "#48494B", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD", position: "relative" }}>
//                           <div className='flex items-center justify-center'>
//                             <IconButton 
//                               sx={{
//                                 borderRadius: "4px !important",
//                                 padding: "12px",
//                                 backgroundColor: "#797979",
//                                 position: "absolute",
//                                 top: "10px",
//                                 "&:hover": {
//                                   backgroundColor: "#5A5A5A",
//                                 },
//                               }}
//                               onClick={(e) => toggleExpand(e, index)}
//                             >
//                               <img 
//                                 src={expandedRows[index] ? DownArrowIcon : RightArrowIcon}
//                                 alt='Collapse Icon' 
//                                 className='w-[15px] h-[15px]' 
//                               />
//                             </IconButton>
//                           </div>
//                         </TableCell>
//                         <TableCell sx={{ backgroundColor: data.remark ? "#EC313161" : "#393B3A", color: "#FFFFFF", textAlign: "center", width: "5%", borderBottom: "1px dashed #ADADAD" }}>
//                           <IconButton 
//                             sx={{
//                               borderRadius: "4px !important",
//                             }}
//                             onClick={(e) => handleClickEdit(e, index, 2)}
//                           >
//                             <Pencil color='#FFFFFF' size={20} />
//                           </IconButton>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   }
//                 </TableBody>
//               </Table>
//             </TableContainer>

//             <div className={`${plateList.length > 0 ? "flex" : "hidden"} items-center justify-between bg-(--background-color) py-3 pl-1 sticky bottom-0`}>
//               <PaginationComponent 
//                 page={page} 
//                 onChange={handlePageChange}
//                 rowsPerPage={rowsPerPage}
//                 rowsPerPageOptions={rowsPerPageOptions}
//                 handleRowsPerPageChange={handleRowsPerPageChange}
//                 totalPages={totalPages}
//                 pageInput={pageInput.toString()}
//                 handlePageInputKeyDown={handlePageInputKeyDown}
//                 handlePageInputChange={handlePageInputChange}
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Side Components */}
//       <InformationDetail 
//         open={isEditClick}
//         isCompare={isCompare}
//         selectedIdList={isCompare ? selectedIdList : plateDetail}
//         tab={tab}
//       />

//       {/* Dialog */}
//       <SearchCheckpoints 
//         open={searchCheckpointsVisible}
//         selectedCheckpoints={handleCheckpointsSelected}
//         onClose={() => setSearchCheckpointsVisible(false)}
//       />
//     </div>
//   )
// }

// export default SearchPlateBeforeAfter;