import {fetchUser} from '../localStorage/insert';
import supabase from '../supabase';
import {fetchExercises} from './fetch';

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

const insertSession = async () => {};

const insertWorkout = async session => {
  const exerciseSets = session.sets;
  const sessionExercises = session.exercises;
  const exercises = await fetchExercises();
  const user = JSON.parse(await fetchUser());
  const newExercises = [];
  const exerciseIDs = [];
  let newSetIds = [];
  if (exercises.length > 0) {
    for (let i = 0; i < sessionExercises.length; i++) {
      exerciseIDs.push(parseInt(sessionExercises[i].id, 10));
      const present = exercises.find(x => x.id === sessionExercises[i].id);
      if (present === undefined) {
        newExercises.push(sessionExercises[i]);
      }
    }
  }
  for (let i = 0; i < exerciseSets.length; i++) {
    newSetIds.push(parseInt(exerciseSets[i].id, 10));
    const {data, error} = await supabase
      .from('sets')
      .insert([
        {
          id: exerciseSets[i].id,
          exercise: exerciseSets[i].exercise_id,
          reps: exerciseSets[i].reps,
          weight: exerciseSets[i].weight,
          session_id: exerciseSets[i].session_num,
          order: exerciseSets[i].order,
          duration: exerciseSets.duration,
          distance: exerciseSets.distance,
          created_at: exerciseSets.created_at,
        },
      ])
      .select();
  }
  for (let i = 0; i < newExercises.length; i++) {
    insertExercise(newExercises[i]);
  }
  const {data, error} = await supabase
    .from('sessions')
    .insert([
      {
        id: session.id,
        created_at: session.date,
        exercises: exerciseIDs,
        sets: newSetIds,
        template_id: session.template_id,
        name: session.name,
        duration: session.duration,
        user_id: user.id,
      },
    ])
    .select();
};

export {insertWorkout};
