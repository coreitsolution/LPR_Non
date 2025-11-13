import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Button,
} from '@mui/material';

// Types
import { SearchPlateCondition } from '../../features/search/SearchTypes';

// Constants
import { ROUTE_COLOR_LIST } from '../../constants/routeColorList';

// i18n
import { useTranslation } from 'react-i18next';

// Config
import { getUrls } from '../../config/runtimeConfig';
import dayjs from 'dayjs';

interface CompareRoutesProps {
  open: boolean;
  onClose: () => void;
  plateDetailList: SearchPlateCondition[];
}

const CompareRoutes: React.FC<CompareRoutesProps> = ({ open, onClose, plateDetailList }) => {
  const { CENTER_FILE_URL } = getUrls();
  const [unifiedRoutes, setUnifiedRoutes] = useState<{ camera_name: string; epoch_end: string }[]>([]);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (!open) return;
    const routeMap = new Map<string, { camera_name: string; epoch_end: string }>();

    plateDetailList.forEach((plate) => {
      plate.plateRoute?.forEach((pr) => {
        pr.routes.forEach((route) => {
          const key = `${route.camera_name}|${route.epoch_end}`;
          if (!routeMap.has(key)) {
            routeMap.set(key, { camera_name: route.camera_name, epoch_end: route.epoch_end });
          }
        });
      });
    });

    const sorted = Array.from(routeMap.values()).sort(
      (a, b) => new Date(b.epoch_end).getTime() - new Date(a.epoch_end).getTime()
    );
    setUnifiedRoutes(sorted);
  }, [plateDetailList, open]);

  return (
    <Dialog id="compare-routes" open={open} maxWidth="xl" fullWidth>
      <DialogTitle className="bg-black">
        <div>
          <Typography variant="h5" component="div" color="white" className="font-bold">
            {t('screen.compare-routes.title')}
          </Typography>
        </div>
      </DialogTitle>
      <DialogContent className="bg-black">
        <div className="flex flex-col h-[80vh] overflow-y-auto">
          <div className="flex flex-grow overflow-x-auto whitespace-nowrap">
            {plateDetailList.map((data, index) => (
              <div
                key={`vehicle_detail_${index}`}
                className="w-[500px] max-w-[500px] h-full text-white flex-shrink-0"
              >
                <div className="flex items-center justify-center py-1 space-x-2 bg-[#242727] z-10">
                  <p className="text-white text-[16px]">{`${t('text.car-no')} ${index + 1}`}</p>
                </div>

                <div className={`${index % 2 === 0 ? 'bg-[#48494B]' : 'bg-[#393B3A]'} p-1`}>
                  <div className="flex items-center justify-center h-[160px] bg-black border-b-[1px] border-[#384043]">
                    <div className="h-[160px] w-[60%] relative">
                      <img src={`${CENTER_FILE_URL}${data.vehicle_image}`} alt="Vehicle" className="h-full w-full" />
                      <img
                        src={`${CENTER_FILE_URL}${data.plate_image}`}
                        alt="Plate"
                        className="h-[30%] w-[100px] absolute bottom-0 left-0"
                      />
                    </div>
                  </div>

                  <div className="bg-black py-2 px-6 text-center">{`${data.plate_prefix} ${data.plate_number}${data.region ? ` ${i18n.language === "th" ? data.region.name_th : data.region.name_en}` : ""}`}</div>

                  <div>
                    {unifiedRoutes.map((globalRoute, rowIndex) => {
                      const match = data.plateRoute?.flatMap((pr) => pr.routes).find(
                        (r) =>
                          r.camera_name === globalRoute.camera_name &&
                          r.epoch_end === globalRoute.epoch_end
                      );

                      const colorIndex = rowIndex % ROUTE_COLOR_LIST.length;
                      const bgColor = ROUTE_COLOR_LIST[colorIndex];

                      return match ? (
                        <div
                          key={`match_${index}_${rowIndex}`}
                          className="flex justify-between border-b border-dashed p-3 items-center text-[14px] h-12"
                        >
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: bgColor }} />
                            <span className="truncate max-w-[250px]" title={match.camera_name}>
                              {match.camera_name}
                            </span>
                          </div>
                          <div>{dayjs(match.epoch_end).format('DD/MM/YYYY (HH:mm:ss)')}</div>
                        </div>
                      ) : (
                        <div
                          key={`empty_${index}_${rowIndex}`}
                          className="border-b border-dashed p-3 h-12"
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <Button
              variant="text"
              className="secondary-checkpoint-search-btn"
              sx={{ width: '100px', height: '40px', '& .MuiSvgIcon-root': { fontSize: 20 } }}
              onClick={onClose}
            >
              {t('button.cancel')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CompareRoutes;
