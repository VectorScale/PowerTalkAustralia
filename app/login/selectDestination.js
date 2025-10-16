import React, { useState, useEffect } from "react";
import { Text, View, Alert, StyleSheet } from "react-native";

import Button from "@/PTComponents/Button";

import { useRouter } from "expo-router";
import { useNavigation } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const LoginForm = () => {
  const router = useRouter();
  const nav = useNavigation();
  const [userId, setUserId] = useState(null);
  const [accessLevel, setAccess] = useState(0);

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
    if (!userId) return;
    (async () => {
      try {
        const boardAccess = await axios.get(
          `${process.env.EXPO_PUBLIC_IP}/boardMemberAccess/${userId}`
        );
        console.log(boardAccess.data.level_of_access);
        switch (boardAccess.data.level_of_access) {
          case "club":
            setAccess(1);
            break;
          case "council":
            setAccess(2);
            break;
          case "association":
            setAccess(3);
        }
      } catch (error) {
        console.error("Error fetching board access:", error);
        Alert.alert("Error", "Failed to get board Access");
      }
    })();
  }, [userId]);

  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <View style={styles.function}>
          {accessLevel >= 0 && (
            <Button onPress={() => router.replace("/club/meetings/")}>
              My Meetings
            </Button>
          )}
          {accessLevel >= 1 && (
            <Button onPress={() => router.replace("/board/club/members")}>
              Club
            </Button>
          )}
          {accessLevel >= 2 && (
            <Button onPress={() => router.replace("/board/council/")}>
              Council
            </Button>
          )}
          {accessLevel >= 3 && (
            <Button
              onPress={() => router.replace("/board/association/members/")}
            >
              Association
            </Button>
          )}
        </View>
      </View>
    </View>
  );
};

export default LoginForm;

const styles = StyleSheet.create({
  background: {
    backgroundColor: "#F1F6F5",
    flex: 1,
  },
  container: {
    padding: 10,
    margin: 50,
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },
  inputGroup: {
    marginHorizontal: 20,
  },
  function: {
    alignItems: "center",
    marginVertical: 10,
  },
  errorText: {
    color: "red",
  },
});
