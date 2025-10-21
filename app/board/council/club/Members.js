import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { useRouter, useLocalSearchParams } from "expo-router";
import axios from "axios";

const CouncilClubMemberPage = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const params = useLocalSearchParams();
  const clubId = params.clubID;

  // 状态管理
  const [selectedMonth, setSelectedMonth] = useState("Join Month");
  const [selectedYear, setSelectedYear] = useState("Join Year");
  const [activeTab, setActiveTab] = useState("all"); // 'all' 或 'board'
  const [clubData, setClubData] = useState({
    name: "Brisbane Central",
    memberCount: 0,
  });
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        console.log(clubId);
        const club = await axios.get(
          `${process.env.EXPO_PUBLIC_IP}/club/${clubId}`
        );

        console.log(club.data);

        // 获取该俱乐部成员用户ID

        const { data: boardIds } = await axios.get(
          `${process.env.EXPO_PUBLIC_IP}/clubBoard/${clubId}`
        );
        console.log("test");

        // 根据用户ID获取个人信息

        const memberList = await Promise.all(
          (boardIds || []).map(async (item) => {
            const uid =
              item.User_id ??
              item.user_id ??
              item.member_id ??
              item.UserId ??
              item.id;
            if (uid == null) return null;
            try {
              const memberRes = await axios.get(
                `${process.env.EXPO_PUBLIC_IP}/clubBoardMembers/${uid}`
              );
              const m = memberRes.data?.[0] || {};
              const fullName =
                [m.first_name, m.last_name].filter(Boolean).join(" ") ||
                "Unknown";
              const joinDateStr = m.join_date
                ? new Date(m.join_date).toLocaleDateString("en-GB")
                : "Not provided";
              const paid = Boolean(m.paid);
              return {
                id: m.user_id ?? uid,
                name: fullName,
                paid,
                joinDate: joinDateStr,
                paidUntilDate: m.paid_until
                  ? new Date(m.paid_until).toLocaleDateString("en-GB")
                  : "Not provided",
              };
            } catch (innerErr) {
              console.log("Fetch member detail failed:", innerErr);
              return null;
            }
          })
        );

        const cleaned = memberList.filter(Boolean);
        setClubData({ name: club.data.club_name, memberCount: cleaned.length });
        setMembers(cleaned);
        setFilteredMembers(cleaned);
      } catch (error) {
        console.error("Error loading club members:", error);
        setMembers([]);
        setFilteredMembers([]);
        setClubData({ name: clubName, memberCount: 0 });
      }
    };

    loadMembers();
  }, [params.clubName]);

  //  Date
  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split("/");
    return new Date(year, month - 1, day); // month - 1 因为 JavaScript 月份从 0 开始
  };

  // 获取月份名称
  const getMonthName = (monthNumber) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[monthNumber - 1];
  };

  useEffect(() => {
    let filtered = [...members];

    if (selectedMonth !== "Join Month") {
      filtered = filtered.filter((member) => {
        const joinDate = parseDate(member.joinDate);
        const memberMonth = getMonthName(joinDate.getMonth() + 1);
        return memberMonth === selectedMonth;
      });
    }

    if (selectedYear !== "Join Year") {
      filtered = filtered.filter((member) => {
        const joinDate = parseDate(member.joinDate);
        return joinDate.getFullYear().toString() === selectedYear;
      });
    }

    setFilteredMembers(filtered);

    // 更新显示的成员数量
    setClubData((prev) => ({
      ...prev,
      memberCount: filtered.length,
    }));
  }, [selectedMonth, selectedYear, members]);

  const handleBackPress = () => {
    // 返回到 Clubs 页面
    console.log("Back button pressed - returning to clubs page");
    try {
      router.navigate("/councilsclubspage");
    } catch (error) {
      console.log("Navigation error:", error);
      // 如果导航失败，尝试其他方式
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  };

  const handleMemberPress = (member) => {
    console.log(`Member ${member.name} pressed`);
    // 跳转到成员详情页面并传递成员信息
    router.navigate({
      pathname: "/councilmemberdetails",
      params: {
        memberId: member.id.toString(),
        memberName: member.name,
      },
    });
  };

  const handleAllMembersPress = () => {
    setActiveTab("all");
    // 如果需要跳转到不同页面，可以添加导航逻辑
    // router.navigate('/councilclubmemberpage');
  };

  const handleBoardMembersPress = () => {
    setActiveTab("board");
    // 跳转到董事会成员页面并传递俱乐部信息
    router.replace({
      pathname: "/board/council/club/boardMembers",
      params: { clubID: clubId },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.headerBlock}>
          <Text style={styles.headerText}>
            {clubData.name} ({clubData.memberCount} mbrs)
          </Text>
        </View>

        <View style={styles.sortingRow}>
          <Picker
            selectedValue={selectedMonth}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedMonth(itemValue)}
          >
            <Picker.Item label="Join Month" value="Join Month" />
            <Picker.Item label="January" value="January" />
            <Picker.Item label="February" value="February" />
            <Picker.Item label="March" value="March" />
            <Picker.Item label="April" value="April" />
            <Picker.Item label="May" value="May" />
            <Picker.Item label="June" value="June" />
            <Picker.Item label="July" value="July" />
            <Picker.Item label="August" value="August" />
            <Picker.Item label="September" value="September" />
            <Picker.Item label="October" value="October" />
            <Picker.Item label="November" value="November" />
            <Picker.Item label="December" value="December" />
          </Picker>

          <Picker
            selectedValue={selectedYear}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedYear(itemValue)}
          >
            <Picker.Item label="Join Year" value="Join Year" />
            <Picker.Item label="2024" value="2024" />
            <Picker.Item label="2023" value="2023" />
            <Picker.Item label="2022" value="2022" />
            <Picker.Item label="2021" value="2021" />
            <Picker.Item label="2020" value="2020" />
            <Picker.Item label="2019" value="2019" />
            <Picker.Item label="2018" value="2018" />
          </Picker>
        </View>

        <View style={styles.membersContainer}>
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <View key={member.id} style={styles.memberItem}>
                <TouchableOpacity
                  style={styles.memberNameContainer}
                  onPress={() => handleMemberPress(member)}
                >
                  <Text style={styles.memberName}>{member.name}</Text>
                </TouchableOpacity>
                <View
                  style={[
                    styles.statusBadge,
                    member.paid ? styles.paidBadge : styles.notPaidBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      member.paid ? styles.paidText : styles.notPaidText,
                    ]}
                  >
                    {member.paid ? "Paid" : "Not Paid"}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>
                No members found for the selected criteria
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 底部导航栏 */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navButton, styles.active]}
          onPress={handleAllMembersPress}
        >
          <Text style={[styles.activeNavButtonText]}>All Members</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton]}
          onPress={handleBoardMembersPress}
        >
          <Text style={[styles.navText]}>Club Board Members</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    flex: 1,
  },
  sortingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 10,
  },
  picker: {
    flex: 1,
  },
  noResultsContainer: {
    padding: 40,
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
  },
  membersContainer: {
    marginTop: 20,
  },
  memberItem: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
  },
  memberNameContainer: {
    backgroundColor: "#8A7D6A",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  memberName: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
  },
  statusBadge: {
    backgroundColor: "#A0A0A0",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 120,
    alignItems: "center",
  },
  paidBadge: {
    backgroundColor: "#A0A0A0", // 灰色背景
  },
  notPaidBadge: {
    backgroundColor: "#A0A0A0", // 灰色背景
  },
  statusText: {
    fontSize: 14,
    color: "#ffffff",
    fontWeight: "600",
  },
  paidText: {
    color: "#ffffff", // 白色文字
  },
  notPaidText: {
    color: "#ffffff", // 白色文字
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

export default CouncilClubMemberPage;
