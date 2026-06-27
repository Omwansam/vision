import { Link, useParams } from 'react-router-dom'
import { PageLayout } from '@/components/PageLayout'
import { PageHero } from '@/components/PageHero'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnimationWrapper } from '@/components/AnimationWrapper'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useApiData } from '@/hooks/useApiData'
import { api } from '@/lib/api'
import { mapTender, tenderReferenceFromParam } from '@/lib/mappers'
import { getTenderBySlug } from '@/data/tenders'
import { getTenderDocument } from '@/data/tenderDocuments'
import { site } from '@/data/site'
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  MapPin,
  Mail,
  Printer,
  FileText,
  Info,
  Package,
} from 'lucide-react'

const statusConfig = {
  open: {
    label: 'Open',
    className: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
  },
  closed: {
    label: 'Closed',
    className: 'bg-muted text-muted-foreground border-border',
    icon: Clock,
  },
  awarded: {
    label: 'Awarded',
    className: 'bg-primary/10 text-primary border-primary/20',
    icon: CheckCircle,
  },
}

function StatusBadge({ status }) {
  const config = statusConfig[status] ?? statusConfig.closed
  const Icon = config.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.className}`}>
      <Icon size={14} />
      {config.label}
    </span>
  )
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getDaysUntilDeadline(deadline) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const end = new Date(deadline)
  end.setHours(0, 0, 0, 0)
  return Math.ceil((end - now) / (1000 * 60 * 60 * 24))
}

function TenderNotFound() {
  return (
    <PageLayout>
      <section className="py-24 text-center">
        <div className="max-w-lg mx-auto px-4">
          <FileText className="mx-auto text-muted-foreground mb-4" size={48} />
          <h1 className="text-3xl font-bold text-foreground mb-4">Tender Not Found</h1>
          <p className="text-muted-foreground mb-8">
            This tender reference does not exist or may have been removed.
          </p>
          <Button asChild>
            <Link to="/tenders">
              <ArrowLeft size={16} />
              Back to Tenders
            </Link>
          </Button>
        </div>
      </section>
    </PageLayout>
  )
}

function ResponsiveTable({ headers, rows }) {
  return (
    <>
      <div className="tender-table-desktop hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {headers.map((header) => (
                <th key={header} className="py-3 px-4 font-semibold text-foreground">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="border-b border-border">
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="py-3 px-4 text-muted-foreground">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="tender-table-mobile md:hidden space-y-3">
        {rows.map((row, idx) => (
          <Card key={idx} className="p-4">
            {headers.map((header, cellIdx) => (
              <div key={header} className={cellIdx < headers.length - 1 ? 'mb-2' : ''}>
                <p className="text-xs font-semibold text-foreground">{header}</p>
                <p className="text-sm text-muted-foreground">{row[cellIdx]}</p>
              </div>
            ))}
          </Card>
        ))}
      </div>
    </>
  )
}

function TenderSection({ number, title, children }) {
  return (
    <section id={`section-${number}`} className="scroll-mt-24">
      <h2 className="text-xl font-bold text-foreground mb-4">
        {number}. {title}
      </h2>
      <div className="text-muted-foreground leading-relaxed">{children}</div>
    </section>
  )
}

function DryFoodstuffsTenderContent({ tender, doc }) {
  const closingDisplay = `${formatDate(tender.deadline)} at ${tender.deadlineTime}`

  return (
    <div className="tender-document space-y-10">
      <TenderSection number={1} title="Invitation to Tender">
        <p>
          Vision Mentors Group invites sealed bids from eligible and qualified suppliers for the
          supply and delivery of dry foodstuffs on a framework contract basis, to support ongoing
          operations of the Cerebral Palsy Caregiving and Rehabilitation Center.
        </p>
      </TenderSection>

      <TenderSection number={2} title="Tender Details">
        <ResponsiveTable
          headers={['Field', 'Value']}
          rows={[
            ['Tender Reference No.', tender.id],
            ['Tender Description', tender.title],
            ['Contract Type', `${tender.contractType} (LPO call-offs)`],
            ['Date of Issue', formatDate(tender.published)],
            ['Tender Closing Date & Time', closingDisplay],
            ['Delivery Location', 'As specified in each LPO'],
          ]}
        />
      </TenderSection>

      <TenderSection number={3} title="Scope of Supply">
        <p className="mb-4">
          The successful bidder shall supply and deliver dry foodstuffs including but not limited to:
        </p>
        <ResponsiveTable
          headers={['Item', 'Description', 'Unit']}
          rows={doc.scopeItems.map((item) => [item.item, item.description, item.unit])}
        />
        <p className="mt-4 text-sm italic">
          Note: The procuring entity reserves the right to amend quantities based on operational
          requirements.
        </p>
      </TenderSection>

      <TenderSection number={4} title="Framework Contract Terms">
        <ul className="list-disc pl-6 space-y-2">
          {doc.frameworkTerms.map((term) => (
            <li key={term}>{term}</li>
          ))}
        </ul>
      </TenderSection>

      <TenderSection number={5} title="Eligibility Requirements">
        <p className="mb-4">Interested bidders shall submit:</p>
        <ul className="list-disc pl-6 space-y-2">
          {doc.eligibilityRequirements.map((req) => (
            <li key={req}>{req}</li>
          ))}
        </ul>
      </TenderSection>

      <TenderSection number={6} title="Delivery Requirements">
        <ul className="list-disc pl-6 space-y-2">
          {doc.deliveryRequirements.map((req) => (
            <li key={req}>{req}</li>
          ))}
        </ul>
      </TenderSection>

      <TenderSection number={7} title="Pricing">
        <ul className="list-disc pl-6 space-y-2">
          {doc.pricingTerms.map((term) => (
            <li key={term}>{term}</li>
          ))}
        </ul>
      </TenderSection>

      <TenderSection number={8} title="Evaluation Criteria">
        <p className="mb-4">Bids will be evaluated based on (in order of assessment):</p>
        <ol className="list-decimal pl-6 space-y-2">
          {doc.evaluationCriteria.map((criterion) => (
            <li key={criterion}>{criterion}</li>
          ))}
        </ol>
        <p className="mt-4">
          Only technically compliant bids proceed to financial evaluation.
        </p>
      </TenderSection>

      <TenderSection number={9} title="Payment Terms">
        <p className="mb-4">
          Payment shall be made within forty-five (45) days from the date of receipt of a valid
          invoice and successful delivery of goods accepted by the procuring entity.
        </p>
        <p className="mb-2 font-medium text-foreground">The supplier shall submit:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          {doc.paymentDocuments.map((docItem) => (
            <li key={docItem}>{docItem}</li>
          ))}
        </ul>
        <p>No advance payment shall be made unless otherwise agreed in writing.</p>
      </TenderSection>

      <TenderSection number={10} title="Validity of Tender">
        <p>
          Tender submissions shall remain valid for a period of ninety (90) days from the closing
          date.
        </p>
      </TenderSection>

      <TenderSection number={11} title="Submission of Bids">
        <p className="mb-4">
          Completed tender documents should be submitted in a sealed envelope clearly marked:
        </p>
        <blockquote className="border-l-4 border-primary pl-4 py-2 my-4 bg-primary/5 font-mono text-sm text-foreground">
          &ldquo;{doc.envelopeMarking}&rdquo;
        </blockquote>
        <p className="mb-4 font-medium text-foreground">Addressed to:</p>
        <address className="not-italic mb-4">
          Procurement Manager<br />
          Vision Mentors Group<br />
          {site.address.line1}<br />
          {site.address.line2}<br />
          P.O. Box [TBC]<br />
          Email:{' '}
          <a href={`mailto:${site.tendersEmail}`} className="text-primary hover:underline">
            {site.tendersEmail}
          </a>
          <br />
          Telephone: {site.phone}
        </address>
        <p>
          Tenders must be received on or before the closing date and time specified in this
          document.
        </p>
      </TenderSection>

      <TenderSection number={12} title="Award of Contract">
        <p>
          The contract shall be awarded to the bidder who meets the requirements of this tender and
          offers the most advantageous proposal.
        </p>
      </TenderSection>

      <TenderSection number={13} title="Reservation of Rights">
        <p>
          The procuring entity reserves the right to accept or reject any tender in whole or in part
          and is not bound to give reasons for its decision.
        </p>
      </TenderSection>

      <div className="border-t border-border pt-8">
        <p className="text-foreground">
          <span className="font-semibold">Authorized by:</span> Procurement Manager, Vision Mentors
          Group
        </p>
        <p className="text-muted-foreground mt-1">
          <span className="font-semibold text-foreground">Date:</span>{' '}
          {formatDate(tender.published)}
        </p>
      </div>

      <section id="annex-a" className="scroll-mt-24">
        <h2 className="text-xl font-bold text-foreground mb-4">Annex A — Price Schedule</h2>
        <p className="text-muted-foreground mb-4">
          Bidders must complete this schedule with unit prices for all items listed in Section 3.
        </p>
        <ResponsiveTable
          headers={['Item No.', 'Description', 'Unit', 'Unit Price (KES)']}
          rows={doc.scopeItems.map((item) => [
            item.item,
            item.description,
            item.unit,
            '_____________',
          ])}
        />
      </section>
    </div>
  )
}

export default function TenderDetail() {
  const { slug } = useParams()
  const referenceId = tenderReferenceFromParam(slug)

  const { data: tender, loading } = useApiData(async () => {
    try {
      const res = await api.getTender(referenceId)
      return mapTender(res.data)
    } catch {
      return getTenderBySlug(slug) || null
    }
  }, [slug, referenceId])

  const doc = getTenderDocument(slug)

  usePageMeta(
    tender
      ? `${tender.id} - ${tender.title} | VMG Tenders`
      : 'Tender Not Found - Vision Mentors Group',
  )

  if (loading) {
    return (
      <PageLayout>
        <section className="py-24 text-center text-muted-foreground">Loading tender…</section>
      </PageLayout>
    )
  }

  if (!tender) {
    return <TenderNotFound />
  }

  if (!doc) {
    return (
      <PageLayout>
        <PageHero title={tender.title} description={`Tender No: ${tender.id}`} />
        <section className="py-12 md:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="p-8 space-y-6">
              <p className="text-muted-foreground leading-relaxed">{tender.description}</p>
              {tender.documents?.length > 0 && (
                <div>
                  <h2 className="font-semibold text-foreground mb-3">Documents</h2>
                  <ul className="space-y-2">
                    {tender.documents.map((d) => (
                      <li key={d.id}>
                        <a href={d.fileUrl} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                          {d.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Button asChild variant="outline">
                <Link to="/tenders"><ArrowLeft size={16} />Back to Tenders</Link>
              </Button>
            </Card>
          </div>
        </section>
      </PageLayout>
    )
  }

  const daysLeft = getDaysUntilDeadline(tender.deadline)
  const clarificationMailto = `mailto:${site.tendersEmail}?subject=${encodeURIComponent(`Clarification - ${tender.id}`)}`
  const requestDocsMailto = `mailto:${site.tendersEmail}?subject=${encodeURIComponent(`Request Tender Documents - ${tender.id}`)}`

  return (
    <PageLayout>
      <div className="no-print">
        <PageHero
          title={tender.title}
          description={`Tender No: ${tender.id} · ${tender.contractType}`}
        >
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Button asChild variant="outline" size="sm">
              <Link to="/tenders">
                <ArrowLeft size={16} />
                All Tenders
              </Link>
            </Button>
          </div>
        </PageHero>
      </div>

      <div className="print-only hidden print:block py-8 px-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          TENDER DOCUMENT FOR THE SUPPLY OF DRY FOODSTUFFS
        </h1>
        <p className="text-lg font-mono text-primary mb-6">Tender No: {tender.id}</p>
      </div>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 lg:gap-12">
            <aside className="no-print lg:sticky lg:top-24 lg:self-start space-y-4">
              <AnimationWrapper animation="fade-in" delay={0}>
                <Card className="p-6 border-2 border-primary/20">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Reference
                  </p>
                  <p className="font-mono font-bold text-primary text-lg mb-4">{tender.id}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <StatusBadge status={tender.status} />
                    <span className="text-xs px-2 py-1 rounded bg-secondary/10 text-secondary font-medium">
                      {tender.category}
                    </span>
                  </div>

                  {tender.contractType && (
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-1">Contract Type</p>
                      <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                        <Package size={14} className="text-primary" />
                        {tender.contractType}
                      </p>
                    </div>
                  )}

                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-1">Closing Date</p>
                    <p className="text-sm font-medium text-foreground">
                      {formatDate(tender.deadline)}
                    </p>
                    {tender.deadlineTime && (
                      <p className="text-sm text-muted-foreground">{tender.deadlineTime}</p>
                    )}
                    {tender.status === 'open' && daysLeft >= 0 && (
                      <p
                        className={`text-xs font-semibold mt-2 ${daysLeft <= 7 ? 'text-destructive' : 'text-primary'}`}
                      >
                        {daysLeft === 0
                          ? 'Closes today'
                          : `${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining`}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <MapPin size={12} />
                      Location
                    </p>
                    <p className="text-sm font-medium text-foreground">{tender.location}</p>
                  </div>

                  {tender.project && (
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-1">Project</p>
                      <p className="text-sm font-medium text-foreground">{tender.project}</p>
                    </div>
                  )}

                  <div className="space-y-2 pt-4 border-t border-border">
                    <Button
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={() => window.print()}
                    >
                      <Printer size={16} />
                      Download PDF
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <a href={clarificationMailto}>
                        <Mail size={16} />
                        Request Clarification
                      </a>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <a href={requestDocsMailto}>Request Documents</a>
                    </Button>
                  </div>
                </Card>
              </AnimationWrapper>
            </aside>

            <div className="min-w-0">
              <AnimationWrapper animation="slide-up" delay={100}>
                <Card className="p-6 mb-8 border-l-4 border-l-primary bg-primary/5 no-print">
                  <div className="flex gap-3">
                    <Info className="text-primary shrink-0 mt-0.5" size={20} />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Project Context</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {doc.projectContext}
                      </p>
                    </div>
                  </div>
                </Card>
              </AnimationWrapper>

              <AnimationWrapper animation="slide-up" delay={150}>
                <Card className="p-6 md:p-10 border-2 border-border tender-print">
                  <DryFoodstuffsTenderContent tender={tender} doc={doc} />
                </Card>
              </AnimationWrapper>

              <Card className="p-6 mt-8 no-print">
                <h3 className="font-semibold text-foreground mb-3">Physical Bid Submission</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Submit your completed bid in a sealed envelope at our office during{' '}
                  {site.officeHours}. Online bid upload is not available for this tender.
                </p>
                <address className="not-italic text-sm text-muted-foreground">
                  {site.name}<br />
                  {site.address.line1}<br />
                  {site.address.line2}
                </address>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
