import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as pug from 'pug';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);
  private readonly mailMode: string;
  private templatesDir: string;

  constructor(private readonly configService: ConfigService) {
    this.mailMode = this.configService.get<string>('MAIL_MODE', 'ethereal');

    // Check if we're in development or production
    const isDev = this.configService.get<string>('NODE_ENV') !== 'production';

    if (isDev) {
      // In development, use the src path
      this.templatesDir = join(process.cwd(), 'src', 'templates', 'emails');
    } else {
      // In production, use the compiled path
      this.templatesDir = join(__dirname, '..', '..', 'templates', 'emails');
    }

    this.logger.log(`Template directory set to: ${this.templatesDir}`);
    this.logger.log(`Email mode: ${this.mailMode}`);

    this.initializeTransporter();
  }

  private async initializeTransporter() {
    try {
      switch (this.mailMode) {
        case 'smtp':
          this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('MAIL_HOST'),
            port: this.configService.get<number>('MAIL_PORT', 587),
            secure: this.configService.get<boolean>('MAIL_SECURE', false),
            auth: {
              user: this.configService.get<string>('MAIL_USER'),
              pass: this.configService.get<string>('MAIL_PASSWORD'),
            },
          });
          this.logger.log('Using SMTP transport for email');
          break;

        case 'ethereal':
          try {
            this.logger.log('Creating Ethereal test account...');
            const testAccount = await nodemailer.createTestAccount();
            this.logger.log('Ethereal account created successfully');

            this.transporter = nodemailer.createTransport({
              host: 'smtp.ethereal.email',
              port: 587,
              secure: false,
              auth: {
                user: testAccount.user,
                pass: testAccount.pass,
              },
            });

            this.logger.log(
              `Ethereal test account created: ${testAccount.user}`,
            );
            this.logger.log(
              `Emails can be viewed at: https://ethereal.email/login`,
            );
            this.logger.log(`Username: ${testAccount.user}`);
            this.logger.log(`Password: ${testAccount.pass}`);

            // Test the transporter
            this.logger.log('Testing Ethereal transporter connection...');
            await this.transporter.verify();
            this.logger.log('Ethereal transporter verified successfully');
          } catch (etherealError) {
            this.logger.error(
              'Failed to create Ethereal account:',
              etherealError,
            );
            throw etherealError; // Re-throw to be caught by the outer catch
          }
          break;

        default: // 'console' or any invalid mode
          // Create a preview/debug transport that just logs
          this.logger.log('Creating console logging transporter');
          this.transporter = {
            sendMail: (mailOptions, callback) => {
              this.logger.log(
                '==================== EMAIL PREVIEW ====================',
              );
              this.logger.log(`To: ${mailOptions.to}`);
              this.logger.log(`Subject: ${mailOptions.subject}`);
              if (mailOptions.text) {
                this.logger.log(`Text content: ${mailOptions.text}`);
              }
              this.logger.log('HTML content omitted from logs');
              this.logger.log(
                '=====================================================',
              );

              const info = {
                messageId: `mock-${Date.now()}`,
              };

              if (callback) {
                callback(null, info);
              }

              return Promise.resolve(info);
            },
          } as any;
          this.logger.log('Using console preview transport for email');
          break;
      }
    } catch (error) {
      this.logger.error('Failed to initialize email transporter:', error);
      // Fallback to console preview transport
      this.logger.log('Falling back to console transport due to error');
      this.transporter = {
        sendMail: (mailOptions, callback) => {
          this.logger.log(
            '==================== EMAIL PREVIEW (FALLBACK) ====================',
          );
          this.logger.log(`To: ${mailOptions.to}`);
          this.logger.log(`Subject: ${mailOptions.subject}`);
          if (mailOptions.text) {
            this.logger.log(`Text content: ${mailOptions.text}`);
          }
          this.logger.log('HTML content omitted from logs');
          this.logger.log(
            '=============================================================',
          );

          const info = {
            messageId: `mock-fallback-${Date.now()}`,
          };

          if (callback) {
            callback(null, info);
          }

          return Promise.resolve(info);
        },
      } as any;
    }
  }

  private async renderTemplate(
    templateName: string,
    context: any,
  ): Promise<string> {
    try {
      const templatePath = join(this.templatesDir, `${templateName}.pug`);
      this.logger.log(`Attempting to render template at: ${templatePath}`);

      // Check if template exists
      if (!fs.existsSync(templatePath)) {
        this.logger.error(`Template file does not exist at: ${templatePath}`);
        throw new Error(`Template file not found: ${templatePath}`);
      }

      // Render the template
      const renderedHtml = pug.renderFile(templatePath, context);
      this.logger.log(`Template ${templateName} rendered successfully`);
      return renderedHtml;
    } catch (error) {
      this.logger.error(`Failed to render template ${templateName}:`, error);
      throw error;
    }
  }

  async sendVerificationEmail(email: string, token: string) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:4000';
    const verificationUrl = `${frontendUrl}/auth/verify?token=${token}`;

    this.logger.log(`Preparing verification email to ${email}`);
    this.logger.log(`Verification URL: ${verificationUrl}`);
    this.logger.log(`Template directory: ${this.templatesDir}`);
    this.logger.log(`Current working directory: ${process.cwd()}`);

    try {
      // Try to resolve template path to confirm it exists
      const templatePath = join(
        this.templatesDir,
        'verification/email-verification.pug',
      );
      this.logger.log(`Looking for template at: ${templatePath}`);

      // List all files in templates directory for debugging
      try {
        const srcTemplateDir = join(process.cwd(), 'src', 'templates');
        if (fs.existsSync(srcTemplateDir)) {
          this.logger.log(`Contents of ${srcTemplateDir}:`);
          this.listDirectoryContents(srcTemplateDir);
        } else {
          this.logger.log(`Directory does not exist: ${srcTemplateDir}`);
        }
      } catch (dirError) {
        this.logger.error('Error listing directory contents:', dirError);
      }

      // Check if file exists
      if (!fs.existsSync(templatePath)) {
        this.logger.warn(
          `Template file does not exist at ${templatePath}. Trying alternative paths...`,
        );

        // Try alternative paths
        const altPaths = [
          join(
            process.cwd(),
            'src',
            'templates',
            'emails',
            'verification',
            'email-verification.pug',
          ),
          join(
            process.cwd(),
            'dist',
            'templates',
            'emails',
            'verification',
            'email-verification.pug',
          ),
          join(
            __dirname,
            '..',
            '..',
            '..',
            'src',
            'templates',
            'emails',
            'verification',
            'email-verification.pug',
          ),
        ];

        let templateFound = false;
        for (const altPath of altPaths) {
          this.logger.log(`Checking alternative path: ${altPath}`);
          if (fs.existsSync(altPath)) {
            this.logger.log(`Found template at alternative path: ${altPath}`);
            templateFound = true;
            // Update the templates directory for future calls
            this.templatesDir = altPath.replace(
              '/verification/email-verification.pug',
              '',
            );
            break;
          }
        }

        if (!templateFound) {
          this.logger.error(
            `Could not find template in any location. Falling back to plain text email.`,
          );

          // Fall back to plain text email
          const mailOptions = {
            from: this.configService.get<string>(
              'MAIL_FROM',
              '"QuantumPick" <noreply@quantumpick.io>',
            ),
            to: email,
            subject: 'QuantumPick: Verify Your Email',
            text: `Please verify your email by clicking on the link: ${verificationUrl}. This link will expire in 7 days.`,
          };

          this.logger.log('Sending plain text email without template');
          const info = await this.transporter.sendMail(mailOptions);
          this.logger.log(
            `Plain text email sent. Message ID: ${info.messageId}`,
          );

          // Handle Ethereal preview URL
          if (this.mailMode === 'ethereal' && info) {
            const previewUrl = nodemailer.getTestMessageUrl(info);
            if (previewUrl) {
              this.logger.log(`Email preview URL: ${previewUrl}`);
              return { success: true, previewUrl };
            }
          }

          return { success: true };
        }
      }

      // Render the template
      this.logger.log('Rendering email template');

      let html;
      try {
        html = await this.renderTemplate('verification/email-verification', {
          verificationUrl,
          email,
          date: new Date(),
        });
        this.logger.log('Template rendered successfully');
      } catch (renderError) {
        this.logger.error('Error rendering template:', renderError);

        // Use a simple HTML template as fallback
        html = `
          <h1>Welcome to QuantumPick!</h1>
          <p>Thank you for signing up. Please verify your email address by clicking the link below:</p>
          <p><a href="${verificationUrl}">Verify Email</a></p>
          <p>Or copy and paste this URL into your browser:</p>
          <p>${verificationUrl}</p>
          <p>This verification link will expire in 7 days.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        `;
        this.logger.log('Using fallback HTML template');
      }

      // Send the email
      const mailOptions = {
        from: this.configService.get<string>(
          'MAIL_FROM',
          '"QuantumPick" <noreply@quantumpick.io>',
        ),
        to: email,
        subject: 'QuantumPick: Verify Your Email',
        html,
        text: `Please verify your email by clicking on the link: ${verificationUrl}. This link will expire in 7 days.`,
      };

      this.logger.log('Sending email via transporter');
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully. Message ID: ${info.messageId}`);

      // Handle Ethereal preview URL
      if (this.mailMode === 'ethereal' && info) {
        this.logger.log('Getting Ethereal preview URL');
        this.logger.log(`Info object keys: ${Object.keys(info).join(', ')}`);

        let previewUrl;
        try {
          previewUrl = nodemailer.getTestMessageUrl(info);
          this.logger.log(`Generated preview URL: ${previewUrl}`);
        } catch (previewError) {
          this.logger.error('Error generating preview URL:', previewError);

          // Try to construct the URL manually if possible
          if (info.messageId) {
            const messageId = info.messageId.replace(/[<>]/g, '');
            this.logger.log(`Cleaned message ID: ${messageId}`);
            previewUrl = `https://ethereal.email/message/${messageId}`;
            this.logger.log(`Manually constructed preview URL: ${previewUrl}`);
          }
        }

        if (previewUrl) {
          this.logger.log(`Email preview URL: ${previewUrl}`);
          return { success: true, previewUrl };
        }
      }

      return { success: true };
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${email}:`,
        error,
      );
      return { success: false, error: error.message };
    }
  }

  // Helper method to list directory contents for debugging
  private listDirectoryContents(dir: string, indent = '') {
    try {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const itemPath = join(dir, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
          this.logger.log(`${indent}📁 ${item}/`);
          this.listDirectoryContents(itemPath, indent + '  ');
        } else {
          this.logger.log(`${indent}📄 ${item}`);
        }
      }
    } catch (error) {
      this.logger.error(`Error listing contents of ${dir}:`, error);
    }
  }

  async sendEmail(options: {
    to: string;
    subject: string;
    template?: string;
    context?: any;
    text?: string;
    html?: string;
  }) {
    try {
      let html = options.html;

      // Render template if specified
      if (options.template && options.context) {
        try {
          html = await this.renderTemplate(options.template, options.context);
        } catch (renderError) {
          this.logger.error(
            `Failed to render template ${options.template}:`,
            renderError,
          );
          // Continue with text only if template rendering fails
        }
      }

      // Prepare mail options
      const mailOptions = {
        from: this.configService.get<string>(
          'MAIL_FROM',
          '"QuantumPick" <noreply@quantumpick.io>',
        ),
        to: options.to,
        subject: options.subject,
        text: options.text,
        html,
      };

      // Send email
      this.logger.log(
        `Sending email to ${options.to} with subject "${options.subject}"`,
      );
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent. Message ID: ${info.messageId}`);

      // Handle Ethereal preview URL
      if (this.mailMode === 'ethereal' && info) {
        try {
          const previewUrl = nodemailer.getTestMessageUrl(info);
          if (previewUrl) {
            this.logger.log(`Email preview URL: ${previewUrl}`);
            return { success: true, previewUrl };
          }
        } catch (previewError) {
          this.logger.error('Error generating preview URL:', previewError);
        }
      }

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(email: string, name: string) {
    return this.sendEmail({
      to: email,
      subject: 'Welcome to QuantumPick!',
      template: 'user/welcome',
      context: {
        name,
        date: new Date(),
      },
      text: `Welcome to QuantumPick, ${name}!`,
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:4000';
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;

    return this.sendEmail({
      to: email,
      subject: 'QuantumPick: Reset Your Password',
      template: 'user/password-reset',
      context: {
        resetUrl,
        email,
        date: new Date(),
      },
      text: `Please reset your password by clicking on the link: ${resetUrl}. This link will expire in 24 hours.`,
    });
  }
}
