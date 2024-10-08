/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Pressable,
} from 'react-native';
import CreateWorkout from './createWorkout';
import {useWorkoutTracker} from '../../../contexts/workoutTracker';
import {
  fetchActiveWorkout,
  fetchSessions,
  fetchSets,
  getExercise,
  getTemplates,
} from '../../../localStorage/fetch';
import {
  clearKey,
  clearStorage,
  setActiveWorkoutState,
} from '../../../localStorage/insert';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  addSeconds,
  format,
  differenceInMinutes,
  differenceInSeconds,
  startOfWeek,
  addDays,
} from 'date-fns';
import {
  Cross,
  HomeEmpty,
  HomeFilled,
} from '../../../assets/svgs/workoutTrackerSvgs';
import GenerateRandomID from './generateRandomID';
import Progress from './progressView';
import ConnectionStatus from '../../components/connectionStatus';
import useConnectionStatus from '../../components/connectionStatus';
import CircularPercentageTracker from '../../components/circularProgress';

const height = Dimensions.get('screen').height;
const width = Dimensions.get('screen').width;

const Duration = ({startTime}) => {
  const [timeDifference, setTimeDifference] = useState({
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateDifference = () => {
      const now = new Date();
      const minutes = differenceInMinutes(now, startTime);
      const totalSeconds = differenceInSeconds(now, startTime);
      const seconds = totalSeconds % 60;
      setTimeDifference({minutes, seconds});
    };

    updateDifference(); // Update immediately on mount

    const intervalId = setInterval(updateDifference, 1000);

    return () => clearInterval(intervalId);
  }, [startTime]);

  return (
    <View>
      <Text style={[styles.blueSFMed, {fontSize: 16}]}>
        {`${timeDifference.minutes}:${timeDifference.seconds
          .toString()
          .padStart(2, '0')}`}
      </Text>
    </View>
  );
};

const MainWorkoutTracker = () => {
  const {workoutTracker, setWorkoutTracker} = useWorkoutTracker();
  const [templates, setTemplates] = useState([]);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [templatePopup, setTemplatePopup] = useState({
    name: '',
    exercises: [],
    sets: [],
    date: '',
    duration: 0,
    id: 0,
    session_num: 0,
  });
  const opacity = useSharedValue(0);
  const [closePopup, setClosePopup] = useState(false);
  const [slideView, setSlideView] = useState(0);
  const translateX = useSharedValue(0);
  const transX = useSharedValue(0);
  const [showSession, setShowSession] = useState(false);
  const [sessionObj, setSessionObj] = useState();
  const [closeSummary, setCloseSummary] = useState(false);
  const [edit, setEdit] = useState(false);
  const start = startOfWeek(new Date(), {weekStartsOn: 1});
  const weekDays = Array.from({length: 7}, (_, i) => addDays(start, i));
  const [weekWorkouts, setWeekWorkouts] = useState([]);
  const [dates, setDates] = useState([]);

  useEffect(() => {
    if (slideView === 0) {
      translateX.value = withTiming(0, {duration: 300});
      transX.value = withTiming(0, {duration: 300});
    }
    if (slideView === 1) {
      translateX.value = withTiming((width - 40) / 2, {duration: 300});
      transX.value = withTiming(-width, {duration: 300});
    }
    if (slideView === 2) {
      translateX.value = withTiming(((width - 40) / 2) * 2, {duration: 300});
      transX.value = withTiming(-width * 2, {duration: 300});
    }
  }, [slideView]);

  useEffect(() => {
    // clearStorage();
    const handleSessions = async () => {
      const res = await fetchSessions();
      let newDates = [];
      for (let i = 0; i < res.length; i++) {
        const date = format(res[i].date, 'dd:MM:yyyy');
        const present = newDates.find(d => format(d, 'dd:MM:yyyy') === date);
        if (present === undefined) {
          newDates.push(res[i].date);
        }
      }
      newDates.sort((a, b) => new Date(b) - new Date(a));
      setDates(newDates);
      setSessions(res);
    };

    handleSessions();
  }, [workoutTracker.activeWorkout]);

  useEffect(() => {
    fetchActiveWorkout();
  }, [workoutTracker.activeWorkout]);

  useEffect(() => {
    const fetchOngoing = async () => {
      const res = JSON.parse(await fetchActiveWorkout());
      try {
        if (res.ongoing === true) {
          setWorkoutTracker({
            ...workoutTracker,
            activeWorkout: res.ongoing,
            activeWorkoutTemplate: res.template,
            activeWorkoutStartTime: res.startTime,
            slideView: 'active',
          });
        }
      } catch {
        setActiveWorkoutState({
          ongoing: false,
          startTime: '',
          template: {},
        });
      }
    };

    fetchOngoing();
  }, []);

  useEffect(() => {
    if (workoutTracker.closeSlide === true) {
      const timer = setTimeout(() => {
        setWorkoutTracker({
          ...workoutTracker,
          animateSlide: false,
          closeSlide: false,
        });
      }, 300);
    }
  });

  useEffect(() => {
    // clearKey('templates');
    getTemplate();
  }, [workoutTracker.animateSlide]);

  useEffect(() => {
    if (workoutTracker.newWorkout.id) {
      setTemplates(prevTemplates => [
        ...prevTemplates,
        workoutTracker.newWorkout,
      ]);
    }
  }, [workoutTracker.newWorkout]);

  useEffect(() => {
    if (closeSummary === true) {
      setCloseSummary(false);
      setWorkoutTracker({
        ...workoutTracker,
        showWorkoutComplete: false,
        activeWorkoutTemplate: {},
      });
    }
  }, [closeSummary]);

  useEffect(() => {
    if (templatePopup.id > 0) {
      opacity.value = withTiming(1, {duration: 200});
    }
    if (closePopup === true) {
      setWorkoutTracker({...workoutTracker, workoutModal: false});
      opacity.value = withTiming(0, {duration: 200});
      const timer = setTimeout(() => {
        setTemplatePopup({
          name: '',
          exercises: [],
          sets: [],
          date: '',
          duration: 0,
          id: 0,
          session_num: 0,
        });
        setClosePopup(false);
        setShowWorkoutModal(false);
      }, 200);
    }
  }, [templatePopup, closePopup]);

  useEffect(() => {
    const fetch = async () => {
      const res = await fetchSessions();
      let workouts = [];
      for (let i = 0; i < res.length; i++) {
        const sessionDate = new Date(res[i].date);
        if (sessionDate >= start) {
          const present = workouts.find(workout => {
            if (
              format(sessionDate, 'dd:MM:yyyy') ===
              format(new Date(workout.date), 'dd:MM:yyyy')
            ) {
              return true;
            }
            return false;
          });
          if (present === undefined) {
            workouts.push(res[i]);
          }
        }
      }
      setWeekWorkouts(workouts);
    };

    fetch();
  }, [workoutTracker.showWorkoutComplete]);

  const renderExerciseDays = () => {
    const today = new Date();
    let workouts = [];
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    for (let i = 0; i < weekDays.length; i++) {
      const present = weekWorkouts.find(
        day =>
          format(new Date(day.date), 'dd:MM:yyyy') ===
          format(weekDays[i], 'dd:MM:yyyy'),
      );

      if (present !== undefined) {
        // If the date is found in weekWorkouts, push 1
        workouts.push(1);
      } else {
        // If not found, push 0
        workouts.push(0);
      }
    }

    return (
      <View style={{flexDirection: 'row'}}>
        {workouts.map((present, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View
              style={{
                width: 24,
                height: 24,
                backgroundColor: present === 1 ? '#02BC86' : '#BFBFBF',
                marginBottom: 2,
                marginRight: 1,
              }}
            />
            <Text
              style={{
                fontFamily: 'SFUIText-Medium',
                fontSize: 14,
                color:
                  format(today, 'dd:MM:yyyy') ===
                  format(weekDays[index], 'dd:MM:yyyy')
                    ? '#FFA800'
                    : '#24262E',
              }}>
              {days[index]}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const animatedSlide = useAnimatedStyle(() => {
    return {
      transform: [{translateX: transX.value}],
    };
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: translateX.value}],
    };
  });

  const animatedOpacity = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const handleSetPopupModal = (template: object) => {
    const obj = {
      session_num: GenerateRandomID(),
      date: template.date,
      duration: 0,
      exercises: template.exercises,
      id: template.id,
      name: template.name,
      sets: template.sets,
    };
    setTemplatePopup(obj);
    setShowWorkoutModal(true);
    setWorkoutTracker({...workoutTracker, workoutModal: true});
  };

  const getTemplate = async () => {
    const res = await getTemplates('templates');
    setTemplates(res);
  };

  const handleDurationPress = async () => {
    const res = JSON.parse(await fetchActiveWorkout());
    // if (res.ongoing === true) {
    setWorkoutTracker({
      ...workoutTracker,
      activeWorkout: true,
      activeWorkoutTemplate: res.template,
      activeWorkoutStartTime: res.startTime,
      animateSlide: true,
      slideView: 'active',
    });
    // }
  };

  const handleSessionPress = session => {
    setSessionObj(session);
    setShowSession(true);
    setWorkoutTracker({...workoutTracker, showSession: true});
  };

  const renderSessions = ({item}) => {
    return (
      <TouchableOpacity
        onPress={() => {
          handleSessionPress(item);
        }}
        style={{
          padding: 10,
          borderRadius: 10,
          borderColor: 'white',
          borderWidth: 1,
          marginBottom: 10,
        }}>
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}>
          <Text style={[styles.medSF, {fontSize: 16}]}>{item.name}</Text>
          <Text
            style={{
              fontSize: 14,
              color: 'white',
              fontFamily: 'SFUIText-Regular',
            }}>
            {item.duration}min
          </Text>
        </View>
        {item.exercises.map((exercise, eIndex) => {
          const setLength = item.sets.filter(
            set => exercise.id === set.exercise_id,
          );
          return (
            <Text
              style={[styles.regSF, {paddingTop: 5, fontSize: 14}]}
              key={exercise.id}>
              {setLength.length} {' x '} {exercise.name}
            </Text>
          );
        })}
      </TouchableOpacity>
    );
  };

  const handleDelete = item => {};

  const renderWorkouts = ({item}) => {
    return (
      <TouchableOpacity
        onPress={() => {
          edit ? handleDelete(item) : handleSetPopupModal(item);
        }}
        style={{
          padding: 10,
          borderRadius: 10,
          borderColor: edit ? 'red' : 'white',
          borderWidth: 1,
          marginBottom: 10,
        }}>
        <Text style={[styles.medSF, {fontSize: 16}]}>{item.name}</Text>
        {item.exercises.map((exercise, eIndex) => (
          <Text
            style={[styles.regSF, {paddingTop: 5, fontSize: 14}]}
            key={eIndex}>
            {exercise.name}{' '}
            {(exercise.bar_type === 1 && '(Barbell)') ||
              (exercise.bar_type == 2 && '(Dumbbell)')}
          </Text>
        ))}
      </TouchableOpacity>
    );
  };

  const workoutSummary = () => {
    const session = workoutTracker.activeWorkoutTemplate;
    const sets = session.sets.filter(set => set.isFinished === true);
    const exercises = session.exercises;
    let totalWeight;
    for (let i = 0; i < sets; i++) {
      totalWeight += parseInt(sets.weight, 10);
    }
    return (
      <View
        style={{
          width: width,
          height: height,
          zIndex: 3,
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
        }}>
        <Pressable
          onPress={() => {
            setCloseSummary(true);
          }}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'black',
            opacity: 0.5,
          }}
        />
        <View
          style={{
            backgroundColor: '#24262E',
            borderRadius: 10,
            borderColor: 'white',
            borderWidth: 1,
            position: 'absolute',
            zIndex: 2,
            flexDirection: 'column',
            width: width * 0.8,
            // height: height * 0.6,
            padding: 20,
          }}>
          <View
            style={{
              width: '100%',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}>
            <Text
              style={{
                fontSize: 18,
                paddingBottom: 5,
                fontFamily: 'SFUIText-Semibold',
                color: 'white',
              }}>
              Nice work dude!
            </Text>
            <Text style={[styles.medSF, {fontSize: 14, paddingBottom: 20}]}>
              Another workout done.
            </Text>
            <View
              style={{
                width: '100%',
                height: 1,
                backgroundColor: 'white',
              }}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '100%',
            }}>
            <Text
              style={{
                color: 'white',
                fontSize: 16,
                fontFamily: 'SFUIText-Semibold',
              }}>
              {workoutTracker.activeWorkoutTemplate.name}
            </Text>
            <Text
              style={{
                color: 'white',
                fontSize: 14,
                fontFamily: 'SFUIText-Regular',
              }}>
              {session.duration}
              {workoutTracker.duration}
            </Text>
          </View>
          <View
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{alignItems: 'center'}}>
            {session.exercises.map((exercise, index) => {
              const type = exercise.type;
              const set = sets.filter(set => exercise.id === set.exercise_id);
              return (
                <View key={exercise.id} style={{flexDirection: 'column'}}>
                  <Text
                    style={[
                      styles.nativeBlueSFMed,
                      {fontSize: 14, marginTop: 10},
                    ]}>
                    {set.length + ' x ' + exercise.name}
                  </Text>
                  {/* <View
                    style={{
                      flexDirection: 'row',
                      marginBottom: 5,
                      marginLeft: 10,
                    }}>
                    <Text
                      style={[
                        {
                          width: 26,
                          fontSize: 14,
                          marginRight: 10,
                          textAlign: 'center',
                        },
                        styles.medSF,
                      ]}>
                      Set
                    </Text>
                    <Text
                      style={[
                        {
                          width: 45,
                          fontSize: 14,
                          marginRight: 10,
                          textAlign: 'center',
                        },
                        styles.medSF,
                      ]}>
                      {(type === 0 && 'kg') ||
                        (type === 1 && 'km') ||
                        (type === 2 && 'kg') ||
                        (type === 3 && 'S')}
                    </Text>
                    <Text
                      style={[
                        {
                          width: 40,
                          fontSize: 14,
                          marginRight: 10,
                          textAlign: 'center',
                        },
                        styles.medSF,
                      ]}>
                      {(type === 0 && 'Reps') ||
                        (type === 1 && 'Min') ||
                        (type === 2 && 'Reps')}
                    </Text>
                  </View> */}
                  {/* {set.map((set, sIndex) => {
                    return (
                      <View key={set.id}>
                        <View
                          style={{
                            flexDirection: 'row',
                            marginBottom: 5,
                            marginLeft: 10,
                          }}>
                          <Text
                            style={[
                              {
                                width: 26,
                                fontSize: 14,
                                marginRight: 10,
                                textAlign: 'center',
                              },
                              styles.medSF,
                            ]}>
                            {sIndex + 1}
                          </Text>
                          <Text
                            style={[
                              {
                                width: 45,
                                fontSize: 14,
                                marginRight: 10,
                                textAlign: 'center',
                              },
                              styles.medSF,
                            ]}>
                            {(type === 0 && set.weight) ||
                              (type === 1 && set.distance) ||
                              (type === 2 && set.weight) ||
                              (type === 3 && set.duration)}
                          </Text>
                          <Text
                            style={[
                              {
                                width: 40,
                                fontSize: 14,
                                marginRight: 10,
                                textAlign: 'center',
                              },
                              styles.medSF,
                            ]}>
                            {(type === 0 && set.reps) ||
                              (type === 1 && set.duration) ||
                              (type === 2 && set.reps)}
                          </Text>
                        </View>
                      </View>
                    );
                  })} */}
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  const sessionReviewModal = () => {
    const session = sessionObj;
    return (
      <View
        style={{
          width: width,
          height: height,
          position: 'absolute',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
        }}>
        <Pressable
          onPress={() => {
            setShowSession(false);
            setWorkoutTracker({...workoutTracker, showSession: false});
          }}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'black',
            opacity: 0.5,
            zIndex: 1,
          }}
        />
        <View
          style={{
            position: 'absolute',
            zIndex: 2,
            backgroundColor: '#24262E',
            borderWidth: 1,
            borderColor: 'white',
            borderRadius: 10,
            padding: 10,
            flexDirection: 'column',
            maxHeight: height * 0.7,
            overflow: 'hidden',
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}>
            <Text style={[styles.medSF, {fontSize: 16, marginBottom: 20}]}>
              {sessionObj.name}{' '}
              <Text style={{fontSize: 14, color: '#00B0FF'}}>
                {session.date.length > 0 && format(session.date, 'dd/MM/yy')}
              </Text>
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowSession(false);
                setWorkoutTracker({...workoutTracker, showSession: false});
              }}>
              <Cross width={12} height={12} color={'white'} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {session.exercises.map((exercise, index) => {
              const type = exercise.type;
              const set = session.sets.filter(
                set => exercise.id === set.exercise_id,
              );
              return (
                <View
                  key={exercise.id}
                  style={{flexDirection: 'column', marginBottom: 20}}>
                  <Text
                    style={[
                      styles.nativeBlueSFMed,
                      {fontSize: 14, marginBottom: 10},
                    ]}>
                    {exercise.name}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      marginBottom: 5,
                      marginLeft: 10,
                    }}>
                    <Text
                      style={[
                        {
                          width: 26,
                          fontSize: 14,
                          marginRight: 10,
                          textAlign: 'center',
                        },
                        styles.medSF,
                      ]}>
                      Set
                    </Text>
                    <Text
                      style={[
                        {
                          width: 45,
                          fontSize: 14,
                          marginRight: 10,
                          textAlign: 'center',
                        },
                        styles.medSF,
                      ]}>
                      {(type === 0 && 'kg') ||
                        (type === 1 && 'km') ||
                        (type === 2 && 'kg') ||
                        (type === 3 && 'S')}
                    </Text>
                    <Text
                      style={[
                        {
                          width: 40,
                          fontSize: 14,
                          marginRight: 10,
                          textAlign: 'center',
                        },
                        styles.medSF,
                      ]}>
                      {(type === 0 && 'kg') ||
                        (type === 1 && 'km') ||
                        (type === 2 && 'kg')}
                    </Text>
                  </View>
                  {set.map((set, sIndex) => {
                    return (
                      <View key={set.id}>
                        <View
                          style={{
                            flexDirection: 'row',
                            marginBottom: 5,
                            marginLeft: 10,
                          }}>
                          <Text
                            style={[
                              {
                                width: 26,
                                fontSize: 14,
                                marginRight: 10,
                                textAlign: 'center',
                              },
                              styles.medSF,
                            ]}>
                            {sIndex + 1}
                          </Text>
                          <Text
                            style={[
                              {
                                width: 45,
                                fontSize: 14,
                                marginRight: 10,
                                textAlign: 'center',
                              },
                              styles.medSF,
                            ]}>
                            {(type === 0 && set.weight) ||
                              (type === 1 && set.distance) ||
                              (type === 2 && set.weight) ||
                              (type === 3 && set.duration)}
                          </Text>
                          <Text
                            style={[
                              {
                                width: 40,
                                fontSize: 14,
                                marginRight: 10,
                                textAlign: 'center',
                              },
                              styles.medSF,
                            ]}>
                            {(type === 0 && set.reps) ||
                              (type === 1 && set.duration) ||
                              (type === 2 && set.reps)}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    );
  };

  const workoutModal = () => {
    return (
      <Animated.View
        style={[
          {
            width: width,
            height: height,
            position: 'absolute',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          },
          animatedOpacity,
        ]}>
        <Pressable
          onPress={() => {
            setClosePopup(true);
          }}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            backgroundColor: 'black',
            zIndex: 2,
            opacity: 0.5,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
        <View
          style={{
            zIndex: 3,
            flexDirection: 'column',
            borderRadius: 10,
            borderWidth: 1,
            borderColor: 'white',
            padding: 10,
            backgroundColor: '#24262E',
            width: width * 0.77,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}>
            <Text style={[{fontSize: 16}, styles.medSF]}>
              {templatePopup.name}
            </Text>
            {workoutTracker.activeWorkout === false && (
              <TouchableOpacity
                onPress={() => {
                  setWorkoutTracker({
                    ...workoutTracker,
                    slideView: 'edit',
                    animateSlide: true,
                    currentTemplate: templatePopup,
                    workoutModal: false,
                  });
                  setShowWorkoutModal(false);
                  setClosePopup(false);
                }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: 'SFUIText-Medium',
                    color: '#02BC86',
                  }}>
                  Edit
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {templatePopup?.exercises?.map((item, index) => {
            const sets = templatePopup.sets.filter(
              set => item.id === set.exercise_id,
            );
            return (
              <View key={index}>
                <Text style={[styles.medSF, {fontSize: 14, paddingBottom: 10}]}>
                  {sets.length + ' x ' + item.name}
                </Text>
              </View>
            );
          })}
          {workoutTracker.activeWorkout === false && (
            <TouchableOpacity
              onPress={() => {
                setWorkoutTracker({
                  ...workoutTracker,
                  slideView: 'active',
                  animateSlide: true,
                  currentTemplate: templatePopup,
                  activeWorkout: true,
                  activeWorkoutTemplate: templatePopup,
                  activeWorkoutStartTime: new Date(),
                  workoutModal: false,
                });
                setShowWorkoutModal(false);
                setClosePopup(false);
              }}
              style={{
                width: '100%',
                height: 36,
                backgroundColor: '#02BC86',
                borderRadius: 5,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 10,
              }}>
              <Text style={[styles.medSF, {fontSize: 16}]}>Start workout</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#24262E',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        // alignItems: 'center',
      }}>
      {/* <View
        style={{
          position: 'absolute',
          width: width,
          height: 60,
          bottom: 30,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}>
        <TouchableOpacity
          onPress={() => {
            setWorkoutTracker({...workoutTracker, close: true});
          }}
          style={{
            width: 60,
            height: 60,
            backgroundColor: '#E5D120',
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <HomeFilled />
        </TouchableOpacity>
      </View> */}
      {workoutTracker.showWorkoutComplete && workoutSummary()}
      {showSession && sessionReviewModal()}
      {showWorkoutModal === true && workoutModal()}
      <View style={{height: height * 0.05}} />
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          alignItems: 'center',
          paddingTop: 20,
          marginBottom: 10,
        }}>
        <Text
          style={[
            styles.medSF,
            {
              fontSize: 20,
            },
          ]}>
          Start workout
        </Text>
        {/* <TouchableOpacity
          onPress={() => {
            setEdit(!edit);
          }}>
          <Text
            style={{
              fontFamily: 'SFUIText-Medium',
              fontSize: 16,
              color: '#00B0FF',
            }}>
            Edit
          </Text>
        </TouchableOpacity> */}
      </View>
      <View
        style={{
          flexDirection: 'column',
          display: 'flex',
          paddingTop: 10,
          paddingHorizontal: 20,
        }}>
        {/* <TouchableOpacity
          onPress={() => {
            setWorkoutTracker({
              ...workoutTracker,
              slideView: 'active',
              animateSlide: true,
            });
          }}
          style={{
            width: '100%',
            height: 36,
            backgroundColor: '#00B0FF',
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 10,
          }}>
          <Text style={[styles.medSF, {fontSize: 14}]}>
            Start empty workout
          </Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          onPress={() => {
            setWorkoutTracker({
              ...workoutTracker,
              animateSlide: true,
              slideView: 'create',
            });
          }}
          style={{
            width: '100%',
            height: 36,
            backgroundColor: '#02BC86',
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={[styles.medSF, {fontSize: 14}]}>Create new workout</Text>
        </TouchableOpacity>
      </View>
      <View style={{paddingHorizontal: 20}}>
        <View
          style={{
            height: 36,
            flexDirection: 'row',
            width: '100%',
            backgroundColor: '#E2E2E2',
            borderRadius: 10,
            marginTop: 10,
            marginBottom: 10,
            overflow: 'hidden',
          }}>
          <Animated.View
            style={[
              {
                position: 'absolute',
                backgroundColor: '#02BC86',
                height: '100%',
                width: '50%',
                zIndex: 0,
              },
              animatedStyle,
            ]}
          />
          <TouchableOpacity
            style={{
              width: '50%',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
            onPress={() => {
              setSlideView(0);
            }}>
            <Text
              style={[
                slideView === 0 ? styles.medSF : styles.blueSFMed,
                {fontSize: 14},
              ]}>
              Templates
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              width: '50%',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
            onPress={() => {
              setSlideView(1);
            }}>
            <Text
              style={[
                slideView === 1 ? styles.medSF : styles.blueSFMed,
                {fontSize: 14},
              ]}>
              Sessions
            </Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={{
              width: '33.3%',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
            onPress={() => {
              setSlideView(2);
            }}>
            <Text
              style={[
                slideView === 2 ? styles.medSF : styles.blueSFMed,
                {fontSize: 14},
              ]}>
              Progress
            </Text>
          </TouchableOpacity> */}
        </View>
      </View>
      <Animated.View
        style={[
          {
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: width * 3,
          },
          animatedSlide,
        ]}>
        <View>
          <View
            style={{
              paddingHorizontal: 20,
              marginBottom: 10,
            }}>
            <View
              style={{
                width: '100%',
                backgroundColor: '#E2E2E2',
                borderRadius: 5,
                padding: 10,
              }}>
              <View
                style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                {renderExerciseDays()}
                <CircularPercentageTracker value={weekWorkouts.length} />
              </View>
            </View>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flexDirection: 'row',
              paddingBottom: 60,
              paddingHorizontal: 20,
              height: '100%',
              width: width,
            }}
            style={{width: width}}>
            {/* First List */}
            <View style={{width: '50%', paddingRight: 5}}>
              <FlatList
                data={templates.filter((_, index) => index % 2 === 0)}
                renderItem={renderWorkouts}
                keyExtractor={(item, index) => index.toString()}
                scrollEnabled={false} // Disable individual scrolling
              />
            </View>

            <View style={{width: '50%', paddingLeft: 5}}>
              <FlatList
                data={templates.filter((_, index) => index % 2 > 0)}
                renderItem={renderWorkouts}
                keyExtractor={(item, index) => index.toString()}
                scrollEnabled={false} // Disable individual scrolling
              />
            </View>
          </ScrollView>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexDirection: 'column',
            width: width,
            paddingHorizontal: 20,
            paddingBottom: 300,
          }}
          style={{width: width}}>
          {dates.map((date, index) => {
            const instances = sessions.filter(
              s => format(s.date, 'dd:MM:yyyy') === format(date, 'dd:MM:yyyy'),
            );

            return (
              <View
                key={index}
                style={{flexDirection: 'column', paddingBottom: 10}}>
                <Text
                  style={{
                    paddingBottom: 10,
                    color: 'white',
                    fontSize: 16,
                    fontFamily: 'SFUIText-Semibold',
                  }}>
                  {format(date, 'EEEE, do MMMM')}
                </Text>
                <View style={{width: '100%'}}>
                  <FlatList
                    data={instances}
                    renderItem={renderSessions}
                    keyExtractor={item => item.id.toString()}
                    scrollEnabled={false}
                  />
                </View>
              </View>
            );
          })}
        </ScrollView>
        <View style={{width: width}}>
          <Progress />
        </View>
      </Animated.View>
      {workoutTracker.activeWorkout === true && (
        <TouchableOpacity
          onPress={handleDurationPress}
          style={{
            position: 'absolute',
            top: '30%',
            backgroundColor: '#E5D120',
            right: 0,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 10,
            borderTopLeftRadius: 5,
            borderBottomLeftRadius: 5,
          }}>
          <Duration startTime={workoutTracker.activeWorkoutStartTime} />
        </TouchableOpacity>
      )}
      {workoutTracker.animateSlide === true && (
        <View
          style={{
            width: width,
            height: height,
            backgroundColor: 'black',
            position: 'absolute',
            zIndex: 2,
            opacity: 0.5,
          }}
        />
      )}
      {workoutTracker.animateSlide === true && <CreateWorkout />}
    </View>
  );
};

const styles = StyleSheet.create({
  medSF: {
    fontFamily: 'SFUIText-Medium',
    color: 'white',
  },
  regSF: {
    fontFamily: 'SFUIText-Regular',
    color: 'white',
  },
  blueSFMed: {
    fontFamily: 'SFUIText-Medium',
    color: '#24262E',
  },
  nativeBlueSFMed: {
    fontFamily: 'SFUIText-Medium',
    color: '#00B0FF',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  timeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
});

export default MainWorkoutTracker;
