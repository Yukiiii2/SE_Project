<template>
  <div class="login-page">
    <div class="background-overlay"></div>
    <div class="login-container">
      <div class="login-form">
        <div class="logo-container">
          <img 
            src="../assets/305975246_480030324173600_4611494949818294877_n.png" 
            alt="Logo" 
            class="logo" 
          />
        </div>
        <h1 class="login-title">Welcome Back</h1>
        <form @submit.prevent="handleLogin">
          <div class="input-group">
            <input type="email" placeholder="Email" class="input-field" v-model="email" required />
          </div>
          <div class="input-group">
            <input type="password" placeholder="Password" class="input-field" v-model="password" required />
          </div>
          <button type="submit" class="login-button">Sign In</button>
          <p v-if="error" class="error-message">{{ error }}</p>

          <div class="register-section">
            <button type="button" class="register-button" @click="router.push('/register')">
              Create an Account
            </button>
          </div>

          <div class="forgot-password">
            <router-link to="/forgot-password" class="forgot-password-link">Forgot Password?</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

const handleLogin = async () => {
  error.value = ''

  const { data, error: loginError } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  if (loginError) {
    error.value = loginError.message
    return
  }

  // If email is not confirmed
  if (!data.user?.confirmed_at) {
    error.value = "Please verify your email before logging in."
    return
  }

  // Redirect on success
  router.push('/home')
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-page {
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

.login-container {
  position: relative;
  z-index: 1;
  width: 90%;
  max-width: 400px;
  margin: 20px auto;
}

.login-form {
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

.login-title {
  text-align: center;
  color: #FF4B7C;
  font-size: clamp(24px, 5vw, 32px);
  margin-bottom: clamp(24px, 5vw, 32px);
  font-weight: 700;
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

.login-button {
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

.login-button:hover {
  background: linear-gradient(135deg, #FF1C55, #FF4B7C);
  transform: translateY(-2px);
}

.login-button:active {
  transform: translateY(0) scale(0.98);
}

.register-section {
  text-align: center;
  margin-top: 16px;
}

.register-button {
  background: transparent;
  border: 2px solid #FF4B7C;
  color: #FF4B7C;
  padding: 10px 16px;
  font-size: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.register-button:hover {
  background-color: #FF4B7C;
  color: white;
}

.forgot-password {
  text-align: center;
  margin-top: clamp(16px, 3vw, 20px);
}

.forgot-password a {
  color: #FF4B7C;
  text-decoration: none;
  font-size: clamp(14px, 2.5vw, 16px);
  transition: color 0.3s ease;
}

.forgot-password a:hover {
  color: #FF1C55;
}
</style>
