import React, {useMemo, useState, useEffect} from 'react'
import dayjs from 'dayjs'
import buddhistEra from 'dayjs/plugin/buddhistEra'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import IconButton from "@mui/material/IconButton"
import { useSelector } from "react-redux"
import { RootState } from "../../../app/store"

// Icon
import { Icon } from '../../../components/icons/Icon'
import { Trash2 } from 'lucide-react'

// Types
import {
  ImportSpecialPlates,
  ImportSpecialPlatesDetail,
  FileUpload
} from '../../../features/types';

// Config
import { getUrls } from '../../../config/runtimeConfig';

// Component
import Loading from "../../../components/loading/Loading"

// Utils
import { getFileNameWithoutExtension } from "../../../utils/commonFunction"

// i18n
import { useTranslation } from 'react-i18next';

dayjs.extend(buddhistEra)

interface ConfirmationProps {
  setFinalDataList: (data: ImportSpecialPlatesDetail[]) => void
  filesDataList: FileUpload[]
  imagesDataList: FileUpload[]
  textsDataList: ImportSpecialPlates[]
}

const Confirmation: React.FC<ConfirmationProps> = ({setFinalDataList, filesDataList, imagesDataList, textsDataList}) => {
  const { CENTER_FILE_URL } = getUrls();

  const sliceDropdown = useSelector(
    (state: RootState) => state.dropdownData
  );

  // Data
  const [confirmationData, setConfirmationData] = useState<ImportSpecialPlatesDetail[]>([]);

  // State
  const [isLoading, setIsLoading] = useState(false)

  // i18n
  const { t, i18n } = useTranslation();

  const convertedData = useMemo(() => {
    if (!textsDataList.length) return []
    
    return textsDataList.map((data) => {

      const matchedImage = imagesDataList.find((image) => 
        getFileNameWithoutExtension(image.originalName) === getFileNameWithoutExtension(data.image)
      )
      
      const matchedFile = filesDataList.find((file) => 
        getFileNameWithoutExtension(file.originalName) === getFileNameWithoutExtension(data.file)
      )

      const provinceName = data.province === "กทม" || data.province === "กทม." ? "กรุงเทพมหานคร" : data.province
      const region = sliceDropdown.regions?.data?.find((region) => i18n.language === 'th' ? region.name_th.toLowerCase() === provinceName.toLowerCase() : region.name_en.toLowerCase() === provinceName.toLowerCase())
      const plateType = sliceDropdown.plateTypes?.data?.find((type) => type.title_en.toLowerCase() === data.plate_type.toLowerCase())
      const status = sliceDropdown.status?.data?.find((status) => status.status.toLowerCase() === data.active.toLowerCase())
      
      return {
        id: data.id,
        plate_group: data.plate_group,
        plate_number: data.plate_number,
        province: i18n.language === 'th' ? region?.name_th || t('text.data-not-found') : region?.name_en || t('text.data-not-found'),
        region_code: region?.region_code || "",
        plate_type: plateType?.title_en || t('text.data-not-found'),
        plate_class_id: plateType?.id || 0,
        case_number: data.case_number,
        arrest_warrant_date: data.arrest_warrant_date,
        arrest_warrant_expire_date: data.arrest_warrant_expire_date,
        behavior: data.behavior,
        case_owner_name: data.case_owner_name,
        case_owner_agency: data.case_owner_agency,
        case_owner_phone: data.case_owner_phone,
        image: data.image,
        file: data.file,
        visible: 1,
        activeString: status?.status || t('text.data-not-found'),
        active: status?.id || 0,
        imagesUploadedData: matchedImage,
        fileUploadedData: matchedFile,
        cannotImport: !region || !plateType || !status
      }
    })
  }, [textsDataList, sliceDropdown, imagesDataList, filesDataList])
  
  useEffect(() => {
    if (JSON.stringify(confirmationData) !== JSON.stringify(convertedData)) {
      setConfirmationData(convertedData)
      setFinalDataList(convertedData)
    }
  }, [convertedData, setFinalDataList])

  useEffect(() => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }, [])

  const handleDeleteData = (indexToDelete: number) => {
    const updatedData = confirmationData.filter((_, index) => index !== indexToDelete)
    setConfirmationData(updatedData)
    setFinalDataList(updatedData)
  }

  return (
    <div id='text-upload'>
      {isLoading && <Loading />}
      <div className='flex flex-col h-full'>
        <div className="grow overflow-x-auto">
          <TableContainer component={Paper} className="mt-4 h-[60vh] w-[2500px]"
            sx={{
              backgroundColor: "#000000"
            }}
          >
            <Table stickyHeader>
              <TableHead 
                sx={{
                  "& .MuiTableCell-head": {
                    color: "white",
                    backgroundColor: "#242727"
                  },
                }}
              >
                <TableRow>
                  <TableCell>{t('table.column.no')}</TableCell>
                  <TableCell>{t('table.column.plate-group')}</TableCell>
                  <TableCell>{t('table.column.plate-number')}</TableCell>
                  <TableCell>{t('table.column.province')}</TableCell>
                  <TableCell>{t('table.column.plate-type')}</TableCell>
                  <TableCell>{t('table.column.case-number')}</TableCell>
                  <TableCell>{t('table.column.date-arrest-warrant')}</TableCell>
                  <TableCell>{t('table.column.date-expiration-arrest-warrant')}</TableCell>
                  <TableCell>{t('table.column.behavior')}</TableCell>
                  <TableCell>{t('table.column.owner-name')}</TableCell>
                  <TableCell>{t('table.column.phone')}</TableCell>
                  <TableCell>{t('table.column.vehicle-plate-image')}</TableCell>
                  <TableCell>{t('table.column.file')}</TableCell>
                  <TableCell>{t('table.column.status')}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody
                sx={{
                  "& .MuiTableCell-body": {
                    color: "white",
                  }
                }}
              >
                {
                  confirmationData.map((data, index) => {
                    const imageUrl = data.imagesUploadedData ? `${CENTER_FILE_URL}${data.imagesUploadedData.url}` : ""
                    const fileUrl = data.fileUploadedData ? data.fileUploadedData.originalName : ""

                    return (
                      <TableRow key={index} className="relative" sx={{ opacity: data.cannotImport ? 0.8 : 1 }}>
                        <TableCell sx={{ backgroundColor: "#393B3A" }}>{index + 1}</TableCell>
                        <TableCell sx={{ backgroundColor: "#48494B" }}>{data.plate_group}</TableCell>
                        <TableCell sx={{ backgroundColor: "#393B3A" }}>{data.plate_number}</TableCell>
                        <TableCell sx={{ backgroundColor: "#48494B" }}>{data.province}</TableCell>
                        <TableCell sx={{ backgroundColor: "#393B3A" }}>{data.plate_type}</TableCell>
                        <TableCell sx={{ backgroundColor: "#48494B" }}>{data.case_number || "-"}</TableCell>
                        <TableCell sx={{ backgroundColor: "#393B3A" }}>
                          {data.arrest_warrant_date ? dayjs(data.arrest_warrant_date).format("DD/MM/YYYY") : "-"}
                        </TableCell>
                        <TableCell sx={{ backgroundColor: "#48494B" }}>
                          {data.arrest_warrant_expire_date ? dayjs(data.arrest_warrant_expire_date).format("DD/MM/YYYY") : "-"}
                        </TableCell>
                        <TableCell sx={{ backgroundColor: "#393B3A" }}>{data.behavior || "-"}</TableCell>
                        <TableCell sx={{ backgroundColor: "#48494B" }}>{data.case_owner_name}</TableCell>
                        <TableCell sx={{ backgroundColor: "#393B3A", textWrap: "nowrap" }}>{data.case_owner_phone}</TableCell>
                        <TableCell sx={{ backgroundColor: "#48494B", textAlign: "center" }}>
                          {imageUrl ? (
                            <div>
                              <img
                                key={index}
                                src={imageUrl}
                                alt={`image-${index}`}
                                className="inline-flex items-center justify-center align-middle h-[50px] w-[60px]"
                              />
                            </div>
                          ) : (
                            t('text.data-not-found')
                          )}
                        </TableCell>
                        <TableCell sx={{ backgroundColor: "#393B3A" }}>{fileUrl || t('text.data-not-found')}</TableCell>
                        <TableCell sx={{ backgroundColor: "#48494B" }}>{data.activeString}</TableCell>
                        <TableCell sx={{ backgroundColor: "#393B3A" }}>
                          <IconButton 
                            onClick={() => handleDeleteData(index)}
                            >
                            <Icon icon={Trash2} size={20} color="#FFFFFF" />
                          </IconButton>
                        </TableCell>

                        {data.cannotImport && (
                          <TableCell
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              backgroundColor: "rgba(72, 73, 75, 0.8)", // Semi-transparent overlay
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              fontWeight: "bold",
                              color: "#F0B70E !important",
                              zIndex: 1,
                            }}
                            colSpan={15}
                          >
                            {t('text.data-cannot-add')}
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })
                }
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </div>
    </div>
  )
}

export default Confirmation