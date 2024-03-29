import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { View, StyleSheet, ScrollView } from 'react-native';
import * as R from 'remeda';
import { from } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { UserDto } from 'mediashare/apis/user-svc/rxjs-api';
import { loadUser, updateAccount } from 'mediashare/store/modules/user';
import { loadProfile } from 'mediashare/store/modules/profile';
import { routeNames } from 'mediashare/routes';
import { useRouteWithParams } from 'mediashare/hooks/navigation';
import { useProfile } from 'mediashare/hooks/useProfile';
import { UploadResult, useUploader } from 'mediashare/hooks/useUploader';
import { TextInput } from 'react-native-paper';
import { withLoadingSpinner } from 'mediashare/components/hoc/withLoadingSpinner';
import { PageContainer, PageProps, ActionButtons, AccountCard, KeyboardAvoidingPageContent } from 'mediashare/components/layout';
import { HelperText } from 'react-native-paper';
import Loader from '../loader/Loader';

interface AccountEditProps extends PageProps {}

const AccountEdit = ({ route }: AccountEditProps) => {
  const { userId = null } = route.params;
  const dispatch = useDispatch();
  const viewAccount = useRouteWithParams(routeNames.account);
  const [isLoaded, setIsLoaded] = useState(false);

  const profile = useProfile();
  const [state, setState] = useState(R.pick(profile, ['username', 'email', 'firstName', 'lastName', 'phoneNumber', 'imageSrc', 'role', '_id']));
  const withoutName = () => state?.username?.length<1 || state?.firstName?.length < 1 || state?.lastName?.length < 1 || state?.email?.length < 1 || state?.phoneNumber?.length < 1 ||validEmail   ;

  const fullName = state?.firstName && state?.lastName ? `${state?.firstName} ${state?.lastName}` : 'Unnamed User';
  const [uploading, setUploading] = useState(false);
  const [validEmail, setValidEmail] = useState(false)
  const { pickImage } = useUploader({
    onUploadStart,
    onUploadComplete
  });
  
  useEffect(() => {
    async function loadData() {
      const profile = (await dispatch(loadProfile(userId))) as any;
      setState(profile?.payload);
      setIsLoaded(true);
    }
    if (!isLoaded) {
      loadData().then();
    }
  }, []);

  useEffect(() => {
    checkEmail()
  }, [state?.email])
  
  const checkEmail = () => {
  
  var reg =
  /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

  if (reg.test(state?.email) != true) {
    setValidEmail(true)
  } else {
    setValidEmail(false)
  }
};


  return (
    <PageContainer>
      <Loader loading={uploading}/>
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
            <TextInput  label="Shared Type" value={state?.role} disabled={true}   >
            </TextInput>
            <HelperText style={{top:-11}} type="error">{''}</HelperText>
          </View>
          <View style={styles.formSection}>
            <TextInput  onChangeText={(text) => onUpdate({ username: text })} label="Username*" value={state?.username?.toLowerCase()} disabled={true} />
            <HelperText style={{top:-11}} type="error">{state?.username?.length===0? 'Required':''}</HelperText>
          </View>
          <View style={styles.formSection}>
            <TextInput onChangeText={(text) => onUpdate({ firstName: text })} label="First Name*" value={state?.firstName} disabled={!isLoaded} />
            <HelperText style={{top:-11}} type="error">{state?.firstName?.length===0? 'Required':''}</HelperText>
          </View>
          <View style={styles.formSection}>
            <TextInput onChangeText={(text) => onUpdate({ lastName: text })} label="Last Name*" value={state?.lastName} disabled={!isLoaded} />
            <HelperText style={{top:-11}} type="error">{state?.lastName?.length===0? 'Required':''}</HelperText>
          </View>
          <View style={styles.formSection}>
            <TextInput onChangeText={(text) => onUpdate({ email: text })} label="Email*" value={state?.email?.toLowerCase()} disabled={!isLoaded} />
            <HelperText style={{top:-11}} type="error">{validEmail || state?.email?.length===0? 'Please enter valid email':''}</HelperText>
          </View>
          <View style={styles.formSection}>
            <TextInput  onChangeText={(text) => onUpdate({ phoneNumber: text })} label="Phone Number*" value={state?.phoneNumber} disabled={!isLoaded} />
            <HelperText  type="error">{state?.phoneNumber?.length===0? 'Required':''}</HelperText>
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
  
  async function onUploadStart() {
    setUploading(true);
  }
  
  async function onUploadComplete({ uri }: UploadResult) {
    setUploading(false);
    setState({ ...state, imageSrc: uri });
  }

  // eslint-disable-next-line no-shadow
  function onUpdate(user: Partial<UserDto>) {
    // TODO: Fix types!
    setState({ ...state, ...user } as any);
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
    // marginBottom: 5,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 22,
    color: '#fff',
  },
});

export default withLoadingSpinner(undefined)(AccountEdit);
