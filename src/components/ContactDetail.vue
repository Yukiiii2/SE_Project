<template>
  <div v-if="editableContact" class="contact-detail">
    <header>
      <button @click="$router.push('/contacts')" class="back-btn">← Back</button>
      <h2>{{ editableContact.firstName }} {{ editableContact.lastName }}</h2>
    </header>

    <div class="contact-container">
      <!-- Contact Information Section -->
      <div class="contact-info">
        <label>First Name</label>
        <input v-model="editableContact.firstName" :disabled="!isEditing" />

        <label>Last Name</label>
        <input v-model="editableContact.lastName" :disabled="!isEditing" />

        <label>College</label>
        <input v-model="editableContact.college" :disabled="!isEditing" />

        <label>Program</label>
        <input v-model="editableContact.program" :disabled="!isEditing" />

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

        <label>Expertise</label>
        <input v-model="editableContact.expertise" :disabled="!isEditing" />

        <div class="buttons">
          <button v-if="isEditing" @click="saveChanges">Apply</button>
          <button v-if="isEditing" @click="cancelChanges">Cancel</button>
          <button v-else @click="enableEditing">Edit</button>
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
          <li v-for="(note, index) in editableContact.notes" :key="index">
            <span>{{ note }}</span>
            <button @click="editNote(index)">✏️</button>
            <button @click="deleteNote(index)">🗑️</button>
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
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { supabase } from '../lib/supabaseClient';

const route = useRoute();
const router = useRouter();
const contactId = route.params.id;

const contact = ref(null);
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
});

const newMessage = ref('');
const newNote = ref('');
const isEditing = ref(false);

const fetchContact = async () => {
  if (contactId === 'new') {
    contact.value = {};
    editableContact.value = {
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
    };
  } else {
    const { data, error } = await supabase
      .from('alumni_table')
      .select('*')
      .eq('alumni_ID', contactId)
      .single();

    if (error || !data) {
      console.error('Failed to fetch contact:', error);
      router.push('/contacts');
    } else {
      contact.value = data;
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
        notes: data.notes || [],
        messages: data.messages || []
      };
    }
  }
};

const saveChanges = async () => {
  const contactData = { ...editableContact.value };

  let nextId = contactId;
  if (contactId === 'new') {
    const { data: existingContacts, error: fetchError } = await supabase
      .from('alumni_table')
      .select('alumni_ID')
      .order('alumni_ID', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('Failed to fetch IDs:', fetchError.message);
      alert('Unable to create contact');
      return;
    }

    nextId = existingContacts?.[0]?.alumni_ID
      ? parseInt(existingContacts[0].alumni_ID) + 1
      : 111;
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
  };

  let response;
  if (contactId === 'new') {
    response = await supabase.from('alumni_table').insert(payload);
  } else {
    response = await supabase
      .from('alumni_table')
      .update(payload)
      .eq('alumni_ID', contactId);
  }

  if (response.error) {
    console.error('Error saving contact:', response.error.message);
    alert('Failed to save contact.');
  } else {
    alert('Contact saved successfully!');
    isEditing.value = false;
    router.push('/contacts');
  }
};

const cancelChanges = () => {
  if (contact.value) {
    editableContact.value = {
      firstName: contact.value.alumni_firstname || '',
      lastName: contact.value.Alumni_LastName || '',
      college: contact.value.college || '',
      program: contact.value.Program || '',
      contactNumber: contact.value.Phone_Number || '',
      email: contact.value.Email || '',
      dateGraduated: contact.value.Year_Graduated || '',
      occupation: contact.value.Occupation_Status || '',
      company: contact.value.company || '',
      status: contact.value.Status || 'Pending',
      expertise: contact.value.expertise || '',
      notes: contact.value.notes || [],
      messages: contact.value.messages || []
    };
  }
  isEditing.value = false;
};

const enableEditing = () => {
  isEditing.value = true;
};

const sendMessage = () => {
  if (newMessage.value.trim()) {
    editableContact.value.messages.push({
      text: newMessage.value,
      time: new Date().toLocaleTimeString()
    });
    newMessage.value = '';
  }
};

const addNote = () => {
  if (newNote.value.trim()) {
    editableContact.value.notes.push(newNote.value);
    newNote.value = '';
  }
};

const deleteNote = (index) => {
  editableContact.value.notes.splice(index, 1);
};

const editNote = (index) => {
  newNote.value = editableContact.value.notes[index];
  deleteNote(index);
};

onMounted(() => {
  fetchContact();
});
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

.notes-section li {
  background: #FFF5F7;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 2px solid #FFD6DE;
  transition: all 0.2s ease;
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