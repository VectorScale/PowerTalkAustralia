import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  Alert,
  StyleSheet,
  Image,
  Button,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScrollView } from "react-native-web";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";

const PORT = 8081;

const BoardMemberpage = () => {
  const router = useRouter();
  const [names, setnames] = useState([]);
  const [results, setresults] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [memberid, setid] = useState("");
  const [clubid, setids] = useState("");
  const [userid, setUserId] = useState(null);
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
  console.log(userid);
  useEffect(() => {
    (async () => {
      try {
        // Step 1: Get club list from user info
        const { data } = await axios.get(
          `http://${process.env.EXPO_PUBLIC_IP}:8081/clubBoard/1`
        );
        const UseridList = data.User_id || [];

        const MemberDetails = await Promise.all(
          data.map(async (item) => {
            
            const res = await axios.get(
              `http://${process.env.EXPO_PUBLIC_IP}:8081/clubBoardMembers/${item.member_id}`
            );
            const MemberNames =
              res.data[0].first_name + " " + res.data[0].last_name;
            const id = res.data[0].user_id;
            return {
              MemberNames,
              id,
            };
          })
        );
        setnames(MemberDetails);
      } catch (error) {
        console.error("Error fetching user or club data:", error);
        Alert.alert("Error", "Failed to fetch user or club data");
      }
    })();
  }, []);
  const Search = async () => {
    try {
      const res = await axios.get(
        `http://${process.env.EXPO_PUBLIC_IP}:8081/clubBoardMembers/${id}`
      );
      setresults(res.data);
      console.log(res.data);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };
  const AddMember = async () => {
    try {
      const access = await axios.get(
        `http://${process.env.EXPO_PUBLIC_IP}:8081/clubAccess/${userid}`
      );
      const accesses = access.data;

      if (accesses) {
        const response = await axios.post(
          `http://${process.env.EXPO_PUBLIC_IP}:8081/BoardMember`,
          {
            User_id: memberid.trim(),
            Club_id: clubid.trim(),
          }
        );
      } else {
        console.log("You can not add member");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to add member data");
    }
  };
  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Image
          source={{
            uri: "https://www.powertalkaustralia.org.au/wp-content/uploads/2023/12/Asset-74x.png",
          }}
          style={styles.logo}
        />
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/profile",
              query: { user_Id: userId },
            })
          }
        >
          <Text style={styles.profileText}>Profile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Meeting Header Block */}
        <View style={styles.meetingHeaderBlock}>
          <Text style={styles.meetingHeaderText}>Members</Text>
        </View>
        <View>
          <TouchableOpacity
            style={styles.Add}
            onPress={() => setModalVisible(true)}
          >
            <Text style={{ color: "blue", fontSize: 16 }}>+ Add member</Text>
          </TouchableOpacity>{" "}
        </View>
        {/* Member List */}
        {names.map((member, index) => (
          <TouchableOpacity
            key={index}
            style={styles.meetingBlock}
            onPress={() => Alert.alert("Member Selected", member.name)}
          >
            <Text style={styles.meetingName}>
              {member.MemberNames} <Text>Paid: {member.PaidAmount}</Text>{" "}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.bottomNav}>
        <Text style={[styles.navButton, styles.activeButton]}>
          Club Members
        </Text>
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
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide" // or 'fade' or 'none'
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalBox}>
            <TextInput
              placeholder="Insert Id"
              value={memberid}
              onChangeText={setid}
            ></TextInput>
            <TextInput
              placeholder="Insert Club Id"
              value={clubid}
              onChangeText={setids}
            ></TextInput>
            <TouchableOpacity onPress={AddMember}>
              <Text>Add member</Text>
            </TouchableOpacity>

            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
      {results.map((member, index) => (
        <Text key={index}>
          {member.first_name} {member.last_name} Paid: {member.paid}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  Add: {
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 1080,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalBox: {
    margin: 30,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
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
     position: 'relative', 
    zIndex: -5,
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
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F1F6F5",
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
});
export default BoardMemberpage;
