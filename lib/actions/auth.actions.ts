'use server';

import {auth} from "@/lib/better-auth/auth";
import {inngest} from "@/lib/inngest/client";
import {headers} from "next/headers";

export const signUpWithEmail = async ({ email, password, fullName, country, investmentGoals, riskTolerance, preferredIndustry } :SignUpFormData) => {
    try {
        const response = await auth.api.signUpEmail({
            body: { email, password, name: fullName }
        })

        // Check if response indicates an error
        if (!response || (response as any)?.error) {
            const errorData = (response as any)?.error || response;
            let errorMessage = 'Failed to create an account. Please try again.';
            
            if (errorData?.message) {
                errorMessage = errorData.message;
            } else if (typeof errorData === 'string') {
                errorMessage = errorData;
            }
            
            // Normalize error messages
            const lowerMessage = errorMessage.toLowerCase();
            if (lowerMessage.includes('email') && (lowerMessage.includes('already') || lowerMessage.includes('exists') || lowerMessage.includes('duplicate'))) {
                errorMessage = 'This email address is already registered. Please use a different email or sign in.';
            } else if (lowerMessage.includes('password') && (lowerMessage.includes('short') || lowerMessage.includes('minimum') || lowerMessage.includes('length'))) {
                errorMessage = 'Password must be at least 8 characters long.';
            }
            
            return {success: false, error: errorMessage };
        }

        if(response){
            await inngest.send({
                name: 'app/user.created',
                data: {
                    email,
                    name: fullName,
                    country,
                    investmentGoals,
                    riskTolerance,
                    preferredIndustry,
                },
            })
        }

        return {success: true, data: response}
    }catch (e: any) {
        console.log('Sign up failed', e)
        
        // Extract error message from better-auth error
        let errorMessage = 'Failed to create an account. Please try again.';
        
        // Try to extract error from various possible structures
        if (e?.message) {
            errorMessage = e.message;
        } else if (e?.error?.message) {
            errorMessage = e.error.message;
        } else if (e?.response?.error?.message) {
            errorMessage = e.response.error.message;
        } else if (e?.data?.message) {
            errorMessage = e.data.message;
        } else if (typeof e === 'string') {
            errorMessage = e;
        }
        
        // Normalize error messages for common cases
        const lowerMessage = errorMessage.toLowerCase();
        if (lowerMessage.includes('email') && (lowerMessage.includes('already') || lowerMessage.includes('exists') || lowerMessage.includes('duplicate'))) {
            errorMessage = 'This email address is already registered. Please use a different email or sign in.';
        } else if (lowerMessage.includes('password') && (lowerMessage.includes('short') || lowerMessage.includes('minimum') || lowerMessage.includes('length'))) {
            errorMessage = 'Password must be at least 8 characters long.';
        }
        
        return {success: false, error: errorMessage }
    }
}

export const signOut = async () =>{
    try {
        await auth.api.signOut({ headers: await headers()})
    }catch (e) {
        console.log('Sign out failed', e)
        return { success : false, error: 'Sign out failed' }
    }
}

export const signInWithEmail = async ({ email, password } : SignInFormData) => {
    try {
        const response = await auth.api.signInEmail({
            body: { email, password}
        })

        // Check if response indicates an error
        if (!response || (response as any)?.error) {
            const errorData = (response as any)?.error || response;
            let errorMessage = 'Failed to sign in. Please try again.';
            
            if (errorData?.message) {
                errorMessage = errorData.message;
            } else if (typeof errorData === 'string') {
                errorMessage = errorData;
            }
            
            // Normalize error messages
            const lowerMessage = errorMessage.toLowerCase();
            if (lowerMessage.includes('invalid') && (lowerMessage.includes('credentials') || lowerMessage.includes('password') || lowerMessage.includes('email'))) {
                errorMessage = 'Invalid email or password. Please check your credentials and try again.';
            } else if (lowerMessage.includes('email') && (lowerMessage.includes('not found') || lowerMessage.includes('does not exist') || lowerMessage.includes('not registered'))) {
                errorMessage = 'No account found with this email address. Please sign up first.';
            } else if (lowerMessage.includes('password') && (lowerMessage.includes('incorrect') || lowerMessage.includes('wrong'))) {
                errorMessage = 'Incorrect password. Please try again.';
            }
            
            return {success: false, error: errorMessage };
        }

        return {success: true, data: response}
    }catch (e: any) {
        console.log('Sign in failed', e)
        
        // Extract error message from better-auth error
        let errorMessage = 'Failed to sign in. Please try again.';
        
        // Try to extract error from various possible structures
        if (e?.message) {
            errorMessage = e.message;
        } else if (e?.error?.message) {
            errorMessage = e.error.message;
        } else if (e?.response?.error?.message) {
            errorMessage = e.response.error.message;
        } else if (e?.data?.message) {
            errorMessage = e.data.message;
        } else if (typeof e === 'string') {
            errorMessage = e;
        }
        
        // Normalize error messages for common cases
        const lowerMessage = errorMessage.toLowerCase();
        if (lowerMessage.includes('invalid') && (lowerMessage.includes('credentials') || lowerMessage.includes('password') || lowerMessage.includes('email'))) {
            errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (lowerMessage.includes('email') && (lowerMessage.includes('not found') || lowerMessage.includes('does not exist') || lowerMessage.includes('not registered'))) {
            errorMessage = 'No account found with this email address. Please sign up first.';
        } else if (lowerMessage.includes('password') && (lowerMessage.includes('incorrect') || lowerMessage.includes('wrong'))) {
            errorMessage = 'Incorrect password. Please try again.';
        }
        
        return {success: false, error: errorMessage }
    }
}