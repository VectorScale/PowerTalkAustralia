import React, { useState, useEffect } from "react";
import { Text, View, Alert, StyleSheet } from "react-native";

import FormLabel from "@/PTComponents/FormLabel";
import FormInput from "@/PTComponents/FormInput";
import Button from "@/PTComponents/Button";
import PTHeader from "@/PTComponents/Header";

import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import { useNavigation } from "expo-router";

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Header } from "@react-navigation/stack";

const LoginForm = () => {
  const router = useRouter();
  const nav = useNavigation();
  const [userId, setUserId] = useState(null);

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

  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <Button onPress={() => router.navigate("/club/meetings/")}>My Meetings</Button>
        <Button onPress={() => router.navigate("/board/club/members")}>Club</Button>
        <Button onPress={() => router.navigate("/board/council/")}>Council</Button>
        <Button onPress={() => router.navigate("/board/association/club/members/")}>Association</Button>
      </View>
    </View>
  );
};

export default LoginForm;

const styles = StyleSheet.create({
  background: {
    backgroundColor: "#F1F6F5",
    height: "100%",
  },
  container: {
    padding: 10,
    marginHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    justifyContent: "center",
  },
  inputGroup: {
    marginHorizontal: 20,
  },
  function: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  errorText: {
    color: "red",
  },
});
