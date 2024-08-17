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
} from 'date-fns';
import {
  Cross,
  HomeEmpty,
  HomeFilled,
} from '../../../assets/svgs/workoutTrackerSvgs';

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

  useEffect(() => {
    if (slideView === 0) {
      translateX.value = withTiming(0, {duration: 300});
      transX.value = withTiming(0, {duration: 300});
    }
    if (slideView === 1) {
      translateX.value = withTiming((width - 40) / 2, {duration: 300});
      transX.value = withTiming(-width, {duration: 300});
    }
  }, [slideView]);

  useEffect(() => {
    const handleSessions = async () => {
      const res = await fetchSessions();
      setSessions(res);
    };

    handleSessions();
  }, []);

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

  const animatedOpacity = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const handleSetPopupModal = (template: object) => {
    setTemplatePopup(template);
    setShowWorkoutModal(true);
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
        <Text style={[styles.medSF, {fontSize: 16}]}>{item.name}</Text>
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

  const renderWorkouts = ({item}) => (
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
          {exercise.name}
        </Text>
      ))}
    </TouchableOpacity>
  );

  const workoutSummary = () => {
    const session = workoutTracker.activeWorkoutTemplate;
    const sets = session.sets;
    let totalWeight;
    for (let i = 0; i < sets; i++) {
      totalWeight += parseInt(sets.weight, 10);
      console.log(sets[i]);
    }
    return (
      <View
        style={{
          width: width,
          height: height,
          zIndex: 1,
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
            padding: 10,
            flexDirection: 'column',
            alignItems: 'center',
          }}>
          <Text style={[styles.medSF, {fontSize: 14, paddingBottom: 5}]}>
            Well done Fat Shit!
          </Text>
          <Text style={[styles.medSF, {fontSize: 14}]}>
            Here is the workout summary
          </Text>
          <Text>{workoutTracker.activeWorkoutTemplate.name}</Text>
          <Text style={[styles.medSF, {fontSize: 14, paddingBottom: 5}]}>
            {totalWeight}
          </Text>
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
          zIndex: 1,
        }}>
        <View
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
              }}>
              <Cross width={12} height={12} color={'white'} />
            </TouchableOpacity>
          </View>
          {session.exercises.map((exercise, index) => {
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
                    kg
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
                    reps
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
                          {set.weight}
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
                          {set.reps}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })}
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
            zIndex: 1,
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
            <TouchableOpacity
              onPress={() => {
                setWorkoutTracker({
                  ...workoutTracker,
                  slideView: 'edit',
                  animateSlide: true,
                  currentTemplate: templatePopup,
                });
                setShowWorkoutModal(false);
                setClosePopup(false);
              }}>
              <Text style={[{fontSize: 14}, styles.nativeBlueSFMed]}>Edit</Text>
            </TouchableOpacity>
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
                });
                setShowWorkoutModal(false);
                setClosePopup(false);
              }}
              style={{
                width: '100%',
                height: 36,
                backgroundColor: '#00B0FF',
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
        <TouchableOpacity
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
        </TouchableOpacity>
      </View>
      <Text
        style={[
          styles.medSF,
          {fontSize: 15, paddingTop: 20, paddingHorizontal: 20},
        ]}>
        Quick start
      </Text>
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
            marginBottom: 20,
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
        </View>
      </View>
      <Animated.View
        style={[
          {
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: width * 2,
          },
          animatedSlide,
        ]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexDirection: 'row',
            paddingBottom: 60,
            paddingHorizontal: 20,
            height: '100%',
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexDirection: 'row',
            width: width,
            paddingHorizontal: 20,
            // height: '100%',
            paddingBottom: 300,
          }}
          style={{width: width}}>
          {/* First List */}
          <View style={{width: '50%', paddingRight: 5}}>
            {/* {sessions.map((item, index) => (
              <View key={index}>
                <Text>{item.name}</Text>
              </View>
            ))} */}
            <FlatList
              data={sessions.filter((_, index) => index % 2 === 0)}
              renderItem={renderSessions}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false} // Disable individual scrolling
            />
          </View>
          <View style={{width: '50%', paddingLeft: 5}}>
            <FlatList
              data={sessions.filter((_, index) => index % 2 > 0)}
              renderItem={renderSessions}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false} // Disable individual scrolling
            />
          </View>
        </ScrollView>
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
