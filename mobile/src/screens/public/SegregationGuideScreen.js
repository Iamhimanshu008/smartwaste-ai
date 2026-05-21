import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../config';

const categories = [
  {
    id: 1,
    color: "#22c55e",
    bgColor: "#dcfce7",
    icon: <MaterialCommunityIcons name="leaf" size={32} color="#22c55e" />,
    title: "Wet Waste (Gila Kachra)",
    subtitle: "Green Dustbin mein daalein",
    examples: ["Sabzi ke chilke", "Khana bcha hua", "Chai patti", "Phool patte"],
    tip: "Composting ke liye best!"
  },
  {
    id: 2,
    color: "#3b82f6",
    bgColor: "#dbeafe", 
    icon: <MaterialCommunityIcons name="recycle" size={32} color="#3b82f6" />,
    title: "Dry Waste (Sukha Kachra)",
    subtitle: "Blue Dustbin mein daalein",
    examples: ["Plastic bottles", "Paper", "Cardboard", "Metal cans"],
    tip: "Recycle ho sakta hai!"
  },
  {
    id: 3,
    color: "#ef4444",
    bgColor: "#fee2e2",
    icon: <MaterialCommunityIcons name="alert-circle-outline" size={32} color="#ef4444" />,
    title: "Hazardous Waste (Khatarnak)",
    subtitle: "Red Dustbin mein daalein",
    examples: ["Batteries", "Medicines", "Paint", "Chemicals"],
    tip: "Kabhi mix mat karein!"
  },
  {
    id: 4,
    color: "#f59e0b",
    bgColor: "#fef3c7",
    icon: <MaterialCommunityIcons name="monitor-cellphone" size={32} color="#f59e0b" />,
    title: "E-Waste (Electronic)",
    subtitle: "Special collection point",
    examples: ["Mobile phones", "Chargers", "Bulbs", "Remote"],
    tip: "Special disposal zaroori!"
  },
];

export default function SegregationGuideScreen() {
    const [expandedId, setExpandedId] = useState(null);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.headerTitle}>Waste Segregation Guide</Text>
            <Text style={styles.headerSubtitle}>Kachra alag karna seekhein aur environment ko bachayein.</Text>

            {categories.map((cat) => {
                const isExpanded = expandedId === cat.id;
                return (
                    <TouchableOpacity 
                        key={cat.id} 
                        style={[styles.card, { backgroundColor: cat.bgColor, borderColor: cat.color }]}
                        onPress={() => toggleExpand(cat.id)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.cardHeader}>
                            <View style={{ marginRight: 15 }}>{cat.icon}</View>
                            <View style={styles.cardHeaderText}>
                                <Text style={[styles.cardTitle, { color: cat.color }]}>{cat.title}</Text>
                                <Text style={styles.cardSubtitle}>{cat.subtitle}</Text>
                            </View>
                            <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
                        </View>

                        {isExpanded && (
                            <View style={styles.expandedContent}>
                                <View style={styles.divider} />
                                <Text style={styles.examplesTitle}>Examples:</Text>
                                <View style={styles.examplesList}>
                                    {cat.examples.map((ex, i) => (
                                        <View key={i} style={styles.exampleItem}>
                                            <Text style={[styles.bullet, { color: cat.color }]}>•</Text>
                                            <Text style={styles.exampleText}>{ex}</Text>
                                        </View>
                                    ))}
                                </View>
                                <View style={[styles.tipBox, { backgroundColor: cat.color + '20' }]}>
                                    <View style={{ marginRight: 8 }}>
                                        <MaterialCommunityIcons name="lightbulb-on-outline" size={16} color={cat.color} />
                                    </View>
                                    <Text style={[styles.tipText, { color: cat.color }]}>{cat.tip}</Text>
                                </View>
                            </View>
                        )}
                    </TouchableOpacity>
                );
            })}

            <View style={styles.quickTips}>
                <Text style={styles.quickTipsTitle}>Quick Tips</Text>
                <Text style={styles.quickTipsText}>• Always keep wet and dry waste in separate bins.</Text>
                <Text style={styles.quickTipsText}>• Rinse plastic containers before discarding.</Text>
                <Text style={styles.quickTipsText}>• Never mix hazardous waste with regular trash.</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    content: { padding: 20, paddingBottom: 40 },
    headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.dark, marginBottom: 5 },
    headerSubtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
    card: {
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    emoji: { fontSize: 32, marginRight: 15 },
    cardHeaderText: { flex: 1 },
    cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
    cardSubtitle: { fontSize: 13, color: '#555' },
    expandIcon: { fontSize: 16, color: '#888', marginLeft: 10 },
    expandedContent: { marginTop: 10 },
    divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginVertical: 10 },
    examplesTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 5 },
    examplesList: { marginBottom: 10 },
    exampleItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
    bullet: { fontSize: 18, marginRight: 8, fontWeight: 'bold' },
    exampleText: { fontSize: 14, color: '#444' },
    tipBox: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 8, marginTop: 5 },
    tipIcon: { fontSize: 16, marginRight: 8 },
    tipText: { fontSize: 13, fontWeight: '600', flex: 1 },
    quickTips: { marginTop: 20, backgroundColor: '#fff', padding: 16, borderRadius: 12 },
    quickTipsTitle: { fontSize: 16, fontWeight: '700', color: COLORS.dark, marginBottom: 10 },
    quickTipsText: { fontSize: 13, color: '#555', marginBottom: 5, lineHeight: 20 },
});
