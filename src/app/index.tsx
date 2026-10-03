import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>SPOKEN SCORE</Text>
        <Text style={styles.title}>Train your diction like an instrument.</Text>
        <Text style={styles.subtitle}>
          Hear a lyric, speak it back, and get feedback down to each vowel and consonant.
        </Text>

        <Link href="/game" style={styles.playButton}>
          Play today’s challenge
        </Link>

        <Text style={styles.sectionTitle}>Pronunciation standards</Text>
        <View style={styles.profileGrid}>
          {[
            ['IT', 'Italian', 'Gemination, pure vowels, stress'],
            ['RP', 'English · RP', 'Vowels, non-rhoticity, stress'],
            ['GA', 'English · General American', 'Rhoticity, reductions, stress'],
          ].map(([shortName, name, detail]) => (
            <View key={shortName} style={styles.profileCard}>
              <Text style={styles.profileBadge}>{shortName}</Text>
              <View style={styles.profileCopy}>
                <Text style={styles.profileName}>{name}</Text>
                <Text style={styles.profileDetail}>{detail}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.demoCard}>
          <Text style={styles.demoLabel}>AI DEMONSTRATION</Text>
          <Text style={styles.demoText}>Listen first. Then make every sound land.</Text>
          <Text style={styles.demoAction}>▶ Hear “Fatto. Bello. Notte.”</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 24, paddingTop: 38, paddingBottom: 48 },
  eyebrow: { color: colors.accent, fontSize: 12, fontWeight: '800', letterSpacing: 2.4 },
  title: { color: colors.cream, fontSize: 39, fontWeight: '800', lineHeight: 44, marginTop: 14 },
  subtitle: { color: colors.muted, fontSize: 17, lineHeight: 25, marginTop: 16 },
  playButton: { backgroundColor: colors.accent, borderRadius: 14, color: colors.background, fontSize: 16, fontWeight: '800', marginTop: 28, overflow: 'hidden', padding: 17, textAlign: 'center' },
  sectionTitle: { color: colors.cream, fontSize: 21, fontWeight: '800', marginBottom: 12, marginTop: 36 },
  profileGrid: { gap: 10 },
  profileCard: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 16, borderWidth: 1, flexDirection: 'row', padding: 16 },
  profileBadge: { backgroundColor: colors.surfaceRaised, borderRadius: 12, color: colors.accent, fontSize: 13, fontWeight: '900', overflow: 'hidden', paddingHorizontal: 12, paddingVertical: 10 },
  profileCopy: { flex: 1, marginLeft: 14 },
  profileName: { color: colors.cream, fontSize: 16, fontWeight: '700' },
  profileDetail: { color: colors.muted, fontSize: 13, marginTop: 4 },
  demoCard: { backgroundColor: colors.cream, borderRadius: 20, marginTop: 24, padding: 22 },
  demoLabel: { color: '#806342', fontSize: 11, fontWeight: '900', letterSpacing: 1.8 },
  demoText: { color: colors.background, fontSize: 23, fontWeight: '700', lineHeight: 30, marginTop: 10 },
  demoAction: { color: '#704A22', fontSize: 14, fontWeight: '800', marginTop: 20 },
});
