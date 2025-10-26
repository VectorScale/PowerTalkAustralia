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
  const [clubAccess, setClubAccess] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [showLoginInfo, setShowLoginInfo] = useState(false);
  const [loginData, setLoginData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);

  const local = useLocalSearchParams();
  const nav = useNavigation();

  
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
  }, []);

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

  const handlePress = async (data:any) => {
    try {
        //setIsLoading(true);
        const logres = await api.get(
          `${process.env.EXPO_PUBLIC_IP}/profile/login/${local.profileID}`
        );
        // Set the login data and show the info
        console.log(logres)
        setLoginData(logres.data);
        setShowLoginInfo(true);
      } catch (error) {
        console.error("Error :", error);
        Alert.alert("Error", "Failed to load Profile Data");
      }

  }

   const hideLoginInfo = () => {
    setShowLoginInfo(false);
    setLoginData(null);
  };

  return (
    <View style={styles.background}>
      <ScrollView>
        <View style={styles.information}>
          <View style={styles.function}>
            <View style={{ flex: 1 }}></View>
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

          {clubAccess && (
            <View>
              {profiles.paid_date && (
                <Text style={styles.infoText}>
                  <Finger /> Paid Date:
                  {new Date(profiles.paid_date).toLocaleDateString()}
                </Text>     
              )}
              {!showLoginInfo && !isLoading && (
                <Button onPress={handlePress}
                >Show Login Info
                </Button>
               )}
               {isLoading && <View style={styles.function}> </View>}
               {showLoginInfo && loginData && (
                <View style={styles.loginInfoContainer}>
                  <Text style={styles.loginInfoTitle}>Login Information:</Text>
                  <Text style={styles.loginInfoText}>
                    Username: {loginData.website_login}
                  </Text>
                  <Text style={styles.loginInfoText}>
                    Password: {loginData.password}
                  </Text>
                  {/* Add more fields as needed based on your API response structure */}
                  <Button onPress={hideLoginInfo}>
                    Hide Login Info
                  </Button>
                </View>
              )}
              
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
    loginInfoContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  loginInfoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  loginInfoText: {
    fontSize: 16,
    marginBottom: 5,
  },
});

