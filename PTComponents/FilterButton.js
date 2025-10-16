import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import Filter from "./Filter";

const FilterButton = (props) => {
  return (
    <TouchableOpacity onPress={props.onFilter} style={styles.filterButton}>
      <Text style={styles.filterText}>
        Filter <Filter />
      </Text>
    </TouchableOpacity>
  );
};

export default FilterButton;

const styles = StyleSheet.create({
  filterButton: {
    flex: 1,
    marginVertical: 10,
    padding: 5,
    borderRadius: 8,
    backgroundColor: "#065395",
    alignItems: "center",
    justifyContent: "center",
  },
  filterText: {
    color: "white",
    fontSize: 20,
  },
});
