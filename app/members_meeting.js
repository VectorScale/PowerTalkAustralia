import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';

const MembersMeetingPage = () => {
  const navigation = useNavigation();

  const [selectedMonth, setSelectedMonth] = useState('May');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedClub, setSelectedClub] = useState('All Clubs');
  process.env.EXPO_PUBLIC_IP;
  

  const meetings = [
    {
      club: 'Sunshine Club',
      name: 'Monthly Speaking Workshop',
      date: '2025-05-20',
    },
    {
      club: 'Riverside Club',
      name: 'Annual Planning Meeting',
      date: '2025-06-10',
    },
    {
      club: 'Brisbane Club',
      name: 'Club Leadership Training',
      date: '2025-07-05',
    },
    {
      club: 'Brisbane Club',
      name: 'Club Leadership Training 2',
      date: '2025-07-05',
    },
  ];

  // Filter meetings based on selected month, year, and club
  const filteredMeetings = meetings.filter((meeting) => {
    const meetingDate = new Date(meeting.date);
    const meetingMonth = meetingDate.toLocaleString('default', { month: 'long' });
    const meetingYear = meetingDate.getFullYear().toString();

    const monthMatches = selectedMonth === meetingMonth;
    const yearMatches = selectedYear === meetingYear;
    const clubMatches = selectedClub === 'All Clubs' || meeting.club === selectedClub;
   if (clubMatches=='All Clubs'){
    return 
   }
    return monthMatches && yearMatches && !clubMatches;
  });

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Image
          source={{
            uri: 'https://www.powertalkaustralia.org.au/wp-content/uploads/2023/12/Asset-74x.png',
          }}
          style={styles.logo}
        />
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.profileText}>Profile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Meeting Header Block */}
        <View style={styles.meetingHeaderBlock}>
          <Text style={styles.meetingHeaderText}>Meeting</Text>
        </View>

        {/* Sorting Dropdowns */}
        <View style={styles.sortingRow}>
          <Picker
            selectedValue={selectedMonth}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedMonth(itemValue)}
          >
            <Picker.Item label="May" value="May" />
            <Picker.Item label="June" value="June" />
            <Picker.Item label="July" value="July" />
          </Picker>

          <Picker
            selectedValue={selectedYear}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedYear(itemValue)}
          >
            <Picker.Item label="2025" value="2025" />
            <Picker.Item label="2024" value="2024" />
          </Picker>

          <Picker
            selectedValue={selectedClub}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedClub(itemValue)}
          >
            <Picker.Item label="All Clubs" value="All Clubs" />
            <Picker.Item label="Sunshine Club" value="Sunshine Club" />
            <Picker.Item label="Riverside Club" value="Riverside Club" />
            <Picker.Item label="Brisbane Club" value="Brisbane Club" />
          </Picker>
        </View>

        {/* Meeting Buttons */}
        {filteredMeetings.map((meeting, index) => (
          <TouchableOpacity key={index} style={styles.meetingBlock}>
            <Text style={styles.meetingClub}>{meeting.club}</Text>
            <Text style={styles.meetingName}>{meeting.name}</Text>
            <Text style={styles.meetingDate}>{meeting.date}</Text>
          </TouchableOpacity>
        ))}

        {/* No Results Message */}
        {filteredMeetings.length === 0 && (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            No meetings found for the selected criteria.
          </Text>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('ClubMembersPage')}>
          <Text style={styles.navButton}>Club Members</Text>
        </TouchableOpacity>

        <Text style={[styles.navButton, styles.activeButton]}>Meeting</Text>

        <TouchableOpacity onPress={() => navigation.navigate('ProjectLevelsPage')}>
          <Text style={styles.navButton}>Project</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MembersMeetingPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    marginBottom: 20,
  },
  meetingHeaderBlock: {
    marginTop: 20,
    backgroundColor: '#065395',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  meetingHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  sortingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  picker: {
    flex: 1,
    height: 50,
  },
  meetingBlock: {
    marginTop: 15,
    backgroundColor: '#8A7D6A',
    padding: 15,
    borderRadius: 10,
  },
  meetingClub: {
    fontWeight: '600',
    color: '#ffffff',
  },
  meetingName: {
    fontSize: 16,
    marginTop: 4,
    color: '#ffffff',
  },
  meetingDate: {
    fontSize: 14,
    color: '#E0E0E0',
    marginTop: 2,
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
