import React, { useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

import BottomNav from "@/PTComponents/BottomNav";
import FilterButton from "@/PTComponents/FilterButton";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import NoAuthentication from "@/PTComponents/NoAuth";

const ClubMembersPage = () => {
  const router = useRouter();

  const [memberdetails, setDetails] = useState<any>([]);
  const [sortByName, setSortByName] = useState("A-Z");
  const [selectedClub, setSelectedClub] = useState("All Clubs");
  const [clubs, setClubs] = useState<any>([]);
  const [ids, setids] = useState<any>([]);

  const [filterShow, setFilterShow] = useState(false);
  const [selectedClubId, setSelectedClubId] = useState(null);

  const [userId, setUserId] = useState("");
  const nav = useNavigation();

  useEffect(() => {
    nav.setOptions({ headerShown: true, title: "Club Members" });
  });

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
        const res = await axios.get(`${process.env.EXPO_PUBLIC_IP}/members`);

        setDetails(res.data.user);
      } catch (error) {
        console.error("Error fetching user or club data:", error);
        Alert.alert("Error", "Failed to fetch user or club data");
      }
    })();
  }, []);

  useEffect(() => {
    axios
      .get(`${process.env.EXPO_PUBLIC_IP}/clubs`)
      .then((res) => setClubs(res.data))
      .catch((err) => {
        console.error("Error fetching clubs:", err);
        Alert.alert("Error", "Failed to fetch clubs");
      });
  }, []);

  useEffect(() => {
    if (!selectedClubId) return;
    axios
      .get(`${process.env.EXPO_PUBLIC_IP}/clubBoard/${selectedClubId}`)
      .then((res) => setids(res.data))
      .catch((err) => {
        console.error("Error fetching clubs:", err);
        Alert.alert("Error", "Failed to fetch clubs");
      });
  }, [selectedClubId]);

  return (
    <View style={styles.container}>
      {userId != null && (
        <ScrollView style={styles.content}>
          {/* Sorting Dropdowns */}
          <FilterButton
            onFilter={() => setFilterShow(!filterShow)}
          />
          {filterShow && (
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
                }}
              >
                <Picker.Item label="All Clubs" value="All Clubs" />
                {clubs.map((club: any) => (
                  <Picker.Item
                    key={club.club_id}
                    label={club.club_name}
                    value={club.club_id}
                  />
                ))}
              </Picker>
            </View>
          )}

          {(selectedClub === "All Clubs"
            ? memberdetails
            : memberdetails.filter((member: any) =>
                ids.some((idObj: any) => idObj.User_id === member.user_id)
              )
          ).map((member: any) => (
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
      {userId == null && <NoAuthentication />}

      {/* Bottom Navigation */}
      <BottomNav
        number={3}
        name={["Members", "Meetings", "Development Program"]}
        link={["/club/members", "/club/meetings", "/projects"]}
        active={1}
      />
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
  meetingName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});
