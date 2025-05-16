'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HelpCircle,
  MessageCircle,
  FileQuestion,
  Send,
  Mail,
  BookOpen,
  Users,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

// Common FAQs
const commonFaqs = [
  {
    question: 'How do I connect my wallet?',
    answer: 'To connect your wallet, click on the "Connect Wallet" button in the top right corner of the page. Choose your preferred wallet provider (MetaMask, WalletConnect, etc.) and follow the prompts to authorize the connection. Make sure you have the wallet extension installed or app available.'
  },
  {
    question: 'I won a lottery. How do I claim my prize?',
    answer: 'Prizes are automatically sent to your connected wallet address when the lottery drawing is completed. This process is executed by smart contracts with no manual processing required. The transaction will be visible on the blockchain explorer. If you encounter any issues, please contact our support team.'
  },
  {
    question: 'What cryptocurrencies can I use to participate?',
    answer: 'Most lotteries on QuantumPick use USDC as the primary currency due to its stability and wide availability across multiple blockchains. Some lotteries may accept other stablecoins or native cryptocurrencies depending on the creator\'s settings. Each lottery page clearly displays the accepted currency.'
  },
  {
    question: 'Is QuantumPick available in my country?',
    answer: 'QuantumPick implements geofencing to restrict access from jurisdictions where online lotteries are explicitly prohibited. We recommend checking our Compliance page and your local regulations before participating. Users are responsible for ensuring they comply with their local laws.'
  },
  {
    question: 'How are winners selected?',
    answer: "Winners are selected using Chainlink VRF (Verifiable Random Function), which provides cryptographically secure randomness that's verifiable on-chain. This ensures that neither we nor anyone else can manipulate the drawing results. The selection process is fully transparent and can be verified on the blockchain."
  }
];

export default function SupportPage() {
  const [supportCategory, setSupportCategory] = useState('');
  
  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-24 md:pt-32 pb-16 md:pb-24">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-[60%] -left-[5%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Customer <span className="text-primary">Support</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Need help? Our support team is ready to assist you with any questions or issues you might have.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="rounded-full" asChild>
                <Link href="#contact-form">
                  Contact Support
                  <MessageCircle className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full" asChild>
                <Link href="#faq">
                  View FAQ
                  <HelpCircle className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Support Options Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              How Can We Help You Today?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Choose the support option that best fits your needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <FileQuestion className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Help Center</CardTitle>
                <CardDescription>
                  Browse our extensive knowledge base for guides and tutorials
                </CardDescription>
              </CardHeader>
              <CardContent className="text-gray-600 dark:text-gray-400">
                Find answers to common questions, step-by-step guides, and troubleshooting tips in our comprehensive help center.
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full rounded-full">
                  Browse Help Center
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow border-primary/50">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  Reach out to our support team for personalized assistance
                </CardDescription>
              </CardHeader>
              <CardContent className="text-gray-600 dark:text-gray-400">
                Our support team is available 24/7 to help you with any questions or issues you might encounter while using our platform.
              </CardContent>
              <CardFooter>
                <Button className="w-full rounded-full" asChild>
                  <Link href="#contact-form">
                    Contact Support
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Community</CardTitle>
                <CardDescription>
                  Join our community forums and Discord server
                </CardDescription>
              </CardHeader>
              <CardContent className="text-gray-600 dark:text-gray-400">
                Connect with other users, share experiences, and get help from our active community of Web3 lottery enthusiasts.
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full rounded-full">
                  Join Discord
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-gray-50 dark:bg-gray-900/50 scroll-mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Quick answers to common questions about QuantumPick
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {commonFaqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 px-6"
                >
                  <AccordionTrigger className="text-lg font-medium text-gray-900 dark:text-white text-left hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 dark:text-gray-400 pt-2 pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            
            <div className="text-center mt-8">
              <Button variant="outline" className="rounded-full" asChild>
                <Link href="/faq">
                  View All FAQs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="py-16 scroll-mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Get in Touch
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Fill out the form below and our support team will get back to you as soon as possible.
              </p>
            </div>
            
            <Card>
              <CardContent className="pt-6">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Name
                      </label>
                      <Input id="name" placeholder="Your full name" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </label>
                      <Input id="email" type="email" placeholder="Your email address" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="wallet" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Wallet Address (Optional)
                    </label>
                    <Input id="wallet" placeholder="Your wallet address if relevant to your query" />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Support Category
                    </label>
                    <Select value={supportCategory} onValueChange={setSupportCategory}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="account">Account & Wallet Issues</SelectItem>
                        <SelectItem value="lottery">Lottery Participation</SelectItem>
                        <SelectItem value="creation">Lottery Creation</SelectItem>
                        <SelectItem value="payments">Payments & Transactions</SelectItem>
                        <SelectItem value="technical">Technical Support</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Subject
                    </label>
                    <Input id="subject" placeholder="Brief description of your issue" />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Message
                    </label>
                    <Textarea 
                      id="message" 
                      placeholder="Please provide details about your issue or question" 
                      rows={6}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" size="lg" className="rounded-full">
                      Submit Ticket
                      <Send className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Email Support</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">
                    For direct inquiries, email us at:
                  </p>
                  <a href="mailto:support@quantumpick.io" className="text-primary hover:underline font-medium">
                    support@quantumpick.io
                  </a>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Security Issues</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-1">
                    For urgent security concerns:
                  </p>
                  <a href="mailto:security@quantumpick.io" className="text-primary hover:underline font-medium">
                    security@quantumpick.io
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Process */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Our Support Process
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Here&#39;s how we handle your support requests
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <MessageCircle className="h-8 w-8 text-primary" />,
                title: 'Submit Your Request',
                description: 'Fill out the contact form with details about your issue or question. The more information you provide, the faster we can help you.'
              },
              {
                icon: <CheckCircle2 className="h-8 w-8 text-primary" />,
                title: 'Confirmation & Review',
                description: "You'll receive a confirmation email with a ticket number. Our support team will review your request and begin working on a solution."
              },
              {
                icon: <Users className="h-8 w-8 text-primary" />,
                title: 'Personal Support',
                description: "A support specialist will respond within 24 hours with a personalized solution. For complex issues, we'll work with you until everything is resolved."
              }
            ].map((step, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
