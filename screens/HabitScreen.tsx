import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Dimensions, Modal, Alert, Platform, FlatList } from "react-native";
import * as Calendar from "expo-calendar";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AppIcon } from "@/components/AppIcon";
import { Spacing, Typography, BorderRadius } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { useHabit } from "@/hooks/useHabit";
import { HabitEntry } from "@/types/index";

const SCREEN_WIDTH = Dimensions.get('window').width;
const CALENDAR_CONTENT_WIDTH = SCREEN_WIDTH - (Spacing.lg * 4);
const CELL_SIZE = CALENDAR_CONTENT_WIDTH / 7;

const TIME_OPTIONS = [
  { label: '6:00', hour: 6, minute: 0 },
  { label: '7:00', hour: 7, minute: 0 },
  { label: '8:00', hour: 8, minute: 0 },
  { label: '9:00', hour: 9, minute: 0 },
  { label: '10:00', hour: 10, minute: 0 },
  { label: '12:00', hour: 12, minute: 0 },
  { label: '18:00', hour: 18, minute: 0 },
  { label: '20:00', hour: 20, minute: 0 },
  { label: '21:00', hour: 21, minute: 0 },
  { label: '22:00', hour: 22, minute: 0 },
];

export default function HabitScreen() {
  const { theme } = useTheme();
  const { habits, currentStreak, getHabitsByDate, getMonthlyStats, clearAllHabits } = useHabit();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDayEntries, setSelectedDayEntries] = useState<HabitEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showTimePickerModal, setShowTimePickerModal] = useState(false);
  const [selectedTime, setSelectedTime] = useState({ hour: 9, minute: 0 });
  const [calendarPermission, setCalendarPermission] = useState<boolean>(false);

  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const monthYear = today.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  
  const year = today.getFullYear();
  const month = today.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const monthlyStats = getMonthlyStats(year, month);
  
  const practiceMap = new Map<number, HabitEntry[]>();
  habits.forEach((habit) => {
    if (habit.date.startsWith(currentMonth)) {
      const day = parseInt(habit.date.split('-')[2]);
      if (!practiceMap.has(day)) {
        practiceMap.set(day, []);
      }
      practiceMap.get(day)?.push(habit);
    }
  });
  
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  useEffect(() => {
    checkCalendarPermission();
  }, []);

  const checkCalendarPermission = async () => {
    if (Platform.OS === 'web') return;
    const { status } = await Calendar.getCalendarPermissionsAsync();
    setCalendarPermission(status === 'granted');
  };

  const requestCalendarPermission = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Calendar reminders work on mobile devices only');
      return false;
    }
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    setCalendarPermission(status === 'granted');
    return status === 'granted';
  };

  const getDefaultCalendarId = async (): Promise<string | undefined> => {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    const defaultCalendar = calendars.find(
      (cal: Calendar.Calendar) => cal.allowsModifications && cal.source?.name === 'Default'
    ) || calendars.find((cal: Calendar.Calendar) => cal.allowsModifications);
    return defaultCalendar?.id;
  };

  const openTimePicker = () => {
    setShowTimePickerModal(true);
  };

  const createMeditationReminder = async (hour: number, minute: number) => {
    setShowTimePickerModal(false);
    
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Calendar reminders work on mobile devices only');
      return;
    }

    let hasPermission = calendarPermission;
    if (!hasPermission) {
      hasPermission = await requestCalendarPermission();
    }

    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please allow calendar access to create reminders');
      return;
    }

    try {
      const calendarId = await getDefaultCalendarId();
      if (!calendarId) {
        Alert.alert('Error', 'Could not find a calendar to add the reminder');
        return;
      }

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(hour, minute, 0, 0);

      const endTime = new Date(tomorrow);
      endTime.setMinutes(endTime.getMinutes() + 15);

      await Calendar.createEventAsync(calendarId, {
        title: 'Meditation Time',
        notes: 'Time for your daily meditation session. Open MindMVP to start.',
        startDate: tomorrow,
        endDate: endTime,
        alarms: [{ relativeOffset: -10 }],
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      Alert.alert('Reminder Created', `Meditation reminder set for tomorrow at ${timeStr}`);
    } catch (error) {
      console.log('Calendar error:', error);
      Alert.alert('Error', 'Could not create reminder');
    }
  };

  const handleDayPress = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const entries = getHabitsByDate(dateStr);
    if (entries.length > 0) {
      setSelectedDate(dateStr);
      setSelectedDayEntries(entries);
      setShowModal(true);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const calendarRows: Array<Array<{type: 'prev' | 'current' | 'next', day: number}>> = [];
  let currentRow: Array<{type: 'prev' | 'current' | 'next', day: number}> = [];
  
  for (let i = 0; i < firstDayOfWeek; i++) {
    const prevDay = daysInPrevMonth - firstDayOfWeek + 1 + i;
    currentRow.push({ type: 'prev', day: prevDay });
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    currentRow.push({ type: 'current', day });
    if (currentRow.length === 7) {
      calendarRows.push(currentRow);
      currentRow = [];
    }
  }
  
  if (currentRow.length > 0) {
    let nextDay = 1;
    while (currentRow.length < 7) {
      currentRow.push({ type: 'next', day: nextDay++ });
    }
    calendarRows.push(currentRow);
  }

  return (
    <ScreenScrollView>
      <ThemedView style={[styles.streakCard, { backgroundColor: theme.backgroundDefault }]}>
        <AppIcon name="trending-up" size={32} color={theme.success} />
        <ThemedText style={[Typography.h1, styles.streakNumber]}>
          {currentStreak}
        </ThemedText>
        <ThemedText style={[Typography.body, { color: theme.textSecondary }]}>
          day streak
        </ThemedText>
      </ThemedView>

      <ThemedView style={[styles.calendarCard, { backgroundColor: theme.backgroundDefault }]}>
        <ThemedText style={[Typography.h3, styles.calendarTitle]}>
          {monthYear}
        </ThemedText>

        <View style={styles.calendarContainer}>
          <View style={styles.weekDaysRow}>
            {weekDays.map((day, index) => (
              <View key={`weekday-${index}`} style={[styles.cell, { width: CELL_SIZE }]}>
                <ThemedText style={[styles.weekDayText, { color: theme.textSecondary }]}>
                  {day}
                </ThemedText>
              </View>
            ))}
          </View>

          {calendarRows.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.calendarRow}>
              {row.map((cell, cellIndex) => {
                const isCurrentMonth = cell.type === 'current';
                const day = cell.day;
                const dayEntries = isCurrentMonth ? practiceMap.get(day) : undefined;
                const hasPractice = dayEntries && dayEntries.length > 0;
                const isToday = isCurrentMonth && day === today.getDate();
                const sessionCount = dayEntries?.length || 0;
                
                return (
                  <Pressable
                    key={`cell-${rowIndex}-${cellIndex}`}
                    onPress={() => isCurrentMonth && hasPractice ? handleDayPress(day) : null}
                    android_disableSound={true}
                    android_ripple={null}
                    focusable={false}
                    style={({ pressed }) => [
                      styles.cell, 
                      { width: CELL_SIZE, height: CELL_SIZE },
                      pressed && hasPractice && { opacity: 0.7 }
                    ]}
                  >
                    <View style={[
                      styles.dayCircle,
                      isToday && { backgroundColor: theme.primary },
                      hasPractice && !isToday && { backgroundColor: 'rgba(107, 78, 175, 0.15)' }
                    ]}>
                      <ThemedText
                        style={[
                          styles.dayText,
                          { color: isCurrentMonth ? (isToday ? '#FFFFFF' : theme.text) : theme.textSecondary },
                          !isCurrentMonth && { opacity: 0.4 }
                        ]}
                      >
                        {day}
                      </ThemedText>
                    </View>
                    {hasPractice ? (
                      <View style={styles.sessionIndicator}>
                        {sessionCount > 1 ? (
                          <ThemedText style={[styles.sessionCountText, { color: isToday ? '#FFFFFF' : theme.primary }]}>
                            {sessionCount}
                          </ThemedText>
                        ) : (
                          <View style={[styles.activityDot, { backgroundColor: isToday ? '#FFFFFF' : theme.primary }]} />
                        )}
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </ThemedView>

      <ThemedView style={[styles.statsCard, { backgroundColor: theme.backgroundDefault }]}>
        <ThemedText style={[Typography.h3, styles.statsTitle]}>
          This Month
        </ThemedText>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ThemedText style={Typography.h2}>{monthlyStats.sessions}</ThemedText>
            <ThemedText style={[Typography.small, { color: theme.textSecondary }]}>
              Sessions
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={Typography.h2}>{monthlyStats.minutes}</ThemedText>
            <ThemedText style={[Typography.small, { color: theme.textSecondary }]}>
              Minutes
            </ThemedText>
          </View>
        </View>
        {habits.length > 0 ? (
          <Pressable
            onPress={() => {
              Alert.alert(
                'Clear History',
                'Remove all meditation records? This cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Clear', style: 'destructive', onPress: clearAllHabits },
                ]
              );
            }}
            android_disableSound={true}
            android_ripple={null}
            focusable={false}
            style={({ pressed }) => [
              styles.clearButton,
              { opacity: pressed ? 0.7 : 1 }
            ]}
          >
            <ThemedText style={[Typography.small, { color: theme.error }]}>
              Clear History
            </ThemedText>
          </Pressable>
        ) : null}
      </ThemedView>

      <Pressable
        onPress={openTimePicker}
        android_disableSound={true}
        android_ripple={null}
        focusable={false}
        style={({ pressed }) => [
          styles.reminderButton,
          { 
            backgroundColor: theme.primary,
            opacity: pressed ? 0.8 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }]
          }
        ]}
      >
        <AppIcon name="bell" size={20} color="#FFFFFF" />
        <ThemedText style={[Typography.body, styles.reminderButtonText, { color: '#FFFFFF' }]}>
          Set Tomorrow Reminder
        </ThemedText>
      </Pressable>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowModal(false)} />
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={Typography.h3}>
                {selectedDate ? formatDate(selectedDate) : ''}
              </ThemedText>
              <Pressable
                onPress={() => setShowModal(false)}
                android_disableSound={true}
                android_ripple={null}
                focusable={false}
                hitSlop={12}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, padding: 4 })}
              >
                <AppIcon name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <FlatList
              data={selectedDayEntries}
              keyExtractor={(entry, index) => `${entry.sessionId}-${entry.completedAt}-${index}`}
              style={styles.entriesScrollView}
              contentContainerStyle={{ paddingBottom: Spacing.sm }}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              bounces={true}
              renderItem={({ item: entry }) => (
                <View style={[styles.entryItem, { borderBottomColor: theme.border }]}>
                  <View style={styles.entryInfo}>
                    <ThemedText style={Typography.body}>
                      {entry.sessionTitle || 'Meditation'}
                    </ThemedText>
                    <ThemedText style={[Typography.small, { color: theme.textSecondary }]}>
                      {formatTime(entry.completedAt)}
                    </ThemedText>
                  </View>
                  <View style={styles.entryDuration}>
                    <ThemedText style={[Typography.body, { color: theme.primary }]}>
                      {entry.listenedMinutes || entry.duration} min
                    </ThemedText>
                  </View>
                </View>
              )}
            />

            <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
              <ThemedText style={[Typography.small, { color: theme.textSecondary }]}>
                Total: {selectedDayEntries.reduce((sum, e) => sum + (e.listenedMinutes || e.duration), 0)} minutes
              </ThemedText>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showTimePickerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTimePickerModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowTimePickerModal(false)}
        >
          <Pressable 
            style={[styles.timePickerContent, { backgroundColor: theme.backgroundDefault }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <ThemedText style={Typography.h3}>
                Select Time
              </ThemedText>
              <Pressable
                onPress={() => setShowTimePickerModal(false)}
                android_disableSound={true}
                android_ripple={null}
                focusable={false}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <AppIcon name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ThemedText style={[Typography.small, { color: theme.textSecondary, marginBottom: Spacing.md }]}>
              Choose when you want to be reminded tomorrow
            </ThemedText>

            <View style={styles.timeGrid}>
              {TIME_OPTIONS.map((time) => (
                <Pressable
                  key={time.label}
                  onPress={() => createMeditationReminder(time.hour, time.minute)}
                  android_disableSound={true}
                  android_ripple={null}
                  focusable={false}
                  style={({ pressed }) => [
                    styles.timeButton,
                    { 
                      backgroundColor: pressed ? theme.primary : theme.backgroundSecondary,
                      borderColor: theme.border,
                    }
                  ]}
                >
                  <ThemedText style={[Typography.body, { color: theme.text }]}>
                    {time.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  streakCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  streakNumber: {
    marginVertical: Spacing.sm,
  },
  calendarCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  calendarTitle: {
    marginBottom: Spacing.lg,
  },
  calendarContainer: {
    alignItems: 'center',
  },
  weekDaysRow: {
    flexDirection: "row",
    marginBottom: Spacing.xs,
  },
  calendarRow: {
    flexDirection: "row",
  },
  cell: {
    alignItems: "center",
    justifyContent: "center",
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontSize: 16,
    fontWeight: '400',
  },
  sessionIndicator: {
    position: 'absolute',
    bottom: 2,
    alignItems: 'center',
  },
  activityDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  sessionCountText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statsCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  statsTitle: {
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  clearButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
  },
  reminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  reminderButtonText: {
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    width: '88%',
    maxWidth: 360,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    maxHeight: '50%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  timePickerContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  entriesScrollView: {
    maxHeight: 250,
    flexGrow: 0,
  },
  entryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  entryInfo: {
    flex: 1,
  },
  entryDuration: {
    marginLeft: Spacing.md,
  },
  modalFooter: {
    borderTopWidth: 1,
    paddingTop: Spacing.md,
    alignItems: 'center',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  timeButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
});
