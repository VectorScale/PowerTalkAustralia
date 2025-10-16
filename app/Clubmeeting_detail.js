import { useRouter } from 'expo-router';
import {
  View, Text, StyleSheet, ActivityIndicator, Alert,
  Image,
  TouchableOpacity
} from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import axios from 'axios';

const MeetingDetails = () => {
  const router = useRouter();
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
      axios.get(`http://172.20.10.2:8081/meeting_details/${meetingId}`)
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
  const m = async (meeting_date) => {
    const d = new Date(meeting_date);

    const dayName = new Intl.DateTimeFormat('en-AU', {
      weekday: 'long',
      timeZone: 'Australia/Sydney',
    }).format(d);

    const dateStr = new Intl.DateTimeFormat('en-AU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Australia/Sydney',
    }).format(d);

    return dayName
  }

  const n = async (meeting_date) => {
    const d = new Date(meeting_date);

    const dayName = new Intl.DateTimeFormat('en-AU', {
      weekday: 'long',
      timeZone: 'Australia/Sydney',
    }).format(d);

    const dateStr = new Intl.DateTimeFormat('en-AU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Australia/Sydney',
    }).format(d);

    return dateStr
  }

  if (loading) return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;

  if (!meeting) return <Text style={styles.errorText}>Meeting not found.</Text>;

  return (
    <View style={styles.background}>

      <View style={styles.meetingHeaderBlock}>
        <View style={styles.label}>
          <Text style={styles.meetingHeaderText}>{meeting[0].
            meetingname}</Text>


        </View>

      </View>
      <View style={styles.container}>
        <View style={styles.label}>

          <Text style={styles.value}>{meeting[0].
            meetingname
          }</Text>
        </View>

        <View style={styles.label}>

          <Text style={styles.value}>
            {
              m(meeting[0].meeting_date
              )} {n(meeting[0].meeting_date)} {meeting[0].arrival_time} for {meeting[0].start_time}
          </Text>
        </View>

        <View style={styles.label}>
          <Text style={styles.value}>{meeting[0].meeting_place}</Text>
        </View>
        <View style={styles.label}>
          <Text style={styles.value}>Program: {meeting[0].agenda_file_link == null ? "(insert link)" : meeting[0].agenda_file_link}</Text>
        </View>



        <View style={styles.label}>
          <Text style={styles.value}>Notes: {meeting[0].entry_instructions}</Text>
        </View>

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
    marginTop: 20,
    padding: 20,
    alignItems: "flex-start",

  }, meetingHeaderBlock: {
    marginTop: 30,
    backgroundColor: "#065395",
    padding: 15,
    borderRadius: 10,
    position: 'relative',
    zIndex: -9999,
  },
  header: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
    marginLeft: 'auto',
    marginRight: "auto"
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    fontWeight: '600',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  value: {
    fontWeight: '400',
    fontSize: 20,
  },
  /* PhotoshopPreview_Image 155 */
  meetingHeaderText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#ffffff",
    marginLeft: 'auto',
    marginRight: "auto",
    marginTop: 'auto',
    marginBottom: 'auto'
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
