'use client'
import React, { useEffect, useState } from "react";
import { IntlContext } from "@/app/api/intl/IntlContext";
import { IntlMessagePathProvider } from "@/app/api/intl/IntlMessagePath";

export const IntlProvider = ({ children }: any) => {
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    const storedState = localStorage.getItem('state');
    let currentLocale = 'en';
    if (storedState) {
      try {
        const stateObj = JSON.parse(storedState);
        currentLocale = stateObj.intl.locale;
      } catch (e) {
        console.error("Error parsing locale from localStorage:", e);
      }
    }

    setLocale(currentLocale);

    setLoading(true);
    import(`./locales/${currentLocale}.json`)
        .then(response => {
          setMessages(response.default || response);
        })
        .catch(error => {
          console.error(`Error loading locale data for ${currentLocale}:`, error);
          setMessages({});
        })
        .finally(() => setLoading(false));
  }, []);

  return (
      <IntlContext.Provider value={{ locale, messages, loading }}>
        <IntlMessagePathProvider value="Common">
          {children}
        </IntlMessagePathProvider>
      </IntlContext.Provider>
  );
};
