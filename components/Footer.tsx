import React from 'react';
import { GithubIcon, LinkedinIcon, MailIcon } from './icons';

export const Footer: React.FC = () => {
    const yourName = "Keshab Kumar";
    const githubUrl = "https://github.com/Keshabkjha";
    const linkedinUrl = "https://www.linkedin.com/in/keshabkjha/";
    const emailAddress = "mailto:keshabkumarjha876@gmail.com";

    return (
        <footer className="w-full mt-auto py-6 text-center border-t border-slate-800 text-slate-500 text-sm">
            <p>Designed & Developed by {yourName}</p>
            <div className="flex justify-center items-center gap-4 mt-2">
                <a href={githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub Profile" className="hover:text-cyan-400 transition-colors">
                    <GithubIcon className="w-5 h-5" />
                </a>
                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn Profile" className="hover:text-cyan-400 transition-colors">
                    <LinkedinIcon className="w-5 h-5" />
                </a>
                <a href={emailAddress} aria-label="Email" className="hover:text-cyan-400 transition-colors">
                    <MailIcon className="w-5 h-5" />
                </a>
            </div>
        </footer>
    );
};