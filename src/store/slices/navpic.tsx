import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface NavState {
  value: string 
}

const initialState: NavState = {
  value: "",
}

export const isNavSlice = createSlice({
  name: 'nav',
  initialState,
  reducers: {
      setNav: (state, action: PayloadAction<string>) => {
      state.value = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setNav } = isNavSlice.actions

export default isNavSlice.reducer