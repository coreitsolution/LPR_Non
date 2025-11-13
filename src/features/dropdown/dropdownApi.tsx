// Config
import { getUrls } from '../../config/runtimeConfig';
import { isDevEnv } from "../../config/environment";

// Utils
import { fetchClient, combineURL } from "../../utils/fetchClient"

// Types
import {
  StationResponse,
  ProvincesResponse,
  AreaResponse,
  VehicleMakesResponse,
  VehicleColorsResponse,
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

// Mocks
import { mockCheckpoint } from "../../mocks/mockCheckpoints";
import { mockStationData } from '../../mocks/mockStations';
import { mockProvincesData } from '../../mocks/mockProvinces';
import { mockAreaData } from '../../mocks/mockAreas'; 
import { mockVehicleMakes } from '../../mocks/mockVehicleMakes';
import { mockVehicleColors } from '../../mocks/mockVehicleColors';
import { mockDepartmentData } from '../../mocks/mockDepartments';
import { mockOfficerPositions } from '../../mocks/mockOfficerPositions';
import { mockStatus } from '../../mocks/mockStatus';
import { mockPrefixes } from '../../mocks/mockPrefix';
import { mockPersonTypes } from '../../mocks/mockPersonTypes';
import { mockPlateTypes } from '../../mocks/mockPlateTypes';
import { mockDistricts } from '../../mocks/mockDistricts';
import { mockSubDistricts } from '../../mocks/mockSubDistricts';
import { mockCameraData } from "../../mocks/mockCameras";
import { mockRegions } from "../../mocks/mockRegions";
import { mockUserGroups } from "../../mocks/mockUserGroup";
import { mockGeoRegions } from "../../mocks/mockGeoRegions";
import { mockPoliceStations } from "../../mocks/mockPoliceStations";
import { mockStreamEncodes } from '../../mocks/mockStreamEncodes';
import { mockVehicleBodyTypes } from '../../mocks/mockVehicleBodyTypes';
import { mockVehicleModels } from '../../mocks/mockVehicleModels';

const statusCode = 200;
const status = "Successful";
const success = true;
const message = "OK with data";
const pagination = {
    "page": 1,
    "maxPage": 8,
    "limit": 10,
    "count": 10,
    "countAll": 79
};

export const fetchCheckpoints = async (param?: Record<string, string>): Promise<CheckpointResponse> => {
  const { CENTER_API } = getUrls();
  if (isDevEnv) {
    const data = {
      statusCode,
      status,
      success,
      message,
      pagination,
      data: mockCheckpoint
    }
    return Promise.resolve(data);
  }
  return await fetchClient<CheckpointResponse>(combineURL(CENTER_API, "/checkpoints/get"), {
    method: "GET",
    queryParams: param,
  });
};

export const fetchCameras = async (param?: Record<string, string>): Promise<CameraResponse> => {
  const { CENTER_API } = getUrls();
  if (isDevEnv) {
    const data = {
      statusCode,
      status,
      success,
      message,
      pagination,
      data: mockCameraData
    }
    return Promise.resolve(data);
  }
  return await fetchClient<CameraResponse>(combineURL(CENTER_API, "/cameras/get"), {
    method: "GET",
    queryParams: param,
  });
};

export const fetchStations = async (_?: Record<string, string>): Promise<StationResponse> => {
  // const { API_URL } = getUrls();
  const data = {
    statusCode,
    status,
    success,
    message,
    pagination,
    data: mockStationData
  }
  return Promise.resolve(data);
  // if (isDevEnv) {
  //   const data = {
  //     data: mockStationData
  //   }
  //   return Promise.resolve(data);
  // }
  // return await fetchClient<StationResponse>(combineURL(API_URL, "/stations/get"), {
  //   method: "GET",
  //   queryParams: param,
  // });
};

export const fetchProvinces = async (param?: Record<string, string>): Promise<ProvincesResponse> => {
  const { CENTER_API } = getUrls();
  if (isDevEnv) {
    const data = {
      statusCode,
      status,
      success,
      message,
      pagination,
      data: mockProvincesData
    }
    return Promise.resolve(data);
  }
  return await fetchClient<ProvincesResponse>(combineURL(CENTER_API, "/provinces/get"), {
    method: "GET",
    queryParams: param,
  });
};

export const fetchAreas = async (_?: Record<string, string>): Promise<AreaResponse> => {
  // const { API_URL } = getUrls();
  const data = {
    statusCode,
    status,
    success,
    message,
    pagination,
    data: mockAreaData
  }
  return Promise.resolve(data);
  // if (isDevEnv) {
  //   const data = {
  //     data: mockAreaData
  //   }
  //   return Promise.resolve(data);
  // }
  // return await fetchClient<AreaResponse>(combineURL(API_URL, "/areas/get"), {
  //   method: "GET",
  //   queryParams: param,
  // });
};

export const fetchVehicleMakes = async (param?: Record<string, string>): Promise<VehicleMakesResponse> => {
  const { CENTER_API } = getUrls();
  if (isDevEnv) {
    const data = {
      statusCode,
      status,
      success,
      message,
      pagination,
      data: mockVehicleMakes
    }
    return Promise.resolve(data);
  }
  return await fetchClient<VehicleMakesResponse>(combineURL(CENTER_API, "/vehicle-makes/get"), {
    method: "GET",
    queryParams: param,
  });
};

export const fetchVehicleColors = async (param?: Record<string, string>): Promise<VehicleColorsResponse> => {
  const { CENTER_API } = getUrls();
  if (isDevEnv) {
    const data = {
      statusCode,
      status,
      success,
      message,
      pagination,
      data: mockVehicleColors
    }
    return Promise.resolve(data);
  }
  return await fetchClient<VehicleColorsResponse>(combineURL(CENTER_API, "/vehicle-colors/get"), {
    method: "GET",
    queryParams: param,
  });
};

export const fetchVehicleBodyTypes = async (param?: Record<string, string>): Promise<VehicleBodyTypeResponse> => {
  const { CENTER_API } = getUrls();
  if (isDevEnv) {
    const data = {
      statusCode,
      status,
      success,
      message,
      pagination,
      data: mockVehicleBodyTypes
    }
    return Promise.resolve(data);
  }
  return await fetchClient<VehicleBodyTypeResponse>(combineURL(CENTER_API, "/vehicle-body-types/get"), {
    method: "GET",
    queryParams: param,
  });
};

export const fetchVehicleModel = async (param?: Record<string, string>): Promise<VehicleModelResponse> => {
  const { CENTER_API } = getUrls();
  if (isDevEnv) {
    const data = {
      statusCode,
      status,
      success,
      message,
      pagination,
      data: mockVehicleModels
    }
    return Promise.resolve(data);
  }
  return await fetchClient<VehicleModelResponse>(combineURL(CENTER_API, "/vehicle-models/get"), {
    method: "GET",
    queryParams: param,
  });
};

export const fetchDepartments = async (_?: Record<string, string>): Promise<DepartmentResponse> => {
  // const { API_URL } = getUrls();
  const data = {
    statusCode,
    status,
    success,
    message,
    pagination,
    data: mockDepartmentData
  }
  return Promise.resolve(data);
  // if (isDevEnv) {
  //   const data = {
  //     data: mockDepartmentData
  //   }
  //   return Promise.resolve(data);
  // }
  // return await fetchClient<DepartmentResponse>(combineURL(API_URL, "/department/get"), {
  //   method: "GET",
  //   queryParams: param,
  // });
};

export const fetchOfficerPositions = async (_?: Record<string, string>): Promise<OfficerPositionsResponse> => {
  // const { API_URL } = getUrls();
  const data = {
    statusCode,
    status,
    success,
    message,
    pagination,
    data: mockOfficerPositions
  }
  return Promise.resolve(data);
  // if (isDevEnv) {
  //   const data = {
  //     data: mockOfficerPositions
  //   }
  //   return Promise.resolve(data);
  // }
  // return await fetchClient<OfficerPositionsResponse>(combineURL(API_URL, "/officer-positions/get"), {
  //   method: "GET",
  //   queryParams: param,
  // });
};

export const fetchStatus = async (_?: Record<string, string>): Promise<StatusResponse> => {
  // const { API_URL } = getUrls();
  const data = {
    statusCode,
    status,
    success,
    message,
    pagination,
    data: mockStatus
  }
  return Promise.resolve(data);
  // if (isDevEnv) {
  //   const data = {
  //     data: mockStatus
  //   }
  //   return Promise.resolve(data);
  // }
  // return await fetchClient<StatusResponse>(combineURL(API_URL, "/status/get"), {
  //   method: "GET",
  //   queryParams: param,
  // });
};

export const fetchPrefix = async (param?: Record<string, string>): Promise<PrefixResponse> => {
  const { CENTER_API } = getUrls();
  if (isDevEnv) {
    const data = {
      statusCode,
      status,
      success,
      message,
      pagination,
      data: mockPrefixes
    }
    return Promise.resolve(data);
  }
  return await fetchClient<PrefixResponse>(combineURL(CENTER_API, "/person-titles/get"), {
    method: "GET",
    queryParams: param,
  });
};

export const fetchPersonTypes = async (param?: Record<string, string>): Promise<PersonResponse> => {
  const { CENTER_API } = getUrls();
  if (isDevEnv) {
    const data = {
      statusCode,
      status,
      success,
      message,
      pagination,
      data: mockPersonTypes
    }
    return Promise.resolve(data);
  }
  return await fetchClient<PersonResponse>(combineURL(CENTER_API, "/person-classes/get"), {
    method: "GET",
    queryParams: param,
  });
};

export const fetchPlateTypes = async (param?: Record<string, string>): Promise<PlateTypesResponse> => {
  const { CENTER_API } = getUrls();
  if (isDevEnv) {
    const data = {
      statusCode,
      status,
      success,
      message,
      pagination,
      data: mockPlateTypes
    }
    return Promise.resolve(data);
  }
  return await fetchClient<PlateTypesResponse>(combineURL(CENTER_API, "/plate-classes/get"), {
    method: "GET",
    queryParams: param,
  });
};

export const fetchDistricts = async (param?: Record<string, string>): Promise<DistrictsResponse> => {
  const { CENTER_API } = getUrls();  
  if (isDevEnv) {
    const filteredData = mockDistricts
    .filter((data) =>
      Object.entries(param ?? {}).every(([key, value]) => {
        switch (key) {
          case "province_id":
            return data.province_id === Number(value);
          default:
            return true;
        }
      })
    )
    .sort((a, b) => a.name_th.localeCompare(b.name_th)
  );

  const data = { 
    statusCode,
    status,
    success,
    message,
    pagination,
    data: filteredData 
  };
    return Promise.resolve(data);
  }
  return await fetchClient<DistrictsResponse>(combineURL(CENTER_API, "/districts/get"), {
    method: "GET",
    queryParams: param,
  });
};

export const fetchSubDistricts = async (param?: Record<string, string>): Promise<SubDistrictsResponse> => {
  const { CENTER_API } = getUrls();

  if (isDevEnv) {
    const filteredData = mockSubDistricts
      .filter((data) =>
        Object.entries(param ?? {}).every(([key, value]) => {
          switch (key) {
            case "province_id":
              return data.province_id === Number(value);
            case "district_id":
              return data.district_id === Number(value);
            default:
              return true;
          }
        })
      )
      .sort((a, b) => a.name_th.localeCompare(b.name_th)
    );

    const data = { 
      statusCode,
      status,
      success,
      message,
      pagination,
      data: filteredData 
    };
    return Promise.resolve(data);
  }
  return await fetchClient<SubDistrictsResponse>(combineURL(CENTER_API, "/subdistricts/get"), {
    method: "GET",
    queryParams: param,
  });
}

export const fetchRegions = async (param?: Record<string, string>): Promise<RegionResponse> => {
  const { CENTER_API } = getUrls();
  if (isDevEnv) {
    const data = {
      statusCode,
      status,
      success,
      message,
      pagination,
      data: mockRegions,
    }
    return Promise.resolve(data);
  }
  return await fetchClient<RegionResponse>(combineURL(CENTER_API, "/lpr-regions/get"), {
    method: "GET",
    queryParams: param,
  });
};

export const fetchUserGroups = async (param?: Record<string, string>): Promise<UserGroupResponse> => {
  const { CENTER_API } = getUrls();
  if (isDevEnv) {
    const data = {
      statusCode,
      status,
      success,
      message,
      pagination,
      data: mockUserGroups,
    }
    return Promise.resolve(data);
  }
  return await fetchClient<UserGroupResponse>(combineURL(CENTER_API, "/user-groups/get"), {
    method: "GET",
    queryParams: param,
  });
};

export const fetchGeoRegions = async (param?: Record<string, string>): Promise<GeoRegionResponse> => {
  const { CENTER_API } = getUrls();
  if (isDevEnv) {
    const data = {
      statusCode,
      status,
      success,
      message,
      pagination,
      data: mockGeoRegions,
    }
    return Promise.resolve(data);
  }
  return await fetchClient<GeoRegionResponse>(combineURL(CENTER_API, "/geo-regions/get"), {
    method: "GET",
    queryParams: param,
  });
};

export const fetchPoliceStations = async (param?: Record<string, string>): Promise<PoliceStationResponse> => {
  const { CENTER_API } = getUrls();
  if (isDevEnv) {
    const data = {
      statusCode,
      status,
      success,
      message,
      pagination,
      data: mockPoliceStations,
    }
    return Promise.resolve(data);
  }
  return await fetchClient<PoliceStationResponse>(combineURL(CENTER_API, "/police-stations/get"), {
    method: "GET",
    queryParams: param,
  });
};

export const fetchStreamEncodes = async (param?: Record<string, string>): Promise<StreamEncodeResponse> => {
  const { CENTER_API } = getUrls();
  if (isDevEnv) {
    const data = {
      statusCode,
      status,
      success,
      message,
      pagination,
      data: mockStreamEncodes
    }
    return Promise.resolve(data);
  }
  return await fetchClient<StreamEncodeResponse>(combineURL(CENTER_API, "/stream-encodes/get"), {
    method: "GET",
    queryParams: param,
  });
};