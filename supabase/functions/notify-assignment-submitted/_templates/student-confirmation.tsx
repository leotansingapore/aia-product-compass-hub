import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Link,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface StudentConfirmationEmailProps {
  firstName: string;
  trackLabel: string;
  assignmentTitle: string;
  submissionExcerpt: string;
  fileName: string | null;
  dashboardUrl: string;
}

export const StudentConfirmationEmail = ({
  firstName,
  trackLabel,
  assignmentTitle,
  submissionExcerpt,
  fileName,
  dashboardUrl,
}: StudentConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>✓ Your {assignmentTitle} submission was received</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>✓ We got your submission</Heading>

          <Text style={text}>Hi {firstName},</Text>

          <Text style={text}>
            Your submission for <strong>{assignmentTitle}</strong> ({trackLabel}) has been received. Your mentor will review it and follow up with feedback. You can resubmit anytime if you want to revise.
          </Text>

          <Section style={detailsBox}>
            <Text style={detailLabel}>Assignment</Text>
            <Text style={detailValue}>{assignmentTitle}</Text>

            <Text style={detailLabel}>Track</Text>
            <Text style={detailValue}>{trackLabel}</Text>

            {fileName ? (
              <>
                <Text style={detailLabel}>File</Text>
                <Text style={detailValue}>{fileName}</Text>
              </>
            ) : null}

            {submissionExcerpt ? (
              <>
                <Text style={detailLabel}>What you submitted</Text>
                <Text style={detailValue}>{submissionExcerpt}</Text>
              </>
            ) : null}
          </Section>

          <Hr style={divider} />

          <Section style={ctaSection}>
            <Link
              href={dashboardUrl}
              target="_blank"
              style={button}
            >
              View your submission
            </Link>
          </Section>

          <Hr style={divider} />
          <Text style={footer}>
            This is an automated confirmation from FINternship. Reply to this email if you have questions about your submission.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default StudentConfirmationEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};
const container = { margin: '0 auto', padding: '20px 0 48px', maxWidth: '580px', backgroundColor: '#ffffff' };
const h1 = { color: '#1a1a1a', fontSize: '24px', fontWeight: 'bold', margin: '40px 0 20px', padding: '0 40px', lineHeight: '1.3' };
const text = { color: '#404040', fontSize: '16px', lineHeight: '1.6', margin: '16px 0', padding: '0 40px' };
const detailsBox = { margin: '24px 40px', padding: '24px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' };
const detailLabel = { color: '#6c757d', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' as const, letterSpacing: '0.5px', margin: '12px 0 4px' };
const detailValue = { color: '#1a1a1a', fontSize: '16px', fontWeight: '500', margin: '0 0 12px', whiteSpace: 'pre-wrap' as const };
const ctaSection = { textAlign: 'center' as const, padding: '0 40px' };
const button = { backgroundColor: '#E4002B', borderRadius: '6px', color: '#fff', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center' as const, display: 'inline-block', padding: '14px 28px', margin: '20px 0' };
const divider = { borderColor: '#e9ecef', margin: '32px 40px' };
const footer = { color: '#6c757d', fontSize: '14px', lineHeight: '1.5', margin: '32px 0 16px', padding: '0 40px' };
