<template>
  <div class="forgot-password-page">
    <div class="background-overlay"></div>
    <div class="forgot-password-container">
      <div class="forgot-password-form">
        <div class="logo-container">
          <img 
            src="../assets/305975246_480030324173600_4611494949818294877_n.png" 
            alt="Logo" 
            class="logo" 
          />
        </div>
        <h1 class="forgot-password-title">Forgot Password</h1>
        <p class="forgot-password-text">Enter your email to reset your password</p>
        <form @submit.prevent="handleForgotPassword">
          <div class="input-group">
            <input
              type="email"
              placeholder="Email"
              class="input-field"
              v-model="email"
              required
            />
          </div>
          <button type="submit" class="reset-password-button">Reset Password</button>
          <div class="back-to-login">
            <router-link to="/" class="back-to-login-link">Back to Login?</router-link>
          </div>
        </form>
        <p v-if="error" class="error-message">{{ error }}</p>
        <p v-if="success" class="success-message">{{ success }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../lib/supabaseClient' 

const email = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

const handleForgotPassword = async () => {
  error.value = ''
  success.value = ''
  loading.value = true

  if (!email.value) {
    error.value = 'Please enter an email.'
    loading.value = false
    return
  }

  try {
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (resetError) {
      console.error('Reset error:', resetError)

      // Properly detect non-existing email based on resetError.status
      if (resetError.status === 400 || resetError.message?.toLowerCase().includes('user')) {
        error.value = 'This email is not registered in our system.'
      } else {
        error.value = 'Something went wrong. Please try again.'
      }
    } else {
      success.value = 'Check your email for the reset link.'
    }
  } catch (err) {
    console.error('Unexpected error:', err)
    error.value = 'Something went wrong. Please try again.'
  }

  loading.value = false
}

</script>



<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.forgot-password-page {
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

.forgot-password-container {
  position: relative;
  z-index: 1;
  width: 90%;
  max-width: 400px;
  margin: 20px auto;
}

.forgot-password-form {
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

.forgot-password-title {
  text-align: center;
  color: #FF4B7C;
  font-size: clamp(24px, 5vw, 32px);
  margin-bottom: clamp(16px, 4vw, 24px);
  font-weight: 700;
}

.forgot-password-text {
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

.back-to-login {
  text-align: center;
  margin-top: clamp(16px, 3vw, 20px);
}

.back-to-login a {
  color: #FF4B7C;
  text-decoration: none;
  font-size: clamp(14px, 2.5vw, 16px);
  transition: color 0.3s ease;
}

.back-to-login a:hover {
  color: #FF1C55;
}

/* Large Screens */
@media (min-width: 1200px) {
  .forgot-password-container {
    max-width: 450px;
  }
}

/* Medium Screens */
@media (max-width: 768px) {
  .forgot-password-container {
    width: 95%;
  }
}

/* Small Screens */
@media (max-width: 480px) {
  .forgot-password-form {
    padding: 20px;
  }
  
  .forgot-password-container {
    width: 100%;
    margin: 15px;
  }

  .input-field {
    font-size: 16px; /* Prevents zoom on mobile */
  }
}

/* Handle viewport height on mobile */
@media (max-height: 600px) {
  .forgot-password-page {
    min-height: 100vh;
    padding: 20px 0;
  }

  .forgot-password-form {
    padding: 15px;
  }

  .logo {
    width: 60px;
  }
}

/* Prevent overflow issues */
@media screen and (orientation: landscape) and (max-height: 500px) {
  .forgot-password-page {
    min-height: 100vh;
    height: auto;
    padding: 20px 0;
  }
}
.error-message {
  color: #ff4b7e;
  font-weight: bold;
  margin-top: 10px;
}

.success-message {
  color: #4caf50;
  font-weight: bold;
  margin-top: 10px;
}

</style>