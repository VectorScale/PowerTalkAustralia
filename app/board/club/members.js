import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import axios from "axios";
import BottomNav from "@/PTComponents/BottomNav";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useRouter } from "expo-router";

import { useIsFocused } from "@react-navigation/native";

const ClubBoardMemberPage = () => {
  const router = useRouter();

  const [memberDetails, setDetails] = useState([]);
  const [clubId, setClubId] = useState("");
  const [userId, setUserId] = useState("");
  const [payment, setPayment] = useState(0);

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
        const storedClubId = await AsyncStorage.getItem("clubId");
        if (storedClubId) {
          setClubId(storedClubId);
        }
      } catch (error) {
        console.error("Error fetching club:", error);
        Alert.alert("Error", "Failed to load Club");
      }
    })();
  }, []);

  useEffect(() => {
    if (clubId == "") return;
    (async () => {
      try {
        // Step 1: Fetch the IDs of Members in a Club
        const clubMembers = await axios.get(
          `${process.env.EXPO_PUBLIC_IP}/clubBoard/${clubId}`
        );

        // Step 2: Fetch the details of each Member
        const MemberDetails = await Promise.all(
          clubMembers.data.map(async (item) => {
            const res = await axios.get(
              `${process.env.EXPO_PUBLIC_IP}/clubBoardMembers/${item.User_id}`
            );
            /*I cant for the life of me stop this function from throwing a 404 if
            there is a userid in the members club table whose member doesnt exist 
            anymore so if the sql constraints fail to remove deleted members from 
            the table make sure to get rid of them*/

            if (res.status == 201){
              return {};
            }
            const fullName =
              res.data[0].first_name + " " + res.data[0].last_name;
            const id = res.data[0].user_id;
            const paid = res.data[0].paid;
            const paid_date = res.data[0].paid_date;
            const guest = res.data[0].guest;
            return {
              fullName,
              paid,
              paid_date,
              id,
              guest,
            };
          })
        );
        setDetails(MemberDetails);
      } catch (error) {
        console.error("Error fetching user details:", error);
        Alert.alert("Error", "Failed to fetch user details");
      }
    })();
  }, [clubId, useIsFocused(), payment]);

  const handlePayment = async (member) => {
    try {
      let user_id = member.id;
      let paid = 0;
      let paid_date = null;
      let guest = 1;

      //If the member is unpaid, the values are reversed
      if (member.paid == 0) {
        paid = 1;
        guest = 0;
        paid_date = "";

        let currDate = new Intl.DateTimeFormat(undefined, {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date());

        let [day, month, year] = currDate.split("/");
        paid_date += year;
        paid_date += "-";
        paid_date += month;
        paid_date += "-";
        paid_date += day;
      }

      const payload = {
        user_id,
        paid,
        paid_date,
        guest,
      };

      await axios.post(
        `${process.env.EXPO_PUBLIC_IP}/updatePayment/`,
        payload
      );

      setPayment(payment+1);
      Alert.alert("Success", "Payment Updated");
    } catch (error) {
      console.error(
        "Error Updating Payment:",
        error.response ? error.response.data : error.message
      );
      Alert.alert(
        "Error",
        error.response?.data?.message || "Payment Update Failed"
      );
    }
  };

  if (!memberDetails) return;
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={{flexDirection:"row", flex:1, justifyContent: "space-evenly"}}>
          <TouchableOpacity
            style={styles.add}
            onPress={() => router.push("/board/club/addMember")}
          >
            <Text style={styles.addText}>+ Add New Member</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.add}
            onPress={() => router.push("/board/club/addExisting")}
          >
            <Text style={styles.addText}>+ Add Existing Member</Text>
          </TouchableOpacity>
        </View>
        {/* Member List */}
        {memberDetails.map((member, index) => (
          <View key={index} style={styles.member}>
            <TouchableOpacity
              style={styles.name}
              onPress={() => router.push({pathname: "/profile/[profileID]", params: {profileID: member.id}})}
            >
              <Text style={styles.statusText}>{member.fullName}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.status}
              onPress={() => handlePayment(member)}
            >
              <Text style={styles.statusText}>
                {member.paid ? "Paid" : "Unpaid"}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <BottomNav
        number={3}
        name={["Members", "Guests", "Meeting"]}
        link={[
          "/board/club/members",
          "/board/club/guests",
          "/board/club/meetings",
        ]}
        active={1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  add: {
    marginTop:20,
    marginBottom:10,
  },
  addText: {
    color:"#065395",
    fontSize:15
  },
  member: {
    flexDirection: "row",
  },
  name: {
    marginTop: 15,
    backgroundColor: "#8A7D6A",
    padding: 15,
    borderTopStartRadius: 10,
    borderBottomStartRadius: 10,
    flex: 4,
  },
  status: {
    marginTop: 15,
    backgroundColor: "#AFABA3",
    padding: 15,
    borderTopEndRadius: 10,
    borderBottomEndRadius: 10,
    flex: 1,
  },
  statusText: {
    color: "#ffffff",
    flex:1,
    textAlign:"center"
  },
  content: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
});
export default ClubBoardMemberPage;
