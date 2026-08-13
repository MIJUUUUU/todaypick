import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Recipe } from '../../../src/entities/recipe/model/types';
import { PrimaryButton } from '../../../src/shared/ui/PrimaryButton';
import { colors } from '../../../src/shared/theme/colors';

type TimerGuide = {
  minutes: number;
  cue: string;
};

const TIMER_PRESETS = [3, 5, 10];

function getTimerGuide(stepText: string): TimerGuide {
  if (stepText.includes('노릇')) {
    return { minutes: 5, cue: '겉면이 노릇해질 때까지 익혀주세요.' };
  }
  if (stepText.includes('끓') || stepText.includes('한소끔')) {
    return { minutes: 3, cue: '끓기 시작한 뒤 3분 정도 더 조리하면 좋아요.' };
  }
  if (stepText.includes('볶')) {
    return { minutes: 4, cue: '재료 향이 충분히 올라올 때까지 볶아주세요.' };
  }
  if (stepText.includes('익')) {
    return { minutes: 5, cue: '속까지 익을 때까지 중불로 천천히 진행해주세요.' };
  }
  return { minutes: 3, cue: '현재 단계가 안정적으로 진행될 때까지 천천히 확인해주세요.' };
}

function getStepGuide(recipe: Recipe, step: number, stepText: string): TimerGuide {
  const recipeGuide = recipe.cooking_step_guides?.[step];
  if (recipeGuide) {
    return recipeGuide;
  }
  return getTimerGuide(stepText);
}

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function Cooking() {
  const { data } = useLocalSearchParams<{ data: string }>();
  const recipe: Recipe = JSON.parse(String(data));
  const scrollRef = useRef<ScrollView | null>(null);
  const [step, setStep] = useState(0);
  const [timerExpanded, setTimerExpanded] = useState(false);
  const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const last = step === recipe.cooking_steps.length - 1;

  const stepText = recipe.cooking_steps[step];
  const timerGuide = useMemo(() => getStepGuide(recipe, step, stepText), [recipe, step, stepText]);

  useEffect(() => {
    setSelectedMinutes(timerGuide.minutes);
    setRemainingSeconds(0);
    setTimerRunning(false);
    setTimerExpanded(false);
  }, [step, timerGuide.minutes]);

  useEffect(() => {
    if (!timerRunning || remainingSeconds <= 0) return;
    const timer = setInterval(() => {
      setRemainingSeconds(value => {
        if (value <= 1) {
          clearInterval(timer);
          setTimerRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [remainingSeconds, timerRunning]);

  const startTimer = (minutes: number) => {
    setSelectedMinutes(minutes);
    setRemainingSeconds(minutes * 60);
    setTimerRunning(true);
    setTimerExpanded(false);
  };

  const openTimerPanel = () => {
    setSelectedMinutes(timerGuide.minutes);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    setTimeout(() => {
      setTimerExpanded(true);
    }, 180);
  };

  const pauseTimer = () => {
    setTimerRunning(false);
  };

  const resumeTimer = () => {
    if (remainingSeconds > 0) {
      setTimerRunning(true);
    }
  };

  const stopTimer = () => {
    setTimerRunning(false);
    setSelectedMinutes(timerGuide.minutes);
    setRemainingSeconds(0);
    setTimerExpanded(false);
  };

  const showFloatingTimer = timerExpanded || remainingSeconds > 0;
  const isCollapsedTimer = showFloatingTimer && !timerExpanded && remainingSeconds > 0;

  const selectedTimerMinutes = selectedMinutes ?? timerGuide.minutes;
  const isCustomTime = selectedTimerMinutes !== timerGuide.minutes;
  const timerGuideLabel = isCustomTime
    ? `권장 ${timerGuide.minutes}분 · 선택 ${selectedTimerMinutes}분`
    : `권장 시간 ${timerGuide.minutes}분`;
  const totalTimerSeconds = Math.max(selectedTimerMinutes * 60, 1);
  const timerProgress = Math.min(Math.max(remainingSeconds / totalTimerSeconds, 0), 1);
  const timerProgressColor = timerProgress <= 0.15 ? '#D14343' : timerProgress <= 0.35 ? '#E28A3B' : '#8B78D6';
  const stepProgress = ((step + 1) / Math.max(recipe.cooking_steps.length, 1)) * 100;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.screen}>
        {timerExpanded ? <Pressable style={s.timerBackdrop} onPress={() => setTimerExpanded(false)} /> : null}

        {showFloatingTimer ? (
          <Pressable style={[s.floatingTimer, isCollapsedTimer && s.floatingTimerCollapsed]} onPress={() => isCollapsedTimer && setTimerExpanded(true)}>
            <View style={s.floatingTimerProgressTrack}>
              <View style={[s.floatingTimerProgressFill, { width: `${timerProgress * 100}%`, backgroundColor: timerProgressColor }]} />
            </View>
            {isCollapsedTimer ? (
              <>
                <Text style={s.floatingTimerCollapsedText}> {formatSeconds(remainingSeconds)}</Text>
                <Text style={s.floatingTimerCollapsedHint}>탭해서 펼치기</Text>
              </>
            ) : (
              <>
                <View style={s.floatingTimerContent}>
                  <Text style={s.floatingTimerTitle}>타이머</Text>
                  <Text style={s.floatingTimerCue}>{timerGuide.cue}</Text>
                  <Text style={s.floatingTimerMeta}>{timerGuideLabel}</Text>
                  {remainingSeconds > 0 ? (
                    <View style={s.floatingTimerActions}>
                      {timerRunning ? (
                        <Pressable style={s.floatingTimerButton} onPress={pauseTimer}>
                          <Text style={s.floatingTimerButtonText}>일시정지</Text>
                        </Pressable>
                      ) : (
                        <Pressable style={s.floatingTimerButton} onPress={resumeTimer}>
                          <Text style={s.floatingTimerButtonText}>다시시작</Text>
                        </Pressable>
                      )}
                      <Pressable style={s.floatingTimerButtonGhost} onPress={stopTimer}>
                        <Text style={s.floatingTimerButtonGhostText}>종료</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <>
                      <View style={s.inlinePresetRow}>
                        {TIMER_PRESETS.map(minutes => (
                          <Pressable
                            key={minutes}
                            style={[s.inlinePresetButton, selectedMinutes === minutes && s.inlinePresetButtonActive]}
                            onPress={() => setSelectedMinutes(minutes)}
                          >
                            <Text style={[s.inlinePresetText, selectedMinutes === minutes && s.inlinePresetTextActive]}>{minutes}분</Text>
                          </Pressable>
                        ))}
                      </View>
                      <Pressable style={s.startInlineButton} onPress={() => startTimer(selectedTimerMinutes)}>
                        <Text style={s.startInlineButtonText}>{selectedTimerMinutes}분으로 시작</Text>
                      </Pressable>
                    </>
                  )}
                </View>
                <View style={s.floatingTimerSide}>
                  <Text style={s.floatingTimerValue}>{remainingSeconds > 0 ? formatSeconds(remainingSeconds) : `${selectedTimerMinutes}:00`}</Text>
                  {remainingSeconds > 0 ? (
                    <Pressable onPress={() => setTimerExpanded(false)}>
                      <Text style={s.floatingTimerCollapse}>접기</Text>
                    </Pressable>
                  ) : null}
                </View>
              </>
            )}
          </Pressable>
        ) : null}

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[s.container, showFloatingTimer && (isCollapsedTimer ? s.containerWithCollapsedTimer : s.containerWithExpandedTimer)]}
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={() => router.back()}>
            <Text style={s.back}>← 체크리스트</Text>
          </Pressable>

          <Text style={s.title}>한 단계씩 따라 해보세요.</Text>
          <Text style={s.subtitle}>현재 단계에 집중하면서 천천히 진행하면 돼요.</Text>

          <View style={s.card}>
            <View style={s.cardHeader}>
              <Text style={s.cardEyebrow}>STEP {step + 1}</Text>
              <Text style={s.cardMeta}>
                {step + 1} / {recipe.cooking_steps.length}
              </Text>
            </View>
            <View style={s.cardProgressTrack}>
              <View style={[s.cardProgressFill, { width: `${stepProgress}%` }]} />
            </View>
            <Text style={s.emoji}>🍳</Text>
            <Text style={s.instruction}>{stepText}</Text>
            <Text style={s.muted}>{timerGuide.cue}</Text>
            <Text style={s.stepDuration}>중불 기준 약 {timerGuide.minutes}분</Text>
          </View>

          <View style={s.actions}>
            <Pressable style={s.secondary} onPress={() => setStep(value => Math.max(value - 1, 0))}>
              <Text style={s.secondaryText}>← 이전</Text>
            </Pressable>
            <Pressable style={s.secondary} onPress={openTimerPanel}>
              <Text style={s.secondaryText}>⏱ 타이머</Text>
            </Pressable>
          </View>
        </ScrollView>

        <View style={s.footer}>
          <PrimaryButton
            title={last ? '조리 완료' : '다음 단계 →'}
            onPress={() =>
              last
                ? router.replace({
                    pathname: '/recipe/[id]/complete',
                    params: { id: recipe.id, data: JSON.stringify(recipe) },
                  })
                : setStep(value => value + 1)
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1 },
  container: { padding: 24, paddingTop: 24, paddingBottom: 24 },
  containerWithCollapsedTimer: { paddingTop: 92 },
  containerWithExpandedTimer: { paddingTop: 244 },
  back: { color: colors.muted, marginBottom: 24, fontSize: 14 },
  timerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 11, 26, 0.16)',
    zIndex: 5,
  },
  floatingTimer: {
    position: 'absolute',
    top: 12,
    left: 24,
    right: 24,
    zIndex: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    shadowColor: '#120E1F',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  floatingTimerCollapsed: {
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  floatingTimerProgressTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: '#DED4FA',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: 'hidden',
  },
  floatingTimerProgressFill: {
    height: '100%',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  floatingTimerContent: { flex: 1, paddingRight: 8 },
  floatingTimerTitle: { color: colors.ink, fontSize: 18, fontWeight: '800', marginBottom: 6 },
  floatingTimerCue: { color: colors.muted, fontSize: 12, lineHeight: 17, flexShrink: 1 },
  floatingTimerMeta: { color: colors.muted, fontSize: 12, fontWeight: '700', marginTop: 8 },
  floatingTimerValue: { color: colors.ink, fontSize: 28, fontWeight: '800' },
  floatingTimerSide: { alignItems: 'flex-end', justifyContent: 'space-between', alignSelf: 'stretch' },
  floatingTimerCollapse: { color: colors.muted, fontSize: 12, fontWeight: '700', marginTop: 12 },
  floatingTimerCollapsedText: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  floatingTimerCollapsedHint: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  floatingTimerActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  floatingTimerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.ink,
  },
  floatingTimerButtonText: { color: colors.surface, fontSize: 12, fontWeight: '800' },
  floatingTimerButtonGhost: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  floatingTimerButtonGhostText: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  inlinePresetRow: { flexDirection: 'row', gap: 8, marginTop: 14, marginBottom: 12 },
  inlinePresetButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  inlinePresetButtonActive: {
    borderColor: colors.ink,
    backgroundColor: colors.surface,
  },
  inlinePresetText: { color: colors.ink, fontWeight: '700' },
  inlinePresetTextActive: { color: colors.ink },
  startInlineButton: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.ink,
  },
  startInlineButtonText: { color: colors.surface, fontWeight: '800' },
  title: { fontSize: 22, fontWeight: '800', lineHeight: 32, marginBottom: 10, color: colors.ink },
  subtitle: { fontSize: 14, lineHeight: 22, color: colors.muted, marginBottom: 24 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 28,
    alignItems: 'center',
  },
  cardHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardEyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.3, color: colors.muted },
  cardMeta: { fontSize: 12, fontWeight: '700', color: colors.muted },
  cardProgressTrack: {
    width: '100%',
    height: 5,
    borderRadius: 999,
    backgroundColor: '#F1EDF9',
    overflow: 'hidden',
    marginBottom: 24,
  },
  cardProgressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.ink,
  },
  emoji: { fontSize: 70, marginVertical: 22 },
  instruction: { fontSize: 23, fontWeight: '800', textAlign: 'center', lineHeight: 34, marginBottom: 14, color: colors.ink },
  muted: { color: colors.muted, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  stepDuration: { marginTop: 18, color: colors.muted, fontSize: 13, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 18 },
  secondary: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  secondaryText: { color: colors.ink, fontWeight: '600' },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.background,
  },
});
