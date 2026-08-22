import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Upload, Loader2 } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    attachment: null
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError('');

    if (file) {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setFileError('File size must be less than 5MB');
        return;
      }
      setFormData({ ...formData, attachment: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });
    setFileError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('subject', formData.subject);
      submitData.append('message', formData.message);
      
      if (formData.attachment) {
        submitData.append('attachment', formData.attachment);
      }

      const response = await fetch(`${apiUrl}/contact`, {
        method: 'POST',
        body: submitData,
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: 'success',
          message: 'Thank you for reaching out. We will get back to you shortly.'
        });
        setFormData({ name: '', email: '', subject: '', message: '', attachment: null });
      } else {
        setStatus({
          type: 'error',
          message: data.message || 'Failed to send message. Please try again.'
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'An error occurred. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { icon: <Mail />, title: 'Email', content: 'support@fluxmart.com', link: 'mailto:support@fluxmart.com' },
    { icon: <Phone />, title: 'Phone', content: '+1 (555) 123-4567', link: 'tel:+15551234567' },
    { icon: <MapPin />, title: 'Office', content: '123 Commerce Street, Business City, BC 12345', link: '#' },
    { icon: <Clock />, title: 'Hours', content: 'Mon - Fri: 9:00 AM - 6:00 PM', link: '#' }
  ];

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <section className="py-24 border-b border-border bg-gray-50">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-black mb-4">Contact Us.</h1>
          <p className="text-lg text-gray-500 font-light">
            We're here to help. Reach out to our support team.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
            
            <div className="lg:col-span-3">
              <div className="bg-white p-8 md:p-10 rounded-2xl border border-border shadow-sm">
                <h2 className="text-2xl font-bold mb-8 tracking-tight">Send a message</h2>
                
                {status.message && (
                  <div className={`mb-6 p-4 rounded-md text-sm ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {status.message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-black mb-1">Name</label>
                      <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange} className="input-field" placeholder="John Doe" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-black mb-1">Email</label>
                      <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} className="input-field" placeholder="john@example.com" />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-black mb-1">Subject</label>
                    <input type="text" id="subject" name="subject" required value={formData.subject} onChange={handleChange} className="input-field" placeholder="How can we help?" />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-black mb-1">Message</label>
                    <textarea id="message" name="message" required rows="5" value={formData.message} onChange={handleChange} className="input-field resize-none" placeholder="Provide details..." />
                  </div>

                  <div>
                    <span className="block text-sm font-medium text-black mb-1">Attachment (Optional)</span>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border hover:border-black rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-6 h-6 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                          {formData.attachment ? <span className="text-black font-medium">{formData.attachment.name}</span> : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                      </div>
                      <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt" />
                    </label>
                    {fileError && <p className="mt-2 text-sm text-red-600">{fileError}</p>}
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex justify-center items-center">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Request'}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
              <div>
                <h3 className="text-xl font-bold mb-6 tracking-tight">Contact Information</h3>
                <div className="space-y-6">
                  {contactInfo.map((info, idx) => (
                    <a key={idx} href={info.link} className="flex items-start group">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors duration-300 text-gray-600">
                        {info.icon}
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-black">{info.title}</p>
                        <p className="text-sm text-gray-500 group-hover:text-black transition-colors">{info.content}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-border">
                <h3 className="text-xl font-bold mb-6 tracking-tight">Headquarters</h3>
                <div className="bg-gray-100 rounded-xl h-48 w-full flex items-center justify-center border border-border">
                  {/* Placeholder for map */}
                  <span className="text-gray-400 text-sm">Interactive Map</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
