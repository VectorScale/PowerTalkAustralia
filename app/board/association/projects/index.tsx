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
  const [clubs, setClubs] = useState<any>([]);
  const [users, setUsers] = useState<any>([]);

  const [filterShow, setFilterShow] = useState(false);
  const [sortMode, setSort] = useState("A-Z");
  const [sortedUsers, setSorted] = useState<any>([]);

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
    nav.setOptions({ headerShown: true, title: "Completed Projects" });
  }, []);

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
    (async () => {
      try {
        // Step 2: Fetch Projects
        const res = await axios.get(
          `${process.env.EXPO_PUBLIC_IP}/projects/completed`
        );
        if (res.status == 201) return null;

        const userNames = await Promise.all(
        res.data.map(async (user: any) => {
          console.log(user);
          if (user.completed > 0) {
            const res = await axios.get(
              `${process.env.EXPO_PUBLIC_IP}/member/${user.user_id}`
            );

            const FullName = `${res.data.first_name} ${res.data.last_name}`;
            const Users = {
              member: FullName,
              id: user.user_id,
              completed: user.completed,
            };

            return Users;
          } else {
            return [];
          }
        }));

       const flatUserNames = userNames.flatMap((user)=>{return user;})
        console.log(flatUserNames);
        setUsers(flatUserNames);
      } catch (error) {
        console.error("Error fetching user or club data:", error);
        Alert.alert("Error", "Failed to fetch user or club data");
      }
    })();
  }, []);

  useEffect(() => {
    if (!users) return;
    console.log("hello");
    (async () => {
      console.log(users);
      setSorted(
        users.sort((a:any, b:any) => {
          console.log(a.member);
          console.log(a.member > b.member);
          if (sortMode == "A-Z") {
            console.log(1);
            if(a.member < b.member) return 1;
            console.log(2);
            
            if(a.member < b.member) return -1;
          } else {
            console.log(3);
            if(a.member > b.member) return 1;
            console.log(4);
            
            if(a.member < b.member) return -1;
          }
          return 0;
        })
      );
    })();
  }, [sortMode, users]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Sorting Dropdowns */}
        <FilterButton onFilter={() => setFilterShow(!filterShow)} />
        {filterShow && (
          <View style={styles.sortingRow}>
            <Picker
              selectedValue={sortMode}
              style={styles.picker}
              onValueChange={(itemValue) => setSort(itemValue)}
            >
                <Picker.Item label={"Sort A-Z"} value={"A-Z"}></Picker.Item>
                <Picker.Item label={"Sort Z-A"} value={"Z-A"}></Picker.Item>
            </Picker>
          </View>
        )}

        {/* Meeting Buttons */}
        {sortedUsers.map((user: any, index: number) => {
          return (
            <TouchableOpacity
              key={index}
              style={styles.meetingBlock}
              onPress={() =>
                router.navigate({
                  pathname: "/board/association/projects/[projectUserID]",
                  params: { projectUserID: user.id },
                })
              }
            >
              <Text style={styles.meetingName}>{user.member}</Text>
              <Text style={styles.meetingClub}>Completed Projects: {user.completed}</Text>
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
          active={3}
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
