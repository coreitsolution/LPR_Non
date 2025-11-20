import React, { useState } from "react";
import { IconButton } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

// i18n
import { useTranslation } from 'react-i18next';

// Icons
import BellIcon from "../../assets/icons/bell.png";
import OpenBellIcon from "../../assets/icons/open-bell.png";
import ClearAllIcon from "../../assets/icons/clear-all.png";

// Utils
import { PopupMessageWithCancel } from '../../utils/popupMessage';

interface NotificationBellProps {
  notificationCount: number;
  onNotificationClick: (event: React.MouseEvent<HTMLButtonElement>, isOpen: boolean) => void;
  onClearAllNotifications?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ notificationCount, onNotificationClick, onClearAllNotifications }) => {
  // i18n
  const { t } = useTranslation();
  
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const handleNotificationClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const nextOpenState = !isNotificationOpen;
    setIsNotificationOpen(nextOpenState);
    onNotificationClick(event, nextOpenState);
  };

  const handleClearAllNotifications = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const res = await PopupMessageWithCancel(t('message.warning.confirm-all-notification'), t('message.warning.confirm-all-notification-message'), t('button.confirm'), t('button.cancel'), "warning", "#FDB600");
    if (res && onClearAllNotifications) {
      onClearAllNotifications(event);
      setIsNotificationOpen(false);
    }
  };

  const bellVariants = {
    closed: { scaleX: 1, scaleY: 1, transition: { type: "spring" as const, stiffness: 500, damping: 50 } },
    squeezed: { scaleX: 0.1, scaleY: 1, transition: { type: "spring" as const, stiffness: 500, damping: 50 } },
  };

  const sideButtonVariants = {
    hidden: { x: 0, opacity: 0 },
    visible: (direction: number) => ({
      x: direction * 25,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 500, damping: 30 },
    }),
    exit: { x: 0, opacity: 0, transition: { type: "spring" as const, stiffness: 500, damping: 50 } },
  };

  return (
    <div className="flex items-center justify-center relative w-[50px]">
      <AnimatePresence mode="wait">
        {!isNotificationOpen ? (
          <motion.div
            key="bell-closed"
            className="relative flex justify-center items-center"
            initial="squeezed"
            animate="closed"
            exit="squeezed"
            variants={bellVariants}
            title={t("title.show-notification")}
          >
            <IconButton
              onClick={handleNotificationClick}
              sx={{ borderRadius: "50px !important", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
            >
              <img src={BellIcon} alt="Bell Icon" className="h-[23px] w-[19px]" />
              {notificationCount > 0 && (
                <div className="absolute top-0 -right-[5px] bg-[#2B9BED] text-white text-xs font-bold rounded-full w-[22px] h-[22px] flex justify-center items-center">
                  <span className="text-[#071C3B]">{notificationCount}</span>
                </div>
              )}
            </IconButton>
          </motion.div>
        ) : (
          <motion.div
            key="bell-open"
            className="relative flex justify-center items-center"
            initial="squeezed"
            animate="squeezed"
            exit="closed"
          >
            {/* Central Squeezed Line */}
            <motion.div
              className="h-[23px] w-1 bg-[#333333] rounded"
              variants={bellVariants}
              initial="closed"
              animate="squeezed"
              exit="closed"
            />

            {/* Left Button (Open Bell) */}
            <motion.div
              className="absolute left-0 flex justify-center items-center"
              custom={-1}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={sideButtonVariants}
              title={t("title.hide-notification")}
            >
              <IconButton
                onClick={handleNotificationClick}
                sx={{ borderRadius: "50px !important", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
              >
                <img src={OpenBellIcon} alt="Open Bell Icon" className="h-[23px] w-[23px]" />
                {notificationCount > 0 && (
                  <div className="absolute top-0 -right-[5px] bg-[#2B9BED] text-white text-xs font-bold rounded-full w-[22px] h-[22px] flex justify-center items-center">
                    <span className="text-[#071C3B]">{notificationCount}</span>
                  </div>
                )}
              </IconButton>
            </motion.div>

            {/* Right Button (Clear All) */}
            <motion.div
              className="absolute right-0 flex justify-center items-center"
              custom={1}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={sideButtonVariants}
              title={t("title.confirm-all-notification")}
            >
              <IconButton
                onClick={notificationCount > 0 ? handleClearAllNotifications : undefined}
                sx={{ 
                  borderRadius: "50px !important", 
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  cursor: notificationCount === 0 ? "not-allowed" : "pointer",
                }}
              >
                <img src={ClearAllIcon} alt="Clear All Icon" className="h-[23px] w-[23px]" />
              </IconButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
