import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CouncilsClubsPage = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [userId, setUserId] = useState("");

  const [clubNames, setClubNames] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


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
        if (userId == "") return;
        (async () => {
          try {
    
            // get all club api
          const clubsRes = await axios.get(`${process.env.EXPO_PUBLIC_IP}/user/${userId}`);
            const clubs = clubsRes.data || [];
    
            const clubMeetingDetails = await Promise.all(
              clubs.map(async (item:any) => {
                const res = await axios.get(
                  `${process.env.EXPO_PUBLIC_IP}/club/${item.club_id}`
                );
                const name = res.data.club_name;
                return {
                  name,
                  id: item.club_id,
                };
              })
            );
    
            setClubNames(clubMeetingDetails);
          } catch (err) {
            console.error('Error fetching clubs for council:', err);
            setError('Failed to load clubs');
          } finally {
            setLoading(false);
          }
        })();
      }, [userId]);

  const handleClubPress = async (clubName:any) => {
    await AsyncStorage.setItem("clubId", clubName.toString());
    router.navigate({
      pathname: "/board/club/members",
      params: { clubID: clubName },
    });
  };


  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* 返回按钮和 Clubs 标题块 */}

        {loading && (
          <View style={{ paddingVertical: 20 }}>
            <Text style={{ textAlign: "center" }}>Loading clubs...</Text>
          </View>
        )}
        {!loading && error ? (
          <View style={{ paddingVertical: 20 }}>
            <Text style={{ textAlign: "center", color: "red" }}>{error}</Text>
          </View>
        ) : null}
        {!loading && !error && clubNames.length === 0 ? (
          <View style={{ paddingVertical: 20 }}>
            <Text style={{ textAlign: "center" }}>No clubs found</Text>
          </View>
        ) : null}
        {!loading &&
          !error &&
          clubNames.map((club:any) => (
            <TouchableOpacity
              key={club.id}
              style={[styles.clubButton, styles.dynamicClubButton]}
              onPress={() => handleClubPress(club.id)}
            >
              <Text style={styles.clubButtonText}>{club.name}</Text>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerBlock: {
    marginTop: 30,
    backgroundColor: "#065395",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 20,
    padding: 10,
    zIndex: 10,
    minWidth: 40,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    flex: 1,
  },
  clubButton: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  dynamicClubButton: {
    backgroundColor: "#8A7D6A", // 棕色，与其他页面按钮颜色一致
  },
  clubButtonText: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "600",
  },
});

export default CouncilsClubsPage;
