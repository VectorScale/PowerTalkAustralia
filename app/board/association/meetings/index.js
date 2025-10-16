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
import FilterButton from "@/PTComponents/FilterButton";

import BottomNav from "@/PTComponents/BottomNav";
import MeetingBottom from "@/PTComponents/MeetingBottom";

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
  const [selectedClub, setSelectedClub] = useState("All Clubs");

  const clubss = clubMeetings.map((club) => club.club);
  const uniqueClubs = Array.from(new Set(clubss));
  const dropdownClubs = ["All Clubs", ...uniqueClubs];

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
    if (clubs == []) return;
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
              `${process.env.EXPO_PUBLIC_IP}/meeting/${item.club_id}`
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
    if (clubs == []) return;
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
          const clubMatches =
            selectedClub === "All Clubs" || meeting.club === selectedClub;
          if (selectedClub == "All Clubs") {
            return monthMatches && yearMatches && clubMeetings;
          } else {
            return monthMatches && yearMatches && clubMatches;
          }
        })
      );
    })();
  }, [clubs, selectedClub, selectedMonth, selectedYear]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Sorting Dropdowns */}
        <FilterButton onFilter={() => setFilterShow(!filterShow)} />
        {filterShow && (
          <View style={styles.sortingRow}>
            <Picker
              selectedValue={selectedClub}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedClub(itemValue)}
            >
              {dropdownClubs.map((club) => (
                <Picker.Item key={club} label={club} value={club}></Picker.Item>
              ))}
            </Picker>
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
            <TouchableOpacity
              key={index}
              style={styles.meetingBlock}
              onPress={() =>
                router.navigate({
                  pathname: "/club/meetings/[meetingID]",
                  params: { meetingID: meeting.id },
                })
              }
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
        <BottomNav
          number={3}
          name={["Members", "Meetings", "Projects"]}
          link={[
            "/board/association/members",
            "/board/association/meetings",
            "/board/association/projects",
          ]}
          active={2}
        />
      ) : (
        <MeetingBottom />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
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
  filterButton: {
    flex: 1,
    marginVertical: 10,
    padding: 5,
    borderRadius: 8,
    backgroundColor: "#065395",
    alignItems: "center",
    justifyContent: "center",
  },
  filterText: {
    color: "white",
    fontSize: 20,
  },
  sortingRow: {
    justifyContent: "space-between",
  },
  picker: {
    flex: 1,
    backgroundColor: "#F1F6F5",
    marginBottom: 5,
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
