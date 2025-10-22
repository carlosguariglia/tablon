const NotificationRepository = require('../repositories/NotificationRepository');
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) ? nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
}) : null;

class NotificationService {
  async notifyUser(user_id, { type = 'info', title = '', message = '', metadata = null, email = null }) {
    // save in DB
    await NotificationRepository.create({ user_id, type, title, message, metadata });
    // optionally send email
    if (email && transporter) {
      try {
        await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to: email, subject: title || 'Notificación', text: message });
      } catch (e) {
        console.warn('Email notify failed', e && e.message ? e.message : e);
      }
    }
  }
}

module.exports = new NotificationService();
