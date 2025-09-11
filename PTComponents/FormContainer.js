import React from "react";
import { View, StyleSheet } from "react-native";

const FormContainer = (props) => {
  return <View style={styles.formContainer}>{props.children}</View>;
};

export default FormContainer;

const styles = StyleSheet.create({
  formContainer: {
    backgroundColor: "#F1F6F5",
    borderWidth: 2,
    borderRadius: 10,
    borderColor: "#433D33",
    margin:20,
    padding:10,
    justifyContent: "center",
  },
});
