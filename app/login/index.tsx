import React, { useState, useEffect } from "react";
import { Text, View, Alert, StyleSheet } from "react-native";

import FormLabel from "@/PTComponents/FormLabel";
import FormInput from "@/PTComponents/FormInput";
import Button from "@/PTComponents/Button";

import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import { useNavigation } from "expo-router";

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_IP,
});

// Add token to requests automatically
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403) {
      // Token expired or invalid
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userId');
      Alert.alert("Session Expired", "Please login again");
      // You might want to redirect to login screen here
    }
    return Promise.reject(error);
  }
);


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
    defaultValues: values,
  });

  useEffect(() => {
    checkExistingLogin();
  }, []);

  const checkExistingLogin = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      // Verify token is still valid
      console.log("Check logged In")
      const response = await api.post("/users/verify-token");
      console.log(response)
      if (response.data.valid) {
        // Token is valid, redirect to appropriate page
        //Could add 
      }
    }
  } catch (error) {
    // Token is invalid, clear storage
    //await AsyncStorage.removeItem('userToken');
    //await AsyncStorage.removeItem('userId');
    console.log("No valid token found");
  }
};
  const tokenLogin= async (data:any) => {
    
  }

  const handleLogin = async (data:any) => {
    try {
      const login = await api.post(
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
        // Store user data in AsyncStorage
        await AsyncStorage.setItem('userToken', login.data.token);
        await AsyncStorage.setItem("userId", member.data.user_id.toString());
        const response = await api.post(`${process.env.EXPO_PUBLIC_IP}/users/verify-token`);
        console.log(response)
        router.dismissAll();
        if (member.data.paid == "1" && clubAccess.data.level_of_access == null) {
          router.replace({
            pathname: "/club/meetings",
          });
        } else if (clubAccess.data.level_of_access != null) {
          await AsyncStorage.setItem("userId", member.data.user_id.toString());
          router.replace({
            pathname: "/login/selectDestination",
          });
        } else if (member.data.paid == "0") {
          await AsyncStorage.setItem("userId", member.data.user_id.toString());
          router.replace({
            pathname: "/guest/limit",
          });
        }
      }

      Alert.alert("Login Response", login.data.message);
    } catch (error: any) {
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
          ].map(({ name, label, autocomplete, rule, secure }) => (
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
                <Text style={styles.errorText}>
                  {errors[name as Names]?.message ?? ""}
                </Text>
              )}
            </View>
          ))}
        </View>

        <View style={styles.function}>
          <Button onPress={() => router.push("./login/register")}>Register</Button>

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
    flex: 1,
  },
  container: {
    padding: 10,
    margin: 20,
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
