import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const AsscociationMenu = (props) => (
  <View style={styles.containers}>
      <TouchableOpacity
        style={styles.buttons}
        onPress={props.onPressMembers}
      >
        <Text style={styles.name}>Members</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.buttons}
        onPress={props.onPressBoard}
      >
        <Text style={styles.name}>Board</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.buttons}
        onPress={props.onPressCouncil}
      >
        <Text style={styles.name}>Council</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.buttons}
        onPress={props.onPressAssoc}
      >
        <Text style={styles.name}>Association</Text>
      </TouchableOpacity>
  </View>
);
export default AsscociationMenu;

const styles = StyleSheet.create({
  containers: {
    flex:1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems:"center",
    marginTop:20,
  },
  buttons: {
    backgroundColor:"#065395",
    padding:10,
    flex:1,
    borderWidth:1,
    borderRadius:5,
    borderColor:"white",
    alignItems:"center",
  },
  name: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#ffffff",
  },
});
