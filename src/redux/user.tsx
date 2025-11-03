import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface SellersState {
      sellerData: any[];
      sellerIds: number[];
}

const initialState: SellersState = {
      sellerData: [],
      sellerIds: [],
};

export const sellersSlice = createSlice({
      name: 'sellers',
      initialState,
      reducers: {
            setSellerData: (state, action: PayloadAction<{ sellerData: any[]; sellerIds: number[] }>) => {
                  state.sellerData = action.payload.sellerData;
                  state.sellerIds = action.payload.sellerIds;
            },
      },
});


export const { setSellerData } = sellersSlice.actions

export default sellersSlice.reducer