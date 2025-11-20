// import React, { useState, useEffect, useCallback } from 'react'
// import { 
//   Typography,
//   Checkbox,
//   FormGroup,
//   FormControlLabel,
//   Button,
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
// import CSVIcon from "../../assets/icons/csv.png";
// import PDFIcon from "../../assets/icons/pdf.png";
// import SearchIcon from '@mui/icons-material/Search';
// import { UserRoundPlus } from "lucide-react";

// // Types
// import { FileData, SuspectPersonSearch } from "../../features/search/SearchTypes";
// import { DeleteRequestData, Camera } from "../../features/types";

// // Context
// import { useHamburger } from "../../context/HamburgerContext";

// // Components
// import Loading from "../../components/loading/Loading";
// import TextBox from '../../components/text-box/TextBox';
// import DatePickerBuddhist from "../../components/date-picker-buddhist/DatePickerBuddhist";
// import AutoComplete from '../../components/auto-complete/AutoComplete';
// import MultiSelectCameras from '../../components/multi-select/MultiSelectCameras';
// import PaginationComponent from '../../components/pagination/Pagination';

// // Images
// import PinGoogleMap from "../../assets/icons/pin_google-maps.png";

// // Utils
// import { PopupMessage } from '../../utils/popupMessage';
// import { formatThaiID } from "../../utils/commonFunction"

// // Mocks
// import { mockSuspectPersonSearch } from "../../mocks/mockSuspectPerson";

// // Constant
// import { SUSPECT_PERSON_SEARCH_ROW_PER_PAGES } from "../../constants/dropdown";

// interface FormData {
//   name: string
//   surname: string
//   nationalId: string
//   start_date_time: Date | null
//   end_date_time: Date | null
//   area_id: number
//   province_id: number
//   station_id: number
//   department_id: number
//   checkpoints_id: number[]
//   imagesData: {
//     [key: number]: FileData
//   }
// };

// interface SearchSuspectPersonProps {

// }

// const SearchSuspectPerson: React.FC<SearchSuspectPersonProps> = ({}) => {
//   const { isOpen } = useHamburger();
//   const dispatch: AppDispatch = useDispatch()
//   const [isLoading, setIsLoading] = useState(false);
//   const [isHideImage, setIsHideImage] = useState(false);
//   const [departmentsOptions, setDepartmentsOptions] = useState<{ label: string ,value: number }[]>([]);
//   const [areasOptions, setAreasOptions] = useState<{ label: string ,value: number }[]>([]);
//   const [stationsOptions, setStationsOptions] = useState<{ label: string ,value: number }[]>([]);
//   const [provincesOptions, setProvincesOptions] = useState<{ label: string ,value: number }[]>([]);
//   const [checkpointsOption, setCheckpointsOption] = useState<Camera[]>([]);
//   const [suspectPersonSearchList, setSuspectPersonSearchList] = useState<SuspectPersonSearch[]>([]);
//   const [searchCheckpointsVisible, setSearchCheckpointsVisible] = useState(false);
//   const [selectedCheckpointObjects, setSelectedCheckpointObjects] = useState<Camera[]>([]);

//   // Pagination
//   const [page, setPage] = useState(1);
//   const [pageInput, setPageInput] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [rowsPerPage, setRowsPerPage] = useState(SUSPECT_PERSON_SEARCH_ROW_PER_PAGES[SUSPECT_PERSON_SEARCH_ROW_PER_PAGES.length - 1]);
//   const [rowsPerPageOptions] = useState(SUSPECT_PERSON_SEARCH_ROW_PER_PAGES);

//   const sliceDropdown = useSelector(
//     (state: RootState) => state.dropdownData
//   );

//   const [formData, setFormData] = useState<FormData>({
//     name: "",
//     surname: "",
//     nationalId: "",
//     start_date_time: null,
//     end_date_time: null,
//     area_id: 0,
//     province_id: 0,
//     station_id: 0,
//     department_id: 0,
//     checkpoints_id: [],
//     imagesData: {},
//   });

//   useEffect(() => {
//     setSuspectPersonSearchList(mockSuspectPersonSearch);
//   }, [mockSuspectPersonSearch])

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
//     if (sliceDropdown.departments && sliceDropdown.departments.data) {
//       const options = sliceDropdown.departments.data.map((row) => ({
//         label: row.department,
//         value: row.id,
//       }));
//       setDepartmentsOptions(options);
//     }
//   }, [sliceDropdown.departments]);

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

//   const handleTextChange = (key: keyof typeof formData, value: string) => {
//     setFormData((prev) => ({ ...prev, [key]: value }));
//   };

//   const handleDropdownChange = (key: keyof typeof formData, value: string) => {
//     setFormData((prev) => ({ ...prev, [key]: value }));
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

//   const handleDepartmentChange = (
//     event: React.SyntheticEvent,
//     value: { value: any ,label: string } | null
//   ) => {
//     event.preventDefault();
//     if (value) {
//       handleDropdownChange("department_id", value.value);
//     }
//     else {
//       handleDropdownChange("department_id", '');
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

//   const handleHideImageChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setIsHideImage(event.target.checked);
//   };

//   const handleCheckPointChange = (ids: string[]) => {
//     console.log(ids)
//     // setFormData((prev) => ({ ...prev, ["checkpoints_id"]: ids }));
//     // const selectedObjects = checkpointsOption.filter(cp => ids.includes(cp.id));
//     // setSelectedCheckpointObjects(selectedObjects);
//   };

//   const handleClearSearch = async () => {
//     setSelectedCheckpointObjects([]);
//   };

//   const handleDeleteImage = useCallback(async (position: number, url: string) => {
//     try {
//       const deleteFile: DeleteRequestData = {
//         url: url
//       }
//       await deleteFileUpload(deleteFile)
//     }
//     catch (error) {

//     }
//     setFormData((prev) => {
//       const updatedImagesData = { ...prev.imagesData }
//       delete updatedImagesData[position]

//       return {
//         ...prev,
//         imagesData: updatedImagesData,
//       }
//     })
//   }, [dispatch])

//   const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const files = event.target.files
//     if (!files) return

//     // Convert the file list to an array for processing
//     const fileArray = Array.from(files)


//     // Helper function to determine next available positions
//     const getNextAvailablePositions = (
//       currentImages: { [key: number]: FileData },
//       numNeeded: number
//     ) => {
//       const positions: number[] = []
//       for (let i = 0; i < 3 && positions.length < numNeeded; i++) {
//         if (!currentImages[i]) {
//           positions.push(i)
//         }
//       }
//       return positions
//     }

//     const availablePositions = getNextAvailablePositions(
//       formData.imagesData,
//       fileArray.length
//     )


//     try {
//       const formData = new FormData()
//       fileArray.forEach(file => {
//         formData.append("files", file)
//       })

//       // const response = await dispatch(
//       //   postFilesDataThunk(formData)
//       // ).unwrap()

//       // if (response?.data) {
//       //   const uploadedImages = response.data.map((file: any, index: any) => ({
//       //     position: availablePositions[index],
//       //     image: {
//       //       title: file.title,
//       //       url: file.url,
//       //     },
//       //   }))

//       //   const imagesDataUpdates = uploadedImages.reduce(
//       //     (acc: any, { position, image }) => {
//       //       if (position !== undefined) {
//       //         acc[position] = image
//       //       }
//       //       return acc
//       //     },
//       //     {} as { [key: number]: FileData }
//       //   )

//       //   setFormData((prev) => ({
//       //     ...prev,
//       //     imagesData: {
//       //       ...prev.imagesData,
//       //       ...imagesDataUpdates,
//       //     },
//       //   }))
//       // }
//     } 
//     catch (error) {
//       PopupMessage("เกิดข้อผิดพลาดในการอัพโหลดไฟล์", error instanceof Error ? error.message : String(error) , "error");
//     }
//   }, [dispatch, formData.imagesData])

//   const deleteFileUpload = async (deleteFile: DeleteRequestData) => {
//     try {
//       console.log(deleteFile)
//     }
//     catch (error) {
      
//     }
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
//   };

//   const handleNationalIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const input = event.target.value;
//     const cleaned = input.replace(/\D/g, '');
    
//     if (cleaned.length <= 13) {
//       const formatted = formatThaiID(cleaned)
//       handleTextChange("nationalId", formatted)
//     }
//     return cleaned
//   }

//   return (
//     <div id='search-suspect-person' className={`main-content ${isOpen ? "pl-[130px]" : "pl-2.5"} transition-all duration-500`}>
//       { isLoading && <Loading /> }
//       <div className='flex flex-col w-full'>
//         {/* Header */}
//         <Typography variant="h5" color="white" className="font-bold">ตรวจหาบุคคลต้องสงสัย</Typography>

//         {/* Filter Part */}
//         <div className='grid grid-cols-2 pt-2.5'>
//           {/* Column 1 */}
//           <div className='grid grid-cols-2 border-r border-[#4A4A4A] gap-y-3 gap-x-[13%] pr-[60px]'>
//             <div className='row-span-3'>
//               <Typography sx={{ fontSize: "15px" }} variant='subtitle1' color='white'>
//                 ค้นหาจากรูปภาพ
//               </Typography>
//               {/* Image Upload Section */}
//               <div id="image-import-part" className="flex flex-col items-center">
//                 <label
//                   htmlFor="image-upload"
//                   className="relative flex items-center justify-center w-full h-[250px] mt-[5px] bg-[#48494B] cursor-pointer overflow-hidden hover:bg-gray-800"
//                 >
//                   { formData.imagesData && Object.keys(formData.imagesData).length > 0 ? (
//                     <div className="relative w-full h-full">
//                       {/* First Image (Full Size) */}
//                       {formData.imagesData[0] && (
//                         <div className="absolute inset-0">
//                           <img
//                             src={`${formData.imagesData[0].url}`}
//                             alt="Uploaded 1"
//                             className="object-contain w-full h-full"
//                           />
//                           <button
//                             type="button"
//                             className="absolute z-52 top-2 right-2 text-white bg-red-500 rounded-full w-[30px] h-[30px] flex items-center justify-center hover:cursor-pointer"
//                             onClick={() => handleDeleteImage(0, formData.imagesData[0].url)}
//                           >
//                             &times;
//                           </button>
//                         </div>
//                       )}

//                       {/* Second and Third Images (Bottom Left) */}
//                       <div className="absolute bottom-2 left-2 flex gap-2">
//                         {[1, 2].map(
//                           (position) =>
//                             formData.imagesData[position] && (
//                               <div
//                                 key={position}
//                                 className="relative w-20 h-[60px] border border-white bg-tuna"
//                               >
//                                 <img
//                                   src={`${formData.imagesData[position].url}`}
//                                   alt={`Uploaded ${position + 1}`}
//                                   className="object-contain w-full h-full"
//                                 />
//                                 <button
//                                   type="button"
//                                   className="absolute z-52 top-[-5px] right-[-5px] text-white bg-red-500 rounded-full w-5 h-5 flex items-center justify-center hover:cursor-pointer"
//                                   onClick={() => handleDeleteImage(position, formData.imagesData[position].url)}
//                                 >
//                                   &times;
//                                 </button>
//                               </div>
//                             )
//                         )}
//                       </div>
//                     </div>
//                   ) : (
//                     /* No Images */
//                     <div className="flex flex-col justify-center items-center">
//                       <UserRoundPlus size={70} color='#2B9BED' />
//                       <span className="text-[18px] text-nobel mt-5">
//                         เพิ่มรูปภาพบุคคล
//                       </span>
//                     </div>
//                   )}
//                   {/* Hidden File Input */}
//                   <input
//                     id="image-upload"
//                     type="file"
//                     name="images"
//                     accept="image/*"
//                     multiple
//                     className="absolute inset-0 opacity-0 cursor-pointer"
//                     onChange={handleImageUpload}
//                   />
//                 </label>
//               </div>
//             </div>

//             <TextBox
//               sx={{ marginTop: "10px", fontSize: "15px" }}
//               id="name"
//               label="ชื่อ"
//               value={formData.name}
//               onChange={(event) =>
//                 handleTextChange("name", event.target.value)
//               }
//             />

//             <TextBox
//               sx={{ marginTop: "10px", fontSize: "15px" }}
//               id="surname"
//               label="นามสกุล"
//               value={formData.surname}
//               onChange={(event) =>
//                 handleTextChange("surname", event.target.value)
//               }
//             />

//             <TextBox
//               sx={{ marginTop: "10px", fontSize: "15px" }}
//               id="national-id"
//               label="หมายเลขบัตรประชาชน"
//               value={formData.nationalId}
//               onChange={handleNationalIdChange}
//             />

//             <div>
//               <Typography sx={{ fontSize: "15px"}} variant='subtitle1' color='white'>
//                 วัน/เวลา เริ่มต้น
//               </Typography>
//               <DatePickerBuddhist
//                 value={formData.start_date_time}
//                 sx={{
//                   marginTop: "8px",
//                   "& .MuiOutlinedInput-input": {
//                     fontSize: 14
//                   }
//                 }}
//                 className="w-full"
//                 id="start-date-time"
//                 onChange={(value) => handleStartDateTimeChange(value)}
//                 isWithTime={true}
//               >
//               </DatePickerBuddhist>
//             </div>

//             <div>
//               <Typography sx={{ fontSize: "15px"}} variant='subtitle1' color='white'>
//                 วัน/เวลา สิ้นสุด
//               </Typography>
//               <DatePickerBuddhist
//                 value={formData.end_date_time}
//                 sx={{
//                   marginTop: "8px",
//                   "& .MuiOutlinedInput-input": {
//                     fontSize: 14
//                   }
//                 }}
//                 className="w-full"
//                 id="end-date-time"
//                 onChange={(value) => handleEndDateTimeChange(value)}
//                 isWithTime={true}
//               >
//               </DatePickerBuddhist>
//             </div>
//           </div>

//           {/* Column 2 */}
//           <div className={`grid grid-cols-2 gap-y-3 gap-x-[13%] pl-[60px] pr-[30px]`}>
//             <AutoComplete 
//               id="department-select"
//               sx={{ marginTop: "10px"}}
//               value={formData.department_id}
//               onChange={handleDepartmentChange}
//               options={departmentsOptions}
//               label="หน่วยงาน"
//               placeholder="กรุณาเลือกหน่วยงาน"
//               labelFontSize="15px"
//             />

//             <AutoComplete 
//               id="area-select"
//               sx={{ marginTop: "10px"}}
//               value={formData.area_id}
//               onChange={handleAreaChange}
//               options={areasOptions}
//               label="ผ่านในพื้นที่"
//               placeholder="กรุณาเลือกพื้นที่"
//               labelFontSize="15px"
//             />

//             <AutoComplete 
//               id="provice-select"
//               sx={{ marginTop: "10px"}}
//               value={formData.province_id}
//               onChange={handleProvinceChange}
//               options={provincesOptions}
//               label="จังหวัด"
//               placeholder="กรุณาเลือกจังหวัด"
//               labelFontSize="15px"
//             />

//             <AutoComplete 
//               id="station-select"
//               sx={{ marginTop: "10px"}}
//               value={formData.station_id}
//               onChange={handleStationChange}
//               options={stationsOptions}
//               label="สถานี"
//               placeholder="กรุณาเลือกสถานี"
//               labelFontSize="15px"
//             />

//             <div className='col-span-2'>
//               <Typography sx={{ fontSize: "15px" }} variant='subtitle1' color='white'>{"จุดตรวจ/ชื่อด่าน"}</Typography>
//               <div className='flex gap-3 mt-2.5'>
//                 <div className='flex-1'>
//                   <MultiSelectCameras 
//                     limitTags={3} 
//                     options={checkpointsOption} 
//                     onChange={handleCheckPointChange}
//                     selectedValues={selectedCheckpointObjects}
//                   />
//                 </div>
//                 <button 
//                   className="flex items-center justify-center bg-[#797979] hover:bg-[#898989] transition-colors w-[60px] h-10 rounded-[5px] cursor-pointer"
//                   onClick={() => setSearchCheckpointsVisible(true)}
//                 >
//                   <img src={PinGoogleMap} alt="Pin Google map" className='w-[25px] h-[25px]' />
//                 </button>
//               </div>
//             </div>

//             <div className='col-span-2 h-[74.25px]'>
//               <div className='flex items-end justify-between h-full'>
//                 <FormGroup>
//                   <FormControlLabel 
//                     control={
//                       <Checkbox 
//                         sx={{
//                           color: "#FFFFFF",
//                           '&.Mui-checked': {
//                             color: "#FFFFFF",
//                           },
//                           '& .MuiSvgIcon-root': { 
//                             fontSize: 30 
//                           }
//                         }}
//                         onChange={handleHideImageChecked}
//                       />
//                     } 
//                     label="ซ่อนรูปภาพ"
//                   />
//                 </FormGroup>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer Part */}
//         <div className={`flex justify-between mt-5 pr-[30px]`}>
//           <div className='flex items-end'>
//             <label>{`จำนวน ${suspectPersonSearchList.length} รายการ`}</label>
//           </div>
//           {/* Button Part */}
//           <div className='flex gap-2'>
//             <div className='flex gap-1'>
//               <Button
//                 type='submit'
//                 variant="contained"
//                 className="primary-btn"
//                 startIcon={<SearchIcon />}
//                 sx={{
//                   width: "90px",
//                   '& .MuiSvgIcon-root': { 
//                     fontSize: 26 
//                   } 
//                 }}
//                 >
//                 ค้นหา
//               </Button>

//               <Button 
//                 variant="outlined" 
//                 className="secondary-btn" 
//                 onClick={handleClearSearch}
//                 sx={{
//                   width: "90px",
//                 }}
//               >
//                 ล้างค่า
//               </Button>
//             </div>

//             <div className='flex gap-1'>
//               <IconButton 
//                 className="tertiary-btn"
//                 sx={{
//                   borderRadius: "4px !important",
//                 }}
//               >
//                 <img src={CSVIcon} alt='CSV Icon' className='w-5 h-5' />
//               </IconButton>

//               <IconButton 
//                 className="tertiary-btn"
//                 sx={{
//                   borderRadius: "4px !important",
//                 }}
//               >
//                 <img src={PDFIcon} alt='PDF Icon' className='w-5 h-5' />
//               </IconButton>
//             </div>
//           </div>
//         </div>

//         {/* Result Table */}
//         <div className="pr-[30px]">
//           <TableContainer 
//             component={Paper} 
//             className='mt-1'
//             sx={{ height: "40vh", backgroundColor: "transparent" }}
//           >
//             <Table sx={{ minWidth: 650, backgroundColor: "#48494B"}}>
//               <TableHead>
//                 <TableRow sx={{ backgroundColor: "#242727", position: "sticky", top: 0, zIndex: 1 }}>
//                   <TableCell align="center" sx={{ color: "#FFFFFF", width: "5%" }}>คำนำหน้า</TableCell>
//                   <TableCell align="center" sx={{ color: "#FFFFFF", width: "12%" }}>ชื่อ-นามสกุล</TableCell>
//                   <TableCell align="center" sx={{ color: "#FFFFFF", width: "10%" }}>รูป</TableCell>
//                   <TableCell align="center" sx={{ color: "#FFFFFF", width: "5%" }}>ความแม่นยำ (%)</TableCell>
//                   <TableCell align="center" sx={{ color: "#FFFFFF", width: "20%" }}>จุดตรวจ/ชื่อด่าน</TableCell>
//                   <TableCell align="center" sx={{ color: "#FFFFFF", width: "15%" }}>ช่วงวัน/เวลา</TableCell>
//                   <TableCell align="center" sx={{ color: "#FFFFFF", width: "5%" }}>หมายเหตุ</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody sx={{ backgroundColor: "#48494B" }}>
//                 {
//                   suspectPersonSearchList.map((data, index) => (
//                     <TableRow key={index}>
//                       <TableCell
//                         sx={{ backgroundColor: data.person_class_id === 1 ? "#EC313161" : "#393B3A", color: "#FFFFFF", textAlign: "center", borderBottom: "1px dashed #ADADAD" }}
//                       >
//                         {data.prefix}
//                       </TableCell>
//                       <TableCell sx={{ backgroundColor: data.person_class_id === 1 ? "#EC313140" : "#48494B", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>{data.name}</TableCell>
//                       <TableCell sx={{ backgroundColor: data.person_class_id === 1 ? "#EC313161" : "#393B3A", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>
//                         <div className='flex items-center justify-center space-x-1 h-10'>
//                           {
//                             isHideImage ? 
//                             "--" : 
//                             <div className='flex space-x-1'>
//                               {
//                                 data.imagesData.map((image, imageIndex) => (
//                                   <img 
//                                     key={`${index}_${imageIndex}`} 
//                                     className='w-[60px] h-[60px]'
//                                     src={image.url} 
//                                     alt="Image"
//                                   />
//                                 ))
//                               }
//                             </div>
//                           }
//                         </div>
//                       </TableCell>
//                       <TableCell sx={{ backgroundColor: data.person_class_id === 1 ? "#EC313140" : "#48494B", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>{`${data.percentConfidence} %`}</TableCell>
//                       <TableCell sx={{ backgroundColor: data.person_class_id === 1 ? "#EC313161" : "#393B3A", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>
//                         {
//                           data.checkpoints.map((checkpoint) => checkpoint.checkpointName).join(", ")
//                         }
//                       </TableCell>
//                       <TableCell sx={{ backgroundColor: data.person_class_id === 1 ? "#EC313140" : "#48494B", color: "#FFFFFF", textAlign: "center", borderBottom: "1px dashed #ADADAD" }}>{data.dateTimeRange}</TableCell>
//                       <TableCell sx={{ backgroundColor: data.person_class_id === 1 ? "#EC313161" : "#393B3A", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>{data.remark}</TableCell>
//                     </TableRow>
//                   ))
//                 }
//               </TableBody>
//             </Table>
//           </TableContainer>

//           <div className={`${suspectPersonSearchList.length > 0 ? "flex" : "hidden"} items-center justify-between bg-(--background-color) py-3 pl-1 sticky bottom-0`}>
//             <PaginationComponent 
//               page={page} 
//               onChange={handlePageChange}
//               rowsPerPage={rowsPerPage}
//               rowsPerPageOptions={rowsPerPageOptions}
//               handleRowsPerPageChange={handleRowsPerPageChange}
//               totalPages={totalPages}
//               pageInput={pageInput.toString()}
//               handlePageInputKeyDown={handlePageInputKeyDown}
//               handlePageInputChange={handlePageInputChange}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// };

// export default SearchSuspectPerson;