import React from 'react';
import { ScrollView, View } from 'react-native';
import { ErrorBoundary } from 'mediashare/components/error/ErrorBoundary';
import { PageContainer, PageProps, KeyboardAvoidingPageContent } from 'mediashare/components/layout/PageContainer';
import { TextInput, HelperText, Button, Text } from 'react-native-paper';
import { ThemeProvider, useNavigation } from '@react-navigation/native';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { Auth } from 'aws-amplify';
import { useSnack } from 'mediashare/hooks/useSnack';
import { routeConfig } from 'mediashare/routes';
import PhoneInput from 'react-native-phone-number-input';
import { theme } from 'mediashare/styles';
import Loader from '../../loader/Loader';
import { useState } from 'react';
import Icon from 'react-native-vector-icons/Fontisto';
import { Colors } from 'react-native/Libraries/NewAppScreen';
interface FormData {
  username: string;
  password: string;
  email: string;
  phone: string;
}

const SignUpComponent = ({ }: PageProps) => {
  const nav = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => setShowPassword(!showPassword);
  const [show, setShow] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      username: '',
      password: '',
      email: '',
      phone: '',
    },
  });

  const { element, onToggleSnackBar, setMessage } = useSnack();

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (show) {
      try {
        const { username, password, email, phone } = data;
        await Auth.signUp({
          username,
          password,
          attributes: {
            email,
            phone_number: phone,
          },
        });
        // @ts-ignore

        nav.navigate(routeConfig.confirm.name, { username });
      } catch (error) {
        console.log(error.message, 'error.message');
        setMessage(error.message);
        onToggleSnackBar();
        console.log('sign up error', error);
      }
    } else {
      setMessage('Please select Terms and Conditions');
      onToggleSnackBar();
    }
  };

  const onHandleBack = () => {
    reset();
    nav.navigate(routeConfig.login.name as never, {} as never);
  };

  return (
    <PageContainer>
      <KeyboardAvoidingPageContent>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            height: '100%',
            justifyContent: 'center',
          }}
        >
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text variant="displayLarge" style={{ fontSize: 20, paddingBottom: 10 }}>
              Create your account
            </Text>
            <Controller
              control={control}
              name="username"
              rules={{
                required: 'Required',
                minLength: {
                  value: 4,
                  message: 'Too short!',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput autoCapitalize="none" label="Username" value={value} onBlur={onBlur} onChangeText={(value) => onChange(value?.toLowerCase())} />
                  <HelperText type="error">{errors.username?.message}</HelperText>
                </>
              )}
            />
        
            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Required',
                minLength: {
                  value: 8,
                  message: 'Please enter a strong password',
                },
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
                    right={<TextInput.Icon size={20} icon={showPassword ? 'visibility' : 'visibility-off'} onPress={toggleShowPassword} />}
                  />
                  <HelperText type="error">{errors.password?.message}</HelperText>
                </>
              )}
            />
        
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Required',
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput autoCapitalize="none" label="Email" value={value} onBlur={onBlur} onChangeText={(value) => onChange(value?.toLowerCase())} />
                  <HelperText type="error">{errors.email?.message}</HelperText>
                </>
              )}
            />
            <Controller
              name="phone"
              rules={{
                required: 'Required',
              }}
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <PhoneInput
                    defaultValue={value}
                    layout="first"
                    onChangeText={(value) => onChange(value)}
                    onChangeFormattedText={(value) => onChange(value)}
                    defaultCode="US"
                    withDarkTheme={true}
                    containerStyle={{ backgroundColor: '#252525', width: '100%' }}
                    textContainerStyle={{ backgroundColor: '#252525' }}
                    codeTextStyle={{ color: theme.colors.primary }}
                    textInputStyle={{ color: '#fff' }}
                  />
                  <HelperText type="error">{errors.phone?.message}</HelperText>
                </View>
              )}
            />
            <View style={{ flexDirection: "row", }}>
              <View style={{ alignItems: "center" ,padding:1.5}}>
                <Icon color={'white'} onPress={() => setShow(!show)} size={!show ? 17.5 : 16} name={show ? 'checkbox-active' : 'checkbox-passive'} />
              </View>
              <View style={{ marginLeft: 11 }} >
                <Text variant="displayLarge" style={{ fontSize: 13 }}>
                  By creating an account, you agree to our
                </Text>
                <Button style={{ alignSelf: "flex-start", marginHorizontal: -14 }} labelStyle={{ fontSize: 10, textDecorationLine: "underline", marginTop: 0, paddingRight: 42 }} mode="text" onPress={() => Linking.openURL('https://www.afehrpt.com/app-terms-of-service/')}>
                  Terms and Conditions
                </Button>
              </View>
            </View>
            <Button
              style={{
                borderRadius: 10,
                padding: 5,
                marginTop: 14
              }}
              mode="contained"
              onPress={handleSubmit(onSubmit)}
            >
              Sign Up
            </Button>
        
            <Button style={{ paddingTop: 10 }} labelStyle={{ fontSize: 10 }} mode="text" onPress={onHandleBack}>
              Back to sign in
            </Button>
          </View>
          {element}
        </ScrollView>
      </KeyboardAvoidingPageContent>
    </PageContainer>
  );
};

export default SignUpComponent;
