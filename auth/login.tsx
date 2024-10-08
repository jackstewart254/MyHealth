import {
  View,
  Text,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {addUser, handleLogin, handleSignup} from './hooks';
import {clearKey, fetchUser, storeUser} from '../localStorage/insert';
import {useWorkoutTracker} from '../contexts/workoutTracker';
import supabase from '../supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {insertError} from '../hooks/insert';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

const Login = () => {
  const [press, setPress] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [fetch, setFetch] = useState(false);
  const {workoutTracker, setWorkoutTracker} = useWorkoutTracker();
  const [signupPressed, setSignupPressed] = useState(false);

  const send = async () => {
    if (email.length === 0 || password.length === 0) {
      Alert.alert('Email or Password is empty');
    } else {
      const res = await handleSignup({email: email, password: password});
      if (res === null) {
        Alert.alert('Check your email for confirmation link');
        setSignupPressed(true);
      } else {
        insertError('Signup', res);
        Alert.alert('Error, try again later');
      }
    }
  };

  const sign = async () => {
    if (workoutTracker.logOut === true) {
      Alert.alert('Restart your app');
    } else {
      if (email.length === 0 || password.length === 0) {
        Alert.alert('Email or Password is empty');
      } else {
        const res = await handleLogin({email: email, password: password});
        if (res === null) {
          insertError('Signin', res);
          Alert.alert('Check your emails for confirmation link');
        } else {
          setWorkoutTracker({...workoutTracker, hideLogin: true});
        }
      }
    }
  };

  useEffect(() => {
    setPassword('');
    setEmail('');
  }, [press]);

  const signup = () => {
    return (
      <View
        style={{
          flexDirection: 'column',
          alignItems: 'center',
          width: width * 0.6,
        }}>
        <TextInput
          value={email}
          onChangeText={text => {
            setEmail(text);
          }}
          placeholder="Email"
          placeholderTextColor="white"
          autoCapitalize="none"
          style={{
            fontSize: 14,
            fontFamily: 'SFUIText-Regular',
            borderWidth: 1,
            borderColor: 'white',
            borderRadius: 5,
            width: width * 0.6,
            marginBottom: 10,
            padding: 10,
            color: 'white',
          }}
        />
        <View
          style={{
            width: '100%',
            borderWidth: 1,
            borderColor: 'white',
            marginBottom: 10,
            borderRadius: 5,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <TextInput
            value={password}
            onChangeText={text => {
              setPassword(text);
            }}
            textContentType="password"
            autoCapitalize="none"
            placeholder="Password"
            placeholderTextColor="white"
            secureTextEntry={showPassword}
            style={{
              fontSize: 14,
              fontFamily: 'SFUIText-Regular',
              borderRadius: 5,
              color: 'white',
              padding: 10,
              width: '77%',
            }}
          />
          <TouchableOpacity
            style={{
              padding: 10,
            }}
            onPress={() => {
              setShowPassword(!showPassword);
            }}>
            <Text
              style={{
                fontSize: 14,
                fontFamily: 'SFUIText-Light',
                color: 'white',
              }}>
              Show
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {signupPressed === false ? (
            <TouchableOpacity
              onPress={send}
              style={{width: '50%', paddingRight: 5}}>
              <View
                style={{
                  padding: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#00B0FF',
                  borderRadius: 10,
                }}>
                <Text
                  style={{
                    fontFamily: 'SFUIText-Medium',
                    color: '#2B384B',
                  }}>
                  Sign up
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={{width: '50%', paddingRight: 5}}>
              <View
                style={{
                  padding: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#D9D9D9',
                  borderRadius: 10,
                }}>
                <Text
                  style={{
                    fontFamily: 'SFUIText-Medium',
                    color: '#2B384B',
                  }}>
                  Sign up
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            onPress={sign}
            style={{width: '50%', paddingLeft: 5}}>
            <View
              style={{
                padding: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#00B0FF',
                borderRadius: 10,
              }}>
              <Text
                style={{
                  fontFamily: 'SFUIText-Medium',
                  color: '#2B384B',
                }}>
                Sign in
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View
      style={{
        width: width,
        height: height,
        backgroundColor: '#2B384B',
        position: 'absolute',
        zIndex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {signup()}
    </View>
  );
};

export default Login;
