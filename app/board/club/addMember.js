import { View, Text, StyleSheet, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import FormLabel from "@/PTComponents/FormLabel";
import FormInput from "@/PTComponents/FormInput";
import Button from "@/PTComponents/Button";
import FormContainer from "@/PTComponents/FormContainer";

import React, { useState, useEffect } from "react";
// Function to generate a random numeric user ID
function generateShortId(length) {
  let id = "";
  for (let i = 0; i < length + 1; i++) {
    id += Math.floor(Math.random() * 10); // 0–9
  }
  return Number(id);
}

const AddMemberPage = () => {
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [clubId, setClubId] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error("Error fetching userId from storage:", error);
        Alert.alert("Error", "Failed to load user ID");
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const storedClubId = await AsyncStorage.getItem("clubId");
        if (storedClubId) {
          setClubId(storedClubId);
        }
      } catch (error) {
        console.error("Error fetching club:", error);
        Alert.alert("Error", "Failed to load Club");
      }
    })();
  }, []);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitted },
  } = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
    },
  });

  const onSubmit = async (data) => {
    console.log(clubId);
    var today = new Date();
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();

    let website_login = "";
    let password = "";

    try {
      const memberResponse = await axios.post(
        `${process.env.EXPO_PUBLIC_IP}/users/checkMonthlyMembers`
      );
      console.log("Server Response:", memberResponse.data.monthlyMembers);
      Alert.alert("Success", "Membership successful");
      website_login =
        yyyy + mm + memberResponse.data.monthlyMembers;
      password =
        data.first_name.charAt(0).toUpperCase() +
        data.last_name.charAt(0).toUpperCase() +
        website_login;
    } catch (error) {
      console.error(
        "Error checking members:",
        error.response ? error.response.data : error.message
      );
      Alert.alert(
        "Error",
        error.response?.data?.message || "Member Check Failed"
      );
      return;
    }

    let uniqueID = false;
    let user_id = 0;
    while (uniqueID == false) {
      user_id = generateShortId(6); // generate new ID each time

      try {
        const checkIDResponse = await axios.post(
          `${process.env.EXPO_PUBLIC_IP}/users/checkIDExists`,
          { user_id }
        );
        console.log("Server Response:", checkIDResponse.data.message);

        if (checkIDResponse.data.exists == false) {
          uniqueID = true;
        }
      } catch (error) {
        console.error(
          "Error checking members:",
          error.response ? error.response.data : error.message
        );
        Alert.alert(
          "Error",
          error.response?.data?.message || "Member Check Failed"
        );
        return;
      }
    }

    //Use the generated registration information to insert into the database
    const payload = {
      ...data,
      user_id,
      website_login,
      password,
    };

    try {
      await axios.post(
        `${process.env.EXPO_PUBLIC_IP}/users/newMember`,
        payload
      );
    } catch (error) {
      console.error(
        "Error submitting form:",
        error.response ? error.response.data : error.message
      );
      Alert.alert(
        "Error",
        error.response?.data?.message || "Membership failed"
      );
      return;
    }

    try {
      await axios.post(`${process.env.EXPO_PUBLIC_IP}/users/register`, payload);
    } catch (error) {
      console.error(
        "Error submitting form:",
        error.response ? error.response.data : error.message
      );
      Alert.alert(
        "Error",
        error.response?.data?.message || "Registration failed"
      );
      return;
    }

    try {
      const clubPayload = {
        User_id: user_id,
        Club_id: clubId,
      };
      await axios.post(
        `${process.env.EXPO_PUBLIC_IP}/BoardMember/`,
        clubPayload
      );
      Alert.alert("Success", "Member added to your club");
    router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to add member data");
    }

  };

  return (
    <View style={styles.background}>
      <FormContainer>
        <View style={styles.inputs}>
          {[
            {
              name: "first_name",
              placeholder: "First Name",
              label: "Full Name",
              autocomplete: "given-name",
              rule: { required: "You must enter your first name" },
            },
            {
              name: "last_name",
              placeholder: "Last Name",
              autocomplete: "family-name",
              rule: { required: "You must enter your last name" },
            },
            {
              name: "email",
              placeholder: "Email",
              label: "Email Address",
              autocomplete: "email",
              rule: {
                required: "You must enter your email",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Enter a valid email address",
                },
              },
            },
            {
              name: "phone_number",
              placeholder: "Phone Number",
              label: "Phone Number (Optional)",
              autocomplete: "tel",
              rule: {
                maxLength: {
                  value: 20,
                  message: "Enter a valid Phone Number",
                },
                pattern: {
                  value: /[\d\s]{10,20}$/,
                  message: "Enter a valid phone number",
                },
              },
            },
            {
              name: "join_date",
              placeholder: "YYYY-MM-DD",
              label: "Join Date (Optional)",
              rule: {
                maxLength: { value: 10, message: "Enter a valid date" },
                pattern: {
                  value: /\d{4}-\d{2}-\d{2}/,
                  message: "Enter a valid date (YYYY-MM-DD)",
                },
              },
            },
          ].map(({ name, placeholder, label, autocomplete, rule }) => (
            <View key={name} style={styles.inputGroup}>
              {label && <FormLabel>{label}</FormLabel>}
              <Controller
                control={control}
                name={name}
                render={({ field: { onChange, value } }) => (
                  <FormInput
                    autoComplete={autocomplete}
                    placeholder={placeholder}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="none"
                  />
                )}
                rules={rule}
              />
              {errors[name] && isSubmitted && (
                <Text style={styles.errorText}>{errors[name].message}</Text>
              )}
            </View>
          ))}
          <View style={styles.function}>
            <Button onPress={() => router.back()}>Go Back</Button>
            <Button onPress={handleSubmit(onSubmit)}>Add Member</Button>
          </View>
        </View>
      </FormContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: "#AFABA3",
    height: "100%",
  },
  inputs: {
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

export default AddMemberPage;
