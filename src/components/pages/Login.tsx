import React, { useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, ScrollView, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { loginAction } from 'mediashare/store/modules/user';
import { withLoadingSpinner } from 'mediashare/components/hoc/withLoadingSpinner';
import { Text, Card, TextInput, HelperText, Button } from 'react-native-paper';
import { ErrorBoundary } from 'mediashare/components/error/ErrorBoundary';
import { PageContainer, PageProps, KeyboardAvoidingPageContent } from 'mediashare/components/layout/PageContainer';
import { theme } from 'mediashare/styles';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Auth } from 'aws-amplify';
import { useSnack } from 'mediashare/hooks/useSnack';
import { routeConfig } from 'mediashare/routes';
import { MaterialIcons } from '@expo/vector-icons';
import Loader from "../loader/Loader";
interface FormData {
  username: string;
  password: string;
}

const LoginComponent = ({}: PageProps) => {
  const dispatch = useDispatch();
  const nav = useNavigation();
  const { element, onToggleSnackBar, setMessage } = useSnack();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const response = await Auth.signIn(data.username, data.password);
      const accessToken = response.signInUserSession.accessToken.jwtToken;
      const idToken = response.signInUserSession.idToken.jwtToken;
      await dispatch(loginAction({ accessToken, idToken }));
    } catch (error) {
      setMessage(error.message);
      onToggleSnackBar();
      if (error.code === 'UserNotConfirmedException') {
        // @ts-ignore
        nav.navigate(routeConfig.confirm.name, { username: data.username });
        reset();
      }
      console.log(error.code);
      console.log('login', error);
    }
  };

  const onHandleForgotPassword = () => {
    nav.navigate(routeConfig.resetPassword.name as never, {} as never);
  };

  const onHandleSignUp = () => {
    nav.navigate(routeConfig.signUp.name as never, {} as never);
  };
  
  useFocusEffect(() => {
    const backAction = () => {
      Alert.alert('Logout', 'Are you sure you want to exit the app?', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            BackHandler.exitApp();
          },
        },
      ]);
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  });


  const toggleShowPassword = () => setShowPassword(!showPassword);

  return (
    <PageContainer>
      <KeyboardAvoidingPageContent>
        <ScrollView>
          <View style={{ flex: 1, justifyContent: 'flex-start' }}>
            <Card elevation={0}>
              <Card.Cover
                resizeMode="contain"
                source={require('mediashare/assets/splash.png')}
                style={{ height: 300, width: '100%', marginHorizontal: 'auto', marginVertical: 15, marginBottom: 50, backgroundColor: theme.colors.background }}
              />
            </Card>
            <View style={{ paddingVertical: 10 }}>
              <Text variant="displayLarge" style={{ fontSize: 20 }}>
                Sign in to account
              </Text>
            </View>
            <Controller
              control={control}
              name="username"
              rules={{
                required: 'Required',
              }}
              render={({ field: { onChange, onBlur, value } }) => {
                return (
                  <View>
                    <TextInput autoCapitalize="none" label="Username" value={value} onBlur={onBlur} onChangeText={(value) => onChange(value?.toLowerCase())} />
                    <HelperText type="error">{errors.username?.message}</HelperText>
                  </View>
                );
              }}
            />
        
            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Required',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    autoCapitalize="none"
                    label="Password"
                    textContentType="password"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={(value) => onChange(value)}
                    secureTextEntry={!showPassword}
                    right={<TextInput.Icon  size={20} icon={showPassword ? 'visibility' : 'visibility-off'} onPress={toggleShowPassword} />}
                  />
                  <HelperText type="error">{errors.password?.message}</HelperText>
                </>
              )}
            />
        
            <Button
              style={{
                borderRadius: 10,
                padding: 5,
              }}
              mode="contained"
              onPress={handleSubmit(onSubmit)}
            >
              Sign In
            </Button>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingTop: 10,
              }}
            >
              <Button labelStyle={{ fontSize: 10 }} mode="text" onPress={onHandleForgotPassword}>
                Forgot password?
              </Button>
              <Button labelStyle={{ fontSize: 10 }} mode="text" onPress={onHandleSignUp}>
                Don't have an account?
              </Button>
            </View>
            {element}
          </View>
        </ScrollView>
      </KeyboardAvoidingPageContent>
    </PageContainer>
  );
};

export default withLoadingSpinner(undefined)(LoginComponent);
