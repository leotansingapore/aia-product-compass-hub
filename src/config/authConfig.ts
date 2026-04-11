export const AUTH_CONFIG = {
  redirectUrls: {
    afterSignIn: '/',
    afterSignOut: '/auth',
    passwordReset: '/force-password',
  },
  
  demo: {
    accounts: [
      {
        type: "Master Admin",
        email: "master_admin@demo.com",
        password: "demo123456",
        description: "Full system access & user management",
        role: "master_admin"
      },
      {
        type: "Admin", 
        email: "admin@demo.com",
        password: "demo123456",
        description: "Admin dashboard & content management",
        role: "admin"
      },
      {
        type: "Regular User",
        email: "user@demo.com", 
        password: "demo123456",
        description: "Standard user experience",
        role: "user"
      }
    ]
  },

  validation: {
    minPasswordLength: 6,
    requiredFields: {
      signIn: ['email', 'password']
    }
  },

  messages: {
    success: {
      signIn: "Welcome back!",
      accountActivated: "Account activated!",
      demoReady: "Demo Account Ready!"
    },
    errors: {
      missingInfo: "Please fill in all fields",
      invalidCredentials: "Invalid login credentials",
      signInFailed: "Sign In Failed"
    }
  }
} as const;