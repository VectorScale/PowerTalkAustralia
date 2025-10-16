import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import BottomNav from "@/PTComponents/BottomNav";
import NoAuthentication from "@/PTComponents/NoAuth";
import { router } from "expo-router";

import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const MembersProjectPage1 = () => {
  const [userId, setUserId] = useState("");
  const [clubId, setclubid] = useState(null);

  const nav = useNavigation();

  const local = useLocalSearchParams();
  const projectUserID = local.projectUserID;
  const projectLevel = local.projectLevel

  useEffect(() => {
    (async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);

          const access = await axios.get(
            `${process.env.EXPO_PUBLIC_IP}/clubAccess/${storedUserId}`
          );
          const accesses = access.data;
          console.log(accesses);
          setclubid(accesses.club_id);
        }
      } catch (error) {
        console.error("Error fetching userId from storage:", error);
        Alert.alert("Error", "Failed to load user ID");
      }
    })();
  }, []);

  useEffect(() => {
    nav.setOptions({ headerShown: true });
  }, [projectLevel]);


  const handleLevelPress = async (level: number) => {
    try {
      router.push({ pathname: "/projects/details/[projectLevel]", params: { projectUserID: projectUserID, projectLevel: level } });
    } catch (error) {
      console.error("Error access level", error);
    }
  };

  return (
    <View style={styles.container}>

      {userId != "" && (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Level Buttons */}
          {[1, 2, 3, 4].map((level) => (
            <TouchableOpacity
              key={level}
              style={styles.levelButton}
              onPress={() => {
                handleLevelPress(level);
              }}
            >
              <Text style={styles.buttonText}>Level {level}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      {userId == "" && (<NoAuthentication />)}
      {/* Bottom Navigation */}
      <BottomNav number={3} name={["Club Members", "Club Meetings", "Development Program"]} link={["/club/members", "/club/meetings", "/projects"]} active={3} />
    </View>
  );
};

export default MembersProjectPage1;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  warning: {
    textAlign: "center",
    paddingTop: 280,
    paddingBottom: 300,
    fontSize: 25,
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
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F1F6F5",
    paddingVertical: 15,
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
    alignItems: "center",
    paddingBottom: 40,
  },
  headerBlock: {
    marginTop: 30,
    backgroundColor: "#065395",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
  levelButton: {
    backgroundColor: "#8A7D6A",
    width: "100%",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "600",
  },
});
