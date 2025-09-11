import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import Button from '@/PTComponents/Button';

export default function GuestPage() {
  const router = useRouter();
  const [ClubList, SetClubList] = useState([]);
  const [userId, setUserId] = useState({});
  const [count, setCount] = useState(0);
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("messages");
        if (storedUserId) {
          const parsedUser = JSON.parse(storedUserId);
          if (parsedUser) {
            setUserId(parsedUser);
            setCount((prev) => prev + 1);
          }
        }
      } catch (error) {
        console.error("Error fetching userId from storage:", error);
        Alert.alert("Error", "Failed to load user ID");
      }
    };

    fetchUserId();
  }, []);
  console.log(userId);
  useEffect(() => {
    axios
      .get(`http://${process.env.EXPO_PUBLIC_IP}:8081/clubs`)
      .then((res) => SetClubList(res.data))
      .catch((err) => {
        console.error("Error fetching clubs:", err);
        Alert.alert("Error", "Failed to fetch clubs");
      });
  }, []);
  const handlePress = async (ClubId) => {
    try {
      await AsyncStorage.setItem("ClubId", ClubId);
      router.push("/club_details");
    } catch (error) {
      console.error("Error saving meeting_id:", error);
    }
  };

  return (
    <View>
      <View style={styles.meetingHeaderBlock}>
        <Button onPress={()=>router.navigate('GuestLimit')}>Test</Button>
        <Text style={styles.meetingHeaderText}>List of Our Clubs</Text>
      </View>
      <ScrollView>
        {ClubList.map((club, index) => (
          <TouchableOpacity
            style={styles.meetingBlock}
            key={index}
            onPress={() => handlePress(club.Club_id)}
          >
            <Text>{club.Club_name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  circle: {
    width: 50,
    height: 50,
    borderRadius: 40, // makes it a circle
    backgroundColor: "#065395",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  List: {
    fontSize: 30,
    textAlign: "center",
    marginTop: 20,
  },
  Add: {
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 1080,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalBox: {
    margin: 30,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 10,
    backgroundColor: "#AFABA3",
    alignItems: "center",
  },
  logo: {
    width: 300,
    height: 50,
    resizeMode: "contain",
  },
  profileText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  content: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  meetingHeaderBlock: {
    marginTop: 20,
    backgroundColor: "#065395",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  meetingHeaderText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  sortingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  picker: {
    flex: 1,
    height: 50,
  },
  meetingBlock: {
    marginTop: 15,
    backgroundColor: "#8A7D6A",
    padding: 15,
    borderRadius: 10,
  },
  meetingClub: {
    fontWeight: "600",
    color: "#ffffff",
  },
  meetingName: {
    fontSize: 16,
    marginTop: 4,
    color: "#ffffff",
  },
  meetingDate: {
    fontSize: 14,
    color: "#E0E0E0",
    marginTop: 2,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F1F6F5",
    paddingVertical: 15,
  },
  navButton: {
    fontSize: 16,
    color: "#333",
  },
  activeButton: {
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
