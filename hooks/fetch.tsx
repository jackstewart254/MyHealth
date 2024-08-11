import supabase from '../supabase';

const fetchExercises = async () => {
  const {data: exercises, error} = await supabase.from('exercises').select('*');
  return exercises;
};

export {fetchExercises};
