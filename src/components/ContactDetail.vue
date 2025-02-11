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
        <input v-model="newMessage" placeholder="Type a message..." />
        <button @click="sendMessage">Send</button>
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
        <input v-model="newNote" placeholder="Add a note..." />
        <button @click="addNote">+ Add</button>
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
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(145deg, #ffffff, #f3f4f6);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.contact-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  height: calc(100vh - 200px);
}

.contact-info {
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  overflow-y: auto;
}

.contact-info label {
  color: #4b5563;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.5rem;
}

.contact-info input,
.contact-info select {
  width: 100%;
  padding: 10px 14px;
  margin: 4px 0 12px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: #f9fafb;
}

.chat-section,
.notes-section {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-box {
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 12px;
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
}

.message {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  padding: 12px 16px;
  border-radius: 12px 12px 12px 0;
  margin-bottom: 12px;
  max-width: 85%;
  position: relative;
  animation: slideIn 0.3s ease;
}

.message .time {
  position: absolute;
  bottom: -20px;
  right: 0;
  font-size: 0.75rem;
  color: #6b7280;
}

.notes-section {
  display: flex;
  flex-direction: column;
}

.notes-section ul {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.notes-section li {
  background: white;
  padding: 12px;
  border-radius: 10px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
}

.chat-section input,
.notes-section input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  margin-top: auto;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.chat-section input:focus,
.notes-section input:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.chat-section button,
.notes-section button {
  margin-top: 0.5rem;
  width: 100%;
}

h3 {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  color: #374151;
  position: relative;
  padding-bottom: 0.5rem;
}

h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  border-radius: 3px;
}

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #3b82f6;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #2563eb;
}
</style>
Made several improvements:

Adjusted grid layout to be equal width columns
Made sections height consistent with scrollable content
Refined chat bubbles with better positioning
Added gradient underlines to section titles
Improved input field spacing and sizing
Enhanced scrollbar styling
Better organized chat and notes sections with flex layout
Added subtle borders and shadows for depth
Made all sections more compact and fitted

c:\Users\Earl\se_project\src\components\ContactDetail.vue:1-390
readjust all the styles and make it modern and appealing




<style scoped>
.contact-detail {
  max-width: 1400px;
  margin: 2rem auto;
  padding: 2.5rem;
  background: linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%);
  border-radius: 24px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
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
  background: linear-gradient(45deg, #1a365d, #2563eb);
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
  background: linear-gradient(90deg, #2563eb 0%, #1a365d 100%);
  border-radius: 4px;
}

.contact-container {
  display: grid;
  grid-template-columns: 1.2fr 0.9fr 0.9fr;
  gap: 2rem;
  height: calc(100vh - 250px);
}

.contact-info {
  padding: 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
  overflow-y: auto;
}

.contact-info label {
  color: #1a365d;
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
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #f8fafc;
}

.contact-info input:focus,
.contact-info select:focus {
  border-color: #2563eb;
  background: white;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.chat-section,
.notes-section {
  background: white;
  border-radius: 20px;
  padding: 1.8rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
  height: 100%;
}

h3 {
  font-size: 1.4rem;
  color: #1a365d;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.chat-box {
  flex-grow: 1;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 16px;
  margin-bottom: 1.2rem;
  border: 2px solid #e2e8f0;
  overflow-y: auto;
}

.message {
  background: linear-gradient(135deg, #2563eb, #1a365d);
  color: white;
  padding: 14px 18px;
  border-radius: 16px 16px 16px 4px;
  margin-bottom: 1.2rem;
  max-width: 85%;
  position: relative;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.2);
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
  background: #f8fafc;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 2px solid #e2e8f0;
  transition: all 0.2s ease;
}

.notes-section li:hover {
  transform: translateX(5px);
  background: white;
  border-color: #2563eb;
}

.chat-section input,
.notes-section input {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  background: #f8fafc;
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
  background: linear-gradient(135deg, #2563eb, #1a365d);
  color: white;
  margin-top: 0.8rem;
}

.back-btn {
  background: linear-gradient(135deg, #1e293b, #0f172a);
  padding: 10px 20px;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(37, 99, 235, 0.3);
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
  background: #f1f5f9;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #2563eb;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #1a365d;
}
</style>
Key improvements:

Enhanced color scheme with deeper blues and better gradients
Improved spacing and padding throughout
More sophisticated shadows and hover effects
Better typography with gradient text effects
Refined input fields and buttons
More elegant chat bubbles and notes
Smoother transitions and animations
Better visual hierarchy
More consistent styling across all sections
Improved scrollbar design
i want the coloring same as in the homepage




<style scoped>
.contact-detail {
  max-width: 1400px;
  margin: 2rem auto;
  padding: 2.5rem;
  background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
  border-radius: 24px;
  box-shadow: 0 12px 40px rgba(79, 70, 229, 0.1);
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
  background: linear-gradient(45deg, #4F46E5, #6366F1);
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
  background: linear-gradient(90deg, #4F46E5 0%, #6366F1 100%);
  border-radius: 4px;
}

.contact-container {
  display: grid;
  grid-template-columns: 1.2fr 0.9fr 0.9fr;
  gap: 2rem;
  height: calc(100vh - 250px);
}

.contact-info {
  padding: 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(79, 70, 229, 0.08);
  overflow-y: auto;
}

.contact-info label {
  color: #4338CA;
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
  border: 2px solid #E0E7FF;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #F5F7FF;
}

.contact-info input:focus,
.contact-info select:focus {
  border-color: #6366F1;
  background: white;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.chat-section,
.notes-section {
  background: white;
  border-radius: 20px;
  padding: 1.8rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 30px rgba(79, 70, 229, 0.08);
  height: 100%;
}

h3 {
  font-size: 1.4rem;
  color: #4338CA;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.chat-box {
  flex-grow: 1;
  padding: 1.5rem;
  background: #F5F7FF;
  border-radius: 16px;
  margin-bottom: 1.2rem;
  border: 2px solid #E0E7FF;
  overflow-y: auto;
}

.message {
  background: linear-gradient(135deg, #4F46E5, #6366F1);
  color: white;
  padding: 14px 18px;
  border-radius: 16px 16px 16px 4px;
  margin-bottom: 1.2rem;
  max-width: 85%;
  position: relative;
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.2);
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
  background: #F5F7FF;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 2px solid #E0E7FF;
  transition: all 0.2s ease;
}

.notes-section li:hover {
  transform: translateX(5px);
  background: white;
  border-color: #6366F1;
}

.chat-section input,
.notes-section input {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid #E0E7FF;
  border-radius: 12px;
  font-size: 1rem;
  background: #F5F7FF;
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
  background: linear-gradient(135deg, #4F46E5, #6366F1);
  color: white;
  margin-top: 0.8rem;
}

.back-btn {
  background: linear-gradient(135deg, #4338CA, #4F46E5);
  padding: 10px 20px;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(79, 70, 229, 0.3);
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
  background: #F5F7FF;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #6366F1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #4F46E5;
}
</style>