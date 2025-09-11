import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

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
  // 状态管理
  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'add'>('list');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [joinedMeetings, setJoinedMeetings] = useState<number>(0);
  const [joinedMeetingIds, setJoinedMeetingIds] = useState<string[]>([]);
  
  // Add Meeting 
  const [newMeeting, setNewMeeting] = useState<Partial<Meeting>>({
    name: '',
    club: '',
    date: new Date().toISOString().split('T')[0],
    time: '13:00-14:00',
    location: '',
    documentLink: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const navigation = useNavigation();

  // 加载已参加的会议数量和ID列表the number of meeting and the list of id
  useEffect(() => {
    const loadJoinedMeetings = async () => {
      try {
        const count = await AsyncStorage.getItem('guest_joined_meetings');
        const joinedIds = await AsyncStorage.getItem('guest_joined_meeting_ids');
        const storedMeetings = await AsyncStorage.getItem('guest_meetings_list');
        
        setJoinedMeetings(count ? parseInt(count) : 0);
        setJoinedMeetingIds(joinedIds ? JSON.parse(joinedIds) : []);
        
        if (storedMeetings) {
          setMeetings(JSON.parse(storedMeetings));
        }
      } catch (error) {
        console.error('Error loading joined meetings:', error);
      }
    };

    loadJoinedMeetings();
    fetchMeetings();
  }, []);

  // 获取所有可参加的会议
  const fetchMeetings = async () => {
    try {
      setLoading(true);
      
      // for test we need api
      const mockMeetings: Meeting[] = [
        {
          id: '1',
          name: 'Meeting A',
          club: 'Club A',
          date: '2024-01-04',
          time: '13:00-14:00',
          location: 'Room A',
          meetingId: '2223456',
          documentLink: 'link of the document',
        },
      
      ];
      
      setMeetings(mockMeetings);
      
    } catch (error) {
      console.error('Error fetching meetings:', error);
      Alert.alert('Error', 'Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  // 查看会议详情
  const handleViewMeetingDetail = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setCurrentView('detail');
  };

  // 加入会议处理
  const handleJoinMeeting = async (meeting: Meeting) => {
    // 检查是否已经加入过这个会议 check if you have join the meeting
    if (joinedMeetingIds.includes(meeting.id)) {
      Alert.alert('Already Joined', 'You have already joined this meeting.');
      return;
    }

    // 检查是否达到3场限制
    if (joinedMeetings >= 3) {
      Alert.alert(
        'Limit Reached', 
        'You have joined the maximum number of meetings (3) as a guest. Please become a member to join more meetings.'
      );
      return;
    }

    try {
      const newCount = joinedMeetings + 1;
      const newJoinedIds = [...joinedMeetingIds, meeting.id];
      
      await AsyncStorage.setItem('guest_joined_meetings', newCount.toString());
      await AsyncStorage.setItem('guest_joined_meeting_ids', JSON.stringify(newJoinedIds));
      
      setJoinedMeetings(newCount);
      setJoinedMeetingIds(newJoinedIds);
      
      Alert.alert('Success', `You have joined ${meeting.name}\n\nMeetings joined: ${newCount}/3`);
      
      // 如果达到3场限制，提醒用户 reminder
      if (newCount >= 3) {
        setTimeout(() => {
          Alert.alert(
            'Meeting Limit Reached',
            'You have reached the maximum of 3 meetings as a guest. Please become a member to join more meetings,.',
            [{ text: 'OK' }]
          );
        }, 2000);
      }
      
    } catch (error) {
      console.error('Error joining meeting:', error);
      Alert.alert('Error', 'Failed to join meeting');
    }
  };

  // 重置）just for test(delete)
  const resetJoinedMeetings = async () => {
    try {
      await AsyncStorage.removeItem('guest_joined_meetings');
      await AsyncStorage.removeItem('guest_joined_meeting_ids');
      setJoinedMeetings(0);
      setJoinedMeetingIds([]);
      Alert.alert('Reset', 'Joined meetings have been reset.');
    } catch (error) {
      console.error('Error resetting:', error);
    }
  };

  // 添加新会议add new meeting for guest
  const handleAddMeeting = async () => {
    if (!newMeeting.name || !newMeeting.club || !newMeeting.location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const meeting: Meeting = {
        id: Date.now().toString(),
        name: newMeeting.name!,
        club: newMeeting.club!,
        date: newMeeting.date!,
        time: newMeeting.time!,
        location: newMeeting.location!,
        meetingId: Math.floor(Math.random() * 9000000 + 1000000).toString(),
        documentLink: newMeeting.documentLink || '',
      };

      const updatedMeetings = [...meetings, meeting];
      setMeetings(updatedMeetings);
      await AsyncStorage.setItem('guest_meetings_list', JSON.stringify(updatedMeetings));
      
      Alert.alert('Success', 'Meeting added successfully');
      setCurrentView('list');
      
      // 重置表单
      setNewMeeting({
        name: '',
        club: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        location: '',
        documentLink: '',
      });
      
    } catch (error) {
      console.error('Error adding meeting:', error);
      Alert.alert('Error', 'Failed to add meeting');
    }
  };

  // 格式化日期显示
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }).replace(/\//g, '/');
  };

  // 检查会议是否已加入
  const isMeetingJoined = (meetingId: string) => {
    return joinedMeetingIds.includes(meetingId);
  };

  // 1. Meeting列表界面 pages
  const renderMeetingListView = () => (
    <ScrollView style={styles.content}>
      <View style={styles.headerBlock}>
        <Text style={styles.headerText}>Meetings</Text>
      </View>

      <View style={styles.meetingCountBar}>
        <Text style={styles.meetingCountText}>
          Guest Meetings Joined: {joinedMeetings}/3
        </Text>
        {__DEV__ && (
          <TouchableOpacity onPress={resetJoinedMeetings} style={styles.resetButton}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity 
        style={styles.addNewButton}
        onPress={() => setCurrentView('add')}
      >
        <Text style={styles.addNewButtonText}>+ Add New Meeting</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#065395" />
          <Text>Loading meetings...</Text>
        </View>
      ) : meetings.length > 0 ? (
        meetings.map((meeting) => (
          <TouchableOpacity
            key={meeting.id}
            style={[
              styles.meetingCard,
              isMeetingJoined(meeting.id) && styles.meetingCardJoined
            ]}
            onPress={() => handleViewMeetingDetail(meeting)}
          >
            <View style={styles.meetingCardContent}>
              <Text style={styles.meetingName}>{meeting.name}</Text>
              <Text style={styles.meetingDate}>Date: {formatDate(meeting.date)}</Text>
              {isMeetingJoined(meeting.id) && (
                <Text style={styles.joinedLabel}>✓ Joined</Text>
              )}
            </View>
            <View style={styles.thumbIcon}>
              <Text>{isMeetingJoined(meeting.id) ? '✓' : '👍'}</Text>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.noResultsText}>No meetings found.</Text>
      )}
    </ScrollView>
  );

  // 2. Meeting详情界面 meeting details
  const renderMeetingDetailView = () => {
    const isJoined = selectedMeeting ? isMeetingJoined(selectedMeeting.id) : false;
    const canJoin = joinedMeetings < 3 && !isJoined;

    return (
      <ScrollView style={styles.content}>
        <View style={styles.headerBlock}>
          <TouchableOpacity onPress={() => setCurrentView('list')} style={styles.backButton}>
            <Text style={styles.backButtonIcon}>←</Text>
          </TouchableOpacity>
          <Image
            source={{ uri: 'https://www.powertalkaustralia.org.au/wp-content/uploads/2023/12/Asset-74x.png' }}
            style={styles.logoSmall}
          />
          <Text style={styles.headerText}>{selectedMeeting?.name}</Text>
        </View>

        {selectedMeeting && (
          <View style={styles.detailContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>🏢 Club:</Text>
              <Text style={styles.detailValue}>{selectedMeeting.club}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>🆔 Meeting id:</Text>
              <Text style={styles.detailValue}>{selectedMeeting.meetingId || 'N/A'}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>📍 Place:</Text>
              <Text style={styles.detailValue}>{selectedMeeting.location}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>📅 Date:</Text>
              <Text style={styles.detailValue}>{formatDate(selectedMeeting.date)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>🕐 Time:</Text>
              <Text style={styles.detailValue}>{selectedMeeting.time}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>📄 Document:</Text>
              <Text style={styles.detailValue}>
                {selectedMeeting.documentLink ? `(${selectedMeeting.documentLink})` : 'No document'}
              </Text>
            </View>

            <TouchableOpacity 
              style={[
                styles.joinMeetingButton,
                !canJoin && styles.joinMeetingButtonDisabled
              ]}
              onPress={() => canJoin && handleJoinMeeting(selectedMeeting)}
              disabled={!canJoin}
            >
              <Text style={[
                styles.joinMeetingButtonText,
                !canJoin && styles.joinMeetingButtonTextDisabled
              ]}>
                {isJoined ? '✓ Already Joined' : 
                 joinedMeetings >= 3 ? 'Meeting Limit Reached (3/3)' : 
                 'Join Meeting'}
              </Text>
            </TouchableOpacity>

            {joinedMeetings >= 3 && !isJoined && (
              <Text style={styles.limitWarning}>
                You have reached the maximum of 3 meetings as a guest. 
                Please become a member to join more meetings.
              </Text>
            )}

            <View style={styles.meetingStatusBar}>
              <Text style={styles.meetingStatusText}>
                Guest Status: {joinedMeetings}/3 meetings joined
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  // 3. Add Meeting界面
  const renderAddMeetingView = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.content}
    >
      <ScrollView>
        <View style={styles.headerBlock}>
          <TouchableOpacity onPress={() => setCurrentView('list')} style={styles.backButton}>
            <Text style={styles.backButtonIcon}>←</Text>
          </TouchableOpacity>
          <Image
            source={{ uri: 'https://www.powertalkaustralia.org.au/wp-content/uploads/2023/12/Asset-74x.png' }}
            style={styles.logoSmall}
          />
          <Text style={styles.headerText}>Add Meeting</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Meeting Name:</Text>
            <TextInput
              style={styles.formInput}
              value={newMeeting.name}
              onChangeText={(text) => setNewMeeting({...newMeeting, name: text})}
              placeholder="Enter meeting name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Club:</Text>
            <TextInput
              style={styles.formInput}
              value={newMeeting.club}
              onChangeText={(text) => setNewMeeting({...newMeeting, club: text})}
              placeholder="Enter club name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Place:</Text>
            <TextInput
              style={styles.formInput}
              value={newMeeting.location}
              onChangeText={(text) => setNewMeeting({...newMeeting, location: text})}
              placeholder="Enter location"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Date:</Text>
            <TouchableOpacity 
              style={styles.formInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{formatDate(newMeeting.date!)}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Time:</Text>
            <TextInput
              style={styles.formInput}
              value={newMeeting.time}
              onChangeText={(text) => setNewMeeting({...newMeeting, time: text})}
              placeholder="e.g., 13:00-14:00"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Document Link:</Text>
            <TextInput
              style={styles.formInput}
              value={newMeeting.documentLink}
              onChangeText={(text) => setNewMeeting({...newMeeting, documentLink: text})}
              placeholder="Optional document link"
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity 
            style={styles.finishButton}
            onPress={handleAddMeeting}
          >
            <Text style={styles.finishButtonText}>Finish</Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && Platform.OS === 'ios' && (
          <DateTimePicker
            value={new Date(newMeeting.date!)}
            mode="date"
            display="spinner"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setNewMeeting({...newMeeting, date: selectedDate.toISOString().split('T')[0]});
              }
            }}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return (
    <View style={styles.container}>
    
      {currentView === 'list' && renderMeetingListView()}
      {currentView === 'detail' && renderMeetingDetailView()}
      {currentView === 'add' && renderAddMeetingView()}

      {/* 底部导航 */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('ClubMember' as never)}>
          <Text style={styles.navButton}>Club member</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setCurrentView('list')}>
          <Text style={[styles.navButton, currentView === 'list' && styles.activeButton]}>Guest</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Meeting' as never)}>
          <Text style={styles.navButton}>Meeting</Text>
        </TouchableOpacity>
      </View>
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