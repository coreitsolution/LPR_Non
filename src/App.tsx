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
import { useLocation } from 'react-router-dom';

// Screen
import Login from './modules/login/Login';
import RealTimeMonitor from './modules/real-time-monitor/RealTimeMonitor';
import SearchPlateWithCondition from './modules/search-plate-with-condition/SearchPlateWithCondition';
// import SearchPlateBeforeAfter from './modules/search-plate-before-after/SearchPlateBeforeAfter';
// import SearchSuspectPerson from './modules/search-suspect-person/SearchSuspectPerson';
import ManageUser from './modules/manage-user/ManageUser';
import AddEditUser from './modules/add-edit-user/AddEditUser';
// import SpecialPlateScreen from './modules/special-plate/SpecialPlate';
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
import { triggerCameraRefresh, triggerRequestDeleteCamera } from './features/refresh/refreshSlice';
import { removeNotification } from "./features/notification/notificationSlice";

// Components
import AuthListener from './components/auth-listener/AuthListener';
import UpdateAlertPopup from './components/update-alert-popup/UpdateAlertPopup';
import RequestDeleteCameraAlert from './components/request-delete-camera-alert/RequestDeleteCameraAlert';
import ProtectedRoute from './components/protected-route/ProtectedRoute';
import CameraStatusPopup from './components/camera-status-popup/CameraStatusPopup';

// Config
import { getUrls } from './config/runtimeConfig';

// utils
import { settingWebsocketService, kafkaWebsocketService } from './utils/websocketService';
import { getPlateTypeColor } from './utils/commonFunction'
import { toastChannel } from "./utils/channel";
import { createNotificationToast } from "./utils/notification";

// Types
import { Checkpoint, SpecialPlate } from "./features/types";

const PrivateRoute = ({ children }: { children: React.JSX.Element }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { authData } = useSelector((state: RootState) => state.auth);

  const sliceSpecialPlate = useSelector(
    (state: RootState) => state.specialPlateData
  )

  const sliceDropdown = useSelector(
    (state: RootState) => state.dropdownData
  )

  const { CENTER_KAFKA_URL, CENTER_SETTING_WEBSOCKET_URL, CENTER_SETTING_WEBSOCKET_TOKEN } = getUrls();

  const location = useLocation();

  toastChannel.onmessage = ({data}) => {
    const { id, action, data: updatedData } = data;
    if (action === "closeUpdateAlert" && id) {
      toast.update(id, {
        render: (props) => <UpdateAlertPopup {...props} data={updatedData} />,
        autoClose: 3000,
        progressClassName: "success-progress-bar",
        containerId: "notification-list-toast",
        toastId: id,
        hideProgressBar: false,
        theme: updatedData.theme,
        style: updatedData.style,
      });
    } else if (action === "closeRequestDeleteCameraAlert" && id) {
      toast.update(id, {
        render: (props) => <RequestDeleteCameraAlert {...props} data={updatedData} />,
        autoClose: 3000,
        progressClassName: "success-progress-bar",
        containerId: "notification-list-toast",
        toastId: id,
        hideProgressBar: false,
        theme: updatedData.theme,
        style: updatedData.style,
      });
    }
    else if (action === "closeCameraStatusAlert" && id) {
      toast.update(id, {
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
    dispatch(
      removeNotification(id)
    );
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

      // [
      // {
      //   id: 1,
      //   camera_name: "Front Door Camera",
      //   ip: "192.168.1.1",
      //   isOnline: true,
      // },
      // {
      //   id: 2,
      //   camera_name: "Back Door Camera",
      //   ip: "192.168.1.2",
      //   isOnline: false,
      // }
      // ].map(createCameraNotification);

      kafkaWebsocketService.connect(CENTER_KAFKA_URL);
      kafkaWebsocketService.subscribe("lpr-data", handleRealtimeMessage);
      kafkaWebsocketService.subscribe("checkpoint-data", handleCheckpointDataMessage);
      kafkaWebsocketService.subscribe("camera-data", handleCameraDataMessage);

      settingWebsocketService.connect(CENTER_SETTING_WEBSOCKET_URL, CENTER_SETTING_WEBSOCKET_TOKEN);

      settingWebsocketService.onMessage(listener);

      return () => {
        kafkaWebsocketService.unsubscribe("lpr-data", handleRealtimeMessage);
        kafkaWebsocketService.unsubscribe("checkpoint-data", handleCheckpointDataMessage);
        kafkaWebsocketService.unsubscribe("camera-data", handleCameraDataMessage);
      };
    }
  }, [dispatch, navigate, authData])

  useEffect(() => {
    const bc = new BroadcastChannel("specialPlateChannel");
    bc.onmessage = (event) => {
      if (event.data === "reload") {
        dispatch(fetchSpecialPlatesThunk({ filter: "deleted=0", limit: "1000" }));
      }
    };
    return () => bc.close();
  }, [dispatch]);

  // const createCameraNotification = (cameraData: any) => {
  //   const isOnline = cameraData.isOnline;
  //   createNotificationToast({
  //     dispatch,
  //     type: isOnline
  //       ? "cameraOnline"
  //       : "cameraOffline",
  //     component: CameraStatusPopup,
  //     theme: "dark",
  //     title: isOnline ? "alert.camera-online" : "alert.camera-offline",
  //     content: isOnline
  //       ? [cameraData.camera_name, cameraData.ip]
  //       : [
  //           "alert.camera-offline-content-2",
  //           cameraData.camera_name,
  //           cameraData.ip,
  //         ],
  //     isOnline,
  //     messageId: cameraData.id,
  //     style: { 
  //       minHeight: isOnline ? "220px" : "250px",
  //       maxHeight: isOnline ? "220px" : "250px",
  //     },
  //     closeAction: "closeCameraStatusAlert",
  //   });
  // };

  const handleRealtimeMessage = async (message: string) => {
    const data = JSON.parse(message);
    dispatch(upsertRealtimeData(JSON.parse(message)));

    const specialPlateData = await checkSpecialPlate(data.plate_prefix, data.plate_number, data.region_code);
    
    if (!specialPlateData) return;
    
    const { backgroundColor, title, pinBackgroundColor, showAlert } = await getPlateTypeColor(specialPlateData.plate_class_id);
    
    if (!showAlert) return; 

    const updatedData = {
      ...data,
      plate_class_name: getPlateClassName(specialPlateData.plate_class_id),
      special_plate_remark: specialPlateData.behavior,
      special_plate_owner_name: specialPlateData.case_owner_name,
      special_plate_owner_agency: specialPlateData.case_owner_agency,
      title_name: title,
      color: backgroundColor,
      pin_background_color: pinBackgroundColor,
    }
    dispatch(addToastMessage(updatedData));
  };

  const handleCheckpointDataMessage = (message: Checkpoint) => {
    createNotificationToast({
      dispatch,
      type: "newCheckpoint",
      component: UpdateAlertPopup,
      title: "alert.new-checkpoint-update",
      content: "alert.new-checkpoint-update-content",
      variables: { checkpointName: message.checkpoint_name || "-" },
      messageId: message.created_at,
      style: { minHeight: "108px", maxHeight: "108px" },
      updateAction: () => dispatch(triggerCameraRefresh()),
    });
  };

  const handleCameraDataMessage = (message: any) => {
    createNotificationToast({
      dispatch,
      type: "newCamera",
      component: UpdateAlertPopup,
      title: "alert.new-camera-update",
      content: "alert.new-camera-update-content",
      variables: { cameraName: message.camera_name || "-" },
      messageId: message.timestampUtc,
      style: { minHeight: "108px", maxHeight: "108px" },
      updateAction: () => dispatch(triggerCameraRefresh()),
    });
  };

  const listener = (message: any) => {
    if (message.event !== "delete-camera-request") return;

    const isUpdatePage = location.pathname.includes('/manage-checkpoint-cameras');

    createNotificationToast({
      dispatch,
      type: "requestDelete",
      component: RequestDeleteCameraAlert,
      theme: "light",
      content: "alert.request-delete-camera-content",
      variables: { number: message.data.all_request_count + 1 },
      messageId: message.timestampUtc,
      style: {
        paddingTop: "45px",
        minHeight: "161px",
        maxHeight: "161px",
      },
      updateAction: () => {
        if (isUpdatePage) dispatch(triggerRequestDeleteCamera());
        else navigate("/center/manage-checkpoint-cameras", { replace: true });
      },
      closeAction: "closeRequestDeleteCameraAlert",
    });
  };

  const checkSpecialPlate = (platePrefix: string, plateNumber: string, region: string): SpecialPlate | undefined => {
    const specialPlate = sliceSpecialPlate.specialPlates?.data.find(sp => sp.plate_prefix === platePrefix && sp.plate_number === plateNumber && sp.region_code === region && sp.deleted === 0 && sp.active === 1);
    return specialPlate
  };

  const getPlateClassName = (classId: number) => {
    const plateType = sliceDropdown.plateTypes?.data.find(type => type.id === classId);
    return plateType?.title_en || "-";
  }

  return children
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
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
          }
        >
          <Route path='center/real-time-monitor' element={
            <ProtectedRoute permission={authData?.userInfo?.permissions?.center?.realtime?.select ?? false}>
              <RealTimeMonitor />
            </ProtectedRoute>
          } />
          <Route path='center/search-plate-with-condition' element={
            <ProtectedRoute permission={authData?.userInfo?.permissions?.center?.conditionSearch?.select ?? false}>
              <SearchPlateWithCondition />
            </ProtectedRoute>
          }></Route>
          <Route path='center/manage-user' element={
            <ProtectedRoute permission={authData?.userInfo?.permissions?.center?.manageUser?.select ?? false}>
              <ManageUser />
            </ProtectedRoute>
          }></Route>
          {/* <Route path='center/special-plate' element={<SpecialPlateScreen />}></Route> */}
          <Route path='center/manage-user/add-edit-user' element={
            <ProtectedRoute permission={authData?.userInfo?.permissions?.center?.manageUser?.select ?? false}>
              <AddEditUser />
            </ProtectedRoute>
          }></Route>
          <Route path='center/user-info' element={
            <UserInfo />
          }></Route>
          <Route path='center/setting' element={
            <ProtectedRoute permission={authData?.userInfo?.permissions?.center?.setting?.select ?? false}>
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
