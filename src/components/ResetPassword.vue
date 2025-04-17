<template>
  <div class="reset-password-page">
    <div class="background-overlay"></div>
    <div class="reset-password-container">
      <div class="reset-password-form">
        <div class="logo-container">
          <img 
            src="../assets/305975246_480030324173600_4611494949818294877_n.png" 
            alt="Logo" 
            class="logo" 
          />
        </div>
        <h1 class="reset-password-title">Set New Password</h1>
        <p class="reset-password-text">Enter your new password below</p>
        <form @submit.prevent="handleResetPassword">
          <div class="input-group">
            <input
              type="password"
              placeholder="New Password"
              class="input-field"
              v-model="newPassword"
              required
            />
          </div>
          <div class="input-group">
            <input
              type="password"
              placeholder="Confirm Password"
              class="input-field"
              v-model="confirmPassword"
              required
            />
          </div>
          <button type="submit" class="reset-password-button">Confirm</button>
        </form>
        <p v-if="error" class="error-message">{{ error }}</p>
        <p v-if="success" class="success-message">{{ success }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const newPassword = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref('')
const router = useRouter()

const handleResetPassword = async () => {
  error.value = ''
  success.value = ''

  if (!newPassword.value || !confirmPassword.value) {
    error.value = 'Please enter both fields.'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match!'
    return
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword.value
  })

  if (updateError) {
    error.value = updateError.message || 'Failed to update password.'
    return
  }

  success.value = 'Password updated! Redirecting to login...'
  setTimeout(() => {
    router.push('/')
  }, 2000)
}

onMounted(async () => {
  const { session, error: sessionError } = await supabase.auth.getSession()
  if (!session || sessionError) {
    error.value = 'Session expired or invalid. Please request another reset link.'
  }
})
</script>



<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.reset-password-page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url('../assets/Cover.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  overflow-x: hidden;
}

.background-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
}

.reset-password-container {
  position: relative;
  z-index: 1;
  width: 90%;
  max-width: 400px;
  margin: 20px auto;
}

.reset-password-form {
  background: rgba(255, 255, 255, 0.95);
  padding: clamp(20px, 5vw, 40px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.logo-container {
  text-align: center;
  margin-bottom: clamp(16px, 4vw, 24px);
}

.logo {
  width: clamp(80px, 15vw, 120px);
  height: auto;
  object-fit: contain;
}

.reset-password-title {
  text-align: center;
  color: #FF4B7C;
  font-size: clamp(24px, 5vw, 32px);
  margin-bottom: clamp(16px, 4vw, 24px);
  font-weight: 700;
}

.reset-password-text {
  text-align: center;
  color: #6B4E5B;
  font-size: clamp(14px, 3vw, 18px);
  margin-bottom: clamp(16px, 4vw, 24px);
}

.input-group {
  margin-bottom: clamp(16px, 3vw, 20px);
}

.input-field {
  width: 100%;
  padding: clamp(12px, 2.5vw, 14px) clamp(16px, 3vw, 18px);
  border: 2px solid #FFD6DE;
  border-radius: 12px;
  font-size: clamp(16px, 2.5vw, 18px);
  transition: all 0.3s ease;
  outline: none;
  background: #FFF5F7;
}

.input-field:focus {
  border-color: #FF4B7C;
  box-shadow: 0 0 0 4px rgba(255, 75, 124, 0.2);
}

.reset-password-button {
  width: 100%;
  padding: clamp(12px, 2.5vw, 14px);
  background: linear-gradient(135deg, #FF4B7C, #FF1C55);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: clamp(16px, 2.5vw, 18px);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-password-button:hover {
  background: linear-gradient(135deg, #FF1C55, #FF4B7C);
  transform: translateY(-2px);
}

.reset-password-button:active {
  transform: translateY(0) scale(0.98);
}

.error-message {
  color: #FF4B7C;
  text-align: center;
  margin-top: clamp(16px, 3vw, 20px);
}

.success-message {
  color: #4BB543;
  text-align: center;
  margin-top: clamp(16px, 3vw, 20px);
}

/* Large Screens */
@media (min-width: 1200px) {
  .reset-password-container {
    max-width: 450px;
  }
}

/* Medium Screens */
@media (max-width: 768px) {
  .reset-password-container {
    width: 95%;
  }
}

/* Small Screens */
@media (max-width: 480px) {
  .reset-password-form {
    padding: 20px;
  }
  
  .reset-password-container {
    width: 100%;
    margin: 15px;
  }

  .input-field {
    font-size: 16px; /* Prevents zoom on mobile */
  }
}

/* Handle viewport height on mobile */
@media (max-height: 600px) {
  .reset-password-page {
    min-height: 100vh;
    padding: 20px 0;
  }

  .reset-password-form {
    padding: 15px;
  }

  .logo {
    width: 60px;
  }
}

/* Prevent overflow issues */
@media screen and (orientation: landscape) and (max-height: 500px) {
  .reset-password-page {
    min-height: 100vh;
    height: auto;
    padding: 20px 0;
  }
}
</style>