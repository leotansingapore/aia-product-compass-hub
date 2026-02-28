import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Hr,
  Row,
  Column,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface UserApprovedEmailProps {
  userName: string;
  email: string;
  loginUrl: string;
  passwordResetLink?: string;
}

export const UserApprovedEmail = ({
  userName,
  email,
  loginUrl,
  passwordResetLink,
}: UserApprovedEmailProps) => {
  const ctaUrl = passwordResetLink || loginUrl;
  const ctaLabel = passwordResetLink ? 'Set Your Password & Log In →' : 'Log In to FINternship →';

  return (
    <Html>
      <Head />
      <Preview>🎉 Your FINternship account is approved — set your password to get started!</Preview>
      <Body style={main}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Text style={headerLogo}>FINternship</Text>
            <Text style={headerTagline}>Learning Platform</Text>
          </Section>

          {/* Hero */}
          <Section style={heroSection}>
            <Text style={emoji}>🎉</Text>
            <Heading style={h1}>You're approved!</Heading>
            <Text style={heroSubtext}>
              Hi <strong>{userName}</strong>, welcome to the FINternship Learning Platform. Your account is now active and ready to go.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Credentials Box */}
          <Section style={credentialsBox}>
            <Text style={credentialsTitle}>📋 Your Login Details</Text>
            <Row>
              <Column>
                <Text style={credentialLabel}>Email / Username</Text>
                <Text style={credentialValue}>{email}</Text>
              </Column>
            </Row>
            <Row>
              <Column>
                <Text style={credentialLabel}>Password</Text>
                <Text style={credentialValue}>
                  {passwordResetLink
                    ? 'Set via the button below (link expires in 24 hours)'
                    : 'Use the password you registered with'}
                </Text>
              </Column>
            </Row>
            <Row>
              <Column>
                <Text style={credentialLabel}>Platform URL</Text>
                <Link href={loginUrl} style={credentialLink}>{loginUrl}</Link>
              </Column>
            </Row>
          </Section>

          {/* CTA */}
          <Section style={ctaSection}>
            <Button href={ctaUrl} style={button}>
              {ctaLabel}
            </Button>
            {passwordResetLink && (
              <Text style={ctaNote}>
                ⏳ This link expires in 24 hours. If it expires, you can request a new password reset from the login page.
              </Text>
            )}
          </Section>

          <Hr style={divider} />

          {/* What's waiting */}
          <Section style={featuresSection}>
            <Text style={featuresTitle}>What's waiting for you:</Text>
            <Text style={featureItem}>📚 <strong>Product Knowledge Base</strong> — Deep-dive resources on AIA products</Text>
            <Text style={featureItem}>🤖 <strong>AI-Powered Chat</strong> — Ask questions about any product instantly</Text>
            <Text style={featureItem}>🎯 <strong>Roleplay Training</strong> — Practice sales scenarios with AI feedback</Text>
            <Text style={featureItem}>📝 <strong>CMFAS Exam Prep</strong> — Study modules and practice quizzes</Text>
            <Text style={featureItem}>🎥 <strong>Training Videos</strong> — Learn at your own pace</Text>
          </Section>

          <Hr style={divider} />

          <Text style={footer}>
            Questions? Reply to this email or contact your team administrator.
            <br /><br />
            Welcome aboard,<br />
            <strong>The FINternship Team</strong>
          </Text>

          <Text style={footerSmall}>
            You're receiving this email because your FINternship account was approved.
            Visit <Link href={loginUrl} style={footerLink}>{loginUrl}</Link> to get started.
          </Text>

        </Container>
      </Body>
    </Html>
  );
};

export default UserApprovedEmail;

const main = {
  backgroundColor: '#f4f4f7',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '0 0 48px',
  maxWidth: '600px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  overflow: 'hidden' as const,
};

const header = {
  backgroundColor: '#0f172a',
  padding: '24px 40px',
  textAlign: 'center' as const,
};

const headerLogo = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '800',
  margin: '0',
  letterSpacing: '-0.5px',
};

const headerTagline = {
  color: '#94a3b8',
  fontSize: '12px',
  margin: '4px 0 0',
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
};

const heroSection = {
  padding: '40px 40px 24px',
  textAlign: 'center' as const,
};

const emoji = {
  fontSize: '48px',
  margin: '0 0 16px',
  lineHeight: '1',
};

const h1 = {
  color: '#0f172a',
  fontSize: '32px',
  fontWeight: '800',
  margin: '0 0 16px',
  lineHeight: '1.2',
};

const heroSubtext = {
  color: '#475569',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0',
};

const credentialsBox = {
  margin: '0 40px 24px',
  padding: '24px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
};

const credentialsTitle = {
  color: '#0f172a',
  fontSize: '15px',
  fontWeight: '700',
  margin: '0 0 16px',
};

const credentialLabel = {
  color: '#64748b',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  margin: '12px 0 2px',
};

const credentialValue = {
  color: '#0f172a',
  fontSize: '15px',
  fontWeight: '500',
  margin: '0',
  fontFamily: 'monospace',
};

const credentialLink = {
  color: '#0ea5e9',
  fontSize: '15px',
  fontWeight: '500',
  textDecoration: 'none',
};

const ctaSection = {
  textAlign: 'center' as const,
  padding: '8px 40px 32px',
};

const button = {
  backgroundColor: '#0ea5e9',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '700',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 40px',
};

const ctaNote = {
  color: '#64748b',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: '16px 0 0',
};

const featuresSection = {
  padding: '8px 40px 24px',
};

const featuresTitle = {
  color: '#0f172a',
  fontSize: '15px',
  fontWeight: '700',
  margin: '0 0 12px',
};

const featureItem = {
  color: '#475569',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '6px 0',
};

const divider = {
  borderColor: '#e2e8f0',
  margin: '0 40px',
};

const footer = {
  color: '#475569',
  fontSize: '14px',
  lineHeight: '1.7',
  margin: '24px 0 0',
  padding: '0 40px',
};

const footerSmall = {
  color: '#94a3b8',
  fontSize: '12px',
  lineHeight: '1.6',
  margin: '16px 0 0',
  padding: '0 40px',
};

const footerLink = {
  color: '#0ea5e9',
  textDecoration: 'none',
};
