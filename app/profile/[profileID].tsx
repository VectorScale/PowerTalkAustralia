import React, { useEffect, useState } from "react";
import axios from "axios";

import { Text, View, Alert, StyleSheet, ScrollView } from "react-native";
import Button from "@/PTComponents/Button";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRouter, useLocalSearchParams } from "expo-router";
import Finger from "@/PTComponents/Finger";

const Profile = () => {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [profiles, setProfiles] = useState<any>([]);
  const [access, setAccess] = useState(false);
  const [clubAccess, setClubAccess] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  const local = useLocalSearchParams();
  const nav = useNavigation();

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
        if (userId) {
          const res = await axios.get(
            `${process.env.EXPO_PUBLIC_IP}/clubaccess/${userId}`
          );
          if (res.status == 200) {
            setAccess(true);
            setClubAccess(true);
          }
        }
      } catch (err: any) {
        console.error("Error With Club Access:", err);
        Alert.alert("Error", err);
      }
    })();
  }, [userId]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(
          `${process.env.EXPO_PUBLIC_IP}/profile/${local.profileID}`
        );
        setProfiles(res.data);
      } catch (error) {
        console.error("Error fetching userId from storage:", error);
        Alert.alert("Error", "Failed to load Profile Data");
      }
    })();
  });

  useEffect(() => {
    if (!userId && !profiles) return;
    nav.setOptions({ headerShown: true });
    if (userId == local.profileID.toString()) {
      setIsOwnProfile(true);
      nav.setOptions({
        title: `Your Profile`,
      });
    } else {
      setIsOwnProfile(false);
      nav.setOptions({
        title: `Profile of ${profiles.first_name} ${profiles.last_name}`,
      });
    }
  }, [userId, profiles]);

  return (
    <View style={styles.background}>
      <ScrollView>
        <View style={styles.information}>
          <View style={styles.function}>
            {userId == local.profileID.toString() && (
              <Button
                onPress={() =>
                  router.navigate({
                    pathname: "/profile/editProfile",
                    params: { profileID: local.profileID },
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
          {profiles.phone_number &&
            (isOwnProfile || profiles.phone_private == 0) && (
              <Text style={styles.infoText}>
                <Finger /> Phone Number: {profiles.phone_number}
              </Text>
            )}
          {profiles.address &&
            (isOwnProfile || profiles.address_private == 0) && (
              <Text style={styles.infoText}>
                <Finger /> Address: {profiles.address}, {profiles.postcode}
              </Text>
            )}

          {profiles.notes && (
            <Text style={styles.infoText}>
              <Finger /> Notes: {profiles.notes}
            </Text>
          )}
          {profiles.dob && (
            <Text style={styles.infoText}>
              Date of Birth: {new Date(profiles.dob).toLocaleDateString()}
            </Text>
          )}

          <Text style={[styles.infoText, { marginTop: 40 }]}>
            <Finger /> Join_Date:
            {new Date(profiles.join_date).toLocaleDateString()}
          </Text>

          {clubAccess && profiles.paid_date && (
            <View>
              <Text style={styles.infoText}>
                <Finger /> Paid Date:
                {new Date(profiles.paid_date).toLocaleDateString()}
              </Text>
              <View style={styles.function}>
                <Button
                  onPress={() =>
                    router.navigate({
                      pathname: "/profile/feedback",
                      params: { profileID: local.profileID },
                    })
                  }
                >
                  Feedback
                </Button>
                <Button
                  onPress={() =>
                    router.navigate({
                      pathname: "/profile/requests",
                      params: { profileID: local.profileID },
                    })
                  }
                >
                  Requests
                </Button>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  background: {
    backgroundColor: "#F1F6F5",
    flex: 1,
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
    justifyContent: "space-evenly",
    marginTop: 10,
  },
  titleText: {
    color: "white",
    fontSize: 25,
    fontWeight: "bold",
  },
});
