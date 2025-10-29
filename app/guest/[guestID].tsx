
import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Button from "@/PTComponents/Button";

// Meeting
interface Meeting {
  id: string;
  club: string;
  name: string;
  date: string;
  time: string;
  location: string;
  meetingId?: string;
  documentLink?: string;
}

// 三个界面three pages
const GuestMeetingPages = () => {

  const userId = useLocalSearchParams().guestID;
  const [guest, setGuest] = useState<any>([]);


  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const guest = await axios.get(
          `${process.env.EXPO_PUBLIC_IP}/member/${userId}`
        );
        setGuest(guest.data);
      } catch (error) {
        console.error("Error fetching userId from storage:", error);
        Alert.alert("Error", "Failed to load user ID");
      }
    })();
  }, [userId]);




  return (
    <View style={styles.container}>
      <View style={styles.detailContainer}>

        <Text>You have used {guest.guest} of your free meetings as a guest</Text>
        <View style={{ alignItems:"center" }}>
          <Button onPress={() => router.navigate("/club/meetings")}>See Meetings</Button>
        </View></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerBlock: {
    backgroundColor: '#065395',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  logoSmall: {
    width: 150,
    height: 30,
    resizeMode: 'contain',
    marginRight: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  backButton: {
    marginRight: 10,
    padding: 5,
  },
  backButtonIcon: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  meetingCountBar: {
    backgroundColor: '#fff',
    padding: 10,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#065395',
  },
  meetingCountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065395',
  },
  resetButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addNewButton: {
    backgroundColor: '#ffffff',
    padding: 15,
    margin: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#065395',
  },
  addNewButtonText: {
    color: '#065395',
    fontSize: 16,
    fontWeight: '600',
  },
  meetingCard: {
    backgroundColor: '#FFD700',
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  meetingCardJoined: {
    backgroundColor: '#E0E0E0',
    opacity: 0.8,
  },
  meetingCardContent: {
    flex: 1,
  },
  meetingName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  meetingDate: {
    fontSize: 14,
    color: '#666',
  },
  joinedLabel: {
    fontSize: 14,
    color: '#065395',
    fontWeight: 'bold',
    marginTop: 5,
  },
  thumbIcon: {
    marginLeft: 10,
    fontSize: 20,
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#666',
  },
  detailContainer: {
    backgroundColor: '#ffffff',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    width: 120,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    fontWeight: '400',
  },
  joinMeetingButton: {
    backgroundColor: '#065395',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  joinMeetingButtonDisabled: {
    backgroundColor: '#999999',
  },
  joinMeetingButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  joinMeetingButtonTextDisabled: {
    color: '#ffffff',
  },
  limitWarning: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#FFF3CD',
    borderRadius: 5,
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
  },
  meetingStatusBar: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#E8F4F8',
    borderRadius: 5,
    alignItems: 'center',
  },
  meetingStatusText: {
    color: '#065395',
    fontSize: 14,
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: '#ffffff',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  formInput: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  finishButton: {
    backgroundColor: '#8A7D6A',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  finishButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#8A7D6A',
    paddingVertical: 15,
    paddingBottom: Platform.OS === 'ios' ? 25 : 15,
  },
  navButton: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  activeButton: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default GuestMeetingPages;