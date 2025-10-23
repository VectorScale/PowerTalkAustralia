import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Filter from "@/PTComponents/Filter";

import BottomNav from "@/PTComponents/BottomNav";
import MeetingBottom from "@/PTComponents/MeetingBottom";

import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Checkbox } from "expo-checkbox";

const ProfileScreen = () => {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  const [userId, setUserId] = useState("");
  const [clubs, setClubs] = useState([]);
  const [clubMeetings, setClubwithMeetings] = useState([]);
  const nav = useNavigation();
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);

  const [filterShow, setFilterShow] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("Select Month");
  const [selectedYear, setSelectedYear] = useState("Select Year");
  const [selectedClub, setSelectedClub] = useState("All Clubs");
  const [trigger, settrigger] = useState(false);
  const [handles, sethandle] = useState(0);
  const [joined, setJoin] = useState([]);
  const [reload, setReload] = useState(false);

  const handleJoin = async (meetingId) => {
    try {
      const access = await axios.post(`${process.env.EXPO_PUBLIC_IP}/join`, {
        user_id: userId,
        meeting_id: meetingId,
        attended: 1,
      });
      sethandle(1);
      settrigger(false);
      setReload((prev) => !prev); // 👈 triggers useEffect again
      Alert.alert("Joined!", "You have RSVP'd for this meeting");
    } catch (error) {
      Alert.alert("Error", "Failed to add member data");
      console.log(error);
    }
  };
  const handleDelete = async (id) => {
    try {
      await axios.post(`${process.env.EXPO_PUBLIC_IP}/notjoin`, {
        user_id: userId,
        meeting_id: id,
      });
      setReload((prev) => !prev);
      Alert.alert("RSVP Removed", "You are no longer attending this meeting.");
    } catch (error) {
      Alert.alert("Error", "Failed to remove member data");
      console.log(error);
    }
  };
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
    if (userId == "") return;
    (async () => {
      try {
        const datas = await axios.get(
          `${process.env.EXPO_PUBLIC_IP}/join_meeting/${userId}`
        );
        const clubjoined = datas || [];
        setJoin(clubjoined.data);
        console.log(datas.data);
      } catch (error) {
        console.error("Error fetching user clubs:", error);
        Alert.alert("Error", "Failed to fetch user clubs");
      }
    })();
  }, [userId, reload]);
  const n = joined.filter((m) => m.attended === 1).map((m) => m.meeting_id);

  console.log(n);
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

  // Fetch user and club info
  useEffect(() => {
    console.log(clubs);
    if (clubs == []) return;
    (async () => {
      try {
        console.log(clubs);
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

        const sortedMeetings = flattenedMeetings.sort((a, b) => {
          return a.date.localeCompare(b.date);
        });
        setClubwithMeetings(sortedMeetings);
      } catch (error) {
        console.error("Error fetching user or club data:", error);
        Alert.alert("Error", "Failed to fetch user or club data");
      }
    })();
  }, [clubs]);
  console.log(clubMeetings);

  const isDefaultFilter =
    selectedMonth === "Select Month" &&
    selectedYear === "Select Year" &&
    selectedClub === "All Clubs";

  const filteredMeetings = isDefaultFilter
    ? clubMeetings // show all meetings at first
    : clubMeetings.filter((meeting) => {
        const meetingDate = new Date(meeting.date);
        const meetingMonth = meetingDate.toLocaleString("default", {
          month: "long",
        });
        const meetingYear = meetingDate.getFullYear().toString();

        const monthMatches =
          selectedMonth === "Select Month" || selectedMonth === meetingMonth;
        const yearMatches =
          selectedYear === "Select Year" || selectedYear === meetingYear;
        const clubMatches =
          selectedClub === "All Clubs" || selectedClub === meeting.club;

        return monthMatches && yearMatches && clubMatches;
      });

  const years = clubMeetings.map((meeting) =>
    new Date(meeting.date).getFullYear().toString()
  );
  const uniquesyears = new Set([]);
  years.forEach((year) => {
    uniquesyears.add(year);
  });
  const uniqueYears = Array.from(uniquesyears);
  const dropdownYears = ["Select Year", ...uniqueYears];

  const clubss = clubMeetings.map((club) => club.club);
  const uniqueClubs = Array.from(new Set(clubss));
  const dropdownClubs = ["All Clubs", ...uniqueClubs];

  const months = clubMeetings.map((meeting) =>
    new Date(meeting.date).toLocaleString("default", { month: "long" })
  );
  const uniqueMonths = Array.from(new Set(months));
  const dropdownmonths = ["Select Month", ...uniqueMonths];
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
        <TouchableOpacity
          onPress={() => setFilterShow(!filterShow)}
          style={styles.filterButton}
        >
          <Text style={styles.filterText}>
            Filter <Filter />
          </Text>
        </TouchableOpacity>
        {filterShow && (
          <View style={styles.sortingRow}>
            <Picker
              selectedValue={selectedYear}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedYear(itemValue)}
            >
              {dropdownYears.map((year) => (
                <Picker.Item key={year} label={year} value={year} />
              ))}
            </Picker>

            <Picker
              selectedValue={selectedMonth}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedMonth(itemValue)}
            >
              {dropdownmonths.map((month) => (
                <Picker.Item key={month} label={month} value={month} />
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
        )}

        {/* Meeting Buttons */}
        {filteredMeetings.map((meeting, index) => {
          var date = new Intl.DateTimeFormat("en-GB", {
            dateStyle: "full",
            timeZone: "Australia/Sydney",
          }).format(new Date(meeting.date));
          return (
            <View key={meeting.id} style={styles.memberRow}>
              {!n.includes(meeting.id) && userId && (
                <Checkbox
                  value={false}
                  onValueChange={() => {
                    settrigger(true);
                    handleJoin(meeting.id);
                  }}
                  tintColors={{ true: "#065395", false: "#AFABA3" }}
                />
              )}
              {n.includes(meeting.id) && userId && (
                <Checkbox
                  value={true}
                  onValueChange={() => {handleDelete(meeting.id);}}
                  tintColors={{ true: "#065395", false: "#AFABA3" }}
                ></Checkbox>
              )}
              <TouchableOpacity
                key={index}
                style={styles.meetingBlock}
                onPress={() => handlePress(meeting.id)}
              >
                <Text style={styles.meetingClub}>{meeting.club}</Text>
                <Text style={styles.meetingName}>{meeting.name}</Text>
                <Text style={styles.meetingDate}>{date}</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
      {/* Bottom Navigation */}
      {userId ? (
        <BottomNav
          number={3}
          name={["Club Members", "Club Meetings", "Development Program"]}
          link={["/club/members", "/club/meetings", "/projects"]}
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
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
    gap: 10,
  },
  contents: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
  },
  modalBackground: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    flexDirection: "row",
    justifyContent: "center",
    flex: 1,
  },
  modalView: {
    alignSelf: "center",
    borderRadius: 25,
    backgroundColor: "#F1F6F5",
    maxWidth: "90%",
  },
  select: {
    flexDirection: "row",
    gap: 30,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 20,
  },
  function: {
    flexDirection: "row",
    justifyContent: "center",
    flex: 1,
  },
  confirm: {
    fontSize: 16,
    fontWeight: "bold",
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
    flex: 4,
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
  title: {
    padding: 10,
    alignItems: "center",
    backgroundColor: "#8A7D6A",
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20, //iOS and android use different words to set specific border radii
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },
  done: {
    backgroundColor: "#FFD347",
    padding: 10,
    borderRadius: 10,
    color: "white",
  },
});

export default ProfileScreen;
