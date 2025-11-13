import React from 'react';
import { ToastContentProps, Id } from 'react-toastify';
import cx from 'clsx';

// Animation
import CameraOnlineAnimation from "../../assets/animation/cctv-online.json";
import CameraOfflineAnimation from "../../assets/animation/cctv-offline.json";

// Components
import LottieAnimation from '../lottie-animation/LottieAnimation';

// Icons
import { CheckCircle } from "lucide-react";

// i18n
import { useTranslation } from 'react-i18next';

type NotificationData = {
  title: string;
  content: string[];
  onUpdate?: (id: Id) => void;
  updateVisible?: boolean;
  isSuccess?: boolean;
  isOnline?: boolean;
};

interface CameraStatusPopupProps extends Partial<ToastContentProps<NotificationData>> {
  data: NotificationData;
  type?: 'success' | 'error' | 'info' | 'warning';
}

const CameraStatusPopup: React.FC<CameraStatusPopupProps> = ({
  closeToast = () => {},
  data,
  toastProps,
}) => {
  // i18n
  const { t } = useTranslation();

  const isColored = (toastProps?.theme ?? 'dark') === 'dark';

  const handleUpdate = () => {
    if (data.onUpdate && toastProps?.toastId) {
      data.onUpdate(toastProps?.toastId);
    }
    closeToast();
  };

  return (
    <div
      className={'flex flex-col justify-center items-center w-full gap-1'}
    >
      <LottieAnimation 
        animationData={data?.isOnline ? CameraOnlineAnimation : CameraOfflineAnimation}
        width={80}
        height={80}
      />
      <h3 className={`font-semibold text-[20px] ${isColored ? 'text-white' : 'text-black'}`}>{t(data?.title)}</h3>
      <div className="flex flex-col gap-2 items-center">
        {
          data?.content && data?.content.length > 0 && data?.content.map((content, index) => {
            return (
              <p key={index} className="text-sm text-center">
                {content.startsWith("alert.") ? t(content) : content}
              </p>
            )
          })
        }
        {
          data?.updateVisible && (
            <button
              type="button"
              onClick={handleUpdate}
              className={cx(
                'text-xs border rounded-md px-3 py-1.5 transition-all active:scale-[.95] cursor-pointer',
                isColored ? 'text-white bg-[#2B9BED]' : 'text-white bg-zinc-900'
              )}
            >
              {t('button.ok')}
            </button>
          )
        }
        {
          data?.isSuccess && data?.isSuccess && (
            <div className='flex gap-2 items-center'>
              <CheckCircle color='#4CB64C' size={20} />
              <p className="text-sm">{t('text.notification-confirm')}</p>
            </div>
          )
        }
      </div>
    </div>
  );
};

export default CameraStatusPopup;
