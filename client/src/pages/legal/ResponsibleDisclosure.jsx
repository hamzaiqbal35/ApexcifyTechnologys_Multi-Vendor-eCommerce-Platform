import LegalLayout from '../../components/LegalLayout';

const ResponsibleDisclosure = () => {
  return (
    <LegalLayout title="Responsible Disclosure" lastUpdated="August 23, 2026">
      <h2>1. Reporting Vulnerabilities</h2>
      <p>If you believe you have found a security vulnerability in our platform, we encourage you to report it to us immediately. Please do not disclose the vulnerability publicly until we have had a chance to fix it.</p>
      
      <h2>2. What to Include</h2>
      <p>When reporting a vulnerability, please provide as much information as possible, including:</p>
      <ul>
        <li>A detailed description of the vulnerability.</li>
        <li>Steps to reproduce the vulnerability.</li>
        <li>Any relevant screenshots or code snippets.</li>
      </ul>
      
      <h2>3. Our Commitment</h2>
      <p>We are committed to working with security researchers to resolve vulnerabilities in a timely manner. We will not take legal action against you if you act in good faith and follow this policy.</p>
      
      <p><em>Please note that this is placeholder text and should be replaced with your actual Responsible Disclosure Policy.</em></p>
    </LegalLayout>
  );
};

export default ResponsibleDisclosure;
