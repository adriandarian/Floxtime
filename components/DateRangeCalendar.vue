<template>
  <div class="date-range-calendar">
    <div class="calendars-container">
      <!-- First Month -->
      <div class="calendar-month glass-calendar">
        <div class="calendar-header">
          <button 
            type="button" 
            @click="previousMonth" 
            class="nav-button"
          >
            ‹
          </button>
          <h3>{{ firstMonthYear }}</h3>
          <button 
            v-if="!readonly && !isMobile" 
            type="button" 
            @click="nextMonth" 
            class="nav-button"
          >
            ›
          </button>
          <button 
            v-else-if="readonly || isMobile" 
            type="button" 
            @click="nextMonth" 
            class="nav-button"
          >
            ›
          </button>
          <div v-else class="nav-spacer"></div>
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
                'selected': !readonly && isDateSelected(day.date),
                'in-range': !readonly && isDateInRange(day.date),
                'range-start': !readonly && isRangeStart(day.date),
                'range-end': !readonly && isRangeEnd(day.date),
                'readonly': readonly
              },
              readonly ? getOverlapClass(day.date) : ''
            ]"
            :style="getOverlapStyle(day.date)"
            @click="!readonly && selectDate(day.date)"
          >
            <span class="day-number">{{ day.day || '' }}</span>
            <div v-if="readonly && getAvailablePeople(day.date).length > 0" class="availability-tooltip">
              <div v-for="person in getAvailablePeople(day.date)" :key="person" class="tooltip-person">
                {{ person }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Second Month (Desktop only) -->
      <div v-if="!isMobile" class="calendar-month glass-calendar">
        <div class="calendar-header">
          <div class="nav-spacer"></div>
          <h3>{{ secondMonthYear }}</h3>
          <button 
            v-if="!readonly" 
            type="button" 
            @click="nextMonth" 
            class="nav-button"
          >
            ›
          </button>
          <div v-else class="nav-spacer"></div>
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
                'selected': !readonly && isDateSelected(day.date),
                'in-range': !readonly && isDateInRange(day.date),
                'range-start': !readonly && isRangeStart(day.date),
                'range-end': !readonly && isRangeEnd(day.date),
                'readonly': readonly
              },
              readonly ? getOverlapClass(day.date) : ''
            ]"
            :style="getOverlapStyle(day.date)"
            @click="!readonly && selectDate(day.date)"
          >
            <span class="day-number">{{ day.day || '' }}</span>
            <div v-if="readonly && getAvailablePeople(day.date).length > 0" class="availability-tooltip">
              <div v-for="person in getAvailablePeople(day.date)" :key="person" class="tooltip-person">
                {{ person }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="!readonly && dateRanges.length > 0" class="calendar-actions">
      <button type="button" @click="clearSelection" class="clear-btn">Clear All</button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DateRange {
  start: string
  end: string
}

interface Person {
  _id: string
  name: string
  dateRanges: DateRange[]
}

const props = defineProps<{
  modelValue: DateRange[]
  readonly?: boolean
  peopleData?: Person[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DateRange[]]
}>()

const { width } = useWindowSize()
const isMobile = computed(() => width.value <= 768)

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

// Get people available on a specific date
function getAvailablePeople(date: string): string[] {
  if (!props.peopleData || !props.readonly) return []
  
  const checkDate = new Date(date)
  const availablePeople: string[] = []
  
  props.peopleData.forEach(person => {
    const isAvailable = person.dateRanges.some(range => {
      const start = new Date(range.start)
      const end = new Date(range.end)
      return checkDate >= start && checkDate <= end
    })
    
    if (isAvailable) {
      availablePeople.push(person.name)
    }
  })
  
  return availablePeople
}

// Get overlap class based on percentage of people available
function getOverlapClass(date: string): string {
  if (!props.readonly || !props.peopleData) return ''
  
  const count = getAvailablePeople(date).length
  if (count === 0) return ''
  
  const totalPeople = props.peopleData.length
  if (totalPeople === 0) return ''
  
  const percentage = (count / totalPeople) * 100
  
  // Dynamic scaling based on percentage
  if (percentage <= 25) return 'overlap-low'      // 0-25% (blue)
  if (percentage <= 50) return 'overlap-medium'   // 25-50% (purple)
  if (percentage <= 75) return 'overlap-high'     // 50-75% (pink)
  return 'overlap-highest'                        // 75-100% (orange)
}

// Get dynamic opacity based on overlap count
function getOverlapStyle(date: string): Record<string, string> {
  if (!props.readonly) return {}
  
  const count = getAvailablePeople(date).length
  if (count === 0) return {}
  
  // Calculate opacity: more people = darker
  const maxPeople = Math.max(
    ...Array.from(new Set(
      props.peopleData?.map(p => p.dateRanges.length) || []
    ))
  )
  
  const opacity = Math.min(0.3 + (count * 0.15), 0.9)
  
  return {}
}
</script>

<style scoped>
.date-range-calendar {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
  overflow: visible;
}

.calendars-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  align-items: start;
  width: 100%;
  overflow: visible;
}

@media (max-width: 768px) {
  .calendars-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

.glass-calendar {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.calendar-month {
  display: flex;
  flex-direction: column;
  overflow: visible;
  width: 100%;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-shrink: 0;
}

.calendar-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.nav-button {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 1.2rem;
  color: #ffffff;
  transition: all 0.3s ease;
  line-height: 1;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.nav-spacer {
  width: 36px;
  height: 36px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  width: 100%;
  overflow: visible;
}

.day-header {
  text-align: center;
  font-weight: 600;
  padding: 8px 4px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.calendar-day {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  aspect-ratio: 1;
  min-height: 40px;
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  isolation: isolate;
}

.calendar-day:hover:not(.readonly) {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.05);
}


.calendar-day.other-month {
  color: rgba(255, 255, 255, 0.3);
  opacity: 0.4;
}

.calendar-day.readonly {
  cursor: default;
}

/* Overlap styling - percentage-based for scalability */
.calendar-day.overlap-low {
  background: rgba(59, 130, 246, 0.4);
  border-color: rgba(59, 130, 246, 0.6);
  color: #ffffff;
}

.calendar-day.overlap-medium {
  background: rgba(168, 85, 247, 0.5);
  border-color: rgba(168, 85, 247, 0.7);
  color: #ffffff;
  font-weight: 600;
}

.calendar-day.overlap-high {
  background: rgba(236, 72, 153, 0.55);
  border-color: rgba(236, 72, 153, 0.75);
  color: #ffffff;
  font-weight: 600;
}

.calendar-day.overlap-highest {
  background: rgba(249, 115, 22, 0.65);
  border-color: rgba(249, 115, 22, 0.85);
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 0 16px rgba(249, 115, 22, 0.5);
}

.calendar-day.overlap-low:hover,
.calendar-day.overlap-medium:hover,
.calendar-day.overlap-high:hover,
.calendar-day.overlap-highest:hover {
  transform: scale(1.08);
  filter: brightness(1.2);
}

.calendar-day.selected {
  background: rgba(99, 102, 241, 0.4);
  color: #ffffff;
  border-color: rgba(99, 102, 241, 0.6);
  font-weight: 600;
}

.calendar-day.in-range {
  background: rgba(99, 102, 241, 0.3);
  color: #ffffff;
  border-color: rgba(99, 102, 241, 0.5);
}

.calendar-day.range-start {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.6), rgba(139, 92, 246, 0.6));
  color: #ffffff;
  font-weight: 700;
  border-color: rgba(99, 102, 241, 0.8);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.calendar-day.range-end {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.6), rgba(139, 92, 246, 0.6));
  color: #ffffff;
  font-weight: 700;
  border-color: rgba(99, 102, 241, 0.8);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

/* Tooltip Styles */
.availability-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: #000000;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  min-width: 120px;
  max-width: 200px;
  z-index: 999999;
  display: none;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
}

.calendar-day.readonly:hover .availability-tooltip {
  display: block;
}

.tooltip-person {
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.8rem;
  padding: 3px 0;
  line-height: 1.4;
}

.day-number {
  display: inline-block;
  color: inherit;
  z-index: 0;
}

.calendar-actions {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.clear-btn {
  background: rgba(239, 68, 68, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #ffffff;
  border: 1px solid rgba(239, 68, 68, 0.5);
  border-radius: 10px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

@media (max-width: 768px) {
  .glass-calendar {
    padding: 15px;
    border-radius: 12px;
  }

  .calendar-header h3 {
    font-size: 1rem;
  }

  .calendar-day {
    min-height: 36px;
    font-size: 0.8125rem;
  }

  .day-header {
    font-size: 0.7rem;
    padding: 6px 2px;
  }
}
</style>