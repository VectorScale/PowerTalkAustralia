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
import BottomNav from './components/BottomNav';

import { useNavigation, useRoute } from "@react-navigation/native";
import PTHeader from "./components/PTHeader";
import { Picker } from "@react-native-picker/picker";
import MultiSelect from "react-native-multiple-select";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";


function generateShortId(length) {
  let id = "";
  for (let i = 0; i < length + 1; i++) {
    id += Math.floor(Math.random() * 10); // 0–9
  }
  return Number(id);
}
const ProjectLevelDetailPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [levels, setlevel]= useState("");
  const [members, setMember]= useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectTitles, setProjectTitles] = useState([]); 
    const [selected, setSelected] = useState([]);
   const [project, setProject]= useState([]);
   process.env.EXPO_PUBLIC_IP;
  
   useEffect(() => {
    (async () => {
      try {
        const level = await AsyncStorage.getItem("level");
                const id= await AsyncStorage.getItem("id");

        if(level && id){
            const {data}= await axios.get(`${process.env.EXPO_PUBLIC_IP}:8081/projectss/${id}/${level}`);
            setProject(data);
            console.log(project);
        }
        
        
        if (level) {
          setlevel(level);
        }
      } catch (error) {
        console.error("Error fetching userId from storage:", error);
        Alert.alert("Error", "Failed to load user ID");
      }
    })();
  }, []);
const memberss= members.filter((p)=> p != undefined)
console.log(memberss)
  console.log(projectTitles);
  console.log(selected);


   const handleProjectDetails = async (projectId)=>{
    try {
      await AsyncStorage.setItem("projectId", projectId);
      router.push("./members_projectLevels_name_details");
    } catch (error) {
      console.error("Error saving meeting_id:", error);
    }
   }
 const uniqueProjects = project.filter(
  (p, index, self) =>
    index === self.findIndex((q) => q.project_number === p.project_number)
);

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <PTHeader button={true} text={"Profile"} link={"profile"} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.headerBlock}>
          <Text style={styles.headerText}>Level {levels} Project</Text>
        </View>
        
        <View style={{ height: 30 }} />

      

        {/* Project List */}
        {uniqueProjects.map((projects, index) => (
          <TouchableOpacity
            key={index}
            style={styles.projectButton}
            onPress={() =>
             
             handleProjectDetails(projects.assignment_id) }
          >
            <Text style={styles.buttonText}>{projects.project_number}</Text>
          </TouchableOpacity>
        ))} 
      </ScrollView>

      {/* Bottom Navigation */}
            <BottomNav active={3}/>

      {/* Modal */}
     
    </View>
  );
};

export default ProjectLevelDetailPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    resizeMode:'contain'
  },
  modalBox: {
    margin: 30,
    backgroundColor: "white",
    borderRadius: 10,
    padding:100
  },
  add:{
       alignItems:'center',
      backgroundColor:'blue',
          marginBottom:10,
          padding:20,
          marginTop:10,
  },
  content: {
    paddingHorizontal: 20,
    alignItems: "center",
    paddingBottom: 40,
  },
  headerBlock: {
    marginTop: 30,
    backgroundColor: "#065395",
    paddingVertical: 30,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
  projectButton: {
    backgroundColor: "#8A7D6A",
    width: "100%",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "600",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#F1F6F5",
    paddingVertical: 15,
  },
  navButton: {
    fontSize: 16,
    color: "#333",
  },
  activeButton: {
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    flex:1,
  },
  addButton: {
    marginBottom: 20,
    padding: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  removeButton: {
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
  },
});
