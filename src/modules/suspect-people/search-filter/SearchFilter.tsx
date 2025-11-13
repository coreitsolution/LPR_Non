import React, { useState, useEffect } from 'react'
import { 
  Button,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";

// Components
import TextBox from '../../../components/text-box/TextBox';
import AutoComplete from '../../../components/auto-complete/AutoComplete';

// Icons
import PeopleSearchIcon from "../../../assets/icons/warning-person.png";
import { Search } from 'lucide-react';

interface FormData {
  prefix_id: number
  name: string
  surname: string
  province_id: number
  person_type: number
  agency_name: string
  status: number
};

interface SearchFilterProps {

}

const SearchFilter: React.FC<SearchFilterProps> = ({}) => {

  // Options
  const [prefixOptions, setPrefixOptions] = useState<{ label: string ,value: number }[]>([]);
  const [personTypesOptions, setPersonTypesOptions] = useState<{ label: string ,value: number }[]>([]);
  const [statusOptions, setStatusOptions] = useState<{ label: string ,value: number }[]>([]);

  const [formData, setFormData] = useState<FormData>({
    prefix_id: 0,
    name: "",
    surname: "",
    province_id: 0,
    person_type: 0,
    agency_name: "",
    status: 2,
  });

  const sliceDropdown = useSelector(
    (state: RootState) => state.dropdownData
  );

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
    if (sliceDropdown.status && sliceDropdown.status.data) {
      const options = sliceDropdown.status.data.map((row) => ({
        label: row.status,
        value: row.id,
      }));
      setStatusOptions([{label: "ทุกสถานะ", value: 2}, ...options]);
    }
  }, [sliceDropdown.status]);

  const handleDropdownChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handlePrefixChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("prefix_id", value.value);
    }
    else {
      handleDropdownChange("prefix_id", '');
    }
  };

  const handlePersonTypesChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("person_type", value.value);
    }
    else {
      handleDropdownChange("person_type", '');
    }
  };

  const handleStatusChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("status", value.value);
    }
    else {
      handleDropdownChange("status", '');
    }
  };

  const handleTextChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div id='search-filter' className='h-screen w-[270px] pt-[20px]'>
      <div 
        className='h-[91%] bg-[#2B9BED] p-[1px]'
        style={{
          clipPath: 'polygon(0 0, 150px 0, 160px 24px, 100% 24px, 100% 100%, 0% 100%, 0 0)',
        }}
      >
        <div 
          className='flex flex-col h-full bg-black'
          style={{
            clipPath: 'polygon(0 0, 148px 0, 158px 24px, 100% 24px, 100% 100%, 0% 100%, 0 0)',
          }}
        >
          <div className='flex space-x-2 text-white px-2 pt-1'>
            <img src={PeopleSearchIcon} alt="Car Search Icon" className='w-[20px] h-[20px]' />
            <label>เงื่อนไขการค้นหา</label>
          </div>

          <div className='flex flex-col p-4 space-y-2 overflow-y-auto'>
            <AutoComplete 
              id="prefix-select"
              sx={{ marginTop: "10px"}}
              value={formData.prefix_id}
              onChange={handlePrefixChange}
              options={prefixOptions}
              label="คำนำหน้า"
              placeholder="กรุณาระบุคำนำหน้า"
              labelFontSize="15px"
            />
            
            <TextBox
              sx={{ marginTop: "10px", fontSize: "15px" }}
              id="name"
              label="ชื่อ"
              placeholder="กรุณาใส่ชื่อ"
              value={formData.name}
              onChange={(event) =>
                handleTextChange("name", event.target.value)
              }
            />

            <TextBox
              sx={{ marginTop: "10px", fontSize: "15px" }}
              id="surname"
              label="นามสกุล"
              placeholder="กรุณาใส่นามสกุล"
              value={formData.surname}
              onChange={(event) =>
                handleTextChange("surname", event.target.value)
              }
            />

            <AutoComplete 
              id="person-type-select"
              sx={{ marginTop: "10px"}}
              value={formData.person_type}
              onChange={handlePersonTypesChange}
              options={personTypesOptions}
              label="ประเภทบุคคล"
              placeholder="กรุณาเลือกประเภทบุคคล"
              labelFontSize="15px"
            />

            <TextBox
              sx={{ marginTop: "10px", fontSize: "15px" }}
              id="agency-name"
              label="หน่วยงานเจ้าของข้อมูล"
              placeholder="กรุณาใส่หน่วยงานเจ้าของข้อมูล"
              value={formData.agency_name}
              onChange={(event) =>
                handleTextChange("agency_name", event.target.value)
              }
            />

            <AutoComplete 
              id="plate-type-select"
              sx={{ marginTop: "10px"}}
              value={formData.status}
              onChange={handleStatusChange}
              options={statusOptions}
              label="สถานะข้อมูล"
              placeholder="กรุณาเลือกสถานะข้อมูล"
              labelFontSize="15px"
            />

            <div className='flex items-center justify-center gap-2 mt-5'>
              <Button
                variant="contained"
                className="primary-btn"
                startIcon={<Search />}
                sx={{ width: "100px", height: "40px" }}
              >
                ค้นหา
              </Button>

              <Button
                variant="outlined"
                className="secondary-btn-without-border"
                sx={{ width: "100px", height: "40px" }}
              >
                ล้างข้อมูล
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default SearchFilter;