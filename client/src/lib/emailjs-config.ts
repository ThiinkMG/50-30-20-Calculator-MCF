// EmailJS configuration using environment secrets
// This loads values from the secrets you've provided to your Replit environment

// Access the environment variables (these are injected by Replit when running in the browser)
export const EMAILJS_SERVICE_ID = import.meta.env.EMAILJS_SERVICE_ID || 'service_d5lfoj2';  
export const EMAILJS_TEMPLATE_ID = import.meta.env.EMAILJS_TEMPLATE_ID || 'budget_calc_template';
export const EMAILJS_PUBLIC_KEY = import.meta.env.EMAILJS_PUBLIC_KEY || 'wPB1wjGsN5vrhtnUR';

// Initialize EmailJS
export function initEmailJS(emailjs: any) {
  if (typeof window !== 'undefined') {
    try {
      emailjs.init(EMAILJS_PUBLIC_KEY);
      console.log("EmailJS initialized with configuration from emailjs-config.ts");
    } catch (error) {
      console.error("Error initializing EmailJS:", error);
    }
  }
}

// Log configuration for debugging
console.log('EmailJS Config (service/template):', EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID);