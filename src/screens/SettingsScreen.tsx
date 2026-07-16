import React from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import { AppSettings } from "../hooks/useSettings";

interface SettingsScreenProps {
  settings: AppSettings;
  onUpdate: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
}

export function SettingsScreen({ settings, onUpdate }: SettingsScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Camera</Text>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Auto-lookup</Text>
            <Text style={styles.rowSubtitle}>
              Automatically identify the house you're pointing at after 5 seconds
            </Text>
          </View>
          <Switch
            value={settings.autoLookup}
            onValueChange={(v) => onUpdate("autoLookup", v)}
            trackColor={{ true: "#4A90D9" }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f7",
  },
  section: {
    marginTop: 32,
    backgroundColor: "#fff",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#c6c6c8",
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6d6d72",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "#c6c6c8",
    gap: 16,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    color: "#000",
  },
  rowSubtitle: {
    fontSize: 13,
    color: "#6d6d72",
    marginTop: 2,
    lineHeight: 18,
  },
});
