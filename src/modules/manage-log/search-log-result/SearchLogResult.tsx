import React, { useState } from 'react'
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Button,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  IconButton,
  TableRow,
} from '@mui/material';

// Icons
import { CircleX, Printer } from "lucide-react";
import PinMap from "../../../assets/icons/pin_google-maps.png";

// Modules
import Location from '../../location/Location';

interface SearchLogResultProps {
  open: boolean;
  onClose: () => void;
}

const SearchLogResult: React.FC<SearchLogResultProps> = ({open, onClose}) => {

  // Data
  const [accessLocationVisible, setAccessLocationVisible] = useState(false);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const machineLocationClick = (lat: string, lng: string) => {
    setLat(lat);
    setLng(lng);
    setAccessLocationVisible(true);
  }

  return (
    <Dialog id='search-log-result' open={open} maxWidth="xl" fullWidth>
      <DialogTitle className='flex items-center justify-between bg-black'>
        <div className='flex space-x-1 items-center justify-start'>
          <img src="/svg/sm-logo.svg" alt="Logo" className="w-[60px] h-10 mb-[5px]" />
          <Typography variant="h5" color="white" className="font-bold">License Plate Recognition</Typography>
        </div>
        <button
          onClick={onClose}
        >
          <CircleX size={20} color="white" />
        </button>
      </DialogTitle>
      <DialogContent className='bg-black'>
        <div className='flex flex-col w-full'>
          <div className='bg-[#393B3A] w-full p-1 text-center'>
            <label className='text-white text-[16px]'>รายงานผลการค้นหา</label>
          </div>
          <div className='grid grid-cols-[40%_auto] border border-[#384043] text-white'>
            {/* Column 1 */}
            <div className='p-2'>
              <div className='w-full text-center border border-[#384043]'>
                {/* User Name */}
                <div className='w-full py-2 border border-[#384043]'>
                  <label>ส.ต.อ. อนุชา เวียงทองทรัพย์</label>
                </div>
                {/* User Image */}
                <div className='flex py-6 items-center justify-center'>
                  <img src="/images/user-mgmt.png" alt="User Image" className='h-[150px] w-[130px]' />
                </div>
                {/* User Information */}
                <div>
                  <TableContainer>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ width: "40%", backgroundColor: "#393B3A", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>เลขบัตรประชาชน</TableCell>
                          <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>3449899809890</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ width: "40%", backgroundColor: "#393B3A", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>ตำแหน่ง</TableCell>
                          <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>หัวหน้าหน่วยจราจร</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ width: "40%", backgroundColor: "#393B3A", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>กองกำกับการ</TableCell>
                          <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>-</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ width: "40%", backgroundColor: "#393B3A", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>กองบัญชาการ</TableCell>
                          <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>-</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ width: "40%", backgroundColor: "#393B3A", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>เบอร์ติดต่อ</TableCell>
                          <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>สภ พระอินทร์ราชา จว.พระนครศรีอยุธยา</TableCell>
                        </TableRow>
                        <TableRow sx={{ height: "150px" }}>
                          <TableCell sx={{ width: "40%", verticalAlign: "top", backgroundColor: "#393B3A", color: "#FFFFFF", borderBottom: "0px" }}>อีเมล์</TableCell>
                          <TableCell sx={{ backgroundColor: "#48494B", verticalAlign: "top", color: "#FFFFFF", borderBottom: "0px" }}>superpolice@gamil.com</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              </div>
            </div>
            {/* Column 2 */}
            <div className='h-full p-2'>
              <TableContainer className='h-full'>
                <Table className='h-full'>
                  <TableBody className='h-full border border-[#384043]'>
                    <TableRow sx={{ height: "70px" }}>
                      <TableCell sx={{ color: "#FFFFFF", borderBottom: "1px solid #384043", padding: "2px 0px 2px 2px" }}>
                        <div className='flex flex-col px-4 justify-between space-y-3'>
                          <p className='text-[14px]'>วัน/เดือน/ปี ที่ค้นหา :</p>
                          <p className='ml-[100px] text-[16px]'>10/10/2024 (10:00:00) - 12/10/2024 (10:00:00)</p>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: "#FFFFFF", borderBottom: "1px solid #384043", padding: "10px 0px 2px 2px", verticalAlign: "top" }}>
                        <div className='flex flex-col px-4 space-y-3'>
                          <p className='text-[14px]'>อุปกรณ์ที่ใช้/ OS ของอุปกรณ์ :</p>
                          <p className='ml-[100px] text-[16px]'>
                            Mozilla/ 5.0 (iPhone; CPU iPhone OS 16_3_1 like Mac OS X) AppleWebKit/ 605.1.15 (KHTML, like Gecko Version/ 16.3 Mobile/ 15E148 Safari/ 604.1
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ height: "50px" }}>
                      <TableCell sx={{ color: "#FFFFFF", borderBottom: "1px solid #384043", padding: "10px 0px 2px 2px" }}>
                        <div className='flex flex-col px-4 justify-between space-y-3'>
                          <p className='text-[14px]'>IP Network :</p>
                          <p className='py-2 ml-[100px] text-[16px]'>182.232.56.173</p>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ height: "50px" }}>
                      <TableCell sx={{ color: "#FFFFFF", borderBottom: "1px solid #384043", display: "flex", justifyContent: "space-between", padding: "10px 16px 2px 16px" }}>
                        <div className='flex flex-col justify-between '>
                          <p className='text-[14px]'>พิกัดของเครื่อง :</p>
                          <p className='py-2 ml-[100px] text-[16px]'>15.1601302,100.1521663</p>
                        </div>
                        <div className='flex items-center'>
                          <IconButton 
                            className="pin-map-btn"
                            sx={{
                              borderRadius: "4px !important",
                            }}
                            onClick={() => machineLocationClick("15.1601302", "100.1521663")}
                          >
                            <img src={PinMap} alt='Google Pin' className='w-[25px] h-[25px]' />
                          </IconButton>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ height: "50px" }}>
                      <TableCell sx={{ color: "#FFFFFF", borderBottom: "1px solid #384043", padding: "10px 0px 2px 2px" }}>
                        <div className='flex flex-col px-4 justify-between space-y-3'>
                          <p className='text-[14px]'>Action :</p>
                          <p className='py-2 ml-[100px] text-[16px]'>ค้นหา</p>
                        </div>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ color: "#FFFFFF", borderBottom: "1px solid #384043", padding: "10px 0px 2px 2px", verticalAlign: "top" }}>
                        <div className='flex flex-col px-4 justify-between space-y-3'>
                          <p className='text-[14px]'>รายละเอียด</p>
                          <p className='py-2 ml-[100px] text-[16px]'>
                            ขต-2873 กรุงเทพมหานคร
                            จุดตรวจ : 1_ชน_ทล_สรรพยา_เข้า_1
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </div>
          <div className='flex w-full justify-end pt-4'>
            <Button
              variant="contained"
              className="tertiary-btn"
              startIcon={<Printer />}
              style={{
                fontSize: "14px",
              }}
              sx={{
                width: "140px",
                height: "40px",
                '& .MuiSvgIcon-root': { 
                  fontSize: 20
                },
              }}
            >
              พิมพ์รายงาน
            </Button>
          </div>
        </div>
        {/* Modules */}
        <Location 
          open={accessLocationVisible}
          onClose={() => setAccessLocationVisible(false)}
          lat={lat}
          lng={lng}
          title="พิกัดของเครื่อง"
        />
      </DialogContent>
    </Dialog>
  )
}

export default SearchLogResult;