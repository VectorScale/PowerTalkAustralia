import React, { useEffect, useState } from "react";
import axios from "axios";

import { Text, View, Alert, StyleSheet, ScrollView, TextComponent, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRouter, useGlobalSearchParams } from "expo-router";
import Finger from "@/PTComponents/Finger";

const Feedback = () => {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [requests, setRequests] = useState<any>([]);
  const [loadFeedback, setLoaded] = useState(false);
  const [clubAccess, setClubAccess] = useState(false);

  const global = useGlobalSearchParams();
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
          `${
            process.env.EXPO_PUBLIC_IP
          }/projects/getRequests/${global.profileID.toString()}`
        );

        setRequests(res.data);
        setLoaded(true);
      } catch (error) {
        console.error("Error fetching userId from storage:", error);
        Alert.alert("Error", "Failed to load Profile Data");
      }
    })();
  }, [clubAccess, loadFeedback]);

  
  const handleComplete = async (projectId: any, request_id:any) => {
    try {
      await axios.post(`${process.env.EXPO_PUBLIC_IP}/projects/completeProject/${projectId}`);
      await axios.post(`${process.env.EXPO_PUBLIC_IP}/projects/deleteRequest/${request_id}`);
      Alert.alert("Success", "Request Signed Off");
      setLoaded(false);
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to Sign Off");
    }
  };

  if (!loadFeedback) return;

  return (
    <View style={styles.background}>
      <ScrollView>
        <View style={styles.information}>
          {requests.length>0?requests.map((item: any, index: number) => (
            <View style={styles.feedback} key={index}>
              <View style={styles.feedbackInfo}>
              <View style={styles.row}>
                <Text>
                  {item.project_number}: {item.project_title}
                </Text>
              </View>
              </View>
              <TouchableOpacity onPress={()=>handleComplete(item.project_id, item.request_id)} style={styles.delete}>
                <Text>Sign Off</Text>
                </TouchableOpacity>
            </View>
          )):(<Text>No Requests</Text>)}
        </View>
      </ScrollView>
    </View>
  );
};

export default Feedback;

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
  feedback:{
    flexDirection:"row",
    marginBottom:5,
  },
  infoText: {
    fontSize: 20,
    marginVertical: 5,
  },
  row: {
    flex: 1,
    flexDirection: "row",
    marginBottom:5,
  },
  feedbackInfo: {
    marginTop: 5,
    backgroundColor: "#8A7D6A",
    padding: 15,
    borderTopStartRadius: 10,
    borderBottomStartRadius: 10,
    flex: 4,
  },
  delete: {
    marginTop: 5,
    backgroundColor: "#AFABA3",
    padding: 15,
    borderTopEndRadius: 10,
    borderBottomEndRadius: 10,
    flex: 1,
    alignItems:"center",
    justifyContent:"center",
  },
});
