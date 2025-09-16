import React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

function Nav (props) {
  const router = useRouter();
  if (props.active){
    return <TouchableOpacity
        style={styles.navButton}
        onPress={() =>
          router.replace({
            pathname: `/${props.link}`,
          })
        }
      >
        <Text style={styles.navText}>{props.name}</Text>
      </TouchableOpacity>;
  }
  return <View style={styles.active}><Text style={styles.activeText}>{props.name}</Text></View>
  
  ;
}

const BottomNav = (props) => {
  return (
    <View style={styles.bottomNav}>
      <Nav name={'Club Members'} link={'club/members'} active={props.active!=1}/>
      <Nav name={'Meetings'} link={'club/meetings'} active={props.active!=2}/>
      <Nav name={'Projects'} link={'members_projectLevels'} active={props.active!=3}/>
    </View>
  );
};

export default BottomNav;

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    backgroundColor: "#F1F6F5",
  },
  navButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    backgroundColor: '#FFD347',
    flex: 1,
  },
  navText: {
    fontSize: 16,
    color: "#333",
  },
  active: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    backgroundColor: '#ffc300',
    flex:1,
  },
  activeText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
