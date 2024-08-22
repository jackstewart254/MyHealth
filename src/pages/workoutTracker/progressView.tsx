import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import {useWorkoutTracker} from '../../../contexts/workoutTracker';
import {fetchSets, getExercise} from '../../../localStorage/fetch';
import {format} from 'date-fns';

const height = Dimensions.get('screen').height;

const Progress = () => {
  const {wt, setWt} = useWorkoutTracker();
  const [exerciseSet, setExerciseSet] = useState([]);
  const [pressed, setPressed] = useState({
    id: 0,
    name: '',
    type: 0,
    bar_type: 0,
  });
  const [search, setSearch] = useState('');
  const [searchArray, setSearchArray] = useState([]);
  const [selected, setSelected] = useState({
    bar_type: 0,
    id: 0,
    name: '',
    type: 0,
  });
  const [sets, setSets] = useState([]);
  const [close, setClose] = useState(false);

  // const

  useEffect(() => {
    const findMatchingNames = (searchValue, array) => {
      return array.filter(item =>
        item.name.toLowerCase().includes(searchValue.toLowerCase()),
      );
    };
    setSearchArray(findMatchingNames(search, exerciseSet));
  }, [search]);

  useEffect(() => {
    const fetch = async () => {
      const res = await fetchSets(selected.id);
      setSets(res);
    };

    fetch();
  }, [selected]);

  useEffect(() => {
    const fetch = async () => {
      const res = await getExercise('exercise');
      setSearchArray(res);
      setExerciseSet(res);
    };
    fetch();
  }, []);

  const renderResults = () => {
    return (
      <View
        style={{
          left: 20,
          width: '50%',
          padding: 10,
          backgroundColor: '#E2E2E2',
          borderRadius: 10,
          maxHeight: height / 2,
          overflow: 'hidden',
          position: 'absolute',
          zIndex: 1,
          top: 48,
        }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {searchArray.map((exercise, index) => {
            return (
              <TouchableOpacity
                onPress={() => {
                  setSelected(exercise);
                  setSearch(exercise.name);
                  setClose(false);
                }}
                key={exercise.id}
                style={{flexDirection: 'row', width: '100%'}}>
                <Text
                  style={{
                    fontFamily: 'SFUIText-Regular',
                    color: 'black',
                    fontSize: 14,
                    paddingVertical: 14,
                    width: '100%',
                    textAlign: 'left',
                  }}>
                  {exercise.name}{' '}
                  {(exercise.bar_type === 1 && '(Barbell)') ||
                    (exercise.bar_type === 2 && '(Dumbbell)')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <View
      style={{flexDirection: 'column', width: '100%', paddingHorizontal: 20}}>
      <View
        // horizontal
        style={{
          width: '100%',
          height: 38,
          backgroundColor: '#E2E2E2',
          borderRadius: 10,
          flexDirection: 'row',
          overflow: 'hidden',
          marginBottom: 10,
        }}>
        <TextInput
          onFocus={() => {
            setClose(true);
          }}
          onPress={() => {
            setClose(true);
          }}
          onChangeText={text => {
            setSearch(text);
          }}
          placeholder="Search for exercises"
          placeholderTextColor={'#24262E'}
          value={search}
          style={{
            height: '100%',
            width: '76.6%',
            paddingHorizontal: 10,
            fontSize: 14,
            fontFamily: 'SFUIText-Regular',
          }}
        />
      </View>
      {search.length > 0 && close === true && renderResults()}
      {/* <ScrollView showsVerticalScrollIndicator>
        {sets.map(item => {
          return (
            <View
              key={item.id}
              style={{
                width: '100%',
                flexDirection: 'row',
                backgroundColor: '#24262E',
                marginBottom: 20,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: 'white',
                borderRadius: 5,
                padding: 10,
              }}>
              <Text
                style={{
                  padding: 5,
                  fontFamily: 'SFUIText-Medium',
                  color: 'white',
                }}>
                {item.order}
              </Text>
              <Text
                style={{
                  padding: 5,
                  fontFamily: 'SFUIText-Medium',
                  color: 'white',
                }}>
                {format(item.created_at, 'dd/mm/yyyy')}
              </Text>
              <Text>{item.weight}</Text>
            </View>
          );
        })}
      </ScrollView> */}
    </View>
  );
};

export default Progress;
