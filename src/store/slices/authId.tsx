import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface AuthIdState {
  value: string 
}

const initialState: AuthIdState = {
  value: "",
}

export const isAuthIdSlice = createSlice({
  name: 'authId',
  initialState,
  reducers: {
      setAuthId: (state, action: PayloadAction<string>) => {
      state.value = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setAuthId } = isAuthIdSlice.actions

export default isAuthIdSlice.reducer