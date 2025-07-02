export enum Months {
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

export type Month = keyof typeof Months;