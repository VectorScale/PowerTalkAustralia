import React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Button from "./Button";

const MeetingBottom = () => {
  const router = useRouter();
  return (
    <View style={styles.bottomNav}>
      <View style={{ flex: 1 }}></View>
      <Button onPress={() => router.navigate("/login")}>Login</Button>
    </View>
  );
};

export default MeetingBottom;

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    justifyContent: "flex-start",
    backgroundColor: "#F1F6F5",
  },
});
