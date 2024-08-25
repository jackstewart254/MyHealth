import {fetchUser, storeUser} from '../localStorage/insert';
import supabase from '../supabase';

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
    email: 'someone@email.com',
    password: 'RtlzqzuXBZpwHJoDOgco',
  });
};

const addUser = async ({name}: {name: string}) => {
  const {data, error} = await supabase
    .from('users')
    .insert([{name: name}])
    .select();
  return data;
};

export {handleLogin, handleSignup, addUser};
