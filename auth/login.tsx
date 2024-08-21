import {
  View,
  Text,
  Dimensions,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {addUser, handleLogin, handleSignup} from './hooks';
import {clearKey, fetchUser, storeUser} from '../localStorage/insert';
import {useWorkoutTracker} from '../contexts/workoutTracker';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

const Login = () => {
  const [press, setPress] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fetch, setFetch] = useState(false);
  const {workoutTracker, setWorkoutTracker} = useWorkoutTracker();

  const send = async () => {
    await handleSignup({email: email, password: password});
  };

  const sign = async () => {
    await handleLogin({email: email, password: password});
  };

  useEffect(() => {
    if (fetch === true) {
      const func = async () => {
        const res = await addUser({name: email});
        storeUser(res[0]);
        setFetch(false);
        setWorkoutTracker({...workoutTracker, hideLogin: true});
      };
      func();
    }
  }, [fetch]);

  useEffect(() => {
    setPassword('');
    setEmail('');
  }, [press]);

  const signup = () => {
    return (
      <View style={{flexDirection: 'column', alignItems: 'center'}}>
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
        <TextInput
          value={password}
          onChangeText={text => {
            setPassword(text);
          }}
          textContentType="password"
          autoCapitalize="none"
          placeholder="Password"
          placeholderTextColor="white"
          style={{
            fontSize: 14,
            fontFamily: 'SFUIText-Regular',
            borderWidth: 1,
            borderColor: 'white',
            borderRadius: 5,
            width: width * 0.6,
            padding: 10,
            marginBottom: 10,
            color: 'white',
          }}
        />
        <TouchableOpacity
          onPress={send}
          style={{
            width: width * 0.6,
            padding: 10,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#00B0FF',
            borderRadius: 10,
            marginBottom: 10,
          }}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: 'SFUIText-Medium',
              color: '#2B384B',
            }}>
            Sign up
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setPress(0);
          }}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: '#D9D9D9',
            borderRadius: 10,
          }}>
          <Text>Back</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const signin = () => {
    return (
      <View style={{flexDirection: 'column', alignItems: 'center'}}>
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
        <TextInput
          value={password}
          onChangeText={text => {
            setPassword(text);
          }}
          placeholder="Password"
          textContentType="password"
          placeholderTextColor="white"
          autoCapitalize="none"
          // secureTextEntry
          style={{
            fontSize: 14,
            fontFamily: 'SFUIText-Regular',
            borderWidth: 1,
            borderColor: 'white',
            borderRadius: 5,
            width: width * 0.6,
            padding: 10,
            marginBottom: 10,
            color: 'white',
          }}
        />
        <TouchableOpacity
          onPress={sign}
          style={{
            width: width * 0.6,
            padding: 10,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#00B0FF',
            borderRadius: 10,
            marginBottom: 10,
          }}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: 'SFUIText-Medium',
              color: '#2B384B',
            }}>
            Sign in
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setPress(0);
          }}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: '#D9D9D9',
            borderRadius: 10,
          }}>
          <Text>Back</Text>
        </TouchableOpacity>
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
      <TextInput
        value={email}
        onChangeText={text => {
          setEmail(text);
        }}
        placeholder="Name"
        textContentType="password"
        placeholderTextColor="white"
        autoCapitalize="none"
        // secureTextEntry
        style={{
          fontSize: 14,
          fontFamily: 'SFUIText-Regular',
          borderWidth: 1,
          borderColor: 'white',
          borderRadius: 5,
          width: width * 0.6,
          padding: 10,
          marginBottom: 10,
          color: 'white',
        }}
      />
      <TouchableOpacity
        onPress={() => {
          setFetch(true);
        }}
        style={{
          width: width * 0.6,
          padding: 10,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#00B0FF',
          borderRadius: 10,
          marginBottom: 10,
        }}>
        <Text
          style={{
            fontSize: 14,
            fontFamily: 'SFUIText-Medium',
            color: '#2B384B',
          }}>
          Next
        </Text>
      </TouchableOpacity>
      {/* {press === 0 ? (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity
            onPress={() => {
              setPress(1);
            }}>
            <Text
              style={{
                fontSize: 20,
                color: 'white',
                fontFamily: 'SFUIText-Regular',
                padding: 20,
              }}>
              Sign up
            </Text>
          </TouchableOpacity>
          <View
            style={{
              width: 2,
              height: 20,
              backgroundColor: 'white',
              borderRadius: 10,
            }}
          />
          <TouchableOpacity
            onPress={() => {
              setPress(2);
            }}>
            <Text
              style={{
                fontSize: 20,
                color: 'white',
                fontFamily: 'SFUIText-Regular',
                padding: 20,
              }}>
              Sign in
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>{(press === 1 && signup()) || (press === 2 && signin())}</View>
      )} */}
    </View>
  );
};

export default Login;
