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
import { useLocalSearchParams, useRouter } from "expo-router";

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useKeyboard } from "@react-native-community/hooks";

const EditForm = () => {
  const router = useRouter();
  const local = useLocalSearchParams();
  const meetingId = local.meetingID;

  const [meeting, setMeeting] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [name, setname] = useState(null);
  const [place, setplace] = useState(null);
  const [date, setdate] = useState(null);
  const [dates, setdates] = useState(null);
  const [start, setStart] = useState(null);
  const [arrival, setArrival] = useState(null);
  const [links, setlinks] = useState(null);
  const [instruct, setInstruct] = useState(null);
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
      axios.get(`${process.env.EXPO_PUBLIC_IP}/meeting_details/${meetingId}`)
        .then(res => {
          setMeeting(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching meeting details:', err);
          setLoading(false);
        });
    }
  }, [userId]);
  useEffect(() => {
    if (meeting.length > 0) {
      const m = meeting[0]; // assuming one meeting

      const d = new Date(m.meeting_date);

      const dateStr = new Intl.DateTimeFormat('en-AU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'Australia/Sydney',
      }).format(d);
      setname(m.meeting_name);
      setplace(m.meeting_place);
      setdate(dateStr);
      setStart(m.meeting_time);
      setArrival(m.arrival_time);
      setlinks(m.agenda_file_link);
      setInstruct(m.entry_instructions);
    }
  }, [meeting]);
  const Edit = async () => {

    try {
      const payload = 
        {
          meetingid: meetingId,
          meetingname: name,
          meetingplace: place,
          meetingdate: auToIso(date),
          meetingstarttime: start,
          meetingarrivaltime: arrival,
          link: links,
          instructions: instruct
        };
        console.log(payload);
      const access = await axios.post(
        `${process.env.EXPO_PUBLIC_IP}/meeting/edit`,payload
      );

      console.log(access.status);
    } catch (error) {
      Alert.alert("Error", "Failed to add member data");
      console.error(error.message);
    }

  }
  function auToIso(date) {        // "02/10/2025" -> "2025-10-02"
    const [dd, mm, yyyy] = date.split("/");
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

                placeholder="Meeting Name"
                value={name}

                onValueChange={setname}
              />

            </View>

          </View>
          <View style={styles.inputs}>
            <FormLabel>Date:</FormLabel>
            <View
              style={styles.inputGroup}>

              <FormInput

                placeholder="Email"
                value={date}

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
                value={start ?? ""}

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
                value={arrival ?? ""}

                onChangeText={setArrival}
              />
            </View>

          </View>
          <View style={styles.inputs}>
            <FormLabel>Place: </FormLabel>
            <View
              style={styles.inputGroup}>

              <FormInput
                placeholder="Email"
                value={place ?? ""}

                onChangeText={setplace}
              />

            </View>
          </View>
          <View style={styles.inputs}>
            <FormLabel>Program: </FormLabel>

            <View
              style={styles.inputGroup}>

              <FormInput

                placeholder="Email"
                value={links === null ? "( insert link )" : links}

                onValueChange={setlinks}
              />

            </View>
          </View>
          <FormLabel>Entry Instructions: </FormLabel>

          <View
            style={styles.inputGroup}>

            <FormInput
              placeholder="Entry Instructions"
              value={instruct}

              onValueChange={setInstruct}
            />

          </View>
          <View style={styles.function}>

            <Button onPress={() => router.back()}>Cancel</Button>
            <Button onPress={Edit}> Save</Button>
          </View>

        </FormContainer>
      </ScrollView>
    </View>
  );
}

export default EditForm;

const styles = StyleSheet.create({
  buttons: {
    flex: 1,
    flexDirection: "row"
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
