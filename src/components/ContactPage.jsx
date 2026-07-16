import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function ContactPage({ theme }) {
  return (
    <div className="contact-page-wrapper" style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <section className="contact-hero-section text-center py-12">
        <h1 className="text-4xl font-bold mb-4">Contact <span className="highlight-gradient">Us</span></h1>
        <p className="text-muted max-w-2xl mx-auto px-4">
          Have questions about our programs, facilities, or internship opportunities? We're here to help. Reach out to us or drop by our center.
        </p>
      </section>

      <div className="container mx-auto px-4 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Contact Details */}
          <div className="w-full lg:w-1/2 flex flex-col gap-8">
            {/* Info Card */}
            <motion.div className="glass-panel bento-panel p-8 rounded-xl h-full" whileHover={{ y: -5 }}>
              <h3 className="content-title text-2xl font-semibold mb-6">Get In Touch</h3>
              
              <div className="flex items-start gap-4 mb-6">
                <div className="icon-box text-cyan-500 mt-1"><MapPin size={24} /></div>
                <div>
                  <h4 className="font-medium text-lg">Our Location</h4>
                  <p className="text-muted">TIDEL Park, 1st Floor, Module 11,<br/>Rajiv Gandhi Salai, Taramani,<br/>Chennai, Tamil Nadu 600113</p>
                </div>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className="icon-box text-cyan-500 mt-1"><Phone size={24} /></div>
                <div>
                  <h4 className="font-medium text-lg">Call Us</h4>
                  <p className="text-muted">+91 44 2254 1111<br/>+91 96000 91359</p>
                </div>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className="icon-box text-cyan-500 mt-1"><Mail size={24} /></div>
                <div>
                  <h4 className="font-medium text-lg">Email Us</h4>
                  <p className="text-muted">info@tansam.in</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="icon-box text-cyan-500 mt-1"><Clock size={24} /></div>
                <div>
                  <h4 className="font-medium text-lg">Working Hours</h4>
                  <p className="text-muted">Mon - Fri: 9:00 AM - 6:00 PM</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Google Maps Integration */}
          <div className="w-full lg:w-1/2">
            <motion.div className="glass-panel p-2 rounded-xl h-full" whileHover={{ y: -5 }} style={{ minHeight: '400px' }}>
              <iframe
                title="TANSAM Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.892095066453!2d80.24581457597375!3d12.978759314723004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a525d6b4fc34819%3A0xc39f992a0df8cb23!2sTANSAM%20(Tamil%20Nadu%20Smart%20and%20Advanced%20Manufacturing%20Centre)!5e0!3m2!1sen!2sin!4v1703664795777!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: '10px', minHeight: '400px' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </motion.div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
