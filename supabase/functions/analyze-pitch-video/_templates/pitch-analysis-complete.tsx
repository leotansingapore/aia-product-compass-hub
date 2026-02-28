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
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

interface PitchAnalysisCompleteEmailProps {
  userName: string;
  videoTitle: string;
  overallScore: number;
  productKnowledgeScore: number;
  needsDiscoveryScore: number;
  objectionHandlingScore: number;
  closingTechniqueScore: number;
  communicationScore: number;
  executiveSummary: string;
  feedbackUrl: string;
}

function scoreColor(score: number): string {
  if (score >= 8) return '#16a34a';
  if (score >= 6) return '#d97706';
  return '#dc2626';
}

function scoreLabel(score: number): string {
  if (score >= 8) return 'Strong';
  if (score >= 6) return 'Good';
  if (score >= 4) return 'Developing';
  return 'Needs Work';
}

export const PitchAnalysisCompleteEmail = ({
  userName,
  videoTitle,
  overallScore,
  productKnowledgeScore,
  needsDiscoveryScore,
  objectionHandlingScore,
  closingTechniqueScore,
  communicationScore,
  executiveSummary,
  feedbackUrl,
}: PitchAnalysisCompleteEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your pitch analysis is ready — Overall Score: {overallScore}/10</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>📊 Your Pitch Analysis is Ready</Heading>

          <Text style={text}>Hi {userName},</Text>
          <Text style={text}>
            Your pitch analysis for <strong>"{videoTitle}"</strong> has been completed. Here's a summary of your results:
          </Text>

          {/* Overall Score */}
          <Section style={scoreBox}>
            <Text style={overallScoreLabel}>Overall Score</Text>
            <Text style={{ ...overallScoreValue, color: scoreColor(overallScore) }}>
              {overallScore}/10 — {scoreLabel(overallScore)}
            </Text>
          </Section>

          {/* Score Breakdown */}
          <Section style={breakdownBox}>
            <Text style={breakdownTitle}>Score Breakdown</Text>
            <Row style={scoreRow}>
              <Column style={scoreNameCol}><Text style={scoreName}>Product Knowledge</Text></Column>
              <Column style={scoreValCol}><Text style={{ ...scoreVal, color: scoreColor(productKnowledgeScore) }}>{productKnowledgeScore}/10</Text></Column>
            </Row>
            <Row style={scoreRow}>
              <Column style={scoreNameCol}><Text style={scoreName}>Needs Discovery</Text></Column>
              <Column style={scoreValCol}><Text style={{ ...scoreVal, color: scoreColor(needsDiscoveryScore) }}>{needsDiscoveryScore}/10</Text></Column>
            </Row>
            <Row style={scoreRow}>
              <Column style={scoreNameCol}><Text style={scoreName}>Objection Handling</Text></Column>
              <Column style={scoreValCol}><Text style={{ ...scoreVal, color: scoreColor(objectionHandlingScore) }}>{objectionHandlingScore}/10</Text></Column>
            </Row>
            <Row style={scoreRow}>
              <Column style={scoreNameCol}><Text style={scoreName}>Closing Technique</Text></Column>
              <Column style={scoreValCol}><Text style={{ ...scoreVal, color: scoreColor(closingTechniqueScore) }}>{closingTechniqueScore}/10</Text></Column>
            </Row>
            <Row style={scoreRow}>
              <Column style={scoreNameCol}><Text style={scoreName}>Communication</Text></Column>
              <Column style={scoreValCol}><Text style={{ ...scoreVal, color: scoreColor(communicationScore) }}>{communicationScore}/10</Text></Column>
            </Row>
          </Section>

          {/* Executive Summary */}
          {executiveSummary && (
            <>
              <Text style={sectionTitle}>Executive Summary</Text>
              <Text style={summaryText}>{executiveSummary}</Text>
            </>
          )}

          <Hr style={divider} />

          <Section style={ctaSection}>
            <Text style={text}>View your full analysis, strengths, improvement areas, and detailed rubric feedback:</Text>
            <Link href={feedbackUrl} target="_blank" style={button}>
              View Full Analysis
            </Link>
          </Section>

          <Hr style={divider} />

          <Text style={footer}>
            This is an automated notification from FINternship.<br />
            Keep practising — every pitch makes you better! 🚀
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default PitchAnalysisCompleteEmail;

const main = { backgroundColor: '#f6f9fc', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif' };
const container = { margin: '0 auto', padding: '20px 0 48px', maxWidth: '580px', backgroundColor: '#ffffff' };
const h1 = { color: '#1a1a1a', fontSize: '24px', fontWeight: 'bold', margin: '40px 0 20px', padding: '0 40px', lineHeight: '1.3' };
const text = { color: '#404040', fontSize: '16px', lineHeight: '1.6', margin: '16px 0', padding: '0 40px' };
const scoreBox = { margin: '24px 40px', padding: '24px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef', textAlign: 'center' as const };
const overallScoreLabel = { color: '#6c757d', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' as const, letterSpacing: '0.5px', margin: '0 0 8px' };
const overallScoreValue = { fontSize: '28px', fontWeight: 'bold', margin: '0' };
const breakdownBox = { margin: '16px 40px', padding: '20px 24px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' };
const breakdownTitle = { color: '#6c757d', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' as const, letterSpacing: '0.5px', margin: '0 0 12px' };
const scoreRow = { borderBottom: '1px solid #e9ecef', padding: '6px 0' };
const scoreNameCol = { width: '70%' };
const scoreValCol = { width: '30%', textAlign: 'right' as const };
const scoreName = { color: '#404040', fontSize: '14px', margin: '6px 0' };
const scoreVal = { fontSize: '14px', fontWeight: '600', margin: '6px 0' };
const sectionTitle = { color: '#1a1a1a', fontSize: '16px', fontWeight: '600', margin: '24px 0 8px', padding: '0 40px' };
const summaryText = { color: '#404040', fontSize: '15px', lineHeight: '1.7', margin: '0 0 16px', padding: '0 40px' };
const ctaSection = { textAlign: 'center' as const, padding: '0 40px' };
const button = { backgroundColor: '#007bff', borderRadius: '6px', color: '#fff', fontSize: '16px', fontWeight: 'bold', textDecoration: 'none', textAlign: 'center' as const, display: 'inline-block', padding: '14px 28px', margin: '20px 0' };
const divider = { borderColor: '#e9ecef', margin: '32px 40px' };
const footer = { color: '#6c757d', fontSize: '14px', lineHeight: '1.5', margin: '32px 0 16px', padding: '0 40px' };
