import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";

import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import BottomNav from "./components/BottomNav";
import PTHeader from "./components/PTHeader";

const ClubMembersPage = () => {
  const router = useRouter();

  const [memberdetails, setDetails] = useState([]);
  const [sortByName, setSortByName] = useState("A-Z");
  const [selectedClub, setSelectedClub] = useState("All Clubs");
  const [clubs, setClubs] = useState([]);
  const [ids, setids] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState(null);
  const [clubBoardData, setClubBoardData] = useState([]);
  const [userId, setUserId] = useState("");

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
        const res = await axios.get(
          `http://${process.env.EXPO_PUBLIC_IP}:8081/members`
        );

        setDetails(res.data.user);
      } catch (error) {
        console.error("Error fetching user or club data:", error);
        Alert.alert("Error", "Failed to fetch user or club data");
      }
    })();
  }, []);

  useEffect(() => {
    axios
      .get(`http://${process.env.EXPO_PUBLIC_IP}:8081/clubs`)
      .then((res) => setClubs(res.data))
      .catch((err) => {
        console.error("Error fetching clubs:", err);
        Alert.alert("Error", "Failed to fetch clubs");
      });
  }, []);

  useEffect(() => {
    if (!selectedClubId) return;
    axios
      .get(`http://${process.env.EXPO_PUBLIC_IP}/clubBoard/${selectedClubId}`)
      .then((res) => setids(res.data))
      .catch((err) => {
        console.error("Error fetching clubs:", err);
        Alert.alert("Error", "Failed to fetch clubs");
      });
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

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      {userId && <PTHeader button={true} text={"Profile"} link={"profile"} />}
      {userId == null && (
        <View style={styles.logoContainer}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: `/`,
              })
            }
          >
            <Image
              source={{
                uri: "https://www.powertalkaustralia.org.au/wp-content/uploads/2023/12/Asset-74x.png",
              }}
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconWrapper}
            onPress={() => router.push("/login")}
          >
            Login
          </TouchableOpacity>
        </View>
      )}
      {userId != null && (
        <ScrollView style={styles.content}>
          {/* Header Block */}
          <View style={styles.meetingHeaderBlock}>
            <Text style={styles.meetingHeaderText}>Club Members</Text>
          </View>

          {/* Sorting Dropdowns */}
          <View style={styles.sortingRow}>
            <Picker
              selectedValue={sortByName}
              style={styles.picker}
              onValueChange={(itemValue) => setSortByName(itemValue)}
            >
              <Picker.Item label="A-Z" value="A-Z" />
              <Picker.Item label="Z-A" value="Z-A" />
            </Picker>

            <Picker
              selectedValue={selectedClub}
              style={styles.picker}
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
              <Picker.Item label="All Clubs" value="All Clubs" />
              {clubs.map((club) => (
                <Picker.Item
                  key={club.Club_id}
                  label={club.Club_name}
                  value={club.Club_name}
                />
              ))}
            </Picker>
          </View>

          {(selectedClub === "All Clubs"
            ? memberdetails
            : memberdetails.filter((member) =>
                ids.some((idObj) => idObj.User_id === member.user_id)
              )
          ).map((member) => (
            <TouchableOpacity
              key={member.user_id}
              style={styles.meetingBlock}
              onPress={() =>
                router.push({
                  pathname: "/profile/[profileID]",
                  params: { profileID: member.user_id },
                })
              }
            >
              <Text style={styles.meetingName}>
                {member.first_name} {member.last_name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      {userId == null && (
        <TouchableOpacity
          style={styles.warning}
          onPress={() => router.push("./login")}
        >
          Warning: You need to become a member and do the login to see this
          content
        </TouchableOpacity>
      )}

      {/* Bottom Navigation */}
      <BottomNav active={1} />
    </View>
  );
};

export default ClubMembersPage;

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
  logo: {
    width: 300,
    height: 50,
    right: 80,
    resizeMode: "contain",
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
