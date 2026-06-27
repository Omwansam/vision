import { PageLayout } from '@/components/PageLayout'
import { LegalContent } from '@/components/LegalContent'
import { usePageMeta } from '@/hooks/usePageMeta'

export default function Privacy() {
  usePageMeta('Privacy Policy - Vision Mentors Group')

  return (
    <PageLayout>
      <LegalContent title="Privacy Policy" lastUpdated="June 1, 2025">
        <section>
          <h2>1. Introduction</h2>
          <p>
            Vision Mentors Group (&quot;VMG&quot;, &quot;we&quot;, &quot;us&quot;) is committed to protecting your personal information. This policy explains how we collect, use, and safeguard data when you visit our website, donate, volunteer, or engage with our programs.
          </p>
        </section>
        <section>
          <h2>2. Information We Collect</h2>
          <p>We may collect:</p>
          <ul>
            <li>Contact details (name, email, phone, address) when you submit forms</li>
            <li>Donation and payment information processed through secure third-party providers</li>
            <li>Technical data such as IP address, browser type, and pages visited</li>
            <li>Communications you send to us, including tender and partnership inquiries</li>
          </ul>
        </section>
        <section>
          <h2>3. How We Use Your Information</h2>
          <p>Your data is used to:</p>
          <ul>
            <li>Process donations and send receipts</li>
            <li>Respond to inquiries and provide program updates</li>
            <li>Manage procurement and volunteer applications</li>
            <li>Improve our website and measure engagement</li>
            <li>Comply with legal and regulatory obligations in Kenya</li>
          </ul>
        </section>
        <section>
          <h2>4. Data Sharing</h2>
          <p>
            We do not sell your personal information. We may share data with trusted service providers (payment processors, email platforms) under strict confidentiality agreements, or when required by law.
          </p>
        </section>
        <section>
          <h2>5. Your Rights</h2>
          <p>
            You may request access, correction, or deletion of your personal data by contacting info@visionmentorsgroup.org. You may unsubscribe from communications at any time.
          </p>
        </section>
        <section>
          <h2>6. Contact</h2>
          <p>
            For privacy-related questions, email info@visionmentorsgroup.org or write to Vision Mentors Group, Africa REIT House, Karen, 2nd Floor, Nairobi, Kenya.
          </p>
        </section>
      </LegalContent>
    </PageLayout>
  )
}
