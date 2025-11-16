<template>
  <div class="container">
    <div class="tabs">
      <button
        :class="['tab', { active: activeTab === 'add' }]"
        @click="activeTab = 'add'"
      >
        Add Availability
      </button>
      <button
        :class="['tab', { active: activeTab === 'people' }]"
        @click="activeTab = 'people'"
      >
        People ({{ people.length }})
      </button>
    </div>

    <div class="tab-content">
      <!-- Add Availability Tab -->
      <div v-if="activeTab === 'add'" class="form-section">
        <form @submit.prevent="addPerson" class="person-form">
          <div class="form-group">
            <label for="name">Your Name:</label>
            <input
              id="name"
              v-model="newPerson.name"
              type="text"
              required
              placeholder="Enter your name"
              class="input"
            />
          </div>
          
          <div class="form-group">
            <label>Select Your Available Dates:</label>
            <DateRangeCalendar v-model="newPerson.dateRanges" />
          </div>
          
          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? 'Saving...' : 'Save Availability' }}
          </button>
        </form>
      </div>

      <!-- People Tab -->
      <div v-if="activeTab === 'people'" class="people-section">
        <div v-if="loadingPeople" class="loading">Loading...</div>
        
        <div v-else-if="people.length === 0" class="empty-state">
          <p>No availability added yet. Be the first to add yours!</p>
        </div>
        
        <div v-else class="people-list">
          <div
            v-for="person in people"
            :key="person._id"
            class="person-card"
          >
            <div class="person-header">
              <h3>{{ person.name }}</h3>
              <button
                type="button"
                @click="deletePerson(person._id)"
                class="delete-btn"
                :disabled="deleting === person._id"
              >
                {{ deleting === person._id ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
            
            <div v-if="person.dateRanges && person.dateRanges.length > 0" class="date-ranges">
              <h4>Available Dates:</h4>
              <ul>
                <li v-for="(range, index) in person.dateRanges" :key="index">
                  {{ formatDate(range.start) }} - {{ formatDate(range.end) }}
                </li>
              </ul>
            </div>
            <div v-else class="no-ranges">
              No dates selected
            </div>
          </div>
        </div>
      </div>
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

const activeTab = ref<'add' | 'people'>('add')

const newPerson = ref<Person>({
  name: '',
  dateRanges: []
})

const people = ref<Person[]>([])
const loading = ref(false)
const loadingPeople = ref(false)
const deleting = ref<string | null>(null)

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
    alert('Please enter your name')
    return
  }
  
  if (newPerson.value.dateRanges.length === 0) {
    alert('Please select at least one date range')
    return
  }

  loading.value = true
  try {
    const response = await $fetch<{ success: boolean; data: Person }>('/api/people', {
      method: 'POST',
      body: newPerson.value
    })
    
    if (response.success) {
      people.value.push(response.data)
      newPerson.value = {
        name: '',
        dateRanges: []
      }
      activeTab.value = 'people'
    }
  } catch (error: any) {
    console.error('Failed to add person:', error)
    alert(error.data?.message || 'Failed to save availability. Please try again.')
  } finally {
    loading.value = false
  }
}

async function deletePerson(id: string) {
  if (!confirm('Are you sure you want to delete this availability?')) {
    return
  }

  deleting.value = id
  try {
    const response = await $fetch<{ success: boolean }>(`/api/people/${id}`, {
      method: 'DELETE'
    })
    
    if (response.success) {
      people.value = people.value.filter(p => p._id !== id)
    }
  } catch (error: any) {
    console.error('Failed to delete person:', error)
    alert(error.data?.message || 'Failed to delete availability. Please try again.')
  } finally {
    deleting.value = null
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(() => {
  fetchPeople()
})
</script>

<style scoped>
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 20px;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e5e7eb;
}

.tab {
  background: none;
  border: none;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
}

.tab:hover {
  color: #374151;
}

.tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.tab-content {
  background: white;
  padding: 32px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.person-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group label {
  font-weight: 600;
  color: #111827;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.submit-btn {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 28px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  align-self: flex-start;
}

.submit-btn:hover:not(:disabled) {
  background: #2563eb;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.empty-state p {
  font-size: 1rem;
}

.people-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.person-card {
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s;
}

.person-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.person-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.person-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.delete-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.delete-btn:hover:not(:disabled) {
  background: #dc2626;
}

.delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.date-ranges h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.date-ranges ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.date-ranges li {
  padding: 8px 0;
  color: #374151;
  font-size: 0.875rem;
  border-bottom: 1px solid #f3f4f6;
}

.date-ranges li:last-child {
  border-bottom: none;
}

.no-ranges {
  color: #9ca3af;
  font-size: 0.875rem;
  font-style: italic;
}

@media (max-width: 768px) {
  .container {
    padding: 16px 12px;
  }

  .tab-content {
    padding: 20px;
  }

  .people-list {
    grid-template-columns: 1fr;
  }
}
</style>