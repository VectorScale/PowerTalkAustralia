import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import BottomNav from "@/PTComponents/BottomNav";
import { Picker } from "@react-native-picker/picker";

import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";


const PORT = 8081;

const ProfileScreen = () => {
  const router = useRouter();

  const [userId, setUserId] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [clubMeetings, setClubwithMeetings] = useState([]);
  const navigation = useNavigation();
  const [selectedMonth, setSelectedMonth] = useState("May");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedClub, setSelectedClub] = useState("All Clubs");
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

  // Fetch user and club info
  useEffect(() => {
    if (!userId) return;

    (async () => {
      try {
        // Step 1: Get club list from user info
        const { data } = await axios.get(
          `${process.env.EXPO_PUBLIC_IP}:8081/user/${userId}`
        );
        const clubList = data.Club_id || [];

        setClubs(clubList);

        // Step 2: Fetch names for all clubs
        const clubMeetingDetails = await Promise.all(
          clubList.map(async (item) => {
            const res = await axios.get(
              `${process.env.EXPO_PUBLIC_IP}:8081/club/${item.Club_id}`
            );
            const clubNames = res.data.Club_name[0].Club_name;
            const resMeet = await axios.get(
              `${process.env.EXPO_PUBLIC_IP}:8081/meeting/${item.Club_id}`
            );
            const MeetNames = resMeet.data;
            return {
              clubNames,
              MeetNames,
            };
          })
        );
        const flattenedMeetings = clubMeetingDetails.flatMap((club) =>
          club.MeetNames.map((meeting) => ({
            club: club.clubNames,
            name: meeting.meetingname,
            date: meeting.meeting_date,
            id: meeting.meeting_id,
          }))
        );
        setClubwithMeetings(flattenedMeetings);
      } catch (error) {
        console.error("Error fetching user or club data:", error);
        Alert.alert("Error", "Failed to fetch user or club data");
      }
    })();
  }, [userId]);
  const filteredMeetings = clubMeetings.filter((meeting) => {
    const meetingDate = new Date(meeting.date);
    const meetingMonth = meetingDate.toLocaleString("default", {
      month: "long",
    });
    const meetingYear = meetingDate.getFullYear().toString();
    const monthMatches = selectedMonth === meetingMonth;
    const yearMatches = selectedYear === meetingYear;
    const clubMatches =
      selectedClub === "All Clubs" || meeting.club === selectedClub;
    if (selectedClub == "All Clubs") {
      return clubMeetings;
    } else {
      return monthMatches && yearMatches && clubMatches;
    }
  });

  const years = clubMeetings.map((meeting) =>
    new Date(meeting.date).getFullYear().toString()
  );
  const uniquesyears = new Set([]);
  years.forEach((year) => {
    uniquesyears.add(year);
  });
  const uniqueYears = Array.from(uniquesyears);

  const clubss = clubMeetings.map((club) => club.club);
  const uniqueClubs = Array.from(new Set(clubss));
  const dropdownClubs = ["All Clubs", ...uniqueClubs];

  const months = clubMeetings.map((meeting) =>
    new Date(meeting.date).toLocaleString("default", { month: "long" })
  );
  const uniqueMonths = Array.from(new Set(months));

  console.log(uniqueClubs);
  const handlePress = async (meetingId) => {
    console.log(typeof(meetingId));
    try {
      await AsyncStorage.setItem("meetingId", meetingId.toString());
      router.push("/meeting_details");
    } catch (error) {
      console.error("Error saving meeting_id:", error);
    }
  };
  return (
   <View style={styles.container}>
      {/* Top Bar */}
      {userId != null && (<ScrollView style={styles.content}>
        {/* Meeting Header Block */}
        <View style={styles.meetingHeaderBlock}>
          <Text style={styles.meetingHeaderText}>Club Meetings</Text>
        </View>

        {/* Sorting Dropdowns */}
        <View style={styles.sortingRow}>
          <Picker
            selectedValue={selectedMonth}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedMonth(itemValue)}
          >
            {uniqueMonths.map((month) => (
              <Picker.Item key={month} label={month} value={month} />
            ))}
          </Picker>

          <Picker
            selectedValue={selectedYear}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedYear(itemValue)}
          >
            {uniqueYears.map((year) => (
              <Picker.Item key={year} label={year} value={year} />
            ))}
          </Picker>

          <Picker
            selectedValue={selectedClub}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedClub(itemValue)}
          >
            {dropdownClubs.map((club) => (
              <Picker.Item key={club} label={club} value={club}></Picker.Item>
            ))}
          </Picker>
        </View>

        {/* Meeting Buttons */}
        {filteredMeetings.map((meeting, index) => {
          const date = new Date(meeting.date).toISOString().split("T")[0];
          return (
            <TouchableOpacity
              key={index}
              style={styles.meetingBlock}
              onPress={() => handlePress(meeting.id)}
            >
              <Text style={styles.meetingClub}>Club : {meeting.club}</Text>
              <Text style={styles.meetingName}>Meeting : {meeting.name}</Text>
              <Text style={styles.meetingDate}>Meeting date : {date}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>)}
            {userId == null && <TouchableOpacity style={styles.warning} onPress={()=>router.push("./login")}>Warning: You need to become a member and do the login to see this content</TouchableOpacity>}
      
      {/* Bottom Navigation */}
      <BottomNav active={2}  />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
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
    right:80,
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
    marginTop: 30,
    backgroundColor: "#065395",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    position: 'relative', 
    zIndex: -9999,
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
  logoContainer: {
    backgroundColor: "#F1F6F5",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 15,
    zIndex: 10, // Ensure it's layered correctly
  },
  warning:{
    textAlign:'center',
    paddingTop:280,
    paddingBottom:300,
    fontSize:25,
  },
});

export default ProfileScreen;
