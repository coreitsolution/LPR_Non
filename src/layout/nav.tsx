import { Th, Gb } from "react-flags-select"
import "./nav.scss";
import { useCallback, useEffect, useState, useRef } from "react";
import MenuIcon from "./menu-icon/menuicon";
import { NavLink } from "react-router-dom";
import RiArrowDownSFill from "~icons/ri/arrow-down-s-fill";
import RiArrowUpSFill from "~icons/ri/arrow-up-s-fill";
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "../app/store"
import dayjs from 'dayjs';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

// Components
import CameraStatusPopup from "../components/camera-status-popup/CameraStatusPopup";
import NotificationBell from "../components/notification-bell/NotificationBell";
import Loading from "../components/loading/Loading";

// Context
import { useHamburger } from "../context/HamburgerContext";

// API
import {
  logout
} from "../features/auth/authSlice"
import { addListNotification, NotificationType } from "../features/notification/notificationSlice";

// Image Assets
import User from "../assets/icons/user.png"

// i18n
import { useTranslation } from 'react-i18next';

// Config
import { getUrls } from '../config/runtimeConfig';

// Utils
import { createNotificationToast, confirmNotification } from "../utils/notification";
import { toastChannel } from "../utils/channel";
import { fetchClient, combineURL } from "../utils/fetchClient";

// Types
import { EventNotifyResponse, EventNotify } from "../features/types";

dayjs.extend(buddhistEra);

function Nav() {
  const version = __APP_VERSION__
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { isOpen, toggleMenu } = useHamburger();
  const { PROJECT_NAME, NAV_LOGO_BG_WHITE, CENTER_FILE_URL, CENTER_API } = getUrls();

  // i18n
  const { i18n, t } = useTranslation();

  // State
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [_, setBarChartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Data
  const dropdownRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [languageSelected, setLanguageSelect] = useState(i18n.language ?? "th");
  const [sidePosition, setSidePosition] = useState(0);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [notificationCount, setNotificationCount] = useState(0);

  const notificationRedux = useSelector(
    (state: RootState) => state.notification
  )

  const { authData } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    setNotificationCount(notificationRedux.list.length)
  }, [notificationRedux])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(dayjs(new Date()).format(i18n.language === 'th' ? 'BBBB-MM-DD HH:mm:ss' : 'YYYY-MM-DD HH:mm:ss'))
    }, 1000)

    return () => clearInterval(interval)
  }, [dispatch])

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLanguage = event.target.value;
    setLanguageSelect(selectedLanguage);
    i18n.changeLanguage(selectedLanguage);
  }

  const handleSlideUp = useCallback(() => {
    setSidePosition((prev: number) => Math.min(prev + 68, 0));
  }, []);

  const handleSlideDown = () => {
    setSidePosition((prev: number) => Math.max(prev - 68, -100));
  };

  const navItems = [
    { path: "/center/real-time-monitor", icon: "checking", label: "real-time" },
    { path: "/center/search-plate-with-condition", icon: "search-condition", label: "search-condition" },
    // {
    //   path: "/center/search-plate-before-after",
    //   icon: "gps",
    //   label: "gps",
    // },
    // {
    //   path: "/center/search-suspect-person",
    //   icon: "detect-person",
    //   label: "search-suspect-person",
    // },
    {
      path: "/center/special-plate",
      icon: "special-plate",
      label: "special-plate",
    },
    // {
    //   path: "/center/suspect-people",
    //   icon: "order-detect-person",
    //   label: "special-suspect-person",
    // },
    { path: "/center/manage-user", icon: "add-user", label: "manage-user" },
    { path: "/center/setting", icon: "settings", label: "settings" },
    // { path: "/center/manage-checkpoint-cameras", icon: "manage-checkpoint-cameras", label: "manage-checkpoint-cameras" },
    // { icon: "bar-chart", 
    //   label: "bar-chart",
    //   hasSubmenu: true,
    //   subPath: [
    //     { path: "/center/chart/log", icon: "log", label: "log" },
    //     { path: "/center/chart/graph", icon: "graph", label: "graph" },
    //     { path: "/center/chart/end-user", icon: "user-cross", label: "user-cross" },
    //     { path: "/center/chart/camera-installation-points", icon: "camera-location", label: "camera-location" },
    //     { path: "/center/chart/camera-status", icon: "search-keyword", label: "search-keyword" },
    //   ]
    // },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        imgRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !imgRef.current.contains(event.target as Node)
      ) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleButtonClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    setDropdownVisible(true)
  }

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDropdownVisible(false)
    navigate(`/center/user-info`, { state: { allowed: true } });
  };
  
  const handleLogoutClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDropdownVisible(false)
    dispatch(logout())
  };

  const handleNotificationClick = async (e: React.MouseEvent<HTMLButtonElement>, isOpen: boolean) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isOpen) {
      // Hide all active toasts
      notificationRedux.list.forEach(row => {
        toast.dismiss(`notification-list-toast-${row.messageId}`);
      });

      return;
    }

    notificationRedux.list.forEach(row => {
      const toastId = `notification-list-toast-${row.messageId}`;

      // Skip if already shown
      if (toast.isActive(toastId)) return;

      if (row.type === "cameraOnline" || row.type === "cameraOffline") {
        createNotificationToast({
          dispatch,
          component: CameraStatusPopup,
          type: row.type,
          theme: "dark",
          title: row.title,
          content: row.content ?? [],
          isOnline: row.isOnline,
          messageId: row.messageId,
          style: {
            minHeight: row.isOnline ? "220px" : "250px",
            maxHeight: row.isOnline ? "220px" : "250px",
          },
          closeAction: "closeCameraStatusAlert",
          id: row.id,
        });
      }
    });
  };

  const handleClearAllNotifications = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    await Promise.all(
      notificationRedux.list.map((row) => {
        const toastId = `notification-list-toast-${row.messageId}`;

        toast.dismiss(toastId);
        const updatedData = {
          updateVisible: false,
          isSuccess: true,
          theme: row.theme,
          style: row.style,
          type: row.type,
          title: row.title,
          content: row.content,
          variables: row.variables,
          isOnline: row.isOnline,
        };
  
        toastChannel.postMessage({
          toastId: toastId,
          action: row.closeAction,
          data: updatedData,
          id: row.id,
          messageId: row.messageId,
        });

        confirmNotification(row.id, row.messageId, dispatch);
      })
    );
    toastChannel.postMessage({ action: "clear-all" });
    await fetchNotification();
    setIsLoading(false);
  }

  const fetchNotification = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetchClient<EventNotifyResponse>(combineURL(CENTER_API, "/event-notify/get"), {
        method: "GET",
        signal: controller.signal,
        queryParams: {
          page: "1",
          limit: "100",
          filter: `is_confirm=false,event_timestamp>=${dayjs(authData.userInfo?.created_at).toISOString()}`,
          orderBy: "id.desc"
        }
      })

      if (response.success) {
        const data = response.data.map((row: EventNotify) => {
          const isOnline = row.data.current_status.toString().toLowerCase() === "online" ? true : false;
          const type: NotificationType = isOnline
              ? "cameraOnline"
              : "cameraOffline"
          
          return {
            id: row.id,
            userId: "",
            type,
            title: isOnline ? "alert.camera-online" : "alert.camera-offline",
            content: isOnline
              ? [row.data.camera_name, row.data.camera_ip]
              : [
                  "alert.camera-offline-content-2",
                  row.data.camera_name,
                  row.data.camera_ip,
                ],
            isOnline,
            messageId: `${row.id}_${row.event_timestamp}`,
          }
        });

        dispatch(
          addListNotification(data)
        );
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(errorMessage)
    }
    finally {
      clearTimeout(timeoutId);
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 min-w-[1300px]">
      { isLoading && <Loading /> }
      <div className="flex justify-between items-center bg-black">
        {/* Status Section */}
        <div 
          className="flex-1 bg-[#2B9BED] text-white"
          style={{ clipPath: "polygon(0% 0%, 98.3% 0%, 95% 100%, 0% 100%)" }}
        >
          <div 
            className="flex pt-1.5 justify-center bg-black mb-[3px]" 
            style={{ clipPath: "polygon(0% 0%, 98.1% 0%, 94.9% 100%, 0% 100%)" }}
          >
            <div className="flex w-full">
              <div className="flex items-center justify-center space-x-1 ml-2.5">
                {/* Hamburger Icon */}
                <div 
                  onClick={toggleMenu}
                  className="hamburger-menu"
                >
                  <button className="hamburger-icon mx-5">
                    <div className={`line ${isOpen ? "open" : ""}`} />
                    <div className={`line ${isOpen ? "open" : ""}`} />
                    <div className={`line ${isOpen ? "open" : ""}`} />
                  </button>
                </div>
                <div className={`flex justify-center items-center ${NAV_LOGO_BG_WHITE ? "bg-white" : ""}`}>
                  <img src="/project-logo/sm-logo.png" alt="Logo" className="w-[60px] h-10" />
                </div>
                <span className="text-[25px]">{PROJECT_NAME}</span>
              </div>
            </div>
            <div className="flex w-full h-[50px]">
              <div className="flex flex-cols mb-1 items-center justify-center">
                <p className="text-[15px] h-[25px] text-cyan-300">
                  {currentTime}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Section */}
        <div className="flex items-center gap-4 mr-[50px] text-white">
          <p className="text-[20px] w-[180px] overflow-hidden text-ellipsis whitespace-nowrap text-center">{authData.userInfo?.username || "User"}</p>
          <NotificationBell 
            notificationCount={notificationCount}
            onNotificationClick={handleNotificationClick}
            onClearAllNotifications={handleClearAllNotifications}
          />
          <div className="relative">
            <div className="flex justify-center items-center bg-linear-to-b from-[#0CFCEE] to-[#0B23FC] p-0.5 rounded-full">
              <img 
                ref={imgRef}
                src={
                  authData.userInfo?.image_url ? `${CENTER_FILE_URL}${authData.userInfo?.image_url}` : User
                } 
                alt="User" 
                className="w-11 h-11 bg-black rounded-full overflow-hidden" 
                onClick={handleButtonClick}
              />
            </div>
            {
              dropdownVisible && (
                <div
                  className="flex items-center justify-center absolute right-0 mt-1 w-[130px] bg-linear-to-b from-[#0CFCEE] to-[#0B23FC] rounded-[5px] p-0.5 shadow-lg z-51"
                  ref={dropdownRef}
                >
                  <div className="bg-black w-full h-full rounded-[5px]">
                    <ul className="py-1">
                      <li
                        className={`px-4 py-1 hover:bg-[#CBD3D9] hover:text-black cursor-pointer text-sm text-white text-center`}
                        onClick={handleProfileClick}
                      >
                        {t('menu.profile')}
                      </li>
                      <div className="border-b border-[#2B9BED] mx-2"></div>
                      <li
                        className={`px-4 py-1 hover:bg-[#CBD3D9] hover:text-black cursor-pointer text-sm text-white text-center`}
                        onClick={handleLogoutClick}
                      >
                        {t('menu.logout')}
                      </li>
                    </ul>
                  </div>
                </div>
              )
            }
          </div>
          <div className="grid grid-cols-[20px_auto] border border-white rounded-[5px] py-[3px] px-3">
            <span className="mr-[5px]">
              {
                (() => {
                  switch (languageSelected) {
                    case 'th':
                      return <Th />;
                    case 'en':
                      return <Gb />;
                    default:
                      return <Th />;
                  }
                })()
              }
            </span>
            <select 
              className="bg-transparent text-[12px] text-center focus:outline-none focus:ring-0" 
              value={languageSelected} 
              onChange={handleLanguageChange}
            >
              <option className="text-black" value="th">Thai</option>
              <option className="text-black" value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* side nav */}
      <div className={`fixed h-[70vh] w-20 bg-black mt-8 border-2 border-[#2B9BED] rounded-xl px-2 py-12 transition-transform duration-300
        ${isOpen ? "translate-x-0 translate-y-1 left-3" : "-translate-x-full translate-y-1 left-0"}
        `}>
        <div className="absolute top-3 left-0 w-full flex justify-center">
          {sidePosition !== 0 && (
            <RiArrowUpSFill
              className="text-white cursor-pointer w-[2.5em] h-[2.5em]"
              onClick={handleSlideUp}
            />
          )}
        </div>
        <div className="overflow-hidden h-[58vh]">
          <div
            style={{ transform: `translateY(${sidePosition}px)` }}
            className="flex flex-col gap-2 transition-transform duration-300 ease-out"
          >
            {/* {navItems.map((item, index) => (
              <div key={index}>
                {item.label === "bar-chart" ? (
                  <div className="flex flex-col gap-2">
                    <div onClick={() => setBarChartOpen((prev) => !prev)}>
                      <MenuIcon
                        iconUrl={`/icons/${item.icon}.png`}
                        menuName={item.label}
                        isActive={barChartOpen}
                        isSubMenu={false}
                      />
                    </div>

                    {barChartOpen && (
                      <>
                        <div className="w-full h-[3px] bg-[#2B9BED]" />
                        <div className="flex flex-col gap-2">
                          {item.subPath?.map((subItem, subIndex) => (
                            <NavLink 
                              key={subIndex} 
                              to={subItem.path ?? "#"}
                            >
                              {({ isActive }) => {
                                if (isActive) {
                                  setBarChartOpen(true);
                                }
                                return (
                                  <MenuIcon
                                    iconUrl={ `/icons/${subItem.icon}${isActive ? "-active" : ""}.png`}
                                    menuName={subItem.label}
                                    isActive={isActive}
                                    isSubMenu={true}
                                  />
                                );
                              }}
                            </NavLink>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <NavLink 
                    key={index} 
                    to={item.path ?? "#"}
                    onClick={() => {
                      setBarChartOpen(false);
                    }}
                  >
                    {({ isActive }) => {
                      {
                        const isInBarChartSubPath = barChartOpen && 
                          item.subPath?.some(subItem => 
                            window.location.pathname === subItem.path
                          );
                        
                        return (
                          <div onClick={() => {
                            setBarChartOpen(false);
                          }}>
                            <MenuIcon
                              iconUrl={`/icons/${item.icon}${isActive ? "-active" : ""}.png`}
                              menuName={item.label}
                              isActive={isActive && !isInBarChartSubPath}
                              isSubMenu={false}
                            />
                          </div>
                        );
                      }
                    }}
                  </NavLink>
                )}
              </div>
            ))} */}
            {navItems.map((item, index) => (
              <div key={index}>
                <NavLink 
                  key={index} 
                  to={item.path ?? "#"}
                >
                  {({ isActive }) => {
                    {
                      return (
                        <div onClick={() => {
                          setBarChartOpen(false);
                        }}>
                          <MenuIcon
                            iconUrl={`/icons/${item.icon}${isActive ? "-active" : ""}.png`}
                            menuName={item.label}
                            isActive={isActive}
                            isSubMenu={false}
                          />
                        </div>
                      );
                    }
                  }}
                </NavLink>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 pb-3 w-full flex justify-center bg-black rounded-b-[10px]">
          {/* {sidePosition !== -400 && (
            <RiArrowDownSFill
              className="text-white cursor-pointer w-[2.5em] h-[2.5em]"
              onClick={handleSlideDown}
            />
          )} */}
          {sidePosition !== -100 && (
            <RiArrowDownSFill
              className="text-white cursor-pointer w-[2.5em] h-[2.5em]"
              onClick={handleSlideDown}
            />
          )}
        </div>
      </div>
      <div className="fixed items-center justify-center bg-black bottom-5 left-5">
        <p>{`Ver ${version}`}</p>
      </div>
    </nav>
  );
}

export default Nav;
