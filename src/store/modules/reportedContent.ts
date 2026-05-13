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
  'suspend_content',
  'unsuspend_content',
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

const extractApiMessage = (err: any) =>
  err?.response?.message || err?.message || 'Request failed';

export const suspendContent = createAsyncThunk(
  reportedContentActions.suspendContent.type,
  async (
    args: { contentType: 'mediaItem' | 'playlistItem'; itemId: string },
    thunkApi
  ) => {
    try {
      const { api } = thunkApiWithState(thunkApi);
      if (args.contentType === 'mediaItem') {
        await (api as ApiService).mediaItems
          .mediaItemControllerSuspend({ mediaId: args.itemId })
          .toPromise();
      } else {
        await (api as ApiService).playlistItems
          .playlistItemControllerSuspend({ playlistItemId: args.itemId })
          .toPromise();
      }
      return args;
    } catch (err: any) {
      return thunkApi.rejectWithValue({ message: extractApiMessage(err) });
    }
  }
);

export const unsuspendContent = createAsyncThunk(
  reportedContentActions.unsuspendContent.type,
  async (
    args: { contentType: 'mediaItem' | 'playlistItem'; itemId: string },
    thunkApi
  ) => {
    try {
      const { api } = thunkApiWithState(thunkApi);
      if (args.contentType === 'mediaItem') {
        await (api as ApiService).mediaItems
          .mediaItemControllerUnsuspend({ mediaId: args.itemId })
          .toPromise();
      } else {
        await (api as ApiService).playlistItems
          .playlistItemControllerUnsuspend({ playlistItemId: args.itemId })
          .toPromise();
      }
      return args;
    } catch (err: any) {
      return thunkApi.rejectWithValue({ message: extractApiMessage(err) });
    }
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
