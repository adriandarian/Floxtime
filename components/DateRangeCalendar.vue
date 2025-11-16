<template>
  <div class="date-range-calendar">
    <div class="calendars-container">
      <!-- First Month -->
      <div class="calendar-month">
        <div class="calendar-header">
          <button type="button" @click="previousMonth" class="nav-button">‹</button>
          <h3>{{ firstMonthYear }}</h3>
        </div>
        
        <div class="calendar-grid">
          <div class="day-header" v-for="day in dayHeaders" :key="day">
            {{ day }}
          </div>
          
          <div
            v-for="day in firstMonthDays"
            :key="day.date"
            :class="[
              'calendar-day',
              {
                'other-month': !day.isCurrentMonth,
                'selected': isDateSelected(day.date),
                'in-range': isDateInRange(day.date),
                'range-start': isRangeStart(day.date),
                'range-end': isRangeEnd(day.date)
              }
            ]"
            @click="selectDate(day.date)"
          >
            {{ day.day }}
          </div>
        </div>
      </div>

      <!-- Second Month -->
      <div class="calendar-month">
        <div class="calendar-header">
          <h3>{{ secondMonthYear }}</h3>
          <button type="button" @click="nextMonth" class="nav-button">›</button>
        </div>
        
        <div class="calendar-grid">
          <div class="day-header" v-for="day in dayHeaders" :key="day">
            {{ day }}
          </div>
          
          <div
            v-for="day in secondMonthDays"
            :key="day.date"
            :class="[
              'calendar-day',
              {
                'other-month': !day.isCurrentMonth,
                'selected': isDateSelected(day.date),
                'in-range': isDateInRange(day.date),
                'range-start': isRangeStart(day.date),
                'range-end': isRangeEnd(day.date)
              }
            ]"
            @click="selectDate(day.date)"
          >
            {{ day.day }}
          </div>
        </div>
      </div>
    </div>
    
    <div class="selected-ranges" v-if="dateRanges.length > 0">
      <h4>Selected Date Ranges:</h4>
      <div
        v-for="(range, index) in dateRanges"
        :key="index"
        class="range-item"
      >
        <span>{{ formatDate(range.start) }} - {{ formatDate(range.end) }}</span>
        <button type="button" @click="removeRange(index)" class="remove-btn">×</button>
      </div>
    </div>
    
    <div class="calendar-actions">
      <button type="button" @click="clearSelection" class="clear-btn">Clear All</button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DateRange {
  start: string
  end: string
}

const props = defineProps<{
  modelValue: DateRange[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DateRange[]]
}>()

const dateRanges = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const currentDate = ref(new Date())
const selectingStart = ref<string | null>(null)

const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const firstMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const secondMonthYear = computed(() => {
  const nextMonth = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
  return nextMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days: Array<{ date: string; day: number; isCurrentMonth: boolean }> = []
  const current = new Date(startDate)
  
  for (let i = 0; i < 42; i++) {
    const dateStr = formatDateString(current)
    days.push({
      date: dateStr,
      day: current.getDate(),
      isCurrentMonth: current.getMonth() === month
    })
    current.setDate(current.getDate() + 1)
  }
  
  return days
}

const firstMonthDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  return getCalendarDays(year, month)
})

const secondMonthDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth() + 1
  return getCalendarDays(year, month)
})

function formatDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function isDateSelected(date: string): boolean {
  return dateRanges.value.some(range => {
    const start = new Date(range.start)
    const end = new Date(range.end)
    const checkDate = new Date(date)
    return checkDate >= start && checkDate <= end
  })
}

function isDateInRange(date: string): boolean {
  if (!selectingStart.value) return false
  
  const start = new Date(selectingStart.value)
  const checkDate = new Date(date)
  return checkDate >= start
}

function isRangeStart(date: string): boolean {
  return dateRanges.value.some(range => range.start === date)
}

function isRangeEnd(date: string): boolean {
  return dateRanges.value.some(range => range.end === date)
}

function selectDate(date: string) {
  if (!selectingStart.value) {
    selectingStart.value = date
  } else {
    const start = new Date(selectingStart.value)
    const end = new Date(date)
    
    if (end < start) {
      // Swap if end is before start
      const temp = selectingStart.value
      selectingStart.value = date
      date = temp
    }
    
    const newRange: DateRange = {
      start: selectingStart.value,
      end: date
    }
    
    // Check if this range overlaps with any existing range
    const overlaps = dateRanges.value.some(range => {
      const rStart = new Date(range.start)
      const rEnd = new Date(range.end)
      const nStart = new Date(newRange.start)
      const nEnd = new Date(newRange.end)
      
      return (nStart <= rEnd && nEnd >= rStart)
    })
    
    if (!overlaps) {
      dateRanges.value = [...dateRanges.value, newRange]
    }
    
    selectingStart.value = null
  }
}

function removeRange(index: number) {
  dateRanges.value = dateRanges.value.filter((_, i) => i !== index)
}

function clearSelection() {
  dateRanges.value = []
  selectingStart.value = null
}

function previousMonth() {
  selectingStart.value = null
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

function nextMonth() {
  selectingStart.value = null
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}
</script>

<style scoped>
.date-range-calendar {
  width: 100%;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.calendars-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .calendars-container {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

.calendar-month {
  display: flex;
  flex-direction: column;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.calendar-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.nav-button {
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 1.25rem;
  color: #374151;
  transition: all 0.2s;
  line-height: 1;
}

.nav-button:hover {
  background: #e5e7eb;
  color: #111827;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.day-header {
  text-align: center;
  font-weight: 600;
  padding: 8px 4px;
  color: #6b7280;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.calendar-day:hover {
  background: #f3f4f6;
}

.calendar-day.other-month {
  color: #d1d5db;
  opacity: 0.5;
}

.calendar-day.selected {
  background: #dbeafe;
  color: #1e40af;
}

.calendar-day.in-range {
  background: #dbeafe;
  color: #1e40af;
}

.calendar-day.range-start {
  background: #3b82f6;
  color: white;
  font-weight: 600;
}

.calendar-day.range-end {
  background: #3b82f6;
  color: white;
  font-weight: 600;
}

.selected-ranges {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.selected-ranges h4 {
  margin: 0 0 12px 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.range-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #f9fafb;
  border-radius: 6px;
  margin-bottom: 8px;
  font-size: 0.875rem;
}

.remove-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: #dc2626;
}

.calendar-actions {
  margin-top: 16px;
  text-align: center;
}

.clear-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.2s;
}

.clear-btn:hover {
  background: #dc2626;
}
</style>