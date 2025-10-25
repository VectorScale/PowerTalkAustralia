import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import PTButton from "@/PTComponents/Button";
import axios from "axios";

import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";

const ProjectDetailPage = () => {
  const nav = useNavigation();
  const local = useLocalSearchParams();
  const projectUserID = +local.projectUserID;
  const projectLevel = +local.projectLevel;
  const [projectRows, setProject] = useState([]);

  const [showFeedback, setVisible] = useState(false);
  const [selectedProject, setSelected] = useState(0);
  const [selectedProjectID, setSelectedID] = useState(0);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const payload = {
          program_level: projectLevel,
          user_id: projectUserID,
        };
        const { data } = await axios.post(
          `${process.env.EXPO_PUBLIC_IP}/projects/`,
          payload
        );
        if (data.status == 200){
        setProject(data);}
        else {
          Alert.alert("No Projects", "Please Contact Support");
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        Alert.alert("Error", "Failed to load projects");
      }
    })();
  }, [projectLevel, projectUserID]);

  useEffect(() => {
    nav.setOptions({
      headerShown: true,
      title: `Project Level: ${projectLevel}`,
    });
  }, []);

  const uniqueProjects = projectRows.filter(
    (p, index, self) =>
      index === self.findIndex((q) => q.project_title === p.project_title)
  );

  // Function to render table rows with conditional breaks
  const renderTableRows = () => {
    const rows = [];
    let rowIndex = 0;

    if (projectLevel === 3) {
      // For level 3: break after 9 rows
      for (let i = 0; i < uniqueProjects.length; i++) {
        rows.push(
          <View key={i} style={styles.tableRow}>
            <TouchableOpacity
              onPress={() => { setVisible(true); setSelected(i + 1); setSelectedID(uniqueProjects[i].project_id) }}
              style={styles.feedbackButton}
            >
              <Text style={styles.projectCell}>{i + 1}</Text>
            </TouchableOpacity>
            <Text style={styles.tableCell}>{uniqueProjects[i].project_title}</Text>
            <Text style={styles.tableCell}>
              {uniqueProjects[i].date_achieved ? (
                new Date(uniqueProjects[i].date_achieved).toLocaleDateString()
              ) : (
                <PTButton onPress={() => handleRequest(uniqueProjects[i].project_id)}>Request</PTButton>
              )}
            </Text>
          </View>
        );

        // Insert break text after 9 rows
        if (i === 8) {
          rows.push(
            <View key="break-3" style={styles.breakContainer}>
              <Text style={styles.breakText}>Plus any six of the following speeches</Text>
            </View>
          );
        }
      }
    } else if (projectLevel === 4.1) {
      // For level 4.1: break after 3 rows and then after 5 more rows
      for (let i = 0; i < uniqueProjects.length; i++) {
        rows.push(
          <View key={i} style={styles.tableRow}>
            <TouchableOpacity
              onPress={() => { setVisible(true); setSelected(i + 1); setSelectedID(uniqueProjects[i].project_id) }}
              style={styles.feedbackButton}
            >
              <Text style={styles.projectCell}>{i + 1}</Text>
            </TouchableOpacity>
            <Text style={styles.tableCell}>{uniqueProjects[i].project_title}</Text>
            <Text style={styles.tableCell}>
              {uniqueProjects[i].date_achieved ? (
                new Date(uniqueProjects[i].date_achieved).toLocaleDateString()
              ) : (
                <PTButton onPress={() => handleRequest(uniqueProjects[i].project_id)}>Request</PTButton>
              )}
            </Text>
          </View>
        );

        // Insert first break text after 3 rows
        if (i === 2) {
          rows.push(
            <View key="break-4.1-first" style={styles.breakContainer}>
              <Text style={styles.breakText}>Any three of the following Interpretive reading projects may be presented for level 4 - Leading Trainer Project 4 Interpretive Reading</Text>
            </View>
          );
        }
        
        // Insert second break text after 8 rows (3 + 5)
        if (i === 7) {
          rows.push(
            <View key="break-4.1-second" style={styles.breakContainer}>
              <Text style={styles.breakText}>An additional optional assignments for Level Leading Trainer</Text>
            </View>
          );
        }
      }
    } else {
      // For other levels, render normally without breaks
      return uniqueProjects.map((row, index) => (
        <View key={index} style={styles.tableRow}>
          <TouchableOpacity
            onPress={() => { setVisible(true); setSelected(index + 1); setSelectedID(uniqueProjects[index].project_id) }}
            style={styles.feedbackButton}
          >
            <Text style={styles.projectCell}>{index + 1}</Text>
          </TouchableOpacity>
          <Text style={styles.tableCell}>{row.project_title}</Text>
          <Text style={styles.tableCell}>
            {row.date_achieved ? (
              new Date(row.date_achieved).toLocaleDateString()
            ) : (
              <PTButton onPress={() => handleRequest(row.project_id)}>Request</PTButton>
            )}
          </Text>
        </View>
      ));
    }

    return rows;
  };

  const handleFeedback = async () => {
    let recipient_id = projectUserID;
    let project_id = selectedProjectID;

    const payload = {
      recipient_id,
      project_id,
      feedback,
    };
    try {
      await axios.post(`${process.env.EXPO_PUBLIC_IP}/projects/sendFeedback`, payload);
      Alert.alert("Success", "Feedback Sent");
      setVisible(false);
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Feedback failed to send");
    }
  };

  const handleRequest = async (projectId) => {
    const payload = {
      project_id: projectId,
      club_id: null,
    };
    console.log(payload);
    try {
      const sentRequest = await axios.post(`${process.env.EXPO_PUBLIC_IP}/request-project`, payload);
      if (sentRequest.status == 201) {
        Alert.alert("Error", "Request Already Sent");
      } else {
        Alert.alert("Success", "Request Sent");
      }
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Request failed to send");
    }
  };

  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={{flex:1,textAlign:"center",margin:5, fontSize:15}}>Click a project number to provide feedback</Text>
          {/* Table Header */}
          <View style={styles.tableRowHeader}>
            <Text style={[styles.projectCell, styles.tableHeaderText]}>#</Text>
            <Text style={[styles.tableCell, styles.tableHeaderText]}>
              Project Title
            </Text>
            <Text style={[styles.tableCell, styles.tableHeaderText]}>
              Date Completed
            </Text>
          </View>
          {/* Table Rows with conditional breaks */}
          {renderTableRows()}
        </ScrollView>

        <Modal
          visible={showFeedback}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSharing(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>
                Send Feedback about Project # {selectedProject}
              </Text>
              <View style={styles.content}>
                <TextInput
                  style={styles.feedbackInput}
                  multiline={true}
                  numberOfLines={5}
                  onChangeText={text => setFeedback(text)}
                  value={feedback}
                />
              </View>
              <View style={styles.modalFunction}>
                <PTButton onPress={() => setVisible(false)}>Cancel</PTButton>
                <PTButton onPress={() => handleFeedback()}>
                  Send Feedback
                </PTButton>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

export default ProjectDetailPage;

const styles = StyleSheet.create({
  background: {
    backgroundColor: "#F1F6F5",
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 10,
    margin: 10,
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },
  content: {
    paddingHorizontal: 5,
  },
  tableRowHeader: {
    flexDirection: "row",
    backgroundColor: "#8A7D6A",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 8,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  tableCell: {
    flex: 3,
    color: "#333",
    fontSize: 14,
    paddingHorizontal: 5,
  },
  projectCell: {
    flex: 1,
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  feedbackButton: {
    flex: 1,
    width: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#8A7D6A",
    padding: 10,
    borderRadius: 8,
  },
  tableHeaderText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "center",
  },
  modalBackground: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    flexDirection: "row",
    justifyContent: "center",
    flex: 1,
  },
  modalView: {
    alignSelf: "center",
    borderRadius: 25,
    backgroundColor: "#F1F6F5",
    maxWidth: "90%",
  },
  modalFunction: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  modalTitle: {
    padding: 10,
    alignItems: "center",
    backgroundColor: "#8A7D6A",
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20, //iOS and android use different words to set specific border radii
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },
  feedbackInput: {
    textAlignVertical: "top",
    marginVertical: 10,
    height: 100,
    borderRadius: 5,
    borderColor: "#8A7D6A",
    borderWidth: 2,
  },
  // New styles for break containers
  breakContainer: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: "#f8f8f8",
    borderLeftWidth: 3,
    borderLeftColor: "#8A7D6A",
    marginVertical: 10,
    borderRadius: 5,
  },
  breakText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
    fontStyle: "italic",
  },
});