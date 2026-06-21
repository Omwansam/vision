const config = require('../config/env');
const { buildUnsubscribeUrl } = require('../utils/unsubscribeToken');

const orgName = () => config.SMTP_FROM_NAME;

function layout({ title, body, footer }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 24px;">
  <p style="font-size: 18px; font-weight: 600; margin: 0 0 16px;">${orgName()}</p>
  ${body}
  ${footer ? `<hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0 16px;" /><p style="font-size: 12px; color: #666;">${footer}</p>` : ''}
</body>
</html>`.trim();
}

function newsletterWelcome(email) {
  const unsubscribeUrl = buildUnsubscribeUrl('newsletter', email);
  return {
    subject: `Welcome to ${orgName()} updates`,
    html: layout({
      title: 'Newsletter subscription confirmed',
      body: `
        <p>Thank you for subscribing to our newsletter.</p>
        <p>You'll receive occasional updates about our programs, impact stories, and community news.</p>
      `,
      footer: `<a href="${unsubscribeUrl}">Unsubscribe</a> from these emails.`,
    }),
  };
}

function newsletterBroadcast({ subject, bodyHtml, email }) {
  const unsubscribeUrl = buildUnsubscribeUrl('newsletter', email);
  return {
    subject,
    html: layout({
      title: subject,
      body: bodyHtml,
      footer: `<a href="${unsubscribeUrl}">Unsubscribe</a> from these emails.`,
    }),
  };
}

function tenderAlertWelcome(email) {
  const unsubscribeUrl = buildUnsubscribeUrl('tender-alerts', email);
  return {
    subject: `Tender alerts — ${orgName()}`,
    html: layout({
      title: 'Tender alert subscription confirmed',
      body: `
        <p>You're now subscribed to procurement tender alerts from ${orgName()}.</p>
        <p>We'll email you when new tenders are published.</p>
      `,
      footer: `<a href="${unsubscribeUrl}">Unsubscribe</a> from tender alerts.`,
    }),
  };
}

function newTenderAlert(tender, email) {
  const unsubscribeUrl = buildUnsubscribeUrl('tender-alerts', email);
  const deadline = tender.deadline
    ? new Date(tender.deadline).toLocaleDateString('en-KE', { dateStyle: 'long' })
    : 'See tender details';

  return {
    subject: `New tender: ${tender.title}`,
    html: layout({
      title: 'New tender published',
      body: `
        <p>A new tender has been published:</p>
        <p><strong>${tender.title}</strong><br/>
        Reference: ${tender.referenceId}<br/>
        Category: ${tender.category}<br/>
        Deadline: ${deadline}</p>
        ${tender.description ? `<p>${tender.description.slice(0, 400)}${tender.description.length > 400 ? '…' : ''}</p>` : ''}
        <p><a href="${config.WEBSITE_URL}/tenders">View all tenders</a></p>
      `,
      footer: `<a href="${unsubscribeUrl}">Unsubscribe</a> from tender alerts.`,
    }),
  };
}

function contactConfirmation(submission) {
  return {
    subject: `We received your message — ${orgName()}`,
    html: layout({
      title: 'Message received',
      body: `
        <p>Hi ${submission.fullName},</p>
        <p>Thank you for contacting us. We've received your message and will respond within 24 business hours.</p>
        <p><strong>Reference:</strong> ${submission.referenceCode}<br/>
        <strong>Subject:</strong> ${submission.subject}</p>
      `,
    }),
  };
}

function contactAdminNotification(submission) {
  return {
    subject: `[Contact] ${submission.subject} — ${submission.fullName}`,
    html: layout({
      title: 'New contact submission',
      body: `
        <p><strong>From:</strong> ${submission.fullName} &lt;${submission.email}&gt;</p>
        ${submission.phone ? `<p><strong>Phone:</strong> ${submission.phone}</p>` : ''}
        <p><strong>Subject:</strong> ${submission.subject}</p>
        <p><strong>Reference:</strong> ${submission.referenceCode}</p>
        <p>${submission.message.replace(/\n/g, '<br/>')}</p>
      `,
    }),
  };
}

function volunteerConfirmation(application) {
  return {
    subject: `Volunteer application received — ${orgName()}`,
    html: layout({
      title: 'Application received',
      body: `
        <p>Hi ${application.fullName},</p>
        <p>Thank you for your interest in volunteering with us. We've received your application and our team will review it shortly.</p>
        <p><strong>Reference:</strong> ${application.referenceCode}</p>
      `,
    }),
  };
}

function volunteerAdminNotification(application) {
  return {
    subject: `[Volunteer] ${application.fullName}`,
    html: layout({
      title: 'New volunteer application',
      body: `
        <p><strong>Name:</strong> ${application.fullName}</p>
        <p><strong>Email:</strong> ${application.email}</p>
        ${application.phone ? `<p><strong>Phone:</strong> ${application.phone}</p>` : ''}
        ${application.preferredRole ? `<p><strong>Preferred role:</strong> ${application.preferredRole}</p>` : ''}
        ${application.availability ? `<p><strong>Availability:</strong> ${application.availability}</p>` : ''}
        <p><strong>Reference:</strong> ${application.referenceCode}</p>
        ${application.message ? `<p>${application.message.replace(/\n/g, '<br/>')}</p>` : ''}
      `,
    }),
  };
}

function partnershipConfirmation(inquiry) {
  return {
    subject: `Partnership inquiry received — ${orgName()}`,
    html: layout({
      title: 'Inquiry received',
      body: `
        <p>Hi ${inquiry.contactName},</p>
        <p>Thank you for reaching out about a partnership with ${orgName()}. We've received your inquiry and will be in touch soon.</p>
        <p><strong>Reference:</strong> ${inquiry.referenceCode}</p>
      `,
    }),
  };
}

function partnershipAdminNotification(inquiry) {
  return {
    subject: `[Partnership] ${inquiry.organizationName}`,
    html: layout({
      title: 'New partnership inquiry',
      body: `
        <p><strong>Organization:</strong> ${inquiry.organizationName}</p>
        <p><strong>Contact:</strong> ${inquiry.contactName} &lt;${inquiry.email}&gt;</p>
        ${inquiry.phone ? `<p><strong>Phone:</strong> ${inquiry.phone}</p>` : ''}
        ${inquiry.partnershipType ? `<p><strong>Type:</strong> ${inquiry.partnershipType}</p>` : ''}
        <p><strong>Reference:</strong> ${inquiry.referenceCode}</p>
        <p>${inquiry.vision.replace(/\n/g, '<br/>')}</p>
      `,
    }),
  };
}

function concernAdminNotification(concern) {
  const label = concern.isAnonymous ? 'Anonymous concern' : concern.fullName;
  return {
    subject: `[Concern] ${label}`,
    html: layout({
      title: 'New concern submission',
      body: `
        ${concern.isAnonymous ? '<p><em>Submitted anonymously</em></p>' : `<p><strong>From:</strong> ${concern.fullName}${concern.email ? ` &lt;${concern.email}&gt;` : ''}</p>`}
        ${concern.programArea ? `<p><strong>Program area:</strong> ${concern.programArea}</p>` : ''}
        <p><strong>Reference:</strong> ${concern.referenceCode}</p>
        <p>${concern.message.replace(/\n/g, '<br/>')}</p>
      `,
    }),
  };
}

function donationReceipt(donation) {
  const amount = Number(donation.amount).toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return {
    subject: `Donation receipt — ${donation.referenceCode}`,
    html: layout({
      title: 'Thank you for your donation',
      body: `
        <p>Hi${donation.donorName ? ` ${donation.donorName}` : ''},</p>
        <p>Thank you for your generous support of ${orgName()}.</p>
        <p><strong>Amount:</strong> ${donation.currency} ${amount}<br/>
        <strong>Reference:</strong> ${donation.referenceCode}<br/>
        <strong>Type:</strong> ${donation.type.replace('_', ' ')}<br/>
        <strong>Designation:</strong> ${donation.designation}</p>
        <p>This email serves as confirmation of your completed donation.</p>
      `,
    }),
  };
}

module.exports = {
  newsletterWelcome,
  newsletterBroadcast,
  tenderAlertWelcome,
  newTenderAlert,
  contactConfirmation,
  contactAdminNotification,
  volunteerConfirmation,
  volunteerAdminNotification,
  partnershipConfirmation,
  partnershipAdminNotification,
  concernAdminNotification,
  donationReceipt,
};
