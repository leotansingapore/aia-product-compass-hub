import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Img,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface PasswordResetEmailProps {
  resetUrl: string
  userEmail: string
}

export const PasswordResetEmail = ({
  resetUrl,
  userEmail,
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your FINternship account password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoContainer}>
          <Heading style={h1}>🏆 FINternship</Heading>
        </Section>
        
        <Heading style={h2}>Password Reset Request</Heading>
        
        <Text style={text}>
          Hello,
        </Text>
        
        <Text style={text}>
          We received a request to reset the password for your FINternship account ({userEmail}). 
          If you made this request, click the button below to set a new password:
        </Text>
        
        <Section style={buttonContainer}>
          <Link href={resetUrl} style={button}>
            Reset Your Password
          </Link>
        </Section>
        
        <Text style={text}>
          This link will expire in 24 hours for security reasons.
        </Text>
        
        <Text style={text}>
          If you didn't request a password reset, you can safely ignore this email. 
          Your password will remain unchanged.
        </Text>
        
        <Text style={footer}>
          <strong>FINternship Learning Platform</strong><br />
          Your gateway to financial expertise
        </Text>
      </Container>
    </Body>
  </Html>
)

export default PasswordResetEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
}

const logoContainer = {
  padding: '32px 20px 20px',
  textAlign: 'center' as const,
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
  textAlign: 'center' as const,
}

const h2 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '600',
  margin: '30px 0 15px',
  padding: '0 20px',
}

const text = {
  color: '#484848',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  padding: '0 20px',
}

const buttonContainer = {
  padding: '27px 20px',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#0ea5e9',
  borderRadius: '8px',
  color: '#fff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '50px',
  textAlign: 'center' as const,
  textDecoration: 'none',
  width: '250px',
}

const footer = {
  color: '#898989',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '48px 0 0',
  padding: '0 20px',
  textAlign: 'center' as const,
}