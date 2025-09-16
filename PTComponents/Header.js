import { React, useState, useEffect } from "react";

import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import UserIcon from "@/PTComponents/UserIcon";
import { SafeAreaView } from "react-native-safe-area-context";

import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Header = (props) => {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [userId, setUserId] = useState(null);

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
  });

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userId");
      router.navigate({ pathname: "/" });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <SafeAreaView edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <TouchableOpacity
            onPress={() =>
              router.navigate({
                pathname: "/login",
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
        <View style={styles.iconContainer}>
          {userId && (
            <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
              <UserIcon />
            </TouchableOpacity>
          )}
        </View>

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
    </SafeAreaView>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F1F6F5",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    zIndex: 10, // Ensure it's layered correctly
  },
  logoContainer: {
    flex: 1,
  },
  iconContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  logo: {
    height: 50,
    marginVertical: 20,
    marginRight: "15%",
  },
  icon: {
    padding: 5,
    marginRight: 10,
    zIndex: 20, // Ensure user icon is clickable
  },
  menu: {
    position: "absolute",
    top: 90, // adjust based on your header height
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
