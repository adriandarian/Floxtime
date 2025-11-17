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
          <div v-for="person in people" :key="person._id" class="person-item">
            <div class="person-info">
              <h3>{{ person.name }}</h3>
              <div class="date-ranges">
                <div v-for="(range, index) in person.dateRanges" :key="index" class="date-range-item">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="date-icon">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  <span>{{ formatDateRange(range.start, range.end) }}</span>
                </div>
              </div>
            </div>
            <button @click="deletePerson(person._id)" class="delete-person-btn" :disabled="deleting === person._id">
              {{ deleting === person._id ? 'Deleting...' : '×' }}
            </button>
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
                :disabled="!newPerson.name.trim() || newPerson.dateRanges.length === 0 || loading"
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

const newPerson = ref<Person>({
  name: '',
  dateRanges: []
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
    dateRanges: []
  }
}

async function deletePerson(id: string) {
  if (!confirm('Are you sure you want to delete this person\'s availability?')) {
    return
  }

  deleting.value = id
  try {
    const response = await $fetch<{ success: boolean }>(`/api/people/${id}`, {
      method: 'DELETE'
    })
    
    if (response.success) {
      await fetchPeople()
    }
  } catch (error: any) {
    console.error('Failed to delete person:', error)
    alert(error.data?.message || 'Failed to delete. Please try again.')
  } finally {
    deleting.value = null
  }
}

function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  
  const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  
  return `${startStr} - ${endStr}`
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
  gap: 15px;
}

.person-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.person-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.person-info {
  flex: 1;
}

.person-info h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin: 0 0 12px 0;
}

.date-ranges {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.date-range-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.date-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.delete-person-btn {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: white;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.delete-person-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.4);
  transform: scale(1.1);
}

.delete-person-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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