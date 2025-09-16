import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Alert} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import BottomNav from '@/PTComponents/BottomNav';
import PTHeader from '@/PTComponents/Header';
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const MembersProjectPage1 = () => {
   const [userId, setUserId] = useState(null);
    const [clubId, setclubid] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");

            if (storedUserId) {
          console.log(storedUserId);
          setUserId(storedUserId);
          const access = await axios.get(
        `http://10.88.48.249:8081/clubAccess/${storedUserId}`
      );
        const accesses = access.data; 
        console.log(accesses);
        setclubid(accesses.club_id)
        }
      } catch (error) {
        console.error("Error fetching userId from storage:", error);
        Alert.alert("Error", "Failed to load user ID");
      }
    })();
  }, []);

  const navigation = useNavigation();

  const handleLevelPress = async (level) => {
     try {
      await AsyncStorage.setItem("level", level);
      router.push("./test");
    } catch (error) {
      console.error("Error access level", error);
    }
  };
  const handleClubPress = async (clubId) =>{
     try {
      await AsyncStorage.setItem("id", clubId);
      router.push("./test");
    } catch (error) {
      console.error("Error access level", error);
    }
  }

  return (
  <View style={styles.container}>
      {/* Top Bar */}
      <PTHeader button={true} text={'Profile'} link={'profile'}/>

       {userId !=null &&  <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.headerBlock}>
          <Text style={styles.headerText}>Project Levels</Text>
        </View>

        {/* Space between header and buttons */}
        <View style={{ height: 30 }} />

        {/* Level Buttons */}
        {[1, 2, 3, 4].map((level) => (
          <TouchableOpacity
            key={level}
            style={styles.levelButton}
            onPress={() => {handleLevelPress(level)
                handleClubPress(clubId)}
            }
          >
            <Text style={styles.buttonText}>Level {level}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>}
      {userId == null && <TouchableOpacity style={styles.warning} onPress={()=>router.push("./login")}>Warning: You need to become a member and do the login to see this content</TouchableOpacity>}
      {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
              <Text style={[styles.navButton, styles.activeButton]}>
                Club Members
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("MembersMeetingPage")}
              >
                <Text style={styles.navButton}>Meeting</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate("ProjectLevelsPage")}
              >
                <Text style={styles.navButton}>Project</Text>
              </TouchableOpacity>
            </View>
    </View>
);
};

export default MembersProjectPage1;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  warning:{
    textAlign:'center',
    paddingTop:280,
    paddingBottom:300,
    fontSize:25,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 10,
    backgroundColor: '#AFABA3',
    alignItems: 'center',
  },
    bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F1F6F5",
    paddingVertical: 15,
  },
  logo: {
    width: 300,
    height: 50,
    resizeMode: 'contain',
  },
  profileText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  headerBlock: {
    marginTop: 30,
    backgroundColor: '#065395',
    paddingVertical: 15, 
    paddingHorizontal: 40,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  levelButton: {
    backgroundColor: '#8A7D6A',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F1F6F5',
    paddingVertical: 15,
  },
  navButton: {
    fontSize: 16,
    color: '#333',
  },
  activeButton: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
