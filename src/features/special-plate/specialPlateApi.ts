// Config
import { getUrls } from '../../config/runtimeConfig';
import { isDevEnv } from "../../config/environment";

// Utils
import { fetchClient, combineURL } from "../../utils/fetchClient"

// Types
import {
  SpecialPlateResponse,
} from "../types";

// Mocks
import { mockSpecialPlates } from "../../mocks/mockSpecialPlates";

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

export const fetchSpecialPlates = async (param?: Record<string, string>): Promise<SpecialPlateResponse> => {
  const { CENTER_API } = getUrls();
  if (isDevEnv) {
    const data = {
      statusCode,
      status,
      success,
      message,
      pagination,
      data: mockSpecialPlates
    }
    return Promise.resolve(data);
  }
  return await fetchClient<SpecialPlateResponse>(combineURL(CENTER_API, "/special-plates/get"), {
    method: "GET",
    queryParams: param,
  });
};
