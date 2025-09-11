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
        if(level){
            const {data}= await axios.get(`http://10.88.48.249:8081/project/${level}`);
            setProject(data);
            console.log(project);
        }
        
        const id= await AsyncStorage.getItem("id");
        console.log(id);
        if(id){
        const { data }= await axios.get(`http://10.88.48.249:8081/clubBoard/${id}`);
        const memberlist= data.member_id || [];
      
        const MemberDetails = await Promise.all(
          data.map(async (item) => {
            const get = await axios.get(`http://10.88.48.249:8081/clubAccess/${item.member_id}`);
            if(get.data==""){
            const res = await axios.get(
              `http://10.88.48.249:8081/user/${item.member_id}`
            );
            const MemberNames =
              res.data[0].first_name + " " + res.data[0].last_name;
            const id = res.data[0].user_id;
            return{
              MemberNames,
              id
            }}
          })
        )
        setMember(MemberDetails);
        console.log(members);
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
const addProject = async () => {
  const ids = generateShortId(6);
  try {
    await axios.post(
      `http://10.88.48.249:8081/project/add`,
      {
        assignment_id: ids.toString().trim(),
        member_id: selected, 
        project_number: projectName.trim(),
        project_title: projectTitles,
        project_level: levels,
      }
    );
    Alert.alert("Success", "Project added successfully!");
    setModalVisible(false);
  } catch (error) {
    console.error("Error adding project:", error);
    Alert.alert("Error", "Failed to add project");
  }
};
  // Update a specific title
  const handleTitleChange = (text, index) => {
    const updated = [...projectTitles];
    updated[index] = text;
    setProjectTitles(updated);
  };

  // Add new title field
  const addProjectField = () => {
    setProjectTitles([...projectTitles, ""]);
  };

  // Remove a title field
  const removeProjectField = (index) => {
    const updated = projectTitles.filter((_, i) => i !== index);
    setProjectTitles(updated);
  };

   const handleProjectDetails = async (projectId)=>{
    try {
      await AsyncStorage.setItem("projectId", projectId);
      router.push("./projectdetailspage");
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

        {/* Add Project Button */}
        <TouchableOpacity
          style={styles.Add}
          onPress={() => setModalVisible(true)}
        >
          <Text style={{ color: "blue", fontSize: 16 }}>
            + Add Project details
          </Text>
        </TouchableOpacity>

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
      </View>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <ScrollView style={styles.modalBox}>
            {/* Project Name */}
            <View><Text style={{marginBottom:10, fontWeight:'bold'}} >Your Project Name: </Text>
                <TextInput
              placeholder="Project Name"
              value={projectName}
              onChangeText={setProjectName}
              style={styles.input}
            />

            </View>
            
            {/* Multiple Project Titles */}
            <View><Text style={{marginBottom:10, fontWeight:'bold'}}> Your project titles: </Text>
            {projectTitles.map((title, index) => (
              <View key={index} style={styles.inputRow}>
                <TextInput
                  placeholder={`Project ${index + 1}`}
                  value={title}
                  onChangeText={(text) => handleTitleChange(text, index)}
                  style={styles.input}
                />
                {index > 0 && (
                  <TouchableOpacity
                    onPress={() => removeProjectField(index)}
                    style={styles.removeButton}
                  >
                    <Text style={{ color: "red", fontWeight: "bold" }}>X</Text>
                  </TouchableOpacity>
                )}
              </View>

            ))}

            <View>

               <TouchableOpacity onPress={addProjectField} style={styles.addButton}>
              <Text style={{ color: "blue" }}>+ Add Project Title</Text>
            </TouchableOpacity>
<MultiSelect
      items={memberss}
      uniqueKey="id"
      onSelectedItemsChange={setSelected}
      selectedItems={selected}
      selectText="Pick Members"
      searchInputPlaceholderText="Search Members..."
      tagRemoveIconColor="#c73333ff"
      tagBorderColor="#c9b04bff"
      tagTextColor="#2c9cccff"
      selectedItemTextColor="#3991c7ff"
      selectedItemIconColor="#389fc8ff"
      itemTextColor="#000"
      displayKey="MemberNames"
      submitButtonColor="#e7cb32ff"
      submitButtonText="Confirm"

    />            </View>
            </View>
            

            {/* Add more project field */}
           

            {/* Close Modal */}
            <TouchableOpacity  style={styles.add} onPress={addProject}><Text style={{color:"white", fontWeight:"bold"}} > Add Project</Text></TouchableOpacity>
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </ScrollView>
        </View>
      </Modal>
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
