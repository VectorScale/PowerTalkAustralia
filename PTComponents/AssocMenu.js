import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const AsscociationMenu = (props) => (
  <View style={styles.containers}>
      <TouchableOpacity
        style={styles.buttons}
        onPress={props.onPressMembers}
      >
        <Text style={[styles.name, props.level==0 && styles.active]}>Club</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.buttons}
        onPress={props.onPressBoard}
      >
        <Text style={[styles.name, props.level==1 && styles.active]}>Board</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.buttons}
        onPress={props.onPressCouncil}
      >
        <Text style={[styles.name, props.level==2 && styles.active]}>Council</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.buttons}
        onPress={props.onPressAssoc}
      >
        <Text style={[styles.name, props.level==3 && styles.active]}>Association</Text>
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
  active: {
    textDecorationLine:"underline",
    textDecorationColor:"white"
  },
});
