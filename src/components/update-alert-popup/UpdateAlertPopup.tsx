import React from 'react';
import { ToastContentProps, Id } from 'react-toastify';
import cx from 'clsx';
import { useLocation } from 'react-router-dom';

// Icons
import { Siren, CheckCircle } from "lucide-react";

// i18n
import { useTranslation } from 'react-i18next';

type NotificationData = {
  title: string;
  content: string;
  variables?: Record<string, any>;
  onUpdate?: (id: Id) => void;
  updateVisible?: boolean;
  isSuccess?: boolean;
};

interface UpdateAlertPopupProps extends Partial<ToastContentProps<NotificationData>> {
  data: NotificationData;
  type?: 'success' | 'error' | 'info' | 'warning';
}

const UpdateAlertPopup: React.FC<UpdateAlertPopupProps> = ({
  closeToast = () => {},
  data,
  toastProps,
}) => {
  // i18n
  const { t } = useTranslation();

  const location = useLocation();
  const isColored = (toastProps?.theme ?? 'dark') === 'dark';
  const isUpdatePage = location.pathname.includes('/setting') || location.pathname.includes('/real-time-monitor') || location.pathname.includes('/search-plate-with-condition');

  const handleUpdate = () => {
    if (data.onUpdate && toastProps?.toastId) {
      data.onUpdate(toastProps?.toastId);
    }
    closeToast();
  };

  return (
    <div
      className={cx(
        'flex flex-col w-full space-y-2 p-[14px]'
      )}
    >
      <h3
        className={cx(
          'text-md font-semibold',
          isColored ? 'text-white' : 'text-zinc-800'
        )}
      >
        <div 
          className='flex gap-2'
        >
          <Siren color='#FF0000' size={20} />
          {t(data?.title)}
        </div>
      </h3>
      <div className="flex flex-col gap-2 items-center">
        <p className="text-sm">{t(data?.content, data?.variables)}</p>
        {
          isUpdatePage && data?.updateVisible && (
            <button
              type="button"
              onClick={handleUpdate}
              className={cx(
                'ml-4 text-xs border rounded-md px-3 py-1.5 transition-all active:scale-[.95] cursor-pointer',
                isColored ? 'text-white bg-[#2B9BED]' : 'text-white bg-zinc-900'
              )}
            >
              {t('button.detail')}
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

export default UpdateAlertPopup;
