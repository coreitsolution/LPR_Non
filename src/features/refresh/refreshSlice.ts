import { createSlice } from '@reduxjs/toolkit';

interface RefreshState {
  cameraRefreshKey: number;
  requestDeleteCameraRefreshKey: number;
}

const initialState: RefreshState = {
  cameraRefreshKey: 0,
  requestDeleteCameraRefreshKey: 0,
};

const refreshSlice = createSlice({
  name: 'refresh',
  initialState,
  reducers: {
    triggerCameraRefresh(state) {
      state.cameraRefreshKey += 1;
    },
    triggerRequestDeleteCamera(state) {
      state.requestDeleteCameraRefreshKey += 1;
    },
  },
});

export const { triggerCameraRefresh, triggerRequestDeleteCamera } = refreshSlice.actions;
export default refreshSlice.reducer;
