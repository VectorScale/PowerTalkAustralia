import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import FormInput from "@/PTComponents/FormInput";
import PTButton from "@/PTComponents/Button";

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";

const PORT = 8081;

const AddExistingPage = () => {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [clubId, setClubId] = useState("");
  const [memberDetails, setDetails] = useState([]);
  const [filteredDetails, setFiltered] = useState([]);
  const [searchTerm, setSearch] = useState("");

  const [add, setAdd] = useState(0);
  const [active, setActive] = useState(0);

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
          `${process.env.EXPO_PUBLIC_IP}/notInClub/${clubId}`
        );

        const MemberDetails = await Promise.all(
          data.map(async (item) => {
            const res = await axios.get(
              `${process.env.EXPO_PUBLIC_IP}/clubBoardMembers/${item.user_id}`
            );
            const firstName = res.data[0].first_name;
            const lastName = res.data[0].last_name + "";
            const id = res.data[0].user_id;
            const email = res.data[0].email;
            const phone_number = res.data[0].phone_number;
            return {
              firstName,
              lastName,
              id,
              email,
              phone_number,
            };
          })
        );
        setDetails(MemberDetails);
        setFiltered(MemberDetails);
      } catch (error) {
        console.error("Error fetching user details:", error);
        Alert.alert("Error", "Failed to fetch user details");
      }
    })();
  }, [clubId, add]);

  useEffect(() => {
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
          return member;
        }
      });
      setFiltered(filter);
      setActive(0);
    }
  }, [searchTerm]);

  const AddMember = async (addID) => {
    try {
      const payload = {
        User_id: addID,
        Club_id: clubId,
      };
      const access = await axios.get(
        `${process.env.EXPO_PUBLIC_IP}/clubAccess/${userId}`
      );

      if (access.data.club_id == clubId) {
        await axios.post(`${process.env.EXPO_PUBLIC_IP}/BoardMember/`, payload);
        Alert.alert("Success", "Member added to your club");
        setSearch("");
        setAdd(add + 1);
      } else {
        console.log("You can not add member");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add member data");
    }
  };

  if (!filteredDetails) return;
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text>Search by Last Name</Text>
        <FormInput onChangeText={setSearch} placeholder={"Last Name"} />
      </View>

      {filteredDetails.length == 0 ? (
        <Text style={[styles.content, { flex: 1 }]}>User Not Found</Text>
      ) : (
        <ScrollView style={[styles.content, { maxHeight: "65%" }]}>
          {filteredDetails.map((member, index) => (
            <TouchableOpacity
              key={index}
              style={index == active ? styles.activeMember : styles.memberInfo}
              onPress={() => setActive(index)}
            >
              <Text style={styles.meetingName}>
                {member.firstName} {member.lastName}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      <View style={styles.content}>
        <View style={styles.function}>
          <PTButton
            onPress={() =>
              Alert.alert(
                `${filteredDetails[active].firstName} ${filteredDetails[active].lastName}`,
                `Email: ${filteredDetails[active].email}\n` +
                (filteredDetails[active].phone_number != null ?
                  `Phone Number: ${filteredDetails[active].phone_number}` : 'No phone number provided')
              )
            }
          >
            View Details
          </PTButton>
          <PTButton onPress={() => AddMember(filteredDetails[active].id)}>
            Add Member
          </PTButton>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F1F6F5",
  },
  content: {
    padding: 10,
    marginHorizontal: 10,
    marginTop: 5,
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },
  function: {
    flexDirection: "row",
    justifyContent: "space-evenly"
  },
  memberInfo: {
    marginTop: 15,
    backgroundColor: "#8A7D6A",
    padding: 15,
    borderRadius: 10,
  },
  activeMember: {
    marginTop: 15,
    backgroundColor: "#FFD347",
    padding: 15,
    borderRadius: 10,
  },
});
export default AddExistingPage;
