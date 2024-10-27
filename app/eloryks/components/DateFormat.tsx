
type NativeIntlDateTimeFormatProps = ConstructorParameters<typeof Intl.DateTimeFormat>[1]

type IntlDateFormatProps = NativeIntlDateTimeFormatProps
    & ({
    children: string | Date,
    value?: undefined
} | {
    value: string | Date,
    children?: undefined
})


export function formatDate(locale: 'sk', date: Date, options: NativeIntlDateTimeFormatProps = {}) {
    if (!date) return '';

    return new Intl.DateTimeFormat(locale, {
            ...options,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
    }).format(date);
}



export const DateFormat = ({ value, children, ...options }: IntlDateFormatProps) => {
    const locale = 'sk';
    const input = value ?? children;
    let date;

    try {
        date = new Date(input);
        if (isNaN(date.getTime())) {
            date = new Date();
        }
        const formattedDate = formatDate(locale, date, options);
        return <span className="white-space-nowrap">{formattedDate}</span>;
    } catch (e) {
        console.warn("Invalid date provided to DateFormat:", e);
        return 'Invalid date';
    }
}


