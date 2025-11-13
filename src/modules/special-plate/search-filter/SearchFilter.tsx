import React, { useState, useEffect, useRef } from 'react'
import { 
  Button,
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";

// Components
import TextBox from '../../../components/text-box/TextBox';
import AutoComplete from '../../../components/auto-complete/AutoComplete';

// Icons
import CarSearchIcon from "../../../assets/icons/search-car.png";
import { Search } from 'lucide-react';

// i18n
import { useTranslation } from 'react-i18next';

export interface FormData {
  plate_group: string
  plate_number: string
  region_code: string
  plate_type: number
  status: number
};

interface SearchFilterProps {
  onSearch: (formData: FormData) => void
}

const SearchFilter: React.FC<SearchFilterProps> = ({onSearch}) => {
  // i18n
  const { t, i18n } = useTranslation();

  // Options
  const [provinceOptions, setProvinceOptions] = useState<{ label: string ,value: string }[]>([]);
  const [plateTypesOptions, setPlateTypesOptions] = useState<{ label: string ,value: number }[]>([]);
  const [statusOptions, setStatusOptions] = useState<{ label: string ,value: number }[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    plate_group: "",
    plate_number: "",
    region_code: "",
    plate_type: 0,
    status: 2,
  });

  const lastSearchData = useRef<FormData | null>(null);

  const sliceDropdown = useSelector(
    (state: RootState) => state.dropdownData
  );

  useEffect(() => {
    if (sliceDropdown.regions && sliceDropdown.regions.data) {
      const options = sliceDropdown.regions.data.map((row) => ({
        label: i18n.language === "th" ? row.name_th : row.name_en,
        value: row.region_code,
      }));
      setProvinceOptions(options);
    }
  }, [sliceDropdown.provinces, i18n.language]);

  useEffect(() => {
    if (sliceDropdown.plateTypes && sliceDropdown.plateTypes.data) {
      const options = sliceDropdown.plateTypes.data.map((row) => ({
        label: row.title_en,
        value: row.id,
      }));
      setPlateTypesOptions(options);
    }
  }, [sliceDropdown.plateTypes]);

  useEffect(() => {
    if (sliceDropdown.status && sliceDropdown.status.data) {
      const options = sliceDropdown.status.data.map((row) => ({
        label: row.status,
        value: row.id,
      }));
      setStatusOptions([{label: t('dropdown.all-status'), value: 2}, ...options]);
    }
  }, [sliceDropdown.status, i18n.language]);

  const handleDropdownChange = (key: keyof typeof formData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleProvinceChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("region_code", value.value);
    }
    else {
      handleDropdownChange("region_code", '');
    }
  };

  const handlePlateTypesChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("plate_type", value.value);
    }
    else {
      handleDropdownChange("plate_type", 0);
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
      handleDropdownChange("status", 2);
    }
  };

  const handleTextChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleCancelClick = () => {
    resetData();
  }

  const resetData = () => {
    setFormData({
      plate_group: "",
      plate_number: "",
      region_code: "",
      plate_type: 0,
      status: 2,
    })
  }

  const handleSearch = () => {
    if (JSON.stringify(formData) !== JSON.stringify(lastSearchData.current)) {
      onSearch(formData);
      lastSearchData.current = formData;
    }
  }

  return (
    <div id='search-filter' className='h-screen w-[270px] pt-[20px]'>
      <div 
        className='h-[91%] bg-[#2B9BED] p-[1px]'
        style={{
          clipPath: 'polygon(0 0, 164px 0, 172px 24px, 100% 24px, 100% 100%, 0% 100%, 0 0)',
        }}
      >
        <div 
          className='flex flex-col h-full bg-black'
          style={{
            clipPath: 'polygon(0 0, 162px 0, 170px 24px, 100% 24px, 100% 100%, 0% 100%, 0 0)',
          }}
        >
          <div className='flex space-x-2 text-white px-2 pt-1'>
            <img src={CarSearchIcon} alt="Car Search Icon" className='w-[20px] h-[20px]' />
            <label>{t('search-filter.search-condition')}</label>
          </div>

          <div className='flex flex-col p-4 space-y-2 overflow-y-auto'>
            <TextBox
              sx={{ marginTop: "10px", fontSize: "15px" }}
              id="plate-group"
              label={t('component.plate-group')}
              placeholder={t('placeholder.plate-group')}
              value={formData.plate_group}
              onChange={(event) =>
                handleTextChange("plate_group", event.target.value)
              }
            />

            <TextBox
              sx={{ marginTop: "10px", fontSize: "15px" }}
              id="plate-number"
              label={t('component.plate-number')}
              placeholder={t('placeholder.plate-number')}
              value={formData.plate_number}
              onChange={(event) =>
                handleTextChange("plate_number", event.target.value)
              }
            />

            <AutoComplete 
              id="provice-select"
              sx={{ marginTop: "10px"}}
              value={formData.region_code}
              onChange={handleProvinceChange}
              options={provinceOptions}
              label={t('component.province-category')}
              placeholder={t('placeholder.province-category')}
              labelFontSize="15px"
            />

            <AutoComplete 
              id="plate-type-select"
              sx={{ marginTop: "10px"}}
              value={formData.plate_type}
              onChange={handlePlateTypesChange}
              options={plateTypesOptions}
              label={t('component.plate-type-group')}
              placeholder={t('placeholder.plate-type-group')}
              labelFontSize="15px"
            />

            <AutoComplete 
              id="plate-type-select"
              sx={{ marginTop: "10px"}}
              value={formData.status}
              onChange={handleStatusChange}
              options={statusOptions}
              label={t('component.status-data')}
              placeholder={t('placeholder.status-data')}
              labelFontSize="15px"
            />

            <div className='flex items-center justify-center gap-2 mt-5'>
              <Button
                variant="contained"
                className="primary-btn"
                startIcon={<Search />}
                sx={{ 
                  width: t('button.search-width'), 
                  height: "40px",
                  textTransform: "capitalize",
                }}
                onClick={handleSearch}
              >
                {t('button.search')}
              </Button>

              <Button
                variant="outlined"
                className="secondary-btn-without-border"
                sx={{ 
                  width: t('button.clear-width'), 
                  height: "40px",
                  textTransform: "capitalize",
                }}
                onClick={handleCancelClick}
              >
                {t('button.clear-data')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default SearchFilter;