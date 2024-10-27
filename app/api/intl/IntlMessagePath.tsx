'use client'

import { createContext, ReactNode, useContext } from "react"

const defaultValues = {
  current: '',
  previous: [] as string[]
}

const IntlMessagePathContext = createContext(defaultValues)

export function useIntlMessagePathContext() {
  return useContext(IntlMessagePathContext)
}

/**
 * Used for easily specify a path to intl message.
 *
 * If in a form you have a value with `name` key, using `<Label value="name"/>`
 * will return to DOM a message with key `name.label` if existed.
 *
 * But I have a `Brand` table and with that I can easily add
 *
 * `<IntlMessagePathProvider value="Brand.form"/>`:
 *
 * ```
 * const Form = () => {
 *
 *   // ...
 *
 *   <IntlMessagePathProvider value="Brand.form">
 *
 *     <Label>name</Label>
 *
 *   </IntlMessagePathProvider>
 * }
 *```
 *
 * You will get 'Brand.form.name.label`. You can easily multiply several Providers, or override by new one.
 */
export const IntlMessagePathProvider = ({ value, ...props }: {
  value?: string,
  override?: boolean,
  overridePrevious?: string,
  firstParent?: boolean,
  children: ReactNode
}) => {
  const { current, previous = [] } = useIntlMessagePathContext()

  let _value = value

  if (current && !props.override) {
    _value = current + '.' + _value
  }

  if (props.firstParent) {
    _value = previous[0] + (value ? '.' + value : '')
  }

  // @ts-ignore
  return <IntlMessagePathContext.Provider {...{
    value: {
      current: _value,
      previous: [...(props.overridePrevious ? [props.overridePrevious] : previous), _value]
    }
  }}>
    {props.children}
  </IntlMessagePathContext.Provider>
}
