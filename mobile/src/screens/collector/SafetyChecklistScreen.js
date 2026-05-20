import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../config';

const CHECKLIST_ITEMS = [
  { id: 1, icon: <MaterialCommunityIcons name="hand-extended-outline" size={24} color="#16a34a" />, text: "Wearing gloves", category: "PPE" },
  { id: 2, icon: <MaterialCommunityIcons name="face-mask-outline" size={24} color="#16a34a" />, text: "Wearing mask", category: "PPE" },
  { id: 3, icon: <MaterialCommunityIcons name="shoe-formal" size={24} color="#16a34a" />, text: "Safety boots on", category: "PPE" },
  { id: 4, icon: <MaterialCommunityIcons name="safety-goggles" size={24} color="#16a34a" />, text: "Wearing reflective jacket", category: "PPE" },
  { id: 5, icon: <MaterialCommunityIcons name="truck-check-outline" size={24} color="#16a34a" />, text: "Vehicle checked", category: "Vehicle" },
  { id: 6, icon: <MaterialCommunityIcons name="gas-station-outline" size={24} color="#16a34a" />, text: "Fuel checked", category: "Vehicle" },
  { id: 7, icon: <MaterialCommunityIcons name="cellphone-check" size={24} color="#16a34a" />, text: "Logged into app", category: "Digital" },
  { id: 8, icon: <MaterialCommunityIcons name="map-check-outline" size={24} color="#16a34a" />, text: "Today's route reviewed", category: "Digital" },
  { id: 9, icon: <MaterialCommunityIcons name="water-outline" size={24} color="#16a34a" />, text: "Water bottle taken", category: "Personal" },
  { id: 10, icon: <MaterialCommunityIcons name="phone-check-outline" size={24} color="#16a34a" />, text: "Emergency contact saved", category: "Personal" },
];

export default function SafetyChecklistScreen({ navigation }) {
    const [checkedItems, setCheckedItems] = useState([]);

    useEffect(() => {
        loadChecklistState();
    }, []);

    const loadChecklistState = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const storedStateStr = await AsyncStorage.getItem('@safety_checklist');
            if (storedStateStr) {
                const storedState = JSON.parse(storedStateStr);
                if (storedState.date === today) {
                    setCheckedItems(storedState.checkedItems || []);
                } else {
                    // Reset for new day
                    await AsyncStorage.removeItem('@safety_checklist');
                }
            }
        } catch (error) {
            console.error('Error loading checklist state', error);
        }
    };

    const saveChecklistState = async (newCheckedItems) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            await AsyncStorage.setItem('@safety_checklist', JSON.stringify({
                date: today,
                checkedItems: newCheckedItems
            }));
        } catch (error) {
            console.error('Error saving checklist state', error);
        }
    };

    const toggleItem = (id) => {
        let newCheckedItems;
        if (checkedItems.includes(id)) {
            newCheckedItems = checkedItems.filter(itemId => itemId !== id);
        } else {
            newCheckedItems = [...checkedItems, id];
        }
        setCheckedItems(newCheckedItems);
        saveChecklistState(newCheckedItems);
    };

    const handleStart = () => {
        navigation.goBack();
    };

    const progress = checkedItems.length / CHECKLIST_ITEMS.length;
    const allChecked = checkedItems.length === CHECKLIST_ITEMS.length;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
                </TouchableOpacity>
                <Text style={styles.title}>Safety Checklist</Text>
            </View>

            <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                    <Text style={styles.progressText}>Progress</Text>
                    <Text style={styles.progressCount}>{checkedItems.length}/10</Text>
                </View>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.listContainer}>
                {allChecked && (
                    <View style={styles.successMessage}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
                            <Text style={styles.successText}>All safe for today!</Text>
                        </View>
                    </View>
                )}

                {CHECKLIST_ITEMS.map((item) => {
                    const isChecked = checkedItems.includes(item.id);
                    return (
                        <TouchableOpacity 
                            key={item.id} 
                            style={[styles.itemCard, isChecked && styles.itemCardChecked]}
                            onPress={() => toggleItem(item.id)}
                        >
                            <View style={styles.itemIconContainer}>
                                {item.icon}
                            </View>
                            <Text style={[styles.itemText, isChecked && styles.itemTextChecked]}>
                                {item.text}
                            </Text>
                            {isChecked ? (
                                <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
                            ) : (
                                <Ionicons name="ellipse-outline" size={24} color="#d1d5db" />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.startBtn, !allChecked && styles.startBtnDisabled]}
                    onPress={handleStart}
                    disabled={!allChecked}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Ionicons name="play-circle-outline" size={20} color="#fff" />
                        <Text style={styles.startBtnText}>Start Work</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 10 },
    backBtn: { marginRight: 15 },
    title: { fontSize: 22, fontWeight: '800', color: COLORS.dark },
    progressContainer: { paddingHorizontal: 20, marginBottom: 15 },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressText: { fontSize: 14, fontWeight: '600', color: '#666' },
    progressCount: { fontSize: 14, fontWeight: '800', color: COLORS.dark },
    progressBarBg: { height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', backgroundColor: COLORS.light },
    listContainer: { padding: 20, paddingBottom: 40 },
    successMessage: { backgroundColor: '#dcfce7', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
    successText: { color: '#16a34a', fontSize: 18, fontWeight: '700' },
    itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    itemCardChecked: { backgroundColor: '#f8fafc' },
    itemIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    itemText: { flex: 1, fontSize: 15, fontWeight: '600', color: '#334155' },
    itemTextChecked: { color: '#94a3b8', textDecorationLine: 'line-through' },
    footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    startBtn: { backgroundColor: '#16a34a', paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
    startBtnDisabled: { backgroundColor: '#cbd5e1' },
    startBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
