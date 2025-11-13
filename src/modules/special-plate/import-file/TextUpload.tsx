import React, {useRef, useState, useEffect} from 'react'
import ExcelJS from "exceljs";
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
import { Icon } from '../../../components/icons/Icon'
import { Trash2 } from 'lucide-react'

// Types
import {
  ImportSpecialPlates,
} from '../../../features/types';

// Utils
import { PopupMessage } from "../../../utils/popupMessage"
import { getFileNameWithoutExtension, formatPhone } from "../../../utils/commonFunction"

// Component
import Loading from "../../../components/loading/Loading"

// i18n
import { useTranslation } from 'react-i18next';

dayjs.extend(buddhistEra)

interface TextUploadProps {
  setTextsDataList: (data: ImportSpecialPlates[]) => void
  textsDataList: ImportSpecialPlates[]
}

const TextUpload: React.FC<TextUploadProps> = ({setTextsDataList, textsDataList}) => {

  // Data
  const hiddenFileInput = useRef<HTMLInputElement | null>(null)
  const [textsData, setTextsData] = useState<ImportSpecialPlates[]>(textsDataList)

  // State
  const [isLoading, setIsLoading] = useState(false)

  // i18n
  const { t } = useTranslation();

  useEffect(() => {
    setTextsDataList(textsData)
  }, [textsData, setTextsDataList])
  
  const handleClickImport = () => {
    if (hiddenFileInput.current) {
      hiddenFileInput.current.click()
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);

      const worksheet = workbook.worksheets[0]; // first sheet
      const headers: string[] = [];

      // Extract headers from first row
      worksheet.getRow(1).eachCell((cell) => {
        headers.push(String(cell.value ?? "").trim());
      });

      // Convert rows into JSON objects
      const jsonData: ImportSpecialPlates[] = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip header row
        const rowData: any = {};
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber - 1];
          rowData[header] = cell.value ?? "";
        });
        jsonData.push(rowData);
      });

      let fileImportError = "";
      const requiredFields = [
        "plate_group",
        "plate_number",
        "province",
        "plate_type",
        "case_owner_name",
        "case_owner_agency",
        "case_owner_phone",
      ];

      const fileNames = new Set<string>();
      const duplicateFiles: string[] = [];
      const imageNames = new Set<string>();
      const duplicateImages: string[] = [];

      const validatedData = jsonData
        .map((row, index) => {
          const missingFields = requiredFields.filter(
            (field) => !row[field as keyof ImportSpecialPlates]
          );

          if (missingFields.length > 0) {
            fileImportError = t("text.important-field", {
              field: missingFields.join(", "),
            });
            return null;
          }

          // Check duplicate image
          const imageName = getFileNameWithoutExtension(row.image);
          if (imageNames.has(imageName)) {
            duplicateImages.push(imageName);
            fileImportError = t("text.duplicate-file-found", {
              fileName: duplicateImages.join(", "),
            });
            return null;
          }
          imageNames.add(imageName);

          // Check duplicate filename
          const fileName = getFileNameWithoutExtension(row.file);
          if (fileNames.has(fileName)) {
            duplicateFiles.push(fileName);
            fileImportError = t("text.duplicate-file-found", {
              fileName: duplicateFiles.join(", "),
            });
            return null;
          }
          fileNames.add(fileName);

          return {
            id: index + 1,
            plate_group: row.plate_group,
            plate_number: row.plate_number,
            province: row.province,
            plate_type: row.plate_type,
            // case_number: row.case_number || "",
            // arrest_warrant_date: parseExcelDate(row.arrest_warrant_date),
            // arrest_warrant_expire_date: parseExcelDate(row.arrest_warrant_expire_date),
            behavior: row.behavior || "",
            case_owner_name: row.case_owner_name,
            case_owner_agency: row.case_owner_agency,
            case_owner_phone: formatPhone(row.case_owner_phone.replaceAll("-", "")),
            image: row.image,
            file: row.file,
            active: row.active,
          } as ImportSpecialPlates;
        })
        .filter(Boolean) as ImportSpecialPlates[];

      if (fileImportError) {
        PopupMessage(t("message.error.error-import-file"), fileImportError, "error");
      } else if (!fileImportError && validatedData && validatedData.length > 0) {
        setTextsData(validatedData);
      }
    } 
    catch (error) {
      PopupMessage(t("message.error.error-import-file"), String(error), "error");
    }

    setIsLoading(false);

    if (hiddenFileInput.current) {
      hiddenFileInput.current.value = "";
    }
  };

  const handleDeleteData = (indexToDelete: number) => {
    setTextsData(prevData => prevData.filter((_, index) => index !== indexToDelete));
  };

  return (
    <div id='text-upload'>
      {isLoading && <Loading />}
      <div className='flex flex-col h-full'>
        <div className='flex justify-end'>
          <Button
            variant="contained"
            className="tertiary-btn"
            sx={{ 
              width: t('button.import-excel-width'), 
              height: "30px",
              textTransform: "capitalize",
            }}
            onClick={handleClickImport}
          >
            {t('button.import-excel')}
          </Button>
          {/* Hidden File Input */}
          <input
            ref={hiddenFileInput}
            name="files"
            type="file"
            id="file-input"
            className="hidden"
            onChange={handleFileUpload}
            accept=".xlsx,.xls"
          />
        </div>
        <div className="flex-grow overflow-x-auto">
          <TableContainer component={Paper} className="mt-4 h-[56.3vh] w-[2500px]"
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
                  {/* <TableCell>{t('table.column.case-number')}</TableCell>
                  <TableCell>{t('table.column.date-arrest-warrant')}</TableCell>
                  <TableCell>{t('table.column.date-expiration-arrest-warrant')}</TableCell> */}
                  <TableCell>{t('table.column.behavior')}</TableCell>
                  <TableCell>{t('table.column.owner-name')}</TableCell>
                  <TableCell>{t('table.column.agency')}</TableCell>
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
                  textsData.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ backgroundColor: "#393B3A" }}>{index + 1}</TableCell>
                      <TableCell sx={{ backgroundColor: "#48494B" }}>{data.plate_group}</TableCell>
                      <TableCell sx={{ backgroundColor: "#393B3A" }}>{data.plate_number}</TableCell>
                      <TableCell sx={{ backgroundColor: "#48494B" }}>{data.province}</TableCell>
                      <TableCell sx={{ backgroundColor: "#393B3A" }}>{data.plate_type}</TableCell>
                      {/* <TableCell sx={{ backgroundColor: "#48494B" }}>{data.case_number || "-"}</TableCell>
                      <TableCell sx={{ backgroundColor: "#393B3A" }}>{data.arrest_warrant_date ? dayjs(data.arrest_warrant_date).format(i18n.language === 'th' ? 'DD/MM/BBBB' : 'DD/MM/YYYY') : "-"}</TableCell>
                      <TableCell sx={{ backgroundColor: "#48494B" }}>{data.arrest_warrant_expire_date ? dayjs(data.arrest_warrant_expire_date).format(i18n.language === 'th' ? 'DD/MM/BBBB' : 'DD/MM/YYYY') : "-"}</TableCell> */}
                      <TableCell sx={{ backgroundColor: "#48494B" }}>{data.behavior || "-"}</TableCell>
                      <TableCell sx={{ backgroundColor: "#393B3A" }}>{data.case_owner_name}</TableCell>
                      <TableCell sx={{ backgroundColor: "#48494B" }}>{data.case_owner_agency}</TableCell>
                      <TableCell sx={{ backgroundColor: "#393B3A", textWrap: "nowrap" }}>{data.case_owner_phone}</TableCell>
                      <TableCell sx={{ backgroundColor: "#48494B" }}>{data.image}</TableCell>
                      <TableCell sx={{ backgroundColor: "#393B3A" }}>{data.file}</TableCell>
                      <TableCell sx={{ backgroundColor: "#48494B" }}>{data.active}</TableCell>
                      <TableCell sx={{ backgroundColor: "#393B3A" }}>
                        <IconButton onClick={() => handleDeleteData(index)}>
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

export default TextUpload