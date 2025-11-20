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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
} from "@mui/material";
// import * as XLSX from "xlsx";
// import JSZip from "jszip";
// import { saveAs } from "file-saver";
import { useSelector } from "react-redux"
import { RootState } from "../../app/store"
import { Map as LeafletMap } from 'leaflet';

// Context
import { useHamburger } from "../../context/HamburgerContext";

// Components
import AutoComplete from '../../components/auto-complete/AutoComplete';
import PaginationComponent from '../../components/pagination/Pagination';
import BaseMap from '../../components/base-map/BaseMap';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import { KeyboardArrowUp } from '@mui/icons-material';
import { Dot } from "lucide-react";

// Constant
import { USAGE_STATISTICS_GRAPH_ROW_PER_PAGES } from "../../constants/dropdown";

// Hooks
import { useMapSearch } from "../../hooks/useOpenStreetMapSearch";

interface FormData {
  area_id: number
  province_id: number
  station_id: number
  time_range_id: number
};

interface CameraInstallationPointsProps {

}

const CameraInstallationPoints: React.FC<CameraInstallationPointsProps> = ({}) => {
  const { isOpen } = useHamburger();

  // Options
  const [areasOptions, setAreasOptions] = useState<{ label: string ,value: number }[]>([]);
  const [provinceOptions] = useState<{ label: string ,value: number }[]>([]);
  const [stationsOptions] = useState<{ label: string ,value: number }[]>([]);
  const [timeRangeOptions] = useState<{ label: string ,value: number }[]>([]);

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
  })

  const cameraInstallationPoints = [
    {
      id: 1,
      province: "ฉะเชิงเทรา",
      lat: 13.69347726664667,
      lon: 101.37659103187812,
      count: 9,
      checkpoints: [
        { 
          id: 1, 
          checkpointName: "จุดตรวจ บ้านคลองตะเคียน", 
          count: 1, 
          cameraList: [
            { id: 1, name: "2_ฉช_คลองตะเคียน_ออก", lat: 13.7563, lon: 100.5018 }
          ] 
        },
        { 
          id: 2, 
          checkpointName: "จุดตรวจ นาน้อย", 
          count: 2, 
          cameraList: [
            { id: 1, name: "2_ฉช_นาน้อย_เข้า", lat: 13.7563, lon: 100.5018 },
            { id: 1, name: "2_ฉช_นาน้อย_ออก", lat: 13.7563, lon: 100.5018 }
          ] 
        }
      ]
    },
    {
      id: 2,
      province: "กระบี่",
      lat: 8.26201802089156, 
      lon: 98.98165009717476,
      count: 15,
      checkpoints: [
        { 
          id: 1, 
          checkpointName: "จุดตรวจ บ้านคลองตะเคียน", 
          count: 1, 
          cameraList: [
            { id: 1, name: "2_กบ_คลองตะเคียน_ออก", lat: 13.7563, lon: 100.5018 }
          ] 
        },
      ]
    },
    {
      id: 3,
      province: "กรุงเทพมหานคร",
      lat: 13.723069985454218, 
      lon: 100.51628436561624,
      count: 89,
      checkpoints: [
        { 
          id: 1, 
          checkpointName: "จุดตรวจ บ้านคลองตะเคียน", 
          count: 1, 
          cameraList: [
            { id: 1, name: "2_กทม_คลองตะเคียน_ออก", lat: 13.7563, lon: 100.5018 }
          ] 
        },
      ]
    }
  ];

  const {
    showCountInMap,
  } = useMapSearch(map)

  const sliceDropdown = useSelector(
    (state: RootState) => state.dropdownData
  )

  useEffect(() => {
    if (map) {
      const cameraList = cameraInstallationPoints.map((camera) => ({
        lat: camera.lat.toString(),
        lon: camera.lon.toString(),
        count: camera.count,
      }))
      showCountInMap(cameraList, 80);
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
    }
  };

  const handleStationChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault()
    if (value) {
      handleDropdownChange("station_id", value.value)
    }
    else {
      handleDropdownChange("station_id", '')
    }
  }

  const handleTimeRangeChange = (
    event: React.SyntheticEvent,
    value: { value: any ,label: string } | null
  ) => {
    event.preventDefault();
    if (value) {
      handleDropdownChange("time_range_id", value.value);
    }
    else {
      handleDropdownChange("time_range_id", '');
    }
  };

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
  

  return (
    <div id='usage-statistics-graph' className={`main-content ${isOpen ? "pl-[130px]" : "pl-2.5"} pr-2.5 transition-all duration-500 overflow-y-auto scrollbar-hide`}>
      <div className='flex flex-col'>
        {/* Header */}
        <Typography variant="h5" color="white" className="font-bold">ค้นหาจุดติดตั้งกล้อง</Typography>

        {/* Filter Part */}
        <div className='grid grid-cols-4 gap-x-[50px] gap-y-3 pt-5'>
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
            id="provice-select"
            sx={{ marginTop: "10px"}}
            value={formData.province_id}
            onChange={handleProvinceChange}
            options={provinceOptions}
            label="หมวดจังหวัด"
            placeholder="กรุณาเลือกจังหวัด"
            labelFontSize="15px"
          />

          <AutoComplete 
            id="station-select"
            sx={{ marginTop: "10px"}}
            value={formData.station_id}
            onChange={handleStationChange}
            options={stationsOptions}
            label="สถานี"
            placeholder="กรุณาเลือกสถานี"
            labelFontSize="15px"
          />

          <AutoComplete 
            id="time-range-select"
            sx={{ marginTop: "10px"}}
            value={formData.time_range_id}
            onChange={handleTimeRangeChange}
            options={timeRangeOptions}
            label="ช่วงเวลาการค้นหา"
            placeholder="กรุณาเลือกช่วงเวลาการค้นหา"
            labelFontSize="15px"
          />

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
        <div className='grid grid-cols-2 gap-2 mt-10'>          
          {/* Total Count */}
          <div className='col-span-2 border border-[#797979] rounded-[5px] py-2'>
            <div className='grid grid-cols-[auto_40%_auto_auto_auto]'>
              <div className='flex flex-col w-full border-r border-[#FFFFFF] px-4'>
                <label className='text-[#FDCC0A] text-[16px]'>โครงการ</label>
                <p className='text-[53px]'>12</p>
              </div>
              <div className='flex flex-col w-full border-r border-[#FFFFFF] px-4'>
                <label className='text-[#FDCC0A] text-[16px]'>พื้นที่/ภาค</label>
                <p className='text-[53px]'>1,2,3,4,5,6,7,8,9,0</p>
              </div>
              <div className='flex flex-col w-full border-r border-[#FFFFFF] px-4'>
                <label className='text-[#FDCC0A] text-[16px]'>จังหวัด</label>
                <p className='text-[53px] text-center'>75</p>
              </div>
              <div className='flex flex-col w-full border-r border-[#FFFFFF] px-4'>
                <label className='text-[#FDCC0A] text-[16px]'>จุดขาเข้า</label>
                <p className='text-[53px] text-center'>770</p>
              </div>
              <div className='flex flex-col w-full px-4'>
                <label className='text-[#FDCC0A] text-[16px]'>จุดขาออก</label>
                <p className='text-[53px] text-center'>550</p>
              </div>
            </div>
          </div>

          {/* Map Part */}
          <div className='flex flex-col border border-[#797979] rounded-[5px] px-2 py-3 row-span-6'>
            <label className='text-[#FDCC0A] text-[16px]'>จำนวนผู้โดยตัดรหัส</label>
            <div className='relative h-full w-full mt-2'>
              <BaseMap 
                onMapLoad={handleMapLoad}
              />
            </div>
          </div>

          {/* Camera Installation Table */}
          <div className='row-span-6 flex flex-col border border-[#797979] rounded-[5px] px-2 pt-3 pb-4'>
            <label className='text-[#FDCC0A] text-[16px]'>จำนวนจุดติดตั้ง</label>
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
                      <TableCell align="center" sx={{ color: "#FFFFFF", width: "70%", fontSize: "16px" }}>จังหวัด</TableCell>
                      <TableCell align="center" sx={{ color: "#FFFFFF", fontSize: "16px" }}>จำนวน</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cameraInstallationPoints.map((province) => (
                      <React.Fragment key={province.id}>
                        <TableRow
                          sx={{
                            '& td, & th': {
                              borderBottom: 'none',
                            },
                          }}
                        >
                          <TableCell colSpan={2} sx={{ p: 0 }}>
                            <Accordion
                              disableGutters
                              sx={{
                                boxShadow: "none",
                                "&.Mui-expanded": { margin: 0 },
                              }}
                            >
                              <AccordionSummary
                                expandIcon={<KeyboardArrowUp sx={{ fontSize: 28, color: "white" }} />}
                                sx={{
                                  background: "linear-gradient(90deg, rgba(72,73,75,1) 0%, rgba(57,59,58,1) 70%)",
                                  borderBottom: '1px dashed #ADADAD',
                                  flexDirection: "row-reverse",
                                  px: 2,
                                }}
                              >
                                <Box sx={{ display: "flex", width: "100%", alignItems: "center" }}>
                                  <Typography sx={{ width: "70%", color: "#FFFFFF" }}>
                                    {province.province}
                                  </Typography>
                                  <Typography sx={{ width: "30%", textAlign: "center", color: "#FFFFFF" }}>
                                    {province.count}
                                  </Typography>
                                </Box>
                              </AccordionSummary>

                              <AccordionDetails 
                                sx={{ 
                                  backgroundColor: "#2C2C2C", 
                                  padding: "0px",
                                }}
                              >
                                {province.checkpoints.map((checkpoint) => (
                                  <Accordion
                                    key={checkpoint.id}
                                    disableGutters
                                    sx={{
                                      boxShadow: "none",
                                      "&.Mui-expanded": { margin: 0 },
                                    }}
                                  >
                                    <AccordionSummary
                                      expandIcon={<KeyboardArrowUp sx={{ fontSize: 24, color: "white" }} />}
                                      sx={{
                                        background: "linear-gradient(90deg, rgba(72,73,75,1) 0%, rgba(57,59,58,1) 70%)",
                                        borderBottom: '1px dashed #ADADAD',
                                        flexDirection: "row-reverse",
                                        pl: 4,
                                      }}
                                    >
                                      <Box sx={{ display: "flex", width: "100%" }}>
                                        <Typography sx={{ width: "70%", backgroundColor: "", color: "#FFFFFF" }}>
                                          {checkpoint.checkpointName}
                                        </Typography>
                                        <Typography sx={{ width: "30%", textAlign: "center", color: "#FFFFFF" }}>
                                          {checkpoint.count}
                                        </Typography>
                                      </Box>
                                    </AccordionSummary>

                                    <AccordionDetails sx={{ background: "linear-gradient(90deg, rgba(72,73,75,1) 0%, rgba(57,59,58,1) 70%)", padding: "0px" }}>
                                      {checkpoint.cameraList.map((camera, index) => (
                                        <Box key={index} sx={{ display: "flex", alignItems: "center", color: "#FFFFFF", pl: 6, borderBottom: '1px dashed #ADADAD', height: "49px" }}>
                                          <Dot size={30} style={{ marginRight: 4 }} />
                                          <Typography sx={{ fontSize: 16 }}>
                                            {camera.name} {camera.lat},{camera.lon}
                                          </Typography>
                                        </Box>
                                      ))}
                                    </AccordionDetails>
                                  </Accordion>
                                ))}
                              </AccordionDetails>
                            </Accordion>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <div className={`${cameraInstallationPoints.length > 0 ? "flex" : "hidden"} items-center justify-between bg-(--background-color) pt-3 pl-1`}>
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

export default CameraInstallationPoints;