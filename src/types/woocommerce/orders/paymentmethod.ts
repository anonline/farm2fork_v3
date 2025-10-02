export enum WPPaymentMethod {
    /** Átutalás */
    CHEQUQE = 'cheque', 
    /** Simple régi */
    SimplePay = 'simplepay',
    /** Üres */
    Empty = '',
    /** Utánvét */
    COD = 'cod',   //utánvétes fizetés
    /** OTP SimplePay */
    OTPSimplepay = 'otp_simplepay',   //frissebb rendeléseknél ez van
    /** Egyéb */
    Other = 'other'
}