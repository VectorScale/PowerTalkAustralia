import { canGoBack } from "expo-router/build/global-state/routing";
import { Text, View, StyleSheet } from "react-native";
import BackButton from "./BackButton";

import React from "react";

const Subheader = (options) => {
  return (
    <View style={styles.Subheader}>
      {canGoBack() && (
        <BackButton style={styles.Back} />
      )}
      <Text style={styles.Title}>{options.title}</Text>
    </View>
  );
};

export default Subheader;

const styles = StyleSheet.create({
  Subheader: {
    backgroundColor: "#065395",
    paddingVertical: 15,
    paddingHorizontal: 5,
    flexDirection: "row",
  },
  Title: {
    marginLeft: 10,
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    flex: 20,
    alignSelf:"center"
  },
  Back: {
    flex: 1
  },
});
