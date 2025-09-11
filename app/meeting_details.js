import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import PTHeader from './components/PTHeader';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import axios from 'axios';

const MeetingDetails = () => {
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
    const [meetingId, setMeetingId] = useState(null);
    const [userId, setUserId] = useState(null);
    process.env.EXPO_PUBLIC_IP;
  
  useEffect(() => {
    (async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          console.log(storedUserId);
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error('Error fetching userId from storage:', error);
        Alert.alert('Error', 'Failed to load user ID');
      }
    })();
  }, []);
 useEffect(() => {
    (async () => {
      try {
        const storedMeetingId = await AsyncStorage.getItem('meetingId');
        if (storedMeetingId) {
          console.log(storedMeetingId);
          setMeetingId(storedMeetingId);
        }
      } catch (error) {
        console.error('Error fetching meetingId from storage:', error);
        Alert.alert('Error', 'Failed to load meeting ID');
      }
    })();
  }, []);
  useEffect(() => {
    if (!userId) return;
    if (userId) {
      axios.get(`${process.env.EXPO_PUBLIC_IP}/meeting_details/${meetingId}`)
        .then(res => {
          setMeeting(res.data);
          console.log(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching meeting details:', err);
          setLoading(false);
        });
    }
  }, [userId]);

  if (loading) return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;

  if (!meeting) return <Text style={styles.errorText}>Meeting not found.</Text>;

  return (
    <View style={styles.background}>
      <PTHeader button={true} text={'Profile'} link={'profile'}/>
      <View style={styles.container}>
      <Text style={styles.header}>Meeting Details</Text>
      <Text style={styles.label}>Club id: <Text style={styles.value}>{meeting[0].club_id}</Text></Text>
      <Text style={styles.label}>Name: <Text style={styles.value}>{meeting[0].meetingname}</Text></Text>
      <Text style={styles.label}>Date: <Text style={styles.value}>{meeting[0].meeting_date}</Text></Text>
      <Text style={styles.label}>Location: <Text style={styles.value}>{meeting[0].meeting_place}</Text></Text>
      <Text style={styles.label}>Start Time: <Text style={styles.value}>{meeting[0].meeting_time}</Text></Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#fff',
    height: '100%',
  },
  container: {
    padding: 20,
    alignItems: "flex-start",
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    fontWeight: '600',
  },
  value: {
    fontWeight: '400',
  },
  description: {
    fontSize: 15,
    marginTop: 5,
    lineHeight: 22,
  },
  loader: {
    marginTop: 50,
  },
  errorText: {
    marginTop: 50,
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
});

export default MeetingDetails;
