import { FacebookIcon, GithubIcon, InstagramIcon, TwitterIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../../images/logo.svg';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Security', href: '/security' },
      { name: 'Enterprise', href: '/enterprise' },
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' },
    ],
    resources: [
      { name: 'Documentation', href: '/docs' },
      { name: 'Help Center', href: '/help' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
    social: [
      { name: 'Twitter', icon: TwitterIcon, href: 'https://twitter.com/snapceit', fill: true },
      { name: 'Facebook', icon: FacebookIcon, href: 'https://facebook.com/snapceit', fill: true },
      { name: 'Instagram', icon: InstagramIcon, href: 'https://instagram.com/snapceit', fill: true },
      { name: 'GitHub', icon: GithubIcon, href: 'https://github.com/snapceit', fill: true },
    ],
  };

  return (
    <footer className="bg-gradient-to-br from-[#D444EF] via-[#AF3AEB] to-purple-900 text-white/80">
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo and Social */}
          <div className="col-span-2 md:col-span-1 pl-0 sm:pl-0">
            <Link to="/" className="inline-block mb-8">
              <img src={logo} alt="Snapceit" className="h-16 w-auto" />
            </Link>
            <div className="flex space-x-4 mb-4">
              {footerLinks.social.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-purple-700 hover:bg-purple-600 transition-colors duration-200 p-2 rounded-md"
                    aria-label={`Follow us on ${item.name}`}
                  >
                    <Icon className="w-5 h-5" fill="white" />
                  </a>
                );
              })}
            </div>
            <p className="text-sm">
              Contact us at:{' '}
              <a
                href="mailto:support@snapceit.com"
                className="text-purple-300 hover:text-purple-200 transition-colors duration-200"
              >
                support@snapceit.com
              </a>
            </p>
          </div>

          {/* Product Links */}
          <div className="pl-2 sm:pl-0">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">Product</h3>
            <ul className="space-y-2.5">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="pl-2 sm:pl-0">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">Company</h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div className="pl-2 sm:pl-0">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">Resources</h3>
            <ul className="space-y-2.5">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-sm sm:text-base text-white/60">©{currentYear} Snapceit</span>
            </div>
            <p className="text-sm sm:text-base text-white/60">
              Simplifying receipt management for everyone
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
