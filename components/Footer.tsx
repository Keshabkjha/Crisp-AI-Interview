
import { GithubIcon, LinkedinIcon, MailIcon } from './icons';

export function Footer() {
  const socialLinks = [
    { href: 'https://github.com/Keshabkjha', icon: GithubIcon, label: 'GitHub' },
    { href: 'https://www.linkedin.com/in/keshabkjha/', icon: LinkedinIcon, label: 'LinkedIn' },
    { href: 'mailto:keshabkumarjha876@gmail.com', icon: MailIcon, label: 'Email' },
  ];

  return (
    <footer className="w-full text-center text-slate-500 text-sm py-8 border-t border-slate-800">
      <div className="flex justify-center items-center gap-6 mb-2">
        {socialLinks.map(({ href, icon: Icon, label }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="text-slate-500 hover:text-cyan-400 transition-colors"
          >
            <Icon className="w-6 h-6" />
          </a>
        ))}
      </div>
      <p>Designed & Developed by Keshab Kumar</p>
    </footer>
  );
}
