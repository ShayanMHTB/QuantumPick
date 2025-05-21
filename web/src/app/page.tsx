import Footer from '@/components/shared/Footer';
import Header from '@/components/shared/Header';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  ChevronRight,
  Globe,
  LucideIcon,
  PieChart,
  Shield,
  Sparkles,
  Trophy,
  Users,
  Wallet,
} from 'lucide-react';

// Feature section component
interface FeatureProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

const Feature = ({ title, description, icon: Icon }: FeatureProps) => (
  <div className="relative p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
    <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-400">{description}</p>
  </div>
);

// Stats component
interface StatProps {
  value: string;
  label: string;
}

const Stat = ({ value, label }: StatProps) => (
  <div className="text-center">
    <p className="text-4xl font-bold text-primary mb-2">{value}</p>
    <p className="text-gray-600 dark:text-gray-400">{label}</p>
  </div>
);

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-16 md:pt-20">
        {/* Hero Section */}
        <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute top-[60%] -left-[5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Hero Content */}
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                  <span className="block">The Future of</span>
                  <span className="text-primary">Web3 Lotteries</span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-lg">
                  A transparent, fair, and trustworthy blockchain lottery
                  platform where anyone can participate or create their own
                  lottery with complete confidence.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="rounded-full">
                    Get Started
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-full">
                    Explore Lotteries
                  </Button>
                </div>

                <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-emerald-500 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      100% Transparent
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Decentralized
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Wallet className="h-5 w-5 text-purple-500 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      User-Controlled
                    </span>
                  </div>
                </div>
              </div>

              {/* Hero Image/Illustration */}
              <div className="relative lg:ml-auto">
                <div className="relative w-full h-[400px] lg:h-[480px] rounded-xl overflow-hidden bg-gradient-to-r from-primary/20 to-primary/10 shadow-xl">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      className="w-3/4 h-3/4 text-primary/30"
                      viewBox="0 0 400 400"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="200"
                        cy="200"
                        r="180"
                        stroke="currentColor"
                        strokeWidth="12"
                      />
                      <circle
                        cx="200"
                        cy="200"
                        r="120"
                        stroke="currentColor"
                        strokeWidth="8"
                      />
                      <circle cx="200" cy="200" r="60" fill="currentColor" />
                      <path
                        d="M200 20V380"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray="12 12"
                      />
                      <path
                        d="M20 200H380"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray="12 12"
                      />
                      <path
                        d="M58.5789 58.5789L341.421 341.421"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray="12 12"
                      />
                      <path
                        d="M341.421 58.5789L58.5789 341.421"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray="12 12"
                      />
                    </svg>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 shadow-lg p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="absolute bottom-8 -left-4 bg-white dark:bg-gray-800 shadow-lg p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                  <PieChart className="h-8 w-8 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Reinventing Lotteries with Web3
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                QuantumPick combines the excitement of lotteries with the
                transparency and security of blockchain technology.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Feature
                title="Transparent Mechanics"
                description="All lottery operations are executed on the blockchain with open-source, audited smart contracts for complete transparency."
                icon={Shield}
              />
              <Feature
                title="Create Your Own"
                description="Launch personalized lotteries with custom parameters, target audiences, and prize pools with our no-code interface."
                icon={Sparkles}
              />
              <Feature
                title="Fair Random Selection"
                description="Our provably fair randomness mechanism guarantees unbiased winner selection using advanced cryptographic primitives."
                icon={Users}
              />
              <Feature
                title="Multi-Chain Support"
                description="Participate in lotteries across multiple blockchain networks including Ethereum, Polygon, and Binance Smart Chain."
                icon={Globe}
              />
              <Feature
                title="Instant Payouts"
                description="Winners receive their prizes automatically and instantly through smart contract execution."
                icon={Wallet}
              />
              <Feature
                title="Complete Analytics"
                description="Access comprehensive statistics and visualizations for all lottery activities and performance metrics."
                icon={PieChart}
              />
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-primary/5 rounded-2xl p-8 md:p-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Powered by Trust and Numbers
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  The fastest growing Web3 lottery platform with verifiable
                  statistics.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <Stat value="$2.3M+" label="Prize Pool" />
                <Stat value="12,000+" label="Participants" />
                <Stat value="450+" label="Lotteries Created" />
                <Stat value="99.9%" label="Payout Rate" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Ready to Try Your Luck?
                  </h2>
                  <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                    Join thousands of users already participating in transparent
                    blockchain lotteries.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button size="lg" className="rounded-full">
                      Get Started Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-full"
                    >
                      Learn More
                    </Button>
                  </div>
                </div>

                <div className="lg:ml-auto">
                  <div className="relative w-full h-[300px] md:h-[350px] bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent rounded-xl overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-48 w-48 border-4 border-primary/30 rounded-full flex items-center justify-center">
                        <div className="h-32 w-32 border-4 border-primary/40 rounded-full flex items-center justify-center">
                          <div className="h-16 w-16 bg-primary rounded-full animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
