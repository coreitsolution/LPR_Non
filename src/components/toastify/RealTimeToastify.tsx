import React, { useState } from 'react';
import { ToastContentProps } from 'react-toastify';
import dayjs from 'dayjs';
import { CircleAlert, X } from 'lucide-react';
import { useSelector } from "react-redux"
import { RootState } from "../../app/store"

// Components
import Image from '../image/Image';

// Types
import { RealTimeLprData } from '../../features/types';

// i18n
import { useTranslation } from 'react-i18next';

// Config
import { getUrls } from '../../config/runtimeConfig';

interface CustomToastContentProps extends ToastContentProps {
  closeToast: () => void;
  titleName: string;
  color: string;
  alertData: RealTimeLprData | null;
  onDelete?: () => void;
}

const RealTimeToastify: React.FC<CustomToastContentProps> = ({
  closeToast,
  titleName,
  color,
  alertData,
  onDelete,
}) => {
  if (!alertData) return null;

  const { CENTER_FILE_URL } = getUrls();

  // i18n
  const { t, i18n } = useTranslation();

  // Data
  const [currentIndex, setCurrentIndex] = useState(0);
  const imageList = [
    `${CENTER_FILE_URL}${alertData.vehicle_image}`,
    `${CENTER_FILE_URL}${alertData.plate_image}`,
  ];

  const sliceDropdown = useSelector(
    (state: RootState) => state.dropdownData
  )

  const showPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  const showNext = () => {
    setCurrentIndex((prev) => (prev + 1) % imageList.length);
  };

  const loopImages = () => {
    return (
      <div className="flex relative justify-center items-center bg-[#383A39]">
        <Image
          imageSrc={imageList[currentIndex]}
          imageAlt="Vehicle"
          className="w-full h-[150px] object-cover"
        />
        <div className="absolute bottom-0 right-0 flex gap-1 items-center px-2">
          <button
            type="button"
            className="text-white text-md bg-black/40 hover:bg-slate-800 px-2 py-1"
            onClick={showPrev}
          >
            &lt;
          </button>
          <button
            type="button"
            className="text-white text-md bg-black/40 hover:bg-slate-800 px-2 py-1"
            onClick={showNext}
          >
            &gt;
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[500px] h-full p-3 space-y-1 bg-black relative">
      {/* Close Button */}
      <button
        onClick={() => {
          if (onDelete) {
            onDelete();
          } 
          else {
            closeToast();
          }
        }}
        className="absolute top-2 right-2 z-10 hover:bg-gray-700 rounded-full p-1 transition-colors"
        aria-label="Close notification"
      >
        <X className="w-5 h-5 text-white hover:text-gray-300" />
      </button>

      {/* Header */}
      <div className="flex items-center space-x-10 pr-8">
        <div className="flex items-center space-x-2">
          <CircleAlert className="w-[30px] h-[30px]" color={color} />
          {
            titleName && (
              <p className="text-[16px] font-bold" style={{ color }}>{titleName}</p>
            )
          }
        </div>
        <p className="text-[16px]" style={{ color }}>
          {dayjs(alertData.epoch_end).format("DD/MM/YYYY (HH:mm:ss)")}
        </p>
      </div>

      {/* Content */}
      <div
        className="grid grid-cols-[55%_45%] border overflow-hidden"
        style={{ borderColor: color }}
      >
        {/* Left Section */}
        <div className="flex flex-col border-r" style={{ borderColor: color }}>
          {
            loopImages()
          }
          
          <div className="flex flex-col h-full items-center justify-center font-bold text-[16px] py-1" style={{ color }}>
            {
              (() => {
                const province = sliceDropdown.regions?.data.find(region => region.region_code === alertData.region_code);
                const newProvince = i18n.language === "th"
                  ? province?.name_th || "-"
                  : province?.name_en || "-";
                return (
                  <>
                    <p>{`${alertData.plate_prefix} ${alertData.plate_number}`}</p>
                    <p>{`${newProvince && ` ${newProvince}`}`}</p>
                  </>
                )
              })()
            }
          </div>
        </div>

        {/* Right Section */} 
        <div className="flex flex-col text-[11px] pl-2 py-1 pr-1 bg-white space-y-1 text-black"> 
          <div className="flex">
            <span className="w-[60px] font-medium">{`${t('feed-data.type')}:`}</span>
            {
              (() => {
                const vehicleBodyTypes = sliceDropdown.vehicleBodyTypes?.data.find(type => type.body_type === alertData.vehicle_body_type);
                const newVehicleBodyTypes = i18n.language === "th"
                  ? vehicleBodyTypes?.body_type_th || "-"
                  : vehicleBodyTypes?.body_type_en || "-";

                return (
                  <span>{newVehicleBodyTypes}</span>
                )
              })()
            }
          </div>
          <div className="flex">
            <span className="w-[60px] font-medium">{`${t('feed-data.brand')}:`}</span>
            {
              (() => {
                const vehicleMake = sliceDropdown.vehicleMakes?.data.find(type => type.make === alertData.vehicle_make);
                const newVehicleMake = i18n.language === "th"
                  ? vehicleMake?.make_th || "-"
                  : vehicleMake?.make_en || "-";

                return (
                  <span>{newVehicleMake}</span>
                )
              })()
            }
          </div>
          <div className="flex">
            <span className="w-[60px] font-medium">{`${t('feed-data.model')}:`}</span>
            {
              (() => {
                const vehicleModel = sliceDropdown.vehicleModel?.data.find(type => type.model === alertData.vehicle_model);
                const newVehicleModel = i18n.language === "th"
                  ? vehicleModel?.model_th || "-"
                  : vehicleModel?.model_en || "-";

                return (
                  <span>{newVehicleModel}</span>
                )
              })()
            }
          </div>
          <div className="flex">
            <span className="w-[60px] font-medium">{`${t('feed-data.color')}:`}</span>
            {
              (() => {
                const vehicleColor = sliceDropdown.vehicleColors?.data.find(type => type.color === alertData.vehicle_color);
                const newVehicleColor = i18n.language === "th"
                  ? vehicleColor?.color_th || "-"
                  : vehicleColor?.color_en || "-";

                return (
                  <span>{newVehicleColor}</span>
                )
              })()
            }
          </div>
          <div className="flex">
            <span className="w-[80px] font-medium">{`${t('feed-data.plate-group')}:`}</span>
            <span>{alertData.plate_class_name || "-"}</span>
          </div>
          <div className="flex">
            <span className="w-[70px] font-medium">{`${t('feed-data.behavior')}:`}</span>
            <span>{alertData.special_plate_remark || "-"}</span>
          </div>
          <div className="flex mb-6">
            <span className="w-[70px] font-medium">{`${t('feed-data.checkpoint')}:`}</span>
            <span>{alertData.camera_name || "-"}</span>
          </div>
          <div className="flex">
            <span className="w-[80px] font-medium">{`${t('feed-data.owner-name')}:`}</span>
            <span>{alertData.special_plate_owner_name || "-"}</span>
          </div>
          {/* <div className="flex">
            <span className="w-[80px] font-medium">{`${t('feed-data.owner-agency')}:`}</span>
            <span>{alertData.special_plate_owner_agency}</span>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default RealTimeToastify;