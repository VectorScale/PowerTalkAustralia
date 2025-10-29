import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import AssocMenu from "@/PTComponents/AssocMenu";
import BottomNav from "@/PTComponents/BottomNav";
import FilterButton from "@/PTComponents/FilterButton";

const ClubMembersPage = () => {
  const [userId, setUserId] = useState("");
  const router = useRouter();
  const nav = useNavigation();

  const [memberDetails, setDetails] = useState<any>([]);
  const [sortedDetails, setSortedDetails] = useState<any>([]);
  const [clubs, setClubs] = useState<any>([]);
  const [clubIds, setClubIds] = useState<any>([]);
  const [ids, setIds] = useState<any>([]);
  const [sortedIds, setSorted] = useState<any>([]);

  const [filterShow, setFilter] = useState(false);
  const [sortBy, setSortBy] = useState("None");

  const [selectedClub, setSelectedClub] = useState("All Clubs");
  const [selectedClubId, setSelectedClubId] = useState(0);

  const [level, setLevel] = useState(0);
  const levelsReadable = ["Members", "Board", "Council", "Association"];

  const [loaded, setLoaded] = useState(false);


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
      nav.setOptions({ title: `${levelsReadable[level]} (0)` });
      try {
        setSelectedClub("All Clubs");
        setSelectedClubId(0);
        setSortBy("None");
        if (level == 0) {
          const res = await axios.get(`${process.env.EXPO_PUBLIC_IP}/users`);
          setIds(res.data);
        } else {
          const res = await axios.get(
            `${process.env.EXPO_PUBLIC_IP}/association/boardMembers/${level - 1}`
          );
          setIds(res.data);
        }
      } catch (error) {
        console.error("Error fetching Member:", error);
        Alert.alert("Error", "Failed to fetch Members");
      }
    })();
  }, [level]);

  useEffect(() => {
    setSorted(ids);
  }, [ids]);

  useEffect(() => {
    (async () => {
      try {
        axios
          .get(`${process.env.EXPO_PUBLIC_IP}/clubs`)
          .then((res) => {
            setClubs(res.data);
          })
      } catch (error) {
        console.error("Error fetching member details:", error);
        Alert.alert("Error", "Failed to fetch Club Sorting");
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedClubId) { setSorted(ids); return; }
    setLoaded(false);
    (async () => {
      try {
        await axios
          .get(`${process.env.EXPO_PUBLIC_IP}/clubBoard/${selectedClubId}`)
          .then((res) => {
            if (res.status == 200) {
              setClubIds(res.data);
            }
            else {
              setDetails([]);
              setSortedDetails([]);
              setLoaded(true);
            }
          });
      } catch (error) {
        console.error("Error fetching member details:", error);
        Alert.alert("Error", "Failed to fetch Club Sorting");
      }
    })();
  }, [selectedClubId]);

  useEffect(() => {
    if (level > 0) {
      setSorted(
        ids.filter((item: any) => {
          let allow = false;
          if (item.club_id == selectedClubId) allow = true;
          return allow;
        })
      );

    } else {
      setSorted(
        ids.filter((item: any) => {
          let allow = false;
          clubIds.forEach((club: any) => {
            if (item.user_id == club.User_id) allow = true;
          });
          return allow;
        })
      );
    }
  }, [clubIds]);

  useEffect(() => {
    if(sortedIds.length==0) return;
    (async () => {
      try {
        const MemberDetails = await Promise.all(
          sortedIds.map(async (item: any) => {
            const res = await axios.get(
              `${process.env.EXPO_PUBLIC_IP}/clubBoardMembers/${item.user_id}`
            );
            const result = await axios.get(
              `${process.env.EXPO_PUBLIC_IP}/clubAccess/${item.user_id}`
            );
            const position = result.data.position;
            const firstName = res.data[0].first_name
            const lastName = res.data[0].last_name;
            const id = res.data[0].user_id;
            const guest = res.data[0].guest;
            const PaidAmount = res.data[0].paid;
            const joinDate = res.data[0].join_date;
            return {
              firstName,
              lastName,
              id,
              guest,
              PaidAmount,
              position,
              joinDate
            };
          })
        );
        let setObj = new Set<any>([]);
        MemberDetails.forEach((member: any) => {
          setObj.add(member);
        });
        setDetails(Array.from(setObj));
        setLoaded(true);
      } catch (error) {
        console.error("Error fetching member details:", error);
        Alert.alert("Error", "Failed to fetch Member Details");
      }
    })();
  }, [sortedIds]);

  useEffect(() => {
    if (loaded)
    nav.setOptions({ title: `${levelsReadable[level]} (${memberDetails.length})` });
  }, [memberDetails, loaded]);


  useEffect(() => {
  if (sortBy == "None" || memberDetails.length == 0) {setSortedDetails([]); return;}
    const sortedMembers = memberDetails.sort((a: any, b: any) => {
      if (sortBy == "Z-A") {
        const firstCompare = a.lastName.localeCompare(b.lastName);
        if (firstCompare !== 0) {
          return firstCompare;
        } else {
          return a.firstName.localeCompare(b.firstName);
        }
      } else if (sortBy == "A-Z") {
        const firstCompare = b.lastName.localeCompare(a.lastName);
        if (firstCompare !== 0) {
          return firstCompare;
        } else {
          return b.firstName.localeCompare(a.firstName);
        }
      } else if (sortBy == "New") {
        return a.joinDate.localeCompare(b.joinDate);
      } else if (sortBy == "Old") {
        return b.joinDate.localeCompare(a.joinDate);
      }
    });
    setSortedDetails(sortedMembers);
    console.log("Loaded2");
    setLoaded(true);
  }, [sortBy, memberDetails]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header Block */}
        <AssocMenu
          onPressMembers={() => setLevel(0)}
          onPressBoard={() => setLevel(1)}
          onPressCouncil={() => setLevel(2)}
          onPressAssoc={() => setLevel(3)}
          level={level}
        />
        <FilterButton onFilter={() => setFilter(!filterShow)} />
        {filterShow && (<View>
          <Picker
            selectedValue={selectedClub}
            style={styles.picker}
            onValueChange={(itemValue, itemIndex) => {
              setSelectedClub(itemValue);
              if (itemValue == "All Clubs") {
                setSelectedClubId(0);
              } else {

                const clubObj = clubs.find(
                  (club: any) => club.club_name === itemValue
                );
                if (clubObj) {
                  setSelectedClubId(clubObj.club_id);
                }
              }
            }
            }
          >
            <Picker.Item label="All Clubs" value={"All Clubs"} />
            {clubs.map((club: any) => (
              <Picker.Item
                key={club.club_id}
                label={club.club_name}
                value={club.club_name}
              />
            ))}
          </Picker>
          <Picker
            selectedValue={sortBy}
            style={styles.picker}
            onValueChange={(itemValue) => setSortBy(itemValue)}
          >
            <Picker.Item label="Sort By" value="None" />
            <Picker.Item label="Last Name A-Z" value="A-Z" />
            <Picker.Item label="Last Name Z-A" value="Z-A" />
            <Picker.Item label="Join Date Newest" value="New" />
            <Picker.Item label="Join Date Oldest" value="Old" />
          </Picker>
        </View>)}

        {loaded ? (memberDetails.length > 0 ? (sortedDetails.length > 0 ? sortedDetails : memberDetails).map((member: any, index: any) => (
          <View
            key={index} style={styles.memberBlock}>
            <TouchableOpacity
              style={styles.memberInfo}
              onPress={() =>
                router.navigate({
                  pathname: "/profile/[profileID]",
                  params: { profileID: member.id },
                })
              }
            >
              <Text style={styles.meetingName}>
                {member.firstName} {member.lastName}
              </Text>
            </TouchableOpacity>
            <View style={styles.memberStatus}>
              {member.position ? (
                <Text style={styles.meetingName}>
                  {member.position}
                </Text>) : (
                <Text style={styles.meetingName}>
                  {member.PaidAmount == 1 ? "Paid" : "Unpaid"}
                </Text>)}
            </View>
          </View>
        )) : <Text style={{ flex: 1, textAlign: "center", margin: 20, fontSize: 20, fontWeight: "bold" }}>No Members Match Given Filters</Text>) :
          <ActivityIndicator size="large" color="#065395" />}
      </ScrollView>
      <BottomNav
        number={3}
        name={["Members", "Meetings", "Projects"]}
        link={[
          "/board/association/members",
          "/board/association/meetings",
          "/board/association/projects",
        ]}
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
  containers: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
  },
  picker: {
    flex: 1,
    backgroundColor: "#F1F6F5",
    marginBottom: 5,
  },
  content: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sortingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  memberBlock: {
    flex: 1,
    flexDirection: "row",
  },
  memberInfo: {
    flex: 5,
    marginTop: 15,
    backgroundColor: "#8A7D6A",
    padding: 15,
    borderRadius: 10,
    justifyContent: "center",
  },
  memberStatus: {
    flex: 2,
    marginTop: 15,
    backgroundColor: "#AFABA3",
    padding: 15,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center"
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
