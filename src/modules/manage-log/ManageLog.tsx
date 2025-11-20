// import React, { useState, useEffect } from 'react'
// import { 
//   Button,
//   Typography,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   IconButton,
//   SelectChangeEvent,
// } from "@mui/material";
// import { set, useForm } from "react-hook-form";
// import dayjs from 'dayjs';
// import buddhistEra from 'dayjs/plugin/buddhistEra';
// import * as XLSX from "xlsx";
// import JSZip from "jszip";
// import { saveAs } from "file-saver";
// import { useSelector } from "react-redux";
// import { RootState } from "../../app/store";

// // Context
// import { useHamburger } from "../../context/HamburgerContext";

// // Components
// import MultiSelectCameras from '../../components/multi-select/MultiSelectCameras';
// import TextBox from '../../components/text-box/TextBox';
// import AutoComplete from '../../components/auto-complete/AutoComplete';
// import DatePickerBuddhist from "../../components/date-picker-buddhist/DatePickerBuddhist";
// import PaginationComponent from '../../components/pagination/Pagination';

// // Types
// import { 
//   Log,
//   Camera,
//   CameraResponse,
// } from '../../features/types';

// // Icons
// import { Search } from 'lucide-react';
// import SearchIcon from '@mui/icons-material/Search';
// import CSVIcon from "../../assets/icons/csv.png";
// import PinMap from "../../assets/icons/pin_google-maps.png";
// import PDFIcon from "../../assets/icons/pdf.png";

// // Mocks
// import { mockLogs } from "../../mocks/mockLogs";

// // Constant
// import { MANAGE_LOG_ROW_PER_PAGES } from "../../constants/dropdown";

// // Modules
// import Location from '../location/Location';
// import SearchLogResult from './search-log-result/SearchLogResult';
// import LogFileReport from './log-file-report/LogFileReport';

// // i18n
// import { useTranslation } from 'react-i18next';

// // Utils
// import { fetchClient, combineURL } from "../../utils/fetchClient";
// import { PopupMessage } from '../../utils/popupMessage';

// // Config
// import { getUrls } from '../../config/runtimeConfig';

// dayjs.extend(buddhistEra);

// interface FormData {
//   bh_id: number
//   bk_id: number
//   org_id: number
//   userId: string
//   action_id: number
//   plate_group: string
//   plate_number: string
//   province_id: number
//   area_id: number
//   checkpoints: number[]
//   start_date_time: Date | null
//   end_date_time: Date | null
// };

// interface ManageLogProps {

// }

// const ManageLog: React.FC<ManageLogProps> = ({}) => {
//   const { CENTER_API } = getUrls();

//   // i18n
//   const { t, i18n } = useTranslation();

//   const { isOpen } = useHamburger();

//   // Options
//   const [bhOptions, setBhOptions] = useState<{ label: string ,value: number }[]>([]);
//   const [bkOptions, setBKOptions] = useState<{ label: string ,value: number }[]>([]);
//   const [orgOptions, setOrgOptions] = useState<{ label: string ,value: number }[]>([]);
//   const [actionOptions, setActionOptions] = useState<{ label: string ,value: number }[]>([]);
//   const [provinceOptions, setProvinceOptions] = useState<{ label: string ,value: number }[]>([]);
//   const [areaOptions, setAreaOptions] = useState<{ label: string ,value: number }[]>([]);
//   const [camerasOption, setCamerasOption] = useState<{value: any, label: string}[]>([]);

//   // Data
//   const [selectedCheckpointIds, setSelectedCheckpointIds] = useState<number[]>([]);
//   const [userLocationVisible, setUserLocationVisible] = useState(false);
//   const [userSearchVisible, setUserSearchVisible] = useState(false);
//   const [logFileReportVisible, setLogFileReportVisible] = useState(false);
//   const [selectedLog, setSelectedLog] = useState<Log | null>(null);
//   const [totalLog, setTotalLog] = useState(0);
//   const [selectedCameraObjects, setSelectedCameraObjects] = useState<{value: any, label: string}[]>([]);
//   const [selectedCameraIds, setSelectedCameraIds] = useState<Camera[]>([]);
//   const [cameraList, setCameraList] = useState<Camera[]>([]);

//   // Pagination
//   const [page, setPage] = useState(1);
//   const [pageInput, setPageInput] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [rowsPerPage, setRowsPerPage] = useState(MANAGE_LOG_ROW_PER_PAGES[MANAGE_LOG_ROW_PER_PAGES.length - 1]);
//   const [rowsPerPageOptions] = useState(MANAGE_LOG_ROW_PER_PAGES);

//   // Constants
//   const chunkSize = 500;

//   // Loader
//   const [pageLoading, setPageLoading] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [progressMessage, setProgressMessage] = useState<string>("");

//   const cameraRefreshKey = useSelector((state: RootState) => state.refresh.cameraRefreshKey);

//   const [formData, setFormData] = useState<FormData>({
//     bh_id: 0,
//     bk_id: 0,
//     org_id: 0,
//     userId: "",
//     action_id: 0,
//     plate_group: "",
//     plate_number: "",
//     province_id: 0,
//     area_id: 0,
//     checkpoints: [],
//     start_date_time: null,
//     end_date_time: null,
//   })

//   const {
//     register,
//     handleSubmit,
//     clearErrors,
//     formState: { errors },
//   } = useForm();

//   useEffect(() => {
//     fetchData();
//   }, [cameraRefreshKey]);

//   const fetchData = async () => {
//     try {
//       const res = await fetchClient<CameraResponse>(combineURL(CENTER_API, "/cameras/get"), {
//         method: "GET",
//         queryParams: {
//           limit: "5000",
//         },
//       });

//       if (res.success) {
//         setCameraList(res.data);
//       }
//     }
//     catch (error) {
//       const errorMessage = error instanceof Error ? error.message : String(error)
//       PopupMessage(t('message.error.error-while-fetching-data'), errorMessage, "error");
//     }
//   };

//   const handleTextChange = (key: keyof typeof formData, value: string) => {
//     setFormData((prev) => ({ ...prev, [key]: value }));
//   };

//   const handleDropdownChange = (key: keyof typeof formData, value: string) => {
//     setFormData((prev) => ({ ...prev, [key]: value }));
//   };

//   const handleBhChange = (
//     event: React.SyntheticEvent,
//     value: { value: any ,label: string } | null
//   ) => {
//     event.preventDefault();
//     if (value) {
//       handleDropdownChange("bh_id", value.value);
//     }
//     else {
//       handleDropdownChange("bh_id", '');
//     }
//   };

//   const handleBkChange = (
//     event: React.SyntheticEvent,
//     value: { value: any ,label: string } | null
//   ) => {
//     event.preventDefault();
//     if (value) {
//       handleDropdownChange("bk_id", value.value);
//     }
//     else {
//       handleDropdownChange("bk_id", '');
//     }
//   };

//   const handleOrgChange = (
//     event: React.SyntheticEvent,
//     value: { value: any ,label: string } | null
//   ) => {
//     event.preventDefault();
//     if (value) {
//       handleDropdownChange("org_id", value.value);
//     }
//     else {
//       handleDropdownChange("org_id", '');
//     }
//   };

//   const handleActionChange = (
//     event: React.SyntheticEvent,
//     value: { value: any ,label: string } | null
//   ) => {
//     event.preventDefault();
//     if (value) {
//       handleDropdownChange("action_id", value.value);
//     }
//     else {
//       handleDropdownChange("action_id", '');
//     }
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

//   const handleUserLocationClick = (log: Log) => () => {
//     setUserLocationVisible(true);
//     setSelectedLog(log);
//   }

//   const exportToCsvNotOverChunkSize = async () => {
//     if (totalLog > chunkSize) {
//       exportToCsvOverChunkSize();
//       return;
//     }

//     setPageLoading(true);
//     setProgress(0);
//     setProgressMessage("กำลังดาวน์โหลดข้อมูล กรุณารอสักครู่");

//     const csvData = mockLogs.map((row, index) => ({
//       ลำดับ: index + 1,
//       รหัสผู้ใช้งาน: row.userId,
//       คำนำหน้า: row.title,
//       "ชื่อ-นามสกุล": `${row.name} ${row.lastname}`,
//       เลขบัตร: row.nationId,
//       Event: row.action,
//       รายละเอียด: row.detail,
//       จุดตรวจ: row.checkpointName,
//       "วัน/เดือน/ปี": dayjs(row.actionDateTime).format("DD/MM/YYYY HH:mm:ss"),
//       "วัน/เดือน/ปี ที่ค้นหา": parseSearchDateTimeRange(row.searchDateTimeRange),
//     }));

//     const date = dayjs().format("YYYY-MM-DD");
//     const ws = XLSX.utils.json_to_sheet(csvData);
//     let csvContent = XLSX.utils.sheet_to_csv(ws, { FS: "," });

//     csvContent = `"รายงาน Log File"\n` + csvContent;

//     const BOM = "\uFEFF";
//     const csvWithBOM = BOM + csvContent;

//     const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     const csvName = `Export_Manage_Log_${date}.csv`;
//     const url = URL.createObjectURL(blob);
    
//     link.href = url;
//     link.setAttribute("download", csvName);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   }

//   const exportToCsvOverChunkSize = async () => {
//     setPageLoading(true);
//     setProgress(0);
//     setProgressMessage("กำลังดาวน์โหลดข้อมูล กรุณารอสักครู่");
//     const totalChunks = Math.ceil(mockLogs.length / chunkSize);
//     setProgress(50);
//     setProgressMessage(`กำลังเตรียมไฟล์ Excel 0/${totalChunks} ... กรุณารอสักครู่`);
//     const zip = new JSZip();

//     for (let i = 0; i < totalChunks; i++) {
//       const chunkData = mockLogs.slice(i * chunkSize, (i + 1) * chunkSize);

//       const csvData = chunkData.map((row, index) => ({
//         ลำดับ: index + 1,
//         รหัสผู้ใช้งาน: row.userId,
//         คำนำหน้า: row.title,
//         "ชื่อ-นามสกุล": `${row.name} ${row.lastname}`,
//         เลขบัตร: row.nationId,
//         Event: row.action,
//         รายละเอียด: row.detail,
//         จุดตรวจ: row.checkpointName,
//         "วัน/เดือน/ปี": dayjs(row.actionDateTime).format("DD/MM/YYYY HH:mm:ss"),
//         "วัน/เดือน/ปี ที่ค้นหา": parseSearchDateTimeRange(row.searchDateTimeRange),
//       }));

//       const ws = XLSX.utils.json_to_sheet(csvData);
//       let csvContent = XLSX.utils.sheet_to_csv(ws, { FS: "," });

//       csvContent = `"รายงาน Log File"\n` + csvContent;

//       const csvWithBOM = "\uFEFF" + csvContent;

//       const date = dayjs().format("YYYY-MM-DD");
//       const fileIndex = totalChunks > 1 ? `_${i + 1}` : "";
//       const fileName = `Export_Manage_Log_${date}${fileIndex}.csv`;

//       zip.file(fileName, csvWithBOM);

//       setProgress(() => 10 + ((i + 1) / totalChunks) * 80);
//       setProgressMessage(`กำลังเตรียมไฟล์ CSV ${i + 1}/${totalChunks} ... กรุณารอสักครู่`);

//       await new Promise((resolve) => setTimeout(resolve, 100));
//     }
    
//     setProgressMessage("กำลังดาวน์โหลดไฟล์ ZIP กรุณารอสักครู่");
//     const zipBlob = await zip.generateAsync({ type: "blob" });
//     const zipName = `Export_Logs_CSV_${dayjs().format("YYYY-MM-DD")}.zip`;
//     saveAs(zipBlob, zipName);

//     setProgress(100);
//     setProgressMessage("ดาวน์โหลดไฟล์ ZIP สำเร็จ");
//     setPageLoading(false);
//   }

//   const parseSearchDateTimeRange = (searchDateTimeRange: string) => {
//     if (searchDateTimeRange) {
//       const [start, end] = searchDateTimeRange.split(" - ");
//       return `${dayjs(start).format("DD/MM/YYYY HH:mm:ss")} - ${dayjs(end).format("DD/MM/YYYY HH:mm:ss")}`;
//     }
//     else {
//       return "-";
//     }
//   }

//   const handleCameraChange = (ids: string[]) => {
//     let newIds: string[];

//     if (ids.length === 0 || ids.includes("0")) {
//       newIds = ["0"];
//     } else {
//       newIds = ids;
//     }

//     const selectedObjects = camerasOption.filter(c => newIds.includes(c.value));
//     setSelectedCameraObjects(selectedObjects);

//     const hasAll = selectedObjects.some((v) => v.value === "0");
    
//     setSelectedCameraIds(hasAll ? cameraList : cameraList.filter(c => newIds.includes(c.camera_uid)));
//   };

//   return (
//     <div id='manage-log' className={`main-content ${isOpen ? "pl-[130px]" : "pl-2.5"} pr-2.5 transition-all duration-500`}>
//       <div className='flex flex-col'>
//         {/* Header */}
//         <Typography variant="h5" color="white" className="font-bold">ระบบบริหารจัดการ Log File</Typography>

//         {/* Filter Part */}
//         <div className='grid grid-cols-4 gap-x-[50px] gap-y-3 pt-5'>
//           <AutoComplete 
//             id="bh-select"
//             sx={{ marginTop: "10px"}}
//             value={formData.bh_id}
//             onChange={handleBhChange}
//             options={bhOptions}
//             label="กองบัญชาการ"
//             labelFontSize="15px"
//           />

//           <AutoComplete 
//             id="bk-select"
//             sx={{ marginTop: "10px"}}
//             value={formData.bk_id}
//             onChange={handleBkChange}
//             options={bkOptions}
//             label="กองบังคับการ"
//             labelFontSize="15px"
//           />

//           <AutoComplete 
//             id="org-select"
//             sx={{ marginTop: "10px"}}
//             value={formData.org_id}
//             onChange={handleOrgChange}
//             options={orgOptions}
//             label="กองกำกับการ"
//             labelFontSize="15px"
//           />

//           <TextBox
//             sx={{ marginTop: "10px", fontSize: "15px" }}
//             id="user-id"
//             label="รหัสผู้ใช้งาน"
//             value={formData.userId}
//             onChange={(event) =>
//               handleTextChange("userId", event.target.value)
//             }
//           />

//           <AutoComplete 
//             id="org-select"
//             sx={{ marginTop: "10px"}}
//             value={formData.action_id}
//             onChange={handleActionChange}
//             options={actionOptions}
//             label="Action"
//             labelFontSize="15px"
//           />

//           <TextBox
//             sx={{ marginTop: "10px", fontSize: "15px" }}
//             id="plate-group"
//             label="หมวดอักษร"
//             value={formData.plate_group}
//             onChange={(event) =>
//               handleTextChange("plate_group", event.target.value)
//             }
//           />

//           <TextBox
//             sx={{ marginTop: "10px", fontSize: "15px" }}
//             id="plate-number"
//             label="เลขทะเบียน"
//             value={formData.plate_number}
//             onChange={(event) =>
//               handleTextChange("plate_number", event.target.value)
//             }
//           />

//           <AutoComplete 
//             id="provice-select"
//             sx={{ marginTop: "10px"}}
//             value={formData.province_id}
//             onChange={handleProvinceChange}
//             options={provinceOptions}
//             label="หมวดจังหวัด"
//             placeholder="กรุณาเลือกจังหวัด"
//             labelFontSize="15px"
//           />

//           <AutoComplete 
//             id="area-select"
//             sx={{ marginTop: "10px"}}
//             value={formData.province_id}
//             onChange={handleAreaChange}
//             options={areaOptions}
//             label="พื้นที่"
//             placeholder="กรุณาเลือกพื้นที่"
//             labelFontSize="15px"
//           />

//           <div className='flex flex-col w-full'>
//             <Typography sx={{ fontSize: "15px" }} variant='subtitle1' color='white'>{t('component.checkpoint-2')}</Typography>
//             <div className='w-full items-center justify-center mt-2.5'>
//               <div className='flex-1'>
//                 <MultiSelectCameras 
//                   limitTags={3} 
//                   selectedValues={selectedCameraObjects}
//                   options={camerasOption} 
//                   onChange={handleCameraChange}
//                   placeHolder={t('placeholder.checkpoint-2')}
//                 />
//               </div>
//             </div>
//           </div>

//           <div>
//             <Typography sx={{ fontSize: "15px"}} variant='subtitle1' color='white'>
//               วัน/เวลา เริ่มต้น
//             </Typography>
//             <DatePickerBuddhist
//               value={formData.start_date_time}
//               sx={{
//                 marginTop: "10px",
//                 "& .MuiOutlinedInput-input": {
//                   fontSize: 15
//                 }
//               }}
//               className="w-full"
//               id="arrest-date"
//               onChange={(value) => handleStartDateTimeChange(value)}
//               error={!!errors.start_date_time}
//               register={register("start_date_time", { 
//                 required: true,
//               })}
//               isWithTime={true}
//             >
//             </DatePickerBuddhist>
//           </div>

//           <div>
//             <Typography sx={{ fontSize: "15px"}} variant='subtitle1' color='white'>
//               วัน/เวลา สิ้นสุด
//             </Typography>
//             <DatePickerBuddhist
//               value={formData.end_date_time}
//               sx={{
//                 marginTop: "10px",
//                 "& .MuiOutlinedInput-input": {
//                   fontSize: 15
//                 }
//               }}
//               className="w-full"
//               id="end-arrest-date"
//               onChange={(value) => handleEndDateTimeChange(value)}
//               error={!!errors.end_date_time}
//               register={register("end_date_time", { 
//                 required: true,
//               })}
//               isWithTime={true}
//             >
//             </DatePickerBuddhist>
//           </div>
//         </div>
//         <div className='flex items-end justify-between mt-5'>
//           <p className='text-[15px]'>{`จำนวน ${0} รายการ`}</p>

//           {/* Button Part */}
//           <div className='flex gap-2'>
//             <Button
//               type='submit'
//               variant="contained"
//               className="primary-btn"
//               startIcon={<SearchIcon />}
//               sx={{ width: "90px" }}
//             >
//               ค้นหา
//             </Button>

//             <IconButton 
//               className="tertiary-btn"
//               sx={{
//                 borderRadius: "4px !important",
//               }}
//               onClick={exportToCsvNotOverChunkSize}
//             >
//               <img src={CSVIcon} alt='CSV Icon' className='w-5 h-5' />
//             </IconButton>
//           </div>
//         </div>
//         {/* Table Part */}
//         <div>
//           <TableContainer
//             component={Paper} 
//             className='mt-1'
//             sx={{ height: "47vh", backgroundColor: "transparent" }}
//           >
//             <Table sx={{ minWidth: 650, backgroundColor: "#48494B"}}>
//               <TableHead>
//                 <TableRow 
//                   sx={{ 
//                     backgroundColor: "#242727", 
//                     position: "sticky", 
//                     top: 0, 
//                     zIndex: 1,
//                     '& td, & th': { borderBottom: 'none' } 
//                   }}
//                 >
//                   <TableCell align="center" sx={{ color: "#FFFFFF", width: "10%" }}>ผู้ใช้งาน</TableCell>
//                   <TableCell align="center" sx={{ color: "#FFFFFF", width: "8%" }}>เลขบัตรประชาชน</TableCell>
//                   <TableCell align="center" sx={{ color: "#FFFFFF", width: "2%" }}>พิกัด</TableCell>
//                   <TableCell align="center" sx={{ color: "#FFFFFF", width: "4%" }}>Action</TableCell>
//                   <TableCell align="center" sx={{ color: "#FFFFFF", width: "10%" }}>รายละเอียด</TableCell>
//                   <TableCell align="center" sx={{ color: "#FFFFFF", width: "5%" }}>วัน/เดือน/ปี</TableCell>
//                   <TableCell align="center" sx={{ color: "#FFFFFF", width: "12%" }}>วัน/เดือน/ปี ที่ค้นหา</TableCell>
//                   <TableCell align="center" sx={{ color: "#FFFFFF", width: "2%" }}>เพิ่มเติม</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {
//                   mockLogs.map((data, index) => (
//                     <TableRow 
//                       key={index} 
//                       sx={{
//                         '& td, & th': { borderBottom: '1px dashed #ADADAD' }
//                       }}
//                     >
//                       <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF" }}>
//                         {`${data.userId} ${data.userName}`}
//                       </TableCell>
//                       <TableCell align="center" sx={{ backgroundColor: "#393B3A", color: "#FFFFFF" }}>
//                         {data.nationId}
//                       </TableCell>
//                       <TableCell align='center' sx={{ backgroundColor: "#48494B", color: "#FFFFFF", padding: "10px 0px 10px 0px" }}>
//                         <IconButton 
//                           className="pin-map-btn"
//                           sx={{
//                             borderRadius: "4px !important",
//                           }}
//                           onClick={handleUserLocationClick(data)}
//                         >
//                           <img src={PinMap} alt='Google Pin' className='w-[25px] h-[25px]' />
//                         </IconButton>
//                       </TableCell>
//                       <TableCell sx={{ backgroundColor: "#393B3A", color: "#FFFFFF" }}>
//                         {data.action}
//                       </TableCell>
//                       <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF" }}>
//                         {data.detail}
//                       </TableCell>
//                       <TableCell align='center' sx={{ backgroundColor: "#393B3A", color: "#FFFFFF" }}>
//                         {
//                           dayjs(data.actionDateTime).format("DD/MM/YYYY HH:mm:ss")
//                         }
//                       </TableCell>
//                       <TableCell align='center' sx={{ backgroundColor: "#48494B", color: "#FFFFFF" }}>
//                         {
//                           parseSearchDateTimeRange(data.searchDateTimeRange)
//                         }
//                       </TableCell>
//                       <TableCell sx={{ backgroundColor: "#393B3A", color: "#FFFFFF" }}>
//                         <div className='flex items-center justify-center'>
//                           <IconButton
//                             onClick={() => setUserSearchVisible(true)}
//                           >
//                             <Search className='w-[25px] h-[25px]' color='white' />
//                           </IconButton>
//                           <IconButton
//                             onClick={() => setLogFileReportVisible(true)}
//                           >
//                             <img src={PDFIcon} alt='PDF Icon' className='w-[25px] h-[25px]' />
//                           </IconButton>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 }
//               </TableBody>
//             </Table>
//           </TableContainer>
//         </div>
//         {/* Pagination Part */}
//         <div className={`${mockLogs.length > 0 ? "flex" : "hidden"} items-center justify-between bg-(--background-color) py-3 pl-1 sticky bottom-0`}>
//           <PaginationComponent 
//             page={page} 
//             onChange={handlePageChange}
//             rowsPerPage={rowsPerPage}
//             rowsPerPageOptions={rowsPerPageOptions}
//             handleRowsPerPageChange={handleRowsPerPageChange}
//             totalPages={totalPages}
//             pageInput={pageInput.toString()}
//             handlePageInputKeyDown={handlePageInputKeyDown}
//             handlePageInputChange={handlePageInputChange}
//           />
//         </div>
//       </div>

//       {/* Modules */}
//       <Location 
//         open={userLocationVisible}
//         onClose={() => setUserLocationVisible(false)}
//         lat={selectedLog?.lat || ""}
//         lng={selectedLog?.lng || ""}
//         title="พิกัดผู้ใช้งาน"
//       />
//       <SearchLogResult
//         open={userSearchVisible}
//         onClose={() => setUserSearchVisible(false)}
//       />
//       <LogFileReport
//         open={logFileReportVisible}
//         onClose={() => setLogFileReportVisible(false)}
//       />
//     </div>
//   )
// }

// export default ManageLog;