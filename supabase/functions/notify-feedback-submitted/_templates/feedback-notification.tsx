import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Link,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface FeedbackNotificationEmailProps {
  type: string;
  title: string;
  description: string;
  userEmail: string;
  userName: string;
  pageUrl: string;
}

export const FeedbackNotificationEmail = ({
  type, title, description, userEmail, userName, pageUrl,
}: FeedbackNotificationEmailProps) => {
  const typeEmoji = type === 'bug' ? '🐛' : type === 'feature' ? '💡' : '📝';
  const typeLabel = type === 'bug' ? 'Bug Report' : type === 'feature' ? 'Feature Request' : 'Feedback';

  return (
    <Html>
      <Head />
      <Preview>{typeEmoji} New {typeLabel}: {title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{typeEmoji} New {typeLabel}</Heading>

          <Section style={detailsBox}>
            <Text style={detailLabel}>Title</Text>
            <Text style={detailValue}>{title}</Text>

            <Text style={detailLabel}>Description</Text>
            <Text style={detailValue}>{description}</Text>

            <Text style={detailLabel}>Type</Text>
            <Text style={detailValue}>{typeLabel}</Text>

            <Text style={detailLabel}>Submitted By</Text>
            <Text style={detailValue}>{userName} ({userEmail})</Text>

            <Text style={detailLabel}>Page</Text>
            <Text style={detailValue}>{pageUrl}</Text>
          </Section>

          <Hr style={divider} />

          <Section style={ctaSection}>
            <Text style={text}>
              Review this in the admin dashboard under the Feedback panel.
            </Text>
            <Link
              href="https://aia-product-compass-hub.lovable.app/admin"
              target="_blank"
              style={button}
            >
              Open Admin Dashboard
            </Link>
          </Section>

          <Hr style={divider} />
          <Text style={footer}>
            This is an automated notification from FINternship.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default FeedbackNotificationEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};
const container = { margin: '0 auto', padding: '20px 0 48px', maxWidth: '580px', backgroundColor: '#ffffff' };
const h1 = { color: '#1a1a1a', fontSize: '24px', fontWeight: 'bold', margin: '40px 0 20px', padding: '0 40px', lineHeight: '1.3' };
const text = { color: '#404040', fontSize: '16px', lineHeight: '1.6', margin: '16px 0', padding: '0 40px' };
const detailsBox = { margin: '24px 40px', padding: '24px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' };
const detailLabel = { color: '#6c757d', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' as const, letterSpacing: '0.5px', margin: '12px 0 4px' };
const detailValue = { color: '#1a1a1a', fontSize: '16px', fontWeight: '500', margin: '0 0 12px' };
const ctaSection = { textAlign: 'center' as const, padding: '0 40px' };
const button = { backgroundColor: '#E4002B', borderRadius: '6px', color: '#fff', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center' as const, display: 'inline-block', padding: '14px 28px', margin: '20px 0' };
const divider = { borderColor: '#e9ecef', margin: '32px 40px' };
const footer = { color: '#6c757d', fontSize: '14px', lineHeight: '1.5', margin: '32px 0 16px', padding: '0 40px' };
