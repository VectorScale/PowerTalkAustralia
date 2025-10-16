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
import BottomNav from "@/PTComponents/BottomNav";
import FilterButton from "@/PTComponents/FilterButton";

const ClubMembersPage = () => {
  const [userId, setUserId] = useState("");
  const router = useRouter();
  const nav = useNavigation();

  const [memberDetails, setDetails] = useState<any>([]);
  const [clubs, setClubs] = useState<any>([]);
  const [clubIds, setClubIds] = useState<any>([]);
  const [ids, setIds] = useState<any>([]);
  const [sortedIds, setSorted] = useState<any>([]);

  const [filterShow, setFilter] = useState(false);
  const [sortBy, setSortBy] = useState("Sort By");

  const [selectedClub, setSelectedClub] = useState("All Clubs");
  const [selectedClubId, setSelectedClubId] = useState(0);

  const [level, setLevel] = useState(0);
  const levelsReadable = ["Members", "Board", "Council", "Association"];

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
        if (level == 0) {
          const res = await axios.get(`${process.env.EXPO_PUBLIC_IP}/members`);
          setIds(res.data);
        } else {
          const res = await axios.get(
            `${process.env.EXPO_PUBLIC_IP}/association/boardMembers/${level}`
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
    (async () => {
      try {
        await axios
          .get(`${process.env.EXPO_PUBLIC_IP}/clubBoard/${selectedClubId}`)
          .then((res) => setClubIds(res.data));
      } catch (error) {
        console.error("Error fetching member details:", error);
        Alert.alert("Error", "Failed to fetch Club Sorting");
      }
    })();
  }, [selectedClubId]);

  useEffect(() => {
    setSorted(
      ids.filter((item: any) => {
        let allow = false;
        clubIds.forEach((club: any) => {
          if (item.user_id == club.User_id) allow = true;
        });
        return allow;
      })
    );
  }, [clubIds]);

  useEffect(() => {
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
        setDetails(MemberDetails);
      } catch (error) {
        console.error("Error fetching member details:", error);
        Alert.alert("Error", "Failed to fetch Member Details");
      }
    })();
  }, [sortedIds]);

  useEffect(() => {
    
      nav.setOptions({ title: `${levelsReadable[level]} (${memberDetails.length})` });
  }, [memberDetails]);


  /*
  const sortedMembers = memberDetails.sort((a: any, b: any) => {
    if (sortByName == "A-Z") {
      const firstCompare = a.first_name.localeCompare(b.first_name);
      if (firstCompare !== 0) {
        return firstCompare;
      } else {
        return a.last_name.localeCompare(b.last_name);
      }
    }
  });

  const unsortedMembers = memberDetails.sort((a: any, b: any) => {
    if (sortByName == "Z-A") {
      const firstCompare = b.first_name.localeCompare(a.first_name);
      if (firstCompare !== 0) {
        return firstCompare;
      } else {
        return b.last_name.localeCompare(a.last_name);
      }
    }
  });

  const members = names.filter(
    (n: any) => n.guest === 0 && n.position == undefined
  );

  */
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header Block */}
        <AssocMenu
          onPressMembers={() => setLevel(0)}
          onPressBoard={() => setLevel(1)}
          onPressCouncil={() => setLevel(2)}
          onPressAssoc={() => setLevel(3)}
        />
        <FilterButton onFilter={()=>setFilter(!filterShow)}/>
        {filterShow && (<View>
            <Picker
              selectedValue={selectedClub}
              style={styles.picker}
              onValueChange={(itemValue, itemIndex) => {
                setSelectedClubId(Number(itemValue));
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
          <Picker
            selectedValue={sortBy}
            style={styles.picker}
            onValueChange={(itemValue) => setSortBy(itemValue)}
          >
            <Picker.Item label="Sort By" value="None"/>
            <Picker.Item label="Last Name A-Z" value="A-Z"/>
            <Picker.Item label="Last Name Z-A" value="Z-A"/>
            <Picker.Item label="Join Date Newest" value="None"/>
            <Picker.Item label="Join Date Oldest" value="None"/>
          </Picker>
        </View>)}

        {memberDetails.map((member: any, index: any) => (
          <TouchableOpacity
            key={index}
            style={styles.meetingBlock}
            onPress={() =>
              router.navigate({
                pathname: "/profile/[profileID]",
                params: { profileID: member.id },
              })
            }
          >
            <Text style={styles.meetingName}>
              {member.MemberNames} <Text>Paid: {member.PaidAmount}</Text>
            </Text>
          </TouchableOpacity>
        ))}
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
    marginBottom:5,
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
