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
  Row,
  Column,
} from 'https://esm.sh/@react-email/components@0.0.22';
import * as React from 'https://esm.sh/react@18.3.1';

interface RoleplayFeedbackReadyEmailProps {
  userName: string;
  scenarioTitle: string;
  scenarioDifficulty: string;
  overallScore: number;
  communicationScore: number;
  objectionHandlingScore: number;
  productKnowledgeScore: number;
  activeListeningScore: number;
  feedbackUrl: string;
}

function scoreColor(score: number): string {
  if (score >= 4) return '#16a34a';
  if (score >= 3) return '#d97706';
  return '#dc2626';
}

function overallColor(score: number): string {
  if (score >= 4) return '#16a34a';
  if (score >= 3) return '#d97706';
  return '#dc2626';
}

function difficultyBadgeColor(difficulty: string): string {
  const d = difficulty?.toLowerCase();
  if (d === 'advanced') return '#7c3aed';
  if (d === 'intermediate') return '#d97706';
  return '#16a34a';
}

export const RoleplayFeedbackReadyEmail = ({
  userName,
  scenarioTitle,
  scenarioDifficulty,
  overallScore,
  communicationScore,
  objectionHandlingScore,
  productKnowledgeScore,
  activeListeningScore,
  feedbackUrl,
}: RoleplayFeedbackReadyEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your roleplay feedback is ready — Overall Score: {overallScore}/5</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎭 Your Roleplay Feedback is Ready</Heading>

          <Text style={text}>Hi {userName},</Text>
          <Text style={text}>
            Great work completing the <strong>"{scenarioTitle}"</strong> roleplay scenario
            {scenarioDifficulty && (
              <span> (<span style={{ color: difficultyBadgeColor(scenarioDifficulty), fontWeight: '600' }}>{scenarioDifficulty}</span>)</span>
            )}
            ! Your AI-powered feedback is now available.
          </Text>

          {/* Overall Score */}
          <Section style={scoreBox}>
            <Text style={overallScoreLabel}>Overall Score</Text>
            <Text style={{ ...overallScoreValue, color: overallColor(overallScore) }}>
              {overallScore}/5
            </Text>
          </Section>

          {/* Score Breakdown */}
          <Section style={breakdownBox}>
            <Text style={breakdownTitle}>Competency Scores</Text>
            <Row style={scoreRow}>
              <Column style={scoreNameCol}><Text style={scoreName}>Communication</Text></Column>
              <Column style={scoreValCol}><Text style={{ ...scoreVal, color: scoreColor(communicationScore) }}>{communicationScore}/5</Text></Column>
            </Row>
            <Row style={scoreRow}>
              <Column style={scoreNameCol}><Text style={scoreName}>Active Listening</Text></Column>
              <Column style={scoreValCol}><Text style={{ ...scoreVal, color: scoreColor(activeListeningScore) }}>{activeListeningScore}/5</Text></Column>
            </Row>
            <Row style={scoreRow}>
              <Column style={scoreNameCol}><Text style={scoreName}>Objection Handling</Text></Column>
              <Column style={scoreValCol}><Text style={{ ...scoreVal, color: scoreColor(objectionHandlingScore) }}>{objectionHandlingScore}/5</Text></Column>
            </Row>
            <Row style={scoreRow}>
              <Column style={scoreNameCol}><Text style={scoreName}>Product Knowledge</Text></Column>
              <Column style={scoreValCol}><Text style={{ ...scoreVal, color: scoreColor(productKnowledgeScore) }}>{productKnowledgeScore}/5</Text></Column>
            </Row>
          </Section>

          <Hr style={divider} />

          <Section style={ctaSection}>
            <Text style={text}>View your detailed feedback, tone analysis, strengths, and coaching points:</Text>
            <Link href={feedbackUrl} target="_blank" style={button}>
              View Full Feedback
            </Link>
          </Section>

          <Hr style={divider} />

          <Text style={footer}>
            This is an automated notification from FINternship.<br />
            Keep practising — every session builds your advisory skills! 🚀
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default RoleplayFeedbackReadyEmail;

const main = { backgroundColor: '#f6f9fc', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif' };
const container = { margin: '0 auto', padding: '20px 0 48px', maxWidth: '580px', backgroundColor: '#ffffff' };
const h1 = { color: '#1a1a1a', fontSize: '24px', fontWeight: 'bold', margin: '40px 0 20px', padding: '0 40px', lineHeight: '1.3' };
const text = { color: '#404040', fontSize: '16px', lineHeight: '1.6', margin: '16px 0', padding: '0 40px' };
const scoreBox = { margin: '24px 40px', padding: '24px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef', textAlign: 'center' as const };
const overallScoreLabel = { color: '#6c757d', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' as const, letterSpacing: '0.5px', margin: '0 0 8px' };
const overallScoreValue = { fontSize: '36px', fontWeight: 'bold', margin: '0' };
const breakdownBox = { margin: '16px 40px', padding: '20px 24px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' };
const breakdownTitle = { color: '#6c757d', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' as const, letterSpacing: '0.5px', margin: '0 0 12px' };
const scoreRow = { borderBottom: '1px solid #e9ecef', padding: '6px 0' };
const scoreNameCol = { width: '70%' };
const scoreValCol = { width: '30%', textAlign: 'right' as const };
const scoreName = { color: '#404040', fontSize: '14px', margin: '6px 0' };
const scoreVal = { fontSize: '14px', fontWeight: '600', margin: '6px 0' };
const ctaSection = { textAlign: 'center' as const, padding: '0 40px' };
const button = { backgroundColor: '#007bff', borderRadius: '6px', color: '#fff', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center' as const, display: 'inline-block', padding: '14px 28px', margin: '20px 0' };
const divider = { borderColor: '#e9ecef', margin: '32px 40px' };
const footer = { color: '#6c757d', fontSize: '14px', lineHeight: '1.5', margin: '32px 0 16px', padding: '0 40px' };
