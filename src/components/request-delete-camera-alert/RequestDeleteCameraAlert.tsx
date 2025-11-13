import React from 'react';
import { ToastContentProps, Id } from 'react-toastify';
import cx from 'clsx';
import { CheckCircle } from "lucide-react";
import { useTranslation } from 'react-i18next';

type NotificationData = {
  content: string;
  variables?: Record<string, any>;
  onUpdate?: (id: Id) => void;
  updateVisible?: boolean;
  isSuccess?: boolean;
};

interface RequestDeleteCameraAlertProps extends Partial<ToastContentProps<NotificationData>> {
  data: NotificationData;
  type?: 'success' | 'error' | 'info' | 'warning';
}

const RequestDeleteCameraAlert: React.FC<RequestDeleteCameraAlertProps> = ({
  closeToast = () => {},
  data,
  toastProps,
}) => {
  const { t } = useTranslation();
  const isColored = toastProps?.theme === 'light';

  const handleUpdate = () => {
    if (data.onUpdate && toastProps?.toastId) {
      data.onUpdate(toastProps?.toastId);
    }
    closeToast();
  };

  return (
    <div className="flex flex-col w-full space-y-2 min-h-[171px]">
      <div className='flex justify-center items-center'>
        <div className='relative'>
          <img src="/svg/bell.svg" alt="Bell" className='w-[70px] h-[70px] bell-shake' />
          <div className='absolute top-0 right-[-5px] rotate-[-15deg]'>
            <img src="/svg/bell-ring.svg" alt="Bell Ring" className='w-[70px] h-[70px] ring-shake' />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 items-center">
        <p className="text-[18px] text-[#4A4A4A] font-bold">
          {t(data?.content, data?.variables)}
        </p>

        {data.updateVisible && (
          <button
            type="button"
            onClick={handleUpdate}
            className={cx(
              'ml-4 text-[12px] rounded-md px-3 py-1.5 transition-all active:scale-[.95] cursor-pointer',
              isColored ? 'text-[#071C3B] font-bold bg-[#FFC300]' : 'text-white font-bold bg-[#2B9BED]'
            )}
          >
            {t('button.detail')}
          </button>
        )}

        {data.isSuccess && (
          <div className='flex gap-2 items-center'>
            <CheckCircle color='#4CB64C' size={20} />
            <p className="text-sm">{t('text.notification-confirm')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestDeleteCameraAlert;
