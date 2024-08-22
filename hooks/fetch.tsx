import supabase from '../supabase';

const fetchExercises = async () => {
  const {data: exercises} = await supabase.from('exercises').select('*');
  return exercises;
};

export {fetchExercises};
