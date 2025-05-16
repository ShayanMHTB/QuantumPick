import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight } from 'lucide-react';

// FAQ Categories and items
const faqCategories = [
  {
    title: 'General',
    items: [
      {
        question: 'What is QuantumPick?',
        answer:
          'QuantumPick is a transparent, fair, and trustworthy Web3 lottery platform built on blockchain technology. It allows users to either participate in existing lotteries or create and manage their own custom lotteries with complete transparency.',
      },
      {
        question: 'How is QuantumPick different from traditional lotteries?',
        answer:
          'Unlike traditional lotteries, QuantumPick operates entirely on blockchain technology, ensuring complete transparency, provably fair drawing mechanisms, and automatic prize distribution without intermediaries. Every aspect of the lottery process is verifiable on the blockchain.',
      },
      {
        question: 'Do I need technical knowledge to use QuantumPick?',
        answer:
          'No technical knowledge is required to participate in lotteries. For creating your own lottery, our user-friendly interface makes the process simple even for users with no blockchain experience. We handle all the technical complexity behind the scenes.',
      },
      {
        question: 'What blockchains does QuantumPick support?',
        answer:
          'QuantumPick currently supports Ethereum, Polygon, Binance Smart Chain, Solana, and Tron. We plan to expand to additional networks and Layer 2 solutions in the future based on community demand and technological developments.',
      },
    ],
  },
  {
    title: 'Participating in Lotteries',
    items: [
      {
        question: 'How do I participate in a lottery?',
        answer:
          "To participate, connect your Web3 wallet (such as MetaMask), browse the available lotteries, select one you'd like to join, and purchase tickets using the supported cryptocurrency for that lottery. Your tickets are automatically registered on the blockchain.",
      },
      {
        question: 'What currencies can I use to buy tickets?',
        answer:
          "Most lotteries on QuantumPick use USDC as the primary currency due to its stability and wide availability across multiple blockchains. Some lotteries may accept other stablecoins or native cryptocurrencies depending on the creator's settings.",
      },
      {
        question: "How do I know if I've won?",
        answer:
          "When a lottery drawing occurs, winners are automatically notified through the platform and via email if provided. You can also check your dashboard at any time to see the status of all lotteries you've participated in.",
      },
      {
        question: 'How do I receive my winnings?',
        answer:
          'Winnings are automatically sent to your connected wallet address when the lottery drawing is completed. This process is executed by smart contracts with no manual processing required. The transaction will be visible on the blockchain explorer.',
      },
    ],
  },
  {
    title: 'Creating Lotteries',
    items: [
      {
        question: 'Can anyone create a lottery?',
        answer:
          'Yes, any user with a connected wallet can create their own lottery. In the MVP phase, there may be limitations on certain advanced features, but our roadmap includes expanding creator capabilities over time.',
      },
      {
        question: 'What are the fees for creating a lottery?',
        answer:
          'Creators pay a small setup fee plus a percentage of the prize pool. Current rates are a $50-100 setup fee (depending on lottery complexity) and 5% of the pool. Additionally, creators can earn from any surplus if the lottery exceeds its target.',
      },
      {
        question: 'What types of lotteries can I create?',
        answer:
          'You can create various types including fixed duration lotteries, target-based lotteries (specific player count or prize pool amount), and special thematic lotteries. Each type has customizable parameters like ticket price, prize distribution, and more.',
      },
      {
        question: 'How do I manage my created lottery?',
        answer:
          'Creators have access to a dedicated dashboard showing real-time statistics, participant information, and financial metrics. You can also set up automated actions or manually trigger certain events depending on the lottery type.',
      },
    ],
  },
  {
    title: 'Technical & Security',
    items: [
      {
        question: 'How do you ensure fair winner selection?',
        answer:
          "We use Chainlink VRF (Verifiable Random Function) which provides cryptographically secure randomness that's verifiable on-chain. This ensures that neither we nor anyone else can manipulate the drawing results.",
      },
      {
        question: 'Are your smart contracts audited?',
        answer:
          'Yes, all our smart contracts undergo multiple rounds of security audits by independent security firms before deployment to mainnet. We also maintain an ongoing bug bounty program to incentivize the discovery of potential vulnerabilities.',
      },
      {
        question: "What happens if there's a technical issue during a lottery?",
        answer:
          'Our smart contracts include emergency safeguards. In the unlikely event of a critical issue, lotteries can be paused, and participants can withdraw their funds. We prioritize participant security in all scenarios.',
      },
      {
        question: 'How is my personal information protected?',
        answer:
          'We collect minimal personal information. Any data we do collect is stored securely, and we never share it with third parties without your explicit consent. Your blockchain transactions are public on the blockchain, but we do not link them to personal identities.',
      },
    ],
  },
  {
    title: 'Legal & Compliance',
    items: [
      {
        question: 'Is QuantumPick legal in my country?',
        answer:
          'Blockchain-based lotteries exist in a novel regulatory space. We implement geofencing to restrict access from jurisdictions with clear prohibitions. However, users are responsible for ensuring compliance with their local laws before participating.',
      },
      {
        question: 'Are there age restrictions?',
        answer:
          'Yes, users must be at least 18 years old (or the legal age in their jurisdiction) to use QuantumPick. We implement reasonable age verification measures, but ultimately users must ensure they meet the age requirements.',
      },
      {
        question: 'How do you handle tax implications?',
        answer:
          'Tax obligations vary by jurisdiction. QuantumPick does not withhold taxes or provide tax advice. Winners are responsible for reporting and paying any applicable taxes on their winnings according to their local laws.',
      },
      {
        question: 'What KYC/AML procedures do you have?',
        answer:
          'For smaller transactions, we rely on blockchain wallet verification. For larger withdrawals above certain thresholds, we may implement additional KYC verification. Our compliance procedures evolve with regulatory requirements.',
      },
    ],
  },
];

export default function FAQPage() {
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
              Frequently Asked <span className="text-primary">Questions</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Find answers to common questions about QuantumPick's Web3 lottery platform.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="py-8 border-b border-gray-200 dark:border-gray-800 sticky top-16 md:top-20 bg-white dark:bg-gray-900 z-10 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            {faqCategories.map((category, index) => (
              <a
                key={index}
                href={`#${category.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-100 hover:bg-primary/10 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
              >
                {category.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-16">
            {faqCategories.map((category, categoryIndex) => (
              <div 
                key={categoryIndex} 
                id={category.title.toLowerCase().replace(/\s+/g, '-')}
                className="scroll-mt-32"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">
                  {category.title}
                </h2>
                <Accordion type="single" collapsible className="space-y-4">
                  {category.items.map((item, itemIndex) => (
                    <AccordionItem 
                      key={itemIndex} 
                      value={`item-${categoryIndex}-${itemIndex}`}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 px-6"
                    >
                      <AccordionTrigger className="text-lg font-medium text-gray-900 dark:text-white text-left hover:no-underline">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 dark:text-gray-400 pt-2 pb-4">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-16 md:py-24 bg-primary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Still Have Questions?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Our support team is ready to help you with any additional questions or concerns you might have.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="rounded-full">
                Contact Support
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full">
                Join Community Discord
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
