'use client'

import {useIntlContext} from "@/app/api/intl/IntlContext"
import {useIntlMessagePathContext} from "@/app/api/intl/IntlMessagePath"
import {IntlMessageFormat} from "intl-messageformat"

type IntlMessageProps = {
  defaultValue?: string,
  children: string | number,
  exactly?: boolean, // don't concat with value (prefix) in context
  extending?: boolean, // if there is not a value for current key "Brands.value" - get in previous context one "Common.value"
  args?: any
}

export const Message = ({ defaultValue, children, exactly, extending, args }: IntlMessageProps) => {
  return useMessage({
    defaultValue,
    value: String(children),
    nullableOnLoading: true,
    exactly,
    extending,
    args
  })
}

export function useMessage({
                             defaultValue,
                             value,
                             exactly = false,
                             extending = true,
                             nullableOnLoading = false,
                             args
                           }: {
  defaultValue?: string,
  value: string,
  exactly?: boolean,
  extending?: boolean,
  args?: any,
  nullableOnLoading?: boolean
}) {
  const { messages, loading, locale } = useIntlContext()
  const { current, previous } = useIntlMessagePathContext()

  if (loading)
    return !nullableOnLoading ? value : undefined

  let _key = value
  let key = _key

  if (current && !exactly)
    key = current + '.' + _key

  if (args)
    args = Object.entries(args)
      .reduce((obj, [key, value]) => {
        if (value instanceof Date)
          value = new Intl.DateTimeFormat(locale, {
            dateStyle: 'short',
            timeStyle: 'short'
          }).format(new Date(value))

        // @ts-ignore
        obj[key] = value
        return obj
      }, {})


  let message = null,
    _message = messages[key]

  if (_message) {
    try {
      message = new IntlMessageFormat(_message, locale).format(args) as string
    } catch (e) {
      console.warn(e)
    }
  }

  // There's implemented a getting value by previous key path value

  if (extending && !message && previous?.[0]) {
    let __key = previous[0] + '.' + _key
    message = messages[__key]
  }

  // if (!message)
  //   console.warn(`The message for key: ${key} is not present`)

  return message || defaultValue || key
}
