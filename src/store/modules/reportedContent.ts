import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { makeActions } from 'mediashare/store/factory';
import { ApiService } from 'mediashare/store/apis';
import {
  reduceFulfilledState,
  reducePendingState,
  reduceRejectedState,
  thunkApiWithState,
} from 'mediashare/store/helpers';
import {
  ReportedContentItem,
  ReporterAbuseGroup,
} from 'mediashare/apis/media-svc/rxjs-api';

const reportedContentActionNames = [
  'list_reported_content',
  'list_reports_by_user',
] as const;
export const reportedContentActions = makeActions(reportedContentActionNames);

export const listReportedContent = createAsyncThunk(
  reportedContentActions.listReportedContent.type,
  async (_opts: undefined, thunkApi) => {
    const { api } = thunkApiWithState(thunkApi);
    return await (api as ApiService).admin
      .adminControllerListReports()
      .toPromise();
  }
);

export const listReportsByUser = createAsyncThunk(
  reportedContentActions.listReportsByUser.type,
  async (_opts: undefined, thunkApi) => {
    const { api } = thunkApiWithState(thunkApi);
    return await (api as ApiService).admin
      .adminControllerListReportsByUser()
      .toPromise();
  }
);

export interface ReportedContentState {
  entities: ReportedContentItem[];
  byUser: ReporterAbuseGroup[];
  loading: boolean;
  loaded: boolean;
  byUserLoading: boolean;
  byUserLoaded: boolean;
}

export const reportedContentInitialState: ReportedContentState = {
  entities: [],
  byUser: [],
  loading: false,
  loaded: false,
  byUserLoading: false,
  byUserLoaded: false,
};

const reportedContentSlice = createSlice({
  name: 'reportedContent',
  initialState: reportedContentInitialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listReportedContent.pending, reducePendingState())
      .addCase(listReportedContent.rejected, reduceRejectedState())
      .addCase(
        listReportedContent.fulfilled,
        reduceFulfilledState((state, action) => ({
          ...state,
          entities: action.payload || [],
          loading: false,
          loaded: true,
        }))
      )
      .addCase(listReportsByUser.pending, (state) => ({
        ...state,
        byUserLoading: true,
      }))
      .addCase(listReportsByUser.rejected, (state) => ({
        ...state,
        byUserLoading: false,
        byUserLoaded: true,
      }))
      .addCase(listReportsByUser.fulfilled, (state, action) => ({
        ...state,
        byUser: action.payload || [],
        byUserLoading: false,
        byUserLoaded: true,
      }));
  },
});

export default reportedContentSlice;
export const reducer = reportedContentSlice.reducer;
