import React, { useState, useEffect} from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Button,
  Alert
} from "react-native";
import axios from "axios";

import { useNavigation, useRoute } from "@react-navigation/native";
import PTHeader from "@/PTComponents/Header";
import { Picker } from "@react-native-picker/picker";
import MultiSelect from "react-native-multiple-select";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const ProjectDetailPage = () => {
  const navigation = useNavigation();
  const route = useRoute();

  //const { projectName } = route.params;

  
     const [projectRows, setProject]= useState([]);
     const [name, setName] = useState("");
 useEffect(() => {
    (async () => {
      try {
        const projectid = await AsyncStorage.getItem("projectId");
        if(projectid){
            const {data}= await axios.get(`http://10.88.48.249:8081/projects/${projectid}`);
            setProject(data);
            setName(data[0].project_number)
        }
        
        
      } catch (error) {
        console.error("Error fetching userId from storage:", error);
        Alert.alert("Error", "Failed to load user ID");
      }
    })();
  }, []);
   const uniqueProjects = projectRows.filter(
  (p, index, self) =>
    index === self.findIndex((q) => q.project_title === p.project_title)
);
  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <PTHeader button={true} text={'Profile'} link={'profile'}/>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Project Title Block */}
      <View style={styles.headerBlock}>
          <Text style={styles.headerText}>{name}</Text>
        </View>

        {/* Spacer */}
        <View style={{ height: 20 }} />

        {/* Table Header */}
        <View style={styles.tableRowHeader}>
          <Text style={[styles.tableCell, styles.tableHeaderText]}>Project</Text>
          <Text style={[styles.tableCell, styles.tableHeaderText]}>Project Title</Text>
          <Text style={[styles.tableCell, styles.tableHeaderText]}>Date Completed</Text>
        </View>

        {/* Table Rows */}
        {uniqueProjects.map((row, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCell}>{index+1}</Text>
            <Text style={styles.tableCell}>{row.project_title}</Text>
            <Text style={styles.tableCell}>{row.date}</Text>
          </View>
        ))}
      </ScrollView>

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
      </View>      </View>
  );
};

export default ProjectDetailPage;

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
    paddingBottom: 40,
  },
  headerBlock: {
    marginTop: 30,
    backgroundColor: '#065395',
    paddingVertical: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  tableRowHeader: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: '#8A7D6A',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tableCell: {
    flex: 1,
    color: '#333',
    fontSize: 14,
  },
  tableHeaderText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
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
