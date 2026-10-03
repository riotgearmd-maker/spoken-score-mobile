import { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { challenges, italianGeminateDemo, profiles } from '../data/challenges';
import { AttemptGrade, PronunciationProfileId } from '../domain/pronunciation';
import { gradePronunciation } from '../services/pronunciationGrader';
import { colors } from '../theme';

type GameState = 'ready' | 'listening' | 'scored';

export default function GameScreen() {
  const [profileId, setProfileId] = useState<PronunciationProfileId>('italian');
  const [state, setState] = useState<GameState>('ready');
  const challenge = challenges[0];
  const grade: AttemptGrade | undefined = useMemo(
    () => (state === 'scored' ? gradePronunciation(challenge, italianGeminateDemo) : undefined),
    [challenge, state],
  );

  const handleAttempt = () => {
    if (state === 'ready') setState('listening');
    else if (state === 'listening') setState('scored');
    else setState('ready');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileRow}>
          {profiles.map((profile) => (
            <Pressable
              accessibilityRole="button"
              disabled={profile.id !== 'italian'}
              key={profile.id}
              onPress={() => setProfileId(profile.id)}
              style={[
                styles.profilePill,
                profileId === profile.id && styles.profilePillActive,
                profile.id !== 'italian' && styles.profilePillComingSoon,
              ]}
            >
              <Text style={[styles.profileText, profileId === profile.id && styles.profileTextActive]}>
                {profile.shortName}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.step}>ITALIAN · GEMINATE CONSONANTS</Text>
        <Text style={styles.title}>{challenge.title}</Text>
        <Text style={styles.source}>{challenge.source}</Text>

        <View style={styles.promptCard}>
          <Text style={styles.prompt}>{challenge.text}</Text>
          <Text style={styles.translation}>{challenge.translation}</Text>
          <Text style={styles.listen}>▶ Hear the model</Text>
        </View>

        <Text style={styles.instruction}>
          {state === 'ready' && 'Tap and speak the phrase naturally.'}
          {state === 'listening' && 'Listening… tap when you finish.'}
          {state === 'scored' && 'Strong start. Focus on the final double t.'}
        </Text>

        <Pressable
          accessibilityLabel={state === 'listening' ? 'Finish speaking' : 'Start pronunciation attempt'}
          accessibilityRole="button"
          onPress={handleAttempt}
          style={[styles.micButton, state === 'listening' && styles.micButtonListening]}
        >
          <Text style={styles.micIcon}>{state === 'listening' ? '■' : '●'}</Text>
          <Text style={styles.micLabel}>{state === 'ready' ? 'Speak' : state === 'listening' ? 'Finish' : 'Try again'}</Text>
        </Pressable>

        {grade && (
          <View style={styles.results}>
            <View style={styles.scoreRow}>
              <View>
                <Text style={styles.scoreLabel}>PRONUNCIATION SCORE</Text>
                <Text style={styles.score}>{grade.total}</Text>
              </View>
              <View style={styles.metricList}>
                <Text style={styles.metric}>Accuracy {grade.accuracy}</Text>
                <Text style={styles.metric}>Timing {grade.timing}</Text>
                <Text style={styles.metric}>Complete {grade.completeness}</Text>
              </View>
            </View>

            <View style={styles.phonemeRow}>
              {grade.phonemes.map((phoneme, index) => (
                <View
                  key={`${phoneme.symbol}-${index}`}
                  style={[
                    styles.phoneme,
                    phoneme.score >= 85 ? styles.phonemeGood : phoneme.score >= 70 ? styles.phonemeWarn : styles.phonemeBad,
                  ]}
                >
                  <Text style={styles.phonemeText}>{phoneme.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.feedbackCard}>
              <Text style={styles.feedbackTitle}>Try this</Text>
              <Text style={styles.feedbackText}>Close fully before the final “t,” then release into the “e.” The silence is part of the consonant.</Text>
            </View>
          </View>
        )}

        <Text style={styles.prototypeNote}>Prototype scoring uses a deterministic phoneme trace. Live microphone alignment is the next integration.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingBottom: 48 },
  profileRow: { flexDirection: 'row', gap: 8, marginBottom: 28 },
  profilePill: { borderColor: colors.line, borderRadius: 18, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 9 },
  profilePillActive: { backgroundColor: colors.cream, borderColor: colors.cream },
  profilePillComingSoon: { opacity: 0.45 },
  profileText: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  profileTextActive: { color: colors.background },
  step: { color: colors.accent, fontSize: 11, fontWeight: '900', letterSpacing: 1.6 },
  title: { color: colors.cream, fontSize: 31, fontWeight: '800', lineHeight: 36, marginTop: 10 },
  source: { color: colors.muted, fontSize: 14, marginTop: 6 },
  promptCard: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 20, borderWidth: 1, marginTop: 24, padding: 22 },
  prompt: { color: colors.cream, fontSize: 29, fontWeight: '700', lineHeight: 38 },
  translation: { color: colors.muted, fontSize: 14, marginTop: 8 },
  listen: { color: colors.accent, fontSize: 14, fontWeight: '800', marginTop: 22 },
  instruction: { color: colors.cream, fontSize: 16, marginTop: 28, textAlign: 'center' },
  micButton: { alignItems: 'center', alignSelf: 'center', backgroundColor: colors.accent, borderRadius: 48, height: 96, justifyContent: 'center', marginTop: 18, width: 96 },
  micButtonListening: { backgroundColor: colors.danger },
  micIcon: { color: colors.background, fontSize: 22 },
  micLabel: { color: colors.background, fontSize: 12, fontWeight: '900', marginTop: 4 },
  results: { marginTop: 30 },
  scoreRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  scoreLabel: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  score: { color: colors.cream, fontSize: 54, fontWeight: '900' },
  metricList: { alignItems: 'flex-end', gap: 5 },
  metric: { color: colors.muted, fontSize: 13 },
  phonemeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 16 },
  phoneme: { alignItems: 'center', borderRadius: 10, justifyContent: 'center', minWidth: 34, paddingHorizontal: 9, paddingVertical: 10 },
  phonemeGood: { backgroundColor: colors.success },
  phonemeWarn: { backgroundColor: colors.warning },
  phonemeBad: { backgroundColor: colors.danger },
  phonemeText: { color: colors.background, fontSize: 14, fontWeight: '900' },
  feedbackCard: { borderColor: colors.line, borderRadius: 16, borderWidth: 1, marginTop: 18, padding: 18 },
  feedbackTitle: { color: colors.accent, fontSize: 13, fontWeight: '900' },
  feedbackText: { color: colors.cream, fontSize: 15, lineHeight: 22, marginTop: 7 },
  prototypeNote: { color: '#746C64', fontSize: 11, lineHeight: 16, marginTop: 28, textAlign: 'center' },
});
