import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Button
} from '@mui/material';
import { getUrls } from '../../../config/runtimeConfig';

// Components
import TextBox from '../../../components/text-box/TextBox';
import Image from '../../../components/image/Image';
import DrawingCanvas from '../../../components/drawing-canvas/DrawingCanvas'

// i18n
import { useTranslation } from 'react-i18next';

// Types
import { Camera, CameraResponse, MaskResponse } from "../../../features/types";
import { Mask } from "../../../components/drawing-canvas/types"

// Icons
import { X, Save } from "lucide-react";
import { Icon } from '../../../components/icons/Icon';

// Utils
import { fetchClient, combineURL } from "../../../utils/fetchClient"
import { PopupMessage } from '../../../utils/popupMessage';


interface SensorSettingProps {
  open: boolean;
  onClose: () => void;
  selectedRow: Camera | null;
}

const SensorSetting: React.FC<SensorSettingProps> = ({open, onClose, selectedRow}) => {
  const { CENTER_FILE_URL, CENTER_API } = getUrls();

  // i18n
  const { t } = useTranslation();

  // State
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(false);
  const [clearCanvas, setClearCanvas] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [isSuperUser, setIsSuperUser] = useState(false);

  // Data
  const imgRef = useRef<HTMLImageElement>(null);
  const [sensorSettingData, setSensorSettingData] = useState<Mask | null>(null);
  const [originalData, setOriginalData] = useState<Mask | null>(null);

  const sliceDropdown = useSelector(
    (state: RootState) => state.dropdownData
  );

  const authData = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (open && selectedRow) {
      setImageLoaded(false);
      if (selectedRow.detection_area && !selectedRow.detection_area.includes("null")) {
        setSensorSettingData(JSON.parse(selectedRow.detection_area))
        setOriginalData(JSON.parse(selectedRow.detection_area))
      }
      const user_group = sliceDropdown.userGroups?.data.find(userGroup => userGroup.id === authData.authData.userInfo?.user_group_id && userGroup.group_name.toLowerCase() === "super user");
      setIsSuperUser(user_group ? true : false);
      setIsRestarting(false);
    }
  }, [open, selectedRow])

  const handleCustomShapeDrawn = (customShape: Mask) => {
    setIsDrawingEnabled(false)
    setSensorSettingData(customShape)
  }

  const handleCancelClick = () => {
    onClose();
  };

  const handleClearCanvas = () => {
    setClearCanvas(true)
    setTimeout(() => setClearCanvas(false), 0)
    setSensorSettingData(null)
  }

  const onRestartClick = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    setIsRestarting(true)
    
    try {
      if (selectedRow) {
        const body = {
          camera_uid: selectedRow.camera_uid,
        }
        await fetchClient<CameraResponse>(combineURL(CENTER_API, "/cameras/reboot-engine"), {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body),
        })
        PopupMessage(t('message.success.restart-engine-success'), "", "success")
        setTimeout(() => {
          setIsRestarting(false)
        }, 30000)
      }
    } 
    catch (error) {
      PopupMessage(t('message.error.something-wrong-occur'), t('message.error.restart-engine-error', { error: error }), 'error')
      setIsRestarting(false)
    }
  }

  const hasChanges = () => {
    return JSON.stringify(sensorSettingData ? sensorSettingData : "") !== JSON.stringify(originalData ? originalData : "")
  }

  const handleSubmitClick = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()

    try {
      if (selectedRow) {
        if (!hasChanges()) {
          PopupMessage(t('message.warning.no-change-found'), t('message.warning.data-not-change'), "warning")
          return
        }
        else if (!sensorSettingData) {
          PopupMessage(t('message.warning.data-incomplete'), t('message.warning.please-input-sensor-data'), "warning")
          return
        }
        else {
          const body = {
            camera_uid: selectedRow.camera_uid, 
            height: sensorSettingData.height,
            width: sensorSettingData.width,
            points: sensorSettingData.points
          }
          await fetchClient<MaskResponse>(combineURL(CENTER_API, "/cameras/draw-mask"), {
            method: "POST",
            body: JSON.stringify(body),
          })
          PopupMessage(t('message.success.save-success'), t('message.success.save-success-message'), "success")
        }
      }
    } 
    catch (error) {
      PopupMessage(t('message.error.something-wrong-occur'), t('message.error.setting-camera-error', { error: error }), 'error')
    }
  };

  return (
    <Dialog 
      id='sensor-setting' 
      open={open} 
      maxWidth={false} 
      slotProps={{
        paper: {
          sx: {
            maxWidth: '940px',
            width: '100%'
          },
        }
      }}
    >
      <DialogTitle className='flex items-center justify-between bg-black'>
        {/* Header */}
        <div>
          <Typography variant="h5" color="white" className="font-bold">{t('screen.sensor-setting.title')}</Typography>
        </div>
        <button
          onClick={onClose}
        >
          <X size={30} color="white" />
        </button>
      </DialogTitle>
      <DialogContent className='bg-black'>
        <div className='flex flex-col gap-5'>
          <div className='flex justify-between mb-3'>
            <div className='w-[50%]'>
              <TextBox
                id="camera-id"
                label={t('component.camera-id')}
                value={selectedRow?.camera_name}
                disabled={true}
              />
            </div>
            <div className='flex items-end justify-end space-x-2'>
              {
                isSuperUser && (
                  <>
                    {/* Clear Button */}
                    <button 
                      type="button" 
                      className="flex items-center justify-center bg-white w-[90px] h-10 rounded cursor-pointer" 
                      onClick={() => handleClearCanvas()}
                    >
                      <img src="/icons/clear.png" alt="Clear" className='w-5 h-5' />
                      <span className='ml-[5px] text-[#2B9BED]'>{t('button.clear')}</span>
                    </button>
                    {/* Start Button */}
                    <button 
                      type="button" 
                      className={`flex items-center justify-center w-[150px] h-10 rounded text-white cursor-pointer 
                        ${ !isDrawingEnabled ? "bg-[#2B9BED]" : "bg-[#2B9BED]/30"}
                        disabled:bg-[##383A39]
                      `} 
                      onClick={() => setIsDrawingEnabled(!isDrawingEnabled)}
                      disabled={isDrawingEnabled || sensorSettingData !== null}
                    >
                      <img src="/icons/start.png" alt="Start" className='w-5 h-5' />
                      <span className='ml-[5px]'>{t('button.start-plot-sensor')}</span>
                    </button>
                  </>
                )
              }
            </div>
          </div>

          <div className='p-5 border-[#2B9BED] border flex flex-col gap-2'>
            <div className='relative'>
              <Image 
                imageSrc={`${CENTER_FILE_URL}${selectedRow?.sample_image_url}`}
                imageAlt='Vehicle Detect'
                className='w-full h-[450px]'
                ref={imgRef}
                onLoad={() => setImageLoaded(true)}
              />
              { (!selectedRow?.sample_image_url || selectedRow?.sample_image_url === "") && (
                <label className='absolute inset-0 flex items-center justify-center text-black bg-white'>{t('text.camera-not-working')}</label>
              ) }
              { imageLoaded && imgRef.current && (
                <DrawingCanvas
                  imgRef={imgRef.current}
                  selectedRow={selectedRow}
                  onShapeDrawn={handleCustomShapeDrawn}
                  isDrawingEnabled={isDrawingEnabled}
                  clearCanvas={clearCanvas}
                />
              )}
            </div>
            <div className='flex justify-center'>
              {/* Restart Button */}
              {
                isSuperUser && (
                  <button
                    type="button"
                    disabled={isRestarting}
                    className={`flex items-center justify-center w-[90px] h-10 rounded mr-2.5 text-white cursor-pointer 
                      ${isRestarting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#2B9BED]'}
                    `}
                    onClick={onRestartClick}
                  >
                    <img
                      src={isRestarting ? "/icons/restart-disable.png" : "/icons/restart.png"}
                      alt="Restart"
                      className={`w-5 h-5 ${isRestarting ? 'animate-spin' : ''}`}
                    />
                    <span className="ml-[5px]">{t('button.restart')}</span>
                  </button>
                )
              }
            </div>
          </div>

          <div className='flex justify-end w-full mt-5 gap-3'>
            {
              isSuperUser && (
                <Button
                  variant="text"
                  className="submit-btn"
                  sx={{
                    width: "100px",
                    height: "40px",
                    textTransform: "capitalize",
                    '& .MuiSvgIcon-root': { 
                      fontSize: 20
                    },
                    color: "white",
                  }}
                  startIcon={<Icon icon={Save} size={20} color='white' />}
                  onClick={handleSubmitClick}
                >
                  {t('button.submit')}
                </Button>
              )
            }

            <Button
              variant="text"
              className="secondary-checkpoint-search-btn"
              sx={{
                width: "100px",
                height: "40px",
                textTransform: "capitalize",
                '& .MuiSvgIcon-root': { 
                  fontSize: 20
                } 
              }}
              onClick={handleCancelClick}
            >
              {t('button.cancel')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SensorSetting;