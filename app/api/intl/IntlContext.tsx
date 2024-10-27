'use client'

import { createContext, ReactNode, useContext } from "react";

const defaultValues = {
  locale: 'en',
  messages: {},
  loading: false
} as {
  locale: string,
  messages: { [key: string]: string },
  loading: boolean
}

export type IntlContext = typeof defaultValues

export const IntlContext = createContext(defaultValues);

export const IntlContextProvider = (props: { value: typeof defaultValues, children: ReactNode }) => <IntlContext.Provider {...props}/>

export function useIntlContext() {
  return useContext(IntlContext);
}
