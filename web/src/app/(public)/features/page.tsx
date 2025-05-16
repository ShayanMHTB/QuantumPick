import { Button } from '@/components/ui/button';
import {
  Shield,
  BarChart,
  Users,
  Wallet,
  Globe,
  Lock,
  Zap,
  ArrowRight,
  Code,
  LineChart,
  Sparkles,
  Layers
} from 'lucide-react';

// Feature component for detailed section
interface DetailedFeatureProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  imagePosition?: 'left' | 'right';
}

const DetailedFeature = ({ 
  title, 
  description, 
  icon, 
  imagePosition = 'right' 
}: DetailedFeatureProps) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16 md:py-24">
    {/* Content */}
    <div className={imagePosition === 'right' ? '' : 'lg:order-2'}>
      <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-xl mb-6">
        {icon}
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
        {title}
      </h2>
      <div className="text-gray-600 dark:text-gray-400 space-y-4" dangerouslySetInnerHTML={{ __html: description }} />
    </div>
    
    {/* Image/Illustration */}
    <div className={imagePosition === 'right' ? 'lg:order-2' : ''}>
      <div className="relative rounded-xl overflow-hidden h-[320px] lg:h-[400px] bg-gradient-to-r from-primary/10 to-primary/5 shadow-lg">
        <div className="absolute inset-0 flex items-center justify-center p-8">
          {/* Decorative illustration based on the feature */}
          <div className="w-full h-full flex items-center justify-center">
            <div className="relative w-3/4 h-3/4 opacity-30 text-primary">
              {imagePosition === 'right' ? (
                <svg viewBox="0 0 200 200" fill="currentColor" className="w-full h-full">
                  <rect x="40" y="40" width="120" height="120" rx="8" />
                  <circle cx="100" cy="100" r="40" />
                  <path d="M40 100H160M100 40V160" strokeWidth="4" stroke="currentColor" fill="none" />
                </svg>
              ) : (
                <svg viewBox="0 0 200 200" fill="currentColor" className="w-full h-full">
                  <circle cx="100" cy="100" r="80" opacity="0.2" />
                  <circle cx="100" cy="100" r="60" opacity="0.4" />
                  <circle cx="100" cy="100" r="40" opacity="0.6" />
                  <circle cx="100" cy="100" r="20" opacity="0.8" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Simple feature card component
interface SimpleFeatureProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const SimpleFeature = ({ title, description, icon }: SimpleFeatureProps) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
    <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400">{description}</p>
  </div>
);

export default function FeaturesPage() {
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
              Platform <span className="text-primary">Features</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Discover how QuantumPick combines cutting-edge blockchain technology with an intuitive user experience to revolutionize lotteries.
            </p>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <DetailedFeature
          title="Transparent Blockchain Lotteries"
          description="<p>QuantumPick leverages blockchain technology to create fully transparent lottery systems where:</p>
          <ul class='list-disc pl-5 mt-4 space-y-2'>
            <li>All lottery mechanics are executed on-chain via open-source smart contracts</li>
            <li>Every transaction is verifiable on blockchain explorers</li>
            <li>Smart contracts are audited by independent security firms</li>
            <li>Complete transparency from ticket purchase to prize distribution</li>
          </ul>"
          icon={<Shield className="w-8 h-8 text-primary" />}
          imagePosition="right"
        />
        
        <div className="border-t border-gray-200 dark:border-gray-800 my-8"></div>
        
        <DetailedFeature
          title="Create Your Own Lottery"
          description="<p>Launch custom lotteries tailored to your needs with our no-code interface:</p>
          <ul class='list-disc pl-5 mt-4 space-y-2'>
            <li>Choose from multiple lottery types (fixed prize, progressive jackpot, etc.)</li>
            <li>Set custom parameters like duration, ticket price, and prize structure</li>
            <li>Deploy to multiple blockchain networks</li>
            <li>Monitor performance with advanced analytics</li>
            <li>Collect fees from your lottery operations</li>
          </ul>"
          icon={<Sparkles className="w-8 h-8 text-primary" />}
          imagePosition="left"
        />
        
        <div className="border-t border-gray-200 dark:border-gray-800 my-8"></div>
        
        <DetailedFeature
          title="Provably Fair Randomness"
          description="<p>Our advanced cryptographic mechanisms ensure unbiased winner selection:</p>
          <ul class='list-disc pl-5 mt-4 space-y-2'>
            <li>Integration with Chainlink VRF (Verifiable Random Function)</li>
            <li>Multi-source entropy gathering for enhanced randomness</li>
            <li>Transparent verification process visible to all participants</li>
            <li>Tamper-proof execution of drawing mechanics</li>
            <li>Zero possibility of operator manipulation</li>
          </ul>"
          icon={<Lock className="w-8 h-8 text-primary" />}
          imagePosition="right"
        />
        
        <div className="border-t border-gray-200 dark:border-gray-800 my-8"></div>
        
        <DetailedFeature
          title="Cross-Chain Compatibility"
          description="<p>Participate in lotteries across multiple blockchain networks:</p>
          <ul class='list-disc pl-5 mt-4 space-y-2'>
            <li>Support for Ethereum, Polygon, Binance Smart Chain, Solana, and Tron</li>
            <li>Seamless wallet integration (MetaMask, WalletConnect, etc.)</li>
            <li>Consistent user experience across all chains</li>
            <li>Optimized for gas efficiency on each network</li>
            <li>Future support for Layer 2 solutions and emerging networks</li>
          </ul>"
          icon={<Globe className="w-8 h-8 text-primary" />}
          imagePosition="left"
        />
      </section>

      {/* Additional Features Section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              More Powerful Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Explore the additional capabilities that make QuantumPick the leading Web3 lottery platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <SimpleFeature
              title="Instant Payouts"
              description="Winners receive their prizes automatically through smart contract execution, with no delays or manual processing."
              icon={<Zap className="w-6 h-6 text-primary" />}
            />
            <SimpleFeature
              title="Advanced Analytics"
              description="Access comprehensive statistics and visualizations for all lottery activities and performance metrics."
              icon={<LineChart className="w-6 h-6 text-primary" />}
            />
            <SimpleFeature
              title="White-label Solutions"
              description="Custom-branded lottery platforms for businesses and organizations with dedicated support."
              icon={<Layers className="w-6 h-6 text-primary" />}
            />
            <SimpleFeature
              title="Community Governance"
              description="DAO-like mechanisms allowing platform users to vote on features, fee structures, and protocol upgrades."
              icon={<Users className="w-6 h-6 text-primary" />}
            />
            <SimpleFeature
              title="Developer API"
              description="Integrate QuantumPick's lottery functionality directly into your own applications with our comprehensive API."
              icon={<Code className="w-6 h-6 text-primary" />}
            />
            <SimpleFeature
              title="Token Economics"
              description="Optional tokenized incentives for participants, creators, and platform contributors."
              icon={<Wallet className="w-6 h-6 text-primary" />}
            />
          </div>
        </div>
      </section>

      {/* Technical Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Technical Excellence
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Built with cutting-edge technologies for security, scalability, and user experience.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 md:p-12 shadow-lg border border-gray-100 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Smart Contract Architecture</h3>
                <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mr-2 mt-1">
                      <div className="w-4 h-4 rounded-full bg-primary"></div>
                    </div>
                    <span>ERC-20/ERC-721 compatibility for token-based participation</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mr-2 mt-1">
                      <div className="w-4 h-4 rounded-full bg-primary"></div>
                    </div>
                    <span>Gas-optimized contract design for cost efficiency</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mr-2 mt-1">
                      <div className="w-4 h-4 rounded-full bg-primary"></div>
                    </div>
                    <span>Modular architecture with factory patterns</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mr-2 mt-1">
                      <div className="w-4 h-4 rounded-full bg-primary"></div>
                    </div>
                    <span>Emergency pause functionality for safety</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Security Measures</h3>
                <ul className="space-y-3 text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mr-2 mt-1">
                      <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                    </div>
                    <span>Comprehensive test coverage (>95%)</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mr-2 mt-1">
                      <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                    </div>
                    <span>Multiple independent security audits</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mr-2 mt-1">
                      <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                    </div>
                    <span>Bug bounty program for white hat hackers</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 mr-2 mt-1">
                      <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                    </div>
                    <span>Formal verification of critical functions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Experience the Future of Lotteries?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Join thousands of users already participating in or creating transparent blockchain lotteries.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="rounded-full">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full">
                View Active Lotteries
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
