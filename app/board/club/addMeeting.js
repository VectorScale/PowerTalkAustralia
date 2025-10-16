import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from "react-native";
import FormContainer from "@/PTComponents/FormContainer";
import FormLabel from "@/PTComponents/FormLabel.js";
import FormInput from "@/PTComponents/FormInput.js";
import Button from "@/PTComponents/Button.js";

import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useKeyboard } from "@react-native-community/hooks";

const EditForm = () => {
  const router = useRouter();
  const [meeting, setMeeting] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meetingId, setMeetingId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [name, setname] = useState(null);
  const [place, setplace] = useState(null);
  const [date, setdate] = useState(null);
  const [dates, setdates] = useState(null);
  const [start, setStart] = useState(null);
  const [arrival, setArrival] = useState(null);
  const [links, setlinks] = useState(null);
  const [instruct, setInstruct] = useState(null);
  const [clubs, setClubs] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          console.log(storedUserId);
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error('Error fetching userId from storage:', error);
        Alert.alert('Error', 'Failed to load user ID');
      }
    })();
  }, []);

  useEffect(() => {
    if (!userId) return;
    if (userId) {
      axios.get(`${process.env.EXPO_PUBLIC_IP}/clubAccess/${userId}`)
        .then(res => {
          console.log(res.data)
          const clubList = res.data.club_id;
          console.log(clubList)
          setClubs(clubList);
        })
        .catch(err => {
          console.error('Error fetching meeting details:', err);
          setLoading(false);
        });
    }
  }, [userId]);

  const Add = async () => {
    try {
      const payload =
      {
          club_id: clubs,
          meetingname: name,
          meetingplace: place,
          meetingdate: auToIso(date),
          meetingstarttime: start,
          meetingarrivaltime: arrival,
          link: links,
          instructions: instruct
        };
      await axios.post(
        `${process.env.EXPO_PUBLIC_IP}/meeting/add/`, payload        
      );
      Alert.alert("Success", "Meeting Added");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to Add Meeting");
      console.log(error);
    }

  }
  function auToIso(date) {        // "02/10/2025" -> "2025-10-02"
    const [yyyy, mm, dd] = date.split("/");
    return `${yyyy}-${mm}-${dd}`;
  }

  return (
    <View style={styles.background}>
      <ScrollView>
      <FormContainer>
        <View style={styles.inputs}>
          <FormLabel>Name:</FormLabel>
          <View
            style={styles.inputGroup}>
            <FormInput
              placeholder="MeetingName"
              onChangeText={setname}
            />
          </View>
        </View>
        <View style={styles.inputs}>
          <FormLabel>Date:</FormLabel>
          <View
            style={styles.inputGroup}>
            <FormInput
              placeholder="Date"
              onChangeText={setdate}
            />
          </View>
        </View>
        <View style={styles.inputs}>
          <FormLabel>Start Time:</FormLabel>
          <View
            style={styles.inputGroup}>
            <FormInput
              placeholder="Start Time"
              onChangeText={setStart}
            />
          </View>
        </View>
        <View style={styles.inputs}>
          <FormLabel>Arrival Time:</FormLabel>
          <View
            style={styles.inputGroup}>
            <FormInput
              placeholder="Arrival Time"
              onChangeText={setArrival}
            />
          </View>
        </View>
        <View style={styles.inputs}>
          <FormLabel>Place: </FormLabel>
          <View
            style={styles.inputGroup}>
            <FormInput
              placeholder="Place"
              onChangeText={setplace}
            />
          </View>
        </View>
        <View style={styles.inputs}>
          <FormLabel>Program: </FormLabel>
          <View
            style={styles.inputGroup}>
            <FormInput
              placeholder="Link"
              onValueChange={setlinks}
            />
          </View>
        </View>
        <FormLabel>Entry Instructions: </FormLabel>
        <View
          style={styles.inputGroup}>
          <FormInput
            placeholder="Entry Instructions"
            onValueChange={setInstruct}
          />
        </View>
        <View style={styles.buttons}>
          <Button onPress={() => router.back()}>Cancel</Button>
          <Button onPress={() => Add()}> Add</Button>
        </View>
      </FormContainer></ScrollView>
    </View>
  );
}
export default EditForm;

const styles = StyleSheet.create({
  buttons: {
    flex: 1,
    flexDirection: 'row',
  },
  background: {
    backgroundColor: "#AFABA3",
    height: "100%",
    justifyContent: 'space-between',
    flexDirection: 'column'
  },
  contents: {
    backgroundColor: "#FFD347",
    width: 130,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
    marginVertical: 10, // Adds top and bottom spacing
    marginHorizontal: 15,
  },
  inputs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputGroup: {
    flex: 0.75,
    alignSelf: 'stretch',
    left: 10
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
