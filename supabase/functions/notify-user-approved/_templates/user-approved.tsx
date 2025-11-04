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
  Hr,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface UserApprovedEmailProps {
  userName: string;
  loginUrl: string;
  passwordResetLink?: string;
}

export const UserApprovedEmail = ({
  userName,
  loginUrl,
  passwordResetLink,
}: UserApprovedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to FINternship! Your account has been approved.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎉 Welcome to FINternship!</Heading>
          
          <Text style={text}>
            Hi {userName},
          </Text>

          <Text style={text}>
            Great news! Your account has been approved and you now have full access to the FINternship learning platform.
          </Text>

          <Section style={highlightBox}>
            <Text style={highlightText}>
              ✓ Your account has been approved
              <br />
              {passwordResetLink ? '✓ Click below to set your password' : '✓ You can log in immediately'}
              <br />
              ✓ Start exploring our financial advisory training resources
            </Text>
          </Section>

          <Hr style={divider} />

          <Section style={ctaSection}>
            <Text style={text}>
              {passwordResetLink 
                ? 'Click the button below to set your password and activate your account:'
                : 'Click the button below to log in and start your learning journey:'}
            </Text>
            <Link
              href={passwordResetLink || loginUrl}
              target="_blank"
              style={button}
            >
              {passwordResetLink ? 'Set Your Password' : 'Log In to FINternship'}
            </Link>
          </Section>

          <Hr style={divider} />

          <Text style={text}>
            If you have any questions or need assistance, feel free to reach out to our support team.
          </Text>

          <Text style={footer}>
            Best regards,
            <br />
            The FINternship Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default UserApprovedEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '580px',
  backgroundColor: '#ffffff',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0 40px',
  lineHeight: '1.3',
  textAlign: 'center' as const,
};

const text = {
  color: '#404040',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
  padding: '0 40px',
};

const highlightBox = {
  margin: '32px 40px',
  padding: '24px',
  backgroundColor: '#f0f9ff',
  borderRadius: '8px',
  border: '2px solid #0ea5e9',
};

const highlightText = {
  color: '#0c4a6e',
  fontSize: '16px',
  lineHeight: '1.8',
  margin: '0',
  fontWeight: '500',
};

const ctaSection = {
  textAlign: 'center' as const,
  padding: '0 40px',
  margin: '32px 0',
};

const button = {
  backgroundColor: '#0ea5e9',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  margin: '20px 0',
};

const divider = {
  borderColor: '#e9ecef',
  margin: '32px 40px',
};

const footer = {
  color: '#404040',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '32px 0 16px',
  padding: '0 40px',
};
