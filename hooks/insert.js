import AsyncStorage from '@react-native-async-storage/async-storage';
import {fetchUser} from '../localStorage/insert';
import supabase from '../supabase';
import {fetchExercises} from './fetch';
import {differenceInSeconds} from 'date-fns';
import axios from 'axios';

const insertExercise = async exercise => {
  const {data, error} = await supabase
    .from('exercises')
    .insert([
      {
        id: exercise.id,
        bar_type: exercise.bar_type,
        type: exercise.bar_type,
        name: exercise.name,
      },
    ])
    .select();
};

const insertWorkout = async session => {
  const user = JSON.parse(await AsyncStorage.getItem('auth'));
  // const local = 'http://localhost:3000/api/insert-workout';
  const xternal = 'https://mclean-api.vercel.app/api/insert-workout';
  await axios.post(xternal, {session: session, user: user});
  // const newExercises = [];
  // const exerciseIDs = [];
  // let newSetIds = [];
  // if (exercises.length > 0) {
  //   for (let i = 0; i < sessionExercises.length; i++) {
  //     exerciseIDs.push(parseInt(sessionExercises[i].id, 10));
  //     const present = exercises.find(x => x.id === sessionExercises[i].id);
  //     if (present === undefined) {
  //       newExercises.push(sessionExercises[i]);
  //     }
  //   }
  // }
  // for (let i = 0; i < exerciseSets.length; i++) {
  //   newSetIds.push(parseInt(exerciseSets[i].id, 10));
  //   const {data, error} = await supabase
  //     .from('sets')
  //     .insert([
  //       {
  //         id: exerciseSets[i].id,
  //         exercise: exerciseSets[i].exercise_id,
  //         reps: parseInt(exerciseSets[i].reps, 10),
  //         weight: parseInt(exerciseSets[i].weight, 10),
  //         session_id: parseInt(exerciseSets[i].session_num, 10),
  //         order: parseInt(exerciseSets[i].order, 10),
  //         duration: parseInt(exerciseSets.duration, 10),
  //         distance: parseInt(exerciseSets.distance, 10),
  //         created_at: exerciseSets[i].created_at,
  //         user_id: user.user.id,
  //         rest:
  //           exerciseSets[i].rest !== undefined
  //             ? differenceInSeconds(
  //                 new Date(exerciseSets[i].rest.end),
  //                 new Date(exerciseSets[i].rest.start),
  //               )
  //             : 0,
  //       },
  //     ])
  //     .select();
  // }
  // for (let i = 0; i < newExercises.length; i++) {
  //   insertExercise(newExercises[i]);
  // }
  // const {data, error} = await supabase
  //   .from('sessions')
  //   .insert([
  //     {
  //       id: session.id,
  //       created_at: session.date,
  //       exercises: exerciseIDs,
  //       sets: newSetIds,
  //       template_id: session.template_id,
  //       name: session.name,
  //       duration: session.duration,
  //       user_id: user.user.id,
  //     },
  //   ])
  //   .select();
};

const insertError = async (location, uError) => {
  const user = JSON.parse(await AsyncStorage.getItem('auth'));
  const {data, error} = supabase.from('errors').insert([
    {
      message: uError,
      location: location,
      user: user !== null ? user.user.id : null,
    },
  ]);
  console.log(data, error);
};

const insertActivity = async state => {
  const user = JSON.parse(await AsyncStorage.getItem('auth'));
  if (user !== null) {
    const conc =
      'https://mclean-api.vercel.app/api/insert/' + user.user.id + '/' + state;
    await axios.post(conc);
  }
};

export {insertWorkout, insertError, insertActivity};
