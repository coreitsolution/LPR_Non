import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Constants
import { Status } from "../../constants/statusEnum";

// API
import { 
  fetchCheckpoints,
  fetchStations,
  fetchProvinces,
  fetchAreas,
  fetchVehicleColors,
  fetchVehicleMakes,
  fetchDepartments,
  fetchOfficerPositions,
  fetchStatus,
  fetchPrefix,
  fetchPersonTypes,
  fetchPlateTypes,
  fetchDistricts,
  fetchSubDistricts,
  fetchCameras,
  fetchRegions,
  fetchUserGroups,
  fetchGeoRegions,
  fetchPoliceStations,
  fetchStreamEncodes,
  fetchVehicleBodyTypes,
  fetchVehicleModel,
} from "./dropdownApi";

// Types
import {
  StationResponse,
  ProvincesResponse,
  AreaResponse,
  VehicleColorsResponse,
  VehicleMakesResponse,
  DepartmentResponse,
  OfficerPositionsResponse,
  StatusResponse,
  PrefixResponse,
  PersonResponse,
  PlateTypesResponse,
  DistrictsResponse,
  SubDistrictsResponse,
  CameraResponse,
  RegionResponse,
  UserGroupResponse,
  GeoRegionResponse,
  PoliceStationResponse,
  StreamEncodeResponse,
  VehicleBodyTypeResponse,
  VehicleModelResponse,
} from "./dropdownTypes";
import {
  CheckpointResponse,
} from "../types";

interface DropdownState {
  checkpoints: CheckpointResponse | null;
  cameras: CameraResponse | null;
  stations: StationResponse | null;
  provinces: ProvincesResponse | null;
  districts: DistrictsResponse | null;
  subDistricts: SubDistrictsResponse | null;
  areas: AreaResponse | null;
  vehicleColors: VehicleColorsResponse | null;
  vehicleMakes: VehicleMakesResponse | null;
  vehicleBodyTypes: VehicleBodyTypeResponse | null;
  vehicleModel: VehicleModelResponse | null;
  departments: DepartmentResponse | null;
  positions: OfficerPositionsResponse | null;
  status: StatusResponse | null;
  prefix: PrefixResponse | null;
  personTypes: PersonResponse | null;
  plateTypes: PlateTypesResponse | null;
  regions: RegionResponse | null;
  userGroups: UserGroupResponse | null;
  geoRegions: GeoRegionResponse | null;
  policeStations: PoliceStationResponse | null;
  streamEncodes: StreamEncodeResponse | null;
  dropdownStatus: Status;
  dropdownError: string | null;
}

const initialState: DropdownState = {
  checkpoints: null,
  cameras: null,
  stations: null,
  provinces: null,
  districts: null,
  subDistricts: null,
  areas: null,
  vehicleColors: null,
  vehicleMakes: null,
  vehicleBodyTypes: null,
  vehicleModel: null,
  departments: null,
  positions: null,
  status: null,
  prefix: null,
  personTypes: null,
  plateTypes: null,
  regions: null,
  userGroups: null,
  geoRegions: null,
  policeStations: null,
  streamEncodes: null,
  dropdownStatus: Status.IDLE,
  dropdownError: null,
}

export const fetchCheckpointsThunk = createAsyncThunk(
  "dropdown/fetchCheckpoints",
  async (param?: Record<string, string>) => {
    const response = await fetchCheckpoints(param);
    return response;
  }
);

export const fetchCamerasThunk = createAsyncThunk(
  "dropdown/fetchCameras",
  async () => {
    const response = await fetchCameras();
    return response;
  }
);

export const fetchStationsThunk = createAsyncThunk(
  "dropdown/fetchStations",
  async () => {
    const response = await fetchStations();
    return response;
  }
);

export const fetchProvincesThunk = createAsyncThunk(
  "dropdown/fetchProvinces",
  async (param?: Record<string, string>) => {
    const response = await fetchProvinces(param);
    return response;
  }
);

export const fetchAreasThunk = createAsyncThunk(
  "dropdown/fetchAreas",
  async () => {
    const response = await fetchAreas();
    return response;
  }
);

export const fetchVehicleColorsThunk = createAsyncThunk(
  "dropdown/fetchVehicleColors",
  async (param?: Record<string, string>) => {
    const response = await fetchVehicleColors(param);
    return response;
  }
);

export const fetchVehicleMakesThunk = createAsyncThunk(
  "dropdown/fetchVehicleMakes",
  async (param?: Record<string, string>) => {
    const response = await fetchVehicleMakes(param);
    return response;
  }
);

export const fetchVehicleBodyTypesThunk = createAsyncThunk(
  "dropdown/fetchVehicleBodyTypes",
  async (param?: Record<string, string>) => {
    const response = await fetchVehicleBodyTypes(param);
    return response;
  }
);

export const fetchVehicleModelThunk = createAsyncThunk(
  "dropdown/fetchVehicleModel",
  async (param?: Record<string, string>) => {
    const response = await fetchVehicleModel(param);
    return response;
  }
);

export const fetchDepartmentsThunk = createAsyncThunk(
  "dropdown/fetchDepartments",
  async () => {
    const response = await fetchDepartments();
    return response;
  }
);

export const fetchOfficerPositionsThunk = createAsyncThunk(
  "dropdown/fetchOfficerPositions",
  async () => {
    const response = await fetchOfficerPositions();
    return response;
  }
);

export const fetchStatusThunk = createAsyncThunk(
  "dropdown/fetchStatus",
  async () => {
    const response = await fetchStatus();
    return response;
  }
);

export const fetchPrefixThunk = createAsyncThunk(
  "dropdown/fetchPrefix",
  async (param?: Record<string, string>) => {
    const response = await fetchPrefix(param);
    return response;
  }
);

export const fetchPersonTypesThunk = createAsyncThunk(
  "dropdown/fetchPersonTypes",
  async () => {
    const response = await fetchPersonTypes();
    return response;
  }
);

export const fetchPlateTypesThunk = createAsyncThunk(
  "dropdown/fetchPlateTypes",
  async () => {
    const response = await fetchPlateTypes();
    return response;
  }
);

export const fetchDistrictsThunk = createAsyncThunk(
  "dropdown/fetchDistricts",
  async (param?: Record<string, string>) => {
    const response = await fetchDistricts(param);
    return response;
  }
);

export const fetchSubDistrictsThunk = createAsyncThunk(
  "dropdown/fetchSubDistricts",
  async (param?: Record<string, string>) => {
    const response = await fetchSubDistricts(param);
    return response;
  }
);

export const fetchRegionsThunk = createAsyncThunk(
  "dropdown/fetchRegions",
  async (param?: Record<string, string>) => {
    const response = await fetchRegions(param);
    return response;
  }
);

export const fetchUserGroupsThunk = createAsyncThunk(
  "dropdown/fetchUserGroups",
  async (param?: Record<string, string>) => {
    const response = await fetchUserGroups(param);
    return response;
  }
);

export const fetchGeoRegionsThunk = createAsyncThunk(
  "dropdown/fetchGeoRegions",
  async (param?: Record<string, string>) => {
    const response = await fetchGeoRegions(param);
    return response;
  }
);

export const fetchPoliceStationsThunk = createAsyncThunk(
  "dropdown/fetchPoliceStations",
  async (param?: Record<string, string>) => {
    const response = await fetchPoliceStations(param);
    return response;
  }
);

export const fetchStreamEncodesThunk = createAsyncThunk(
  "dropdown/fetchStreamEncodes",
  async (param?: Record<string, string>) => {
    const response = await fetchStreamEncodes(param);
    return response;
  }
);

const dropdownSlice = createSlice({
  name: "dropdown",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCheckpointsThunk.pending, (state) => {
        state.dropdownStatus = Status.LOADING;
        state.dropdownError = null;
      })
      .addCase(fetchCheckpointsThunk.fulfilled, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.checkpoints = action.payload;
      })
      .addCase(fetchCheckpointsThunk.rejected, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.dropdownError = action.error.message || "Failed to fetch checkpoints";
      })

      .addCase(fetchCamerasThunk.pending, (state) => {
        state.dropdownStatus = Status.LOADING;
        state.dropdownError = null;
      })
      .addCase(fetchCamerasThunk.fulfilled, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.cameras = action.payload;
      })
      .addCase(fetchCamerasThunk.rejected, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.dropdownError = action.error.message || "Failed to fetch cameras";
      })

      .addCase(fetchStationsThunk.pending, (state) => {
        state.dropdownStatus = Status.LOADING;
        state.dropdownError = null;
      })
      .addCase(fetchStationsThunk.fulfilled, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.stations = action.payload;
      })
      .addCase(fetchStationsThunk.rejected, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.dropdownError = action.error.message || "Failed to fetch stations";
      })

      .addCase(fetchProvincesThunk.pending, (state) => {
        state.dropdownStatus = Status.LOADING;
        state.dropdownError = null;
      })
      .addCase(fetchProvincesThunk.fulfilled, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.provinces = action.payload;
      })
      .addCase(fetchProvincesThunk.rejected, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.dropdownError = action.error.message || "Failed to fetch provinces";
      })

      .addCase(fetchAreasThunk.pending, (state) => {
        state.dropdownStatus = Status.LOADING;
        state.dropdownError = null;
      })
      .addCase(fetchAreasThunk.fulfilled, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.areas = action.payload;
      })
      .addCase(fetchAreasThunk.rejected, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.dropdownError = action.error.message || "Failed to fetch areas";
      })

      .addCase(fetchVehicleColorsThunk.pending, (state) => {
        state.dropdownStatus = Status.LOADING;
        state.dropdownError = null;
      })
      .addCase(fetchVehicleColorsThunk.fulfilled, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.vehicleColors = action.payload;
      })
      .addCase(fetchVehicleColorsThunk.rejected, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.dropdownError = action.error.message || "Failed to fetch vehicle colors";
      })

      .addCase(fetchVehicleMakesThunk.pending, (state) => {
        state.dropdownStatus = Status.LOADING;
        state.dropdownError = null;
      })
      .addCase(fetchVehicleMakesThunk.fulfilled, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.vehicleMakes = action.payload;
      })
      .addCase(fetchVehicleMakesThunk.rejected, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.dropdownError = action.error.message || "Failed to fetch vehicle makes";
      })

      .addCase(fetchVehicleBodyTypesThunk.pending, (state) => {
        state.dropdownStatus = Status.LOADING;
        state.dropdownError = null;
      })
      .addCase(fetchVehicleBodyTypesThunk.fulfilled, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.vehicleBodyTypes = action.payload;
      })
      .addCase(fetchVehicleBodyTypesThunk.rejected, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.dropdownError = action.error.message || "Failed to fetch vehicle body types";
      })

      .addCase(fetchVehicleModelThunk.pending, (state) => {
        state.dropdownStatus = Status.LOADING;
        state.dropdownError = null;
      })
      .addCase(fetchVehicleModelThunk.fulfilled, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.vehicleModel = action.payload;
      })
      .addCase(fetchVehicleModelThunk.rejected, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.dropdownError = action.error.message || "Failed to fetch vehicle model";
      })

      .addCase(fetchDepartmentsThunk.pending, (state) => {
        state.dropdownStatus = Status.LOADING;
        state.dropdownError = null;
      })
      .addCase(fetchDepartmentsThunk.fulfilled, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.departments = action.payload;
      })
      .addCase(fetchDepartmentsThunk.rejected, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.dropdownError = action.error.message || "Failed to fetch departments";
      })

      .addCase(fetchOfficerPositionsThunk.pending, (state) => {
        state.dropdownStatus = Status.LOADING;
        state.dropdownError = null;
      })
      .addCase(fetchOfficerPositionsThunk.fulfilled, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.positions = action.payload;
      })
      .addCase(fetchOfficerPositionsThunk.rejected, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.dropdownError = action.error.message || "Failed to fetch positions";
      })

      .addCase(fetchStatusThunk.pending, (state) => {
        state.dropdownStatus = Status.LOADING;
        state.dropdownError = null;
      })
      .addCase(fetchStatusThunk.fulfilled, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.status = action.payload;
      })
      .addCase(fetchStatusThunk.rejected, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.dropdownError = action.error.message || "Failed to fetch status";
      })

      .addCase(fetchPrefixThunk.pending, (state) => {
        state.dropdownStatus = Status.LOADING;
        state.dropdownError = null;
      })
      .addCase(fetchPrefixThunk.fulfilled, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.prefix = action.payload;
      })
      .addCase(fetchPrefixThunk.rejected, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.dropdownError = action.error.message || "Failed to fetch prefix";
      })

      .addCase(fetchPersonTypesThunk.pending, (state) => {
        state.dropdownStatus = Status.LOADING;
        state.dropdownError = null;
      })
      .addCase(fetchPersonTypesThunk.fulfilled, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.personTypes = action.payload;
      })
      .addCase(fetchPersonTypesThunk.rejected, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.dropdownError = action.error.message || "Failed to fetch person types";
      })

      .addCase(fetchPlateTypesThunk.pending, (state) => {
        state.dropdownStatus = Status.LOADING;
        state.dropdownError = null;
      })
      .addCase(fetchPlateTypesThunk.fulfilled, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.plateTypes = action.payload;
      })
      .addCase(fetchPlateTypesThunk.rejected, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.dropdownError = action.error.message || "Failed to fetch plate types";
      })

      .addCase(fetchDistrictsThunk.pending, (state) => {
        state.dropdownStatus = Status.LOADING;
        state.dropdownError = null;
      })
      .addCase(fetchDistrictsThunk.fulfilled, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.districts = action.payload;
      })
      .addCase(fetchDistrictsThunk.rejected, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.dropdownError = action.error.message || "Failed to fetch districts";
      })
      
      .addCase(fetchSubDistrictsThunk.pending, (state) => {
        state.dropdownStatus = Status.LOADING;
        state.dropdownError = null;
      })
      .addCase(fetchSubDistrictsThunk.fulfilled, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.subDistricts = action.payload;
      })
      .addCase(fetchSubDistrictsThunk.rejected, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.dropdownError = action.error.message || "Failed to fetch sub districts";
      })

      .addCase(fetchRegionsThunk.pending, (state) => {
        state.dropdownStatus = Status.LOADING;
        state.dropdownError = null;
      })
      .addCase(fetchRegionsThunk.fulfilled, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.regions = action.payload;
      })
      .addCase(fetchRegionsThunk.rejected, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.dropdownError = action.error.message || "Failed to fetch regions";
      })

      .addCase(fetchUserGroupsThunk.pending, (state) => {
        state.dropdownStatus = Status.LOADING;
        state.dropdownError = null;
      })
      .addCase(fetchUserGroupsThunk.fulfilled, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.userGroups = action.payload;
      })
      .addCase(fetchUserGroupsThunk.rejected, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.dropdownError = action.error.message || "Failed to fetch user groups";
      })

      .addCase(fetchGeoRegionsThunk.pending, (state) => {
        state.dropdownStatus = Status.LOADING;
        state.dropdownError = null;
      })
      .addCase(fetchGeoRegionsThunk.fulfilled, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.geoRegions = action.payload;
      })
      .addCase(fetchGeoRegionsThunk.rejected, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.dropdownError = action.error.message || "Failed to fetch geo regions";
      })

      .addCase(fetchPoliceStationsThunk.pending, (state) => {
        state.dropdownStatus = Status.LOADING;
        state.dropdownError = null;
      })
      .addCase(fetchPoliceStationsThunk.fulfilled, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.policeStations = action.payload;
      })
      .addCase(fetchPoliceStationsThunk.rejected, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.dropdownError = action.error.message || "Failed to fetch police stations";
      })

      .addCase(fetchStreamEncodesThunk.pending, (state) => {
        state.dropdownStatus = Status.LOADING;
        state.dropdownError = null;
      })
      .addCase(fetchStreamEncodesThunk.fulfilled, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.streamEncodes = action.payload;
      })
      .addCase(fetchStreamEncodesThunk.rejected, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.dropdownError = action.error.message || "Failed to fetch stream encodes";
      });
  }
})

export default dropdownSlice.reducer