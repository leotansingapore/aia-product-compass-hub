import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface PasswordResetEmailProps {
  resetUrl: string;
  appName?: string;
}

export const PasswordResetEmail = ({ 
  resetUrl, 
  appName = "FINternship Learning Platform" 
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your {appName} password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Reset Your {appName} Password</Heading>
        
        <Text style={text}>
          You requested a password reset for your account. Click the button below to create a new password:
        </Text>
        
        <Section style={buttonContainer}>
          <Button href={resetUrl} style={button}>
            Reset Password
          </Button>
        </Section>
        
        
        <Text style={footer}>
          If you didn't request this password reset, please ignore this email. 
          This link will expire in 1 hour.
        </Text>
        
        <Text style={signature}>
          Best regards,<br />
          The {appName} Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default PasswordResetEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#4F46E5',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
  fontWeight: 'bold',
};

const linkText = {
  color: '#4F46E5',
  fontSize: '14px',
  wordBreak: 'break-all' as const,
  margin: '16px 0',
  padding: '8px',
  backgroundColor: '#f8f9fa',
  borderRadius: '4px',
};

const footer = {
  color: '#888',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '32px 0 16px',
  borderTop: '1px solid #eee',
  paddingTop: '16px',
};

const signature = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
};