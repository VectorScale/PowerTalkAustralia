import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import Filter from "@/PTComponents/Filter";

import BottomNav from "@/PTComponents/BottomNav";
import Pencil from "@/PTComponents/Pencil";
import { Picker } from "@react-native-picker/picker";

import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen = () => {
  const router = useRouter();
  const nav = useNavigation();
   const [filterShow, setFilterShow] = useState(false);
 
  const [userId, setUserId] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [clubMeetings, setClubwithMeetings] = useState([]);
  const [compare, setCompare] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("Select Month");
  const [selectedYear, setSelectedYear] = useState("Select Year");
  const [selectedClub, setSelectedClub] = useState("All Names");
  const [id, setid] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
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
          `http://192.168.1.132:8081/clubAccess/${userId}`
        );
        const clubList = data.club_id || [];
        setClubs(clubList);

        const resMeet = await axios.get(
          `http://192.168.1.132:8081/meeting/${clubList}`
        );
        setClubwithMeetings(resMeet.data);
        setid(resMeet.data.meeting_id);
      
      } catch (error) {
        console.error("Error fetching user or club data:", error);
        Alert.alert("Error", "Failed to fetch user or club data");
      }
    })();
  }, [userId]);

  useEffect(() => {
    nav.setOptions({ headerShown: true, title: "Upcoming Meetings" });
  });

  const handlePress = async (meetingId) => {
    router.push(`club/meetings/${meetingId}`);
  };

  const handlePre = async (meetingId) => {
    try {
      await AsyncStorage.setItem("meetingId", meetingId.toString());
      router.push(`board/club/editMeeting/${meetingId}`);
    } catch (error) {
      console.error("Error saving meeting_id:", error);
    }
  };
  console.log(clubMeetings)
const isDefaultFilter =
  selectedMonth === "Select Month" &&
  selectedYear === "Select Year" &&
  selectedClub === "All Names";

const filteredMeetings = isDefaultFilter
  ? clubMeetings
  : clubMeetings.filter((meeting) => {
      const meetingDate = new Date(meeting.meeting_date);
      const meetingMonth = meetingDate.toLocaleString("default", { month: "long" }).trim();
      const meetingYear = meetingDate.getFullYear().toString();

      const monthMatches =
        selectedMonth === "Select Month" || selectedMonth === meetingMonth;
      const yearMatches =
        selectedYear === "Select Year" || selectedYear === meetingYear;
      const clubMatches =
        selectedClub === "All Names" || selectedClub === meeting.meeting_name;

      return monthMatches && yearMatches && clubMatches;
    });

  console.log(clubMeetings);
  const years = clubMeetings.map((m) =>
    new Date(m.meeting_date).getFullYear().toString()
  );
  const months = clubMeetings.map((m) =>
    new Date(m.meeting_date).toLocaleString("default", { month: "long" }).trim()
  );
  const clubsList = clubMeetings.map((m) => m.meeting_name);

  const dropdownYears = ["Select Year", ...Array.from(new Set(years))];
  const dropdownMonths = ["Select Month", ...Array.from(new Set(months))];
  const dropdownClubs = ["All Names", ...Array.from(new Set(clubsList))];
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
<TouchableOpacity onPress={() => setFilterShow(!filterShow)}
          style={styles.filterButton}>
          <Text style={styles.filterText}>Filter <Filter/></Text>
        </TouchableOpacity>
        {filterShow && <View style={styles.sortingRow}>
          <Picker
            selectedValue={selectedMonth}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedMonth(itemValue)}
          >
            {dropdownMonths.map((month) => (
              <Picker.Item key={month} label={month} value={month} />
            ))}
          </Picker>

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
            selectedValue={selectedClub}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedClub(itemValue)}
          >
            {dropdownClubs.map((club) => (
              <Picker.Item key={club} label={club} value={club}></Picker.Item>
            ))}
          </Picker>
        </View>}
        {/* Sorting Dropdowns */}
        

        {/* Meeting Buttons */}
        {filteredMeetings.map((meeting, index) => {
          const d = new Date(meeting.meeting_date);
          const today = new Date();
           const isEnded = d < today;

          const dayName = new Intl.DateTimeFormat("en-AU", {
            weekday: "long",
            timeZone: "Australia/Sydney",
          }).format(d);
         
          const dateStr = new Intl.DateTimeFormat("en-AU", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            timeZone: "Australia/Sydney",
          }).format(d);
          return (
            
    <View key={meeting.meeting_id} style={styles.meetingRow}>
    { !isEnded && ( <TouchableOpacity onPress={() => handlePre(meeting.meeting_id)}>
        <Pencil />
      </TouchableOpacity>)}

      <TouchableOpacity
        style={[
          styles.meetingCard,
          isEnded ? styles.endedCard : styles.activeCard,
        ]}
        onPress={() => handlePress(meeting.meeting_id)}
      >
        <View style={styles.meetingTextBlock}>
          <Text
            style={[
              styles.meetingClub,
              isEnded ? styles.endedText : styles.activeText,
            ]}
          >
            {meeting.meeting_name} #{meeting.meeting_id}
          </Text>
          <Text
            style={[
              styles.meetingDate,
              isEnded ? styles.endedText : styles.activeText,
            ]}
          >
            Date: {dateStr} {dayName}
          </Text>
        </View>

        {isEnded && (
          <View style={styles.endedTag}>
            <Text style={styles.endedTagText}>Ended</Text>
          </View>
        )}
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

  add: {
    marginTop: 20,
  },
  memberRow: {
  flexDirection: "row",
  alignItems: "center",
  marginVertical: 5,
},

  addText: {
    color: "#065395",
    fontSize: 15,
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

    marginBottom: 20,  },
  symbol: {
    fontSize: 40,
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
    borderTopStartRadius: 10,
    borderBottomStartRadius: 10,
    flex: 4,
  },
  meetingClub: {
    fontWeight: "600",
    color: "#ffffff",
    fontSize: 20,
  },
  status:{
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
   filterButton: {
    flex:1,
    marginVertical:10,
    padding:5,
    borderRadius:8,
    backgroundColor: "#065395",
    alignItems:"center",
    justifyContent:"center"
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
    backgroundColor:"#F1F6F5",
    marginBottom:5
  },
  meetingRow: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 12,
},

meetingCard: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  flex: 1,
  marginLeft: 8,
  borderRadius: 10,
  paddingVertical: 10,
  paddingHorizontal: 12,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.2,
  shadowRadius: 2,
  elevation: 2,
},

activeCard: {
  backgroundColor: "#8A7D6A", // brown-gray
},

endedCard: {
  backgroundColor: "#F4C542", // light yellow
},

meetingTextBlock: {
  flexShrink: 1,
},

meetingClub: {
  fontSize: 18,
  fontWeight: "600",
},

meetingDate: {
  marginTop: 3,
  fontSize: 15,
},

activeText: {
  color: "#fff",
},

endedText: {
  color: "#000",
},

endedTag: {
  backgroundColor: "#AFABA3",
  paddingHorizontal: 10,
  paddingVertical: 10,
  borderRadius: 8,
  alignSelf: "center",
},

endedTagText: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 14,
},

});

export default ProfileScreen;
