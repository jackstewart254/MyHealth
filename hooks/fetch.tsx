import supabase from '../supabase';
import {fetchSessions} from '../localStorage/fetch';
import {insertWorkout} from './insert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {insertProfiles} from '../auth/hooks';

const fetchExercises = async () => {
  const {data: exercises} = await supabase.from('exercises').select('*');
  return exercises;
};

const handleCheckSession = async () => {
  const {data: sessions} = await supabase.from('sessions').select('id');
  const res = await fetchSessions();
  let notStored = [];

  for (let i = 0; i < res.length; i++) {
    let present = sessions.find(sess => sess.id === res[i].id);
    if (present === undefined) {
      notStored.push(res[i]);
    }
  }
  for (let i = 0; i < notStored.length; i++) {
    await insertWorkout(notStored[i]);
  }
};

const checkProfiles = async () => {
  const user = JSON.parse(await AsyncStorage.getItem('auth'));
  const fcm = await AsyncStorage.getItem('fcm');
  const {data, error} = await supabase.from('profiles').select('*');
  if (fcm !== null && user !== null) {
    const present = data.find(id => id.id === user.user.id);
    if (present === undefined) {
      await insertProfiles(user.user.id, fcm);
    }
  }
};

export {fetchExercises, handleCheckSession, checkProfiles};
