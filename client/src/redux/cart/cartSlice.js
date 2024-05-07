import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentCart: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    insertItem: (state, action) => {
      state.currentCart = action.payload;
    },
  },
});

export const {
    insertItem,
} = cartSlice.actions;

export default cartSlice.reducer;
