// Types
import { Region} from "../dropdown/dropdownTypes";
import { RealTimeLprData, Pagination } from "../types";

export interface FilterRealTimeBody {
  checkpointId: number
  checkpointName: string
}

export interface RealTimeLprDataResponse {
  message?: string
  status?: string
  success?: string
  countAll?: number
  filteredCount?: number
  data?: RealTimeLprData[]
}

export interface PlateSearchResponse {
  message?: string
  status?: string
  success?: string
  countAll?: number
  filteredCount?: number
  data?: PlateSearch[]
}

export interface PlateSearch {
  id: number
  isCompare?: boolean
  plateGroupNumber: string
  plateCharacter: string
  plateProvince: string
  plateProvinceId: number
  plate: string
  vehicleImage: string
  plateImage: string
  vehicleRouteList: VehicleRoute[]
  dateTimeRange: string
  vehicleMake: string
  vehicleMakeId: number
  vehicleColor: string
  vehicleColorId: number
  vehicleType: string
  vehicleModel: string
  ownerName: string
  ownerNationalId: string
  ownerAddress: string
  ownershipName: string
  ownershipNationalId: string
  ownershipAddress: string
  remark: string
}

export interface VehicleRoute {
  id: number
  vehicleRoute: string
  dateTime: string
  lat: string
  lon: string
  order?: number
}

export interface FileData {
  title: string
  url: string
}

export interface SuspectPersonSearch {
  id: number
  prefix: string
  name: string
  nationalId: string
  imagesData: FileData[]
  startDate: string
  endDate: string
  department: string
  departmentId: number
  area: string
  areaId: number
  province: string
  provinceId: number
  station: string
  stationId: number
  checkpoints: FilterRealTimeBody[]
  percentConfidence: number
  dateTimeRange: string
  remark: string
  person_class_id: number
}

export interface VehicleModelDetail {
  id: number;
  make_id: number;
  make_name: string;
  model: string;
  model_en: string;
  model_th: string;
  visible: number;
  active: number;
}

export interface VehicleMakeDetail {
  id: number;
  make_id: number;
  make_en: string;
  make_th: string;
  visible: number;
  active: number;
}

export interface VehicleColorDetail {
  id: number;
  color_id: number;
  color_en: string;
  color_th: string;
  visible: number;
  active: number;
}

export interface VehicleBodyTypeDetail {
  id: number;
  body_type: number;
  body_type_en: string;
  body_type_th: string;
  details: string;
  visible: number;
  active: number;
}

export interface CheckpointInfo {
  checkpoint_name: string;
}

export interface SearchPlateCondition {
  id: string;
  ref_id: string;
  camera_uid: string;
  camera_name: string;
  plate: string;
  plate_prefix: string;
  plate_number: string;
  region_code: string;
  region: Region;
  epoch_end: string;
  overview_image: string;
  vehicle_image: string;
  plate_image: string;
  remark: string;
  vehicle_make: string;
  vehicle_make_details: VehicleMakeDetail;
  vehicle_model: string;
  vehicle_model_details: VehicleModelDetail;
  vehicle_color: string;
  vehicle_color_details: VehicleColorDetail;
  vehicle_body_type: string;
  vehicle_body_type_details: VehicleBodyTypeDetail;
  ownerName: string;
  ownerNationalId: string;
  ownerAddress: string;
  ownershipName: string;
  ownershipNationalId: string;
  ownershipAddress: string;
  is_special_plate: number,
  special_plate_id: number | null,
  checkpoint: CheckpointInfo;
  plate_class_en: string;
  plate_class_th: string;
  behavior: string,
  isBlackList?: boolean,
  special_plate_name?: string;
  plateRoute?: PlateRoute[];
  currentRoute?: Route;
  province?: string;
  district?: string;
  subDistrict?: string;
}

export interface SearchPlateConditionResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: SearchPlateCondition[];
}

export interface Route {
  epoch_end: string;
  camera_name: string;
  latitude: string;
  longitude: string;
  checkpoint_name: string;
}

export interface PlateRoute {
  plate: string;
  region_code: string;
  routes: Route[];
}

export interface PlateRouteResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: PlateRoute[];
}