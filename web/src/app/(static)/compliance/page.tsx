export default function CompliancePage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Compliance and Regulatory Information
        </h1>
        
        <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-600 dark:prose-p:text-gray-400">
          <p className="text-lg">
            Last Updated: May 1, 2025
          </p>
          
          <p>
            At QuantumPick, we are committed to operating with integrity and in compliance with applicable laws and regulations. This page outlines our approach to regulatory compliance and provides information on how we manage various compliance requirements.
          </p>
          
          <h2>Regulatory Approach</h2>
          
          <p>
            Blockchain-based lotteries and prize draws exist in a novel regulatory landscape that continues to evolve. QuantumPick takes a proactive approach to compliance by:
          </p>
          
          <ul>
            <li>Regularly consulting with legal experts specializing in blockchain and gaming regulations</li>
            <li>Implementing compliance measures that adapt to emerging regulatory frameworks</li>
            <li>Engaging with regulatory bodies in key jurisdictions</li>
            <li>Establishing clear policies for user verification and prize distribution</li>
          </ul>
          
          <h2>Geographical Restrictions</h2>
          
          <p>
            QuantumPick implements geofencing to restrict access from jurisdictions where online lotteries are explicitly prohibited. We use multiple methods to determine user location:
          </p>
          
          <ul>
            <li>IP address verification</li>
            <li>Device location checks (where permission is granted)</li>
            <li>VPN and proxy detection</li>
          </ul>
          
          <p>
            Users are responsible for ensuring they comply with their local laws before participating in our platform. If you are unsure about the regulations in your jurisdiction, we recommend consulting with a legal professional.
          </p>
          
          <h2>Age Verification</h2>
          
          <p>
            QuantumPick is strictly for users who are at least 18 years old (or the legal age in their jurisdiction, whichever is higher). We implement age verification measures, including:
          </p>
          
          <ul>
            <li>Self-declaration during registration</li>
            <li>Additional verification for large withdrawals</li>
            <li>Periodic age verification checks</li>
          </ul>
          
          <p>
            We reserve the right to request proof of age at any time and to suspend accounts where there is reasonable suspicion that the user does not meet the minimum age requirements.
          </p>
          
          <h2>Anti-Money Laundering (AML) Policy</h2>
          
          <p>
            QuantumPick is committed to preventing money laundering and other financial crimes on our platform. Our AML measures include:
          </p>
          
          <ul>
            <li>Transaction monitoring for suspicious activity</li>
            <li>Risk-based customer due diligence</li>
            <li>Enhanced verification for larger transactions</li>
            <li>Blockchain analytics to track fund sources</li>
            <li>Internal policies and staff training on AML compliance</li>
          </ul>
          
          <h2>Know Your Customer (KYC) Procedures</h2>
          
          <p>
            For most regular transactions, QuantumPick relies on Web3 wallet verification, which provides a level of pseudonymous identification. However, for certain activities, additional KYC may be required:
          </p>
          
          <ul>
            <li><strong>Withdrawals above thresholds:</strong> Users withdrawing prizes above certain thresholds may be required to complete identity verification</li>
            <li><strong>Lottery creation:</strong> Creators of certain high-value lotteries may need to provide additional verification</li>
            <li><strong>Suspicious activity:</strong> Accounts flagged for suspicious activity may be subject to enhanced due diligence</li>
          </ul>
          
          <p>
            KYC procedures may include verification of:
          </p>
          
          <ul>
            <li>Government-issued identification</li>
            <li>Proof of address</li>
            <li>Source of funds (for larger transactions)</li>
          </ul>
          
          <h2>Taxation</h2>
          
          <p>
            Tax obligations for lottery winnings vary significantly between jurisdictions. QuantumPick does not withhold taxes on winnings or provide tax advice. Users are responsible for:
          </p>
          
          <ul>
            <li>Understanding their tax obligations in their jurisdiction</li>
            <li>Reporting and paying any applicable taxes on winnings</li>
            <li>Maintaining appropriate records for tax purposes</li>
          </ul>
          
          <p>
            In some jurisdictions, we may be required to report certain transactions to tax authorities. In such cases, we will comply with all legal requirements while protecting user privacy to the extent permitted by law.
          </p>
          
          <h2>Smart Contract Auditing</h2>
          
          <p>
            All smart contracts deployed by QuantumPick undergo rigorous security audits by independent third-party auditors. Our smart contract security measures include:
          </p>
          
          <ul>
            <li>Multiple audit rounds by independent security firms</li>
            <li>Comprehensive test coverage (>95%)</li>
            <li>Formal verification of critical functions</li>
            <li>Open-source code for public scrutiny</li>
            <li>Bug bounty program for white hat hackers</li>
          </ul>
          
          <p>
            Audit reports are made publicly available and linked from the relevant lottery pages.
          </p>
          
          <h2>Provably Fair Mechanisms</h2>
          
          <p>
            QuantumPick uses provably fair randomness mechanisms to ensure transparent and unbiased lottery outcomes. Our approach includes:
          </p>
          
          <ul>
            <li>Integration with Chainlink VRF (Verifiable Random Function)</li>
            <li>Multi-source entropy gathering</li>
            <li>Transparent verification process</li>
            <li>Immutable on-chain record of all drawing results</li>
          </ul>
          
          <p>
            Users can independently verify the fairness of any lottery drawing through blockchain explorers and our platform's verification tools.
          </p>
          
          <h2>Player Protection and Responsible Gaming</h2>
          
          <p>
            We are committed to promoting responsible participation in our lotteries. Our responsible gaming measures include:
          </p>
          
          <ul>
            <li>Self-exclusion options</li>
            <li>Deposit and ticket purchase limits</li>
            <li>Cooling-off periods</li>
            <li>Clear display of odds and expected outcomes</li>
            <li>Educational resources on responsible gaming</li>
          </ul>
          
          <p>
            We encourage users to approach lottery participation as entertainment rather than as an investment or income source.
          </p>
          
          <h2>Data Protection and Privacy</h2>
          
          <p>
            QuantumPick is committed to protecting user data in compliance with applicable data protection regulations. We adhere to principles of:
          </p>
          
          <ul>
            <li>Data minimization (collecting only what's necessary)</li>
            <li>Purpose limitation (using data only for specified purposes)</li>
            <li>Security (protecting data from unauthorized access)</li>
            <li>Transparency (clear communication about data practices)</li>
          </ul>
          
          <p>
            For more information on how we collect, use, and protect your data, please see our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
          </p>
          
          <h2>Regulatory Updates</h2>
          
          <p>
            The regulatory landscape for blockchain-based gaming and lotteries continues to evolve. We are committed to staying informed of regulatory developments and adapting our compliance program accordingly. Significant regulatory changes that affect our operations will be communicated to users through our platform and other communication channels.
          </p>
          
          <h2>Contact Our Compliance Team</h2>
          
          <p>
            If you have questions or concerns regarding our compliance policies or practices, please contact our compliance team at:
          </p>
          
          <p>
            Email: compliance@quantumpick.io<br />
            Address: [Company Address]
          </p>
          
          <div className="my-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Disclaimer</h3>
            <p className="text-gray-600 dark:text-gray-400">
              This compliance information is provided for general informational purposes only and should not be construed as legal advice. The regulatory status of blockchain-based lotteries varies by jurisdiction and continues to evolve. Users are responsible for determining the legality of their participation based on their location and applicable laws.
            </p>
          </div>
          
          <div className="my-12 text-center text-gray-600 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} QuantumPick Inc. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
