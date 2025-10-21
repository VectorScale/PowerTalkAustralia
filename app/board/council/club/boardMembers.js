import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

const CouncilClubBoardMemberPage = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const clubId = params.clubID;
  
  // 状态管理
  const [clubData, setClubData] = useState({
    name: 'Brisbane Central',
    memberCount: 0
  });
  const [boardMembers, setBoardMembers] = useState([]);
 

  const fetchBoardMembersFromDatabase = async () => {
    try {

        console.log(clubId);
        const club = await axios.get(
          `${process.env.EXPO_PUBLIC_IP}/club/${clubId}`
        );
      // 连接数据库：获取该俱乐部的成员用户ID

      const { data: boardIds } = await axios.get(
        `${process.env.EXPO_PUBLIC_IP}/allClubBoardMembers/`
      );
      console.log(boardIds);

      const members = await Promise.all(
        (boardIds || []).map(async (item) => {
          const uid = item.User_id ?? item.user_id ?? item.member_id ?? item.UserId ?? item.id;
          if (uid == null) return null;
          try {
            const memberRes = await axios.get(
              `${process.env.EXPO_PUBLIC_IP}/clubBoardMembers/${uid}`
            );
            const accessRes = await axios.get(
              `${process.env.EXPO_PUBLIC_IP}/clubAccess/${uid}`
            );
            // 仅保留具有董事会权限的成员
            if (accessRes?.status === 202 || accessRes?.data?.message === 'No Club Access') {
              return null;
            }
            const m = memberRes.data?.[0] || {};
            const position = accessRes.data?.position || accessRes.data?.Position || 'Unassigned';
            const fullName = [m.first_name, m.last_name].filter(Boolean).join(' ') || 'Unknown';
            return {
              id: m.user_id ?? uid,
              name: fullName,
              position,
            };
          } catch (innerErr) {
            console.log('Fetch member detail failed:', innerErr);
            return null;
          }
        })
      );

      const cleaned = members.filter(Boolean);
      return {
        name: club.data.club_name,
        boardMembers: cleaned,
      };
    } catch (error) {
      console.error('Error fetching board members from database:', error);
      return {
        name: '',
        boardMembers: [],
      };
    }
  };



  // 根据传入的参数设置俱乐部数据
  useEffect(() => {
    const loadBoardMembers = async () => {
      const clubName = (params.clubName || 'Brisbane Central').toString();
      
      try {
        const clubData = await fetchBoardMembersFromDatabase(clubName);
        let updatedBoardMembers = clubData.boardMembers;
        
        
        
        setClubData({
          name: clubData.name,
          memberCount: updatedBoardMembers.length
        });
        setBoardMembers(updatedBoardMembers);
      } catch (error) {
        console.error('Error loading board members:', error);
        // 设置默认数据
        setClubData({
          name: clubName,
          memberCount: 0
        });
        setBoardMembers([]);
      }
    };

    loadBoardMembers();
  }, [params.clubName, useIsFocused()]); // 依赖 clubName 变化触发重新加载

  const handleBackPress = () => {
    // 返回上一页
    console.log('Back button pressed');
    try {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        router.back();
      }
    } catch (error) {
      console.log('Navigation error:', error);
      router.navigate('/councilclubmemberpage');
    }
  };

  const handleAddBoardMember = () => {
    console.log('Add Board Member pressed');
    // 跳转到添加董事会成员页面
    router.push({
      pathname: '/board/council/club/addBoardMember',
      params: { 
        clubID: clubId,
        availableMembers: JSON.stringify(boardMembers)
      }
    });
  };

  const handleBoardMemberPress = (member) => {
    console.log(`Board Member ${member.name} pressed`);
    // 跳转到董事会成员详情页面并传递成员信息
    router.push({
      pathname: '/board/council/club/editBoardMember',
      params: { 
        memberID: member.id.toString()
      }
    });
  };

  // 更新董事会成员职位的接口函数
  const updateBoardMemberPosition = async (memberId, newPosition) => {
    try {

      console.log(`Updating member ${memberId} position to ${newPosition}`);
      
      // 更新本地状态
      setBoardMembers(prevMembers => 
        prevMembers.map(member => 
          member.id === memberId 
            ? { ...member, position: newPosition }
            : member
        )
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error updating board member position:', error);
      return { success: false, error: error.message };
    }
  };

  // 添加新董事会成员的接口函数
  const addNewBoardMember = async (memberData) => {
    try {
      
      const newMember = {
        id: Date.now(), // 临时ID，实际应该由后端生成
        ...memberData
      };
      
      setBoardMembers(prevMembers => [...prevMembers, newMember]);
      setClubData(prevData => ({
        ...prevData,
        memberCount: prevData.memberCount + 1
      }));
      
      return { success: true, member: newMember };
    } catch (error) {
      console.error('Error adding new board member:', error);
      return { success: false, error: error.message };
    }
  };

  // 删除董事会成员的接口函数
  const removeBoardMember = async (memberId) => {
    try {
      // 这里应该是实际的API调用
      // const response = await fetch(`/api/board-members/${memberId}`, {
      //   method: 'DELETE',
      // });
      
      // 模拟API调用成功
      console.log(`Removing board member ${memberId}`);
      
      setBoardMembers(prevMembers => 
        prevMembers.filter(member => member.id !== memberId)
      );
      setClubData(prevData => ({
        ...prevData,
        memberCount: prevData.memberCount - 1
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Error removing board member:', error);
      return { success: false, error: error.message };
    }
  };

  const handleAllMembersPress = () => {
    // 跳转回普通成员页面
    router.replace({
      pathname: '/board/council/club/Members',
      params: { clubID: clubId }
    });
  };

  const handleBoardMembersPress = () => {
    // 当前已在董事会成员页面，无需操作
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* 蓝色标题块 - 显示 Board Members */}

        {/* 添加董事会成员按钮
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddBoardMember}
        >
          <Text style={styles.addButtonText}>+ Add Board Members</Text>
        </TouchableOpacity> */}

        {/* 董事会成员列表 */}
        <View style={styles.membersContainer}>
          {boardMembers.map((member) => (
            <TouchableOpacity
              key={member.id}
              style={styles.memberItem}
              onPress={() => handleBoardMemberPress(member)}
            >
              <View style={[
                styles.memberNameContainer,
                member.position === 'President' && styles.presidentContainer
              ]}>
                <Text style={styles.memberName}>{member.name}</Text>
              </View>
              <View style={styles.positionBadge}>
                <Text style={styles.positionText}>{member.position}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* 底部导航栏 */}
            <View style={styles.bottomNav}>
              <TouchableOpacity
                style={[styles.navButton]}
                onPress={handleAllMembersPress}
              >
                <Text style={[styles.navText]}>All Members</Text>
              </TouchableOpacity>
      
              <TouchableOpacity
                style={[styles.navButton, styles.active]}
                onPress={handleBoardMembersPress}
              >
                <Text style={[styles.activeNavButtonText]}>Club Board Members</Text>
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
    paddingHorizontal: 20,
  },
  headerBlock: {
    marginTop: 30,
    backgroundColor: '#065395',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#065395',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#065395',
    fontSize: 16,
    fontWeight: '600',
  },
  membersContainer: {
    marginTop: 20,
  },
  memberItem: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  memberNameContainer: {
    backgroundColor: '#8A7D6A',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  presidentContainer: {
    backgroundColor: '#8A7D6A', // 统一使用棕色背景
  },
  memberName: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  positionBadge: {
    backgroundColor: '#A0A0A0',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  positionText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    backgroundColor: "#F1F6F5",
  },
  navButton: {
    justifyContent: "center",
    alignItems: "center",
    height: 70,
    borderTopEndRadius: 5,
    borderTopStartRadius: 5,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    backgroundColor: "#8A7D6A",
    flex: 1,
  },
  navText: {
    fontSize: 16,
    textAlign: "center",
    color: "white",
  },
  active: {
    backgroundColor: "#FFD347",
  },
  activeNavButtonText: {
    color: "black",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

export default CouncilClubBoardMemberPage;
