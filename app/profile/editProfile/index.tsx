import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Text,
  View,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";

import FormContainer from "@/PTComponents/FormContainer";
import FormLabel from "@/PTComponents/FormLabel";
import FormInput from "@/PTComponents/FormInput";
import Button from "@/PTComponents/Button";
import Finger from "@/PTComponents/Finger";

import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGlobalSearchParams } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { useNavigation } from "expo-router";

import Checkbox from "expo-checkbox";

type Names =
  | "first_name"
  | "last_name"
  | "email"
  | "phone_number"
  | "address"
  | "postcode"
  | "note";

const EditProfile = () => {
  const fields = {
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address: "",
    postcode: "",
    note: "",
    want_marketing: false,
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitted },
  } = useForm({
    defaultValues: fields,
  });

  const router = useRouter();
  const nav = useNavigation();
  const global = useGlobalSearchParams();
  const [userId, setUserId] = useState("");
  const [profiles, setProfiles] = useState<any>([]);

  const [marketing, setMarketing] = useState(false);
  const [showSharing, setSharing] = useState(false);
  const [hidePhone, setHidePhone] = useState(false);
  const [hideAddress, setHideAddress] = useState(false);

  const handleSharing = async () => {
    let profile_id = global.profileID.toString();

    let phone_private = hidePhone ? 1 : 0;
    let address_private = hideAddress ? 1 : 0;

    const payload = {
      profile_id,
      phone_private,
      address_private,
    };
    try {
      await axios.post(`${process.env.EXPO_PUBLIC_IP}/profile/share`, payload);
      Alert.alert("Success", "Privacy Updated");
      setSharing(false);
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Update failed");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) setUserId(storedUserId);
      } catch (error) {
        Alert.alert("Error", "Failed to load user ID");
      }
    })();
  }, []);

  // prevent editing another user's profile
  useEffect(() => {
    if (!userId || !global.profileID) return;
    if (userId !== global.profileID.toString()) {
      Alert.alert("Permission denied", "You can only edit your own profile.");
      router.replace({ pathname: "/profile/[profileID]", params: { profileID: global.profileID.toString() } });
    }
  }, [userId, global.profileID]);

  useEffect(() => {
    (async () => {
      try {
        if (userId) {
          const res = await axios.get(
            `${process.env.EXPO_PUBLIC_IP}/profile/${global.profileID}`
          );
          setProfiles(res.data);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to fetch profile");
      }
    })();
  }, [userId]);

  useEffect(() => {
    if (profiles) {
      setHidePhone(!!profiles.phone_private);
      setHideAddress(!!profiles.address_private);
    }
  }, [profiles]);

  useEffect(() => {
    if (userId == global.profileID.toString()) {
      nav.setOptions({ title: `Editing Your Profile` });
    } else {
      nav.setOptions({
        title: `Editing ${profiles.first_name} ${profiles.last_name}`,
      });
    }
  });

  useEffect(() => {
    if (profiles) {
      reset({
        first_name: profiles.first_name || "",
        last_name: profiles.last_name || "",
        email: profiles.email || "",
        phone_number: profiles.phone_number || "",
        address: profiles.address || "",
        postcode: profiles.postcode || "",
        note: profiles.notes ?? profiles.note ?? "",
        want_marketing: !!profiles.want_marketing,
      });
    }
  }, [profiles, reset]);

  const onSubmit = async (data: any) => {
    for (var key in data) if (data[key] == "") data[key] = null;

    let profile_id = global.profileID.toString();
    const { note, ...rest } = data;
    const payload = {
      ...rest,
      notes: note,  
      profile_id,
      marketing,
    };

    try {
      await axios.post(`${process.env.EXPO_PUBLIC_IP}/profile/edit`, payload);
      Alert.alert("Success", "Update successful");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Update failed");
    }
  };

  return (
    <ScrollView>
      <View style={styles.background}>
        <FormContainer>
          <View style={styles.inputs}>
            {[
              {
                field: "first_name",
                placeholder: "First Name",
                label: "Full Name",
                autocomplete: "given-name",
                lines: 1,
                multiline: false,
                rule: { required: "You must enter your first name" },
              },
              {
                field: "last_name",
                placeholder: "Last Name",
                autocomplete: "family-name",
                lines: 1,
                multiline: false,
                rule: { required: "You must enter your last name" },
              },
              {
                field: "email",
                placeholder: "Email Address",
                label: "Contact Info",
                autocomplete: "email",
                lines: 1,
                multiline: false,
                rule: {
                  required: "You must enter your email",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Enter a valid email address",
                  },
                },
              },
              {
                field: "phone_number",
                placeholder: "Phone Number",
                autocomplete: "tel",
                lines: 1,
                multiline: false,
                rule: {
                  maxLength: { value: 20, message: "Enter a valid Phone Number" },
                  pattern: {
                    value: /[\d\s]{10,20}$/,
                    message: "Enter a valid phone number",
                  },
                },
              },
              {
                field: "address",
                placeholder: "Address",
                label: "Address",
                autocomplete: "address-line1",
                lines: 1,
                multiline: false,
              },
              {
                field: "postcode",
                placeholder: "Postcode",
                autocomplete: "postal-code",
                lines: 1,
                multiline: false,
                rule: {
                  maxLength: { value: 4, message: "Enter a valid postcode" },
                  pattern: { value: /\d{4}$/, message: "Enter a valid postcode" },
                },
              },
              {
                field: "note",
                placeholder: "Additional Notes",
                label: "Note",
                autocomplete: "off",
                lines: 3,
                multiline: true,
              },
            ].map(({ field, placeholder, label, lines, multiline, autocomplete, rule }) => (
              <View key={field} style={styles.inputs}>
                {label && <FormLabel>{label}</FormLabel>}
                <Controller
                  key={field}
                  control={control}
                  name={field as Names}
                  render={({ field: { onChange, value } }) => (
                    <FormInput
                      autoComplete={autocomplete}
                      placeholder={placeholder}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize="none"
                      multiline={multiline}
                      lines={lines}
                    />
                  )}
                  rules={rule}
                />
                {errors[field as Names] && isSubmitted && (
                  <Text style={styles.errorText}>
                    {errors[field as Names]?.message?.toString()}
                  </Text>
                )}
              </View>
            ))}
          </View>
          <View style={styles.function}>
            <TouchableOpacity onPress={() => setSharing(true)}>
              <FormLabel>
                <Finger /> Hide Your Info
              </FormLabel>
            </TouchableOpacity>
          </View>
          <View style={styles.function}>
            <Button onPress={handleSubmit(onSubmit)}>Submit Changes</Button>
            <Button onPress={() => router.back()}>Cancel Changes</Button>
          </View>
        </FormContainer>
      </View>

      {/* Privacy Modal */}
      <Modal
        visible={showSharing}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSharing(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalView}>
            <Text style={styles.title}>Tick to hide from other members</Text>
            <View style={styles.contents}>
              <View style={styles.checkContainer}>
                <Checkbox
                  value={hidePhone}
                  onValueChange={setHidePhone}
                  color={hidePhone ? "#FFD347" : undefined}
                />
              </View>
              <Text style={styles.label}>Hide Phone Number</Text>
            </View>
            <View style={styles.contents}>
              <View style={styles.checkContainer}>
                <Checkbox
                  value={hideAddress}
                  onValueChange={setHideAddress}
                  color={hideAddress ? "#FFD347" : undefined}
                />
              </View>
              <Text style={styles.label}>Hide Address</Text>
            </View>
            <View style={styles.modalFunction}>
              <View style={{ flex: 1 }}>
                <Text style={styles.disclaimer}>
                  All information in the member list is for association use only
                  and may not be shared outside the association without the
                  express permission of the individual
                </Text>
              </View>
              <Button onPress={() => handleSharing()}>Done</Button>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  modalBackground: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    flexDirection: "row",
    justifyContent: "center",
    flex: 1,
  },
  modalView: {
    alignSelf: "center",
    borderRadius: 25,
    backgroundColor: "#F1F6F5",
    maxWidth: "90%",
  },
  contents: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
  },
  checkContainer: {
    flex: 1,
    marginLeft: "5%",
  },
  label: {
    flex: 7,
  },
  background: {
    backgroundColor: "#AFABA3",
    height: "100%",
  },
  inputs: {
    marginHorizontal: 20,
  },
  function: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginTop: 10,
  },
  modalFunction: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  title: {
    padding: 10,
    alignItems: "center",
    backgroundColor: "#8A7D6A",
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20, //iOS and android use different words to set specific border radii
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  disclaimer: {
    alignSelf: "center",
    fontSize: 6,
    textAlign: "right",
    flex: 1,
    paddingLeft: 10,
    paddingTop: "10%",
  },
});
