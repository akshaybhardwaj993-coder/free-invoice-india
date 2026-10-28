export default function PrivacyPolicy() {
  return (
    <main className="max-w-3xl mx-auto p-8 bg-white min-h-screen">
      <div className="mb-8">
        <a href="/" className="text-blue-600 hover:underline font-medium">&larr; Back to Invoice Generator</a>
      </div>
      
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Privacy Policy</h1>
      <p className="mb-6 text-gray-500 text-sm">Last updated: October 2026</p>
      
      <div className="space-y-6 text-gray-700">
        <div>
          <h2 className="text-xl font-semibold mb-3 text-gray-900">1. Zero Data Collection</h2>
          <p>
            ZapBill is designed with privacy as its core feature. <strong>We do not collect, store, or transmit any of your business or client data to our servers.</strong> 
          </p>
          <p className="mt-2">
            All invoice generation, tax calculations (CGST, SGST, IGST, TDS), and PDF creation happen entirely within your web browser using client-side JavaScript.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-gray-900">2. Local Storage</h2>
          <p>
            To improve your experience, we use your browser's local storage to remember your business details (Name, Address, GSTIN) so you don't have to type them every time. This data is stored securely on your own device and never leaves it.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-gray-900">3. Third-Party Services</h2>
          <p>
            We use Monetag for advertisements to keep this tool 100% free. These ad networks may use cookies to serve relevant ads. Please review their respective privacy policies for more information.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-gray-900">4. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at: your-email@gmail.com
          </p>
        </div>
      </div>
    </main>
  );
}