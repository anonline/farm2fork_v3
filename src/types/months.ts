export enum MonthsEnum {
    January = 'Jan',
    February = 'Feb',
    March = 'Mar',
    April = 'Apr',
    May = 'Maj',
    June = 'Jun',
    July = 'Jul',
    August = 'Aug',
    September = 'Szept',
    October = 'Okt',
    November = 'Nov',
    December = 'Dec',
}

export function getMonthName(month:MonthsEnum){
    switch (month) {
        case MonthsEnum.January:
            return "Január";
        case MonthsEnum.February:
            return "Február";
        case MonthsEnum.March:
            return "Március";
        case MonthsEnum.April:
            return "Április";
        case MonthsEnum.May:
            return "Május";
        case MonthsEnum.June:
            return "Június";
        case MonthsEnum.July:
            return "Július";
        case MonthsEnum.August:
            return "Augusztus";
        case MonthsEnum.September:
            return "Szeptember";
        case MonthsEnum.October:
            return "Október";
        case MonthsEnum.November:
            return "November";
        case MonthsEnum.December:
            return "December";
        default:
            return "";
    }
}

export type Month = keyof typeof MonthsEnum;