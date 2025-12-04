import React, { useCallback, useRef, useState } from 'react'
import { PopupMessage } from "../../utils/popupMessage"
import { useDispatch } from "react-redux"
import { AppDispatch } from "../../app/store"
import dayjs from 'dayjs'
import buddhistEra from 'dayjs/plugin/buddhistEra'

// Material UI
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';

// Icon
import { Icon } from '../icons/Icon'
import { Trash2, FileSliders, FileText } from 'lucide-react'

// Types
import {
  FileUpload,
  FileUploadResponse,
} from "../../features/types";

// Config
import { getUrls } from '../../config/runtimeConfig';

// Utils
import { getFileNameWithoutExtension } from "../../utils/commonFunction";
import { fetchClient, combineURL } from "../../utils/fetchClient";

// Component
import Loading from "../loading/Loading"

// i18n
import { useTranslation } from 'react-i18next';

dayjs.extend(buddhistEra)

interface ImagesUploadProps {
  setImagesDataList: (data: FileUpload[]) => void
  imagesDataList: FileUpload[]
}

const ImagesUpload: React.FC<ImagesUploadProps> = ({setImagesDataList, imagesDataList}) => {
  const dispatch: AppDispatch = useDispatch()
  const { CENTER_API, CENTER_FILE_URL } = getUrls();

  // Data
  const hiddenImageInput = useRef<HTMLInputElement | null>(null)

  // State
  const [isSimpleMode, setIsSimpleMode] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(false)

  // i18n
  const { t, i18n } = useTranslation();

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    let fileArray = Array.from(files);
    const fileNames = new Set<string>();
    const duplicateFiles: string[] = [];

    fileArray = fileArray.filter((file) => {
      const fileName = getFileNameWithoutExtension(file.name)
      if (fileNames.has(fileName)) {
        duplicateFiles.push(fileName);
        return false;
      }
      fileNames.add(fileName);
      return true;
    });

    if (duplicateFiles.length > 0) {
      PopupMessage(
        t("message.error.error-occurred"), 
        t("message.error.error-file-name-duplicate", { files: duplicateFiles.join(", ") }),
        "error"
      );
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const formData = new FormData()
      setIsLoading(true)
      fileArray.forEach(file => {
        formData.append("files", file) // Append each file individually
      })

      const response = await fetchClient<FileUploadResponse>(combineURL(CENTER_API, "/upload/"), {
        method: "POST",
        signal: controller.signal,
        isFormData: true,
        body: formData,
      })

      if (response.success) {
        const uploadedFiles: FileUpload[] = response.data.map((file) => ({
          ...file,
          createdAt: new Date().toDateString()
        }))

        setImagesDataList(uploadedFiles)
      }

    }
    catch (error) {
      PopupMessage(t("message.error.error-upload-file"), error instanceof Error ? error.message : String(error), "error")
    }
    finally {
      clearTimeout(timeoutId);
      setTimeout(() => {
        setIsLoading(false);
      }, 500)
    }

    if (hiddenImageInput.current) {
      hiddenImageInput.current.value = ""
    }
  }, [dispatch])

  const handleDeleteImage = async (index: number, url: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      await fetchClient(combineURL(CENTER_API, `/upload/remove`), {
        method: "POST",
        signal: controller.signal,
        body: JSON.stringify({ urls: [url] }),
      })

      const newImages = imagesDataList.filter((_, i) => i !== index)
      setImagesDataList(newImages)
    }
    catch (error) {
      PopupMessage(t("message.error.error-delete-file"), error instanceof Error ? error.message : String(error), "error");
    }
    finally {
      clearTimeout(timeoutId);
    }
  }

  const handleImportImageClick = () => {
    if (hiddenImageInput.current) {
      hiddenImageInput.current.click()
    }
  }

  return (
    <div id='images-upload'>
      {isLoading && <Loading />}
      <div className='flex flex-col h-full'>
        <div className='flex justify-end'>
          <Button
            variant="contained"
            className="tertiary-btn"
            sx={{ 
              width: t('button.import-image-width'), 
              height: "30px",
              textTransform: "capitalize",
            }}
            onClick={handleImportImageClick}
          >
            {t('button.import-image')}
          </Button>
          {/* Hidden File Input */}
          <input
            ref={hiddenImageInput}
            id="image-upload"
            type="file"
            name="images"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
        <div className='flex justify-between items-center mt-2.5'>
          <div className='flex items-center'>
            <img src="/icons/red-waring.png" alt="Warning" className='w-5 h-5' />
            <label className='ml-2 text-white text-[12px] font-bold'>{t('text.import-all-file-if-exist')}</label>
          </div>
          <div className='flex items-center space-x-2'>
            <div title='Detail View' className='cursor-pointer' onClick={() => setIsSimpleMode(false)}>
              <Icon icon={FileSliders} size={25} color="#FFFFFF" />
            </div>
            <div title='Simple View' className='cursor-pointer' onClick={() => setIsSimpleMode(true)}>
              <Icon icon={FileText} size={25} color="#FFFFFF" />
            </div>
          </div>
        </div>
        {
          !isSimpleMode ? 
          (
            <div className="grow overflow-x-auto">
              <TableContainer component={Paper} className="mt-4 h-[55vh]"
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
                      <TableCell sx={{ width: "5%", textAlign: "center" }}>{t('table.column.no')}</TableCell>
                      <TableCell sx={{ textAlign: "center" }}>{t('table.column.file-name')}</TableCell>
                      <TableCell sx={{ width: "10%", textAlign: "center" }}>{t('table.column.sample')}</TableCell>
                      <TableCell sx={{ width: "15%", textAlign: "center" }}>{t('table.column.date')}</TableCell>
                      <TableCell sx={{ width: "5%" }}></TableCell>
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
                      imagesDataList && imagesDataList.map((data, index) => (
                        <TableRow key={index}>
                          <TableCell sx={{ backgroundColor: "#393B3A", textAlign: "center" }}>{index + 1}</TableCell>
                          <TableCell sx={{ backgroundColor: "#48494B" }}>{data.originalName}</TableCell>
                          <TableCell sx={{ backgroundColor: "#393B3A", textAlign: "center" }}>
                            <div>
                              <img key={index} src={`${CENTER_FILE_URL}${data.url}`} alt={`image-${index + 1}`} className="inline-flex items-center justify-center align-middle h-[50px] w-[100px]" />
                            </div>
                          </TableCell>
                          <TableCell sx={{ backgroundColor: "#48494B", textAlign: "center" }}>{dayjs(data.createdAt).format(i18n.language === 'th' ? 'DD-MM-BBBB HH:mm:ss' : 'DD-MM-YYYY HH:mm:ss')}</TableCell>
                          <TableCell sx={{ backgroundColor: "#393B3A", textAlign: "center" }}>
                            <IconButton onClick={() => handleDeleteImage(index, data.url)}>
                              <Icon icon={Trash2} size={20} color="#FFFFFF" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          ) :
          (
            <div className='flex mt-4 h-[55vh] overflow-y-auto flex-wrap pt-2 space-x-2'>
              {
                imagesDataList && imagesDataList.map((data, index) => (
                  <div key={`divImage-${index + 1}`} className='flex flex-col relative justify-center h-[130px] w-[100px] text-center'>
                    <div className='flex flex-none w-[100px] h-[100px]'>
                      <img src={`${CENTER_FILE_URL}${data.url}`} alt={`image-${index + 1}`} className='w-full h-full' />
                    </div>
                    <p title={`${index + 1}.${data.originalName}`} className='truncate'>{`${index + 1}.${data.originalName}`}</p>
                    <button
                      type="button"
                      className="absolute z-52 top-[-5px] right-[-5px] text-center text-white bg-red-500 rounded-full w-5 h-5 flex items-center justify-center hover:cursor-pointer"
                      onClick={() => handleDeleteImage(index, data.url)}
                    >
                      &times;
                    </button>
                  </div>
                ))
              }
            </div>
          )
        }
      </div>
    </div>
  )
}

export default ImagesUpload