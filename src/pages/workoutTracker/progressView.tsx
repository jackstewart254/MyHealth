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
import {getExercise} from '../../../localStorage/fetch';

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
      const res = await getExercise('exercise');
      setExerciseSet(res);
      setSearchArray(res);
    };

    fetch();
  }, []);

  const renderResults = () => {
    return (
      <View
        style={{
          width: '50%',
          padding: 10,
          backgroundColor: '#E2E2E2',
          borderRadius: 10,
          maxHeight: height / 2,
          overflow: 'hidden',
        }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {searchArray.map((exercise, index) => {
            return (
              <TouchableOpacity
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
          onChangeText={text => {
            setSearch(text);
          }}
          placeholder="Search for exercises"
          placeholderTextColor={'#76777D'}
          value={search}
          style={{
            height: '100%',
            width: '76.6%',
            paddingHorizontal: 10,
            fontSize: 14,
            fontFamily: 'SFUIText-Regular',
          }}
        />
        {/* <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: '#02BC86',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              fontFamily: 'SFUIText-Medium',
              color: 'white',
              fontSize: 14,
            }}>
            Search
          </Text>
        </TouchableOpacity> */}
      </View>
      {search.length > 0 && renderResults()}
    </View>
  );
};

export default Progress;
