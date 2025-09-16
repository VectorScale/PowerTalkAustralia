import React, { useState } from "react";
import { Text, View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

const PTHeader = () => {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [userId, setUserId] = useState(null);

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
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userId");
      router.push({ pathname: "./club_meeting" });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: `./`,
            })
          }
        >
          <Image
            source={{
              uri: "https://www.powertalkaustralia.org.au/wp-content/uploads/2023/12/Asset-74x.png",
            }}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* User icon */}
      {userId && (
        <TouchableOpacity
          style={styles.iconWrapper}
          onPress={() => setMenuVisible(!menuVisible)}
        >
          <FontAwesome name="user" size={30} color="black" />
        </TouchableOpacity>
      )}

      {/* Menu */}
      {menuVisible && (
        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setMenuVisible(false);
              router.push("/profile");
            }}
          >
            <Text style={styles.menuText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Text style={styles.menuText}>Log out</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default PTHeader;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F1F6F5",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  logoContainer: {
    flex: 1,
  },
  logo: {
    width: 150,
    height: 60,
  },
  iconWrapper: {
    padding: 5,
    zIndex: 20, // Ensure user icon is clickable
  },
  menu: {
    position: "absolute",
    top: 70, // adjust based on your header height
    right: 15,
    backgroundColor: "white",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    zIndex: 99,
  },
  menuItem: {
    paddingVertical: 6,
  },
  menuText: {
    fontSize: 16,
  },
});
