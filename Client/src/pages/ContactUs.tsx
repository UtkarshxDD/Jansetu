import { useState, ChangeEvent, FormEvent } from 'react';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    message: '',
  });

  const [charCount, setCharCount] = useState(0);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'message') {
      setCharCount(value.length);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add submission logic here (e.g., API call)
  };

  return (
    <div className="min-h-screen p-4 md:p-8 mt-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:gap-12">
          {/* Left column - Contact information */}
          <div className="lg:w-1/2 mb-8 lg:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Contact Us</h1>
            <p className="text-gray-600 mb-6">
              Have questions, feedback, or suggestions for JanSetu? Reach out and help us build a better community.
            </p>

            <div className="mb-6">
              <p className="text-gray-700 mb-1">support@janhit.in</p>
              <p className="text-gray-700 mb-4">+91-9876543210</p>
              <a href="#" className="text-gray-700 underline">Contact Support</a>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-10">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Report an Issue</h3>
                <p className="text-gray-600 text-sm">
                  Facing trouble with the portal or need help submitting a civic issue? We’re here to assist you.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-800 mb-2">Share Feedback</h3>
                <p className="text-gray-600 text-sm">
                  Tell us how JanSetu is helping you or what we can improve—your voice matters.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-800 mb-2">Partnerships</h3>
                <p className="text-gray-600 text-sm">
                  Want to collaborate with JanSetu or bring civic tech to your area? Reach out for partnerships.
                </p>
              </div>
            </div>
          </div>

          {/* Right column - Contact form */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Get in Touch</h2>
              <p className="text-gray-600 mb-6">We’re just a message away</p>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First name"
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last name"
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-4">
                  <input
                    type="email"
                    name="email"
                    placeholder="Your email"
                    className="w-full px-4 py-2 mb-4 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={formData.email}
                    onChange={handleChange}
                  />

                  <div className="flex items-center border rounded-md border-gray-200 overflow-hidden mb-4">
                    <div className="px-3 py-2 bg-gray-50 border-r border-gray-200 text-gray-500">+91</div>
                    <input
                      type="tel"
                      name="phoneNumber"
                      placeholder="Phone number"
                      className="w-full px-4 py-2 border-0 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                    />
                  </div>

                  <textarea
                    name="message"
                    placeholder="Let us know how we can help..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={formData.message}
                    onChange={handleChange}
                    maxLength={120}
                  ></textarea>

                  <div className="flex justify-end mb-6 mt-1">
                    <span className="text-sm text-gray-500">{charCount}/120</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  Submit
                </button>

                <p className="text-sm text-center text-gray-500 mt-4">
                  By reaching out, you agree to JanSetu's{' '}
                  <a href="#" className="text-gray-700 font-medium">Terms of Service</a>{' '}
                  and{' '}
                  <a href="#" className="text-gray-700 font-medium">Privacy Policy</a>.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
