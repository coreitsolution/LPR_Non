import React, { useEffect, useState } from "react";

// Material UI
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import FormControlLabel from "@mui/material/FormControlLabel";

// i18n
import { useTranslation } from "react-i18next";

// Icons
import BellIcon from "../../assets/icons/bell.png";
import OpenBellIcon from "../../assets/icons/open-bell.png";
import ClearAllIcon from "../../assets/icons/clear-all.png";

// Utils
import { PopupMessageWithCancel } from "../../utils/popupMessage";

// Components
import { ShowPopUpSwitch } from "../toggle-switch/ToggleSwitch";

// Constants
import { SHOW_POPUP_STORAGE_KEY } from "../../constants/localStorage";

interface NotificationBellProps {
  notificationCount: number;
  onNotificationClick: (
    event: React.MouseEvent<HTMLButtonElement>,
    isOpen: boolean
  ) => void;
  onClearAllNotifications?: (
    event: React.MouseEvent<HTMLButtonElement>
  ) => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  notificationCount,
  onNotificationClick,
  onClearAllNotifications,
}) => {
  // i18n
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [showPopUp, setShowPopUp] = useState(false);

  const isNotificationOpen = Boolean(anchorEl);

  useEffect(() => {
    const storedValue = localStorage.getItem(SHOW_POPUP_STORAGE_KEY);

    if (storedValue === null || storedValue === "true") {
      setShowPopUp(true);
    } 
    else if (storedValue === "false") {
      setShowPopUp(false);
    }
  }, []);

  const handleShowPopUpChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const checked = event.target.checked;

    setShowPopUp(checked);
    localStorage.setItem(SHOW_POPUP_STORAGE_KEY, checked ? "true" : "false");
  };

  const handleNotificationClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    const nextOpenState = !anchorEl;

    if (nextOpenState) {
      setAnchorEl(event.currentTarget);
    } else {
      setAnchorEl(null);
    }

    onNotificationClick(event, nextOpenState);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleClearAllNotifications = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    const res = await PopupMessageWithCancel(
      t("message.warning.confirm-all-notification"),
      t("message.warning.confirm-all-notification-message"),
      t("button.confirm"),
      t("button.cancel"),
      "warning",
      "#FDB600"
    );

    if (res && onClearAllNotifications) {
      onClearAllNotifications(event);
      handleCloseMenu();
    }
  };

  return (
    <div className="flex items-center justify-center relative">
      {/* Main Notification Button */}
      <IconButton
        onClick={handleNotificationClick}
        sx={{
          borderRadius: "50%",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          position: "relative",
        }}
      >
        <img
          src={BellIcon}
          alt="Bell Icon"
          className="h-[21px] w-[21px]"
        />

        {notificationCount > 0 && (
          <div className="absolute top-0 -right-[5px] bg-[#2B9BED] text-white text-xs font-bold rounded-full w-[22px] h-[22px] flex justify-center items-center">
            <span className="text-[#071C3B]">{notificationCount}</span>
          </div>
        )}
      </IconButton>

      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={isNotificationOpen}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        slotProps={{
          root: {
            sx: {
              zIndex: 99999,
            },
          },
          paper: {
            elevation: 3,
            sx: {
              mt: 1,
              borderRadius: "12px",
              overflow: "visible",
              backgroundColor: "black",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            },
          },
        }}
      >
        <MenuList
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 1.2,
            px: 1,
            py: 0.5,
            backgroundColor: "black",
          }}
        >
          {/* Open Notification */}
          <MenuItem
            disableRipple
            sx={{
              p: 0,
              borderRadius: "50%",
              border: "1px solid rgba(255, 255, 255, 0.5)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <IconButton
              onClick={handleNotificationClick}
              sx={{
                borderRadius: "50%",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                position: "relative",
              }}
            >
              <img
                src={OpenBellIcon}
                alt="Open Bell Icon"
                className="h-[23px] w-[23px]"
              />

              {notificationCount > 0 && (
                <div className="absolute top-0 -right-[5px] bg-[#2B9BED] text-white text-xs font-bold rounded-full w-[22px] h-[22px] flex justify-center items-center">
                  <span className="text-[#071C3B]">
                    {notificationCount}
                  </span>
                </div>
              )}
            </IconButton>
          </MenuItem>

          {/* Clear All */}
          <MenuItem
            disableRipple
            sx={{
              p: 0,
              borderRadius: "50%",
              border: "1px solid rgba(255, 255, 255, 0.5)",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <IconButton
              onClick={
                notificationCount > 0
                  ? handleClearAllNotifications
                  : undefined
              }
              disabled={notificationCount === 0}
              sx={{
                borderRadius: "50%",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              <img
                src={ClearAllIcon}
                alt="Clear All Icon"
                className="h-[23px] w-[23px]"
              />
            </IconButton>
          </MenuItem>

          {/* Show Pop-up Setting */}
          <MenuItem disableRipple sx={{ p: 0 }}>
            <FormControlLabel
              control={
                <ShowPopUpSwitch
                  checked={showPopUp}
                  onChange={handleShowPopUpChange}
                  sx={{ m: 1 }}
                />
              }
              label="Show Pop-up"
              sx={{
                color: "white",
                mr: 0,
                "& .MuiFormControlLabel-label": {
                  fontSize: "14px",
                },
              }}
            />
          </MenuItem>
        </MenuList>
      </Menu>
    </div>
  );
};

export default NotificationBell;