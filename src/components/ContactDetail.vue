<template>
  <div v-if="contact" class="contact-detail">
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

        <!-- Edit & Save Buttons -->
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

<script>
export default {
  props: ["id"],
  data() {
    return {
      contact: null,
      editableContact: {
        firstName: "",
        lastName: "",
        college: "",
        program: "",
        contactNumber: "",
        email: "",
        dateGraduated: "",
        occupation: "",
        company: "",
        status: "Pending",
        messages: [],
        notes: []
      },
      newMessage: "",
      newNote: "",
      isEditing: false
    };
  },
  methods: {
    fetchContact() {
      const allContacts = JSON.parse(localStorage.getItem("contacts")) || [];
      this.contact = allContacts.find((c) => c.id == this.id);

      if (this.contact) {
        this.editableContact = {
          ...this.contact,
          firstName: this.contact.name.split(" ")[0] || "",
          lastName: this.contact.name.split(" ")[1] || "",
          notes: this.contact.notes || [],
          messages: this.contact.messages || []
        };
      } else {
        this.$router.push("/contacts");
      }
    },
    saveChanges() {
      const allContacts = JSON.parse(localStorage.getItem("contacts")) || [];
      const index = allContacts.findIndex((c) => c.id == this.id);
      
      allContacts[index] = {
        ...this.editableContact,
        name: `${this.editableContact.firstName} ${this.editableContact.lastName}`
      };

      localStorage.setItem("contacts", JSON.stringify(allContacts));
      this.contact = { ...this.editableContact };
      this.isEditing = false;
    },
    cancelChanges() {
      this.editableContact = { ...this.contact };
      this.isEditing = false;
    },
    enableEditing() {
      this.isEditing = true;
    },
    sendMessage() {
      if (this.newMessage.trim() !== "") {
        this.editableContact.messages.push({ text: this.newMessage, time: new Date().toLocaleTimeString() });
        this.newMessage = "";
        this.saveChanges();
      }
    },
    addNote() {
      if (this.newNote.trim() !== "") {
        this.editableContact.notes.push(this.newNote);
        this.newNote = "";
        this.saveChanges();
      }
    },
    deleteNote(index) {
      this.editableContact.notes.splice(index, 1);
      this.saveChanges();
    },
    editNote(index) {
      this.newNote = this.editableContact.notes[index];
      this.deleteNote(index);
    }
  },
  created() {
    this.fetchContact();
  }
};
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