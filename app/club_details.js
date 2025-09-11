import { useRouter } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";

import axios from "axios";

const MeetingDetails = () => {
  const [clubs, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clubId, setClubId] = useState(null);
  const [UserId, storedUserIds] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const storedCLubId = await AsyncStorage.getItem("ClubId");
        const storedUserId = await AsyncStorage.getItem("userId");
        storedUserIds(storedUserId);
        if (storedCLubId) {
          setClubId(storedCLubId);
        }
      } catch (error) {
        console.error("Error fetching userId from storage:", error);
        Alert.alert("Error", "Failed to load user ID");
      }
    })();
  }, []);
  const sendMessage = async (UserId) => {
    try {
      const response = await axios.post(
        `${process.env.EXPO_PUBLIC_IP}:8081/send-message`,
        {
          senderId: UserId,
        }
      );
      console.log(response.data[0]);
      await AsyncStorage.setItem("message", JSON.stringify(response.data[0]));
      Alert.alert("Success", "Message sent");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to send message");
    }
  };
  useEffect(() => {
    if (!clubId) return;
    if (clubId) {
      axios
        .get(`${process.env.EXPO_PUBLIC_IP}:8081/club_details/${clubId}`)
        .then((res) => {
          setClub(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching meeting details:", err);
          setLoading(false);
        });
    }
  }, [clubId]);

  if (loading)
    return (
      <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
    );

  if (!clubs) return <Text style={styles.errorText}>Club not found.</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Meeting Details</Text>
      <Text style={styles.label}>
        Club id: <Text style={styles.value}>{clubs[0].Club_id}</Text>
      </Text>
      <Text style={styles.label}>
        Club Name: <Text style={styles.value}>{clubs[0].Club_name}</Text>
      </Text>
      <Text style={styles.label}>
        Club Status: <Text style={styles.value}>{clubs[0].status}</Text>
      </Text>
      <TouchableOpacity onPress={() => sendMessage(UserId)}>
        <Text>Join</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flex: 1,
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
