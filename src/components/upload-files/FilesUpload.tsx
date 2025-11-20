import React, { useCallback, useRef, useState } from 'react'
import { useDispatch } from "react-redux"
import { AppDispatch } from "../../app/store"
import dayjs from 'dayjs'
import buddhistEra from 'dayjs/plugin/buddhistEra'
import { 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
} from '@mui/material';

// Icon
import { Icon } from '../icons/Icon'
import { Trash2 } from 'lucide-react'

// Types
import {
  FileUpload,
  FileUploadResponse,
} from "../../features/types";

// Utils
import { getFileNameWithoutExtension } from "../../utils/commonFunction";
import { fetchClient, combineURL } from "../../utils/fetchClient";
import { PopupMessage } from "../../utils/popupMessage"

// Component
import Loading from "../loading/Loading"

// i18n
import { useTranslation } from 'react-i18next';

// Config
import { getUrls } from '../../config/runtimeConfig';

dayjs.extend(buddhistEra)

interface FilesUploadProps {
  setFilesDataList: (data: FileUpload[]) => void
  filesDataList: FileUpload[]
}

const FilesUpload: React.FC<FilesUploadProps> = ({setFilesDataList, filesDataList}) => {
  const dispatch: AppDispatch = useDispatch();
  const { CENTER_API } = getUrls();

  // Data
  const hiddenFilesInput = useRef<HTMLInputElement | null>(null)

  // State
  const [isLoading, setIsLoading] = useState(false)

  // i18n
  const { t, i18n } = useTranslation();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
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

        setFilesDataList(uploadedFiles)
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

    if (hiddenFilesInput.current) {
      hiddenFilesInput.current.value = ""
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

      const newFiles = filesDataList.filter((_, i) => i !== index);
      setFilesDataList(newFiles);
    }
    catch (error) {
      PopupMessage(t("message.error.error-delete-file"), error instanceof Error ? error.message : String(error), "error");
    }
    finally {
      clearTimeout(timeoutId);
    }
  }

  const handleImportFileClick = () => {
    if (hiddenFilesInput.current) {
      hiddenFilesInput.current.click()
    }
  }

  return (
    <div id='files-upload'>
      {isLoading && <Loading />}
      <div className='flex flex-col h-full'>
        <div className='flex justify-end'>
          <Button
            variant="contained"
            className="tertiary-btn"
            sx={{ 
              width: "110px", 
              height: "30px",
              textTransform: "capitalize",
            }}
            onClick={handleImportFileClick}
          >
            {t('button.import-file')}
          </Button>
          {/* Hidden File Input */}
          <input
            ref={hiddenFilesInput}
            name="files"
            type="file"
            accept=".docx, .pdf"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
        <div className='flex items-center'>
          <img src="/icons/red-waring.png" alt="Warning" className='w-5 h-5' />
          <label className='ml-2 text-white text-[12px] font-bold'>{t('text.import-all-file-if-exist')}</label>
        </div>
        <div className="grow overflow-x-auto">
          <TableContainer component={Paper} className="mt-4 h-[56vh]"
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
                  filesDataList && filesDataList.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ backgroundColor: "#393B3A", textAlign: "center" }}>{index + 1}</TableCell>
                      <TableCell sx={{ backgroundColor: "#48494B" }}>{data.originalName}</TableCell>
                      <TableCell sx={{ backgroundColor: "#393B3A", textAlign: "center" }}>{dayjs(data.createdAt).format(i18n.language === 'th' ? 'DD-MM-BBBB HH:mm:ss' : 'DD-MM-YYYY HH:mm:ss')}</TableCell>
                      <TableCell sx={{ backgroundColor: "#48494B", textAlign: "center" }}>
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
      </div>
    </div>
  )
}

export default FilesUpload