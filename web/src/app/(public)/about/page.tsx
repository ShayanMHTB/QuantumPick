import { Button } from '@/components/ui/button';
import { ArrowRight, Check, User } from 'lucide-react';

// Team member component
interface TeamMemberProps {
  name: string;
  role: string;
  imageSrc: string;
}

const TeamMember = ({ name, role, imageSrc }: TeamMemberProps) => (
  <div className="flex flex-col items-center text-center">
    <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800 relative">
      <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600">
        <User className="h-12 w-12" />
      </div>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
      {name}
    </h3>
    <p className="text-gray-600 dark:text-gray-400">{role}</p>
  </div>
);

// Value component
interface ValueProps {
  title: string;
  description: string;
}

const Value = ({ title, description }: ValueProps) => (
  <div className="mb-6">
    <div className="flex items-center mb-2">
      <div className="mr-3 bg-primary/10 rounded-full p-1">
        <Check className="h-4 w-4 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
    </div>
    <p className="text-gray-600 dark:text-gray-400 ml-9">{description}</p>
  </div>
);

export default function AboutPage() {
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
              About <span className="text-primary">QuantumPick</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              We're building the future of transparent and trustworthy
              blockchain lotteries, where fairness and user experience are our
              top priorities.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p>
                  QuantumPick was born from a simple observation: traditional
                  lotteries lack transparency, and many blockchain-based
                  alternatives had failed to build user trust due to poor
                  security practices and opaque operations.
                </p>
                <p>
                  Our founding team of blockchain enthusiasts and technology
                  experts came together with a shared vision - to create a
                  lottery platform that people could genuinely trust, built on
                  the principles of transparency, fairness, and user control.
                </p>
                <p>
                  Since our inception, we've been relentlessly focused on
                  building a platform that combines the thrill of lotteries with
                  the revolutionary benefits of blockchain technology. Our
                  commitment to open-source development, security audits, and
                  user-centered design has guided every decision we've made.
                </p>
                <p>
                  Today, QuantumPick stands as a testament to what's possible
                  when Web3 technology is applied with purpose - creating
                  experiences that are not just trustless by design, but
                  deserving of trust through action.
                </p>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden h-[400px] lg:h-[480px] bg-gradient-to-r from-primary/10 to-primary/5">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-3/4 h-3/4">
                  <svg
                    viewBox="0 0 200 200"
                    className="w-full h-full text-primary/20"
                    fill="currentColor"
                  >
                    <path d="M100 0C44.8 0 0 44.8 0 100s44.8 100 100 100 100-44.8 100-100S155.2 0 100 0zm0 180c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z" />
                    <path d="M100 40c-33.1 0-60 26.9-60 60s26.9 60 60 60 60-26.9 60-60-26.9-60-60-60zm0 100c-22.1 0-40-17.9-40-40s17.9-40 40-40 40 17.9 40 40-17.9 40-40 40z" />
                    <circle cx="100" cy="100" r="20" />
                    <circle cx="140" cy="60" r="10" />
                    <circle cx="60" cy="140" r="10" />
                    <circle cx="140" cy="140" r="10" />
                    <circle cx="60" cy="60" r="10" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              The core principles that guide us as we build QuantumPick.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 max-w-5xl mx-auto">
            <Value
              title="Transparency Above All"
              description="We believe users deserve to see and understand every aspect of our operations. All our smart contracts are open-source and verified on blockchain explorers."
            />
            <Value
              title="Provable Fairness"
              description="Using verifiable random functions and cryptographic proofs, we ensure that every lottery outcome is demonstrably fair and cannot be manipulated."
            />
            <Value
              title="User Empowerment"
              description="We put control in users' hands, allowing them to create and manage their own lotteries with customizable parameters and rules."
            />
            <Value
              title="Security First"
              description="Multiple audit layers, formal verification processes, and comprehensive testing are baked into our development cycle."
            />
            <Value
              title="Ethical Design"
              description="We build features that encourage responsible participation and transparent operations, avoiding dark patterns and predatory mechanics."
            />
            <Value
              title="Continuous Innovation"
              description="We're constantly exploring new blockchain technologies and UX improvements to make Web3 lotteries more accessible and enjoyable."
            />
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              The passionate people behind QuantumPick working to revolutionize
              Web3 lotteries.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12">
            <TeamMember name="Alex Chen" role="Founder & CEO" imageSrc="" />
            <TeamMember name="Sarah Johnson" role="CTO" imageSrc="" />
            <TeamMember
              name="Michael Rodriguez"
              role="Lead Developer"
              imageSrc=""
            />
            <TeamMember name="Emily Wong" role="UX Designer" imageSrc="" />
            <TeamMember
              name="David Kim"
              role="Smart Contract Engineer"
              imageSrc=""
            />
            <TeamMember
              name="Jessica Taylor"
              role="Marketing Director"
              imageSrc=""
            />
            <TeamMember
              name="Omar Hassan"
              role="Security Specialist"
              imageSrc=""
            />
            <TeamMember
              name="Lisa Müller"
              role="Community Manager"
              imageSrc=""
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 max-w-5xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Join Us on Our Mission
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
                Whether you're a participant, creator, or blockchain enthusiast,
                there's a place for you in the QuantumPick ecosystem.
              </p>
              <Button size="lg" className="rounded-full">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
