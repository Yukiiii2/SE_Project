<template>
    <div class="register-page">
      <div class="form-container">
        <h2>Create an Account</h2>
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <input type="text" placeholder="First Name" v-model="firstName" required />
          </div>
          <div class="form-group">
            <input type="text" placeholder="Last Name" v-model="lastName" required />
          </div>
          <div class="form-group">
            <input type="email" placeholder="Email" v-model="email" required />
          </div>
          <div class="form-group">
            <input type="password" placeholder="Password" v-model="password" required />
          </div>
          <div class="form-group">
            <input type="password" placeholder="Confirm Password" v-model="confirmPassword" required />
          </div>
          <button type="submit">Register</button>
          <p class="error" v-if="error">{{ error }}</p>
          <p class="success" v-if="success">{{ success }}</p>
          <router-link to="/" class="back-login">Already have an account? Login</router-link>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { supabase } from '../lib/supabaseClient';
  
  const router = useRouter();
  
  const firstName = ref('');
  const lastName = ref('');
  const email = ref('');
  const password = ref('');
  const confirmPassword = ref('');
  const error = ref('');
  const success = ref('');
  
  const handleRegister = async () => {
    error.value = '';
    success.value = '';
  
    if (password.value !== confirmPassword.value) {
      error.value = "Passwords do not match.";
      return;
    }
  
    const { error: signUpError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          first_name: firstName.value,
          last_name: lastName.value
        }
      }
    });
  
    if (signUpError) {
      error.value = signUpError.message;
      return;
    }
  
    success.value = 'Registration successful! Please check your email to verify your account. Redirecting to homepage...';
  
    // Clear form fields
    firstName.value = '';
    lastName.value = '';
    email.value = '';
    password.value = '';
    confirmPassword.value = '';
  
    // Redirect after 6 seconds
    setTimeout(() => {
      router.push('/');
    }, 6000);
  };
  </script>
  
  <style scoped>
  .register-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: #fff5f7;
  }
  
  .form-container {
    background: white;
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 420px;
  }
  
  h2 {
    text-align: center;
    margin-bottom: 24px;
    color: #ff4b7c;
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ffd6de;
    border-radius: 8px;
    background: #fff;
  }
  
  button {
    width: 100%;
    background: #ff4b7c;
    color: white;
    border: none;
    padding: 12px;
    font-weight: bold;
    border-radius: 8px;
    cursor: pointer;
  }
  
  .error {
    color: red;
    margin-top: 12px;
    text-align: center;
  }
  
  .success {
    color: green;
    margin-top: 12px;
    text-align: center;
  }
  
  .back-login {
    display: block;
    text-align: center;
    margin-top: 16px;
    color: #ff4b7c;
    text-decoration: none;
  }
  </style>
  