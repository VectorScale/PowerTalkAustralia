import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";

import BottomNav from "@/PTComponents/BottomNav";
import Button from "@/PTComponents/Button";

import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MeetingBottom from "@/PTComponents/MeetingBottom";

const PORT = 8081;

const ProfileScreen = () => {
  const router = useRouter();

  const [userId, setUserId] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [clubMeetings, setClubwithMeetings] = useState([]);
  const nav = useNavigation();
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

  useEffect(() => {
    nav.setOptions({ headerShown: true, title: "Club Meetings" });
  });

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const { data } = await axios.get(
          `${process.env.EXPO_PUBLIC_IP}/user/${userId}`
        );
        const userList = data.Club_id || [];
        setClubs(userList);
      } catch (error) {
        console.error("Error fetching user or club data:", error);
        Alert.alert("Error", "Failed to fetch user or club data");
      }
    })();
  }, [userId]);

  useEffect(() => {
    (async () => {
      try {
        // Step 1: Get club list from user info
        const { data } = await axios.get(
          `${process.env.EXPO_PUBLIC_IP}/allClubs/`
        );
        const allList = data.Club_id || [];
        setClubs(allList);
      } catch (error) {
        console.error("Error fetching user or club data:", error);
        Alert.alert("Error", "Failed to fetch user or club data");
      }
    })();
  }, []);

  // Fetch user and club info
  useEffect(() => {
    if (!clubs) return;
    (async () => {
      try {
        // Step 2: Fetch names for all clubs
        const clubMeetingDetails = await Promise.all(
          clubs.map(async (item) => {
            const res = await axios.get(
              `${process.env.EXPO_PUBLIC_IP}/club/${item.Club_id}`
            );
            const clubNames = res.data.Club_name[0].Club_name;
            const resMeet = await axios.get(
              `${process.env.EXPO_PUBLIC_IP}/meeting/${item.Club_id}`
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
  }, [clubs]);

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

  const handlePress = async (meetingId) => {
    try {
      await AsyncStorage.setItem("meetingId", meetingId.toString());
      router.push(`club/meetings/${meetingId}`);
    } catch (error) {
      console.error("Error saving meeting_id:", error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
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
      </ScrollView>
      {/* Bottom Navigation */}
      {userId ? (
        <BottomNav active={2} />
      ) : (
        <MeetingBottom/>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 8,
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
    right: 80,
    resizeMode: "contain",
  },
  profileText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  function: {
    flexDirection: "row",
    justifyContent: "center",
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  meetingHeaderBlock: {
    marginTop: 30,
    backgroundColor: "#065395",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    position: "relative",
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
  warning: {
    textAlign: "center",
    paddingTop: 280,
    paddingBottom: 300,
    fontSize: 25,
  },
});

export default ProfileScreen;
