import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Alert,
  StyleSheet,
  Button,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import axios from "axios";
import BottomNav from "@/PTComponents/BottomNav";
import FormInput from "@/PTComponents/FormInput";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { useKeyboard } from "@react-native-community/hooks";

const ClubGuestsPage = () => {
  const router = useRouter();

  const [memberDetails, setDetails] = useState([]);
  const [filteredDetails, setFiltered] = useState([]);
  const [searchTerm, setSearch] = useState("");

  const [clubId, setClubId] = useState("");
  const [userId, setUserId] = useState("");

  const [reload, setReload] = useState(0);

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
    if (userId == "") return;
    (async () => {
      try {
        const access = await axios.get(
          `${process.env.EXPO_PUBLIC_IP}/clubAccess/${userId}`
        );
        setClubId(access.data.club_id);
      } catch (error) {
        console.error("Error fetching club:", error);
        Alert.alert("Error", "Failed to load Club");
      }
    })();
  }, [userId]);

  useEffect(() => {
    if (clubId == "") return;
    (async () => {
      try {
        // Step 1: Get club list from user info
        const { data } = await axios.get(
          `${process.env.EXPO_PUBLIC_IP}/allGuests/`
        );
        console.log(data);

        const MemberDetails = await Promise.all(
          data.map(async (item) => {
            const res = await axios.get(
              `${process.env.EXPO_PUBLIC_IP}/clubBoardMembers/${item.user_id}`
            );
            const firstName = res.data[0].first_name
            const lastName = res.data[0].last_name;
            const id = res.data[0].user_id;
            const guest = res.data[0].guest;
            return {
              firstName,
              lastName,
              guest,
              id,
            };
          })
        );
        setDetails(MemberDetails);
      } catch (error) {
        console.error("Error fetching user details:", error);
        Alert.alert("Error", "Failed to fetch user details");
      }
    })();
  }, [clubId, useIsFocused(), reload]);

  useEffect(() => {
    console.log(searchTerm);
    if (!memberDetails) return;
    if (searchTerm == "") {
      setFiltered(memberDetails);
    } else {
      const filter = memberDetails.filter((member) => {
        const length = searchTerm.length;
        if (
          member.lastName.toLowerCase().slice(0, length) ==
          searchTerm.toLowerCase()
        ) {
          console.log(member);
          return member;
        }
      });
      console.log(filter);
      setFiltered(filter);
    }
  }, [searchTerm, memberDetails]);

  const handleIncrement = async (user_id, guest) => {
    const payload = {
      user_id,
      guest
    };
    try {
      const res = await axios.post(
        `${process.env.EXPO_PUBLIC_IP}/guest/increment`, payload
      );
      setReload(reload + 1);
      Alert.alert("Success", "Increased the number of used meetings");
    } catch (error) {
      console.error("Error fetching user details:", error);
      Alert.alert("Error", "Failed to Increment Guest Meetings");
    }
  };
  /*
    const Search = async () => {
      try {
        const res = await axios.get(
          `${process.env.EXPO_PUBLIC_IP}/clubBoardMembers/${id}`
        );
        setresults(res.data);
        console.log(res.data);
      } catch (error) {
        console.error("Search failed:", error);
      }
    };
    */

  if (!memberDetails) return;
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Text>Search by Last Name</Text>
        <FormInput onChangeText={setSearch} placeholder={"Last Name"} />
      </View>

      {filteredDetails.length == 0 ? (
        <Text style={[styles.content, { flex: 1 }]}>User Not Found</Text>
      ) : (
        <ScrollView style={[styles.content]}>
          <View>
            <TouchableOpacity
              style={styles.Add}
              onPress={() =>
                router.push({
                  pathname: "/board/club/addGuest",
                })
              }
            >
              <Text style={styles.addText}>+ Add Guest</Text>
            </TouchableOpacity>
          </View>
          {/* Member List */}
          {filteredDetails.map((member, index) => (
            <View key={index} style={styles.function}>
              <TouchableOpacity
                style={styles.guestInfo}
                onPress={() =>
                  router.push({
                    pathname: "/profile/[profileID]",
                    params: { profileID: member.id },
                  })}
              >
                <Text style={styles.meetingName}>{member.firstName} {member.lastName}</Text>
                <Text style={styles.meetingsUsed}>Free Meetings Used: {member.guest}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.guestIncrement}
                onPress={() => handleIncrement(member.id, member.guest + 1)}>
                <Text style={styles.meetingName}>Check Off</Text>
              </TouchableOpacity>

            </View>
          ))}
        </ScrollView>)}
      {!useKeyboard().keyboardShown && (
        <BottomNav
          number={3}
          name={["Members", "Guests", "Meeting"]}
          link={[
            "/board/club/members",
            "/board/club/guests",
            "/board/club/meetings",
          ]}
          active={2}
        />
      )}
      {/*results.map((member, index) => (
        <Text key={index}>
          {member.first_name} {member.last_name} Paid: {member.paid}
        </Text>
      ))*/}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F6F5",
  },
  Add: {
    flex: 1,
    marginTop: 10,
  },
  addText: {
    color: "#065395",
    fontSize: 15,
    flex: 1,
    textAlign: "right",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  function: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 10,
  },
  modalBox: {
    margin: 30,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  content: {
    flex: 1,
    padding: 10,
    marginHorizontal: 10,
    marginTop: 5,
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },
  searchContainer: {
    padding: 10,
    marginHorizontal: 10,
    marginBottom: 5,
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },
  guestInfo: {
    flex: 4,
    marginTop: 15,
    backgroundColor: "#AFABA3",
    padding: 15,
    borderRadius: 10,
  },
  guestIncrement: {
    flex: 2,
    marginTop: 15,
    backgroundColor: "#8A7D6A",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  paidTag: {
    fontWeight: "600",
    color: "#ffffff",
  },
  meetingName: {
    fontSize: 16,
    marginTop: 4,
    color: "#ffffff",
  },
  meetingsUsed: {
    flex: 1,
    textAlign: "center",
    fontSize: 14,
    marginTop: 4,
    color: "#ffffff",
  },
});
export default ClubGuestsPage;
