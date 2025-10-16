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
        console.log(data);
        setProject(data);
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

  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text>Click a project number to provide feedback</Text>
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
          {/* Table Rows */}
          {uniqueProjects.map((row, index) => (
            <View key={index} style={styles.tableRow}>
              <TouchableOpacity
                onPress={() => {setVisible(true);setSelected(index+1);setSelectedID(uniqueProjects[index].project_id)}}
                style={styles.feedbackButton}
              >
                <Text style={styles.projectCell}>{index + 1}</Text>
              </TouchableOpacity>
              <Text style={styles.tableCell}>{row.project_title}</Text>
              <Text style={styles.tableCell}>
                {row.date_achieved ? (
                  new Date(row.date_achieved).toLocaleDateString()
                ) : (
                  <PTButton>Request</PTButton>
                )}
              </Text>
            </View>
          ))}
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
                <Text>{feedback}</Text>
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
    textAlignVertical:"top",
    marginVertical: 10,
    height:100,
    borderRadius: 5,
    borderColor: "#8A7D6A",
    borderWidth: 2,
  },
});
