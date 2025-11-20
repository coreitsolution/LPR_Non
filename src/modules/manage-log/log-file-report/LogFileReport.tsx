import React from 'react'
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
  TableRow,
} from '@mui/material';

// Icons
import { CircleX, Printer } from "lucide-react";

interface LogFileReportProps {
  open: boolean;
  onClose: () => void;
}

const LogFileReport: React.FC<LogFileReportProps> = ({open, onClose}) => {
  return (
    <Dialog id='log-file-report' open={open} maxWidth="xl" fullWidth>
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
            <label className='text-white text-[16px]'>รายงานข้อมูล Log File</label>
          </div>
          <div className='p-4 border-x border-b border-[#384043]'>
            {/* First Row */}
            <div className='grid grid-cols-2 border border-[#384043] text-white'>
              <div className='flex flex-col h-[70px] py-2 px-4 justify-between'>
                <p className='text-[14px]'>วันเดือนปีที่ค้นหา :</p>
                <p className='ml-[100px] text-[16px]'>10/10/2024 (10:00:00) - 12/10/2024 (10:00:00)</p>
              </div>
              <div className='flex flex-col h-[70px] py-2 px-4 justify-between border-l-[1px] border-[#384043]'>
                <p className='text-[14px]'>รหัสผู้ใช้งาน :</p>
                <p className='ml-[100px] text-[16px]'>1659900429255</p>
              </div>
            </div>

            {/* Second Row */}
            <div className='grid grid-cols-3 border border-[#384043] text-white'>
              <div className='flex flex-col h-[70px] py-2 px-4 justify-between'>
                <p className='text-[14px]'>หมวดอักษร :</p>
                <p className='ml-[100px] text-[16px]'>ขต</p>
              </div>
              <div className='flex flex-col h-[70px] py-2 px-4 justify-between border-l-[1px] border-[#384043]'>
                <p className='text-[14px]'>เลขทะเบียน :</p>
                <p className='ml-[100px] text-[16px]'>2778</p>
              </div>
              <div className='flex flex-col h-[70px] py-2 px-4 justify-between border-l-[1px] border-[#384043]'>
                <p className='text-[14px]'>จังหวัด :</p>
                <p className='ml-[100px] text-[16px]'>กรุงเทพมหานคร</p>
              </div>
            </div>

            {/* Third Row */}
            <div className='grid grid-cols-3 border border-[#384043] text-white'>
              <div className='flex flex-col h-[70px] py-2 px-4 justify-between'>
                <p className='text-[14px]'>สถานี :</p>
                <p className='ml-[100px] text-[16px]'>-</p>
              </div>
              <div className='flex flex-col h-[70px] py-2 px-4 justify-between border-l-[1px] border-[#384043]'>
                <p className='text-[14px]'>ด่านตรวจ :</p>
                <p className='ml-[100px] text-[16px]'>1_ชน_ทล_สรรพยา_เข้า_1</p>
              </div>
              <div className='flex flex-col h-[70px] py-2 px-4 justify-between border-l-[1px] border-[#384043]'>
                <p className='text-[14px]'>Action :</p>
                <p className='ml-[100px] text-[16px]'>ค้นหา</p>
              </div>
            </div>

            {/* Fourth Row */}
            <div className='grid grid-cols-2 mt-6 gap-x-4'>
              {/* First Table */}
              <div className='h-full'>
                <TableContainer className='h-full'>
                  <Table className='h-full'>
                    <TableBody className='h-full'>
                      <TableRow>
                        <TableCell sx={{ width: "30%", backgroundColor: "#393B3A", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD", padding: "0px" }} rowSpan={2}>
                          <div className='flex items-center justify-center py-2'>
                            <img src="/images/user-mgmt.png" alt="User Image" className='h-[130px] w-[120px]' />
                          </div>
                        </TableCell>
                        <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD", padding: "0px" }}>
                          <div className='flex flex-col px-4 justify-between space-y-3'>
                            <p className='text-[14px]'>User :</p>
                            <p className='ml-[60px] text-[16px]'>ส.ต.อ. อนุชา เวียงทองทรัพย์</p>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD", padding: "0px" }}>
                          <div className='flex flex-col px-4 justify-between space-y-3'>
                            <p className='text-[14px]'>เลขบัตรประจำตัวประชาชน :</p>
                            <p className='ml-[60px] text-[16px]'>3440366756177</p>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ width: "30%", backgroundColor: "#393B3A", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>ตำแหน่ง</TableCell>
                        <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>หัวหน้าหน่วยจราจร</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ width: "30%", backgroundColor: "#393B3A", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>กองกำกับการ</TableCell>
                        <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>-</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ width: "30%", backgroundColor: "#393B3A", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>กองบัญชาการ</TableCell>
                        <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>-</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ width: "30%", backgroundColor: "#393B3A", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>เบอร์ติดต่อ</TableCell>
                        <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>สภ พระอินทร์ราชา จว.พระนครศรีอยุธยา</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ width: "30%", backgroundColor: "#393B3A", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>อีเมล์</TableCell>
                        <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>superpolice@gamil.com</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>

              {/* Second Table */}
              <div className='h-full'>
                <TableContainer className='h-full'>
                  <Table className='h-full'>
                    <TableBody className='h-full'>
                      <TableRow>
                        <TableCell sx={{ width: "40%", backgroundColor: "#393B3A", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>วัน/เดือน/ปี ที่ค้นหา :</TableCell>
                        <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>10/10/2024 (10:00:00) - 12/10/2024 (10:00:00) </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ width: "40%", backgroundColor: "#393B3A", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>อุปกรณ์ที่ใช้/ OS ของอุปกรณ์ :</TableCell>
                        <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>
                          Mozilla/ 5.0 (iPhone; CPU iPhone OS 16_3_1 like Mac OS X) AppleWebKit/ 605.1.15 (KHTML, like Gecko
                          Version/ 16.3 Mobile/ 15E148 Safari/ 604.1
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ width: "40%", backgroundColor: "#393B3A", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>IP Network :</TableCell>
                        <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>182.232.56.173</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ width: "40%", backgroundColor: "#393B3A", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>พิกัดเครื่อง :</TableCell>
                        <TableCell sx={{ backgroundColor: "#48494B", color: "#FFFFFF", borderBottom: "1px dashed #ADADAD" }}>15.1601302,100.1521663</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
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
              onClick={onClose}
            >
              พิมพ์รายงาน
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default LogFileReport;