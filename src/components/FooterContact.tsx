import React from 'react';
import { Phone, Mail, Clock, User as UserIcon } from 'lucide-react';
import { SITE_CONFIG } from '../config/siteConfig';

interface FooterContactProps {
  phone1?: string;
  phone2?: string;
  email?: string;
  hours?: string;
  teacherReferent?: string;
  className?: string;
}

export const FooterContact: React.FC<FooterContactProps> = ({
  phone1 = SITE_CONFIG.contact.phones[0],
  phone2 = SITE_CONFIG.contact.phones[1],
  email = SITE_CONFIG.contact.email,
  hours = SITE_CONFIG.contact.hours,
  teacherReferent = SITE_CONFIG.teacher.fullTitle,
  className = ""
}) => {
  return (
    <div className={`space-y-2.5 text-xs text-slate-600 dark:text-slate-300 ${className}`}>
      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
        <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
        <span className="font-semibold">{phone1} {phone2 ? `/ ${phone2}` : ""}</span>
      </div>
      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
        <Mail className="w-4 h-4 text-indigo-500 shrink-0" />
        <span>{email}</span>
      </div>
      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
        <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
        <span>{hours}</span>
      </div>
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
        <UserIcon className="w-4 h-4 text-slate-400 shrink-0" />
        <span>Professeur référant : <strong className="text-slate-900 dark:text-white">{teacherReferent}</strong></span>
      </div>
    </div>
  );
};

export default FooterContact;
