// Footer component for application footer with links and information
// Part of HIGH Priority Layout Components implementation

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Github, 
  Twitter, 
  Facebook, 
  Instagram, 
  Mail, 
  Phone,
  MapPin,
  Globe,
  ChevronUp
} from 'lucide-react';
import { cn } from '../../utils/helpers';

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface FooterProps {
  sections?: FooterSection[];
  socialLinks?: Array<{
    platform: 'github' | 'twitter' | 'facebook' | 'instagram' | 'email';
    href: string;
    label: string;
  }>;
  companyInfo?: {
    name: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
  copyright?: string;
  showBackToTop?: boolean;
  onBackToTop?: () => void;
  className?: string;
  variant?: 'default' | 'minimal' | 'extended';
}

const socialIcons = {
  github: Github,
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  email: Mail
};

export const Footer = forwardRef<HTMLElement, FooterProps>(
  (
    {
      sections = [],
      socialLinks = [],
      companyInfo = {
        name: "Diet Game",
        description: "Your personal nutrition and fitness companion"
      },
      copyright = `© ${new Date().getFullYear()} Diet Game. All rights reserved.`,
      showBackToTop = true,
      onBackToTop,
      className,
      variant = 'default'
    },
    ref
  ) => {
    const handleBackToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      onBackToTop?.();
    };

    if (variant === 'minimal') {
      return (
        <footer
          ref={ref}
          className={cn(
            'bg-gray-50 border-t border-gray-200 py-6',
            className
          )}
        >
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-600">{copyright}</p>
              </div>
              
              {socialLinks.length > 0 && (
                <div className="flex items-center space-x-4">
                  {socialLinks.map((social) => {
                    const Icon = socialIcons[social.platform];
                    return (
                      <a
                        key={social.platform}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label={social.label}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </footer>
      );
    }

    if (variant === 'extended') {
      return (
        <footer
          ref={ref}
          className={cn(
            'bg-gray-900 text-white',
            className
          )}
        >
          <div className="px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Company Info */}
              <div className="lg:col-span-1">
                <h3 className="text-lg font-semibold mb-4">{companyInfo.name}</h3>
                {companyInfo.description && (
                  <p className="text-gray-300 mb-4">{companyInfo.description}</p>
                )}
                
                {/* Contact Info */}
                <div className="space-y-2">
                  {companyInfo.address && (
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{companyInfo.address}</span>
                    </div>
                  )}
                  {companyInfo.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a
                        href={`tel:${companyInfo.phone}`}
                        className="text-sm text-gray-300 hover:text-white transition-colors"
                      >
                        {companyInfo.phone}
                      </a>
                    </div>
                  )}
                  {companyInfo.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a
                        href={`mailto:${companyInfo.email}`}
                        className="text-sm text-gray-300 hover:text-white transition-colors"
                      >
                        {companyInfo.email}
                      </a>
                    </div>
                  )}
                  {companyInfo.website && (
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a
                        href={companyInfo.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-300 hover:text-white transition-colors"
                      >
                        {companyInfo.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Sections */}
              {sections.map((section, index) => (
                <div key={index}>
                  <h4 className="text-sm font-semibold text-white mb-4">
                    {section.title}
                  </h4>
                  <ul className="space-y-2">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <a
                          href={link.href}
                          target={link.external ? '_blank' : undefined}
                          rel={link.external ? 'noopener noreferrer' : undefined}
                          className="text-sm text-gray-300 hover:text-white transition-colors"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-4">
                    Follow Us
                  </h4>
                  <div className="flex space-x-4">
                    {socialLinks.map((social) => {
                      const Icon = socialIcons[social.platform];
                      return (
                        <a
                          key={social.platform}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-white transition-colors"
                          aria-label={social.label}
                        >
                          <Icon className="w-5 h-5" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <p className="text-sm text-gray-400">{copyright}</p>
              <p className="text-sm text-gray-400 flex items-center">
                Made with <Heart className="w-4 h-4 text-red-500 mx-1" /> by the Diet Game team
              </p>
            </div>
          </div>
        </footer>
      );
    }

    // Default variant
    return (
      <footer
        ref={ref}
        className={cn(
          'bg-white border-t border-gray-200',
          className
        )}
      >
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {companyInfo.name}
              </h3>
              {companyInfo.description && (
                <p className="text-gray-600 mb-4">{companyInfo.description}</p>
              )}
              
              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div className="flex space-x-4">
                  {socialLinks.map((social) => {
                    const Icon = socialIcons[social.platform];
                    return (
                      <a
                        key={social.platform}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label={social.label}
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Sections */}
            {sections.map((section, index) => (
              <div key={index}>
                <h4 className="text-sm font-semibold text-gray-900 mb-4">
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={link.href}
                        target={link.external ? '_blank' : undefined}
                        rel={link.external ? 'noopener noreferrer' : undefined}
                        className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-200 mt-8 pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <p className="text-sm text-gray-600">{copyright}</p>
              <p className="text-sm text-gray-600 flex items-center">
                Made with <Heart className="w-4 h-4 text-red-500 mx-1" /> by the Diet Game team
              </p>
            </div>
          </div>
        </div>

        {/* Back to Top Button */}
        {showBackToTop && (
          <motion.button
            onClick={handleBackToTop}
            className="fixed bottom-6 right-6 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            aria-label="Back to top"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </footer>
    );
  }
);

Footer.displayName = 'Footer';

export default Footer;
