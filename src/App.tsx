import './App.css';
import { Outlet, Route, Routes, useNavigate } from "react-router-dom";
import Nav from "./layout/nav";
import "./styles/Main.scss";
import { useRef, useEffect } from "react";
import { useAppDispatch } from './app/hooks';
import { useSelector } from "react-redux";
import { RootState } from "./app/store";
// import { RootState } from "./app/store";
// import { useSelector } from "react-redux";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import dayjs from 'dayjs';

// Screen
import Login from './modules/login/Login';
import RealTimeMonitor from './modules/real-time-monitor/RealTimeMonitor';
import SearchPlateWithCondition from './modules/search-plate-with-condition/SearchPlateWithCondition';
// import SearchPlateBeforeAfter from './modules/search-plate-before-after/SearchPlateBeforeAfter';
// import SearchSuspectPerson from './modules/search-suspect-person/SearchSuspectPerson';
import ManageUser from './modules/manage-user/ManageUser';
import AddEditUser from './modules/add-edit-user/AddEditUser';
import SpecialPlateScreen from './modules/special-plate/SpecialPlate';
import UserInfo from './modules/user-info/UserInfo';
import Setting from './modules/setting/Setting';
// import SuspectPeople from './modules/suspect-people/SuspectPeople';
// import ManageLog from './modules/manage-log/ManageLog';
// import UsageStatisticsGraph from './modules/usage-statistics-graph/UsageStatisticsGraph';
// import EndUser from './modules/end-user/EndUser';
// import CameraInstallationPoints from './modules/camera-installation-points/CameraInstallationPoints';
// import CameraStatus from './modules/camera-status/CameraStatus';
// import ManageCheckpointCameras from './modules/manage-checkpoint-cameras/ManageCheckpointCameras';

// API
import { clearError } from './features/auth/authSlice';
import { 
  fetchAreasThunk,
  fetchProvincesThunk,
  fetchStationsThunk,
  fetchVehicleColorsThunk,
  fetchVehicleMakesThunk,
  fetchDepartmentsThunk,
  fetchOfficerPositionsThunk,
  fetchPrefixThunk,
  fetchStatusThunk,
  fetchPersonTypesThunk,
  fetchPlateTypesThunk,
  fetchRegionsThunk,
  fetchUserGroupsThunk,
  fetchGeoRegionsThunk,
  fetchStreamEncodesThunk,
  fetchVehicleBodyTypesThunk,
  fetchVehicleModelThunk,
  fetchCheckpointsThunk,
} from './features/dropdown/dropdownSlice';
import {
  fetchSpecialPlatesThunk,
} from "./features/special-plate/specialPlateSlice";
import {
  upsertRealtimeData,
  addToastMessage,
} from './features/realtime-data/realtimeDataSlice';
import { addListNotification, NotificationType, removeNotification } from "./features/notification/notificationSlice";

// Components
import AuthListener from './components/auth-listener/AuthListener';
import ProtectedRoute from './components/protected-route/ProtectedRoute';
import CameraStatusPopup from './components/camera-status-popup/CameraStatusPopup';

// Config
import { getUrls } from './config/runtimeConfig';

// utils
import { getPlateTypeColor } from './utils/commonFunction'
import { toastChannel } from "./utils/channel";
import { useSse } from "./utils/useSse";
import { createNotificationToast } from "./utils/notification";
import { fetchClient, combineURL } from "./utils/fetchClient";
// Types
import { SpecialPlate, EventNotifyResponse, EventNotify } from "./features/types";

const PrivateRouteWrapper = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { CENTER_SERVER_SENT_EVENTS_URL, CENTER_SERVER_SENT_EVENTS_TOKEN, CENTER_API } = getUrls();

  const { authData } = useSelector((state: RootState) => state.auth);

  const sliceSpecialPlate = useSelector((state: RootState) => state.specialPlateData);
  const sliceDropdown = useSelector((state: RootState) => state.dropdownData);
  
  toastChannel.onmessage = ({data}) => {
    const { id, toastId, messageId, action, data: updatedData } = data;
    if (action === "closeCameraStatusAlert" && toastId) {
      toast.update(toastId, {
        render: (props) => <CameraStatusPopup {...props} data={updatedData} />,
        autoClose: 3000,
        progressClassName: "success-progress-bar",
        containerId: "notification-list-toast",
        toastId: id,
        hideProgressBar: false,
        theme: updatedData.theme,
        style: updatedData.style,
      });
    }
    if (action === "clear-all") {
      dispatch(addListNotification([]));
      return;
    }
    dispatch(removeNotification(messageId));
  };

  useEffect(() => {
    dispatch(clearError())
    if (authData && !authData.token) {
      navigate('/login', { replace: true })
    }
    else {
      dispatch(fetchAreasThunk());
      dispatch(fetchProvincesThunk(
        {
          orderBy: "name_th.asc",
          limit: "100"
        }
      ));
      dispatch(fetchStationsThunk());
      dispatch(fetchVehicleColorsThunk(
        {
          orderBy: "id.asc",
          limit: "500"
        }
      ));
      dispatch(fetchVehicleMakesThunk(
        {
          orderBy: "id.asc",
          limit: "500"
        }
      ));
      dispatch(fetchVehicleBodyTypesThunk(
        {
          orderBy: "id.asc",
          limit: "500"
        }
      ));
      dispatch(fetchVehicleModelThunk(
        {
          orderBy: "id.asc",
          limit: "500"
        }
      ));
      dispatch(fetchDepartmentsThunk());
      dispatch(fetchOfficerPositionsThunk());
      dispatch(fetchPrefixThunk(
        {
          orderBy: "title_group.asc, title_th.asc",
          limit: "100"
        }
      ));
      dispatch(fetchStatusThunk());
      dispatch(fetchPersonTypesThunk());
      dispatch(fetchPlateTypesThunk());
      dispatch(fetchRegionsThunk(
        {
          orderBy: "name_th.asc",
          limit: "100"
        }
      ));
      dispatch(fetchGeoRegionsThunk(
        {
          orderBy: "id.asc",
          limit: "100"
        }
      ));
      dispatch(fetchUserGroupsThunk(
        {
          orderBy: "id.asc",
          limit: "100"
        }
      ));
      dispatch(fetchSpecialPlatesThunk(
        {
          filter: "deleted=0",
          limit: "1000"
        }
      ));
      dispatch(fetchStreamEncodesThunk());
      dispatch(fetchCheckpointsThunk({
        limit: "100"
      }));
      fetchNotification();
    }
  }, [dispatch, navigate, authData]);

  useEffect(() => {
    const bc = new BroadcastChannel("specialPlateChannel");
    bc.onmessage = (event) => {
      if (event.data === "reload") {
        dispatch(fetchSpecialPlatesThunk({ filter: "deleted=0", limit: "1000" }));
      }
    };
    return () => bc.close();
  }, [dispatch]);

  const createCameraNotification = async (cameraData: any) => {
    const isOnline = cameraData.current_status.toString().toLowerCase() === "online" ? true : false;
    const type: NotificationType = isOnline
      ? "cameraOnline"
      : "cameraOffline"

    createNotificationToast({
      dispatch,
      component: CameraStatusPopup,
      theme: "dark",
      type,
      title: isOnline ? "alert.camera-online" : "alert.camera-offline",
      content: isOnline
        ? [cameraData.camera_name, cameraData.camera_ip]
        : [
            "alert.camera-offline-content-2",
            cameraData.camera_name,
            cameraData.camera_ip,
          ],
      isOnline,
      messageId: `${cameraData.event_id}_${cameraData.timestamp}`,
      style: { 
        minHeight: isOnline ? "220px" : "250px",
        maxHeight: isOnline ? "220px" : "250px",
      },
      closeAction: "closeCameraStatusAlert",
      id: cameraData.event_id
    });
  };

  const handleRealtimeMessage = async (message: any) => {   
    dispatch(upsertRealtimeData(message));

    const specialPlateData = await checkSpecialPlate(message.plate_prefix, message.plate_number, message.region_code);
    
    if (!specialPlateData) return;
    
    const { backgroundColor, title, pinBackgroundColor, showAlert, textShadow } = await getPlateTypeColor(specialPlateData.plate_class_id);
    
    if (!showAlert) return; 

    const updatedData = {
      ...message,
      plate_class_name: getPlateClassName(specialPlateData.plate_class_id),
      special_plate_remark: specialPlateData.behavior,
      special_plate_owner_name: specialPlateData.case_owner_name,
      special_plate_owner_agency: specialPlateData.case_owner_agency,
      title_name: title,
      color: backgroundColor,
      pin_background_color: pinBackgroundColor,
      text_shadow: textShadow,
    }
    dispatch(addToastMessage(updatedData));
  };

  const checkSpecialPlate = (platePrefix: string, plateNumber: string, region: string): SpecialPlate | undefined => {
    const specialPlate = sliceSpecialPlate.specialPlates?.data.find(sp => sp.plate_prefix === platePrefix && sp.plate_number === plateNumber && sp.region_code === region && sp.deleted === 0 && sp.active === 1);
    return specialPlate
  };

  const getPlateClassName = (classId: number) => {
    const plateType = sliceDropdown.plateTypes?.data.find(type => type.id === classId);
    return plateType?.title_en || "-";
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
            theme: "dark" as "dark",
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
            closeAction: "closeCameraStatusAlert",
            style: { 
              minHeight: isOnline ? "220px" : "250px",
              maxHeight: isOnline ? "220px" : "250px",
            },
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

  {
    authData.token && 
    useSse(
      CENTER_SERVER_SENT_EVENTS_URL,
      CENTER_SERVER_SENT_EVENTS_TOKEN,
      "lpr_data_event",
      handleRealtimeMessage,
    );
  }

  {
    authData.token && 
    useSse(
      CENTER_SERVER_SENT_EVENTS_URL,
      CENTER_SERVER_SENT_EVENTS_TOKEN,
      "camera_status_event",
      createCameraNotification,
      false
    );
  }

  return <>{children}</>;
}

function Layout() {
  return (
    <>
      <ToastContainer 
        containerId="notification-list-toast"
        position="top-right"
        newestOnTop={true}
        style={{ 
          top: '70px', 
          right: '10px',
          width: '400px',
          minHeight: '90vh',
          maxHeight: '90vh',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
        closeButton={true}
        pauseOnFocusLoss={false}
      />
      <Nav />
      <Outlet />
    </>
  )
}

function App() {
  const constraintsRef = useRef<HTMLDivElement>(null)
  const { authData } = useSelector((state: RootState) => state.auth);
  
  return (
    <div ref={constraintsRef} className='min-h-screen min-w-screen'>
      <AuthListener />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
          <PrivateRouteWrapper>
            <Layout />
          </PrivateRouteWrapper>
          }
        >
          <Route path='center/real-time-monitor' element={
            <ProtectedRoute 
              permission={authData?.userInfo?.permissions
              ? authData.userInfo.permissions.center.realtime.select
              : true
              }
            >
              <RealTimeMonitor />
            </ProtectedRoute>
          } />
          <Route path='center/search-plate-with-condition' element={
            <ProtectedRoute 
              permission={authData?.userInfo?.permissions
                ? authData.userInfo.permissions.center.conditionSearch.select
                : undefined
              }
            >
              <SearchPlateWithCondition />
            </ProtectedRoute>
          }></Route>
          <Route path='center/manage-user' element={
            <ProtectedRoute 
              permission={authData?.userInfo?.permissions
                ? authData.userInfo.permissions.center.manageUser.select
                : undefined
              }
            >
              <ManageUser />
            </ProtectedRoute>
          }></Route>
          <Route path='center/special-plate' element={
            <ProtectedRoute 
              permission={authData?.userInfo?.permissions
                ? authData.userInfo.permissions.center.specialPlateManage.select
                : undefined
              }
            >
              <SpecialPlateScreen />
            </ProtectedRoute>
          }></Route>
          <Route path='center/manage-user/add-edit-user' element={
            <ProtectedRoute 
              permission={authData?.userInfo?.permissions
                ? authData.userInfo.permissions.center.manageUser.select
                : undefined
              }
            >
              <AddEditUser />
            </ProtectedRoute>
          }></Route>
          <Route path='center/user-info' element={
            <UserInfo />
          }></Route>
          <Route path='center/setting' element={
            <ProtectedRoute 
              permission={authData?.userInfo?.permissions
                ? authData.userInfo.permissions.center.setting.select
                : undefined
              }
            >
              <Setting />
            </ProtectedRoute>
          }></Route>
          {/* <Route path='center/chart/log' element={<ManageLog />}></Route>
          <Route path='center/chart/graph' element={<UsageStatisticsGraph />}></Route>
          <Route path='center/chart/end-user' element={<EndUser />}></Route>
          <Route path='center/chart/camera-installation-points' element={<CameraInstallationPoints />}></Route>
          <Route path='center/chart/camera-status' element={<CameraStatus />}></Route> */}
        </Route>
      </Routes>
    </div>
  )
}

export default App
