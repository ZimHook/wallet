import { createSlice } from "@reduxjs/toolkit";

const initialState = null;

export const authActor = createSlice({
  name: "authActor",
  initialState,
  reducers: {
    updateAuthActor: (state, action) => {
      let targetProto = Object.getPrototypeOf(action.payload);
      return Object.assign(Object.create(targetProto), action.payload);
    },
  },
});

export const { updateAuthActor } = authActor.actions;

export default authActor.reducer;
