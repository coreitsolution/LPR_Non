import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Constants
import { Status } from "../../constants/statusEnum";

// Types
import { RealTimeLprData } from "../../features/types";

interface RealtimeDataState {
  realtimeData: RealTimeLprData[];
  toastNotification: RealTimeLprData[];
  realtimeDataStatus: Status;
  realtimeDataError: string | null;
}

const initialState: RealtimeDataState = {
  realtimeData: [],
  toastNotification: [],
  realtimeDataStatus: Status.IDLE,
  realtimeDataError: null,
}

const realtimeDataSlice = createSlice({
  name: "realtimeData",
  initialState,
  reducers: {
    upsertRealtimeData: (state, action: PayloadAction<RealTimeLprData>) => {
      const exists = state.realtimeData.some(
        (d) => d.ref_id === action.payload.ref_id
      );
      if (!exists) {
        state.realtimeData.unshift(action.payload);
        if (state.realtimeData.length > 20) state.realtimeData.length = 20;
      }
    },
    addToastMessage: (state, action: PayloadAction<RealTimeLprData>) => {
      const exists = state.toastNotification.some(t => t.ref_id === action.payload.ref_id);
      if (!exists) {
        state.toastNotification.push(action.payload);
      }
    },
    updateToastMessage: (state, action: PayloadAction<RealTimeLprData[]>) => {
      state.toastNotification = action.payload;
    },
  },
  extraReducers: () => {

  }
})

export const { upsertRealtimeData, addToastMessage, updateToastMessage } = realtimeDataSlice.actions;

export default realtimeDataSlice.reducer