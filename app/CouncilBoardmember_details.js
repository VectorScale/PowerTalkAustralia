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
        const storedMeetingId = await AsyncStorage.getItem('Id');
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
    axios.get(`${process.env.EXPO_PUBLIC_IP}:8081/user/${meetingId}`)
        .then(res => {
          setMeeting(res.data);
          console.log(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching meeting details:', err);
          setLoading(false);
        });
  }, [meetingId]);

  if (loading) return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;

  if (!meeting) return <Text style={styles.errorText}>Meeting not found.</Text>;

  return (
    <View style={styles.background}>
      <PTHeader button={true} text={'Profile'} link={'profile'}/>
      <View style={styles.container}>
      <Text style={styles.header}>Council Board Member Details</Text>
      <Text style={styles.label}>Member id: <Text style={styles.value}>{meeting[0].user_id}</Text></Text>
      <Text style={styles.label}>Email: <Text style={styles.value}>{meeting[0].email}</Text></Text>
      <Text style={styles.label}>Phone Number: <Text style={styles.value}>{meeting[0].phone_number}</Text></Text>
      <Text style={styles.label}>Join Date: <Text style={styles.value}>{meeting[0].join_date}</Text></Text>
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
