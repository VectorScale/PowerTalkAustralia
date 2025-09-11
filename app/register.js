import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "expo-router";
import axios from "axios";
import FormLabel from "@/PTComponents/FormLabel";
import FormInput from "@/PTComponents/FormInput";
import Button from "@/PTComponents/Button";
import FormContainer from "@/PTComponents/FormContainer";

const PORT = 8081;

// Function to generate a random numeric user ID
function generateShortId(length) {
  let id = "";
  for (let i = 0; i < length + 1; i++) {
    id += Math.floor(Math.random() * 10); // 0–9
  }
  return Number(id);
}

const RegisterForm = () => {
  const router = useRouter();
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
    var today = new Date();
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();

    let website_login = "";
    let password = "";

    try {
      const memberResponse = await axios.post(
        `http://${process.env.EXPO_PUBLIC_IP}:8081/users/checkMonthlyMembers`
      );
      console.log("Server Response:", memberResponse.data.message);
      Alert.alert("Success", "Membership successful");
      website_login = yyyy + mm + memberResponse.data.monthlyMembers;
      password =
        data.first_name.charAt(0).toUpperCase() +
        data.last_name.charAt(0).toUpperCase() +
        yyyy +
        mm +
        memberResponse.data.monthlyMembers;
    } catch (error) {
      console.error(
        "Error checking members:",
        error.response ? error.response.data : error.message
      );
      Alert.alert(
        "Error",
        error.response?.data?.message || "Member Check Failed"
      );
    }

    let uniqueID = false;
    let user_id = 0;
    while (uniqueID == false) {
      user_id = generateShortId(6); // generate new ID each time

      try {
        const checkIDResponse = await axios.post(
          `http://${process.env.EXPO_PUBLIC_IP}:8081/users/checkIDExists`,
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
      const createMemberResponse = await axios.post(
        `http://${process.env.EXPO_PUBLIC_IP}:8081/users/newMember`,
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
    }

    try {
      const registerResponse = await axios.post(
        `http://${process.env.EXPO_PUBLIC_IP}:8081/users/register`,
        payload
      );
      Alert.alert("Success", "Registration successful");
      reset(); // clear the form after successful registration
      router.back();
    } catch (error) {
      console.error(
        "Error submitting form:",
        error.response ? error.response.data : error.message
      );
      Alert.alert(
        "Error",
        error.response?.data?.message || "Registration failed"
      );
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
            <Button onPress={handleSubmit(onSubmit)}>Register</Button>
          </View>
        </View>
      </FormContainer>
    </View>
  );
};

export default RegisterForm;

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
