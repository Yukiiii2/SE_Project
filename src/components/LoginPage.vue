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
                        <input
                            type="email"
                            placeholder="Email"
                            class="input-field"
                            v-model="email"
                            required
                        />
                    </div>
                    <div class="input-group">
                        <input
                            type="password"
                            placeholder="Password"
                            class="input-field"
                            v-model="password"
                            required
                        />
                    </div>
                    <button type="submit" class="login-button">Sign In</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "LoginPage",
    data() {
        return {
            email: "",
            password: "",
        };
    },
    methods: {
        handleLogin() {
            console.log("Logging in:", this.email, this.password);
            localStorage.setItem("user", JSON.stringify({ email: this.email }));
            this.$router.push("/home");
        },
    },
};
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
    background-image: url('../assets/Cover.jpg');
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
    color: #333;
    font-size: clamp(20px, 4vw, 24px);
    margin-bottom: clamp(24px, 5vw, 32px);
    font-weight: 600;
}

.input-group {
    margin-bottom: clamp(16px, 3vw, 20px);
}

.input-field {
    width: 100%;
    padding: clamp(10px, 2vw, 12px) clamp(12px, 3vw, 16px);
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: clamp(14px, 2.5vw, 16px);
    transition: all 0.3s ease;
    outline: none;
}

.input-field:focus {
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.login-button {
    width: 100%;
    padding: clamp(10px, 2vw, 12px);
    background: #4a90e2;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: clamp(14px, 2.5vw, 16px);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.login-button:hover {
    background: #357abd;
    transform: translateY(-2px);
}

.login-button:active {
    transform: translateY(0) scale(0.98);
}

/* Large Screens */
@media (min-width: 1200px) {
    .login-container {
        max-width: 450px;
    }
}

/* Medium Screens */
@media (max-width: 768px) {
    .login-container {
        width: 95%;
    }
}

/* Small Screens */
@media (max-width: 480px) {
    .login-form {
        padding: 20px;
    }
    
    .login-container {
        width: 100%;
        margin: 15px;
    }

    .input-field {
        font-size: 16px; /* Prevents zoom on mobile */
    }
}

/* Handle viewport height on mobile */
@media (max-height: 600px) {
    .login-page {
        min-height: 100vh;
        padding: 20px 0;
    }

    .login-form {
        padding: 15px;
    }

    .logo {
        width: 60px;
    }
}

/* Prevent overflow issues */
@media screen and (orientation: landscape) and (max-height: 500px) {
    .login-page {
        min-height: 100vh;
        height: auto;
        padding: 20px 0;
    }
}
</style>