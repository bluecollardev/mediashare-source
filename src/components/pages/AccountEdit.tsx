import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { View, StyleSheet, ScrollView } from 'react-native';
import * as R from 'remeda';
import { from } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { UserDto } from 'mediashare/rxjs-api';
import { loadUser, updateAccount } from 'mediashare/store/modules/user';
import { loadProfile } from 'mediashare/store/modules/profile';
import { routeNames } from 'mediashare/routes';
import { useRouteWithParams } from 'mediashare/hooks/navigation';
import { useProfile } from 'mediashare/hooks/useProfile';
import { useUploader } from 'mediashare/hooks/useUploader';
import { TextField } from 'mediashare/components/form/TextField';
import { withLoadingSpinner } from 'mediashare/components/hoc/withLoadingSpinner';
// import { ErrorBoundary } from 'mediashare/components/error/ErrorBoundary';
import { PageContainer, PageProps, ActionButtons, AccountCard, KeyboardAvoidingPageContent } from 'mediashare/components/layout';

interface AccountEditProps extends PageProps {}

const AccountEdit = ({ route }: AccountEditProps) => {
  const { userId = null } = route.params;

  const dispatch = useDispatch();

  const viewAccount = useRouteWithParams(routeNames.account);

  const [isLoaded, setIsLoaded] = useState(false);

  const profile = useProfile();
  const [state, setState] = useState(R.pick(profile, ['username', 'email', 'firstName', 'lastName', 'phoneNumber', 'imageSrc', 'role', '_id']));
  const withoutName = () => state?.firstName?.length < 1 || state?.lastName?.length < 1;
  const fullName = state?.firstName || state?.lastName ? `${state?.firstName} ${state?.lastName}` : 'Unnamed User';
  
  const onUploadStart = () => undefined;
  const onUploadComplete = (uri) => {
    setState({ ...state, imageSrc: uri });
  };
  
  const { pickImage } = useUploader({
    onUploadStart,
    onUploadComplete
  });
  
  useEffect(() => {
    async function loadData() {
      const profile = (await dispatch(loadProfile(userId))) as any;
      setState(profile.payload);
      setIsLoaded(true);
    }
    if (!isLoaded) {
      loadData().then();
    }
  }, []);

  return (
    <PageContainer>
      <KeyboardAvoidingPageContent>
        <ScrollView alwaysBounceVertical={false} contentContainerStyle={styles.formContainer}>
          <View>
            <AccountCard
              title={fullName}
              username={state?.username}
              email={state?.email}
              phoneNumber={state?.phoneNumber}
              image={state?.imageSrc}
              showActions={true}
              isCurrentUser={true}
              onUpdateAvatarClicked={() => pickImage()}
            />
          </View>
      
          <View style={styles.formSection}>
            <TextField label="Shared Type" value={state?.role} disabled={true} />
            <TextField onChangeText={(text) => onUpdate({ username: text })} label="Username*" value={state?.username} disabled={!isLoaded} />
          </View>
          <View style={styles.formSection}>
            <TextField onChangeText={(text) => onUpdate({ firstName: text })} label="First Name*" value={state?.firstName} disabled={!isLoaded} />
            <TextField onChangeText={(text) => onUpdate({ lastName: text })} label="Last Name*" value={state?.lastName} disabled={!isLoaded} />
          </View>
          <View style={styles.formSection}>
            <TextField onChangeText={(text) => onUpdate({ email: text })} label="Email*" value={state?.email} disabled={!isLoaded} />
            <TextField onChangeText={(text) => onUpdate({ phoneNumber: text })} label="Phone Number*" value={state?.phoneNumber} disabled={!isLoaded} />
          </View>
      
          <ActionButtons
            disablePrimary={withoutName()}
            disableSecondary={withoutName()}
            onSecondaryClicked={cancel}
            onPrimaryClicked={save}
            primaryLabel="Save"
          />
        </ScrollView>
      </KeyboardAvoidingPageContent>
    </PageContainer>
  );

  // eslint-disable-next-line no-shadow
  function onUpdate(user: Partial<UserDto>) {
    setState({ ...state, ...user });
  }
  
  function cancel() {
    setState(profile as any);
    viewAccount({ userId });
  }

  function save() {
    const updateUserDto = state;
    const updateUserId = state._id;
    // @ts-ignore
    // updateUserDto,
    from(dispatch(updateAccount({ updateUserDto, userId: updateUserId })))
      .pipe(
        // @ts-ignore
        switchMap(() => dispatch(loadProfile(userId))),
        // @ts-ignore
        switchMap(() => dispatch(loadUser())),
        take(1)
      )
      .subscribe(() => viewAccount({ userId }));
  }
};

const styles = StyleSheet.create({
  formContainer: {
    padding: 10,
    paddingTop: 20,
  },
  formSection: {
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 22,
    color: '#fff',
  },
});

export default withLoadingSpinner(undefined)(AccountEdit);
