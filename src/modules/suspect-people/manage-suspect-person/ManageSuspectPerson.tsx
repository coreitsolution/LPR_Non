import React, {useState, useCallback, useRef, useEffect} from 'react'
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useForm } from "react-hook-form";
import dayjs from 'dayjs';
import { useSelector } from "react-redux";
import { useAppDispatch } from '../../../app/hooks';
import { RootState } from "../../../app/store";

// API
import {
  fetchDistrictsThunk,
  fetchSubDistrictsThunk,
} from "../../../features/dropdown/dropdownSlice"

// Components
import TextBox from '../../../components/text-box/TextBox';
import AutoComplete from '../../../components/auto-complete/AutoComplete';
import DatePickerBuddhist from "../../../components/date-picker-buddhist/DatePickerBuddhist";

// Types
import {
  FileData,
  FileRespondsData,
} from "../../../features/types";

// Icons
import { Save, Download, Upload, Trash2 } from "lucide-react";
import { Icon } from "../../../components/icons/Icon";

interface FormData {
  title_id: number
  firstname: string
  lastname: string
  idcard_number: string
  address: string
  province_id: number
  district_id: number
  subdistrict_id: number
  zipcode: string
  person_class_id: number
  case_number: string
  arrest_warrant_date: Date | null
  arrest_warrant_expire_date: Date | null
  behavior: string
  case_owner_name: string
  case_owner_agency: string
  case_owner_phone: string
  imagesData: {
    [key: number]: FileData
  }
  filesData: FileRespondsData[]
  status: number
};


interface ManageSuspectPersonProps {
  open: boolean;
  onClose: () => void;
}

const ManageSuspectPerson: React.FC<ManageSuspectPersonProps> = ({open, onClose}) => {
  const dispatch = useAppDispatch()

  // Elements
  const hiddenFileInput = useRef<HTMLInputElement | null>(null)

  // Options
  const [prefixOptions, setPrefixOptions] = useState<{ label: string ,value: number }[]>([]);
  const [provinceOptions, setProvinceOptions] = useState<{ label: string ,value: number }[]>([]);
  const [districtOptions, setDistrictOptions] = useState<{ label: string ,value: number }[]>([]);
  const [subDistrictOptions, setSubDistrictOptions] = useState<{ label: string ,value: number }[]>([]);
  const [personTypesOptions, setPersonTypesOptions] = useState<{ label: string ,value: number }[]>([]);
  
  const {
    register,
    formState: { errors },
  } = useForm();

  const [formData, setFormData] = useState<FormData>({
    title_id: 0,
    firstname: "",
    lastname: "",
    idcard_number: "",
    address: "",
    province_id: 0,
    district_id: 0,
    subdistrict_id: 0,
    zipcode: "",
    person_class_id: 0,
    case_number: "",
    arrest_warrant_date: null,
    arrest_warrant_expire_date: null,
    behavior: "",
    case_owner_name: "",
    case_owner_agency: "",
    case_owner_phone: "",
    imagesData: {},
    filesData: [],
    status: 0,
  });

  const sliceDropdown = useSelector(
    (state: RootState) => state.dropdownData
  );

  useEffect(() => {
    if (sliceDropdown.provinces && sliceDropdown.provinces.data) {
      const options = sliceDropdown.provinces.data.map((row) => ({
        label: row.name_th,
        value: row.id,
      }));
      setProvinceOptions(options);
    }
  }, [sliceDropdown.provinces]);

  useEffect(() => {
    if (sliceDropdown.prefix && sliceDropdown.prefix.data) {
      const options = sliceDropdown.prefix.data.map((row) => ({
        label: row.title_th,
        value: row.id,
      }));
      setPrefixOptions(options);
    }
  }, [sliceDropdown.prefix]);

  useEffect(() => {
    if (sliceDropdown.personTypes && sliceDropdown.personTypes.data) {
      const options = sliceDropdown.personTypes.data.map((row) => ({
        label: row.title_en,
        value: row.id,
      }));
      setPersonTypesOptions(options);
    }
  }, [sliceDropdown.personTypes]);

  useEffect(() => {
    const fetchData = async () => {
      if (formData.province_id) {
        const res = await dispatch(fetchDistrictsThunk({ "province_id" : formData.province_id.toString()})).unwrap();
        if (res && res.data) {
          const options = res.data.map((row) => ({
            label: row.name_th,
            value: row.id,
          }));
          setDistrictOptions(options);
        }
      }
      if (formData.district_id) {
        const res = await dispatch(fetchSubDistrictsThunk({ 
          "province_id" : formData.province_id.toString(),
          "district_id" : formData.district_id.toString()
        })).unwrap();
        if (res && res.data) {
          const options = res.data.map((row) => ({
            label: row.name_th,
            value: row.id,
          }));
          setSubDistrictOptions(options);
        }
      }
    };
    fetchData();
  }, [dispatch, formData.province_id, formData.district_id]);

  const handleCancelClick = () => {
    onClose();
  };

  const handleDropdownChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
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
      handleDropdownChange("province_id", '');
      handleDropdownChange("district_id", '');
      handleDropdownChange("subdistrict_id", '');
    }
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
      handleDropdownChange("district_id", '');
      handleDropdownChange("subdistrict_id", '');
    }
  };

  const handleSubDistrictChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("subdistrict_id", value.value);
    }
    else {
      handleDropdownChange("subdistrict_id", '');
    }
  };
  const handlePersonTypesChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("person_class_id", value.value);
    }
    else {
      handleDropdownChange("person_class_id", '');
    }
  };

  const handleTextChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleArrestWarrantDateChange = (date: Date | null) => {
    setFormData((prevState) => ({
      ...prevState,
      arrest_warrant_date: date,
    }));
  };

  const handleArrestWarrantExpireDateChange = (date: Date | null) => {
    setFormData((prevState) => ({
      ...prevState,
      arrest_warrant_expire_date: date,
    }));
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      status: event.target.checked ? 1 : 0
    }));
  };

  const handlePrefixChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("title_id", value.value);
    }
    else {
      handleDropdownChange("title_id", '');
    }
  };

  const handleDeleteImage = useCallback(async (position: number, url: string) => {
    console.log(position);
    console.log(url);
  }, [])

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

  }, [formData.imagesData])

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return

    const newFiles = Array.from(e.target.files).filter((file) =>
      /\.(pdf|docx|doc)$/i.test(file.name)
    )

    if (newFiles.length > 0) {

    }

    if (hiddenFileInput.current) {
      hiddenFileInput.current.value = ""
    }
  }, [])

  const getFileName = (title:string, url:string):string => {
    try {
      const urlSplit = url.split('/')
      const fileNameWithExtension = urlSplit[urlSplit.length - 1] 
      const extensionSplit = fileNameWithExtension.split('.')
      const extension = extensionSplit.length > 1 ? extensionSplit.pop() : 'txt'
      return `${title}.${extension}`
    } 
    catch (error) {
      console.error("Error extracting file name:", error)
      return `${title}.txt`
    }
  }

  const handleDeleteFile = useCallback(async(index: number, url: string) => {
    console.log(index);
    console.log(url);
  }, [])

  return (
    <Dialog id='manage-special-splte' open={open} maxWidth="xl" fullWidth>
      <DialogTitle className='bg-black'>
        {/* Header */}
        <Typography variant="h5" color="white" className="font-bold">จัดการบุคคลต้องสงสัย</Typography>
      </DialogTitle>
      <DialogContent className='bg-black'>
        <form className='border border-[#2B9BED]'>
          <div className='grid grid-cols-[auto_25%] py-1'>
            {/* Column 1 */}
            <div className='grid grid-cols-3 gap-x-5 gap-y-3 px-4 py-2 border-r border-[#999999]'>
              <AutoComplete 
                id="prefix-select"
                sx={{ marginTop: "5px"}}
                value={formData.title_id}
                onChange={handlePrefixChange}
                options={prefixOptions}
                label="คำนำหน้า"
                placeholder="กรุณาระบุคำนำหน้า"
                labelFontSize="15px"
              />
              
              <TextBox
                sx={{ marginTop: "5px", fontSize: "15px" }}
                id="name"
                label="ชื่อ"
                value={formData.firstname}
                onChange={(event) =>
                  handleTextChange("firstname", event.target.value)
                }
              />

              <TextBox
                sx={{ marginTop: "5px", fontSize: "15px" }}
                id="surname"
                label="นามสกุล"
                value={formData.lastname}
                onChange={(event) =>
                  handleTextChange("lastname", event.target.value)
                }
              />

              <TextBox
                sx={{ marginTop: "5px", fontSize: "15px" }}
                id="id-card-number"
                label="หมายเลขบัตรประชาชน"
                value={formData.idcard_number}
                onChange={(event) =>
                  handleTextChange("idcard_number", event.target.value)
                }
              />

              <div className='col-span-2'>
                <TextBox
                  sx={{ marginTop: "5px", fontSize: "15px" }}
                  id="address"
                  label="ที่อยู่"
                  value={formData.address}
                  onChange={(event) =>
                    handleTextChange("address", event.target.value)
                  }
                />
              </div>

              <AutoComplete 
                id="provice-select"
                sx={{ marginTop: "5px"}}
                value={formData.province_id}
                onChange={handleProvinceChange}
                options={provinceOptions}
                label="จังหวัด"
                labelFontSize="15px"
                placeholder="กรุณาเลือกจังหวัด"
              />

              <AutoComplete 
                id="district-select"
                sx={{ marginTop: "5px"}}
                value={formData.district_id}
                onChange={handleDistrictChange}
                options={districtOptions}
                label="อำเภอ"
                labelFontSize="15px"
                placeholder="กรุณาเลือกอำเภอ"
              />

              <AutoComplete 
                id="subdistrict-select"
                sx={{ marginTop: "5px"}}
                value={formData.subdistrict_id}
                onChange={handleSubDistrictChange}
                options={subDistrictOptions}
                label="ตำบล"
                labelFontSize="15px"
                placeholder="กรุณาเลือกตำบล"
              />

              <TextBox
                sx={{ marginTop: "5px", fontSize: "15px" }}
                id="zipcode"
                label="รหัสไปรษณีย์"
                value={formData.zipcode}
                onChange={(event) =>
                  handleTextChange("zipcode", event.target.value)
                }
              />

              <AutoComplete 
                id="person-type-select"
                sx={{ marginTop: "5px"}}
                value={formData.person_class_id}
                onChange={handlePersonTypesChange}
                options={personTypesOptions}
                label="ประเภทบุคคล"
                placeholder="กรุณาระบุประเภทบุคคล"
                labelFontSize="15px"
              />

              <div className='col-start-1'>
                <TextBox
                  sx={{ marginTop: "5px", fontSize: "15px" }}
                  id="case-number"
                  label="หมายเลขคดี"
                  value={formData.case_number}
                  onChange={(event) =>
                    handleTextChange("case_number", event.target.value)
                  }
                />
              </div>

              <div>
                <Typography sx={{ fontSize: "15px"}} variant='subtitle1' color='white'>
                  วันที่ออกหมายจับ
                </Typography>
                <DatePickerBuddhist
                  value={formData.arrest_warrant_date}
                  sx={{
                    marginTop: "8px",
                    "& .MuiOutlinedInput-input": {
                      fontSize: 15
                    }
                  }}
                  className="w-full"
                  id="arrest-warrant-date"
                  onChange={(value) => handleArrestWarrantDateChange(value)}
                  error={!!errors.arrest_warrant_date}
                  register={register("arrest_warrant_date", { 
                    required: true,
                  })}
                >
                </DatePickerBuddhist>
              </div>

              <div>
                <Typography sx={{ fontSize: "15px"}} variant='subtitle1' color='white'>
                  วันที่สิ้นสุดออกหมายจับ
                </Typography>
                <DatePickerBuddhist
                  value={formData.arrest_warrant_expire_date}
                  sx={{
                    marginTop: "8px",
                    "& .MuiOutlinedInput-input": {
                      fontSize: 15
                    }
                  }}
                  className="w-full"
                  id="arrest-warrant-expire-date"
                  onChange={(value) => handleArrestWarrantExpireDateChange(value)}
                  error={!!errors.arrest_warrant_expire_date}
                  register={register("arrest_warrant_expire_date", { 
                    required: true,
                  })}
                >
                </DatePickerBuddhist>
              </div>

              <div className='col-span-3'>
                <TextBox
                  sx={{ marginTop: "5px", fontSize: "15px" }}
                  id="behavior"
                  label="พฤติการ"
                  value={formData.behavior}
                  onChange={(event) =>
                    handleTextChange("behavior", event.target.value)
                  }
                  isMultiline={true}
                  rows={4}
                />
              </div>

              <TextBox
                sx={{ marginTop: "5px", fontSize: "15px" }}
                id="case-owner-name"
                label="เจ้าของข้อมูล"
                value={formData.case_owner_name}
                onChange={(event) =>
                  handleTextChange("case_owner_name", event.target.value)
                }
              />

              <TextBox
                sx={{ marginTop: "5px", fontSize: "15px" }}
                id="case-owner-agency"
                label="หน่วยงาน"
                value={formData.case_owner_agency}
                onChange={(event) =>
                  handleTextChange("case_owner_agency", event.target.value)
                }
              />

              <TextBox
                sx={{ marginTop: "5px", fontSize: "15px" }}
                id="case-owner-phone"
                label="เบอร์ติดต่อ"
                value={formData.case_owner_phone}
                onChange={(event) =>
                  handleTextChange("case_owner_phone", event.target.value)
                }
              />

              <div className='flex items-center justify-start h-full text-white'>
                <FormGroup>
                  <FormControlLabel 
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
                        onChange={handleStatusChange}
                        checked={formData.status === 1}
                      />
                    } 
                    label="Active"
                  />
                </FormGroup>
              </div>

              <div className='col-start-3 row-start-9 flex items-center justify-end gap-3'>
                <Button
                  type='submit'
                  variant="contained"
                  className="primary-btn"
                  startIcon={ <Save />}
                  sx={{
                    width: "100px",
                    height: "40px",
                    '& .MuiSvgIcon-root': { 
                      fontSize: 20
                    } 
                  }}
                >
                  บันทึก
                </Button>

                <Button
                  variant="text"
                  className="secondary-checkpoint-search-btn"
                  sx={{
                    width: "100px",
                    height: "40px",
                    '& .MuiSvgIcon-root': { 
                      fontSize: 20
                    } 
                  }}
                  onClick={handleCancelClick}
                >
                  ยกเลิก
                </Button>
              </div>
            </div>

            {/* Column 2 */}
            <div
              id="file-import-container"
              className="h-full border-l-2 border-nobel px-[25px] py-2"
            >
              <div className="h-full text-white">
                {/* Image Upload Section */}
                <div id="image-import-part" className="flex flex-col items-center">
                  <label
                    className="relative flex items-center justify-center w-full h-[250px] mt-[5px] bg-[#48494B] cursor-pointer overflow-hidden hover:bg-gray-800"
                  >
                    { formData.imagesData && Object.keys(formData.imagesData).length > 0 ? (
                      <div className="relative w-full h-full">
                        {/* First Image (Full Size) */}
                        {formData.imagesData[0] && (
                          <div className="absolute inset-0">
                            <img
                              src={`${formData.imagesData[0].url}`}
                              alt="Uploaded 1"
                              className="object-contain w-full h-full"
                            />
                            <button
                              type="button"
                              className="absolute z-52 top-2 right-2 text-white bg-red-500 rounded-full w-[30px] h-[30px] flex items-center justify-center hover:cursor-pointer"
                              onClick={() => handleDeleteImage(0, formData.imagesData[0].url)}
                            >
                              &times;
                            </button>
                          </div>
                        )}

                        {/* Second and Third Images (Bottom Left) */}
                        <div className="absolute bottom-2 left-2 flex gap-2">
                          {[1, 2].map(
                            (position) =>
                              formData.imagesData[position] && (
                                <div
                                  key={position}
                                  className="relative w-20 h-[60px] border border-white bg-tuna"
                                >
                                  <img
                                    src={`${formData.imagesData[position].url}`}
                                    alt={`Uploaded ${position + 1}`}
                                    className="object-contain w-full h-full"
                                  />
                                  <button
                                    type="button"
                                    className="absolute z-52 top-[-5px] right-[-5px] text-white bg-red-500 rounded-full w-5 h-5 flex items-center justify-center hover:cursor-pointer"
                                    onClick={() => handleDeleteImage(position, formData.imagesData[position].url)}
                                  >
                                    &times;
                                  </button>
                                </div>
                              )
                          )}
                        </div>
                      </div>
                    ) : (
                      /* No Images */
                      <div className="flex flex-col justify-center items-center">
                        <Icon icon={Download} size={80} color="#999999" />
                        <span className="text-[18px] text-nobel mt-5">
                          อัพโหลดรูปภาพ
                        </span>
                      </div>
                    )}
                    {/* Hidden File Input */}
                    <input
                      id="image-upload"
                      type="file"
                      name="images"
                      accept="image/*"
                      multiple
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>

                {/* File Upload Section */}
                <div
                  id="file-import-part"
                  className="flex justify-end mt-[25px] space-x-2"
                >
                  <Button
                    type='submit'
                    variant="contained"
                    className="primary-btn"
                    startIcon={<Upload size={20} />}
                    sx={{
                      width: "130px",
                      textTransform: "capitalize",
                    }}
                  >
                    Upload File
                  </Button>
                </div>

                <input
                  ref={hiddenFileInput}
                  name="files"
                  type="file"
                  accept=".docx, .pdf"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />

                {/* File List Section */}
                <div id="file-list-part" className="mt-[15px]">
                  <table className="w-full">
                    <tbody>
                      {formData.filesData && formData.filesData.length > 0 ? (
                        formData.filesData.map((file, index) => (
                          <tr
                            key={`${file.title}-${index}`}
                            className={`h-10 ${
                              index % 2 === 0 ? "bg-swamp" : "bg-celtic"
                            } ${
                              index === formData.filesData.length - 1
                                ? "border-b border-white"
                                : "border-b border-dashed border-gray-300"
                            }`}
                          >
                            <td className="font-medium text-center">
                              {getFileName(file.title, file.url)}
                            </td>
                            <td className="font-medium text-center">
                              {dayjs(new Date(file.createdAt)).format('DD/MM/YYYY (hh:mm)')}
                            </td>
                            <td className="w-[30px]">
                              <button
                                type="button"
                                onClick={() => handleDeleteFile(index, file.url)}
                                className="hover:opacity-80 transition-opacity hover:cursor-pointer"
                              >
                                <Icon icon={Trash2} size={20} color="white" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr className="font-medium h-10 bg-swamp border-b border-white">
                          <td className="text-start pl-2.5">ไม่มีข้อมูล</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ManageSuspectPerson;