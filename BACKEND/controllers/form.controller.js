const { prisma } = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler.middleware');

function clientMeta(req) {
  return {
    ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
    userAgent: req.headers['user-agent'] || null,
  };
}

const submitContact = asyncHandler(async (req, res) => {
  const { fullName, email, phone, subject, message, subscribeToUpdates } = req.body;

  const submission = await prisma.contactSubmission.create({
    data: {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone,
      subject,
      message,
      subscribeToUpdates: subscribeToUpdates ?? false,
      ...clientMeta(req),
    },
  });

  if (subscribeToUpdates) {
    await prisma.newsletterSubscriber.upsert({
      where: { email: submission.email },
      update: { status: 'subscribed', consentGiven: true, source: 'contact-form' },
      create: {
        email: submission.email,
        source: 'contact-form',
        consentGiven: true,
      },
    });
  }

  res.status(201).json({
    success: true,
    message: 'Message received. We will respond within 24 business hours.',
    data: { referenceCode: submission.referenceCode },
  });
});

const subscribeNewsletter = asyncHandler(async (req, res) => {
  const { email, source } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  await prisma.newsletterSubscriber.upsert({
    where: { email: normalizedEmail },
    update: {
      status: 'subscribed',
      consentGiven: true,
      consentAt: new Date(),
      source: source || 'website',
      unsubscribedAt: null,
    },
    create: {
      email: normalizedEmail,
      source: source || 'website',
      consentGiven: true,
    },
  });

  res.status(200).json({
    success: true,
    message: 'Subscribed successfully',
  });
});

const submitVolunteer = asyncHandler(async (req, res) => {
  const { fullName, email, phone, preferredRole, availability, message } = req.body;

  const application = await prisma.volunteerApplication.create({
    data: {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone,
      preferredRole,
      availability,
      message,
      ...clientMeta(req),
    },
  });

  res.status(201).json({
    success: true,
    message: 'Volunteer application submitted',
    data: { referenceCode: application.referenceCode },
  });
});

const submitPartnership = asyncHandler(async (req, res) => {
  const { organizationName, contactName, email, phone, partnershipType, vision } = req.body;

  const inquiry = await prisma.partnershipInquiry.create({
    data: {
      organizationName: organizationName.trim(),
      contactName: contactName.trim(),
      email: email.trim().toLowerCase(),
      phone,
      partnershipType,
      vision,
      ...clientMeta(req),
    },
  });

  res.status(201).json({
    success: true,
    message: 'Partnership inquiry submitted',
    data: { referenceCode: inquiry.referenceCode },
  });
});

const submitConcern = asyncHandler(async (req, res) => {
  const { isAnonymous, fullName, email, phone, programArea, message } = req.body;

  const concern = await prisma.concernSubmission.create({
    data: {
      isAnonymous: isAnonymous ?? false,
      fullName: isAnonymous ? null : fullName?.trim(),
      email: isAnonymous ? null : email?.trim().toLowerCase(),
      phone: isAnonymous ? null : phone,
      programArea,
      message,
      ...clientMeta(req),
    },
  });

  res.status(201).json({
    success: true,
    message: 'Concern received. Our accountability team will review it.',
    data: { referenceCode: concern.referenceCode },
  });
});

module.exports = {
  submitContact,
  subscribeNewsletter,
  submitVolunteer,
  submitPartnership,
  submitConcern,
};
