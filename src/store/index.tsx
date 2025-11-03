import { configureStore } from '@reduxjs/toolkit'
import sellersReducer from '../redux/user'

export const store = configureStore({
      reducer: {
            sellers:sellersReducer
      },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch