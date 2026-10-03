import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Work = {
  id: string;
  title: string;
  composer: string;
  language: string;
  progress: number;
};

const featuredWorks: Work[] = [
  { id: 'tosca', title: 'Tosca', composer: 'Giacomo Puccini', language: 'Italian', progress: 0.34 },
  { id: 'carmen', title: 'Carmen', composer: 'Georges Bizet', language: 'French', progress: 0 },
  { id: 'don-giovanni', title: 'Don Giovanni', composer: 'W. A. Mozart', language: 'Italian', progress: 0 },
];

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>SPOKEN SCORE</Text>
        <Text style={styles.title}>Learn the words before you sing them.</Text>
        <Text style={styles.subtitle}>
          Hear opera and art-song texts spoken clearly, then practice at your own pace.
        </Text>

        <TouchableOpacity accessibilityRole="button" style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Browse the library</Text>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Continue learning</Text>
          <Text style={styles.sectionAction}>See all</Text>
        </View>

        {featuredWorks.map((work) => (
          <TouchableOpacity accessibilityRole="button" key={work.id} style={styles.card}>
            <View style={styles.cardText}>
              <Text style={styles.workTitle}>{work.title}</Text>
              <Text style={styles.workMeta}>{work.composer} · {work.language}</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.max(work.progress * 100, 4)}%` }]} />
              </View>
            </View>
            <Text style={styles.playIcon}>{work.progress > 0 ? '▶' : '+'}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.playerPreview}>
          <Text style={styles.playerLabel}>PRACTICE PLAYER</Text>
          <Text style={styles.playerText}>Vissi d’arte, vissi d’amore…</Text>
          <View style={styles.speedRow}>
            {['0.5×', '0.8×', '0.9×', '1×'].map((speed) => (
              <View key={speed} style={speed === '0.8×' ? styles.speedActive : styles.speedPill}>
                <Text style={speed === '0.8×' ? styles.speedActiveText : styles.speedText}>{speed}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const colors = {
  background: '#11100F',
  surface: '#1D1B19',
  cream: '#F5EBDD',
  muted: '#B8AFA4',
  accent: '#D99A55',
  line: '#35312D',
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 48 },
  eyebrow: { color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 2.4 },
  title: { color: colors.cream, fontSize: 38, fontWeight: '700', lineHeight: 43, marginTop: 14, maxWidth: 340 },
  subtitle: { color: colors.muted, fontSize: 17, lineHeight: 25, marginTop: 16, maxWidth: 350 },
  primaryButton: { alignItems: 'center', backgroundColor: colors.accent, borderRadius: 14, marginTop: 28, paddingVertical: 16 },
  primaryButtonText: { color: colors.background, fontSize: 16, fontWeight: '700' },
  sectionHeader: { alignItems: 'baseline', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, marginTop: 36 },
  sectionTitle: { color: colors.cream, fontSize: 21, fontWeight: '700' },
  sectionAction: { color: colors.accent, fontSize: 14, fontWeight: '600' },
  card: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 16, borderWidth: 1, flexDirection: 'row', marginBottom: 12, padding: 18 },
  cardText: { flex: 1 },
  workTitle: { color: colors.cream, fontSize: 18, fontWeight: '700' },
  workMeta: { color: colors.muted, fontSize: 13, marginTop: 5 },
  progressTrack: { backgroundColor: colors.line, borderRadius: 2, height: 3, marginTop: 14, overflow: 'hidden' },
  progressFill: { backgroundColor: colors.accent, height: 3 },
  playIcon: { color: colors.accent, fontSize: 21, marginLeft: 20 },
  playerPreview: { backgroundColor: colors.cream, borderRadius: 20, marginTop: 24, padding: 22 },
  playerLabel: { color: '#806342', fontSize: 11, fontWeight: '800', letterSpacing: 1.8 },
  playerText: { color: colors.background, fontSize: 25, fontWeight: '600', lineHeight: 32, marginTop: 12 },
  speedRow: { flexDirection: 'row', gap: 8, marginTop: 22 },
  speedPill: { borderColor: '#CFC1B0', borderRadius: 16, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7 },
  speedActive: { backgroundColor: colors.background, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 7 },
  speedText: { color: '#675B50', fontSize: 12, fontWeight: '600' },
  speedActiveText: { color: colors.cream, fontSize: 12, fontWeight: '700' },
});
