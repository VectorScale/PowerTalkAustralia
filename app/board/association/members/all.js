import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import AssocMenu from "@/PTComponents/AssocMenu";

const ClubMembersPage = () => {
  const router = useRouter();

  const [memberdetails, setDetails] = useState([]);
  const [sortByName, setSortByName] = useState("A-Z");
  const [selectedClub, setSelectedClub] = useState("All Clubs");
  const [clubs, setClubs] = useState([]);
  const [ids, setids] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState(null);
  const [clubBoardData, setClubBoardData] = useState([]);
  const [userId, setUserId] = useState(null);
  const [names, setnames] = useState([]);

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

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${process.env.EXPO_PUBLIC_IP}/members`);

        setDetails(res.data.user);
      } catch (error) {
        console.error("Error fetching Member:", error);
        Alert.alert("Error", "Failed to fetch Members");
      }
    })();
  }, []);

  useEffect(() => {
    axios
      .get(`${process.env.EXPO_PUBLIC_IP}/clubs`)
      .then((res) => setClubs(res.data))
      .catch((err) => {
        console.error("Error fetching clubs:", err);
        Alert.alert("Error", "Failed to fetch Clubs");
      });
  }, []);

  useEffect(() => {
    if (!selectedClubId) return;
    axios
      .get(`${process.env.EXPO_PUBLIC_IP}/clubBoard/${selectedClubId}`)
      .then((res) => setids(res.data))
      .catch((err) => {
        console.error("Error fetching Club Board:", err);
        Alert.alert("Error", "Failed to fetch Club Board");
      });
  }, [selectedClubId]);

  useEffect(() => {
    if (!selectedClubId) return;
    (async () => {
      try {
        // Step 1: Get club list from user info
        const { data } = await axios.get(
          `${process.env.EXPO_PUBLIC_IP}/clubBoard/${selectedClubId}`
        );

        const MemberDetails = await Promise.all(
          data.map(async (item) => {
            const res = await axios.get(
              `${process.env.EXPO_PUBLIC_IP}/clubBoardMembers/${item.member_id}`
            );
            const result = await axios.get(
              `${process.env.EXPO_PUBLIC_IP}/clubAccess/${item.member_id}`
            );
            const position = result.data.position;
            const MemberNames =
              res.data[0].first_name + " " + res.data[0].last_name;
            const id = res.data[0].user_id;
            const guest = res.data[0].guest;
            const PaidAmount = res.data[0].paid;
            return {
              MemberNames,
              id,
              guest,
              PaidAmount,
              position,
            };
          })
        );
        setnames(MemberDetails);
      } catch (error) {
        console.error("Error fetching member details:", error);
        Alert.alert("Error", "Failed to fetch Member Details");
      }
    })();
  }, [selectedClubId]);

  const sortedMembers = memberdetails.sort((a, b) => {
    if (sortByName == "A-Z") {
      const firstCompare = a.first_name.localeCompare(b.first_name);
      if (firstCompare !== 0) {
        return firstCompare;
      } else {
        return a.last_name.localeCompare(b.last_name);
      }
    }
  });

  const unsortedMembers = memberdetails.sort((a, b) => {
    if (sortByName == "Z-A") {
      const firstCompare = b.first_name.localeCompare(a.first_name);
      if (firstCompare !== 0) {
        return firstCompare;
      } else {
        return b.last_name.localeCompare(a.last_name);
      }
    }
  });
  const members = names.filter((n) => n.guest === 0 && n.position == undefined);
  const handlePress = async (memberId) => {
    try {
      await AsyncStorage.setItem("Id", memberId);
      router.push("/member_details");
    } catch (error) {
      console.error("Error saving meeting_id:", error);
    }
  };
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header Block */}
        <View style={styles.meetingHeaderBlock}>
          <Text style={styles.meetingHeaderText}>Club</Text>
          <Picker
            selectedValue={selectedClub}
            style={styles.pickers}
            onValueChange={(itemValue, itemIndex) => {
              setSelectedClub(itemValue);

              const clubObj = clubs.find(
                (club) => club.Club_name === itemValue
              );
              if (clubObj) {
                setSelectedClubId(clubObj.Club_id);
              }
            }}
          >
            <Picker.Item label="Select Club" value="Club selected" />
            {clubs.map((club) => (
              <Picker.Item
                key={club.Club_id}
                label={club.Club_name}
                value={club.Club_name}
              />
            ))}
          </Picker>
          <Text>
            Number of Members: {members.length}
          </Text>
        </View>
        <AssocMenu/>

        {/* Sorting Dropdowns */}
        <View style={styles.sortingRow}>
          <Picker
            selectedValue={sortByName}
            style={styles.picker}
            onValueChange={(itemValue) => setSortByName(itemValue)}
          >
            <Picker.Item label="Join Month" value="Months" />
          </Picker>

          <Picker style={styles.picker}>
            <Picker.Item label="Join Year" value="Years" />
          </Picker>
        </View>

        {selectedClubId != null &&
          members.map((member, index) => (
            <TouchableOpacity
              key={index}
              style={styles.meetingBlock}
              onPress={() => handlePress(member.id)}
            >
              <Text style={styles.meetingName}>
                {member.MemberNames} <Text>Paid: {member.PaidAmount}</Text>{" "}
              </Text>
            </TouchableOpacity>
          ))}
      </ScrollView>
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Text style={[styles.navButton, styles.activeButton]}>Clubs</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("MembersMeetingPage")}
        >
          <Text style={styles.navButton}>Meeting</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("ProjectLevelsPage")}
        >
          <Text style={styles.navButton}>Project</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ClubMembersPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  containers: {
    flex:1,
    flexDirection: "row",
    justifyContent: "center",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#f4f6f1ff",
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
  pickers: {
    flex: 1,
    flexDirection: "row",
    height: 30,
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
  meetingName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  warning: {
    textAlign: "center",
    paddingTop: 280,
    paddingBottom: 300,
    fontSize: 25,
  },
});
