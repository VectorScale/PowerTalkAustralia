import { useEffect, useState } from "react";
import axios from "axios";

import {
  Text,
  View,
  Alert,
  StyleSheet,
  ScrollView,
  SafeAreaView,
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
import { useLocalSearchParams } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { useNavigation } from "expo-router";

import Checkbox from "expo-checkbox";

const EditProfile = () => {
  const fields = {
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address: "",
    postcode: "",
    interests: "",
    dob: "",
    pronouns: "",
    private: false,
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
  const local = useLocalSearchParams();
  const [userId, setUserId] = useState(null);
  const [profiles, setProfiles] = useState([]);

  const [privacy, setPrivacy] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const [showSharing, setSharing] = useState(false);
  const [showPhone, setPhone] = useState(false);
  const [showAddress, setAddress] = useState(false);

  const handleSharing = async () => {
    let profile_id = local.profileID.toString();
    let phone_private = showPhone ? 1 : 0;
    let address_private = showAddress ? 1 : 0;

    const payload = {
      profile_id,
      phone_private,
      address_private,
    };
    try {
      const editSharingResponse = await axios.post(
        `http://${process.env.EXPO_PUBLIC_IP}:8081/profile/share`,
        payload
      );
      console.log("Server Response:", editSharingResponse.data);
      Alert.alert("Success", "Privacy Updated");
      setSharing(false);
    } catch (error) {
      console.error(
        "Error submitting sharing:",
        error.response ? error.response.data : error.message
      );
      Alert.alert("Error", error.response?.data?.message || "Update failed");
    }
  };

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
            `http://${process.env.EXPO_PUBLIC_IP}:8081/profile/${local.profileID}`
          );
          setProfiles(res.data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        Alert.alert("Error", "Failed to fetch profile");
      }
    })();
  }, [userId]);

  useEffect(() => {
    if (profiles) {
      setPhone(profiles.phone_private ? true : false);
      setAddress(profiles.address_private ? true : false);
    }
  }, [profiles]);

  useEffect(() => {
    if (userId == local.profileID.toString()) {
      nav.setOptions({
        title: `Editing Your Profile`,
      });
    } else {
      nav.setOptions({
        title: `Editing ${profiles.first_name} ${profiles.last_name}`,
      });
    }
  });

  useEffect(() => {
    var date = "";
    var post = "";
    var phone = "";

    if (profiles) {
      console.log(profiles.first_name);
      if (profiles.dob) {
        let currDate = new Intl.DateTimeFormat(undefined, {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date(profiles.dob));

        let [day, month, year] = currDate.split("/");
        date += year;
        date += "-";
        date += month;
        date += "-";
        date += day;
      }
      if (profiles.phone_number) {
        phone += profiles.phone_number;
      }
      if (profiles.postcode) {
        post += profiles.postcode;
      }
      reset({
        first_name: profiles.first_name || "",
        last_name: profiles.last_name || "",
        email: profiles.email || "",
        phone_number: phone,
        address: profiles.address || "",
        postcode: post,
        interests: profiles.interests || "",
        dob: date,
        pronouns: profiles.pronouns || "",
        private: !!profiles.private,
        want_marketing: !!profiles.want_marketing,
      });
    }
  }, [profiles]);

  const onSubmit = async (data) => {
    //Use the generated registration information to insert into the database
    for (var key in data) {
      if (data[key] == "") {
        data[key] = null;
      }
    }
    let profile_id = local.profileID.toString();
    const payload = {
      ...data,
      profile_id,
      privacy,
      marketing,
    };
    try {
      const editProfileResponse = await axios.post(
        `http://${process.env.EXPO_PUBLIC_IP}:8081/profile/edit`,
        payload
      );
      console.log("Server Response:", editProfileResponse.data);
      Alert.alert("Success", "Update successful");
      router.back();
    } catch (error) {
      console.error(
        "Error submitting form:",
        error.response ? error.response.data : error.message
      );
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
                  pattern: {
                    value: /\d{4}$/,
                    message: "Enter a valid postcode",
                  },
                },
              },
              {
                field: "interests",
                placeholder: "What Interests You?",
                label: "Interests",
                autocomplete: "off",
                lines: 4,
                multiline: true,
              },
              {
                field: "dob",
                placeholder: "YYYY-MM-DD",
                label: "Date of Birth",
                autocomplete: "off",
                lines: 1,
                multiline: false,
                rule: {
                  maxLength: { value: 10, message: "Enter a valid date" },
                  pattern: {
                    value: /\d{4}-\d{2}-\d{2}/,
                    message: "Enter a valid date (YYYY-MM-DD)",
                  },
                },
              },
              {
                field: "pronouns",
                placeholder: "Pronouns",
                label: "Pronouns",
                autocomplete: "off",
                lines: 1,
                multiline: false,
                rule: {
                  pattern: {
                    value: /[^/s]+\/[^/s]+/,
                    message: "Invalid Pronouns '*/*'",
                  },
                },
              },
            ].map(
              ({
                field,
                placeholder,
                label,
                lines,
                multiline,
                autocomplete,
                rule,
              }) => (
                <View key={field} style={styles.inputs}>
                  {label && <FormLabel>{label}</FormLabel>}
                  <Controller
                    key={field}
                    control={control}
                    name={field}
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
                  {errors[field] && isSubmitted && (
                    <Text style={styles.errorText}>
                      {errors[field].message?.toString()}
                    </Text>
                  )}
                </View>
              )
            )}
          </View>
          <View style={styles.function}>
            <TouchableOpacity onPress={() => setSharing(true)}>
              <FormLabel>
                <Finger /> Share Your Info
              </FormLabel>
            </TouchableOpacity>
          </View>
          <View style={styles.function}>
            <Button onPress={handleSubmit(onSubmit)}>Submit Changes</Button>

            <Button onPress={() => router.back()}>Cancel Changes</Button>
          </View>
        </FormContainer>
      </View>
      <Modal
        visible={showSharing}
        transparent={true}
        animationType="slide" // or 'fade' or 'none'
        onRequestClose={() => setSharing(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalView}>
            <Text style={styles.title}>Tick to share with other members:</Text>
            <View style={styles.contents}>
              <View style={styles.checkContainer}>
                <Checkbox
                  value={showPhone}
                  onValueChange={setPhone}
                  color={showPhone ? "#FFD347" : undefined}
                ></Checkbox>
              </View>
              <Text style={styles.label}>Share Email</Text>
            </View>
            <View style={styles.contents}>
              <View style={styles.checkContainer}>
                <Checkbox
                  value={showAddress}
                  onValueChange={setAddress}
                  color={showAddress ? "#FFD347" : undefined}
                ></Checkbox>
              </View>
              <Text style={styles.label}>Share Phone Number</Text>
            </View>
            <View style={styles.function}>
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
  },
  contents: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
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
  container: {
    padding: 20,
    alignItems: "flex-start",
  },
  title: {
    padding: 10,
    alignItems: "center",
    backgroundColor: "#8A7D6A",
  },
  checkbox: {
    marginTop: 15,
    marginHorizontal: 5,
    alignSelf: "center",
  },
  titleText: {
    color: "white",
    fontSize: 25,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
});
