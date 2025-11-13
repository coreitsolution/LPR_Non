import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Constants
import { Status } from "../../constants/statusEnum";

// API
import {
  fetchSpecialPlates,
} from "./specialPlateApi";

// Types
import {
  SpecialPlateResponse,
} from "../types";

interface DropdownState {
  specialPlates: SpecialPlateResponse | null;
  dropdownStatus: Status;
  dropdownError: string | null;
}

const initialState: DropdownState = {
  specialPlates: null,
  dropdownStatus: Status.IDLE,
  dropdownError: null,
}

export const fetchSpecialPlatesThunk = createAsyncThunk(
  "specialPlate/fetchSpecialPlates",
  async (param?: Record<string, string>) => {
    const response = await fetchSpecialPlates(param);
    return response;
  }
);

const specialPlateSlice = createSlice({
  name: "specialPlate",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSpecialPlatesThunk.pending, (state) => {
        state.dropdownStatus = Status.LOADING;
        state.dropdownError = null;
      })
      .addCase(fetchSpecialPlatesThunk.fulfilled, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.specialPlates = action.payload;
      })
      .addCase(fetchSpecialPlatesThunk.rejected, (state, action) => {
        state.dropdownStatus = Status.SUCCEEDED;
        state.dropdownError = action.error.message || "Failed to fetch special plates";
      });
  }
})

export default specialPlateSlice.reducer