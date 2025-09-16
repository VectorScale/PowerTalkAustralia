import { useEffect, useState } from "react";

import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import Finger from "@/PTComponents/Finger";

import AsyncStorage from "@react-native-async-storage/async-storage";

import axios from "axios";
import { useNavigation } from "expo-router";
import { useLocalSearchParams } from "expo-router";

const MeetingDetails = () => {
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const local = useLocalSearchParams();
  const nav = useNavigation();

  useEffect(() => {
    (async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          console.log(storedUserId);
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error("Error fetching userId from storage:", error);
        Alert.alert("Error", "Failed to load user ID");
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        axios
          .get(
            `http://${process.env.EXPO_PUBLIC_IP}:8081/meeting_details/${local.meetingID}`
          )
          .then((res) => {
            setMeeting(res.data);
            console.log(res.data);
            setLoading(false);
          })
          .catch((err) => {
            console.error("Error fetching meeting details:", err);
            setLoading(false);
          });
      } catch (error) {
        console.error("Error fetching userId from storage:", error);
        Alert.alert("Error", "Failed to load user ID");
      }
    })();
  }, [local]);

  useEffect(() => {
    nav.setOptions({ headerShown: true });
    if (meeting) {
      nav.setOptions({ title: meeting[0].meeting_name });
    }
  });

  if (loading)
    return (
      <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
    );

  if (!meeting) return <Text style={styles.errorText}>Meeting not found.</Text>;

  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.value}>
          <Finger /> {meeting[0].meeting_name} #{meeting[0].meeting_id}
        </Text>
        <Text style={styles.value}>
          <Finger /> {meeting[0].meeting_date}
        </Text>
        <Text style={styles.value}>
          <Finger /> {meeting[0].meeting_place}
        </Text>
        <Text style={styles.value}>
          <Finger /> {meeting[0].meeting_time}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: "#F1F6F5",
    height: "100%",
  },
  container: {
    padding: 10,
    margin: 20,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    justifyContent: "center",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginTop: 10,
    fontWeight: "600",
  },
  value: {
    fontWeight: "400",
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
    color: "red",
    textAlign: "center",
  },
});

export default MeetingDetails;
