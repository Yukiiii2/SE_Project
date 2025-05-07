<template>
  <div v-if="editableContact" class="contact-detail">
    <header>
      <button @click="$router.push('/contacts')" class="back-btn">← Back</button>
      <h2>{{ editableContact.firstName }} {{ editableContact.lastName }}</h2>
    </header>

    <div class="contact-container">
      <div class="contact-info">
        <!-- Edit button at top -->
        <div style="margin-bottom: 1rem;">
          <button v-if="!isEditing" @click="enableEditing">Edit</button>
        </div>

        <label>First Name</label>
        <input v-model="editableContact.firstName" :disabled="!isEditing" />

        <label>Last Name</label>
        <input v-model="editableContact.lastName" :disabled="!isEditing" />

        <!-- College Dropdown -->
<label>College</label>
<select v-model="editableContact.college" :disabled="!isEditing">
  <option value="">-- Select College --</option>
  <option v-for="college in colleges" :key="college.id" :value="college.id">
    {{ college.name }}
  </option>
</select>
        <div v-if="showNewCollegeInput" class="mt-2">
          <input v-model="newCollegeName" placeholder="New college name..." />
          <button @click="addNewCollege">Add</button>
          <button @click="cancelNewCollege">Cancel</button>
        </div>

        <!-- Program Dropdown -->
<label>Program</label>
<select v-model="editableContact.program" :disabled="!isEditing">
  <option value="">-- Select Program --</option>
  <option v-for="program in filteredPrograms" :key="program.id" :value="program.name">
    {{ program.name }}
  </option>
</select>
        <div v-if="showNewProgramInput" class="mt-2">
          <input v-model="newProgramName" placeholder="New program name..." />
          <button @click="addNewProgram">Add</button>
          <button @click="cancelNewProgram">Cancel</button>
        </div>

        <label>Contact Number</label>
        <input v-model="editableContact.contactNumber" :disabled="!isEditing" />

        <label>Email</label>
        <input v-model="editableContact.email" :disabled="!isEditing" />

        <label>Date Graduated</label>
        <input v-model="editableContact.dateGraduated" :disabled="!isEditing" />

        <label>Occupation</label>
        <input v-model="editableContact.occupation" :disabled="!isEditing" />

        <label>Company</label>
        <input v-model="editableContact.company" :disabled="!isEditing" />

        <label>Status</label>
        <select v-model="editableContact.status" :disabled="!isEditing">
          <option>Pending</option>
          <option>Contacted</option>
        </select>

        <!-- Expertise Dropdown -->
        <label>Expertise</label>
        <div v-if="isEditing">
          <select v-model="editableContact.expertise">
            <option v-for="tag in expertiseTags" :key="tag.id" :value="tag.name">
              {{ tag.name }}
            </option>
            <option value="__add_new__">+ Add new expertise</option>
          </select>
          <div v-if="showNewExpertiseInput" class="mt-2">
            <input v-model="newExpertiseInput" placeholder="New expertise name..." />
            <button @click="addNewExpertise">Add</button>
            <button @click="cancelNewExpertise">Cancel</button>
          </div>
        </div>
        <div v-else>
          <input v-model="editableContact.expertise" disabled />
        </div>

        <div class="buttons" v-if="isEditing">
          <button @click="saveChanges">Apply</button>
          <button @click="cancelChanges" style="margin-left: 8px;">Cancel</button>
        </div>

        
      </div>

      <!-- Chat Section -->
      <div class="chat-section">
        <h3>Chat</h3>
        <div class="chat-box">
          <div v-for="(message, index) in editableContact.messages" :key="index" class="message">
            <span>{{ message.text }}</span>
            <span class="time">{{ message.time }}</span>
          </div>
        </div>
        <div class="chat-input-container">
          <input v-model="newMessage" placeholder="Type a message..." />
          <button @click="sendMessage">Send</button>
        </div>
      </div>

      <!-- Notes Section -->
      <div class="notes-section">
        <h3>Notes</h3>
        <ul>
          <li v-for="(note, index) in editableContact.notes" :key="note.id" class="note-item">
            <div v-if="editingNoteIndex === index" class="note-edit-container">
              <input v-model="updateNoteText" placeholder="Edit note..." />
              <button @click="saveUpdatedNote">Save</button>
              <button @click="cancelEditNote">Cancel</button>
            </div>
            <div v-else class="note-display">
              <div class="note-text">{{ note.note_text }}</div>
              <div class="note-actions">
                <button @click="startEditNote(index)">Edit</button>
                <button @click="deleteNote(index)">Delete</button>
              </div>
            </div>
          </li>
        </ul>
        <div class="notes-input-container">
          <input v-model="newNote" placeholder="Add a note..." />
          <button @click="addNote">+ Add</button>
        </div>
      </div>
    </div>
  </div>
</template>




<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const route = useRoute()
const router = useRouter()
const contactId = route.params.id

const contact = ref(null)
const editableContact = ref({
  firstName: '',
  lastName: '',
  college: '',
  program: '',
  contactNumber: '',
  email: '',
  dateGraduated: '',
  occupation: '',
  company: '',
  status: 'Pending',
  expertise: '',
  notes: [],
  messages: []
})

const newMessage = ref('')
const newNote = ref('')
const isEditing = ref(false)

const editingNoteIndex = ref(null)
const updateNoteText = ref('')

const expertiseTags = ref([])
const showNewExpertiseInput = ref(false)
const newExpertiseInput = ref('')

const colleges = ref([])
const allPrograms = ref([])
const filteredPrograms = ref([])

const showNewCollegeInput = ref(false)
const newCollegeName = ref('')
const showNewProgramInput = ref(false)
const newProgramName = ref('')

// WATCHERS
watch(() => editableContact.value.college, (val) => {
  if (!val) {
    filteredPrograms.value = []
    return
  }

  filteredPrograms.value = allPrograms.value.filter(p => p.college_id === val)
  editableContact.value.program = ''
})

watch(() => editableContact.value.program, (val) => {
  if (val === '__add_new_program__') {
    nextTick(() => {
      editableContact.value.program = ''
      showNewProgramInput.value = true
    })
  } else {
    showNewProgramInput.value = false
  }
})

watch(() => editableContact.value.expertise, (val) => {
  if (val === '__add_new__') {
    nextTick(() => {
      editableContact.value.expertise = ''
      showNewExpertiseInput.value = true
    })
  }
})

// FETCHERS
const fetchExpertiseTags = async () => {
  const { data } = await supabase.from('expertise_tags').select('*')
  if (data) expertiseTags.value = data
}

const fetchCollegesAndPrograms = async () => {
  const { data: collegeData } = await supabase.from('colleges').select('*')
  const { data: programData } = await supabase.from('programs').select('*')
  if (collegeData) colleges.value = collegeData
  if (programData) allPrograms.value = programData

  if (editableContact.value.college) {
    filteredPrograms.value = programData.filter(p => p.college_id === parseInt(editableContact.value.college))
  }
}

// ADD NEW OPTIONS
const addNewCollege = async () => {
  const name = newCollegeName.value.trim()
  if (!name) return
  const { data, error } = await supabase.from('colleges').insert({ name }).select()
  if (!error && data?.[0]) {
    colleges.value.push(data[0])
    editableContact.value.college = String(data[0].id)
    showNewCollegeInput.value = false
    newCollegeName.value = ''
    filteredPrograms.value = allPrograms.value.filter(p => p.college_id === data[0].id)
  }
}

const cancelNewCollege = () => {
  newCollegeName.value = ''
  showNewCollegeInput.value = false
}

const addNewProgram = async () => {
  const name = newProgramName.value.trim()
  const collegeId = parseInt(editableContact.value.college)
  if (!name || !collegeId) return

  const { data, error } = await supabase.from('programs')
    .insert({ name, college_id: collegeId })
    .select()

  if (!error && data?.[0]) {
    allPrograms.value.push(data[0])
    filteredPrograms.value.push(data[0])
    editableContact.value.program = data[0].name
    showNewProgramInput.value = false
    newProgramName.value = ''
  }
}

const cancelNewProgram = () => {
  newProgramName.value = ''
  showNewProgramInput.value = false
}

const addNewExpertise = async () => {
  const trimmed = newExpertiseInput.value.trim()
  if (!trimmed) return

  const { data, error } = await supabase
    .from('expertise_tags')
    .insert({ name: trimmed })
    .select()

  if (!error && data?.[0]) {
    expertiseTags.value.push(data[0])
    editableContact.value.expertise = data[0].name
    showNewExpertiseInput.value = false
    newExpertiseInput.value = ''
  }
}

const cancelNewExpertise = () => {
  newExpertiseInput.value = ''
  showNewExpertiseInput.value = false
}

// CONTACT MANAGEMENT
const fetchContact = async () => {
  if (contactId === 'new') {
    contact.value = {}
    return
  }

  const { data, error } = await supabase
    .from('alumni_table')
    .select('*')
    .eq('alumni_ID', contactId)
    .single()

  if (error || !data) {
    console.error('Failed to fetch contact:', error)
    router.push('/contacts')
  } else {
    contact.value = data
    editableContact.value = {
      firstName: data.alumni_firstname || '',
      lastName: data.Alumni_LastName || '',
      college: data.college || '',
      program: data.Program || '',
      contactNumber: data.Phone_Number || '',
      email: data.Email || '',
      dateGraduated: data.Year_Graduated || '',
      occupation: data.Occupation_Status || '',
      company: data.company || '',
      status: data.Status || 'Pending',
      expertise: data.expertise || '',
      notes: [],
      messages: []
    }
    fetchNotes()
  }
}
const isDuplicateContact = async () => {
  const { data } = await supabase
    .from('alumni_table')
    .select('alumni_ID')
    .or(`Email.eq.${editableContact.value.email},Phone_Number.eq.${editableContact.value.contactNumber}`)
    .neq('alumni_ID', contactId) // allow updating the current one

  return data?.length > 0
}
const saveChanges = async () => {
  const duplicate = await isDuplicateContact()
  if (duplicate) {
  alert('A contact with the same name, email, or contact number already exists.')
  return
}

  const contactData = { ...editableContact.value }

  let nextId = contactId
  if (contactId === 'new') {
    const { data: existingContacts, error: fetchError } = await supabase
      .from('alumni_table')
      .select('alumni_ID')
      .order('alumni_ID', { ascending: false })
      .limit(1)

    if (fetchError) {
      alert('Unable to create contact')
      return
    }

    nextId = existingContacts?.[0]?.alumni_ID
      ? parseInt(existingContacts[0].alumni_ID) + 1
      : 111
  }

  const payload = {
    alumni_ID: nextId,
    alumni_Name: `${contactData.firstName} ${contactData.lastName}`,
    Alumni_LastName: contactData.lastName,
    alumni_firstname: contactData.firstName,
    Year_Graduated: contactData.dateGraduated,
    Program: contactData.program,
    Phone_Number: contactData.contactNumber,
    Email: contactData.email,
    Address: contactData.address || '',
    Occupation_Status: contactData.occupation,
    Status: contactData.status,
    college: contactData.college,
    company: contactData.company,
    expertise: contactData.expertise
  }

  let response
  if (contactId === 'new') {
    response = await supabase.from('alumni_table').insert(payload)
  } else {
    response = await supabase
      .from('alumni_table')
      .update(payload)
      .eq('alumni_ID', contactId)
  }

  if (response.error) {
    alert('Failed to save contact.')
  } else {
    alert('Contact saved successfully!')
    isEditing.value = false
    router.push('/contacts')
  }
} // 

// NOTE & CHAT (unchanged)
const fetchMessages = async () => {
  const { data } = await supabase
    .from('contact_messages')
    .select('*')
    .eq('alumni_id', contactId)
    .order('sent_at', { ascending: true })

  if (data) {
    editableContact.value.messages = data.map((m) => ({
      text: m.message_text,
      time: new Date(m.sent_at).toLocaleTimeString()
    }))
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim()) return
  editableContact.value.messages.push({ text: newMessage.value, time: new Date().toLocaleTimeString() })
  await supabase.from('contact_messages').insert({ alumni_id: contactId, message_text: newMessage.value })
  newMessage.value = ''
}

const fetchNotes = async () => {
  const { data } = await supabase
    .from('contact_notes')
    .select('*')
    .eq('alumni_ID', contactId)
    .order('created_at', { ascending: false })

  if (data) editableContact.value.notes = data
}

const addNote = async () => {
  if (!newNote.value.trim()) return
  await supabase.from('contact_notes').insert({ alumni_ID: contactId, note_text: newNote.value })
  newNote.value = ''
  fetchNotes()
}

const deleteNote = async (index) => {
  const note = editableContact.value.notes[index]
  await supabase.from('contact_notes').delete().eq('id', note.id)
  fetchNotes()
}

const startEditNote = (index) => {
  editingNoteIndex.value = index
  updateNoteText.value = editableContact.value.notes[index].note_text
}

const saveUpdatedNote = async () => {
  if (editingNoteIndex.value === null || !updateNoteText.value.trim()) return
  const note = editableContact.value.notes[editingNoteIndex.value]
  await supabase.from('contact_notes').update({ note_text: updateNoteText.value }).eq('id', note.id)
  editingNoteIndex.value = null
  updateNoteText.value = ''
  fetchNotes()
}

// Control
const enableEditing = () => { isEditing.value = true }
const cancelChanges = () => { isEditing.value = false }

onMounted(async () => {
  await fetchContact()
  await fetchMessages()
  fetchNotes()
  await fetchExpertiseTags()
  await fetchCollegesAndPrograms()
})
</script>





<style scoped>
.contact-detail {
  max-width: 1400px;
  margin: 2rem auto;
  padding: 2.5rem;
  background: linear-gradient(135deg, #FFF5F7 0%, #FFE0E5 100%);
  border-radius: 24px;
  box-shadow: 0 12px 40px rgba(255, 75, 124, 0.1);
}

header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
  position: relative;
  padding-bottom: 1.5rem;
}

header h2 {
  font-size: 2.2rem;
  background: linear-gradient(45deg, #FF4B7C, #FF1C55);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
}

header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #FF4B7C 0%, #FF1C55 100%);
  border-radius: 4px;
}

.contact-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 2rem;
  height: calc(100vh - 250px);
}

.contact-info {
  padding: 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(255, 75, 124, 0.08);
  overflow-y: auto;
}

.contact-info label {
  color: #FF4B7C;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.03em;
  display: block;
  margin-bottom: 0.5rem;
}

.contact-info input,
.contact-info select {
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 1.2rem;
  border: 2px solid #FFD6DE;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #FFF5F7;
}

.contact-info input:focus,
.contact-info select:focus {
  border-color: #FF1C55;
  background: white;
  box-shadow: 0 0 0 4px rgba(255, 28, 85, 0.1);
}

.chat-section,
.notes-section {
  background: white;
  border-radius: 20px;
  padding: 1.8rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 30px rgba(255, 75, 124, 0.08);
  height: 100%;
}

h3 {
  font-size: 1.4rem;
  color: #FF4B7C;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.chat-box {
  flex-grow: 1;
  padding: 1.5rem;
  background: #FFF5F7;
  border-radius: 16px;
  margin-bottom: 1.2rem;
  border: 2px solid #FFD6DE;
  overflow-y: auto;
}

.message {
  background: linear-gradient(135deg, #FF4B7C, #FF1C55);
  color: white;
  padding: 14px 18px;
  border-radius: 16px;
  margin-bottom: 1.2rem;
  max-width: 100%;
  position: relative;
  box-shadow: 0 4px 15px rgba(255, 75, 124, 0.2);
  animation: slideIn 0.3s ease;
}

.message .time {
  font-size: 0.75rem;
  opacity: 0.9;
  margin-top: 0.5rem;
  display: block;
}

.notes-section ul {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

/* Notes Section Enhancements */
.notes-section li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 2px solid #FFD6DE;
  border-radius: 12px;
  padding: 14px 18px;
  background: #FFF5F7;
  margin-bottom: 0.8rem;
}

.note-text {
  font-size: 1rem;
  font-weight: 500;
  flex-grow: 1;
  margin-right: 16px;
  word-break: break-word;
}

.note-actions {
  display: flex;
  gap: 6px;
}

.note-actions .action-btn {
  background: linear-gradient(135deg, #FF4B7C, #FF1C55);
  border: none;
  color: white;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.3s ease;
}

.note-actions .action-btn:hover {
  background: #ff2e64;
}


.notes-section li:hover {
  transform: translateX(5px);
  background: white;
  border-color: #FF1C55;
}

.chat-input-container,
.notes-input-container {
  display: flex;
  gap: 0.5rem;
}

.chat-section input,
.notes-section input {
  flex-grow: 1;
  padding: 14px 18px;
  border: 2px solid #FFD6DE;
  border-radius: 12px;
  font-size: 1rem;
  background: #FFF5F7;
  margin-top: 1rem;
  transition: all 0.2s ease;
}

button {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: linear-gradient(135deg, #FF4B7C, #FF1C55);
  color: white;
  margin-top: 1rem;
}

.back-btn {
  background: linear-gradient(135deg, #FF4B7C, #FF1C55);
  padding: 10px 20px;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(255, 75, 124, 0.3);
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #FFF5F7;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #FF1C55;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #FF4B7C;
}
</style>