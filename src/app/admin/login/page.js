'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function AdminLogin() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            // 1. Autenticar con Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Verificar que el usuario está en la colección de admins
            const adminDoc = await getDoc(doc(db, 'admins', user.uid));

            if (!adminDoc.exists()) {
                // No es admin
                await auth.signOut();
                setError('No tienes permisos de administrador');
                setLoading(false);
                return;
            }

            // 3. Redirigir al panel de admin
            router.push('/admin');

        } catch (err) {
            console.error('Error en login:', err);
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Email o contraseña incorrectos');
            } else if (err.code === 'auth/invalid-email') {
                setError('Email inválido');
            } else {
                setError(`Error: ${err.code} - ${err.message}`);
            }
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError('Por favor ingresa tu email para recuperar la contraseña');
            return;
        }

        try {
            setLoading(true);
            await sendPasswordResetEmail(auth, email);
            setMessage('Se ha enviado un correo para restablecer tu contraseña');
            setError('');
        } catch (err) {
            console.error('Error al enviar email de recuperación:', err);
            if (err.code === 'auth/user-not-found') {
                setError('No existe una cuenta con este email');
            } else if (err.code === 'auth/invalid-email') {
                setError('Email inválido');
            } else {
                setError('Error al enviar el correo de recuperación');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginCard}>
                <div className={styles.header}>
                    <h1 className={styles.title}>🔐 Panel de Administración</h1>
                    <p className={styles.subtitle}>Yofre al Toque</p>
                </div>

                {error && (
                    <div className={styles.error}>
                        ⚠️ {error}
                    </div>
                )}

                {message && (
                    <div className={styles.message}>
                        ✅ {message}
                    </div>
                )}

                <form onSubmit={handleLogin} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email" className={styles.label}>
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@yofre.com"
                            className={styles.input}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password" className={styles.label}>
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className={styles.input}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={styles.submitButton}
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <button
                    onClick={handleForgotPassword}
                    className={styles.forgotPassword}
                    type="button"
                >
                    ¿Olvidaste tu contraseña?
                </button>
            </div>
        </div>
    );
}
