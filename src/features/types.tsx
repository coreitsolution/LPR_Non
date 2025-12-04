import { Map as LeafletMap, LatLngExpression } from 'leaflet';

// Types
import { CenterPermissions } from "./dropdown/dropdownTypes";
import { Mask } from "../components/drawing-canvas/types";

export interface MapConfig {
  mapId: string
  center: {
    lat: number
    lng: number
  }
  zoom: number
  panControl?: boolean
  zoomControl?: boolean
  mapTypeControl?: boolean
  streetViewControl?: boolean
  fullscreenControl?: boolean
}

export interface MapProps {
  height?: string
  width?: string
  panControl?: boolean
  zoomControl?: boolean
  mapTypeControl?: boolean
  streetViewControl?: boolean
  fullscreenControl?: boolean
  currentLocation?: boolean
  onMapLoad?: (mapInstance: LeafletMap | null) => void
}

export interface RealTimeLprData {
  id: number;
  camera_id: number;
  camera_uid: string;
  checkpoint_id: string;
  checkpoint_name: string;
  camera_name: string;
  organization: string;
  country: string;
  epoch_end: string;
  epoch_start: string;
  gps_latitude: string;
  gps_longitude: string;
  lane: string;
  overview_image: string;
  overview_image_height: number;
  overview_image_width: number;
  plate: string;
  plate_confidence: string;
  plate_image: string;
  plate_number: string;
  plate_prefix: string;
  plate_x1: number;
  plate_x2: number;
  plate_x3: number;
  plate_x4: number;
  plate_y1: number;
  plate_y2: number;
  plate_y3: number;
  plate_y4: number;
  region_code: string;
  region_confidence: string;
  source_image_height: number;
  source_image_width: number;
  travel_direction: number;
  user_data: string;
  vehicle_body_type: string;
  vehicle_body_type_confidence: string;
  vehicle_color: string;
  vehicle_color_confidence: string;
  vehicle_image: string;
  vehicle_make: string;
  vehicle_make_confidence: string;
  vehicle_model: string;
  vehicle_model_confidence: string;
  vehicle_region_height: number;
  vehicle_region_width: number;
  vehicle_region_x: number;
  vehicle_region_y: number;
  is_special_plate: number;
  special_plate_id: number | null;
  plate_class: number | null;
  plate_class_name: string;
  special_plate_remark: string;
  special_plate_owner_name: string;
  special_plate_owner_agency: string;
  camera_latitude: string;
  camera_longitude: string;
  title_name: string;
  color: string;
  pin_background_color: string;
  text_shadow: string;
}

export interface RealTimeLprDataResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: RealTimeLprData[];
}

export interface MapPosition {
  lat: number;
  lng: number;
}

export interface DirectionDetail {
  color?: string;
  direction: string;
  dateTime: string;
}

export interface SearchResult {
  name: string
  location: LatLngExpression
  placeId?: string
}

export interface DeleteRequestData {
  url: string
}

export interface UserResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: User[];
}

export interface User {
  id: number
  idcard: string;
  tokens: string;
  is_logged_in: boolean;
  visible: boolean;
  last_login: string;
  created_at: string;
  updated_at: string;
  title_id: number
  firstname: string
  lastname: string
  email: string
  phone: string
  job_position: string
  agency: string
  permissions: UserPermission
  status: string
  image_url: string
  user_group_id: number
  username: string
  password: string
  dob: Date | null
  uid: string
  checkpoint_uid: string
}

export interface UserPermission {
  userRoleId: number
  userRole: string
  center: CenterPermissions
}

export interface FileDataResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: FileDataDetail[];
}

export interface FileDataDetail {
  created_at: string;
  id: number;
  notes: string | null;
  special_plate_id: number;
  title: string;
  updated_at: string;
  url: string;
}

export interface SpecialPlateResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: SpecialPlate[];
}

export interface SpecialPlateCreateResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: SpecialPlate;
}

export interface SpecialPlateFilesResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: SpecialPlateFileData[];
}

export interface SpecialPlate {
  id: number;
  plate_prefix: string;
  plate_number: string;
  region_code: string;
  plate_class_id: number;
  case_number: string;
  arrest_warrant_date: string;
  arrest_warrant_expire_date: string
  behavior: string;
  case_owner_name: string;
  case_owner_agency: string;
  case_owner_phone: string;
  visible: number;
  active: number;
  deleted: number;
  deleted_by_id: number;
  created_at: string;
  updated_at: string;
  imagesData?: FileDataDetail[];
  filesData?: FileDataDetail[];
}

export interface SpecialPlateFileData {
  id: number;
  special_plate_id: number;
  title: string;
  url: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export type SpecialPlateFile = Omit<SpecialPlateFileData, "id">;

export interface FileUploadResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: FileUpload[];
}

export interface UploadFileData {
  id: number;
  special_plate_id: number;
  title: string;
  url: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface SuspectPeople {
  id: number
  title_id: number
  firstname: string
  lastname: string
  idcard_number: string
  address: string
  province_id: number
  district_id: number
  subdistrict_id: number
  zipcode: string
  person_class_id: number
  case_number: string
  arrest_warrant_date: string
  arrest_warrant_expire_date: string
  behavior: string
  case_owner_name: string
  case_owner_agency: string
  case_owner_phone: string
  watchlist_images: FileRespondsData[]
  watchlist_files: FileRespondsData[]
  visible: number
  active: number
  notes: string
  createdAt?: string,
  updatedAt?: string,
}

export interface FileData {
  id: number
  title: string
  url: string
  created_at?: string
}

export interface FileMapDataResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: FileData[];
}

export interface FileRespondsData {
  createdAt: string;
  id: number;
  notes: string | null;
  special_plate_id: number;
  title: string;
  updatedAt: string;
  url: string;
}

export interface Log {
  id: number
  titleId: number
  title: string
  userId: number
  userName: string
  name: string
  lastname: string
  nationId: string
  checkpointId: number
  checkpointName: string
  lat: string
  lng: string
  actionId: number
  action: string
  detail: string
  actionDateTime: string
  searchDateTimeRange: string
}

export interface CheckpointOnMap {
  cameraUid: string,
  location: {
    lat: number
    lng: number
  }, 
  color?: string, 
  bgColor?: string, 
  isLocationWithLabel?: boolean,
  isSpecialLocation?: boolean,
  checkpointName?: string,
  detectTime?: string,
}

export interface FileUpload {
  filename: string
  originalName: string
  mimetype: string
  sizeMB: number
  title: string
  url: string 
  createdAt?: string;
}

export interface ImportSpecialPlates {
  id: number
  plate_group: string
  plate_number: string
  province: string
  plate_type: string
  case_number: string
  arrest_warrant_date: string
  arrest_warrant_expire_date: string
  behavior: string
  case_owner_name: string
  case_owner_agency: string
  case_owner_phone: string
  image: string
  file: string
  active: string
}

export interface ImportSpecialPlatesDetail {
  id: number
  plate_group: string
  plate_number: string
  region_code: string
  province?: string
  plate_class_id: number
  plate_type?: string
  case_number: string
  arrest_warrant_date: string
  arrest_warrant_expire_date: string
  behavior: string
  case_owner_name: string
  case_owner_agency: string
  case_owner_phone: string
  image: string
  file: string
  visible: number
  activeString?: string
  active: number
  imagesUploadedData?: FileUpload
  fileUploadedData?: FileUpload
  createdAt?: string
  updatedAt?: string
  cannotImport?: boolean
}

export interface Pagination {
  page: number;
  maxPage: number;
  limit: number;
  count: number;
  countAll: number;
}

export interface Option {
  label: string;
  value: number;
}

export interface StreamDetail {
  uid: string
  name: string
  streamUrl: string
  wsPort: string
  ffmpegOptions: FfmpegOptions
}

export interface FfmpegOptions {
  "-stats": string
  "-r": number
  "-vf": string
  "-preset": string
  "-tune": string
  "-reconnect": string
  "-reconnect_streamed": string
  "-reconnect_delay_max": string
}

export interface Checkpoint {
  id: number;
  checkpoint_uid: string;
  checkpoint_name: string;
  checkpoint_ip: string;
  organization: string;
  province_id: number;
  province_name?: string;
  district_id: number;
  district_name?: string;
  subdistrict_id: number;
  subdistrict_name?: string;
  police_station_id: number;
  police_station_name?: string;
  route: string;
  latitude: string;
  longitude: string;
  serial_number: string | null;
  license_key: string | null;
  officer_title_id: number;
  officer_firstname: string;
  officer_lastname: string;
  officer_position: string;
  officer_phone: string;
  visible: number;
  active: number;
  deleted: number;
  alive: number;
  last_online: string;
  last_check: string;
  created_at: string;
  updated_at: string;
}

export interface CheckpointResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: Checkpoint[];
}

export interface Camera {
  id: number
  camera_uid: string
  camera_name: string
  checkpoint_name: string
  organization: string
  camera_ip: string
  alpr_cam_id: number
  checkpoint_uid: string
  province_id: number
  district_id: number
  subdistrict_id: number
  route: string
  latitude: string
  longitude: string
  rtsp_live_url: string
  rtsp_process_url: string
  stream_encode_id: number
  api_server_url: string
  live_server_url: string
  live_stream_url: string
  serial_number: string | null
  license_key: string | null
  sample_image_url: string
  wsport: number
  detection_area: string
  streaming: number
  visible: number
  active: number
  deleted: number
  alive: number
  detection_count: number
  last_online: string
  last_check: string
  created_at: string
  updated_at: string
  request_delete: boolean
  request_delete_reason: string | null
}

export interface CameraResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: Camera[];
}

export interface NotificationList {
  id: number;
  camera_uid: string;
  camera_name: string;
  plate_number: string;
  plate_prefix: string;
  region_code: string;
  iconColor: string;
  bgColor: string;
  textShadow: string;
  isLocationWithLabel: boolean;
  isSpecialLocation: boolean;
  detectTime: string;
  camera_latitude: string;
  camera_longitude: string;
}

export interface CheckpointCamera {
  id: number;
  camera_name: string
  checkpoint_name: string
  latitude: string
  longitude: string
  active: number
  deleted: number
  reason: string
  created_at: string
  updated_at: string
}

export interface CameraNotify {
  camera_ip: string;
  timestamp: string;
  camera_uid: string;
  camera_name: string;
  current_status: string;
  previous_status: string;
}

export interface EventNotify {
  id: number;
  event: string;
  source: string;
  channel: string;
  data: CameraNotify;
  notify_status: string;
  event_timestamp: string;
  is_confirm: boolean;
}

export interface EventNotifyResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: EventNotify[];
}

export interface MaskResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  data: Mask[];
}