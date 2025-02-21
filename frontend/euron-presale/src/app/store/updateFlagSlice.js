import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: false,
};

export const updateFlagSlice = createSlice({
  name: "updateFlag",
  initialState,
  reducers: {
    updateStatus: (state) => {
      state.value = !state.value;
    },
  },
});

export const { updateStatus } = updateFlagSlice.actions;
export default updateFlagSlice.reducer;
