import { RootState } from '../../../app/store';

export const selectCurrentUser = (state: RootState) => state.auth?.user;
export const selectIsAuthenticated = (state: RootState) => !!state.auth?.token;
