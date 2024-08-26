import {
  Dimensions,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import supabase from '../../../supabase';
import {storeAuth} from '../../../localStorage/insert';
import {useWorkoutTracker} from '../../../contexts/workoutTracker';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

const Profile = () => {
  const {workoutTracker, setWorkoutTracker} = useWorkoutTracker();
  const [email, setEmail] = useState('');
  const [id, setId] = useState('');

  useEffect(() => {
    fetchUser();
  }, []);

  const handleSignout = async () => {
    let {error} = await supabase.auth.signOut();
    storeAuth(null);
    setWorkoutTracker({...workoutTracker, logOut: true});
  };

  const fetchUser = async () => {
    const res = JSON.parse(await AsyncStorage.getItem('auth'));
    setEmail(res.user.email);
    setId(res.user.id);
  };

  return (
    <View
      style={{
        width: width,
        height: height,
        backgroundColor: '#24262E',
        padding: 20,
      }}>
      <View style={{height: height * 0.05}} />
      <Text
        style={{
          marginBottom: 10,
          fontSize: 16,
          fontFamily: 'SFUIText-Medium',
          color: 'white',
        }}>
        User ID
      </Text>
      <View
        style={{
          width: '100%',
          borderWidth: 1,
          borderColor: '#E2E2E2',
          borderRadius: 5,
          marginBottom: 10,
        }}>
        <Text
          style={{
            fontSize: 14,
            fontFamily: 'SFUIText-Medium',
            color: 'white',
            padding: 10,
          }}>
          {id}
        </Text>
      </View>
      <Text
        style={{
          marginBottom: 10,
          fontSize: 16,
          fontFamily: 'SFUIText-Medium',
          color: 'white',
        }}>
        Email
      </Text>
      <View
        style={{
          width: '100%',
          borderWidth: 1,
          borderColor: '#E2E2E2',
          borderRadius: 5,
          marginBottom: 10,
        }}>
        <Text
          style={{
            fontSize: 14,
            fontFamily: 'SFUIText-Medium',
            color: 'white',
            padding: 10,
          }}>
          {email}
        </Text>
      </View>
      <TouchableOpacity
        onPress={handleSignout}
        style={{
          width: '100%',
          padding: 10,
          backgroundColor: '#FF2A00',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 10,
        }}>
        <Text
          style={{
            color: '#24262E',
            fontSize: 14,
            fontFamily: 'SFUIText-Medium',
          }}>
          Sign out
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Profile;
