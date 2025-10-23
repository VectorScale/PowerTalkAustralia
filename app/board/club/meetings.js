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
import Pencil from "@/PTComponents/Pencil";
import FilterButton from "@/PTComponents/FilterButton";
import { Picker } from "@react-native-picker/picker";

import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen = () => {
  const router = useRouter();
  const nav = useNavigation();

  const [userId, setUserId] = useState("");
  const [clubs, setClubs] = useState([]);
  const [clubMeetings, setClubwithMeetings] = useState([]);
  const [filteredMeetings, setFiltered] = useState([]);

  const [filterShow, setFilterShow] = useState(false);

  const [months, setMonths] = useState([]);
  const [years, setYears] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

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
    if (userId != "") return;
    (async () => {
      try {
        // Step 1: Get club list from user info
        const { data } = await axios.get(
          `${process.env.EXPO_PUBLIC_IP}/allClubs/`
        );
        const allList = data || [];
        setClubs(allList);
      } catch (error) {
        console.error("Error fetching all club data:", error);
        Alert.alert("Error", "Failed to fetch all clubs");
      }
    })();
  }, [userId]);

  useEffect(() => {
    if (!clubs) return;
    (async () => {
      try {
        // Step 2: Fetch names for all clubs
        const clubMeetingDetails = await Promise.all(
          clubs.map(async (item) => {
            const res = await axios.get(
              `${process.env.EXPO_PUBLIC_IP}/club/${item.club_id}`
            );
            const clubNames = res.data.club_name;

            const resMeet = await axios.get(
              `${process.env.EXPO_PUBLIC_IP}/upcomingMeetings/${item.club_id}`
            );
            const MeetNames = resMeet.data;
            if (resMeet.status != 200) return null;
            return {
              clubNames,
              MeetNames,
            };
          })
        );

        const flattenedMeetings = clubMeetingDetails.flatMap((club) => {
          if (club == null) {
            return [];
          } else {
            const flatClub = club.MeetNames.map((meeting) => ({
              club: club.clubNames,
              name: meeting.meeting_name,
              date: meeting.meeting_date,
              id: meeting.meeting_id,
            }));

            return flatClub;
          }
        });

        setClubwithMeetings(flattenedMeetings);
      } catch (error) {
        console.error("Error fetching user or club data:", error);
        Alert.alert("Error", "Failed to fetch user or club data");
      }
    })();
  }, [clubs]);

  useEffect(() => {
    console.log(clubMeetings);
    const allYears = clubMeetings.map((meeting) =>
      new Date(meeting.date).getFullYear().toString()
    );
    const uniquesyears = new Set([]);
    allYears.forEach((year) => {
      uniquesyears.add(year);
    });
    setYears(Array.from(uniquesyears));

    const allMonths = clubMeetings.map((meeting) =>
      new Date(meeting.date).toLocaleString("default", { month: "long" })
    );
    setMonths(Array.from(new Set(allMonths)));
  }, [clubMeetings]);

  useEffect(() => {
    setSelectedMonth(months[0]);
    setSelectedYear(years[0]);
  }, [months, years]);
  useEffect(() => {
    if (!clubs) return;
    (async () => {
      setFiltered(
        clubMeetings.filter((meeting) => {
          const meetingDate = new Date(meeting.date);
          const meetingMonth = meetingDate.toLocaleString("default", {
            month: "long",
          });
          const meetingYear = meetingDate.getFullYear().toString();
          const monthMatches = selectedMonth === meetingMonth;
          const yearMatches = selectedYear === meetingYear;
          return monthMatches && yearMatches && clubMeetings;
        })
      );
    })();
  }, [clubs, selectedMonth, selectedYear]);

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <ScrollView style={styles.content}>
        <TouchableOpacity
          style={styles.add}
          onPress={() => router.push("/board/club/addMeeting")}
        >
          <Text style={styles.addText}>+ Add new meeting</Text>
        </TouchableOpacity>

        {/* Sorting Dropdowns */}
        <FilterButton onFilter={() => setFilterShow(!filterShow)} />
        {filterShow && (
          <View>
            <Picker
              selectedValue={selectedYear}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedYear(itemValue)}
            >
              {years.map((year) => (
                <Picker.Item key={year} label={year} value={year} />
              ))}
            </Picker>
            <Picker
              selectedValue={selectedMonth}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedMonth(itemValue)}
            >
              {months.map((month) => (
                <Picker.Item key={month} label={month} value={month} />
              ))}
            </Picker>
          </View>
        )}

        {/* Meeting Buttons */}
        {filteredMeetings.map((meeting, index) => {
          const date = new Date(meeting.date).toISOString().split("T")[0];
          return (
            <View key={meeting.id} style={styles.row}>
              <TouchableOpacity onPress={() => router.push({ pathname: '/board/club/editMeeting/[meetingID]', params: { meetingID: meeting.id } })}>
                <Pencil />
              </TouchableOpacity>
              <TouchableOpacity
                key={index}
                style={styles.meetingBlock}
                onPress={() => {
                  console.log(meeting.id);
                  router.navigate({ pathname: '/club/meetings/[meetingID]', params: { meetingID: meeting.id } });
                }}
              >
                <Text style={styles.meetingClub}>#{meeting.id}</Text>
                <Text style={styles.meetingName}>{meeting.name}</Text>
                <Text style={styles.meetingDate}>Date: {date}</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav
        number={3}
        name={["Members", "Guests", "Meeting"]}
        link={[
          "/board/club/members",
          "/board/club/guests",
          "/board/club/meetings",
        ]}
        active={3}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 8,
    marginTop: 20,
  },
  add: {
    marginTop: 10,
    flex: 1,
  },
  addText: {
    color: "#065395",
    fontSize: 15,
    flex: 1,
    textAlign: "right",
  },
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
    right: 80,
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
  symbol: {
    fontSize: 40,
  },
  meetingHeaderBlock: {
    marginTop: 100,
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
    backgroundColor: "#F1F6F5",
    marginBottom: 5,
  },
  meetingBlock: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#8A7D6A",
  },
  meetingClub: {
    fontWeight: "600",
    color: "#ffffff",
    fontSize: 20,
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
