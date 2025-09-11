import React from "react";
import { TextInput, StyleSheet, KeyboardAvoidingView } from "react-native";

const FormInput = (props) => {
  return (
    <KeyboardAvoidingView>
      <TextInput style={styles.formInput} {...props} />
    </KeyboardAvoidingView>
  );
};

export default FormInput;

const styles = StyleSheet.create({
  formInput: {
    backgroundColor: "#AFABA3",
    color: "white",
    borderWidth: 2,
    borderRadius: 10,
    width: "100%",
    height: 50,
    marginTop: 5,
    paddingLeft: 10,
  },
});
