import AsyncStorage from '@react-native-async-storage/async-storage';
import {fetchUser, storeAuth, storeUser} from '../localStorage/insert';
import supabase from '../supabase';
import axios, {Axios} from 'axios';

const insertProfiles = async (id, fcm) => {
  const {data, error} = await supabase
    .from('profiles')
    .insert([{id: id, fcm_token: fcm}])
    .select();
  if (error) {
  } else {
  }
};

const handleSignup = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const local = 'http://localhost:3000/api/signup';
  const xternal = 'https://mclean-api.vercel.app/api/login';
  const response = await axios.post(xternal, {
    email: email,
    password: password,
  });
  const {data, error} = response.data;
  return error;
};

const handleLogin = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const local = 'http://localhost:3000/api/login';
  const xternal = 'https://mclean-api.vercel.app/api/login';
  const response = await axios.post(xternal, {
    email: email,
    password: password,
  });
  const {data, error} = response.data;
  storeAuth(data);
  if (data) {
    const fcm = await AsyncStorage.getItem('fcm');
    if (fcm?.length > 0) {
      await insertProfiles(data.user?.id, fcm);
    }
    return true;
  } else {
    return error;
  }
};

// const addUser = async ({name}: {name: string}) => {
//   const {data, error} = await supabase
//     .from('users')
//     .insert([{name: name}])
//     .select();
//   return data;
// };

export {handleLogin, handleSignup, insertProfiles};
