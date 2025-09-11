import {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import React from "react";

import Button from "@/PTComponents/Button";
import { SafeAreaView } from "react-native-safe-area-context";
const Home = () => {
  const router = useRouter();

  return (
    <SafeAreaView edges={["top"]} style={styles.background}>
      <View style={styles.container}>
        <View style={styles.information}>
          <Image
            source={{
              uri: "https://www.powertalkaustralia.org.au/wp-content/uploads/2023/12/Asset-74x.png",
            }}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.titleText}>Welcome to POWERtalk Vault!</Text>
        </View>
        <View style={styles.function}>
          <Button onPress={() => router.navigate("/club_meeting")}>
            Meeting
          </Button>
          <Button onPress={() => router.navigate("/login")}>Login</Button>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  background: {
    backgroundColor: "#F1F6F5",
    height: "100%",
  },
  container: {
    flexDirection:"column",
    flex:1
  },
  information: {
    padding: 30,
    margin: 30,
    marginBottom:10,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    flex: 8,
  },
  function: {
    flexDirection: "row",
    justifyContent: "center",
    flex: 1,
  },
  titleText: {
    color: "black",
    textAlign:"center",
    fontSize: 30,
    fontWeight: "bold",
    flex:8,
    marginTop:'20%',
  },
  logo: {
    flex:1,
  },
});
