import React, { useState } from "react";
import { supabase } from "./supabase";

export default function Auth({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (isLogin) {
            // 🔑 Login
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) return setError(error.message);
            onLogin(data.user);
        } else {
            // 📝 Signup
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });
            if (error) return setError(error.message);
            if (!data.session) {
                alert("Check your email inbox to confirm your account before logging in.");
            } else {
                onLogin(data.user); // Already signed in
            }
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#fff0f5",
            }}
        >
            <div
                style={{
                    width: "400px",
                    padding: "2rem",
                    background: "white",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    textAlign: "center",
                }}
            >
                <h2 style={{ marginBottom: "0.5rem" }}>
                    {isLogin ? "Welcome Back!" : "Create Account"}
                </h2>
                <p style={{ marginBottom: "1.5rem", color: "gray" }}>
                    {isLogin ? "Sign in to continue" : "Sign up to get started"}
                </p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginBottom: "1rem",
                            borderRadius: "8px",
                            border: "1px solid #ddd",
                        }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginBottom: "1rem",
                            borderRadius: "8px",
                            border: "1px solid #ddd",
                        }}
                    />

                    {error && (
                        <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>
                    )}

                    <button
                        type="submit"
                        style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "8px",
                            background: "#ff4081",
                            color: "white",
                            border: "none",
                            fontWeight: "bold",
                            cursor: "pointer",
                        }}
                    >
                        {isLogin ? "Login" : "Sign Up"}
                    </button>
                </form>

                <p style={{ marginTop: "1rem", fontSize: "14px" }}>
                    {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
                    <span
                        style={{ color: "#ff4081", cursor: "pointer", fontWeight: "bold" }}
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? "Sign Up" : "Login"}
                    </span>
                </p>
            </div>
        </div>
    );
}
