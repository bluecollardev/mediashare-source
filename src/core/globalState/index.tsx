import React, { useEffect, useState } from 'react';
import { compose } from 'recompose';
import { useDispatch } from 'react-redux';
import { usePageRoute } from 'mediashare/hooks/navigation';
import { useAppSelector } from 'mediashare/store';
import { useUser } from 'mediashare/hooks/useUser';
import { INITIAL_DISPLAY_MODE } from 'mediashare/core/globalState/constants';
import { loadUser, setIsAcceptingInvitationAction } from 'mediashare/store/modules/user'
import { getTags } from 'mediashare/store/modules/tags';
import { BcRolesType, ProfileDto, UserDto } from 'mediashare/apis/user-svc/rxjs-api'
import { TagDto } from 'mediashare/apis/tags-svc/rxjs-api';

export interface GlobalStateProps {
  history?: any;
  location?: any;
  loading?: boolean;
  isLoggedIn?: boolean;
  user?: Partial<UserDto>;
  roles?: BcRolesType[];
  build?: {
    forFreeUser: boolean;
    forSubscriber: boolean;
    forAdmin: boolean;
  };
  openInvitation?: () => void;
  isAcceptingInvitationFrom?: string;
  loadUserData?: () => void;
  search?: any;
  searchFilters?: Map<string, any>;
  searchFiltersActive?: Map<string, any>;
  forcedSearchActive?: Map<string, any>;
  updateSearchFilters?: (searchKey: string, value: any) => void;
  getSearchFilters?: (searchKey: string) => any;
  clearSearchFilters?: (searchKey: string) => any;
  searchIsFiltering?: (searchKey: string) => boolean | undefined;
  searchIsActive?: (searchKey: string) => any;
  setSearchIsActive?: (searchKey: string, value: any) => void;
  forcedSearchMode?: (searchKey: string) => any;
  setForcedSearchMode?: (searchKey: string, value: any) => void;
  tags?: TagDto[];
  displayMode?: 'list' | 'article';
  setDisplayMode: (value) => void;
}

export const GlobalState = React.createContext<GlobalStateProps>({} as GlobalStateProps);

export const INITIAL_SEARCH_FILTERS = {
  text: '',
  tags: [],
};

export const GlobalStateProviderWrapper = (WrappedComponent: any) => {
  return function GlobalStateProvider(props: any) {
    const { history, location } = props;

    const loading = useAppSelector((state) => state?.app?.loading);
    const tags = useAppSelector((state) => state?.tags?.entities || []);
    
    const [searchFilters, setSearchFilters] = useState(new Map());
    const [searchFiltersActive, setSearchFiltersActive] = useState(new Map());
    const [forcedSearchActive, setForcedSearchActive] = useState(new Map());
    const [displayMode, setDisplayMode] = useState(INITIAL_DISPLAY_MODE);

    const user = useUser();
    const { roles, isLoggedIn, build } = user;
    
    const isAcceptingInvitationFrom = useAppSelector((state) => state?.user?.isAcceptingInvitationFrom);

    const dispatch = useDispatch();

    useEffect(() => {
      const loadTags = async () => {
        await dispatch(getTags());
      };

      if (isLoggedIn) {
        loadTags().then();
      }
    }, [isLoggedIn, isAcceptingInvitationFrom]);

    const providerValue = getProviderValue() as GlobalStateProps;

    return (
      <GlobalState.Provider value={providerValue}>
        <WrappedComponent {...props} globalState={providerValue} />
      </GlobalState.Provider>
    );

    function getProviderValue() {
      const value = {
        history,
        location,
        loading,
        isLoggedIn,
        user,
        roles,
        build,
        isAcceptingInvitationFrom,
        openInvitation,
        loadUserData,
        searchIsFiltering,
        forcedSearchMode,
        setForcedSearchMode,
        searchIsActive,
        setSearchIsActive,
        updateSearchFilters,
        clearSearchFilters,
        getSearchFilters,
        searchFilters,
        searchFiltersActive,
        forcedSearchActive,
        tags,
        displayMode,
        setDisplayMode,
      } as GlobalStateProps;
      return value;
    }
    
    async function openInvitation() {
      const goToInvitation = usePageRoute('Account', 'invitation');
      await dispatch(setIsAcceptingInvitationAction(undefined));
      goToInvitation({ userId: isAcceptingInvitationFrom });
    }

    async function loadUserData() {
      await dispatch(loadUser());
    }

    function searchIsFiltering(searchKey: string): boolean | undefined {
      const filters = getSearchFilters(searchKey);
      if (filters === undefined) return;
      return !!filters?.text || filters?.tags?.length > 0;
    }
    
    function updateSearchFilters(searchKey: string, value: any) {
      searchFilters.set(searchKey, value);
      setSearchFilters(new Map(searchFilters));
    }
  
    function clearSearchFilters(searchKey: string) {
      searchFilters.set(searchKey, INITIAL_SEARCH_FILTERS);
      setSearchIsActive(searchKey, false);
      setSearchFilters(new Map(searchFilters));
    }
    
    function getSearchFilters(searchKey: string) {
      return searchFilters?.get(searchKey);
    }
  
    function searchIsActive(searchKey: string) {
      return (searchFiltersActive.get(searchKey) === true);
    }
  
    function setSearchIsActive(searchKey: string, value: boolean) {
      searchFiltersActive.set(searchKey, value);
      setSearchFiltersActive(new Map(searchFiltersActive));
      if (!value) {
        searchFilters.delete(searchKey)
        setSearchFilters(searchFilters);
      }
    }
  
    function forcedSearchMode(searchKey: string) {
      return (forcedSearchActive.get(searchKey) === true);
    }
  
    function setForcedSearchMode(searchKey: string, value: boolean) {
      forcedSearchActive.set(searchKey, value);
      setForcedSearchActive(new Map(forcedSearchActive));
    }
  };
};

const GlobalStateConsumerWrapper = (WrappedComponent: any) => {
  return function GlobalStateConsumer(props) {
    return (
      <GlobalState.Consumer>
        {(globalState) => {
          return <WrappedComponent {...props} globalState={globalState} />;
        }}
      </GlobalState.Consumer>
    );
  };
};

const withGlobalStateProvider = compose(GlobalStateProviderWrapper);
const withGlobalStateConsumer = GlobalStateConsumerWrapper;

export { withGlobalStateProvider, withGlobalStateConsumer };
