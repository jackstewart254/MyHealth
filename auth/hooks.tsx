import AsyncStorage from '@react-native-async-storage/async-storage';
import {fetchUser, storeUser} from '../localStorage/insert';
import supabase from '../supabase';

const insertProfiles = async (id, fcm) => {
  const {data, error} = await supabase
    .from('profiles')
    .insert([{id: id, fcm_token: fcm}])
    .select();
  if (error) {
    console.log(error);
  } else {
    console.log(data);
  }
};

const handleSignup = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  console.log('sign up');
  let {data, error} = await supabase.auth.signUp({
    email: email,
    password: password,
  });
  console.log(data, error);
};

const handleLogin = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  let {data, error} = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });
  storeUser(data);
  if (error === null) {
    const fcm = await AsyncStorage.getItem('fcm');
    if (fcm?.length > 0) {
      await insertProfiles(data.session?.user.id, fcm);
    }
    return data;
  } else {
    return false;
  }
};

const addUser = async ({name}: {name: string}) => {
  const {data, error} = await supabase
    .from('users')
    .insert([{name: name}])
    .select();
  return data;
};

export {handleLogin, handleSignup, addUser};
