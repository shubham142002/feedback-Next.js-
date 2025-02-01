import {
  Html,
  Head,
  Font,
  Preview,
  Container,
  Section,
  Text,
  Button,
} from '@react-email/components';

interface VerificationEmailProps {
  username: string;
  otp: string;
}

export default function VerificationEmail({ username, otp }: VerificationEmailProps) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Your verification code: {otp}</Preview>
      <Container>
        <Section>
          <Text>Hello {username},</Text>
          <Text>
            Thank you for registering. Please use the following verification
            code to complete your registration:
          </Text>
          <Text style={{ 
            fontSize: '24px', 
            fontWeight: 'bold',
            textAlign: 'center',
            padding: '20px',
            margin: '20px 0',
            background: '#f3f4f6',
            borderRadius: '8px'
          }}>
            {otp}
          </Text>
          <Text>
            This code will expire in 1 hour. If you did not request this code,
            please ignore this email.
          </Text>
          <Button
            href={`${process.env.NEXT_PUBLIC_APP_URL}/verify/${username}`}
            style={{
              background: '#2C786C',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '6px',
              textDecoration: 'none',
              textAlign: 'center',
              display: 'inline-block',
              marginTop: '16px'
            }}
          >
            Verify Account
          </Button>
        </Section>
      </Container>
    </Html>
  );
} 