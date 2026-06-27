import { PageLayout } from '@/components/PageLayout'
import { LegalContent } from '@/components/LegalContent'
import { usePageMeta } from '@/hooks/usePageMeta'

export default function Terms() {
  usePageMeta('Terms of Service - Vision Mentors Group')

  return (
    <PageLayout>
      <LegalContent title="Terms of Service" lastUpdated="June 1, 2025">
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing visionmentorsgroup.org, you agree to these Terms of Service. If you do not agree, please do not use this website.
          </p>
        </section>
        <section>
          <h2>2. Use of Website</h2>
          <p>
            This website is provided for informational purposes about VMG programs, partnerships, donations, and procurement. You agree not to misuse the site, attempt unauthorized access, or submit false information through our forms.
          </p>
        </section>
        <section>
          <h2>3. Donations</h2>
          <p>
            Donations are voluntary and, unless otherwise stated, are final. VMG will apply funds in accordance with our mission and donor designations where applicable. Tax deductibility depends on your jurisdiction and our registration status.
          </p>
        </section>
        <section>
          <h2>4. Intellectual Property</h2>
          <p>
            Content on this website—including text, images, logos, and reports—is owned by VMG or used with permission. You may not reproduce materials for commercial use without written consent.
          </p>
        </section>
        <section>
          <h2>5. Procurement & Tenders</h2>
          <p>
            Tender notices published on this site are governed by the specific terms in each tender document. VMG reserves the right to amend, cancel, or reject any bid in accordance with our procurement policy.
          </p>
        </section>
        <section>
          <h2>6. Limitation of Liability</h2>
          <p>
            VMG provides this website &quot;as is&quot; without warranties. We are not liable for indirect damages arising from use of the site or reliance on its content.
          </p>
        </section>
        <section>
          <h2>7. Governing Law</h2>
          <p>
            These terms are governed by the laws of the Republic of Kenya. Disputes shall be subject to the exclusive jurisdiction of Kenyan courts.
          </p>
        </section>
      </LegalContent>
    </PageLayout>
  )
}
