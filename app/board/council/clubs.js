import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

const CouncilsClubsPage = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const params = useLocalSearchParams();

  const councilName = (params.councilName || '').toString();
  const councilID = params.councilID;
  const [clubNames, setClubNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  //  council 权限的俱乐部列表。
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError('');

        if (councilName) {
          setClubNames([councilName]);
          return;
        }

        // get all club api
      const clubsRes = await axios.get(`${process.env.EXPO_PUBLIC_IP}/clubs`);
        const allClubs = clubsRes.data || [];

        const councilClubNames = [];
        for (const club of allClubs) {
          const clubId = club.Club_id ?? club.club_id;
          const clubNameRow = club.Club_name ?? club.club_name;
          if (!clubId || !clubNameRow) continue;
          try {
            // 获取该俱乐部的成员用户ID get all club member api
      const { data: boardIds } = await axios.get(
        `${process.env.EXPO_PUBLIC_IP}/clubBoard/${clubId}`
      );
            let hasCouncil = false;
            for (const item of boardIds || []) {
              const uid = item.User_id ?? item.user_id ?? item.member_id ?? item.UserId ?? item.id;
              if (uid == null) continue;
              try {
          const accessRes = await axios.get(
            `${process.env.EXPO_PUBLIC_IP}/clubAccess/${uid}`
          );
                const accessLevel = accessRes.data?.level_of_access || accessRes.data?.access;
                if (accessLevel === 'council') {
                  hasCouncil = true;
                  break;
                }
              } catch (inner) {
                console.log('Fetch access failed:', inner);
              }
            }
            if (hasCouncil) {
              councilClubNames.push(clubNameRow);
            }
          } catch (e) {
            console.log('Fetch board ids failed:', e);
          }
        }

        const uniqueNames = Array.from(new Set(councilClubNames));
        
      const councilClubs = await axios.get(`${process.env.EXPO_PUBLIC_IP}/councilClubs/${councilID}`);
        setClubNames(councilClubs.data);
      } catch (err) {
        console.error('Error fetching clubs for council:', err);
        setError('Failed to load clubs');
      } finally {
        setLoading(false);
      }
    })();
  }, [councilName]);

  const handleClubPress = (clubName) => {
    // 处理俱乐部按钮点击事件，跳转到俱乐部成员页面并传递俱乐部名称
    console.log(`${clubName} pressed`);
    router.navigate({
      pathname: '/board/council/club/Members',
      params: { clubID: clubName }
    });
  };

  const handleBackPress = () => {
    // 返回到 Councils 页面
    console.log('Back button pressed - returning to councils page');
    try {
      router.navigate('/councilspage');
    } catch (error) {
      console.log('Navigation error:', error);
      // 如果导航失败，尝试其他方式
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* 返回按钮和 Clubs 标题块 */}

        {loading && (
          <View style={{ paddingVertical: 20 }}>
            <Text style={{ textAlign: 'center' }}>Loading clubs...</Text>
          </View>
        )}
        {!loading && error ? (
          <View style={{ paddingVertical: 20 }}>
            <Text style={{ textAlign: 'center', color: 'red' }}>{error}</Text>
          </View>
        ) : null}
        {!loading && !error && clubNames.length === 0 ? (
          <View style={{ paddingVertical: 20 }}>
            <Text style={{ textAlign: 'center' }}>No clubs found</Text>
          </View>
        ) : null}
        {!loading && !error && clubNames.map((club) => (
          <TouchableOpacity
            key={club.club_id}
            style={[styles.clubButton, styles.dynamicClubButton]}
            onPress={() => handleClubPress(club.club_id)}
          >
            <Text style={styles.clubButtonText}>{club.club_name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerBlock: {
    marginTop: 30,
    backgroundColor: '#065395',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    padding: 10,
    zIndex: 10,
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    flex: 1,
  },
  clubButton: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  dynamicClubButton: {
    backgroundColor: '#8A7D6A', // 棕色，与其他页面按钮颜色一致
  },
  clubButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default CouncilsClubsPage;
