import { Pagination } from "../types";

export interface Station {
  id: number;
  name: string;
  provinceId: number;
  lat: number;
  lon: number;
}

export interface StationResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: Station[]
}

export interface Provinces
{
  id: number
  country_id: number
  province_code: string
  police_region_id: number,
  name_th: string
  name_en: string
  remark: string | null
  createdAt: string
  updatedAt: string
}

export interface ProvincesResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: Provinces[]
}

export interface Area {
  id: number;
  name: string;
  region: string;
}

export interface AreaResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: Area[]
}

export interface VehicleMakesResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: VehicleMake[]
}

export interface VehicleMake
{
  id: number
  make: string
  make_en: string
  make_th?: string
  visible?: boolean
  active?: boolean
}

export interface VehicleColorsResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: VehicleColor[]
}

export interface VehicleColor
{
  id: number
  color: string
  color_en?: string
  color_th: string
  visible?: boolean
  active?: boolean
}

export interface DepartmentResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: Department[]
}

export interface Department
{
  id: number
  department: string
  visible?: boolean
  active?: boolean
}

export interface OfficerPositionsResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: OfficerPositions[]
}

export interface OfficerPositions {
  id: number
  position_th: string
  position_en: string
  active: number
}

export interface UserRoleResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: UserRole[]
}

export interface UserRole {
  id: number
  user_role: string
  active: number
}

export interface StatusResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: Status[]
}

export interface Status {
  id: number
  status: string
  active: number
}

export interface PrefixResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: Prefix[]
}

export interface Prefix {
  id: number
  group: string
  title_en: string
  title_th: string
  title_abbr_en: string
  title_abbr_th: string
  visible: number
  active: number
}

export interface PlateTypesResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: PlateTypes[]
}

export interface PlateTypes {
  id: number
  title_en: string
  title_th: string
  visible: number
  active: number
}

export interface PersonResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: PersonTypes[]
}

export interface PersonTypes {
  id: number
  title_en: string
  title_th: string
  visible: number
  active: number
}

export interface DistrictsResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: Districts[]
}

export interface Districts {
  id: number
  province_id: number
  name_th: string
  name_en: string
  district_code: string
  zipcode: string
  remark: string | null
  createdAt: string
  updatedAt: string
}

export interface SubDistrictsResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: SubDistricts[]
}

export interface SubDistricts {
  id: number
  province_id: number
  district_id: number
  name_th: string
  name_en: string
  subdistrict_code: string
  zipcode: string
  remark: string | null
  createdAt: string
  updatedAt: string
}

export interface Camera {
  id: number;
  name: string;
  lat: number;
  lon: number;
}

export interface CameraResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: Camera[]
}

export interface RegionResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: Region[]
}

export interface Region {
  id: string;
  region_code: string;
  name_en: string;
  name_th: string;
  remark: string | null;
}

export interface GeoRegion {
  id: number;
  region_code: string;
  region_en: string;
  region_th: string;
  visible: number;
  active: number;
}

export interface GeoRegionResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: GeoRegion[]
}

export interface UserGroupResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: UserGroup[]
}

export interface Permissions {
  center: CenterPermissions;
  checkpoint: CheckpointPermissions;
}

export interface PermissionDetail {
  select: boolean;
}

export interface CenterPermissions {
  realtime: PermissionDetail;
  conditionSearch: PermissionDetail;
  // beforeAfterSearch: PermissionDetail;
  // suspiciousPersonManage: PermissionDetail;
  // suspiciousPersonSearch: PermissionDetail;
  specialPlateManage: PermissionDetail;
  // specialPlateSearch: PermissionDetail;
  // executiveReport: PermissionDetail;
  manageUser: PermissionDetail;
  setting: PermissionDetail;
  manageCheckpointCameras: PermissionDetail;
}

export type CenterPermissionKey = keyof CenterPermissions;

export interface CheckpointPermissions {
  realtime: PermissionDetail;
  suspiciousPersonManage: PermissionDetail;
  suspiciousPersonSearch: PermissionDetail;
  specialPlateManage: PermissionDetail;
  specialPlateSearch: PermissionDetail;
}

export type CheckpointPermissionsKey = keyof CheckpointPermissions;

export interface UserGroup {
  id: number;
  group_name: string;
  description: string;
  permissions: Permissions;
  visible: boolean;
  active: boolean;
}

export interface PoliceStationResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: PoliceStation[]
}

export interface PoliceStation {
  id: number;
  province_id: number;
  district_id: number | null;
  province_name: string;
  station_name: string;
  address: string | null;
  phone: string | null;
  fax: string | null;
  visible: boolean;
  active: boolean;
  notes: string | null;
}

export interface StreamEncode {
  id: number
  encode_name: string
  gstreamer_format: string
  visible: number
  active: number
  created_at: string
  updated_at: string
}

export interface StreamEncodeResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: StreamEncode[]
}

export interface VehicleBodyTypeResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: VehicleBodyType[]
}

export interface VehicleBodyType {
  id: number
  body_type: string
  body_type_en: string
  body_type_th: string
  details: string
  visible: number
  active: number
}

export interface VehicleModelResponse {
  statusCode: number;
  status: string;
  success: boolean;
  message: string;
  pagination: Pagination;
  data: VehicleModel[]
}

export interface VehicleModel {
  id: number
  make_id: number
  make_name: string
  model: string
  model_en: string
  model_th: string
  visible: number
  active: number
}