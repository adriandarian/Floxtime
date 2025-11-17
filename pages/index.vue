<template>
  <div class="main-container">
    <!-- Calendar View -->
    <div v-if="!loadingPeople" class="calendar-view glass-card">
      <!-- Calendar Toolbar -->
      <div class="calendar-toolbar">
        <div class="toolbar-left">
          <h1 class="calendar-title">Availability</h1>
          <span class="people-count">{{ people.length }} {{ people.length === 1 ? 'person' : 'people' }}</span>
        </div>
        
        <div class="toolbar-right">
          <button class="view-btn" :class="{ active: calendarView === 'month' }" @click="calendarView = 'month'">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="btn-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            Month
          </button>
          
          <button class="view-btn" :class="{ active: calendarView === 'list' }" @click="calendarView = 'list'">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="btn-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            List
          </button>
        </div>
      </div>

      <!-- Calendar Content -->
      <div v-if="calendarView === 'month'" class="calendar-content">
        <DateRangeCalendar 
          :model-value="allDateRanges" 
          :readonly="true"
          :people-data="people"
        />
      </div>

      <!-- List View -->
      <div v-else class="list-view">
        <div v-if="people.length === 0" class="empty-list">
          <p>No availability added yet.</p>
        </div>
        
        <div v-else class="people-list">
          <div v-for="person in people" :key="person._id" class="person-card-list">
            <div class="person-card-header">
              <div class="person-avatar">
                {{ person.name.charAt(0).toUpperCase() }}
              </div>
              <div class="person-details">
                <h3 class="person-name">{{ person.name }}</h3>
                <p class="availability-count">{{ person.dateRanges.length }} {{ person.dateRanges.length === 1 ? 'date range' : 'date ranges' }}</p>
              </div>
              <button @click="deletePerson(person._id)" class="delete-person-btn-list" :disabled="deleting === person._id">
                <svg v-if="deleting !== person._id" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="delete-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
                <span v-else class="deleting-text">Deleting...</span>
              </button>
            </div>
            
            <div class="date-ranges-grid">
              <div v-for="(range, index) in person.dateRanges" :key="index" class="date-range-card">
                <div class="date-range-badge">Range {{ index + 1 }}</div>
                <div class="date-range-dates">
                  <div class="date-start">
                    <span class="date-label">From</span>
                    <span class="date-value">{{ formatDateShort(range.start) }}</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="arrow-icon">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                  <div class="date-end">
                    <span class="date-label">To</span>
                    <span class="date-value">{{ formatDateShort(range.end) }}</span>
                  </div>
                </div>
                <div class="date-range-duration">
                  {{ calculateDuration(range.start, range.end) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="loading glass-card">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>

    <!-- Floating Plus Button -->
    <button
      class="add-button"
      @click="isModalOpen = true"
      aria-label="Add new availability"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="icon">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    </button>

    <!-- Add Availability Modal -->
    <Teleport to="body">
      <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content glass-card">
          <div class="modal-header">
            <h2 class="modal-title">Add Availability</h2>
            <button @click="closeModal" class="close-btn">×</button>
          </div>

          <form @submit.prevent="addPerson" class="modal-form">
            <div class="form-group">
              <label for="name">Name</label>
              <input
                id="name"
                v-model="newPerson.name"
                type="text"
                placeholder="Enter your name"
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label for="accessCode">Access Code (to edit/delete later)</label>
              <input
                id="accessCode"
                v-model="newPerson.accessCode"
                type="password"
                placeholder="Create a code (e.g., 1234)"
                class="form-input"
                required
                minlength="4"
              />
              <p class="form-hint">Save this code - you'll need it to modify your availability</p>
            </div>

            <div class="form-group">
              <label>Select Available Dates</label>
              <DateRangeCalendar v-model="newPerson.dateRanges" />
            </div>

            <div class="modal-actions">
              <button type="button" @click="closeModal" class="btn-cancel">
                Cancel
              </button>
              <button
                type="submit"
                class="btn-submit"
                :disabled="!newPerson.name.trim() || !newPerson.accessCode || newPerson.accessCode.length < 4 || newPerson.dateRanges.length === 0 || loading"
              >
                {{ loading ? 'Saving...' : 'Submit' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
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

const people = ref<Person[]>([])
const loadingPeople = ref(false)
const loading = ref(false)
const isModalOpen = ref(false)
const calendarView = ref<'month' | 'list'>('month')
const deleting = ref<string | null>(null)

const newPerson = ref({
  name: '',
  dateRanges: [],
  accessCode: ''
})

const allDateRanges = computed(() => {
  const ranges: DateRange[] = []
  people.value.forEach(person => {
    if (person.dateRanges && person.dateRanges.length > 0) {
      ranges.push(...person.dateRanges)
    }
  })
  return ranges
})

async function fetchPeople() {
  loadingPeople.value = true
  try {
    const response = await $fetch<{ success: boolean; data: Person[] }>('/api/people')
    if (response.success) {
      people.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch people:', error)
    alert('Failed to load people. Please refresh the page.')
  } finally {
    loadingPeople.value = false
  }
}

async function addPerson() {
  if (!newPerson.value.name.trim()) {
    return
  }
  
  if (newPerson.value.dateRanges.length === 0) {
    return
  }

  loading.value = true
  try {
    const response = await $fetch<{ success: boolean; data: Person }>('/api/people', {
      method: 'POST',
      body: newPerson.value
    })
    
    if (response.success) {
      await fetchPeople()
      closeModal()
    }
  } catch (error: any) {
    console.error('Failed to add person:', error)
    alert(error.data?.message || 'Failed to save availability. Please try again.')
  } finally {
    loading.value = false
  }
}

function closeModal() {
  isModalOpen.value = false
  newPerson.value = {
    name: '',
    dateRanges: [],
    accessCode: ''
  }
}

async function deletePerson(id: string) {
  const accessCode = prompt('Enter your access code to delete this availability:')
  
  if (!accessCode) {
    return
  }

  deleting.value = id
  try {
    const response = await $fetch<{ success: boolean }>(`/api/people/${id}`, {
      method: 'DELETE',
      body: { accessCode }
    })
    
    if (response.success) {
      await fetchPeople()
      alert('Availability deleted successfully!')
    }
  } catch (error: any) {
    console.error('Failed to delete person:', error)
    alert(error.data?.message || 'Failed to delete. Check your access code and try again.')
  } finally {
    deleting.value = null
  }
}

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function calculateDuration(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`
}



onMounted(() => {
  fetchPeople()
})
</script>

<style scoped>
.main-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 30px;
  transition: all 0.3s ease;
  width: 100%;
}

.calendar-view {
  width: 100%;
  padding: 30px;
  overflow: visible;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.calendar-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.calendar-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.people-count {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

.view-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.view-btn.active {
  background: rgba(99, 102, 241, 0.3);
  border-color: rgba(99, 102, 241, 0.5);
  color: white;
}

.btn-icon {
  width: 18px;
  height: 18px;
}

.calendar-content {
  width: 100%;
}

/* List View Styles */
.list-view {
  width: 100%;
  padding: 20px 0;
}

.empty-list {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
}

.people-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.person-card-list {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
}

.person-card-list:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.person-card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.person-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(139, 92, 246, 0.4));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.person-details {
  flex: 1;
}

.person-name {
  font-size: 1.4rem;
  font-weight: 600;
  color: white;
  margin: 0 0 4px 0;
}

.availability-count {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.delete-person-btn-list {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: white;
  border-radius: 10px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.3s ease;
  flex-shrink: 0;
  font-size: 0.875rem;
  font-weight: 500;
}

.delete-person-btn-list:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.4);
  transform: translateY(-1px);
}

.delete-person-btn-list:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.delete-icon {
  width: 18px;
  height: 18px;
}

.deleting-text {
  font-size: 0.875rem;
}

.date-ranges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.date-range-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
}

.date-range-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.date-range-badge {
  display: inline-block;
  padding: 4px 10px;
  background: rgba(99, 102, 241, 0.3);
  border: 1px solid rgba(99, 102, 241, 0.5);
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.date-range-dates {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.date-start,
.date-end {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.date-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.date-value {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 500;
}

.arrow-icon {
  width: 20px;
  height: 20px;
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}

.date-range-duration {
  text-align: center;
  padding: 8px;
  background: rgba(99, 102, 241, 0.2);
  border-radius: 6px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
}

.add-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  background: rgba(99, 102, 241, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  z-index: 100;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-button:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 32px rgba(99, 102, 241, 0.4);
  background: rgba(99, 102, 241, 0.9);
}

.add-button .icon {
  width: 32px;
  height: 32px;
  color: white;
}

:deep(.glass-input input) {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

:deep(.glass-input input::placeholder) {
  color: rgba(255, 255, 255, 0.5);
}

:deep(.glass-input input:focus) {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
}

:deep([data-headlessui-state]) {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  color: white;
  transform: scale(1.1);
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  font-size: 0.95rem;
}

.form-input {
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 1rem;
  color: white;
  transition: all 0.3s ease;
  width: 100%;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.form-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
}

.form-hint {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4px;
  font-style: italic;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 10px;
}

.btn-cancel,
.btn-submit {
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-submit {
  background: rgba(99, 102, 241, 0.8);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-submit:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.9);
  transform: translateY(-1px);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .main-container {
    padding: 20px 15px;
  }

  .glass-card {
    padding: 20px;
    border-radius: 16px;
  }

  .calendar-view {
    padding: 20px;
  }

  .calendar-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .calendar-title {
    font-size: 1.5rem;
  }

  .toolbar-right {
    width: 100%;
  }

  .view-btn {
    flex: 1;
    justify-content: center;
  }

  .date-ranges-grid {
    grid-template-columns: 1fr;
  }

  .person-avatar {
    width: 48px;
    height: 48px;
    font-size: 1.25rem;
  }

  .person-name {
    font-size: 1.2rem;
  }

  .add-button {
    bottom: 20px;
    right: 20px;
    width: 56px;
    height: 56px;
  }

  .add-button .icon {
    width: 28px;
    height: 28px;
  }
}
</style>