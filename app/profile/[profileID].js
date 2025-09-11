import React, { useEffect, useState } from "react";
import axios from "axios";

import { Text, View, Alert, StyleSheet, ScrollView } from "react-native";
import Button from "@/PTComponents/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRouter, useLocalSearchParams } from "expo-router";
import Finger from "@/PTComponents/Finger";
import { useFocusEffect } from "@react-navigation/native";

const PORT = 8081;

const Profile = () => {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [profiles, setProfiles] = useState([]);
  const [access, setAccess] = useState(false);

  const local = useLocalSearchParams();
  const nav = useNavigation();

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

  useEffect(() => {
    (async () => {
      try {
        if (userId) {
          const res = await axios.get(
            `http://${process.env.EXPO_PUBLIC_IP}:8081/clubaccess/${userId}`
          );
          if (res.status == 200) {
            setAccess(true);
          }
        }
      } catch (err) {
        console.error("Error With Club Access:", err);
        Alert.alert("Error", err);
      }
    })();
  }, [userId]);

  useFocusEffect(React.useCallback(() => {
    (async () => {
      try {
        const res = await axios.get(
          `http://${process.env.EXPO_PUBLIC_IP}:8081/profile/${local.profileID}`
        );
        setProfiles(res.data);
      } catch (error) {
        console.error("Error fetching userId from storage:", error);
        Alert.alert("Error", "Failed to load user ID");
      }
    })();
  }));

  useEffect(() => {
    nav.setOptions({ headerShown: true });
    if (userId == local.profileID.toString()) {
      setAccess(true);
      nav.setOptions({
        title: `Your Profile`,
      });
    } else {
      nav.setOptions({
        title: `Profile of ${profiles.first_name} ${profiles.last_name}`,
      });
    }
  });

  return (
    <View style={styles.background}>
      <ScrollView>
        <View style={styles.information}>
          <View style={styles.function}>
            {access && (
              <Button
                onPress={() =>
                  router.navigate({
                    pathname: "/profile/editProfile/"+local.profileID.toString(),
                  })
                }
              >
                Edit Profile
              </Button>
            )}
          </View>
          <Text style={styles.infoText}>
            <Finger /> Member ID: {profiles.user_id}
          </Text>
          <Text style={styles.infoText}>
            <Finger /> {profiles.first_name} {profiles.last_name}
          </Text>
          <Text style={styles.infoText}>
            <Finger /> Email: {profiles.email}
          </Text>
          {profiles.phone_number && (access || profiles.phone_private==1) && (
            <Text style={styles.infoText}>
              <Finger /> Phone Number: {profiles.phone_number}
            </Text>
          )}
          {profiles.address && (access || profiles.address_private==1) && (
              <Text style={styles.infoText}><Finger/> Address: {profiles.address}, {profiles.postcode}</Text>
          )}
          {profiles.interests && (
            <Text style={styles.infoText}><Finger/> Notes: {profiles.interests}</Text>
          )}
          {profiles.dob && (
            <Text style={styles.infoText}>
              Date of Birth: {new Date(profiles.dob).toLocaleDateString()}
            </Text>
          )}

          <Text style={[styles.infoText, {marginTop:40}]}>
            <Finger /> Join_Date:{" "}
            {new Date(profiles.join_date).toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  background: {
    backgroundColor: "#F1F6F5",
    height: "100%",
  },
  title: {
    padding: 10,
    backgroundColor: "#8A7D6A",
  },
  information: {
    padding: 10,
    margin: 10,
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },
  infoText: {
    fontSize: 20,
    marginBottom: 5,
  },
  checkContainer: {
    flexDirection: "row",
  },
  checkbox: {
    padding: 5,
    margin: 5,
  },
  function: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  titleText: {
    color: "white",
    fontSize: 25,
    fontWeight: "bold",
  },
});
