import supabase from '../supabase';
import {fetchSessions} from '../localStorage/fetch';
import {insertWorkout} from './insert';

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

export {fetchExercises, handleCheckSession};
