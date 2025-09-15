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
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface UserEmailProps {
  subject: string
  message: string
  emailType: 'notification' | 'welcome' | 'general'
  recipientEmail: string
}

export const UserEmail = ({
  subject,
  message,
  emailType,
  recipientEmail,
}: UserEmailProps) => {
  const getPreviewText = () => {
    switch (emailType) {
      case 'welcome':
        return 'Welcome to FINternship! Get started with your learning journey.';
      case 'notification':
        return 'You have a new notification from FINternship.';
      default:
        return subject;
    }
  };

  const getHeading = () => {
    switch (emailType) {
      case 'welcome':
        return '🎉 Welcome to FINternship!';
      case 'notification':
        return '📢 Notification';
      default:
        return subject;
    }
  };

  return (
    <Html>
      <Head />
      <Preview>{getPreviewText()}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{getHeading()}</Heading>
          
          <Section style={messageSection}>
            <Text style={messageText}>
              {message.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  {index < message.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </Text>
          </Section>

          {emailType === 'welcome' && (
            <Section style={ctaSection}>
              <Link
                href="https://finternship.app"
                target="_blank"
                style={ctaButton}
              >
                Start Learning Now
              </Link>
            </Section>
          )}
          
          <Text style={footer}>
            This email was sent to {recipientEmail}. If you have any questions, 
            please contact our support team.
          </Text>
          
          <Text style={signature}>
            Best regards,<br />
            The FINternship Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default UserEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '580px',
};

const h1 = {
  color: '#333',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0',
  lineHeight: '1.3',
};

const messageSection = {
  margin: '32px 0',
  padding: '24px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  border: '1px solid #e9ecef',
};

const messageText = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0',
};

const ctaSection = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const ctaButton = {
  backgroundColor: '#007bff',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const footer = {
  color: '#6c757d',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '32px 0 16px',
};

const signature = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '24px 0',
};