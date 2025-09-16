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

  type Names = "website_login" | "password";

  const values = {
      website_login: "",
      password: "",
    };

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = useForm({
    defaultValues: values
  });

  const handleLogin = async (data:any) => {
    try {
      const login = await axios.post(
        `${process.env.EXPO_PUBLIC_IP}/users/login`,
        {
          website_login: data.website_login.trim(),
          password: data.password.trim(),
        }
      );
      const member = await axios.get(
        `${process.env.EXPO_PUBLIC_IP}/member/${login.data.user_id}`
      );
      const clubAccess = await axios.get(
        `${process.env.EXPO_PUBLIC_IP}/clubAccess/${member.data.user_id}`
      );

      if (member.status == 401) {
        Alert.alert("Login Failed", member.data.message);
      } else {
        // Store user data in AsyncStorag
        await AsyncStorage.setItem("userId", member.data.user_id.toString());

        if (member.data.paid == "1" && clubAccess.data.position == null) {
          router.push({
            pathname: "/club/meetings",
          });
        } else if (
          member.data.paid == "1" &&
          clubAccess.data.position != null
        ) {
          await AsyncStorage.setItem("userId", member.data.user_id.toString());
          router.push({
            pathname: "/login/selectDestination",
          });
        } else if (member.data.guest == "1") {
          await AsyncStorage.setItem("userId", member.data.user_id.toString());
          router.push({
            pathname: "/GuestPage",
          });
        }
      }

      console.log("Server Response:", login.data);
      Alert.alert("Login Response", login.data.message);
    } catch (error:any) {
      if (error.login) {
        console.error("Server error response:", error.login.data);
        Alert.alert("Error", error.login.data.message || "An error occurred");
      } else {
        console.error("Network or other error:", error);
        Alert.alert("Error", "Failed to connect to server");
      }
    }
  };

  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <View style={styles.inputGroup}>
          {[
            {
              name: "website_login",
              label: "Member Number",
              autocomplete: "username",
              rule: { required: "You must enter your Member Login" },
              secure: false,
            },
            {
              name: "password",
              label: "Password",
              autocomplete: "current-password",
              rule: { required: "You must enter your Password" },
              secure: true,
            },
          ].map(({ name , label, autocomplete, rule, secure }) => (
            <View key={name} style={styles.inputGroup}>
              {label && <FormLabel>{label}</FormLabel>}
              <Controller
                control={control}
                name={name as Names}
                render={({ field: { onChange, value } }) => (
                  <FormInput
                    autoComplete={autocomplete}
                    onChangeText={onChange}
                    secureTextEntry={secure}
                    value={value}
                    autoCapitalize="none"
                  />
                )}
                rules={rule}
              />
              {errors[name as Names] && isSubmitted && (
                <Text style={styles.errorText}>{errors[name as Names]?.message ?? "Hello"}</Text>
              )}
            </View>
          ))}
        </View>

        <View style={styles.function}>
          <Button onPress={() => router.push("./register")}>Register</Button>

          <Button onPress={handleSubmit(handleLogin)}>Login</Button>
        </View>
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
